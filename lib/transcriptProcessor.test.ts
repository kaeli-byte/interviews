import { describe, it, expect } from 'vitest';
import { mergeUtterances, createQAPairs, calculateSessionStats, processTranscript } from './transcriptProcessor';
import type { TranscriptEntry, QAPair } from './types';

describe('mergeUtterances', () => {
  it('combines consecutive same-speaker entries into single utterances', () => {
    const entries: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'Tell me about', timestamp: 1000 },
      { speaker: 'interviewer', text: 'a time you', timestamp: 1500 },
      { speaker: 'interviewer', text: 'handled conflict', timestamp: 2000 },
    ];

    const result = mergeUtterances(entries);

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Tell me about a time you handled conflict');
    expect(result[0].speaker).toBe('interviewer');
    expect(result[0].timestamp).toBe(1000);
  });

  it('respects turn boundaries - speaker change creates new utterance', () => {
    const entries: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'Tell me about yourself', timestamp: 1000 },
      { speaker: 'candidate', text: 'I am a software', timestamp: 3000 },
      { speaker: 'candidate', text: 'engineer with 5 years', timestamp: 3500 },
      { speaker: 'candidate', text: 'of experience', timestamp: 4000 },
    ];

    const result = mergeUtterances(entries);

    expect(result).toHaveLength(2);
    expect(result[0].speaker).toBe('interviewer');
    expect(result[0].text).toBe('Tell me about yourself');
    expect(result[1].speaker).toBe('candidate');
    expect(result[1].text).toBe('I am a software engineer with 5 years of experience');
  });

  it('returns empty array for empty input', () => {
    const result = mergeUtterances([]);
    expect(result).toEqual([]);
  });

  it('handles single entry correctly', () => {
    const entries: TranscriptEntry[] = [
      { speaker: 'candidate', text: 'Hello', timestamp: 1000 },
    ];

    const result = mergeUtterances(entries);

    expect(result).toHaveLength(1);
    expect(result[0].text).toBe('Hello');
  });
});

describe('createQAPairs', () => {
  it('pairs interviewer question with following candidate response', () => {
    const merged: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'Tell me about yourself', timestamp: 1000 },
      { speaker: 'candidate', text: 'I am a developer', timestamp: 3000 },
    ];

    const result = createQAPairs(merged);

    expect(result).toHaveLength(1);
    expect(result[0].question.speaker).toBe('interviewer');
    expect(result[0].question.text).toBe('Tell me about yourself');
    expect(result[0].response).toHaveLength(1);
    expect(result[0].response[0].text).toBe('I am a developer');
  });

  it('handles multiple candidate chunks for single response', () => {
    const merged: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'What is your greatest strength?', timestamp: 1000 },
      { speaker: 'candidate', text: 'My greatest strength is', timestamp: 3000 },
      { speaker: 'candidate', text: 'problem-solving', timestamp: 4000 },
    ];

    const result = createQAPairs(merged);

    expect(result).toHaveLength(1);
    expect(result[0].response).toHaveLength(2);
    expect(result[0].response[0].text).toBe('My greatest strength is');
    expect(result[0].response[1].text).toBe('problem-solving');
    expect(result[0].endTimestamp).toBe(4000);
  });

  it('generates unique IDs for each pair', () => {
    const merged: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'Question 1', timestamp: 1000 },
      { speaker: 'candidate', text: 'Answer 1', timestamp: 3000 },
      { speaker: 'interviewer', text: 'Question 2', timestamp: 5000 },
      { speaker: 'candidate', text: 'Answer 2', timestamp: 7000 },
    ];

    const result = createQAPairs(merged);

    expect(result).toHaveLength(2);
    expect(result[0].id).not.toBe(result[1].id);
    expect(result[0].id).toMatch(/^[a-zA-Z0-9_-]+$/); // Valid ID format
  });

  it('sets correct timestamps for Q/A pairs', () => {
    const merged: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'Question?', timestamp: 1000 },
      { speaker: 'candidate', text: 'Answer part 1', timestamp: 3000 },
      { speaker: 'candidate', text: 'Answer part 2', timestamp: 5000 },
    ];

    const result = createQAPairs(merged);

    expect(result[0].startTimestamp).toBe(1000);
    expect(result[0].endTimestamp).toBe(5000);
  });

  it('handles interviewer-only entries without response gracefully', () => {
    const merged: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'Question without answer', timestamp: 1000 },
    ];

    const result = createQAPairs(merged);

    // No pair should be created without a response
    expect(result).toHaveLength(0);
  });

  it('ignores candidate entries without preceding question', () => {
    const merged: TranscriptEntry[] = [
      { speaker: 'candidate', text: 'Orphan response', timestamp: 1000 },
    ];

    const result = createQAPairs(merged);

    expect(result).toHaveLength(0);
  });
});

describe('calculateSessionStats', () => {
  it('calculates correct duration from timestamps', () => {
    const entries: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'Hello', timestamp: 1000 },
      { speaker: 'candidate', text: 'Hi there', timestamp: 5000 },
      { speaker: 'interviewer', text: 'Goodbye', timestamp: 10000 },
    ];
    const pairs: QAPair[] = [];

    const result = calculateSessionStats(entries, pairs);

    expect(result.durationMs).toBe(9000); // 10000 - 1000
  });

  it('counts questions from pairs', () => {
    const entries: TranscriptEntry[] = [];
    const pairs: QAPair[] = [
      { id: '1', question: {} as TranscriptEntry, response: [], startTimestamp: 0, endTimestamp: 0 },
      { id: '2', question: {} as TranscriptEntry, response: [], startTimestamp: 0, endTimestamp: 0 },
    ];

    const result = calculateSessionStats(entries, pairs);

    expect(result.questionCount).toBe(2);
  });

  it('counts words per speaker correctly', () => {
    const entries: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'One two three', timestamp: 1000 },
      { speaker: 'candidate', text: 'Four five six seven eight', timestamp: 2000 },
      { speaker: 'interviewer', text: 'Nine', timestamp: 3000 },
    ];
    const pairs: QAPair[] = [];

    const result = calculateSessionStats(entries, pairs);

    expect(result.interviewerWordCount).toBe(4); // "One two three" + "Nine"
    expect(result.candidateWordCount).toBe(5); // "Four five six seven eight"
  });

  it('returns zeros for empty input', () => {
    const result = calculateSessionStats([], []);

    expect(result.durationMs).toBe(0);
    expect(result.questionCount).toBe(0);
    expect(result.candidateWordCount).toBe(0);
    expect(result.interviewerWordCount).toBe(0);
  });
});

describe('processTranscript', () => {
  it('provides full processing pipeline', () => {
    const entries: TranscriptEntry[] = [
      { speaker: 'interviewer', text: 'Tell me', timestamp: 1000 },
      { speaker: 'interviewer', text: 'about yourself', timestamp: 1500 },
      { speaker: 'candidate', text: 'I am a', timestamp: 3000 },
      { speaker: 'candidate', text: 'developer', timestamp: 3500 },
    ];

    const result = processTranscript(entries);

    // Verify merging happened
    expect(result.merged).toHaveLength(2);
    expect(result.merged[0].text).toBe('Tell me about yourself');
    expect(result.merged[1].text).toBe('I am a developer');

    // Verify Q/A pairing happened
    expect(result.pairs).toHaveLength(1);
    expect(result.pairs[0].question.text).toBe('Tell me about yourself');

    // Verify stats were calculated
    expect(result.stats.questionCount).toBe(1);
    expect(result.stats.durationMs).toBe(2500); // 3500 - 1000
  });
});