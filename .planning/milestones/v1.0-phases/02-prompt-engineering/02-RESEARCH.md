# Phase 02: Prompt Engineering - Research

**Researched:** 2026-03-22
**Domain:** Gemini Multimodal Live API context injection and prompt engineering
**Confidence:** HIGH

## Summary

This phase implements dynamic context injection and personality control for the Gemini Live API interviewer. The research reveals that the Gemini Live API accepts `systemInstruction` in the WebSocket setup message, formatted as an object with a `parts` array containing text blocks.

The key implementation pattern: (1) lift resume/JD/personality state to `MyCareerApp.tsx` (already done in Phase 1), (2) pass these values to `InterviewScreen`, (3) construct a dynamic system instruction combining role definition + user context + personality constraints, (4) modify `geminiLiveClient.ts` to accept the instruction as a parameter to `connect()`.

**Primary recommendation:** Build a `buildSystemInstruction()` utility that composes the full prompt from resume, JD, and personality selections, then wire it through the component tree to `geminiLiveClient.connect()`.

<user_constraints>
## User Constraints (from CONTEXT.md)

No CONTEXT.md file exists for this phase. Research proceeds based on REQUIREMENTS.md and ROADMAP.md constraints.

### Locked Decisions (from REQUIREMENTS.md)
- Parent component (`MyCareerApp.tsx`) holds state of Resume, JD, and Personality choice (INTG-01 - already implemented)
- Setup Screen payload passes to `geminiLiveClient.ts` during WebSocket init (INTG-02)
- AI greets user with personalized icebreaker based on resume details (INTG-03)
- AI alters tone based on personality selection: Warm, Professional, Direct, Coaching (INTG-04)

### Deferred Ideas (from REQUIREMENTS.md Out of Scope)
- Multi-modal video support
- Automatic JD fetching from LinkedIn URLs
- v2 features: database storage, PDF score reports
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INTG-01 | Resume, JD, Personality stored in parent state | Already implemented in Phase 1 - `MyCareerApp.tsx` has `interviewData` with all three fields |
| INTG-02 | Values passed to `geminiLiveClient.ts` as system instructions | Modify `connect()` to accept `systemInstruction: string` parameter; construct instruction from resume+JD+personality |
| INTG-03 | AI uses resume/JD for personalized icebreaker greeting | System instruction must include resume/JD text with explicit "open with personalized icebreaker" directive |
| INTG-04 | AI applies personality constraints for tone/style | System instruction must include personality-specific behavioral constraints (warm/encouraging vs direct/challenging) |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Native WebSocket API | Browser native | Gemini Live API connection | Required by Gemini Live API - uses `wss://` protocol |
| `@google/generative-ai` | 0.24.1 | Gemini SDK (non-Live) | Used for debrief generation; Live API uses raw WebSocket |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@google/genai` | 1.46.0 | New unified GenAI SDK | Future migration target - includes `ai.live` submodule, but current app uses raw WebSocket |

**Installation:**
No new dependencies required. Phase uses existing WebSocket infrastructure.

**Version verification:**
```bash
npm view @google/generative-ai version  # Returns: 0.24.1 ✓
npm view @google/genai version          # Returns: 1.46.0 (for reference)
```

**Key insight:** The current implementation uses raw WebSocket connections to the Gemini Live API, which is the correct approach. The `@google/generative-ai` SDK (0.24.1) does not support the Live API - it's used only for debrief generation via standard Gemini API.

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── geminiLiveClient.ts    # Modify: accept systemInstruction in connect()
├── promptBuilder.ts       # NEW: buildSystemInstruction() utility
└── personalities.ts       # NEW: personality constraint definitions

components/
├── MyCareerApp.tsx        # Already holds state (INTG-01 done)
├── SetupScreen.tsx        # Already collects inputs (Phase 1)
└── InterviewScreen.tsx    # Modify: receive props, pass to client
```

### Pattern 1: System Instruction Builder
**What:** A pure function that composes the full system instruction from structured inputs.
**When to use:** Always - keeps prompt logic testable and separate from React components.
**Example:**
```typescript
// Source: ai.google.dev/gemini-api/docs/prompting-strategies
import { PERSONALITY_PRESETS } from './personalities';

export interface PromptContext {
  resume: string;
  jobDescription: string;
  personality: string;  // 'warm' | 'professional' | 'direct' | 'coaching'
}

export function buildSystemInstruction(ctx: PromptContext): string {
  const personality = PERSONALITY_PRESETS[ctx.personality];

  return `
