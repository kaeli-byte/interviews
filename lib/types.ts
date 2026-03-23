/**
 * Type definitions for the MyCareer application.
 */

export interface TranscriptEntry {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: number; // milliseconds from interview start
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
 * DebriefReport is the output of generateDebrief.
 * Includes legacy fields for DebriefScreen compatibility (per D-06).
 */
export interface DebriefReport {
  // Legacy fields (required for DebriefScreen compatibility)
  elevatorPitch: string;
  keyAchievements: string[];
  uniqueValueProposition: string;
  areasForImprovement: string[];

  // Transcript-based fields (new in Phase 4)
  transcriptSummary: TranscriptSummary;
  sessionStats: SessionStats;
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