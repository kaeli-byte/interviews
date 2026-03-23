# Stack Research

**Domain:** Multi-agent interview system with transcript-based STAR evaluation
**Researched:** 2026-03-23
**Confidence:** HIGH

## Recommended Stack

### Core Technologies (Already Validated - No Changes)

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.0 | App Router framework | Already validated in v1.0/v2.0 |
| React | 19.2.4 | UI library | Already validated in v1.0/v2.0 |
| TypeScript | 5.x | Type safety | Already validated in v1.0/v2.0 |
| @google/generative-ai | ^0.24.1 | Gemini API client | Already integrated for Gemini Live + debrief generation |
| Tailwind CSS | 4.x | Styling | Already validated in v1.0/v2.0 |
| Base UI | ^1.3.0 | UI primitives | Already validated in v1.0/v2.0 |
| Vitest | ^4.1.0 | Testing | Already validated in v1.0/v2.0 |

### New Additions Required

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| **zod** | ^4.0.0 | Schema definition and validation | Native JSON Schema conversion for Gemini structured output. Zod v4 has built-in `z.toJSONSchema()` eliminating need for deprecated `zod-to-json-schema`. Enables type-safe STAR evaluation schemas with runtime validation. |

### No Additional Libraries Needed For

| Capability | Rationale |
|------------|-----------|
| Agent persona storage | Pure TypeScript data structures in `lib/agents.ts` (extends existing `lib/personalities.ts` pattern). 7 agents = static config objects with prompt templates. |
| Transcript capture | Already implemented in `geminiLiveClient.ts` via `onTranscript` callback returning `TranscriptEntry[]`. |
| Transcript storage | In-memory during interview session. Persistence out of scope for this milestone (future milestone). |
| STAR evaluation | Use Gemini's `responseMimeType: "application/json"` with `responseJsonSchema` from Zod schema. No new library needed. |
| Pattern detection | Multi-pass Gemini API calls with structured output. Analysis layer is prompt engineering, not a library. |
| Coaching insights | Same approach - structured JSON output via Gemini API with Zod validation. |

## Installation

```bash
# New dependency (only addition)
npm install zod

# Already installed (no changes needed)
# @google/generative-ai ^0.24.1
# next 16.2.0
# react 19.2.4
# typescript 5.x
# tailwindcss 4.x
# @base-ui/react ^1.3.0
# framer-motion ^12.38.0
# lucide-react ^0.577.0
# vitest ^4.1.0
```

## Integration Points

### 1. Zod for STAR Evaluation Schema

**File:** `lib/schemas/starEvaluation.ts`

```typescript
import { z } from 'zod';

// STAR component evaluation
export const StarComponentSchema = z.object({
  present: z.boolean().describe("Whether this STAR component was addressed"),
  quality: z.enum(["missing", "weak", "adequate", "strong"]).describe("Quality of the response for this component"),
  excerpt: z.string().optional().describe("Relevant quote from transcript"),
  feedback: z.string().describe("Specific feedback for improvement")
});

// Single answer evaluation
export const StarEvaluationSchema = z.object({
  questionIndex: z.number(),
  questionText: z.string(),
  situation: StarComponentSchema,
  task: StarComponentSchema,
  action: StarComponentSchema,
  result: StarComponentSchema,
  overallScore: z.number().min(0).max(100),
  summaryFeedback: z.string()
});

// Convert to JSON Schema for Gemini API
export const starEvaluationJsonSchema = z.toJSONSchema(StarEvaluationSchema);
```

### 2. Agent Persona Config Structure

**File:** `lib/agents.ts`

```typescript
export const AGENT_PRESETS = {
  hiringManager: {
    id: 'hiringManager',
    label: 'Realistic Hiring Manager',
    description: 'Professional, structured interview simulation',
    duration: { min: 15, max: 20, unit: 'minutes' },
    tone: 'professional',
    probingStyle: 'clarifying',
    feedbackStyle: 'deferred',
    systemInstructionTemplate: `...`
  },
  // ... 6 more agents
} as const;
```

### 3. Transcript-Based Debrief Generator

