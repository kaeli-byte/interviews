// Structured AI prompts for candidate persona extraction
// Per D-01: Single API call extracts all persona fields
// Per D-02: CandidatePersona type with experience, skills, communication, gaps
// Per D-04: Category-level gaps (3-5 categories, 2-3 skills each)

import type { ExperienceLevel, CommunicationFormality, CommunicationApproach } from './types';

/**
 * JSON schema describing the expected AI output format for persona extraction.
 * This schema is included in the prompt to ensure structured, parseable responses.
 */
export const PERSONA_SCHEMA = `
{
  "experienceLevel": "junior | mid | senior | staff",
  "yearsOfExperience": "number - total years of professional experience",
  "workHistorySummary": "string - 1-2 sentence summary of career trajectory",
  "skills": {
    "technical": ["array of 5-8 technical skills (languages, frameworks, tools)"],
    "soft": ["array of 5-8 soft skills (communication, leadership, collaboration)"],
    "domain": ["array of 5-8 domain/industry skills"]
  },
  "communicationStyle": {
    "formality": "formal | casual",
    "approach": "technical | narrative"
  },
  "knowledgeGaps": [
    {
      "category": "string - skill category from JD requirements",
      "missingSkills": ["array of 2-3 specific missing skills"]
    }
  ]
}
`;

/**
 * Valid experience level values.
 * Must match ExperienceLevel type from lib/types.ts.
 */
export const VALID_EXPERIENCE_LEVELS: readonly ExperienceLevel[] = ['junior', 'mid', 'senior', 'staff'] as const;

/**
 * Valid communication formality values.
 */
export const VALID_FORMALITIES: readonly CommunicationFormality[] = ['formal', 'casual'] as const;

/**
 * Valid communication approach values.
 */
export const VALID_APPROACHES: readonly CommunicationApproach[] = ['technical', 'narrative'] as const;

/**
 * Maximum context characters per document.
 * Per promptBuilder.ts pattern: ~8K chars = ~2K tokens with buffer.
 */
const MAX_CONTEXT_CHARS = 8000;

/**
 * Builds the AI prompt for persona extraction.
 *
 * Key constraints enforced:
 * - D-01: Single API call extracts all fields
 * - D-02: Experience level inference from years, not keywords
 * - D-04: 3-5 knowledge gap categories with 2-3 skills each
 *
 * @param resume - Resume text content
 * @param jd - Job description text content
 * @returns Complete prompt string for Gemini API
 */
export function buildPersonaExtractionPrompt(resume: string, jd: string): string {
  // Truncate if exceeds safe limit (~8K chars = ~2K tokens with buffer)
  const truncatedResume = resume.slice(0, MAX_CONTEXT_CHARS);
  const truncatedJd = jd.slice(0, MAX_CONTEXT_CHARS);

  return `You are an expert career analyst extracting candidate persona data for interview simulation.

## Documents

<resume>
${truncatedResume}
</resume>

<jobDescription>
${truncatedJd}
</jobDescription>

## Output Format

Return valid JSON matching this schema:
${PERSONA_SCHEMA}

## Extraction Rules

### Experience Level Inference (CRITICAL - Use Years, Not Keywords)
Classify based on TOTAL YEARS of professional experience, not skill keywords:
- **junior**: 0-2 years, entry-level roles, internship experience, recent graduate
- **mid**: 2-5 years, individual contributor roles, growing autonomy, established career
- **senior**: 5-10 years, lead roles, mentoring responsibilities, significant project scope
- **staff**: 10+ years, cross-team impact, strategic influence, principal/architect-level roles

Count years from work history dates. Do NOT classify as senior based on having "senior" in job title.

### Skill Categorization
Extract 5-8 skills per category:
- **technical**: Programming languages, frameworks, tools, methodologies, platforms
- **soft**: Communication, leadership, collaboration, problem-solving, adaptability
- **domain**: Industry-specific knowledge, business domains, vertical expertise

Focus on skills DEMONSTRATED in the resume, not just listed.

### Communication Style Detection
Analyze language patterns in resume descriptions:
- **formal**: Professional language, structured sentences, corporate tone, objective descriptions
- **casual**: Conversational tone, contractions, personal anecdotes, subjective language
- **technical**: Data-driven, metrics-focused, process-oriented, specification-like
- **narrative**: Story-based, situation-focused, outcome-emphasized, contextual

Choose formality and approach independently based on writing style.

### Knowledge Gap Analysis (CRITICAL - JD vs Resume Comparison)
1. Identify 3-5 skill CATEGORIES explicitly required in the job description
2. For each category, check if resume demonstrates proficiency
3. If a clear gap exists, list 2-3 SPECIFIC missing skills
4. Only include categories where resume CLEARLY lacks requirements from JD

IMPORTANT: Gaps must be specific to the JD requirements, not generic skills.

## Output Requirements
1. Return ONLY valid JSON (no markdown code blocks, no extra text)
2. All fields are required - no null values
3. knowledgeGaps array must have 3-5 items
4. Each gap category must have 2-3 missingSkills

Return your JSON response now.`;
}