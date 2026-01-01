import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "model"], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const AnswerSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true },
    prompt: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const ReflectionChatSessionSchema = new mongoose.Schema(
  {
    teamId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },

    status: {
      type: String,
      enum: ["in_progress", "ready_to_submit", "submitted"],
      default: "in_progress",
    },

    currentIndex: { type: Number, default: 0 },
    clarifyCount: { type: Number, default: 0 },

    messages: { type: [MessageSchema], default: [] },
    answers: { type: [AnswerSchema], default: [] },

    aiSummary: { type: String, default: "" },
  },
  { timestamps: true }
);


ReflectionChatSessionSchema.index({ teamId: 1, sessionId: 1 }, { unique: true });

export default mongoose.models.ReflectionChatSession ||
  mongoose.model("ReflectionChatSession", ReflectionChatSessionSchema);
