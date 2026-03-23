// System instruction builder for Gemini Live API
// Source: ai.google.dev/gemini-api/docs/prompting-strategies

import { AGENT_DEFINITIONS, DEFAULT_AGENT_ID, type AgentId } from './agents';

export interface PromptContext {
  resume: string;
  jobDescription: string;
  // New field (preferred): agentId for 7 agent personas
  agentId?: AgentId;
  // Legacy field (deprecated): personality for backwards compatibility
  // Maps: warm -> supportive-coach, professional -> hiring-manager,
  //       direct -> high-pressure, coaching -> supportive-coach
  personality?: string;
}

const MAX_CONTEXT_CHARS = 8000;

/**
 * Maps legacy personality keys to new agent IDs for backwards compatibility.
 * This allows the UI to continue using `personality` until it's updated in 05-02.
 */
function mapPersonalityToAgentId(personality: string): AgentId {
  const mapping: Record<string, AgentId> = {
    warm: 'supportive-coach',
    professional: 'hiring-manager',
    direct: 'high-pressure',
    coaching: 'supportive-coach',
  };
  return mapping[personality] || DEFAULT_AGENT_ID;
}

export function buildSystemInstruction(ctx: PromptContext): string {
  // Truncate if exceeds safe limit (~8K chars = ~2K tokens with buffer)
  const resume = ctx.resume.slice(0, MAX_CONTEXT_CHARS);
  const jd = ctx.jobDescription.slice(0, MAX_CONTEXT_CHARS);

  // Support both new agentId and legacy personality for backwards compatibility
  const agentId: AgentId = ctx.agentId ||
    (ctx.personality ? mapPersonalityToAgentId(ctx.personality) : DEFAULT_AGENT_ID);

  const agent = AGENT_DEFINITIONS[agentId];

  return `
<role>
You are an expert career coach and technical interviewer conducting a mock interview.
${agent.persona}
</role>

<context>
<resume>
${resume}
</resume>

<jobDescription>
${jd}
</jobDescription>
</context>

<interview_type>
${agent.interviewType}
</interview_type>

<behaviors>
${agent.coreBehaviors.map((b: string) => `- ${b}`).join('\n')}
</behaviors>

<tone>
${agent.tone}
</tone>

<boundaries>
YOU MUST NOT:
${agent.boundaries.map((b: string) => `- ${b}`).join('\n')}
</boundaries>

<edge_cases>
- Skip request: ${agent.edgeCaseHandling.skipRequest}
- Silence: ${agent.edgeCaseHandling.silence}
- Unclear answer: ${agent.edgeCaseHandling.unclearAnswer}
- Help request: ${agent.edgeCaseHandling.helpRequest}
</edge_cases>

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
- Maintain your persona consistently throughout the interview
</constraints>
`.trim();
}