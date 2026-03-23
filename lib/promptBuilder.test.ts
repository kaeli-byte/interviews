import { describe, it, expect } from 'vitest';
import { buildSystemInstruction, type PromptContext } from './promptBuilder';

describe('buildSystemInstruction', () => {
  it('returns valid instruction with role and opening when resume/JD are empty', () => {
    const ctx: PromptContext = {
      resume: '',
      jobDescription: '',
      agentId: 'hiring-manager'
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
      agentId: 'hiring-manager'
    };

    const result = buildSystemInstruction(ctx);

    // Should contain truncated resume (8000 chars of 'A')
    expect(result).toContain('<resume>');
    expect(result).not.toContain('A'.repeat(9000));
  });

  it('includes hiring-manager specific behaviors when agentId is hiring-manager', () => {
    const ctx: PromptContext = {
      resume: 'Software Engineer at Tech Corp',
      jobDescription: '',
      agentId: 'hiring-manager'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('hiring manager');
    expect(result).toContain('<behaviors>');
    expect(result).toContain('<boundaries>');
  });

  it('contains XML delimiters for resume and jobDescription', () => {
    const ctx: PromptContext = {
      resume: 'My resume content',
      jobDescription: 'JD content',
      agentId: 'hiring-manager'
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
      agentId: 'hiring-manager'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('icebreaker');
    expect(result).toContain('resume');
    expect(result).toContain('specific details');
  });

  it('includes boundaries section with anti-behaviors for drift prevention', () => {
    const ctx: PromptContext = {
      resume: 'Test resume',
      jobDescription: 'Test JD',
      agentId: 'hiring-manager'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('<boundaries>');
    expect(result).toContain('YOU MUST NOT:');
    expect(result).toContain('No coaching during the interview phase');
  });

  it('includes edge case handling for the selected agent', () => {
    const ctx: PromptContext = {
      resume: 'Test resume',
      jobDescription: 'Test JD',
      agentId: 'hiring-manager'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('<edge_cases>');
    expect(result).toContain('Skip request:');
    expect(result).toContain('Silence:');
    expect(result).toContain('Unclear answer:');
    expect(result).toContain('Help request:');
  });

  it('generates high-pressure agent with intense tone', () => {
    const ctx: PromptContext = {
      resume: 'Test resume',
      jobDescription: 'Test JD',
      agentId: 'high-pressure'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('Direct, intense');
    expect(result).toContain('<tone>');
  });

  // Backwards compatibility tests
  it('maps legacy personality "professional" to hiring-manager agent', () => {
    const ctx: PromptContext = {
      resume: 'Test resume',
      jobDescription: 'Test JD',
      personality: 'professional'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('hiring manager');
    expect(result).toContain('Professional, neutral');
  });

  it('maps legacy personality "warm" to supportive-coach agent', () => {
    const ctx: PromptContext = {
      resume: 'Test resume',
      jobDescription: 'Test JD',
      personality: 'warm'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('encouraging coach');
    expect(result).toContain('Warm, patient');
  });

  it('maps legacy personality "direct" to high-pressure agent', () => {
    const ctx: PromptContext = {
      resume: 'Test resume',
      jobDescription: 'Test JD',
      personality: 'direct'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('demanding interviewer');
    expect(result).toContain('Direct, intense');
  });

  it('prefers agentId over personality when both provided', () => {
    const ctx: PromptContext = {
      resume: 'Test resume',
      jobDescription: 'Test JD',
      agentId: 'rapid-fire',
      personality: 'warm'  // Should be ignored
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('drill coach');
    expect(result).not.toContain('encouraging coach');
  });

  it('defaults to hiring-manager when no agent or personality specified', () => {
    const ctx: PromptContext = {
      resume: 'Test resume',
      jobDescription: 'Test JD'
    };

    const result = buildSystemInstruction(ctx);

    expect(result).toContain('hiring manager');
  });
});