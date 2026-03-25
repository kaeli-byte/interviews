# Architecture Patterns: Multi-Agent Interview System with Transcript-Based Debrief

**Project:** MyCareer App v3.0
**Researched:** 2026-03-23
**Confidence:** HIGH (based on direct codebase analysis)

## Executive Summary

The v3.0 milestone requires integrating 7 distinct agent personas and a transcript-based STAR debrief system into an existing real-time voice interview architecture. The current system already captures `TranscriptEntry[]` during interviews via Gemini Live's native transcription callbacks. The key architectural changes are: (1) extending the personality system to support richer agent definitions, (2) replacing the resume/JD-based debrief with a transcript-based STAR evaluation pipeline, and (3) adding pattern detection and coaching insights layers.

## Current Architecture (Preserved)

```
+-----------------------------------------------------------------------------+
|                              MyCareerApp                                     |
|  [state: resume, jd, personality, duration, transcript, report]              |
+-----------------------------------------------------------------------------+
         |                    |                      |
         v                    v                      v
   +-----------+       +--------------+       +--------------+
   |SetupScreen|       |InterviewScreen|      |DebriefScreen |
   |           |       |              |       |              |
   | - duration|       | - GeminiClient|      | - report     |
   | - resume  |       | - AudioRecorder|     | - transcript |
   | - jd      |       | - AudioStreamer|     |              |
   | - persona |       | - transcript[]|      |              |
   +-----------+       +--------------+       +--------------+
                              |
                    +---------+---------+
                    v                   v
           +----------------+   +----------------+
           | GeminiLiveClient|   | buildSystemInst|
           | (WebSocket)     |   | (promptBuilder)|
           +----------------+   +----------------+
```

### Existing Data Flow

1. **Setup Phase**: User enters resume, JD, selects personality (4 presets), sets duration
2. **Interview Phase**: `buildSystemInstruction()` creates prompt from resume/JD/personality -> GeminiLiveClient connects -> Audio flows bidirectionally -> Transcription captured in `TranscriptEntry[]`
3. **Debrief Phase**: Legacy transcript (`string[]` format) passed to `generateDebrief()` -> Gemini generates simple report

### Existing Types

```typescript
// lib/types.ts
interface TranscriptEntry {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: number; // milliseconds from interview start
}

// lib/promptBuilder.ts
interface PromptContext {
  resume: string;
  jobDescription: string;
  personality: PersonalityKey; // 'warm' | 'professional' | 'direct' | 'coaching'
}

// lib/personalities.ts
const PERSONALITY_PRESETS = {
  [key]: { label: string; instructions: string }
}
```

---

## Recommended Architecture for v3.0

### High-Level Changes

| Component | Current | v3.0 Change |
|-----------|---------|-------------|
| `lib/personalities.ts` | 4 simple presets | Replace with `lib/agents.ts` - 7 rich agent definitions |
| `lib/promptBuilder.ts` | Uses resume/JD/personality | Extend to use `AgentDefinition` with constraints |
| `lib/debriefGenerator.ts` | Simple report from transcript strings | Replace with STAR evaluation pipeline |
| `lib/types.ts` | `TranscriptEntry` only | Add `AgentDefinition`, `STARAnalysis`, `DebriefReport` |
| `components/SetupScreen.tsx` | 4 personality cards | 7 agent cards with detailed descriptions |
| `components/DebriefScreen.tsx` | Simple report display | Enhanced with STAR sections, patterns, coaching |

### New Component Architecture

```
+-----------------------------------------------------------------------------+
|                              MyCareerApp                                     |
|  [state: resume, jd, selectedAgent, duration, transcript, debriefReport]    |
+-----------------------------------------------------------------------------+
         |                    |                      |
         v                    v                      v
   +-----------+       +--------------+       +--------------+
   |SetupScreen|       |InterviewScreen|      |DebriefScreen |
   |           |       |              |       |              |
   | - AgentSel|       | - GeminiClient|      | - STARSection|
   |   (7 cards)|       | - transcript[]|      | - Patterns   |
   +-----------+       +--------------+       | - Coaching   |
         |                    |               +--------------+
         |                    |                      ^
         v                    v                      |
   +-------------+     +----------------+    +----------------+
   | lib/agents  |     | lib/debriefGen |<---| TranscriptEntry|
   | (7 defs)    |     | (STAR pipeline)|    | [] (enhanced)  |
   +-------------+     +----------------+    +----------------+
```