**File:** `lib/debriefGenerator.ts` (enhance existing)

```typescript
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Schema for structured debrief output
const DebriefReportSchema = z.object({
  overallScore: z.number(),
  starEvaluations: z.array(StarEvaluationSchema),
  patterns: z.object({
    positive: z.array(z.string()),
    attention: z.array(z.string())
  }),
  coachingInsights: z.array(z.object({
    priority: z.enum(['high', 'medium', 'low']),
    area: z.string(),
    action: z.string()
  }))
});

// Use with Gemini
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
  generationConfig: {
    responseMimeType: "application/json",
    responseJsonSchema: z.toJSONSchema(DebriefReportSchema)
  }
});
```

### 4. Gemini Structured Output Pattern

**Integration with existing @google/generative-ai:**

The existing `debriefGenerator.ts` uses `gemini-2.0-flash` with text output and manual JSON parsing. Enhance to:

1. Define Zod schema for expected output
2. Pass `responseJsonSchema` in generation config
3. Validate parsed result with Zod

```typescript
const result = await model.generateContent(prompt);
const parsed = DebriefReportSchema.parse(JSON.parse(result.response.text()));
```

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Zod v4 | zod-to-json-schema | Deprecated as of Nov 2025. Zod v4 has native `z.toJSONSchema()`. |
| Zod v4 | io-ts | Heavier, more complex API. Zod is simpler for this use case. |
| Zod v4 | yup | No native JSON Schema conversion. Would need separate library. |
| Gemini structured output | LangChain | Adds unnecessary abstraction. Direct Gemini API is sufficient for single-model use case. |
| Gemini structured output | Custom prompt parsing | Less reliable. Structured output guarantees valid JSON syntax. |
| In-memory transcript | IndexedDB/localStorage | Premature optimization. Session-scoped storage is sufficient for this milestone. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| zod-to-json-schema | Deprecated Nov 2025, Zod v4 has built-in support | Zod v4's `z.toJSONSchema()` |
| LocalStorage for transcript | Session-scoped, no persistence requirement | In-memory `TranscriptEntry[]` |
| Database layer | Out of scope for this milestone (future milestone) | State in React component |
| LangChain / AI SDK | Overkill for single-provider, single-model use case | Direct @google/generative-ai |
| Server-side debrief generation | Transcript is client-side, adds latency | Client-side generation (existing pattern) |

## Stack Patterns by Variant

**For STAR Evaluation:**
- Use Zod schema with `z.toJSONSchema()` for Gemini `responseJsonSchema`
- Validate with `Schema.parse()` before using in UI
- Wrap generation in try/catch with fallback display

**For Agent Personas:**
- Extend existing `personalities.ts` pattern with richer metadata
- Keep as static TypeScript objects (no database needed)
- Use discriminated union type for type safety

**For Pattern Detection:**
- Multi-pass Gemini API: one call per question for STAR, one aggregate call for patterns
- Use structured output for both passes
- Combine results in final `DebriefReport`

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| zod@4.x | @google/generative-ai@0.24.x | JSON Schema output works with Gemini's `responseJsonSchema` |
| zod@4.x | TypeScript 5.x | Full type inference |
| gemini-2.0-flash | structured output | Supports `responseMimeType: "application/json"` |
| gemini-2.5-flash-native-audio-latest | Gemini Live | Used for real-time interview (existing) |

## Sources

- [Google AI - Structured Output](https://ai.google.dev/gemini-api/docs/structured-output) - JSON schema support, Zod integration (HIGH confidence)
- [Zod Documentation](https://zod.dev/) - Native JSON Schema conversion in v4 (HIGH confidence)
- [zod-to-json-schema GitHub](https://github.com/StefanTerdell/zod-to-json-schema) - Deprecation notice, migration path (HIGH confidence)
- Existing codebase analysis - `geminiLiveClient.ts`, `debriefGenerator.ts`, `personalities.ts`, `types.ts` (HIGH confidence)

---

*Stack research for: MyCareer v3.0 Agent System & Smart Debrief*
*Researched: 2026-03-23*