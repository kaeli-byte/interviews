import { TranscriptEntry, QAPair, UtteranceAccumulator, SessionStats } from './types';

/**
 * Generates a unique ID for QAPair entries.
 * Uses crypto.randomUUID if available, otherwise falls back to random string.
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Merges fragmented TranscriptEntry chunks into complete utterances.
 *
 * Gemini sends transcription in partial chunks. This function:
 * 1. Groups consecutive entries by same speaker
 * 2. Merges text when speaker continues speaking
 * 3. Emits new entry when speaker changes
 *
 * Per D-01: Turn-based utterance merging.
 *
 * @param entries - Raw transcript entries from Gemini
 * @returns Merged utterances with combined text per speaker turn
 */
export function mergeUtterances(entries: TranscriptEntry[]): TranscriptEntry[] {
  if (entries.length === 0) return [];

  const merged: TranscriptEntry[] = [];
  let current: UtteranceAccumulator = {
    speaker: entries[0].speaker,
    chunks: [entries[0].text],
    startTimestamp: entries[0].timestamp,
    lastTimestamp: entries[0].timestamp,
  };

  for (let i = 1; i < entries.length; i++) {
    const entry = entries[i];

    if (entry.speaker === current.speaker) {
      // Same speaker continuing - accumulate chunk
      current.chunks.push(entry.text);
      current.lastTimestamp = entry.timestamp;
    } else {
      // Speaker changed - emit merged entry and start new accumulator
      merged.push({
        speaker: current.speaker,
        text: current.chunks.join(' '),
        timestamp: current.startTimestamp,
      });

      current = {
        speaker: entry.speaker,
        chunks: [entry.text],
        startTimestamp: entry.timestamp,
        lastTimestamp: entry.timestamp,
      };
    }
  }

  // Emit final accumulated entry
  merged.push({
    speaker: current.speaker,
    text: current.chunks.join(' '),
    timestamp: current.startTimestamp,
  });

  return merged;
}

/**
 * Creates Q/A pairs from merged utterances.
 *
 * Per D-02: Sequential pairing - each interviewer turn + following candidate turn = 1 Q/A pair.
 * Handles follow-ups naturally (multiple interviewer chunks merged in mergeUtterances).
 *
 * @param mergedEntries - Merged utterances from mergeUtterances
 * @returns Array of QAPair objects with unique IDs
 */
export function createQAPairs(mergedEntries: TranscriptEntry[]): QAPair[] {
  const pairs: QAPair[] = [];
  let currentQuestion: TranscriptEntry | null = null;
  let currentResponse: TranscriptEntry[] = [];

  for (const entry of mergedEntries) {
    if (entry.speaker === 'interviewer') {
      // New question - save previous pair if exists
      if (currentQuestion && currentResponse.length > 0) {
        pairs.push({
          id: generateId(),
          question: currentQuestion,
          response: currentResponse,
          startTimestamp: currentQuestion.timestamp,
          endTimestamp: currentResponse[currentResponse.length - 1].timestamp,
        });
      }

      // Start new pair
      currentQuestion = entry;
      currentResponse = [];
    } else {
      // Candidate response - accumulate
      currentResponse.push(entry);
    }
  }

  // Save final pair if exists
  if (currentQuestion && currentResponse.length > 0) {
    pairs.push({
      id: generateId(),
      question: currentQuestion,
      response: currentResponse,
      startTimestamp: currentQuestion.timestamp,
      endTimestamp: currentResponse[currentResponse.length - 1].timestamp,
    });
  }

  return pairs;
}

/**
 * Generates session statistics from transcript.
 *
 * @param entries - Transcript entries (raw or merged)
 * @param pairs - Q/A pairs for question count
 * @returns SessionStats with duration, word counts, question count
 */
export function calculateSessionStats(
  entries: TranscriptEntry[],
  pairs: QAPair[]
): SessionStats {
  const candidateWords = entries
    .filter((e) => e.speaker === 'candidate')
    .reduce((sum, e) => sum + e.text.split(/\s+/).filter(Boolean).length, 0);

  const interviewerWords = entries
    .filter((e) => e.speaker === 'interviewer')
    .reduce((sum, e) => sum + e.text.split(/\s+/).filter(Boolean).length, 0);

  const timestamps = entries.map((e) => e.timestamp);
  const durationMs =
    timestamps.length > 0 ? Math.max(...timestamps) - Math.min(...timestamps) : 0;

  return {
    durationMs,
    questionCount: pairs.length,
    candidateWordCount: candidateWords,
    interviewerWordCount: interviewerWords,
  };
}

/**
 * Full processing pipeline: raw entries -> merged -> Q/A pairs
 *
 * @param entries - Raw transcript entries from Gemini
 * @returns Object with merged entries, Q/A pairs, and session stats
 */
export function processTranscript(entries: TranscriptEntry[]): {
  merged: TranscriptEntry[];
  pairs: QAPair[];
  stats: SessionStats;
} {
  const merged = mergeUtterances(entries);
  const pairs = createQAPairs(merged);
  // Pass raw entries for accurate duration calculation (merged entries only have start timestamps)
  const stats = calculateSessionStats(entries, pairs);

  return { merged, pairs, stats };
}