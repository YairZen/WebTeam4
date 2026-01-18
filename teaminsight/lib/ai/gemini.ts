import Cerebras from "@cerebras/cerebras_cloud_sdk";
import {
  REFLECTION_CONTROLLER_PROMPT,
  REFLECTION_INTERVIEWER_PROMPT,
  REFLECTION_FINAL_SUMMARY_PROMPT,
  REFLECTION_EVALUATION_PROMPT,
} from "./reflectionPrompts";
import { REFLECTION_TOPICS } from "@/lib/reflection/topics";

const apiKey = process.env.CEREBRAS_API_KEY;
if (!apiKey) throw new Error("Missing CEREBRAS_API_KEY");

const client = new Cerebras({ apiKey });

// ============================================================================
// TYPES
// ============================================================================

export type ChatMsg = { role: "user" | "model"; text: string };

export type ReflectionAnswer = {
  topicId: string;
  prompt: string;
  answer: string;
};

// Tuckman's Stages of Group Development
export type TuckmanStage = "forming" | "storming" | "norming" | "performing" | "adjourning";

// Detected behavioral patterns
export type DetectedPattern =
  | "social_loafer"
  | "passive_aggressive"
  | "groupthink"
  | "blame_game"
  | "silence"
  | "potential_loafer";

// Reflective depth levels (Knowledge Integration)
export type ReflectiveDepth = "descriptive" | "comparative" | "critical" | "transformative";

// Sentiment tones
export type SentimentTone = "tense" | "apathetic" | "enthusiastic" | "frustrated" | "neutral" | "defensive";

// Backend Analyst's analysis output
export type ControllerAnalysis = {
  tuckmanStage: TuckmanStage;
  tuckmanReasoning: string;
  psychologicalSafety: number; // 1-10
  safetyIndicators: string[];
  detectedPatterns: DetectedPattern[];
  patternEvidence: string;
  reflectiveDepth: ReflectiveDepth;
  sentimentTone: SentimentTone;
  participationEquity: string;
};

// Strategy types for the Frontend Facilitator
export type DirectiveStrategy =
  | "probe_deeper"
  | "mediate_conflict"
  | "break_silence"
  | "challenge_groupthink"
  | "address_loafer"
  | "elevate_reflection"
  | "wrap_up";

export type DirectiveTone = "warm" | "curious" | "firm" | "playful" | "empathetic" | "mediator";

// New directive structure from Backend Analyst
export type NextDirective = {
  strategy: DirectiveStrategy;
  tone: DirectiveTone;
  targetUser: string | null;
  keyQuestion: string;
  questionRationale: string;
  anchor: string;
  historyReference: string;
  avoidTopics: string[];
  urgentTopics: string[];
};

// Legacy NextIntent for backward compatibility
export type NextIntent = {
  kind: "clarify_current" | "advance_topic" | "wrap_up";
  topicId: string | null;
  anchor: string;
  styleNote: string;
  questionGoal: string;
  missingInfo: string[];
  userContext: string;
  historyReference: string;
};

export type ReflectionPolicy = {
  profile: {
    key: string;
    title?: string;
    controllerAddendum?: string;
    evaluatorAddendum?: string;
  };
  weeklyInstructions: string;
};

export type ControllerInput = {
  messages: ChatMsg[];
  answers: ReflectionAnswer[];
  runningSummary: string;
  clarifyCount: number;
  turnCount: number;
  maxTurns: number;
  recentSummaries: string[];
  policy?: ReflectionPolicy;
};

// New ControllerResult with analysis
export type ControllerResult = {
  thinking: string;
  analysis: ControllerAnalysis;
  runningSummary: string;
  answers: ReflectionAnswer[];
  nextDirective: NextDirective;
  // Legacy field for backward compatibility
  nextIntent: NextIntent;
  readyToSubmit: boolean;
  clarifyCount: number;
  turnCount: number;
};

// Team Health Score components
export type THSComponent = {
  score: number; // 0-100
  breakdown: string;
};

export type THSComponents = {
  participationEquity: THSComponent;
  constructiveSentiment: THSComponent;
  reflectiveDepth: THSComponent & { level: ReflectiveDepth };
  conflictResolution: THSComponent;
};

// Anomaly flags for instructor alerts
export type AnomalyFlag = "red_zone" | "silent_dropout" | "toxic_spike" | "chronic_issue";