---

## Component Specifications

### 1. Agent Definitions (`lib/agents.ts`) - NEW FILE

**Purpose:** Define 7 distinct agent personas with unique behaviors, constraints, and interview styles.

**Location:** `lib/agents.ts` (replaces `lib/personalities.ts`)

**Structure:**

```typescript
// lib/agents.ts
export interface AgentDefinition {
  id: AgentId;
  label: string;
  description: string;        // Short description for card
  instructions: string;       // Full prompt injection
  duration: { min: number; max: number }; // Recommended duration range
  icon: LucideIcon;           // UI icon
  focusAreas: string[];       // What this agent evaluates
  tone: 'supportive' | 'neutral' | 'challenging' | 'analytical';
}

export type AgentId =
  | 'hiring-manager'
  | 'high-pressure'
  | 'supportive-coach'
  | 'rapid-fire'
  | 'story-architect'
  | 'efficiency-screener'
  | 'behavioral-analyst';

export const AGENT_DEFINITIONS: Record<AgentId, AgentDefinition> = {
  'hiring-manager': {
    id: 'hiring-manager',
    label: 'Realistic Hiring Manager',
    description: 'Professional, structured, simulates actual interview',
    instructions: `...`, // ~500-800 chars of prompt
    duration: { min: 15, max: 20 },
    icon: Briefcase,
    focusAreas: ['leadership', 'technical depth', 'culture fit'],
    tone: 'neutral',
  },
  // ... 6 more agents
};
```

**Why this structure:**
- `instructions` is the prompt fragment injected into `buildSystemInstruction()`
- `duration` range helps UI show recommendations
- `focusAreas` used by debrief generator to weight evaluation
- `tone` helps debrief calibrate feedback intensity

### 2. Enhanced Prompt Builder (`lib/promptBuilder.ts`) - MODIFY

**Current approach:** Simple string template with XML delimiters.

**Changes needed:**

```typescript
// lib/promptBuilder.ts
import { AgentDefinition, AGENT_DEFINITIONS, AgentId } from './agents';

export interface PromptContext {
  resume: string;
  jobDescription: string;
  agentId: AgentId;  // Changed from 'personality'
}

export function buildSystemInstruction(ctx: PromptContext): string {
  const agent = AGENT_DEFINITIONS[ctx.agentId];

  return `
<role>
You are an expert career coach and technical interviewer conducting a mock interview.
${agent.instructions}
</role>

<context>
<resume>
${ctx.resume.slice(0, MAX_CONTEXT_CHARS)}
</resume>

<jobDescription>
${ctx.jobDescription.slice(0, MAX_CONTEXT_CHARS)}
</jobDescription>
</context>

<constraints>
- Interview duration target: ${agent.duration.min}-${agent.duration.max} minutes
- Focus areas: ${agent.focusAreas.join(', ')}
- Maintain ${agent.tone} tone throughout
- Keep questions focused and allow candidate time to respond fully
- Adapt follow-up questions based on candidate's answers
</constraints>

<opening>
Begin with a warm, personalized icebreaker referencing 1-2 specific details from the resume...
</opening>
`.trim();
}
```

### 3. Enhanced Transcript Types (`lib/types.ts`) - MODIFY

**Current:** Basic `TranscriptEntry`.

**Add:**

