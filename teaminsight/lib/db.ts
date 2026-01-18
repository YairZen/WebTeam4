/**
 * Database Connection Utilities
 * -----------------------------
 * MongoDB connection with Mongoose, optimized for serverless.
 */

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Only throw in runtime, not during build
  if (typeof window === "undefined" && process.env.NODE_ENV !== "test") {
    console.warn("Warning: MONGODB_URI not defined in environment variables");
  }
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache connection in development to avoid multiple connections
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: CachedConnection | undefined;
}

const cached: CachedConnection = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (process.env.NODE_ENV !== "production") {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Type helper for Mongoose models to avoid strict typing issues
 * Use this when you need to call methods that have strict TypeScript definitions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asModel<T>(model: T): any {
  return model;
}
