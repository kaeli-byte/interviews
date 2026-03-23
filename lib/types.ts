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