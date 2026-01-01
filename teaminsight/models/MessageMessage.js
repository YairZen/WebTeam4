import mongoose from "mongoose";

const { Schema } = mongoose;

const MessageMessageSchema = new Schema(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "MessageThread",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["team", "lecturer"],
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { versionKey: false }
);

// Optional but useful for fetching a thread timeline fast
MessageMessageSchema.index({ threadId: 1, createdAt: 1 });

export default mongoose.models.MessageMessage ||
  mongoose.model("MessageMessage", MessageMessageSchema);
