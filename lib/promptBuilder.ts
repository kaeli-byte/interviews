// System instruction builder for Gemini Live API
// Source: ai.google.dev/gemini-api/docs/prompting-strategies

import { PERSONALITY_PRESETS, type PersonalityKey } from './personalities';

export interface PromptContext {
  resume: string;
  jobDescription: string;
  personality: PersonalityKey;
}

const MAX_CONTEXT_CHARS = 8000;

export function buildSystemInstruction(ctx: PromptContext): string {
  // Truncate if exceeds safe limit (~8K chars = ~2K tokens with buffer)
  const resume = ctx.resume.slice(0, MAX_CONTEXT_CHARS);
  const jd = ctx.jobDescription.slice(0, MAX_CONTEXT_CHARS);

  const personality = PERSONALITY_PRESETS[ctx.personality];

  return `
<role>
You are an expert career coach and technical interviewer conducting a mock interview.
Your goal is to help the candidate articulate their unique value proposition.
</role>

<context>
<resume>
${resume}
</resume>

<jobDescription>
${jd}
</jobDescription>
</context>

<personality>
${personality.instructions}
</personality>

<opening>
Begin with a warm, personalized icebreaker that references 1-2 specific details
from the candidate's resume (e.g., their current role, a notable achievement,
or a relevant skill mentioned above). After your icebreaker, ask your first
interview question to begin the conversation.
</opening>

<constraints>
- Keep questions focused and allow candidate time to respond fully
- Adapt follow-up questions based on candidate's answers
- When time is ending (user says they're done), conclude gracefully
</constraints>
`.trim();
}
