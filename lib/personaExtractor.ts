// Persona extraction using Gemini API
// Per D-01: Single API call extracts all persona fields
// Follows debriefGenerator.ts pattern for Gemini integration

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CandidatePersona, ExperienceLevel, CommunicationFormality, CommunicationApproach } from "./types";
import { buildPersonaExtractionPrompt, VALID_EXPERIENCE_LEVELS, VALID_FORMALITIES, VALID_APPROACHES } from "./personaPrompts";

/**
 * Fallback persona used when extraction fails.
 */
export const FALLBACK_PERSONA: CandidatePersona = {
  experienceLevel: 'mid',
  yearsOfExperience: 5,
  workHistorySummary: 'Professional with experience in the field.',
  skills: {
    technical: ['Problem solving', 'Analytical thinking'],
    soft: ['Communication', 'Teamwork'],
    domain: ['General knowledge'],
  },
  communicationStyle: {
    formality: 'formal',
    approach: 'narrative',
  },
  knowledgeGaps: [
    { category: 'Technical depth', missingSkills: ['Advanced specialized skills'] },
    { category: 'Domain expertise', missingSkills: ['Industry-specific knowledge'] },
  ],
};

/**
 * Validates and sanitizes raw AI output into a CandidatePersona.
 * Provides fallbacks for missing or invalid fields.
 *
 * @param raw - Parsed JSON from AI response
 * @returns Validated CandidatePersona
 */
export function validatePersonaOutput(raw: unknown): CandidatePersona {
  if (!raw || typeof raw !== 'object') {
    return FALLBACK_PERSONA;
  }

  const data = raw as Record<string, unknown>;

  // Validate experienceLevel
  const experienceLevel = VALID_EXPERIENCE_LEVELS.includes(data.experienceLevel as ExperienceLevel)
    ? (data.experienceLevel as ExperienceLevel)
    : 'mid';

  // Validate yearsOfExperience (clamp to 0-50)
  const rawYears = Number(data.yearsOfExperience);
  const yearsOfExperience = isNaN(rawYears) ? 5 : Math.max(0, Math.min(50, Math.round(rawYears)));

  // Validate workHistorySummary
  const workHistorySummary = typeof data.workHistorySummary === 'string' && data.workHistorySummary.trim()
    ? data.workHistorySummary.trim()
    : 'Professional with relevant experience.';

  // Validate skills
  const rawSkills = data.skills && typeof data.skills === 'object' ? data.skills : {};
  const skills = {
    technical: validateStringArray((rawSkills as Record<string, unknown>).technical, 8),
    soft: validateStringArray((rawSkills as Record<string, unknown>).soft, 8),
    domain: validateStringArray((rawSkills as Record<string, unknown>).domain, 8),
  };

  // Validate communicationStyle
  const rawStyle = data.communicationStyle && typeof data.communicationStyle === 'object'
    ? data.communicationStyle
    : {};
  const communicationStyle = {
    formality: VALID_FORMALITIES.includes((rawStyle as Record<string, unknown>).formality as CommunicationFormality)
      ? (rawStyle as Record<string, unknown>).formality as CommunicationFormality
      : 'formal',
    approach: VALID_APPROACHES.includes((rawStyle as Record<string, unknown>).approach as CommunicationApproach)
      ? (rawStyle as Record<string, unknown>).approach as CommunicationApproach
      : 'narrative',
  };

  // Validate knowledgeGaps
  const rawGaps = Array.isArray(data.knowledgeGaps) ? data.knowledgeGaps : [];
  const knowledgeGaps = rawGaps
    .filter((gap): gap is Record<string, unknown> => gap && typeof gap === 'object')
    .slice(0, 5)
    .map((gap) => ({
      category: typeof gap.category === 'string' && gap.category.trim()
        ? gap.category.trim()
        : 'Unknown area',
      missingSkills: validateStringArray(gap.missingSkills, 3),
    }))
    .filter((gap) => gap.missingSkills.length >= 2);

  // Ensure at least 2 gap categories
  if (knowledgeGaps.length < 2) {
    knowledgeGaps.push(
      { category: 'Technical breadth', missingSkills: ['Additional technologies'] },
      { category: 'Domain depth', missingSkills: ['Industry-specific experience'] }
    );
  }

  return {
    experienceLevel,
    yearsOfExperience,
    workHistorySummary,
    skills,
    communicationStyle,
    knowledgeGaps: knowledgeGaps.slice(0, 5),
  };
}

/**
 * Validates and sanitizes a string array from AI output.
 *
 * @param arr - Raw array from AI output
 * @param maxLength - Maximum number of items to keep
 * @returns Array of validated strings
 */
function validateStringArray(arr: unknown, maxLength: number): string[] {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim())
    .slice(0, maxLength);
}

/**
 * Extracts a candidate persona from resume and job description using Gemini.
 *
 * @param resume - Resume text content
 * @param jd - Job description text content
 * @returns Promise resolving to CandidatePersona
 * @throws Error if API key is missing or extraction fails
 */
export async function extractPersona(resume: string, jd: string): Promise<CandidatePersona> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY missing - cannot extract persona");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = buildPersonaExtractionPrompt(resume, jd);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error("Failed to parse JSON from AI response");
      return FALLBACK_PERSONA;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return validatePersonaOutput(parsed);

  } catch (error) {
    console.error("Persona extraction failed:", error);
    return FALLBACK_PERSONA;
  }
}