```typescript
// lib/types.ts

// Enhanced transcript entry (keep existing, add question tracking)
export interface TranscriptEntry {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: number;
  questionId?: string;  // NEW: Links candidate answer to interviewer question
}

// NEW: Question-Answer pair for STAR analysis
export interface QAExchange {
  id: string;
  question: TranscriptEntry;
  answer: TranscriptEntry;
  followUps: TranscriptEntry[];
}

// NEW: STAR analysis result
export interface STARAnalysis {
  questionId: string;
  questionText: string;
  answerText: string;
  starComponents: {
    situation: { score: number; feedback: string };
    task: { score: number; feedback: string };
    action: { score: number; feedback: string };
    result: { score: number; feedback: string };
  };
  overallScore: number; // 0-100
  improvementTips: string[];
}

// NEW: Pattern detection result
export interface BehavioralPattern {
  type: 'positive' | 'attention';
  title: string;
  description: string;
  occurrences: number;
  examples: string[]; // Transcript excerpts
}

// NEW: Full debrief report
export interface DebriefReport {
  overallScore: number;
  starAnalyses: STARAnalysis[];
  patterns: BehavioralPattern[];
  coachingInsights: {
    strengths: string[];
    priorities: string[];
    practicePrompts: string[];
  };
  agentContext: {
    id: AgentId;
    focusAreasEvaluated: string[];
  };
  metadata: {
    duration: number;
    questionCount: number;
    transcriptLength: number;
  };
}
```

### 4. Transcript Processing (`lib/transcriptProcessor.ts`) - NEW FILE

**Purpose:** Convert raw `TranscriptEntry[]` into structured `QAExchange[]` for analysis.

**Location:** `lib/transcriptProcessor.ts`

**Logic:**

```typescript
// lib/transcriptProcessor.ts
import { TranscriptEntry, QAExchange } from './types';

export function processTranscript(entries: TranscriptEntry[]): QAExchange[] {
  const exchanges: QAExchange[] = [];
  let currentQuestion: TranscriptEntry | null = null;
  let currentAnswer: TranscriptEntry | null = null;
  let followUps: TranscriptEntry[] = [];

  for (const entry of entries) {
    if (entry.speaker === 'interviewer') {
      if (currentQuestion && currentAnswer) {
        // Save completed exchange
        exchanges.push({
          id: generateId(),
          question: currentQuestion,
          answer: currentAnswer,
          followUps: [...followUps],
        });
      }
      currentQuestion = entry;
      currentAnswer = null;
      followUps = [];
    } else {
      if (!currentAnswer) {
        currentAnswer = entry;
      } else {
        // Concat multi-part answers
        currentAnswer = {
          ...currentAnswer,
          text: currentAnswer.text + ' ' + entry.text,
        };
      }
    }
  }

  // Don't forget last exchange
  if (currentQuestion && currentAnswer) {
    exchanges.push({
      id: generateId(),
      question: currentQuestion,
      answer: currentAnswer,
      followUps,
    });
  }

  return exchanges;
}
```

### 5. STAR Evaluator (`lib/starEvaluator.ts`) - NEW FILE

**Purpose:** Evaluate each QA exchange using STAR methodology via Gemini API.

**Location:** `lib/starEvaluator.ts`

**Approach:** Use Gemini 2.0 Flash (not Live API) for structured JSON output.

```typescript
// lib/starEvaluator.ts
import { GoogleGenerativeAI } from '@google/generative-ai';
import { QAExchange, STARAnalysis } from './types';

export async function evaluateSTAR(exchange: QAExchange): Promise<STARAnalysis> {
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
Analyze this interview Q&A using the STAR method (Situation, Task, Action, Result).

Question: "${exchange.question.text}"
Answer: "${exchange.answer.text}"

Rate each STAR component 0-100 and provide brief feedback.
Return JSON:
{
  "starComponents": {
    "situation": { "score": number, "feedback": "string" },
    "task": { "score": number, "feedback": "string" },
    "action": { "score": number, "feedback": "string" },
    "result": { "score": number, "feedback": "string" }
  },
  "overallScore": number,
  "improvementTips": ["string", ...]
}
`;

  const result = await model.generateContent(prompt);
  const json = JSON.parse(extractJSON(result.response.text()));

  return {
    questionId: exchange.id,
    questionText: exchange.question.text,
    answerText: exchange.answer.text,
    ...json,
  };
}
```

### 6. Pattern Detector (`lib/patternDetector.ts`) - NEW FILE

**Purpose:** Detect behavioral patterns across the full transcript.

**Location:** `lib/patternDetector.ts`

**Patterns to detect:**

| Pattern | Type | Detection Signal |
|---------|------|------------------|
| Strong Metrics Usage | positive | Numbers, percentages, "$" in answers |
| Vague Language | attention | "basically", "kind of", "sort of", "stuff" |
| STAR Compliance | positive | Complete S-T-A-R sequences |
| Missing Results | attention | Action without quantified outcome |
| Confidence Markers | positive | "I led", "I achieved", "I delivered" |
| Hedging Language | attention | "I think maybe", "sort of tried to" |
| Repetition | attention | Same story used multiple times |

**Implementation:**

```typescript
// lib/patternDetector.ts
import { TranscriptEntry, BehavioralPattern, QAExchange } from './types';

