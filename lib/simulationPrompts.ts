/**
 * Prompts for simulation interviewer and candidate agents.
 * Per D-09: Alternating API calls between interviewer and candidate.
 * Per D-10: Uses existing 7 interviewer agents from lib/agents.ts.
 * Per D-11: Candidate persona drives responses.
 *
 * IMPORTANT: Interviewer prompts use the same buildSystemInstruction as real interviews
 * to ensure simulations accurately represent the actual interviewer personas.
 */

import { AgentId, CandidatePersona } from './types';
import { buildSystemInstruction } from './promptBuilder';

/**
 * Build the system prompt for the interviewer agent.
 * Uses the SAME prompts as real interviews (promptBuilder.ts) for consistency.
 */
export function buildInterviewerPrompt(
  agentId: AgentId,
  resume: string,
  jobDescription: string
): string {
  // Use the shared prompt builder for consistency with real interviews
  return buildSystemInstruction({
    resume,
    jobDescription,
    agentId,
  });
}

/**
 * Build the system prompt for the candidate agent.
 * Per D-11: Persona traits drive response style.
 */
export function buildCandidatePrompt(persona: CandidatePersona): string {
  const formality = persona.communicationStyle.formality;
  const approach = persona.communicationStyle.approach;
  const experienceYears = persona.yearsOfExperience;
  const level = persona.experienceLevel;

  // Build knowledge gaps context
  const gapsContext = persona.knowledgeGaps.length > 0
    ? `### Areas Where You Have Gaps (be honest but positive)
${persona.knowledgeGaps.map(g => `- ${g.category}: Missing ${g.missingSkills.join(', ')}`).join('\n')}

When asked about these areas, acknowledge limited experience but show willingness to learn.`
    : '';

  // Build skills context
  const skillsContext = `
### Your Technical Skills
${persona.skills.technical.join(', ')}

### Your Soft Skills
${persona.skills.soft.join(', ')}

### Your Domain Knowledge
${persona.skills.domain.join(', ')}`;

  return `You are an AI candidate simulating a job applicant.

## Your Candidate Persona
You are a ${level}-level professional with ${experienceYears} years of experience.

### Work History Summary
${persona.workHistorySummary}

${skillsContext}

## Your Communication Style
- **Formality**: ${formality === 'formal' ? 'Professional and polished' : 'Friendly and approachable'}
- **Approach**: ${approach === 'technical' ? 'Data-driven and process-focused' : 'Story-based and narrative'}

## Response Guidelines
- Match your formality level: ${formality === 'formal' ? 'Use complete sentences, avoid slang' : 'Conversational but professional'}
- Match your approach: ${approach === 'technical' ? 'Include metrics, processes, and technical details' : 'Tell stories with clear narrative arcs'}
- Draw from your experience level: ${level} with ${experienceYears} years
- Show ownership of your work and impact

${gapsContext}

## Instructions for This Simulation
- You are in TEXT-BASED simulation mode (not voice).
- Respond to each interview question naturally.
- Use the STAR format for behavioral questions (Situation, Task, Action, Result).
- Be authentic - acknowledge limitations honestly but positively.
- Keep responses focused - aim for 2-4 sentences unless asked for detail.

## Response Format
Respond with ONLY your answer. No meta-commentary or "Candidate:" prefix.
Be natural and professional - like a real text chat.`;
}

/**
 * Build a follow-up prompt for continued conversation.
 */
export function buildFollowUpPrompt(
  role: 'interviewer' | 'candidate',
  conversationHistory: string
): string {
  if (role === 'interviewer') {
    return `Previous conversation:
${conversationHistory}

Based on the candidate's last response, either:
1. Ask a brief follow-up for clarification (if the answer was unclear)
2. Move to the next question (if the answer was complete)

Respond with your next question or follow-up only.`;
  }

  return `Previous conversation:
${conversationHistory}

Continue responding as the candidate. Answer the interviewer's question naturally.`;
}