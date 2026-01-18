import mongoose, { Model, Schema } from "mongoose";

export type ChatMsgDoc = {
  role: "user" | "model";
  text: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ReflectionAnswerDoc = {
  topicId: string;
  prompt: string;
  answer: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ReflectionColor = "green" | "yellow" | "red";

// Tuckman's Stages of Group Development
export type TuckmanStage = "forming" | "storming" | "norming" | "performing" | "adjourning";

// Anomaly flags for instructor alerts
export type AnomalyFlag = "red_zone" | "silent_dropout" | "toxic_spike" | "chronic_issue";

// Reflective depth levels
export type ReflectiveDepth = "descriptive" | "comparative" | "critical" | "transformative";

// THS Component structure
export type THSComponentDoc = {
  score: number;
  breakdown: string;
};

export type ReflectionChatSessionDoc = {
  teamId: string;
  sessionId: string;

  status: "in_progress" | "ready_to_submit" | "submitted";
  currentIndex: number;
  clarifyCount: number;

  messages: ChatMsgDoc[];
  answers: ReflectionAnswerDoc[];

  // Internal running summary (not shown to student)
  aiSummary: string;

  // Profile + weekly instructions snapshot
  profileKey: string;
  weeklyInstructionsSnapshot: string;

  // ========================================
  // TEAM HEALTH SCORE (THS) - New metrics
  // ========================================
  teamHealthScore: number | null; // 0-100 (main THS score)

  // THS Components
  thsComponents: {
    participationEquity: THSComponentDoc;
    constructiveSentiment: THSComponentDoc;
    reflectiveDepth: THSComponentDoc & { level: ReflectiveDepth };
    conflictResolution: THSComponentDoc;
  } | null;

  // Tuckman stage assessment
  tuckmanStage: TuckmanStage | null;
  tuckmanExplanation: string;

  // Risk assessment
  riskLevel: number | null; // 0-10
  riskExplanation: string;

  // Anomaly flags for instructor alerts
  anomalyFlags: AnomalyFlag[];

  // Evaluation insights
  strengths: string[];
  concerns: string[];
  recommendations: string[];

  // ========================================
  // LEGACY FIELDS (backward compatibility)
  // ========================================
  reflectionScore: number | null; // 0-100
  reflectionColor: ReflectionColor | null;
  reflectionReasons: string[];
  qualityBreakdown: string;
  riskBreakdown: string;
  complianceBreakdown: string;

  // Timestamp
  submittedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

const MessageSchema = new Schema<ChatMsgDoc>(
  {
    role: { type: String, enum: ["user", "model"], required: true },
    text: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

const AnswerSchema = new Schema<ReflectionAnswerDoc>(
  {
    topicId: { type: String, required: true },
    prompt: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true, _id: false }
);

// THS Component Schema
const THSComponentSchema = new Schema(
  {
    score: { type: Number, default: 0 },
    breakdown: { type: String, default: "" },
  },
  { _id: false }
);

const THSComponentWithLevelSchema = new Schema(
  {
    score: { type: Number, default: 0 },
    breakdown: { type: String, default: "" },
    level: {
      type: String,
      enum: ["descriptive", "comparative", "critical", "transformative"],
      default: "descriptive",
    },
  },
  { _id: false }
);

const THSComponentsSchema = new Schema(
  {
    participationEquity: { type: THSComponentSchema, default: () => ({}) },
    constructiveSentiment: { type: THSComponentSchema, default: () => ({}) },
    reflectiveDepth: { type: THSComponentWithLevelSchema, default: () => ({}) },
    conflictResolution: { type: THSComponentSchema, default: () => ({}) },
  },
  { _id: false }
);

const ReflectionChatSessionSchema = new Schema<ReflectionChatSessionDoc>(
  {
    teamId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },

    status: {
      type: String,
      enum: ["in_progress", "ready_to_submit", "submitted"],
      default: "in_progress",
      index: true,
    },

    currentIndex: { type: Number, default: 0 },
    clarifyCount: { type: Number, default: 0 },

    messages: { type: [MessageSchema], default: [] },
    answers: { type: [AnswerSchema], default: [] },

    aiSummary: { type: String, default: "" },

    // Profile + weekly instructions snapshot
    profileKey: { type: String, default: "default", index: true },
    weeklyInstructionsSnapshot: { type: String, default: "" },

    // ========================================
    // TEAM HEALTH SCORE (THS) - New metrics
    // ========================================
    teamHealthScore: { type: Number, default: null, index: true },

    // THS Components
    thsComponents: { type: THSComponentsSchema, default: null },

    // Tuckman stage assessment
    tuckmanStage: {
      type: String,
      enum: ["forming", "storming", "norming", "performing", "adjourning"],
      default: null,
      index: true,
    },
    tuckmanExplanation: { type: String, default: "" },

    // Risk assessment
    riskLevel: { type: Number, default: null, index: true },
    riskExplanation: { type: String, default: "" },

    // Anomaly flags for instructor alerts
    anomalyFlags: {
      type: [String],
      enum: ["red_zone", "silent_dropout", "toxic_spike", "chronic_issue"],
      default: [],
      index: true,
    },

    // Evaluation insights
    strengths: { type: [String], default: [] },
    concerns: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },

    // ========================================
    // LEGACY FIELDS (backward compatibility)
    // ========================================
    reflectionScore: { type: Number, default: null, index: true },
    reflectionColor: {
      type: String,
      enum: ["green", "yellow", "red"],
      default: null,
      index: true,
    },
    reflectionReasons: { type: [String], default: [] },
    qualityBreakdown: { type: String, default: "" },
    riskBreakdown: { type: String, default: "" },
    complianceBreakdown: { type: String, default: "" },

    // Timestamp
    submittedAt: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

ReflectionChatSessionSchema.index({ teamId: 1, sessionId: 1 }, { unique: true });

// Helpful for "recent submissions by team" queries
ReflectionChatSessionSchema.index({ teamId: 1, submittedAt: -1 });

// Helpful for dashboards / filtering by color
ReflectionChatSessionSchema.index({ teamId: 1, reflectionColor: 1, submittedAt: -1 });

// Index for Tuckman stage filtering
ReflectionChatSessionSchema.index({ teamId: 1, tuckmanStage: 1, submittedAt: -1 });

// Index for anomaly alerts
ReflectionChatSessionSchema.index({ anomalyFlags: 1, submittedAt: -1 });

const ModelRef =
  (mongoose.models.ReflectionChatSession as Model<ReflectionChatSessionDoc>) ||
  mongoose.model<ReflectionChatSessionDoc>(
    "ReflectionChatSession",
    ReflectionChatSessionSchema
  );

export default ModelRef;
