/**
 * Type definitions for the MyCareer application.
 */

export interface TranscriptEntry {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: number; // milliseconds from interview start
}