// Full evaluation result with Team Health Score
export type ReflectionEval = {
  // New THS-based metrics
  teamHealthScore: number; // 0-100
  components: THSComponents;
  riskLevel: number; // 0-10
  riskExplanation: string;
  tuckmanStage: TuckmanStage;
  tuckmanExplanation: string;
  anomalyFlags: AnomalyFlag[];
  strengths: string[];
  concerns: string[];
  recommendations: string[];

  // Legacy fields for backward compatibility
  quality: number; // 0-10
  risk: number; // 0-10
  compliance: number; // 0-10
  qualityBreakdown: string;
  riskBreakdown: string;
  complianceBreakdown: string;
  reasons: string[];
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function stripCodeFences(s: string) {
  const t = (s || "").trim();
  if (t.startsWith("```")) {
    return t
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```[\s]*$/, "")
      .trim();
  }
  return t;
}

function clamp(x: any, min: number, max: number): number {
  const n = Number(x);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function clamp0to10(x: any): number {
  return clamp(x, 0, 10);
}

function clamp0to100(x: any): number {
  return clamp(x, 0, 100);
}

function defaultPolicy(): ReflectionPolicy {
  return {
    profile: {
      key: "default",
      title: "Default",
      controllerAddendum: "",
      evaluatorAddendum: "",
    },
    weeklyInstructions: "",
  };
}

function defaultAnalysis(): ControllerAnalysis {
  return {
    tuckmanStage: "forming",
    tuckmanReasoning: "Initial assessment - team stage unknown",
    psychologicalSafety: 5,
    safetyIndicators: [],
    detectedPatterns: [],
    patternEvidence: "",
    reflectiveDepth: "descriptive",
    sentimentTone: "neutral",
    participationEquity: "Unknown - need more data",
  };
}

function defaultNextDirective(): NextDirective {
  return {
    strategy: "probe_deeper",
    tone: "warm",
    targetUser: null,
    keyQuestion: "ספרו לי על שיתוף הפעולה בצוות השבוע - מה עבד טוב?",
    questionRationale: "Starting conversation about team collaboration",
    anchor: "בואו נתחיל לדבר על איך עבדתם יחד",
    historyReference: "",
    avoidTopics: [],
    urgentTopics: ["collaboration"],
  };
}

// Convert new directive to legacy nextIntent for backward compatibility
function directiveToIntent(directive: NextDirective): NextIntent {
  const strategyToKind: Record<DirectiveStrategy, NextIntent["kind"]> = {
    probe_deeper: "clarify_current",
    mediate_conflict: "clarify_current",
    break_silence: "advance_topic",
    challenge_groupthink: "clarify_current",
    address_loafer: "clarify_current",
    elevate_reflection: "advance_topic",
    wrap_up: "wrap_up",
  };

  return {
    kind: strategyToKind[directive.strategy] || "advance_topic",
    topicId: directive.urgentTopics[0] || null,
    anchor: directive.anchor,
    styleNote: directive.tone,
    questionGoal: directive.keyQuestion,
    missingInfo: directive.urgentTopics,
    userContext: directive.questionRationale,
    historyReference: directive.historyReference,
  };
}

// ============================================================================
// CONTROLLER PARSER
// ============================================================================

function safeParseController(raw: string, fallback: ControllerResult): ControllerResult {
  const cleaned = stripCodeFences(raw);

  try {
    const obj = JSON.parse(cleaned);
    if (!obj || typeof obj !== "object") return fallback;

    // Parse analysis
    const analysisRaw = obj.analysis || {};
    const analysis: ControllerAnalysis = {
      tuckmanStage: ["forming", "storming", "norming", "performing", "adjourning"].includes(analysisRaw.tuckmanStage)
        ? analysisRaw.tuckmanStage
        : fallback.analysis.tuckmanStage,
      tuckmanReasoning: typeof analysisRaw.tuckmanReasoning === "string"
        ? analysisRaw.tuckmanReasoning
        : fallback.analysis.tuckmanReasoning,
      psychologicalSafety: clamp0to10(analysisRaw.psychologicalSafety) || fallback.analysis.psychologicalSafety,
      safetyIndicators: Array.isArray(analysisRaw.safetyIndicators)
        ? analysisRaw.safetyIndicators.filter((s: any) => typeof s === "string")
        : [],
      detectedPatterns: Array.isArray(analysisRaw.detectedPatterns)
        ? analysisRaw.detectedPatterns.filter((p: any) =>
            ["social_loafer", "passive_aggressive", "groupthink", "blame_game", "silence", "potential_loafer"].includes(p))
        : [],
      patternEvidence: typeof analysisRaw.patternEvidence === "string"
        ? analysisRaw.patternEvidence
        : "",
      reflectiveDepth: ["descriptive", "comparative", "critical", "transformative"].includes(analysisRaw.reflectiveDepth)
        ? analysisRaw.reflectiveDepth
        : fallback.analysis.reflectiveDepth,
      sentimentTone: ["tense", "apathetic", "enthusiastic", "frustrated", "neutral", "defensive"].includes(analysisRaw.sentimentTone)
        ? analysisRaw.sentimentTone
        : fallback.analysis.sentimentTone,
      participationEquity: typeof analysisRaw.participationEquity === "string"
        ? analysisRaw.participationEquity
        : fallback.analysis.participationEquity,
    };

    // Parse nextDirective (new format)
    const nd = obj.nextDirective || {};
    const nextDirective: NextDirective = {
      strategy: ["probe_deeper", "mediate_conflict", "break_silence", "challenge_groupthink", "address_loafer", "elevate_reflection", "wrap_up"].includes(nd.strategy)
        ? nd.strategy
        : fallback.nextDirective.strategy,
      tone: ["warm", "curious", "firm", "playful", "empathetic", "mediator"].includes(nd.tone)
        ? nd.tone
        : fallback.nextDirective.tone,
      targetUser: typeof nd.targetUser === "string" ? nd.targetUser : null,
      keyQuestion: typeof nd.keyQuestion === "string" ? nd.keyQuestion.trim() : fallback.nextDirective.keyQuestion,
      questionRationale: typeof nd.questionRationale === "string" ? nd.questionRationale.trim() : "",
      anchor: typeof nd.anchor === "string" ? nd.anchor.trim() : fallback.nextDirective.anchor,
      historyReference: typeof nd.historyReference === "string" ? nd.historyReference.trim() : "",
      avoidTopics: Array.isArray(nd.avoidTopics) ? nd.avoidTopics.filter((t: any) => typeof t === "string") : [],
      urgentTopics: Array.isArray(nd.urgentTopics) ? nd.urgentTopics.filter((t: any) => typeof t === "string") : [],
    };

    // Also try to parse legacy nextIntent if present
    let nextIntent: NextIntent;
    if (obj.nextIntent && typeof obj.nextIntent === "object") {
      const ni = obj.nextIntent;
      nextIntent = {
        kind: ["clarify_current", "advance_topic", "wrap_up"].includes(ni.kind) ? ni.kind : "advance_topic",
        topicId: typeof ni.topicId === "string" ? ni.topicId : null,
        anchor: typeof ni.anchor === "string" ? ni.anchor.trim() : nextDirective.anchor,
        styleNote: typeof ni.styleNote === "string" ? ni.styleNote.trim() : nextDirective.tone,
        questionGoal: typeof ni.questionGoal === "string" ? ni.questionGoal.trim() : nextDirective.keyQuestion,
        missingInfo: Array.isArray(ni.missingInfo) ? ni.missingInfo.filter((s: any) => typeof s === "string") : [],
        userContext: typeof ni.userContext === "string" ? ni.userContext.trim() : "",
        historyReference: typeof ni.historyReference === "string" ? ni.historyReference.trim() : nextDirective.historyReference,
      };
    } else {
      // Convert from nextDirective
      nextIntent = directiveToIntent(nextDirective);
    }

    return {
      thinking: typeof obj.thinking === "string" ? obj.thinking.trim() : fallback.thinking,
      analysis,
      runningSummary: typeof obj.runningSummary === "string" ? obj.runningSummary.trim() : fallback.runningSummary,
      answers: Array.isArray(obj.answers) ? obj.answers : fallback.answers,
      nextDirective,
      nextIntent,
      readyToSubmit: obj.readyToSubmit === true,
      clarifyCount: Number.isFinite(obj.clarifyCount) ? obj.clarifyCount : fallback.clarifyCount,
      turnCount: Number.isFinite(obj.turnCount) ? obj.turnCount : fallback.turnCount,
    };
  } catch {
    return fallback;
  }
}

// ============================================================================
// EVALUATION PARSER
// ============================================================================

function safeParseEvaluation(raw: string): ReflectionEval {
  const cleaned = stripCodeFences(raw);

  const defaultEval: ReflectionEval = {
    teamHealthScore: 50,
    components: {
      participationEquity: { score: 50, breakdown: "לא זמין" },
      constructiveSentiment: { score: 50, breakdown: "לא זמין" },
      reflectiveDepth: { score: 50, level: "descriptive", breakdown: "לא זמין" },
      conflictResolution: { score: 50, breakdown: "לא זמין" },
    },
    riskLevel: 5,
    riskExplanation: "לא זמין",
    tuckmanStage: "forming",
    tuckmanExplanation: "לא זמין",
    anomalyFlags: [],
    strengths: [],
    concerns: [],
    recommendations: [],
    quality: 5,
    risk: 5,
    compliance: 5,
    qualityBreakdown: "לא הצלחתי לנתח — ברירת מחדל.",
    riskBreakdown: "לא הצלחתי לנתח — ברירת מחדל.",
    complianceBreakdown: "לא הצלחתי לנתח — ברירת מחדל.",
    reasons: ["לא הצלחתי לנתח בוודאות — הוחזר סיווג ברירת מחדל."],
  };

  try {
    const obj = JSON.parse(cleaned);
    if (!obj || typeof obj !== "object") return defaultEval;

    // Parse THS components
    const comps = obj.components || {};
    const components: THSComponents = {
      participationEquity: {
        score: clamp0to100(comps.participationEquity?.score) || 50,
        breakdown: typeof comps.participationEquity?.breakdown === "string" ? comps.participationEquity.breakdown : "לא זמין",
      },
      constructiveSentiment: {
        score: clamp0to100(comps.constructiveSentiment?.score) || 50,
        breakdown: typeof comps.constructiveSentiment?.breakdown === "string" ? comps.constructiveSentiment.breakdown : "לא זמין",
      },
      reflectiveDepth: {
        score: clamp0to100(comps.reflectiveDepth?.score) || 50,
        level: ["descriptive", "comparative", "critical", "transformative"].includes(comps.reflectiveDepth?.level)
          ? comps.reflectiveDepth.level
          : "descriptive",
        breakdown: typeof comps.reflectiveDepth?.breakdown === "string" ? comps.reflectiveDepth.breakdown : "לא זמין",
      },
      conflictResolution: {
        score: clamp0to100(comps.conflictResolution?.score) || 50,
        breakdown: typeof comps.conflictResolution?.breakdown === "string" ? comps.conflictResolution.breakdown : "לא זמין",
      },
    };

    // Calculate THS if not provided
    const calculatedTHS =
      (0.25 * components.participationEquity.score) +
      (0.15 * components.constructiveSentiment.score) +
      (0.40 * components.reflectiveDepth.score) +
      (0.20 * components.conflictResolution.score);

    const teamHealthScore = clamp0to100(obj.teamHealthScore) || Math.round(calculatedTHS);

    // Parse arrays
    const anomalyFlags = Array.isArray(obj.anomalyFlags)
      ? obj.anomalyFlags.filter((f: any) => ["red_zone", "silent_dropout", "toxic_spike", "chronic_issue"].includes(f))
      : [];

    const strengths = Array.isArray(obj.strengths)
      ? obj.strengths.filter((s: any) => typeof s === "string").slice(0, 5)
      : [];

    const concerns = Array.isArray(obj.concerns)
      ? obj.concerns.filter((s: any) => typeof s === "string").slice(0, 5)
      : [];

    const recommendations = Array.isArray(obj.recommendations)
      ? obj.recommendations.filter((s: any) => typeof s === "string").slice(0, 5)
      : [];

    const reasons = Array.isArray(obj.reasons)
      ? obj.reasons.filter((s: any) => typeof s === "string").map((s: string) => s.trim()).filter(Boolean).slice(0, 5)
      : [...strengths, ...concerns].slice(0, 5);

    return {
      teamHealthScore,
      components,
      riskLevel: clamp0to10(obj.riskLevel) || clamp0to10(obj.risk) || 5,
      riskExplanation: typeof obj.riskExplanation === "string" ? obj.riskExplanation : (obj.riskBreakdown || "לא זמין"),
      tuckmanStage: ["forming", "storming", "norming", "performing", "adjourning"].includes(obj.tuckmanStage)
        ? obj.tuckmanStage
        : "forming",
      tuckmanExplanation: typeof obj.tuckmanExplanation === "string" ? obj.tuckmanExplanation : "לא זמין",
      anomalyFlags,
      strengths,
      concerns,
      recommendations,
      // Legacy fields
      quality: clamp0to10(obj.quality) || Math.round(components.reflectiveDepth.score / 10),
      risk: clamp0to10(obj.risk) || clamp0to10(obj.riskLevel) || 5,
      compliance: clamp0to10(obj.compliance) || 5,
      qualityBreakdown: typeof obj.qualityBreakdown === "string" ? obj.qualityBreakdown.trim() : components.reflectiveDepth.breakdown,
      riskBreakdown: typeof obj.riskBreakdown === "string" ? obj.riskBreakdown.trim() : (obj.riskExplanation || "לא זמין"),
      complianceBreakdown: typeof obj.complianceBreakdown === "string" ? obj.complianceBreakdown.trim() : "לא זמין",
      reasons: reasons.length > 0 ? reasons : ["לא נמצאו סיבות מפורטות — ניתוח בסיסי בוצע."],
    };
  } catch {
    return defaultEval;
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function runReflectionController(input: ControllerInput): Promise<ControllerResult> {
  const policy = input.policy ?? defaultPolicy();

  const payload = JSON.stringify({
    ...input,
    topics: REFLECTION_TOPICS,
    policy,
  });

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b",
    messages: [
      { role: "user", content: REFLECTION_CONTROLLER_PROMPT },
      { role: "user", content: payload },
    ],
  });

  const fallback: ControllerResult = {
    thinking: "Starting reflection. Assessing team dynamics and collaboration patterns.",
    analysis: defaultAnalysis(),
    runningSummary: input.runningSummary || "",
    answers: input.answers || [],
    nextDirective: defaultNextDirective(),
    nextIntent: directiveToIntent(defaultNextDirective()),
    readyToSubmit: false,
    clarifyCount: input.clarifyCount || 0,
    turnCount: input.turnCount || 0,
  };

  return safeParseController(response.choices[0]?.message?.content ?? "{}", fallback);
}

export async function runReflectionInterviewer(args: {
  messages: ChatMsg[];
  nextIntent?: NextIntent;
  nextDirective?: NextDirective;
}): Promise<string> {
  // Support both new directive and legacy intent
  const payload = JSON.stringify({
    messages: args.messages,
    nextIntent: args.nextIntent,
    nextDirective: args.nextDirective,
    topics: REFLECTION_TOPICS,
  });

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b",
    messages: [
      { role: "user", content: REFLECTION_INTERVIEWER_PROMPT },
      { role: "user", content: payload },
    ],
  });

  return (response.choices[0]?.message?.content ?? "").trim() || "קיבלתי. אפשר לשתף עוד קצת?";
}

export async function runReflectionFinalSummary(input: {
  answers: ReflectionAnswer[];
  runningSummary: string;
  messages?: ChatMsg[];
}): Promise<string> {
  const payload = JSON.stringify(input);

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b",
    messages: [
      { role: "user", content: REFLECTION_FINAL_SUMMARY_PROMPT },
      { role: "user", content: payload },
    ],
  });

  return (response.choices[0]?.message?.content ?? "").trim();
}

export async function runReflectionEvaluation(input: {
  summary: string;
  answers: ReflectionAnswer[];
  messages?: ChatMsg[];
  policy?: ReflectionPolicy;
}): Promise<ReflectionEval> {
  const policy = input.policy ?? defaultPolicy();

  const payload = JSON.stringify({
    summary: input.summary,
    answers: input.answers,
    messages: input.messages,
    policy,
  });

  const response = await client.chat.completions.create({
    model: "llama-3.3-70b",
    messages: [
      { role: "user", content: REFLECTION_EVALUATION_PROMPT },
      { role: "user", content: payload },
    ],
  });

  return safeParseEvaluation(response.choices[0]?.message?.content ?? "{}");
}
