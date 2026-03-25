/**
 * Type definitions for the MyCareer application.
 */

export interface TranscriptEntry {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: number; // milliseconds from interview start
}

/**
 * TranscriptUpdate extends TranscriptEntry with partial flag.
 * Used for real-time streaming: partial updates amend the last entry, complete creates new.
 */
export interface TranscriptUpdate extends TranscriptEntry {
  isPartial: boolean; // true = still streaming, update last entry; false = complete, finalize
}

/**
 * QAPair represents a complete question-answer exchange.
 * Used for debrief generation and STAR evaluation.
 */
export interface QAPair {
  id: string; // unique reference for STAR evaluation
  question: TranscriptEntry; // The interviewer's question (merged utterance)
  response: TranscriptEntry[]; // Candidate's response (may be multiple parts)
  startTimestamp: number; // When question started (ms from interview start)
  endTimestamp: number; // When response ended (ms from interview start)
}

/**
 * UtteranceAccumulator buffers incoming chunks for merging.
 * Used internally by transcriptProcessor.
 */
export interface UtteranceAccumulator {
  speaker: 'interviewer' | 'candidate';
  chunks: string[]; // Text chunks received
  startTimestamp: number; // Timestamp of first chunk
  lastTimestamp: number; // Timestamp of most recent chunk
}

/**
 * SessionStats for debrief metadata.
 */
export interface SessionStats {
  durationMs: number;
  questionCount: number;
  candidateWordCount: number;
  interviewerWordCount: number;
}

/**
 * QAPairSummary for readable transcript output.
 */
export interface QAPairSummary {
  id: string;
  question: string;
  response: string;
  timestamp: string; // formatted as MM:SS
}

/**
 * TranscriptSummary for debrief report.
 */
export interface TranscriptSummary {
  pairs: QAPairSummary[];
  fullText: string;
}

/**
 * STARLevel represents the quality of a STAR component.
 * Per D-05: 4-level scale for STAR evaluation.
 */
export type STARLevel = 'clear' | 'partial' | 'moderate' | 'weak';

/**
 * STARScore represents evaluation of each STAR component.
 * Used for behavioral question evaluation.
 */
export interface STARScore {
  situation: STARLevel;
  task: STARLevel;
  action: STARLevel;
  result: STARLevel;
}

/**
 * CommunicationScore represents communication quality metrics.
 * All values are on a 1-10 scale.
 */
export interface CommunicationScore {
  clarity: number; // 1-10
  conciseness: number; // 1-10
  structure: number; // 1-10
  confidence: number; // 1-10
}

/**
 * BehavioralSignal represents behavioral trait indicators.
 * All values are on a 1-10 scale.
 */
export interface BehavioralSignal {
  ownership: number; // 1-10
  problemSolving: number; // 1-10
  impact: number; // 1-10
  selfAwareness: number; // 1-10
}

/**
 * QuestionType classifies interview questions.
 * Per Pitfall 4: Only behavioral questions get STAR evaluation.
 */
export type QuestionType = 'behavioral' | 'icebreaker' | 'technical' | 'clarification';

/**
 * QAPairEvaluation contains per-answer evaluation data.
 * starScore is null for non-behavioral questions per Pitfall 4.
 */
export interface QAPairEvaluation {
  qaPairId: string;
  questionType: QuestionType;
  starScore: STARScore | null; // null for non-behavioral questions
  communicationScore: CommunicationScore;
  behavioralSignals: BehavioralSignal;
  feedback: string; // Brief feedback for this answer
}

/**
 * Pattern represents a detected behavior pattern across answers.
 * Per Pitfall 5/D-03: instanceCount must be 3+ to qualify as a pattern.
 */
export interface Pattern {
  type: 'positive' | 'attention';
  description: string;
  instanceCount: number; // Per D-03: must be 3+ to qualify as pattern
  affectedAnswerIds: string[]; // QAPair IDs where pattern appears
}

/**
 * CoachingPriority represents a prioritized improvement area.
 * Uses issue/why/fix/example structure for actionable guidance.
 */
export interface CoachingPriority {
  issue: string;
  whyItMatters: string;
  fix: string;
  example?: string; // Optional example of fix
}

/**
 * PracticePlan represents recommended next steps.
 * Links to agent definitions from Phase 5.
 */
export interface PracticePlan {
  nextSessionFocus: string;
  recommendedAgent: AgentId; // Links to agent definitions from Phase 5
  drill: string;
}

/**
 * AnalysisReport contains aggregated interview analysis.
 * Patterns array only includes items with instanceCount >= 3 per D-03.
 */
export interface AnalysisReport {
  overallScore: number; // 1-10
  hireSignal: 'strong_yes' | 'lean_yes' | 'neutral' | 'lean_no' | 'strong_no';
  starAverages: {
    situation: number;
    task: number;
    action: number;
    result: number;
  };
  communicationAverages: CommunicationScore;
  strengths: string[];
  weaknesses: string[];
  patterns: Pattern[]; // Only patterns with instanceCount >= 3 per D-03
}

/**
 * CoachingInsight contains actionable coaching recommendations.
 * topPriorities contains exactly 3 items per spec.
 */
export interface CoachingInsight {
  topPriorities: CoachingPriority[]; // Exactly 3 items per spec
  quickWins: string[];
  practicePlan: PracticePlan;
}

/**
 * DebriefReport is the output of generateDebrief.
 * Includes legacy fields for DebriefScreen compatibility (per D-06).
 */
export interface DebriefReport {
  // Legacy fields (retained for backward compatibility)
  elevatorPitch: string;
  keyAchievements: string[];
  uniqueValueProposition: string;
  areasForImprovement: string[];

  // Transcript-based fields (Phase 4)
  transcriptSummary: TranscriptSummary;
  sessionStats: SessionStats;

  // STAR Analysis fields (Phase 6)
  // Optional until analysis implementation in 06-02/06-03
  evaluations?: QAPairEvaluation[];
  analysis?: AnalysisReport;
  coaching?: CoachingInsight;
}

/**
 * AgentId identifies which interviewer persona is active.
 * Per D-04: 7 agents from ideas-for-v3 spec.
 */
export type AgentId =
  | 'hiring-manager'
  | 'high-pressure'
  | 'supportive-coach'
  | 'rapid-fire'
  | 'story-architect'
  | 'efficiency-screener'
  | 'behavioral-analyst';

/**
 * AgentType groups agents by interview mode.
 * Per D-01: Two groups - simulation and targeted prep.
 */
export type AgentType = 'simulation' | 'targeted';

/**
 * AgentDefinition contains the full persona specification.
 * Per D-02: Includes boundaries, tone, edge cases for drift prevention.
 */
export interface AgentDefinition {
  id: AgentId;
  label: string;
  description: string;
  interviewType: string;
  type: AgentType;
  duration: { min: number; max: number };
  icon: string; // Lucide icon name
  persona: string;
  coreBehaviors: string[];
  tone: string;
  boundaries: string[];
  edgeCaseHandling: Record<string, string>;
}