<role>
You are an expert career coach and technical interviewer conducting a mock interview.
Your goal is to help the candidate articulate their unique value proposition.
</role>

<context>
<resume>
${ctx.resume}
</resume>

<jobDescription>
${ctx.jobDescription}
</jobDescription>
</context>

<personality>
${personality.instructions}
</personality>

<opening>
Begin with a warm, personalized icebreaker that references 1-2 specific details
from the candidate's resume (e.g., their current role, a notable achievement,
or a relevant skill). Then ask your first interview question.
</opening>
`.trim();
}
```

### Pattern 2: Personality Constraint Presets
**What:** Predefined behavioral constraint blocks for each personality type.
**When to use:** Map user's personality selection to AI behavioral constraints.
**Example:**
```typescript
// Source: ai.google.dev/gemini-api/docs/prompting-strategies
export const PERSONALITY_PRESETS = {
  warm: {
    label: 'Warm & Encouraging',
    instructions: `
- Tone: Supportive, positive, and encouraging
- Use affirming language ("That's a great example", "Excellent point")
- Frame challenges gently ("What might you approach differently?")
- Celebrate achievements and build confidence
- Avoid harsh criticism or overly direct challenges`
  },
  professional: {
    label: 'Professional & Neutral',
    instructions: `
- Tone: Balanced, objective, and businesslike
- Maintain neutral, professional demeanor
- Ask direct questions without emotional framing
- Provide factual feedback based on responses
- Avoid excessive praise or criticism`
  },
  direct: {
    label: 'Direct & Challenging',
    instructions: `
- Tone: Direct, challenging, and provocative
- Push candidate to defend their choices
- Ask tough follow-up questions ("Why did you do it that way?")
- Point out gaps or weaknesses constructively but bluntly
- Simulate high-pressure interview environment`
  },
  coaching: {
    label: 'Coaching-Focused',
    instructions: `
- Tone: Educational, growth-oriented, and patient
- After each answer, offer one specific improvement suggestion
- Help candidate reframe weak answers more strongly
- Teach interview techniques throughout the session
- Balance questioning with skill-building`
  }
} as const;
```

### Pattern 3: WebSocket Setup with Dynamic Context
**What:** Modify Gemini client to accept system instruction at connection time.
**When to use:** When establishing Live API session with user-specific context.
**Example:**
```typescript
// Source: ai.google.dev/gemini-api/docs/live-api/get-started-websocket
// Current implementation in geminiLiveClient.ts - line 20-37
connect(systemInstruction: string) {
  const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
  this.ws = new WebSocket(url);

  this.ws.onopen = () => {
    console.log('Gemini Live connected');
    const config = {
      setup: {
        model: `models/${this.model}`,
        generation_config: {
          response_modalities: ["AUDIO"],
        },
        system_instruction: {
          parts: [{ text: systemInstruction }]
        }
      }
    };
    this.ws?.send(JSON.stringify(config));
  };
  // ... rest of handlers
}
```

### Anti-Patterns to Avoid
- **String concatenation without delimiters:** Don't just concatenate resume + JD without XML tags - the model may confuse context with instructions
- **Truncating context silently:** If resume exceeds token limits, truncate with awareness and inform user
- **Hardcoding personality text inline:** Use presets module for maintainability
- **Passing personality as string only:** Include the full constraint block, not just "warm" or "professional"

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token counting for context | Custom tokenizer or manual character counting | Estimate with 4 chars/token ratio, or use `tiktoken` if precision needed | Gemini handles context window automatically; manual counting is error-prone |
| Prompt template engine | Custom template parsing library | Simple template literals with XML delimiters | Over-engineering; template literals are sufficient for 4 context sections |
| Personality state machine | Complex runtime personality switching | Static system instruction at connect time | Live API doesn't support mid-session system instruction changes; set once at start |
| Icebreaker detection logic | Regex or NLP to detect "icebreaker complete" | Trust the model to follow instructions | Adding detection logic adds complexity; model will naturally transition after opening |

**Key insight:** The Gemini Live API is stateful - system instructions are sent once at WebSocket setup and persist for the session. Don't try to dynamically change personality mid-session; instead, encode all behavioral constraints upfront.

## Runtime State Inventory

Not applicable - this is not a rename/refactor/migration phase.

## Common Pitfalls

