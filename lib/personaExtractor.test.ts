// Tests for persona extraction
// Tests validation helpers and prompt building

import { describe, it, expect } from 'vitest';
import { validatePersonaOutput, FALLBACK_PERSONA } from './personaExtractor';
import { buildPersonaExtractionPrompt, PERSONA_SCHEMA, VALID_EXPERIENCE_LEVELS, VALID_FORMALITIES, VALID_APPROACHES } from './personaPrompts';

describe('validatePersonaOutput', () => {
  it('returns fallback for null input', () => {
    const result = validatePersonaOutput(null);
    expect(result).toEqual(FALLBACK_PERSONA);
  });

  it('returns fallback for undefined input', () => {
    const result = validatePersonaOutput(undefined);
    expect(result).toEqual(FALLBACK_PERSONA);
  });

  it('returns fallback for non-object input', () => {
    const result = validatePersonaOutput('not an object');
    expect(result).toEqual(FALLBACK_PERSONA);
  });

  it('validates a complete valid input', () => {
    const validInput = {
      experienceLevel: 'senior',
      yearsOfExperience: 7,
      workHistorySummary: 'Software engineer with 7 years of experience.',
      skills: {
        technical: ['TypeScript', 'React', 'Node.js'],
        soft: ['Leadership', 'Communication'],
        domain: ['FinTech', 'Healthcare'],
      },
      communicationStyle: {
        formality: 'formal',
        approach: 'technical',
      },
      knowledgeGaps: [
        { category: 'Cloud', missingSkills: ['AWS', 'Kubernetes'] },
        { category: 'Leadership', missingSkills: ['Team management', 'Mentoring'] },
      ],
    };

    const result = validatePersonaOutput(validInput);

    expect(result.experienceLevel).toBe('senior');
    expect(result.yearsOfExperience).toBe(7);
    expect(result.workHistorySummary).toBe('Software engineer with 7 years of experience.');
    expect(result.skills.technical).toEqual(['TypeScript', 'React', 'Node.js']);
    expect(result.communicationStyle.formality).toBe('formal');
    expect(result.communicationStyle.approach).toBe('technical');
    expect(result.knowledgeGaps).toHaveLength(2);
  });

  it('clamps yearsOfExperience to 0-50 range', () => {
    const overMax = validatePersonaOutput({ yearsOfExperience: 100 });
    expect(overMax.yearsOfExperience).toBe(50);

    const underMin = validatePersonaOutput({ yearsOfExperience: -5 });
    expect(underMin.yearsOfExperience).toBe(0);
  });

  it('falls back to mid for invalid experienceLevel', () => {
    const result = validatePersonaOutput({ experienceLevel: 'invalid' });
    expect(result.experienceLevel).toBe('mid');
  });

  it('falls back to empty arrays for missing skills', () => {
    const result = validatePersonaOutput({ skills: {} });
    expect(result.skills.technical).toEqual([]);
    expect(result.skills.soft).toEqual([]);
    expect(result.skills.domain).toEqual([]);
  });

  it('validates communicationStyle with fallbacks', () => {
    const result = validatePersonaOutput({
      communicationStyle: {
        formality: 'invalid',
        approach: 'also-invalid',
      },
    });
    expect(result.communicationStyle.formality).toBe('formal');
    expect(result.communicationStyle.approach).toBe('narrative');
  });

  it('ensures minimum knowledge gaps', () => {
    const result = validatePersonaOutput({ knowledgeGaps: [] });
    expect(result.knowledgeGaps.length).toBeGreaterThanOrEqual(2);
  });

  it('filters knowledge gaps with less than 2 missing skills', () => {
    const result = validatePersonaOutput({
      knowledgeGaps: [
        { category: 'Valid', missingSkills: ['Skill1', 'Skill2'] },
        { category: 'Invalid', missingSkills: ['OnlyOne'] },
      ],
    });
    // Should have the valid one plus fallbacks
    expect(result.knowledgeGaps.some(g => g.category === 'Valid')).toBe(true);
  });
});

describe('buildPersonaExtractionPrompt', () => {
  it('includes XML resume tags', () => {
    const prompt = buildPersonaExtractionPrompt('My Resume', 'My JD');
    expect(prompt).toContain('<resume>');
    expect(prompt).toContain('</resume>');
  });

  it('includes XML jobDescription tags', () => {
    const prompt = buildPersonaExtractionPrompt('My Resume', 'My JD');
    expect(prompt).toContain('<jobDescription>');
    expect(prompt).toContain('</jobDescription>');
  });

  it('includes the PERSONA_SCHEMA', () => {
    const prompt = buildPersonaExtractionPrompt('Resume', 'JD');
    expect(prompt).toContain(PERSONA_SCHEMA);
  });

  it('truncates long resume text to MAX_CONTEXT_CHARS', () => {
    const longResume = 'x'.repeat(10000);
    const prompt = buildPersonaExtractionPrompt(longResume, 'JD');
    // The resume content should be truncated
    expect(prompt).not.toContain('x'.repeat(9000));
  });

  it('truncates long JD text to MAX_CONTEXT_CHARS', () => {
    const longJd = 'y'.repeat(10000);
    const prompt = buildPersonaExtractionPrompt('Resume', longJd);
    expect(prompt).not.toContain('y'.repeat(9000));
  });

  it('includes experience level inference rules', () => {
    const prompt = buildPersonaExtractionPrompt('Resume', 'JD');
    expect(prompt).toContain('junior');
    expect(prompt).toContain('mid');
    expect(prompt).toContain('senior');
    expect(prompt).toContain('staff');
    expect(prompt).toContain('0-2 years');
    expect(prompt).toContain('10+ years');
  });

  it('includes skill categorization rules', () => {
    const prompt = buildPersonaExtractionPrompt('Resume', 'JD');
    expect(prompt).toContain('technical');
    expect(prompt).toContain('soft');
    expect(prompt).toContain('domain');
  });
});

describe('constants', () => {
  it('VALID_EXPERIENCE_LEVELS contains all levels', () => {
    expect(VALID_EXPERIENCE_LEVELS).toContain('junior');
    expect(VALID_EXPERIENCE_LEVELS).toContain('mid');
    expect(VALID_EXPERIENCE_LEVELS).toContain('senior');
    expect(VALID_EXPERIENCE_LEVELS).toContain('staff');
  });

  it('VALID_FORMALITIES contains both options', () => {
    expect(VALID_FORMALITIES).toContain('formal');
    expect(VALID_FORMALITIES).toContain('casual');
  });

  it('VALID_APPROACHES contains both options', () => {
    expect(VALID_APPROACHES).toContain('technical');
    expect(VALID_APPROACHES).toContain('narrative');
  });
});