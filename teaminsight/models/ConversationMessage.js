import mongoose from "mongoose";

const { Schema } = mongoose;

const ConversationMessageSchema = new Schema(
  {
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "ConversationThread",
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

ConversationMessageSchema.index({ threadId: 1, createdAt: 1 });

export default mongoose.models.ConversationMessage ||
  mongoose.model("ConversationMessage", ConversationMessageSchema);