const POSITIVE_PATTERNS = [
  { regex: /\b(\d+%|\$\d+|increased|decreased|improved|delivered|led|achieved)\b/gi,
    name: 'Strong Metrics Usage', description: 'Uses quantifiable achievements' },
  { regex: /\b(I led|I delivered|I achieved|I managed|I drove)\b/gi,
    name: 'Confident Ownership', description: 'Takes clear ownership of results' },
];

const ATTENTION_PATTERNS = [
  { regex: /\b(basically|kind of|sort of|stuff|things|whatever)\b/gi,
    name: 'Vague Language', description: 'Uses imprecise filler words' },
  { regex: /\b(I think maybe|sort of tried|kind of attempted)\b/gi,
    name: 'Hedging Language', description: 'Undermines own accomplishments' },
];

export function detectPatterns(exchanges: QAExchange[]): BehavioralPattern[] {
  const patterns: BehavioralPattern[] = [];
  const allText = exchanges.map(e => e.answer.text).join(' ');

  for (const pattern of POSITIVE_PATTERNS) {
    const matches = allText.match(pattern.regex) || [];
    if (matches.length >= 2) {
      patterns.push({
        type: 'positive',
        title: pattern.name,
        description: pattern.description,
        occurrences: matches.length,
        examples: matches.slice(0, 3),
      });
    }
  }

  for (const pattern of ATTENTION_PATTERNS) {
    const matches = allText.match(pattern.regex) || [];
    if (matches.length >= 2) {
      patterns.push({
        type: 'attention',
        title: pattern.name,
        description: pattern.description,
        occurrences: matches.length,
        examples: matches.slice(0, 3),
      });
    }
  }

  return patterns;
}
```

### 7. Debrief Generator (`lib/debriefGenerator.ts`) - REWRITE

**Current:** Simple single-call to Gemini with transcript strings.

**New:** Pipeline approach with multiple analysis stages.

```typescript
// lib/debriefGenerator.ts
import { TranscriptEntry, DebriefReport, QAExchange } from './types';
import { processTranscript } from './transcriptProcessor';
import { evaluateSTAR } from './starEvaluator';
import { detectPatterns } from './patternDetector';
import { AgentId, AGENT_DEFINITIONS } from './agents';

export async function generateDebrief(
  transcript: TranscriptEntry[],
  agentId: AgentId,
  duration: number
): Promise<DebriefReport> {
  // Step 1: Process transcript into Q&A exchanges
  const exchanges = processTranscript(transcript);

  // Step 2: Evaluate each exchange with STAR
  const starAnalyses = await Promise.all(
    exchanges.map(ex => evaluateSTAR(ex))
  );

  // Step 3: Detect behavioral patterns
  const patterns = detectPatterns(exchanges);

  // Step 4: Calculate overall score
  const overallScore = Math.round(
    starAnalyses.reduce((sum, a) => sum + a.overallScore, 0) / starAnalyses.length
  );

  // Step 5: Generate coaching insights
  const coachingInsights = generateCoachingInsights(starAnalyses, patterns);

  return {
    overallScore,
    starAnalyses,
    patterns,
    coachingInsights,
    agentContext: {
      id: agentId,
      focusAreasEvaluated: AGENT_DEFINITIONS[agentId].focusAreas,
    },
    metadata: {
      duration,
      questionCount: exchanges.length,
      transcriptLength: transcript.length,
    },
  };
}