### Pitfall 1: Token Limit Overflow
**What goes wrong:** Resume + JD + system prompt exceeds model's context window, causing truncation or errors.
**Why it happens:** Large resumes (2+ pages) + detailed JDs can easily exceed 10K tokens.
**How to avoid:**
- Implement basic truncation: `resume.slice(0, 8000)` for ~2K tokens reserve
- Show user warning if context exceeds threshold
- Consider summarizing JD to key requirements only
**Warning signs:** API returns 400 error with "context window exceeded" or similar.

### Pitfall 2: Personality Bleed
**What goes wrong:** AI doesn't maintain consistent personality throughout session.
**Why it happens:** Personality constraints not specific enough, or conflicting instructions in prompt.
**How to avoid:**
- Use explicit, detailed constraint blocks (see Pattern 2)
- Place personality constraints in dedicated `<personality>` section
- Include negative constraints ("Avoid harsh criticism" for warm mode)
**Warning signs:** Warm personality becomes critical, or direct personality becomes too soft.

### Pitfall 3: Generic Icebreaker
**What goes wrong:** AI opens with "Tell me about yourself" instead of personalized greeting.
**Why it happens:** System instruction doesn't explicitly require resume-specific references.
**How to avoid:**
- Explicit instruction: "Begin with a warm, personalized icebreaker that references 1-2 specific details from the candidate's resume"
- Provide examples in the prompt
- Place icebreaker instruction in dedicated `<opening>` section
**Warning signs:** First AI message is generic interview opener.

### Pitfall 4: Context Confusion
**What goes wrong:** AI confuses resume content with JD requirements, or hallucinates details.
**Why it happens:** Resume and JD not clearly delimited in the prompt.
**How to avoid:**
- Use XML-style delimiters: `<resume>...</resume>`, `<jobDescription>...</jobDescription>`
- Add explicit instruction: "Distinguish between the candidate's background (resume) and the role requirements (JD)"
**Warning signs:** AI attributes JD requirements to candidate's experience or vice versa.

## Code Examples

Verified patterns from official sources:

### Build System Instruction Utility
```typescript
// lib/promptBuilder.ts
// Source: ai.google.dev/gemini-api/docs/prompting-strategies

import { PERSONALITY_PRESETS } from './personalities';

export interface PromptContext {
  resume: string;
  jobDescription: string;
  personality: 'warm' | 'professional' | 'direct' | 'coaching';
}

export function buildSystemInstruction(ctx: PromptContext): string {
  const personality = PERSONALITY_PRESETS[ctx.personality];

  // Truncate if exceeds safe limit (~8K chars = ~2K tokens with buffer)
  const MAX_CONTEXT_CHARS = 8000;
  const resume = ctx.resume.slice(0, MAX_CONTEXT_CHARS);
  const jd = ctx.jobDescription.slice(0, MAX_CONTEXT_CHARS);

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
```

### Personality Presets Module
```typescript
// lib/personalities.ts
// Source: ai.google.dev/gemini-api/docs/prompting-strategies

export const PERSONALITY_PRESETS = {
  warm: {
    label: 'Warm & Encouraging',
    instructions: `Tone: Supportive, positive, and encouraging. Use affirming language like "That's a great example" or "Excellent point." Frame challenges gently with phrases like "What might you approach differently?" Celebrate achievements and build candidate confidence. Avoid harsh criticism or overly direct challenges.`
  },
  professional: {
    label: 'Professional & Neutral',
    instructions: `Tone: Balanced, objective, and businesslike. Maintain neutral, professional demeanor throughout. Ask direct questions without emotional framing. Provide factual feedback based on responses. Avoid excessive praise or criticism. Focus on gathering clear information about candidate's experience.`
  },
  direct: {
    label: 'Direct & Challenging',
    instructions: `Tone: Direct, challenging, and provocative. Push candidate to defend their choices with follow-ups like "Why did you do it that way instead of X?" Point out gaps or weaknesses constructively but bluntly. Simulate a high-pressure technical interview environment. Don't let weak answers go unexamined.`
  },
  coaching: {
    label: 'Coaching-Focused',
    instructions: `Tone: Educational, growth-oriented, and patient. After each candidate answer, offer one specific improvement suggestion. Help candidate reframe weak answers more strongly ("A stronger way to present that might be..."). Teach interview techniques throughout the session. Balance questioning with skill-building.`
  }
} as const;

export type PersonalityKey = keyof typeof PERSONALITY_PRESETS;
```

### Modified InterviewScreen Integration
```typescript
// components/InterviewScreen.tsx
// Modified to accept context props and use dynamic system instruction

