import { describe, it, expect } from 'vitest';
import { buildSystemInstruction, type PromptContext } from './promptBuilder';

describe('buildSystemInstruction', () => {
  it('returns valid instruction with role and opening when resume/JD are empty', () => {
    const ctx: PromptContext = {
      resume: '',
      jobDescription: '',
      personality: 'warm'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('<role>');
    expect(result).toContain('career coach');
    expect(result).toContain('interviewer');
    expect(result).toContain('<opening>');
    expect(result).toContain('icebreaker');
  });

  it('truncates resume longer than MAX_CONTEXT_CHARS to MAX_CONTEXT_CHARS', () => {
    const longResume = 'A'.repeat(10000);
    const ctx: PromptContext = {
      resume: longResume,
      jobDescription: '',
      personality: 'warm'
    };

    const result = buildSystemInstruction(ctx);

    // Should contain truncated resume (8000 chars of 'A')
    expect(result).toContain('<resume>');
    expect(result).not.toContain('A'.repeat(9000));
  });

  it('includes warm-specific constraints when personality is warm', () => {
    const ctx: PromptContext = {
      resume: 'Software Engineer at Tech Corp',
      jobDescription: '',
      personality: 'warm'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('Supportive');
    expect(result).toContain('affirming language');
  });

  it('contains XML delimiters for resume and jobDescription', () => {
    const ctx: PromptContext = {
      resume: 'My resume content',
      jobDescription: 'JD content',
      personality: 'professional'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('<resume>');
    expect(result).toContain('</resume>');
    expect(result).toContain('<jobDescription>');
    expect(result).toContain('</jobDescription>');
  });

  it('contains icebreaker directive referencing resume details', () => {
    const ctx: PromptContext = {
      resume: 'Senior Developer with 5 years experience',
      jobDescription: 'Software Engineer role',
      personality: 'direct'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('icebreaker');
    expect(result).toContain('resume');
    expect(result).toContain('specific details');
  });
});