function generateCoachingInsights(
  analyses: STARAnalysis[],
  patterns: BehavioralPattern[]
): DebriefReport['coachingInsights'] {
  // Identify top strengths from high-scoring STAR components
  const strengths: string[] = [];
  const priorities: string[] = [];

  // Average component scores
  const avgSituation = avg(analyses.map(a => a.starComponents.situation.score));
  const avgTask = avg(analyses.map(a => a.starComponents.task.score));
  const avgAction = avg(analyses.map(a => a.starComponents.action.score));
  const avgResult = avg(analyses.map(a => a.starComponents.result.score));

  // Identify lowest component as priority
  const components = [
    { name: 'Situation', score: avgSituation },
    { name: 'Task', score: avgTask },
    { name: 'Action', score: avgAction },
    { name: 'Result', score: avgResult },
  ];

  const lowest = components.sort((a, b) => a.score - b.score)[0];
  priorities.push(`Focus on improving ${lowest.name} components in your answers`);

  // Extract from positive patterns
  for (const p of patterns.filter(p => p.type === 'positive')) {
    strengths.push(p.description);
  }

  // Generate practice prompts
  const practicePrompts = analyses
    .filter(a => a.overallScore < 70)
    .slice(0, 3)
    .map(a => `Practice answering: "${a.questionText.slice(0, 50)}..."`);

  return { strengths, priorities, practicePrompts };
}
```

---

## Data Flow Changes

### Before (v2.0)

```
SetupScreen -> MyCareerApp state -> InterviewScreen
                                     |
                        GeminiLiveClient.onTranscript()
                                     |
                        TranscriptEntry[] (captured)
                                     |
                        onFinish() -> string[] legacy format
                                     |
                        debriefGenerator(transcript: string[])
                                     |
                        Simple report { elevatorPitch, keyAchievements, ... }
```

### After (v3.0)

```
SetupScreen -> MyCareerApp state -> InterviewScreen
   |                                  |
AgentId selected           GeminiLiveClient.onTranscript()
   |                                  |
buildSystemInstruction()   TranscriptEntry[] (captured)
   |                                  |
   -> GeminiLiveClient.connect()       onFinish(transcript, agentId, duration)
                                     |
                        debriefGenerator(transcript, agentId, duration)
                                     |
                        processTranscript() -> QAExchange[]
                                     |
                        evaluateSTAR() per exchange (parallel)
                                     |
                        detectPatterns() across all answers
                                     |
                        generateCoachingInsights()
                                     |
                        DebriefReport { starAnalyses, patterns, coaching, ... }
```

---

## UI Component Changes

### SetupScreen - Agent Selector

**Current:** 4 personality cards in a 2x2 grid.

**New:** 7 agent cards in a scrollable or wrapped layout with:
- Agent name
- Description
- Recommended duration badge
- Focus areas pills
- Icon matching agent tone

```tsx
// components/SetupScreen.tsx (pseudo-code for selector)
<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {Object.values(AGENT_DEFINITIONS).map(agent => (
    <AgentCard
      key={agent.id}
      agent={agent}
      selected={selectedAgent === agent.id}
      onSelect={() => setSelectedAgent(agent.id)}
    />
  ))}
