import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  TranscriptEntry,
  QAPair,
  SessionStats,
  DebriefReport,
  TranscriptSummary,
  QAPairSummary,
  QAPairEvaluation,
  AnalysisReport,
  CoachingInsight,
  Pattern,
  STARScore,
  STARLevel,
  CommunicationScore,
  BehavioralSignal,
  AgentId,
  QuestionType,
} from "./types";
import { processTranscript } from "./transcriptProcessor";
import { buildAnalysisPrompt, VALID_AGENT_IDS, VALID_STAR_LEVELS, VALID_HIRE_SIGNALS } from "./analysisPrompts";

/**
 * Generate debrief from actual interview transcript.
 * Per D-05: Full rewrite taking TranscriptEntry[] input.
 * Per D-06: Output includes transcript summary, session stats, legacy fields.
 * Per 06-02: Now includes STAR evaluation, patterns, and coaching insights.
 */
export async function generateDebrief(entries: TranscriptEntry[]): Promise<DebriefReport> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  // Step 1: Process transcript into structured data
  const { merged, pairs, stats } = processTranscript(entries);

  // Step 2: Format transcript for AI analysis
  const transcriptText = formatTranscriptForAI(merged);

  // If no Q/A pairs, return minimal fallback
  if (pairs.length === 0) {
    return buildFallbackReport([], stats);
  }

  // Step 3: Build prompt and call Gemini
  const prompt = buildAnalysisPrompt(transcriptText, pairs);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response");
    }

    const aiOutput = JSON.parse(jsonMatch[0]);
    const qaPairIds = pairs.map(p => p.id);

    // Step 4: Validate and process AI output
    const { evaluations, analysis, coaching } = validateAnalysisOutput(aiOutput, qaPairIds);

    // Step 5: Build final report with transcript summary
    const report: DebriefReport = {
      // Legacy fields (derive from analysis or use defaults)
      elevatorPitch: deriveElevatorPitch(aiOutput, analysis),
      keyAchievements: analysis.strengths.slice(0, 3),
      uniqueValueProposition: analysis.strengths[0] || "Demonstrated interview skills.",
      areasForImprovement: analysis.weaknesses,

      // Transcript-based fields
      transcriptSummary: buildTranscriptSummary(pairs),
      sessionStats: stats,

      // Phase 6 fields
      evaluations,
      analysis,
      coaching,
    };

    return report;

  } catch (error) {
    console.error("Debrief analysis generation failed", error);
    // Fallback report with transcript data even if AI fails
    return buildFallbackReport(pairs, stats);
  }
}

/**
 * Format transcript entries for AI prompt.
 */
function formatTranscriptForAI(entries: TranscriptEntry[]): string {
  return entries
    .map(e => `${e.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${e.text}`)
    .join('\n');
}

/**
 * Build transcript summary from Q/A pairs.
 */
function buildTranscriptSummary(pairs: QAPair[]): TranscriptSummary {
  const pairSummaries: QAPairSummary[] = pairs.map(pair => ({
    id: pair.id,
    question: pair.question.text,
    response: pair.response.map(r => r.text).join(' '),
    timestamp: formatTimestamp(pair.startTimestamp),
  }));

  const fullText = pairs
    .map(p => `Q: ${p.question.text}\nA: ${p.response.map(r => r.text).join(' ')}`)
    .join('\n\n');

  return {
    pairs: pairSummaries,
    fullText,
  };
}

/**
 * Format timestamp (ms) as MM:SS.
 */
function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Derive elevator pitch from AI output.
 */
function deriveElevatorPitch(aiOutput: any, analysis: AnalysisReport): string {
  // Try to extract from AI output, fallback to generated from strengths
  if (aiOutput.elevatorPitch && typeof aiOutput.elevatorPitch === 'string') {
    return aiOutput.elevatorPitch;
  }

  if (analysis.strengths.length > 0) {
    return `A professional who demonstrates ${analysis.strengths[0].toLowerCase()}.`;
  }

  return "A dedicated professional with strong communication skills.";
}

// ============================================================================
// VALIDATION HELPERS (Per D-03: Pattern threshold enforcement)
// ============================================================================

/**
 * Validates a single pattern from AI output.
 * Per D-03: Returns null if instanceCount < 3 or required fields missing.
 */
