import mongoose from "mongoose";

const MessageThreadSchema = new mongoose.Schema(
  {
    teamId: { type: String, required: true, index: true },
    subject: { type: String, required: true, trim: true },

    // Denormalized fields for fast list rendering
    lastMessageAt: { type: Date, default: null, index: true },
    lastMessageText: { type: String, default: "" },
    lastMessageRole: { type: String, enum: ["team", "lecturer"], default: "team" },

    unreadForTeam: { type: Number, default: 0 },
    unreadForLecturer: { type: Number, default: 0 },

    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

MessageThreadSchema.index({ teamId: 1, updatedAt: -1 });

export default mongoose.models.MessageThread ||
  mongoose.model("MessageThread", MessageThreadSchema);