</div>
```

### DebriefScreen - Enhanced Report

**Current:** Simple sections for elevator pitch, achievements, improvements.

**New Sections:**

1. **Performance Score** - Large overall score with breakdown bars (clarity, confidence)
2. **STAR Compliance** - Visual indicator of S-T-A-R component completion
3. **Answer Breakdown** - Accordion/collapsible with each Q&A and STAR scores
4. **Behavioral Patterns** - Cards for positive and attention-requiring patterns
5. **Coaching Insights** - Prioritized action items and practice prompts

---

## Build Order (Suggested)

Based on dependencies, recommended implementation order:

| Phase | Component | Dependencies | Risk |
|-------|-----------|--------------|------|
| 1 | `lib/agents.ts` | None | Low - standalone definitions |
| 2 | `lib/types.ts` extensions | None | Low - type definitions |
| 3 | `lib/promptBuilder.ts` update | agents.ts | Medium - prompt engineering |
| 4 | `lib/transcriptProcessor.ts` | types | Low - deterministic logic |
| 5 | `lib/patternDetector.ts` | types | Low - regex-based |
| 6 | `lib/starEvaluator.ts` | types | Medium - Gemini API integration |
| 7 | `lib/debriefGenerator.ts` rewrite | all above | High - integration point |
| 8 | `SetupScreen` agent selector | agents.ts | Medium - UI only |
| 9 | `DebriefScreen` enhanced display | types, debrief | Medium - UI only |
| 10 | Integration testing | all | - |

---

## Integration Points Summary

| Integration Point | Current | v3.0 Change |
|-------------------|---------|-------------|
| `MyCareerApp.personality` | `string` | `AgentId` (rename to `selectedAgent`) |
| `SetupScreen` personality selector | 4 options | 7 agent cards with detailed metadata |
| `InterviewScreen` prompt building | `buildSystemInstruction({ resume, jd, personality })` | Same signature, personality becomes agentId |
| `InterviewScreen` transcript capture | `TranscriptEntry[]` | Same, already working |
| `MyCareerApp.handleFinishInterview` | Passes `string[]` to debrief | Passes `TranscriptEntry[]`, `AgentId`, `duration` |
| `generateDebrief` | Takes `string[]` | Takes `TranscriptEntry[]`, `AgentId`, `duration` |
| `DebriefScreen` | Displays simple report | Displays `DebriefReport` with STAR, patterns |

---

## Key Architectural Decisions

### 1. Agent Prompts in Code (not database)

**Decision:** Store agent definitions as TypeScript constants.

**Rationale:**
- 7 agents is a small, stable set
- Type safety for `AgentId`
- Easy to version control and review
- No database dependency for this milestone

### 2. Transcript Processing at Finish (not real-time)

**Decision:** Process transcript into QA exchanges when interview ends.

**Rationale:**
- Simpler than real-time tracking
- No impact on interview performance
- Gemini Live already provides real-time transcription
- Post-processing allows for more sophisticated analysis

### 3. Parallel STAR Evaluation

**Decision:** Evaluate all QA exchanges in parallel using `Promise.all`.

**Rationale:**
- Each evaluation is independent
- Reduces total debrief generation time
- Gemini Flash is fast enough for parallel calls
- Typical interview has 8-15 exchanges, within rate limits

### 4. Pattern Detection Client-Side (regex-based)

**Decision:** Use client-side regex for pattern detection.

**Rationale:**
- Patterns are simple text matches
- No API calls needed
- Instant feedback
- Easy to extend with new patterns

### 5. STAR Evaluation via API (not Live)

**Decision:** Use standard Gemini API (not Live) for STAR evaluation.

**Rationale:**
- Need structured JSON output
- Not real-time conversation
- Flash model is cheaper and faster for this use case
- Live API is for bidirectional audio streaming

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Prompt engineering for 7 agents takes iteration | High | Medium | Build 1-2 agents first, validate structure |
| STAR evaluation JSON parsing fails | Medium | High | Robust JSON extraction with fallbacks |
| Gemini rate limits on parallel STAR calls | Low | Medium | Batch or sequential fallback if needed |
| Transcript processing misses multi-turn exchanges | Medium | Medium | Test with real transcripts, iterate |
| UI crowded with 7 agent cards | Medium | Low | Scrollable container, compact card design |

---

## Files Changed Summary

| File | Action | Lines Changed (Est.) |
|------|--------|---------------------|
| `lib/agents.ts` | NEW | ~150 |
| `lib/types.ts` | MODIFY | +50 |
| `lib/promptBuilder.ts` | MODIFY | ~30 |
| `lib/transcriptProcessor.ts` | NEW | ~80 |
| `lib/patternDetector.ts` | NEW | ~100 |
| `lib/starEvaluator.ts` | NEW | ~70 |
| `lib/debriefGenerator.ts` | REWRITE | ~150 |
| `components/SetupScreen.tsx` | MODIFY | ~100 |
| `components/DebriefScreen.tsx` | MODIFY | ~200 |
| `components/MyCareerApp.tsx` | MODIFY | ~30 |
| `lib/personalities.ts` | DELETE | -24 |

**Total estimated LOC change:** +850 / -24 = +826 net new lines

---

## Sources

- Direct codebase analysis of existing architecture
- Gemini Live API documentation (training knowledge)
- STAR method interview evaluation patterns (training knowledge)