function validatePattern(pattern: any): Pattern | null {
  if (!pattern || typeof pattern !== 'object') return null;

  // Per D-03: Must have 3+ instances
  const instanceCount = Number(pattern.instanceCount) || 0;
  if (instanceCount < 3) return null;

  // Validate type
  const type = pattern.type;
  if (type !== 'positive' && type !== 'attention') return null;

  // Validate required fields
  const description = typeof pattern.description === 'string' ? pattern.description : '';
  if (!description) return null;

  const affectedAnswerIds = Array.isArray(pattern.affectedAnswerIds)
    ? pattern.affectedAnswerIds.filter((id: any) => typeof id === 'string')
    : [];

  if (affectedAnswerIds.length === 0) return null;

  return {
    type,
    description,
    instanceCount,
    affectedAnswerIds,
  };
}

/**
 * Validates a STAR score object.
 */
function validateSTARScore(starScore: any): STARScore | null {
  if (!starScore || typeof starScore !== 'object') return null;

  const isValidLevel = (val: any): val is STARLevel =>
    typeof val === 'string' && VALID_STAR_LEVELS.includes(val as STARLevel);

  const situation = isValidLevel(starScore.situation) ? starScore.situation : null;
  const task = isValidLevel(starScore.task) ? starScore.task : null;
  const action = isValidLevel(starScore.action) ? starScore.action : null;
  const result = isValidLevel(starScore.result) ? starScore.result : null;

  // All four components must be valid
  if (!situation || !task || !action || !result) return null;

  return { situation, task, action, result };
}

/**
 * Validates a communication score object (1-10 scale).
 */
function validateCommunicationScore(score: any): CommunicationScore {
  const clamp = (val: any): number => {
    const num = Number(val);
    if (isNaN(num)) return 5; // Default to middle
    return Math.max(1, Math.min(10, Math.round(num)));
  };

  return {
    clarity: clamp(score?.clarity),
    conciseness: clamp(score?.conciseness),
    structure: clamp(score?.structure),
    confidence: clamp(score?.confidence),
  };
}

/**
 * Validates behavioral signals object (1-10 scale).
 */
function validateBehavioralSignals(signals: any): BehavioralSignal {
  const clamp = (val: any): number => {
    const num = Number(val);
    if (isNaN(num)) return 5; // Default to middle
    return Math.max(1, Math.min(10, Math.round(num)));
  };

  return {
    ownership: clamp(signals?.ownership),
    problemSolving: clamp(signals?.problemSolving),
    impact: clamp(signals?.impact),
    selfAwareness: clamp(signals?.selfAwareness),
  };
}

/**
 * Validates a single QAPair evaluation.
 * Returns null if qaPairId not in the valid list.
 */
function validateEvaluation(evaluation: any, qaPairIds: string[]): QAPairEvaluation | null {
  if (!evaluation || typeof evaluation !== 'object') return null;

  // Validate qaPairId exists
  const qaPairId = evaluation.qaPairId;
  if (typeof qaPairId !== 'string' || !qaPairIds.includes(qaPairId)) {
    return null;
  }

  // Validate question type
  const questionType = VALID_HIRE_SIGNALS.includes(evaluation.questionType)
    ? evaluation.questionType
    : 'behavioral';

  // For non-behavioral questions, starScore should be null
  const isBehavioral = questionType === 'behavioral';
  const starScore = isBehavioral ? validateSTARScore(evaluation.starScore) : null;

  // Validate communication and behavioral scores
  const communicationScore = validateCommunicationScore(evaluation.communicationScore);
  const behavioralSignals = validateBehavioralSignals(evaluation.behavioralSignals);

  // Validate feedback
  const feedback = typeof evaluation.feedback === 'string'
    ? evaluation.feedback
    : 'No feedback provided.';

  return {
    qaPairId,
    questionType: questionType as any,
    starScore,
    communicationScore,
    behavioralSignals,
    feedback,
  };
}

/**
 * Validates the complete AI output and returns typed structures.
 * This is the main validation entry point.
 */