interface InterviewScreenProps {
  duration: number;
  onFinish: (transcript: string[], report: any) => void;
  resume: string;        // NEW
  jobDescription: string; // NEW
  personality: string;    // NEW
}

export default function InterviewScreen({
  duration,
  onFinish,
  resume,              // NEW
  jobDescription,      // NEW
  personality          // NEW
}: InterviewScreenProps) {

  useEffect(() => {
    // ... existing setup ...

    // NEW: Build dynamic system instruction
    const systemInstruction = buildSystemInstruction({
      resume,
      jobDescription,
      personality: personality as 'warm' | 'professional' | 'direct' | 'coaching'
    });

    clientRef.current.connect(systemInstruction); // NEW: pass instruction

    // ... rest of effect
  }, [resume, jobDescription, personality]); // NEW: dependencies
}
```

### Modified MyCareerApp Wiring
```typescript
// components/MyCareerApp.tsx
// Pass context props to InterviewScreen (already has state from Phase 1)

{step === 'interview' && (
  <InterviewScreen
    duration={interviewData.duration}
    onFinish={handleFinishInterview}
    resume={interviewData.resume}           // NEW
    jobDescription={interviewData.jobDescription} // NEW
    personality={interviewData.personality} // NEW
  />
)}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static system prompt | Dynamic context injection | 2025 (Gemini Live API) | Personalized, adaptive interviews |
| Raw string concatenation | XML-delimited structured context | 2025 (prompt engineering best practices) | Clearer context separation, fewer hallucinations |
| Personality as single word | Full constraint block injection | 2025 (persona prompting) | Consistent tone throughout session |
| Generic icebreaker | Resume-specific opening | 2025 (context-grounded prompting) | Personalized candidate experience |

**Deprecated/outdated:**
- Mid-session personality switching via follow-up messages: Live API now uses setup-time system instructions only
- Using `@google/generative-ai` SDK for Live API: Raw WebSocket required for Live API; SDK only for standard generation

## Open Questions

1. **Token limit handling**
   - What we know: Gemini 2.5 Flash has large context window (1M+ tokens), but setup message size may have limits
   - What's unclear: Exact character/token limits for `system_instruction` in WebSocket setup
   - Recommendation: Implement conservative truncation (8K chars each for resume/JD) and add user warning if exceeded

2. **Icebreaker enforcement**
   - What we know: Prompt can instruct model to open with personalized greeting
   - What's unclear: How to verify/handle cases where model ignores icebreaker instruction
   - Recommendation: Start with explicit prompting; add client-side validation in Phase 3 if needed

3. **Voice selection**
   - What we know: Gemini Live API supports voice configuration in `generation_config`
   - What's unclear: Whether voice should be tied to personality (e.g., warm = softer voice)
   - Recommendation: Out of scope for Phase 2; defer to future phase

## Validation Architecture

*Skipped - `nyquist_validation` is explicitly set to `false` in `.planning/config.json`.*

## Sources

### Primary (HIGH confidence)
- [Gemini Live API WebSocket Guide](https://ai.google.dev/gemini-api/docs/live-api/get-started-websocket) - WebSocket setup message format, `systemInstruction` structure with `parts` array
- [Gemini Prompting Strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies) - Role definition, context delimiters, personality constraints, verbosity control
- [Gemini Live API Overview](https://ai.google.dev/gemini-api/docs/multimodal-live) - Live API capabilities, use cases for personalization

### Secondary (MEDIUM confidence)
- Current codebase: `geminiLiveClient.ts` lines 20-37 - Existing WebSocket setup pattern (already sends `system_instruction`)
- Current codebase: `MyCareerApp.tsx` lines 19-22, 85-95 - State structure for resume/JD/personality (Phase 1 implementation)
- npm registry: `@google/generative-ai` v0.24.1 - Confirmed current version in use

### Tertiary (LOW confidence)
- GitHub search results for Gemini Live API examples - Limited public examples available; official docs are primary source
- Web search for prompt engineering patterns - General best practices, not Gemini-specific

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified via npm registry and official docs
- Architecture: HIGH - Based on official Gemini Live API documentation and existing codebase patterns
- Pitfalls: MEDIUM - Based on general prompt engineering principles and logical inference; specific Live API pitfalls not extensively documented

**Research date:** 2026-03-22
**Valid until:** 30 days (Gemini API is stable; prompt engineering patterns well-established)