function validateAnalysisOutput(
  raw: any,
  qaPairIds: string[]
): {
  evaluations: QAPairEvaluation[];
  analysis: AnalysisReport;
  coaching: CoachingInsight;
} {
  // Validate evaluations
  const rawEvaluations = Array.isArray(raw?.evaluations) ? raw.evaluations : [];
  const evaluations: QAPairEvaluation[] = rawEvaluations
    .map((e: any) => validateEvaluation(e, qaPairIds))
    .filter((e: QAPairEvaluation | null): e is QAPairEvaluation => e !== null);

  // Validate analysis
  const rawAnalysis = raw?.analysis || {};
  const rawPatterns = Array.isArray(rawAnalysis.patterns) ? rawAnalysis.patterns : [];
  const patterns: Pattern[] = rawPatterns
    .map((p: any) => validatePattern(p))
    .filter((p: Pattern | null): p is Pattern => p !== null);

  const clamp = (val: any): number => {
    const num = Number(val);
    if (isNaN(num)) return 5;
    return Math.max(1, Math.min(10, Math.round(num)));
  };

  const hireSignal = VALID_HIRE_SIGNALS.includes(rawAnalysis.hireSignal)
    ? rawAnalysis.hireSignal
    : 'neutral';

  const analysis: AnalysisReport = {
    overallScore: clamp(rawAnalysis.overallScore),
    hireSignal: hireSignal as AnalysisReport['hireSignal'],
    starAverages: {
      situation: clamp(rawAnalysis.starAverages?.situation),
      task: clamp(rawAnalysis.starAverages?.task),
      action: clamp(rawAnalysis.starAverages?.action),
      result: clamp(rawAnalysis.starAverages?.result),
    },
    communicationAverages: validateCommunicationScore(rawAnalysis.communicationAverages),
    strengths: Array.isArray(rawAnalysis.strengths)
      ? rawAnalysis.strengths.filter((s: any) => typeof s === 'string').slice(0, 4)
      : ['Completed interview session'],
    weaknesses: Array.isArray(rawAnalysis.weaknesses)
      ? rawAnalysis.weaknesses.filter((w: any) => typeof w === 'string').slice(0, 3)
      : ['Continue practicing structured responses'],
    patterns,
  };

  // Validate coaching
  const rawCoaching = raw?.coaching || {};
  const rawPriorities = Array.isArray(rawCoaching.topPriorities) ? rawCoaching.topPriorities : [];

  const coaching: CoachingInsight = {
    topPriorities: rawPriorities
      .filter((p: any) => p && typeof p === 'object')
      .slice(0, 3)
      .map((p: any) => ({
        issue: typeof p.issue === 'string' ? p.issue : 'Area for improvement',
        whyItMatters: typeof p.whyItMatters === 'string' ? p.whyItMatters : '',
        fix: typeof p.fix === 'string' ? p.fix : '',
        example: typeof p.example === 'string' ? p.example : undefined,
      })),
    quickWins: Array.isArray(rawCoaching.quickWins)
      ? rawCoaching.quickWins.filter((w: any) => typeof w === 'string').slice(0, 3)
      : ['Practice more structured responses'],
    practicePlan: {
      nextSessionFocus: typeof rawCoaching.practicePlan?.nextSessionFocus === 'string'
        ? rawCoaching.practicePlan.nextSessionFocus
        : 'Continue practicing interview skills',
      recommendedAgent: VALID_AGENT_IDS.includes(rawCoaching.practicePlan?.recommendedAgent)
        ? rawCoaching.practicePlan.recommendedAgent as AgentId
        : 'hiring-manager',
      drill: typeof rawCoaching.practicePlan?.drill === 'string'
        ? rawCoaching.practicePlan.drill
        : 'Practice answering behavioral questions using STAR structure',
    },
  };

  return { evaluations, analysis, coaching };
}

/**
 * Build fallback coaching when AI fails.
 */
function buildFallbackCoaching(): CoachingInsight {
  return {
    topPriorities: [
      {
        issue: 'Practice structured responses',
        whyItMatters: 'Clear structure helps interviewers follow your answers',
        fix: 'Use the STAR format: Situation, Task, Action, Result',
        example: '"In my last role (S), I was responsible for (T). I did (A). The result was (R)."',
      },
    ],
    quickWins: [
      'Prepare 3-5 stories using STAR format',
      'Practice out loud to build confidence',
    ],
    practicePlan: {
      nextSessionFocus: 'Building STAR structure',
      recommendedAgent: 'supportive-coach',
      drill: 'Answer 5 behavioral questions using full STAR structure',
    },
  };
}

/**
 * Build complete fallback report when AI analysis fails.
 */
function buildFallbackReport(pairs: QAPair[], stats: SessionStats): DebriefReport {
  return {
    elevatorPitch: "A professional who completed the interview session.",
    keyAchievements: ["Participated in mock interview session"],
    uniqueValueProposition: "Committed to improving interview skills.",
    areasForImprovement: ["Practice more structured responses"],
    transcriptSummary: buildTranscriptSummary(pairs),
    sessionStats: stats,
    evaluations: [],
    analysis: {
      overallScore: 5,
      hireSignal: 'neutral',
      starAverages: { situation: 5, task: 5, action: 5, result: 5 },
      communicationAverages: { clarity: 5, conciseness: 5, structure: 5, confidence: 5 },
      strengths: ['Completed interview session'],
      weaknesses: ['Continue practicing structured responses'],
      patterns: [],
    },
    coaching: buildFallbackCoaching(),
  };
}