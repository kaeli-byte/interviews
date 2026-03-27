# Supermemory Integration Plan: MyCareer Voice Interview App

**Document Type:** Product Manager Briefing / Technical Architecture Plan
**Date:** March 25, 2026
**Status:** Draft for Review

---

## Executive Summary

**What:** Add Supermemory—a persistent memory layer for AI applications—to the MyCareer mock interview app. This enables the AI interviewer to remember past sessions, track skill progression, and personalize conversations across multiple interviews. **Also add generation persistence** so each interview is saved with a unique ID, addressable URL, and cost metadata.

**Why users care:** Today, every interview starts from scratch. With memory, the interviewer can reference past performance ("Last time you struggled with system design questions—let's revisit that"), avoid repeating the same icebreakers, and track growth over time. This transforms isolated practice sessions into a coherent coaching relationship. **With persistence**, users can revisit past interviews via shareable URLs and track cost history.

**Ship time:** 2-3 weeks for MVP (session memory + basic user profile + interview persistence).
**Latency impact:** +50-100ms at session start; +5-15% model generation time during conversation (larger prompts).
**Cost impact:** ~$0.02-0.04 per interview session (memory + database + optional audio storage).
**Risk level:** Low—integration is additive; existing voice pipeline remains unchanged.

---

## 1. Current State & Integration Vision

### 1.1 Where Supermemory Fits

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CURRENT ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────┤
│  User Voice ──▶ AudioRecorder ──▶ GeminiLiveClient ──▶ Gemini API       │
│                                      │                                   │
│                    System Instructions (built from resume/JD)           │
│                                      │                                   │
│  Transcript ◀─── AudioStreamer ◀─────┘                                   │
│                                                                          │
│  Limitation: Every session starts blank. No recall of past interviews.   │
└─────────────────────────────────────────────────────────────────────────┘

                              ▼ ADD SUPERMEMORY ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                        INTEGRATED ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────┤
│  User Voice ──▶ AudioRecorder ──▶ GeminiLiveClient ──▶ Gemini API       │
│                    │                       │                             │
│                    │                       ▼                             │
│                    │              Memory Retrieval (~50ms)               │
│                    │              (past sessions, user profile)          │
│                    │                       │                             │
│                    ▼                       ▼                             │
│              System Instructions = Resume + JD + Memory Context         │
│                                                                          │
│  After Interview Ends ──▶ Memory Write (turn summaries, performance)    │
│                                                                          │
│  Benefit: Interviewer "remembers" user across sessions.                  │
└─────────────────────────────────────────────────────────────────────────┘
```

**Integration layer:** Between setup (resume/JD ingestion) and Gemini Live session start. Memory retrieval happens once at session initialization; memory write happens once at session end.

**Data scope:**
- **Session-level memory:** Current interview turns, questions asked, responses given
- **Long-term memory:** User's career trajectory, strengths/weaknesses identified, skill progression, preferences

### 1.2 User Value Enabled

| Before (No Memory) | After (With Memory) |
|--------------------|---------------------|
| "Tell me about yourself" every session | "Welcome back! Last session we covered React hooks—ready to dive into system design?" |
| Same icebreaker questions | Personalized opening based on career goals |
| No tracking of progress | "Your STAR answers have improved 30% since January" |
| Generic feedback | Contextual coaching referencing past mistakes |
| Isolated practice | Cohesive learning journey |

**Primary UX improvement:** Continuity. Users feel recognized and coached, not interrogated by a stranger each time.

---

## 2. Integration Points & Data Flow

### 2.1 Memory Read: Session Initialization

**When:** After user clicks "Start Interview" but before Gemini WebSocket connection opens.

**Where:** In `InterviewScreen.tsx`, before `GeminiLiveClient.connect()`.

**Flow:**
```
1. User clicks Start
2. Retrieve memory profile (async, ~50ms)
3. Build enhanced system instruction:
   - Resume (from SetupScreen)
   - Job Description (from SetupScreen)
   - Memory context (from Supermemory):
     * profile.static → long-term facts (career level, goals, known strengths)
     * profile.dynamic → recent activity (last session summary, recent topics)
     * search_results → relevant past Q&A for current JD
4. Connect to Gemini with enriched context
5. Interview begins with personalized opener
```

**Latency breakdown:**

**Session initialization (one-time):**
- Supermemory `profile()` call: ~50ms (documented)
- Network overhead: ~20-50ms (depends on region)
- **Total added latency: 70-100ms** at session start
- **Impact on audio stream: NONE** — retrieval happens before WebSocket opens

**During conversation (ongoing):**
- Memory does NOT affect audio streaming directly
- **Larger prompts may increase model generation time by ~5-15%** depending on memory size
- Example: If baseline response time is 500ms, with memory it may be 525-575ms
- **User perception: Negligible** — still well within conversational response expectations
- **Mitigation:** Limit memory context to most relevant facts (Supermemory handles this via similarity search)

### 2.2 Memory Write: Session Completion

**When:** After interview ends, during debrief generation.

**Where:** In `InterviewScreen.tsx`, after `generateDebrief()` call.

**Flow:**
```
1. Interview ends
2. Generate debrief (existing)
3. Extract memory-worthy facts:
   - Topics covered
   - Questions asked
   - Performance highlights/lowlights
   - User confidence indicators
   - Skills demonstrated
4. Write to Supermemory:
   - client.add() with conversation summary
   - Container tag = user identifier
5. Show debrief to user
```

**Latency:** Write is asynchronous and non-blocking. User sees debrief immediately; memory stores in background.

### 2.3 Container Tag Strategy

**What is a container tag?** A string that scopes all memories to a specific user. All `profile()` and `add()` calls with the same tag share the same memory pool.

**Recommended approach:**
```typescript
// Option A: Auth-based (if user accounts exist)
const containerTag = `user:${userId}`

// Option B: Stable anonymous ID (localStorage/cookie) — RECOMMENDED FOR MVP
const containerTag = `anon:${getOrCreateAnonymousId()}`

// Option C: Browser fingerprint (persistence without auth)
const containerTag = `device:${fingerprintHash}`
```

**⚠️ Anti-pattern: Session-based tags**

```typescript
// ❌ DO NOT USE - defeats the purpose of memory
const containerTag = `session:${sessionId}`  // New ID each visit = no cross-session memory
```

**Why session-based fails:**
- New session ID on every browser refresh
- No persistence across visits
- Memory cannot accumulate across interviews
- **Defeats the entire value proposition**

**Recommendation: Option B (Stable anonymous ID) for MVP**

```typescript
// lib/anonymousId.ts
import { nanoid } from 'nanoid';

const STORAGE_KEY = 'mycareer_anonymous_id';

export function getOrCreateAnonymousId(): string {
  if (typeof window === 'undefined') return nanoid();

  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = nanoid(12); // Shorter ID for readability
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}
```

**Migration path to auth-based:**
1. MVP: Use `anon:${anonymousId}` from localStorage
2. When auth added: On first login, merge anonymous memories into `user:${userId}`
3. Supermemory supports migration via container tag reassignment (or simply continue using anonymous ID as fallback)

### 2.4 Memory Quality Strategy

**Core principle:** Bad memory is worse than no memory. Polluted memory leads to incorrect inferences, outdated info reused, and repeated noise.

#### Memory Filtering Policy (MVP)

**What TO store:**

| Category | Examples | Why |
|----------|----------|-----|
| **Strengths identified** | "Strong at system design", "Excellent STAR storytelling" | Track what user does well |
| **Weaknesses identified** | "Struggles with concurrency questions", "Needs work on behavioral depth" | Focus future coaching |
| **Topics covered** | "Covered: microservices, CAP theorem, conflict resolution" | Avoid repetition |
| **Skill level** | "Junior→Mid progression in backend concepts" | Track growth |
| **Preferences detected** | "Prefers technical over behavioral", "Likes visual explanations" | Personalize approach |

**What NOT to store:**

| Category | Examples | Why |
|----------|----------|-----|
| **Small talk** | "How's your day?", weather chat | Noise, no coaching value |
| **Filler responses** | "Um", "Let me think", false starts | Clutters retrieval |
| **Repeated content** | Same answer given multiple times | Dedup before storing |
| **Temporary context** | "I'm testing this app", "Just practicing" | Not career-relevant |
| **Speculation** | "I might try X someday" | Not a committed goal |
| **Incorrect inferences** | Model guesses about user | Only store debrief-validated facts |

#### Memory Write Format

Store structured summaries, not raw transcripts:

```typescript
interface InterviewMemory {
  // Metadata
  interviewId: string;
  date: string;
  duration: number;

  // Extracted facts (validated by debrief)
  strengths: string[];        // ["system design", "communication"]
  weaknesses: string[];       // ["concurrency", "behavioral depth"]
  topicsCovered: string[];    // ["microservices", "CAP theorem"]
  skillProgression: string;   // "Junior backend → Mid level"

  // Coaching context
  recommendedFocus: string;   // "Practice concurrency scenarios"
  nextSessionSuggestion: string; // "Resume with system design follow-up"

  // Explicitly NOT stored:
  // - rawTranscript (too noisy, stored in DB separately)
  // - smallTalk (filtered out)
  // - fillerWords (filtered out)
}
```

#### Deduplication Logic

Before writing, check if similar memory already exists:

```typescript
async function deduplicateMemory(
  containerTag: string,
  newFact: string
): Promise<boolean> {
  const existing = await client.profile({
    containerTag,
    q: newFact,  // Use the fact itself as query
  });

  // If similarity > 0.85, don't store duplicate
  const similarExists = existing.search_results?.results?.some(
    r => r.similarity > 0.85
  );

  return !similarExists;
}
```

#### Memory Decay Strategy

Supermemory handles decay automatically, but we should signal importance:

| Fact Type | Importance Signal | Expected Retention |
|-----------|------------------|-------------------|
| Core strengths | High | Long-term (months) |
| Core weaknesses | High | Long-term (months) |
| Topics covered | Medium | Medium-term (weeks) |
| Session details | Low | Short-term (days) |

**Implementation:** Prepend importance marker to stored content:
- `[HIGH] Strength: system design`
- `[MEDIUM] Topic: covered microservices`
- `[LOW] Session: 30min technical interview on 2024-03-25`

#### Validation Gate

Only store facts that appear in the debrief report. The debrief generator already filters noise:

```typescript
// After debrief is generated
const debrief = await generateDebrief(transcript);

// Extract validated facts from debrief, not raw transcript
const memoryPayload = {
  strengths: debrief.strengths,          // Already curated by debrief
  weaknesses: debrief.areasForImprovement,
  topicsCovered: debrief.topicsDiscussed,
};

await storeInterviewMemory(containerTag, memoryPayload);
```

**Why this works:** The debrief is already doing the hard work of separating signal from noise. We reuse its output rather than re-parsing the transcript.

### 2.5 Memory Failure & Timeout Strategy

**Principle:** Memory is an enhancement, not a blocker. The interview must proceed even if memory fails.

#### Explicit Timeout Rules

| Scenario | Timeout | Action |
|----------|---------|--------|
| `profile()` retrieval | **150ms** | Continue without memory |
| `add()` write | **500ms** | Skip write, log error |
| Network error | Immediate | Continue without memory |
| API rate limit | Immediate | Continue without memory |

#### Implementation

```typescript
// lib/supermemoryClient.ts
const MEMORY_TIMEOUT_MS = 150; // Hard limit for retrieval

export async function getUserMemoryWithTimeout(
  containerTag: string,
  query: string
): Promise<MemoryProfile | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), MEMORY_TIMEOUT_MS);

  try {
    const profile = await Promise.race([
      client.profile({ containerTag, q: query }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), MEMORY_TIMEOUT_MS)
      ),
    ]);

    clearTimeout(timeoutId);
    return profile as MemoryProfile;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn('Memory retrieval failed or timed out:', error);
    return null; // Graceful degradation - continue without memory
  }
}
```

#### Fallback Behavior

```typescript
// In InterviewScreen.tsx
const memory = await getUserMemoryWithTimeout(containerTag, jobDescription);

if (!memory) {
  // Log for observability
  console.log('[Memory] Proceeding without memory context');

  // Continue with baseline system instruction
  systemInstruction = buildBaseInstruction({ resume, jobDescription, personality });
} else {
  // Enrich with memory
  systemInstruction = buildEnrichedInstruction({ resume, jobDescription, personality, memory });
}

// Interview ALWAYS proceeds, memory or not
await geminiClient.connect(systemInstruction);
```

#### Observability

Track memory success/failure rates:

```typescript
// Log to your observability platform
metrics.increment('memory.request');
if (memory) {
  metrics.increment('memory.success');
} else {
  metrics.increment('memory.fallback');
}
```

**SLO target:** 95% of memory retrievals succeed within 150ms. If fallback rate > 5%, investigate.

### 2.6 Prompt Size Limits

**Problem:** Gemini context window is finite. Memory + resume + JD + system prompt can explode token limits.

#### Token Budget

| Component | Max Tokens | Rationale |
|-----------|-----------|-----------|
| System prompt (base) | ~500 | Fixed instructions |
| Resume | ~1,500 | Truncate if longer |
| Job description | ~1,000 | Truncate if longer |
| **Memory context** | **~800** | **Capped aggressively** |
| **Total pre-conversation** | **~3,800** | Leaves room for conversation |

#### Memory Injection Caps

```typescript
const MAX_MEMORY_TOKENS = 800;

function formatMemoryContext(memory: MemoryProfile): string {
  let context = '';

  // Priority 1: Static profile (always include, capped)
  const staticFacts = memory.staticFacts.slice(0, 3); // Top 3 only
  context += `User profile: ${staticFacts.join(', ')}\n`;

  // Priority 2: Recent activity (last session summary only)
  const recentActivity = memory.recentActivity.slice(0, 1);
  if (recentActivity.length > 0) {
    context += `Last session: ${recentActivity[0]}\n`;
  }

  // Priority 3: Relevant history (top 2-3 by similarity)
  const relevantHistory = memory.relevantHistory
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);
  if (relevantHistory.length > 0) {
    context += `Relevant past topics: ${relevantHistory.map(r => r.title).join(', ')}\n`;
  }

  // Truncate if over budget
  if (estimateTokens(context) > MAX_MEMORY_TOKENS) {
    context = truncateToTokenLimit(context, MAX_MEMORY_TOKENS);
  }

  return context;
}

function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

function truncateToTokenLimit(text: string, maxTokens: number): string {
  const maxChars = maxTokens * 4;
  return text.slice(0, maxChars) + '...';
}
```

#### Resume/JD Truncation

If inputs exceed budget, truncate intelligently:

```typescript
function truncateResume(resume: string, maxTokens: number): string {
  if (estimateTokens(resume) <= maxTokens) return resume;

  // Keep most recent experience and skills
  const sections = resume.split('\n\n');
  const prioritized = [
    sections.find(s => s.toLowerCase().includes('experience')),
    sections.find(s => s.toLowerCase().includes('skills')),
    sections.find(s => s.toLowerCase().includes('education')),
  ].filter(Boolean);

  return prioritized.join('\n\n').slice(0, maxTokens * 4);
}
```

### 2.7 AI Generation Persistence (Interview Records)

**Why this matters:** AI interviews are expensive, non-reproducible assets. Each Gemini Live session costs real money and produces unique output. Without persistence, refreshing the page loses everything.

**What to persist:**

| Data | Storage | Why |
|------|---------|-----|
| Interview ID | Supabase Postgres | Unique identifier, addressable URL |
| Transcript | Supabase Postgres | Full conversation history |
| Debrief report | Supabase Postgres | Analysis, scores, recommendations |
| Token usage | Supabase Postgres | Cost tracking, budgeting |
| Audio recording (optional) | Vercel Blob | Permanent playback URL |

**Database schema:**

```typescript
// lib/db/schema.ts
import { pgTable, text, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const interviews = pgTable("interviews", {
  id: text("id").primaryKey(),              // nanoid() - e.g., "abc123"
  userId: text("user_id"),                  // container tag owner
  containerTag: text("container_tag"),      // Supermemory scope

  // Input context
  resume: text("resume"),
  jobDescription: text("job_description"),
  agentType: text("agent_type"),            // "technical", "behavioral", etc.
  personality: text("personality"),         // "warm", "professional", etc.
  duration: integer("duration_minutes"),

  // Output
  transcript: jsonb("transcript"),          // TranscriptEntry[]
  debriefReport: jsonb("debrief_report"),   // DebriefReport

  // Cost tracking
  tokenUsage: jsonb("token_usage"),         // { promptTokens, completionTokens }
  estimatedCostCents: integer("estimated_cost_cents"),

  // Metadata
  status: text("status").default("pending"), // pending | active | complete | error
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

**Generate-then-redirect pattern:**

```typescript
// When user clicks "Start Interview":
// 1. Generate ID first
const interviewId = nanoid();

// 2. Create database record BEFORE Gemini connects
await db.insert(interviews).values({
  id: interviewId,
  userId,
  containerTag: `user:${userId}`,
  resume,
  jobDescription,
  status: "pending",
  createdAt: new Date(),
});

// 3. Navigate to interview page (addressable URL)
router.push(`/interview/${interviewId}`);
```

**Addressable URLs:**

```
/interview/abc123  →  Specific interview session
/history           →  List of user's past interviews
```

This enables:
- **Shareable links:** Send interview to friend/mentor for review
- **Back-button support:** Navigate away and return without losing state
- **Multi-tab sessions:** Open multiple interviews in tabs
- **Cost analytics:** Query token usage by user, date, agent type

**Token usage extraction:**

Gemini Live API exposes usage metadata. Capture and store:

```typescript
// After interview ends
const usage = geminiLiveClient.getUsage(); // { promptTokens, completionTokens }
const estimatedCostCents = estimateGeminiCost(usage);

await db.update(interviews)
  .set({
    transcript,
    debriefReport,
    tokenUsage: usage,
    estimatedCostCents,
    status: "complete",
    completedAt: new Date(),
  })
  .where(eq(interviews.id, interviewId));
```

---

## 3. Multi-Provider Inference Considerations

### 3.1 Current State

The app uses Gemini Live API exclusively for voice interviews. Supermemory is **provider-agnostic**—it works with any LLM.

### 3.2 Integration Complexity

| Factor | Impact |
|--------|--------|
| Single provider (Gemini) | Simple—no routing logic needed |
| Memory retrieval | Same regardless of provider |
| Memory format | Provider-agnostic (text-based) |

**No additional complexity** from using Gemini vs. other providers. Supermemory's SDK returns structured text (`profile.static`, `profile.dynamic`) that can be injected into any LLM's system prompt.

### 3.3 Future Multi-Provider Scenarios

If the app later adds:
- **Text-based chat (different LLM):** Same memory layer works—just inject profile into system prompt.
- **Voice with different provider:** Same pattern—retrieve before connect, write after disconnect.
- **Model switching per interview:** No changes needed—container tag is user-scoped, not model-scoped.

---

## 4. Refactoring Scope

### 4.1 What Changes

#### Memory Layer (Supermemory)

| Component | Change | Effort |
|-----------|--------|--------|
| `lib/supermemoryClient.ts` | **NEW** — SDK wrapper, container tag logic | Small |
| `lib/promptBuilder.ts` | Modify — inject memory context into system instructions | Small |
| `components/InterviewScreen.tsx` | Modify — add memory retrieval before connect, write after disconnect | Medium |
| `components/SetupScreen.tsx` | Modify — store resume/JD as long-term memory on upload | Small |
| `lib/types.ts` | Modify — add MemoryProfile type | Trivial |
| `.env.local` | Add — `SUPERMEMORY_API_KEY` | Trivial |
| `package.json` | Add — `supermemory` dependency | Trivial |

#### Generation Persistence (Interview Records)

| Component | Change | Effort |
|-----------|--------|--------|
| `lib/db/schema.ts` | **NEW** — Drizzle schema for `interviews` table | Small |
| `lib/db/index.ts` | **NEW** — Supabase client, Drizzle ORM setup | Small |
| `lib/costTracker.ts` | **NEW** — Token usage extraction, cost estimation | Small |
| `app/interview/[id]/page.tsx` | **NEW** — Addressable interview page | Medium |
| `app/history/page.tsx` | **NEW** — Interview history list page | Medium |
| `components/InterviewScreen.tsx` | Modify — create DB record before connect, update after disconnect | Medium |
| `components/MyCareerApp.tsx` | Modify — route to `/interview/[id]` instead of in-place render | Small |
| `.env.local` | Add — `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Trivial |
| `package.json` | Add — `@supabase/supabase-js`, `drizzle-orm`, `nanoid` | Trivial |

### 4.2 What Stays Unchanged

- **Audio pipeline:** `AudioRecorder`, `AudioStreamer`, `GeminiLiveClient` — no changes
- **WebSocket flow:** Gemini Live connection remains identical
- **Debrief generation:** `debriefGenerator.ts` — unchanged (memory write happens after)
- **UI components:** All visual components unchanged
- **Document parsing:** `parse-document` route unchanged

### 4.3 Dependency Chain

**Memory Layer:**
```
1. Install supermemory package (no blockers)
2. Create supermemoryClient.ts (no blockers)
3. Modify promptBuilder.ts (depends on #2)
4. Modify InterviewScreen.tsx (depends on #2, #3)
5. Modify SetupScreen.tsx (depends on #2, optional enhancement)
```

**Persistence Layer:**
```
1. Set up Supabase project (via Vercel Marketplace or direct) (no blockers)
2. Create lib/db/schema.ts + lib/db/index.ts (depends on #1)
3. Create app/interview/[id]/page.tsx (depends on #2)
4. Modify InterviewScreen.tsx for DB writes (depends on #2, #3)
5. Create app/history/page.tsx (depends on #2)
```

**Parallel work:**
- Memory layer steps 1-2 and Persistence layer steps 1-2 can run in parallel
- Memory layer steps 3-5 and Persistence layer steps 3-5 have sequential dependencies within their tracks
- Both tracks are independent until they converge in InterviewScreen.tsx modifications

---

## 5. Pipecat Compatibility

**Scope clarification:** Pipecat is **NOT part of the MVP (Phases 1–2)**.
The MVP uses the existing Gemini Live architecture to minimize risk and ship quickly.

This section outlines future compatibility if Pipecat is introduced in a later phase.

### 5.1 What is Pipecat?

Pipecat is an open-source framework for building real-time voice AI applications. It handles audio I/O, transport, and conversation flow—similar to what `GeminiLiveClient` does today, but as a framework rather than a direct API wrapper.

### 5.2 If Pipecat is Integrated

**Where Supermemory fits in Pipecat architecture:**

```
Pipecat Pipeline:
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Transport │───▶│  LLM     │───▶│ TTS      │───▶│ Output   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                     │
                     ▼
              ┌──────────────┐
              │ Supermemory  │
              │ (Context)    │
              └──────────────┘
```

**Integration point:** Pipecat's `LLMService` or `ContextAggregator` layer. Memory retrieval happens when the pipeline initializes; memory write happens in a `EndFrame` handler.

### 5.3 Migration Path

If moving from current architecture to Pipecat:

| Current Component | Pipecat Equivalent | Memory Integration |
|-------------------|-------------------|-------------------|
| `GeminiLiveClient` | `WebSocketClientTransport` | Same—retrieve before connect |
| `promptBuilder.ts` | `ContextAggregator` | Move memory injection here |
| `InterviewScreen.tsx` | Pipecat pipeline setup | Same—retrieve/write around pipeline lifecycle |

**Effort to migrate memory layer:** Trivial—just move the retrieval/write calls to Pipecat lifecycle hooks. The Supermemory SDK calls remain identical.

---

## 6. Implementation Roadmap

### Phase 1: Foundation + Session Memory (Week 1)

**Goal:** Set up database infrastructure and enable session-level memory.

**Scope — Persistence:**
- Set up Supabase via Vercel Marketplace
- Create `lib/db/schema.ts` with `interviews` table schema
- Create `lib/db/index.ts` with Drizzle client
- Create `lib/costTracker.ts` for token usage extraction
- Modify `InterviewScreen.tsx`:
  - Generate interview ID with `nanoid()` before Gemini connect
  - Create DB record with "pending" status
  - Update record with transcript, debrief, token usage on completion
- Create `app/interview/[id]/page.tsx` (addressable interview page)

**Scope — Memory:**
- Install `supermemory` package
- Create `lib/supermemoryClient.ts` with basic `profile()` and `add()` wrappers
- Modify `promptBuilder.ts` to accept optional memory context
- Retrieve memory before Gemini connect
- Write conversation summary after interview ends

**Deliverable:**
- Interview sessions saved to database with unique IDs
- Addressable URLs (`/interview/abc123`)
- Interviewer can reference earlier in the session

**Effort:** Medium
**Risk:** Low
**Parallelizable:** Persistence and Memory tracks can run in parallel

---

### Phase 2: Long-Term Memory + History UI (Week 2)

**Goal:** Remember user across sessions and provide interview history view.

**Scope — Memory:**
- Modify `SetupScreen.tsx` to store resume/JD as long-term memory on upload
- Enhance memory extraction:
  - Extract skill tags from transcript
  - Store performance metrics
  - Track question types (behavioral, technical, system design)

**Scope — Persistence:**
- Create `app/history/page.tsx` (list of past interviews)
- Add cost tracking display (total tokens used, estimated cost)
- Add "View Past Interview" functionality with full transcript replay

**Deliverable:**
- Interviewer opens with "Welcome back" and references past sessions
- Users can view history of all interviews
- Cost analytics visible to user

**Effort:** Medium
**Risk:** Low
**Parallelizable:** Yes—Memory and UI work can happen concurrently

---

### Phase 3: Advanced Features (Week 3+)

**Goal:** Rich user profile with skill progression tracking and smart question selection.

**Scope — Memory:**
- Skill progression dashboard (chart improvement over time)
- Smart question selection based on weak areas
- Memory decay tuning (forget old irrelevant details)
- A/B testing integration (compare memory vs. no-memory experiences)

**Scope — Persistence:**
- Export interview data (PDF report, share link)
- Audio recording storage in Vercel Blob (optional)
- Admin analytics dashboard (aggregate usage, costs)

**Deliverable:** Full coaching experience with measurable progress tracking.

**Effort:** Medium-Large
**Risk:** Medium (requires UX design, may surface edge cases)
**Parallelizable:** Yes—can iterate independently after Phase 2

---

### Phase 4 (Future): Pipecat Integration (Optional)

**Goal:** Migrate to a more flexible real-time voice orchestration framework.

**Why later:**
- Does **not** unlock additional user value for memory MVP
- Requires changes to voice pipeline (higher technical risk)
- Memory integration works identically with or without Pipecat

**Scope:**
- Replace `GeminiLiveClient` with Pipecat pipeline
- Move memory hooks into Pipecat lifecycle (`ContextAggregator`, `EndFrame` handler)
- No changes to memory/persistence logic—it's already decoupled

**Effort:** Large (infrastructure change, not feature work)
**Risk:** Medium-High (voice pipeline rewrite)
**Prerequisite:** Phases 1-2 complete and validated with users

---

### Critical Path

```
Week 1: Phase 1 (Foundation + Session Memory)
    │
    ▼
Week 2: Phase 2 (Long-Term Memory + History UI) ──▶ SHIP TO USERS
    │
    ▼
Week 3+: Phase 3 (Advanced Features) ──▶ Iterate based on feedback
    │
    ▼
Future: Phase 4 (Pipecat Migration) ──▶ Optional infrastructure upgrade
```

**Fastest path to ship:** Complete Phase 1 + Phase 2. Users will notice immediate value (personalization). Phase 3 is enhancement, not requirement.

---

## 7. Cost Impact

### 7.1 Supermemory Pricing Model

(As of March 2026—verify before final decision)

- **Free tier:** Available for development/testing
- **Paid tier:** Usage-based (API calls + storage)

### 7.2 Estimated Per-Interview Cost

**Memory Layer:**

| Operation | Calls per Interview | Est. Cost |
|-----------|--------------------|-----------|
| `profile()` retrieval | 1 | ~$0.005 |
| `add()` write | 1-2 | ~$0.005-0.01 |
| Storage | ~5KB per session | Minimal |

**Persistence Layer:**

| Operation | Quantity | Est. Cost |
|-----------|----------|-----------|
| Supabase Postgres storage | ~10KB per interview | ~$0.001 |
| Vercel Blob (audio, optional) | ~5MB per 30min interview | ~$0.01 |

**Total per interview:** $0.01-0.03 (memory) + $0.001 (DB) + $0.01 (optional audio) = **$0.02-0.04**

### 7.3 Comparison to Baseline

| Cost Category | Before | After | Change |
|---------------|--------|-------|--------|
| Gemini API calls | Same | Same | None |
| Infrastructure | Same | Same | None |
| Memory layer | $0 | ~$0.02/interview | Additive |
| Database storage | $0 | ~$0.001/interview | Additive |
| Audio storage | $0 | ~$0.01/interview (optional) | Additive |

**Monthly cost (1000 interviews):**
- Memory: ~$20-30
- Database: ~$1-2
- Audio storage (optional): ~$10
- **Total: ~$30-40/month**

### 7.4 Cost Optimization

- **Batch writes:** Combine session summary into single `add()` call
- **Selective storage:** Only store structured summaries in memory, full transcript in DB
- **Container tag pruning:** Implement cleanup for inactive users
- **Audio retention policy:** Delete recordings older than 90 days (user-configurable)

---

## 8. Key Risks & Mitigations

### Risk 1: Latency in Real-Time Voice Stream

**Concern:** Memory retrieval adds 50-100ms. Larger prompts may slow model generation.

**Reality:**
- **Session start:** Retrieval happens **before** WebSocket connection opens
- **Audio streaming:** NOT affected — memory doesn't touch the audio pipeline
- **Model generation:** May increase by 5-15% due to larger prompts (e.g., 500ms → 525-575ms)
- **User perception:** Negligible — still within normal conversational response time

**Mitigation:**
- Show "Preparing your personalized interview..." loading state at session start
- Limit memory context to most relevant facts (Supermemory's similarity search handles this)
- Monitor actual generation times in production; tune memory context size if needed

**Likelihood:** Low impact
**Mitigation effort:** Trivial

---

### Risk 2: Memory Consistency Across Sessions

**Concern:** User does 3 interviews in a week—does memory show correct progression?

**Reality:**
- Supermemory handles contradiction resolution automatically
- Dynamic facts decay over time (recency bias)
- Static facts (career level) remain stable

**Mitigation:**
- Use container tags consistently
- Structure memory writes with clear fact types
- Test with multi-session scenarios

**Likelihood:** Medium (edge cases possible)
**Mitigation effort:** Small

---

### Risk 2.5: Memory Pollution

**Concern:** Storing wrong/noisy data makes memory worse than no memory. Examples:
- Incorrect skill inference ("User is bad at X" when they just had one bad answer)
- Outdated info reused ("Junior level" when user has progressed to Mid)
- Repeated noise ("User mentioned React 15 times" from transcript dump)

**Reality:**
- Raw transcripts are too noisy to store directly
- Model may make incorrect inferences that get persisted
- Without filtering, memory becomes a garbage dump

**Mitigation (see § 2.4 Memory Quality Strategy):**
- **Filter before store:** Only store debrief-validated facts, not raw transcript
- **Explicit exclusions:** Skip small talk, filler, repeated content, speculation
- **Deduplication:** Check similarity before writing new facts
- **Importance signals:** Mark fact priority so Supermemory can decay appropriately
- **Validation gate:** Debrief generator acts as the noise filter

**Likelihood:** Medium (common failure mode in memory systems)
**Mitigation effort:** Small-Medium (requires structured write logic)

---

### Risk 3: Storage Scaling

**Concern:** 10,000 users × 10 interviews each = 100,000 memory entries. Does this degrade?

**Reality:**
- Supermemory uses vector database optimized for scale
- Retrieval is similarity search, not linear scan
- Storage is their problem, not ours (managed service)

**Mitigation:**
- Monitor retrieval latency in production
- Implement container tag cleanup for inactive users
- Consider self-hosted option if costs grow (future)

**Likelihood:** Low
**Mitigation effort:** Small

---

### Risk 4: Destabilization of Existing System

**Concern:** Adding memory could break the voice pipeline.

**Reality:**
- Memory is **additive**, not invasive
- Retrieval/write happen outside the WebSocket flow
- If Supermemory fails, fallback to no-memory mode
- No changes to audio processing code

**Mitigation:**
- Wrap Supermemory calls in try/catch
- Graceful degradation: if memory fails, continue interview without it
- Add feature flag to disable memory layer instantly

**Likelihood:** Low
**Mitigation effort:** Small-Medium

---

### Risk 5: Privacy/GDPR Considerations

**Concern:** Storing conversation history raises privacy questions.

**Reality:**
- Storing interview summaries, not full transcripts
- User-initiated (they upload resume/JD)
- Container tag can be deleted on request

**Mitigation:**
- Add "Forget my data" option in settings
- Document data retention policy
- Ensure container tag can be user-controlled (auth-based)

**Likelihood:** Medium (legal/compliance)
**Mitigation effort:** Medium

---

## 9. Go/No-Go Decision Framework

### When to Ship

- [ ] Phase 1 complete (session memory working)
- [ ] Latency tested and acceptable (<100ms at session start)
- [ ] **Memory timeout implemented (150ms max, continue without on failure)**
- [ ] **Prompt size limits enforced (memory capped at ~800 tokens)**
- [ ] **Stable anonymous ID in place (NOT session-based tags)**
- [ ] Graceful degradation implemented (memory fails → continue without)
- [ ] Basic privacy disclosure added

### When to Hold

- [ ] Latency exceeds 200ms consistently
- [ ] Memory retrieval failures cause session crashes
- [ ] Prompt size exceeds Gemini context window
- [ ] Using session-based container tags (defeats memory purpose)
- [ ] Privacy concerns unaddressed

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Latency added | <100ms | Client-side timing |
| Memory retrieval success rate | >99% | Error logging |
| User satisfaction | +15% vs. baseline | Post-interview survey |
| Return user rate | +20% | Session analytics |

---

## 10. Appendix: Code Integration Sketch

### 10.1 supermemoryClient.ts (NEW)

```typescript
import Supermemory from 'supermemory';

const client = new Supermemory();

export async function getUserMemory(containerTag: string, query: string) {
  try {
    const profile = await client.profile({
      containerTag,
      q: query,
    });

    return {
      staticFacts: profile.static || [],
      recentActivity: profile.dynamic || [],
      relevantHistory: profile.search_results?.results || [],
    };
  } catch (error) {
    console.error('Memory retrieval failed:', error);
    return null; // Graceful degradation
  }
}

// Memory quality: structured write with validation gate
interface DebriefReport {
  strengths: string[];
  areasForImprovement: string[];
  topicsDiscussed: string[];
  skillLevel: string;
  recommendedFocus: string;
}

export async function storeInterviewMemory(
  containerTag: string,
  debrief: DebriefReport,  // Only accept validated debrief, not raw transcript
  interviewId: string
) {
  try {
    // Build structured memory payload (not raw text)
    const memoryContent = formatMemoryPayload(debrief, interviewId);

    // Deduplication check
    const isDuplicate = await checkDuplicate(containerTag, memoryContent);
    if (isDuplicate) {
      console.log('Skipping duplicate memory');
      return;
    }

    await client.add({
      content: memoryContent,
      containerTag,
    });
  } catch (error) {
    console.error('Memory storage failed:', error);
  }
}

function formatMemoryPayload(debrief: DebriefReport, id: string): string {
  // Structured format with importance signals
  return `
[HIGH] Interview ${id} Summary
Strengths: ${debrief.strengths.join(', ')}
Areas for improvement: ${debrief.areasForImprovement.join(', ')}
[MEDIUM] Topics covered: ${debrief.topicsDiscussed.join(', ')}
[MEDIUM] Recommended focus: ${debrief.recommendedFocus}
[LOW] Skill level: ${debrief.skillLevel}
  `.trim();
}

async function checkDuplicate(tag: string, content: string): Promise<boolean> {
  const keywords = content.match(/\b(strengths|improvement|topics):([^[]+)/g);
  if (!keywords) return false;

  const existing = await client.profile({
    containerTag: tag,
    q: keywords[0], // Check first key fact
  });

  return existing.search_results?.results?.some(r => r.similarity > 0.85) ?? false;
}
```

### 10.2 promptBuilder.ts Integration

```typescript
import { getUserMemory } from './supermemoryClient';

export async function buildSystemInstruction(params: {
  resume: string;
  jobDescription: string;
  personality: PersonalityKey;
  userId?: string; // For memory
}) {
  const baseInstruction = buildBaseInstruction(params);

  // Add memory context if available
  if (params.userId) {
    const memory = await getUserMemory(
      `user:${params.userId}`,
      params.jobDescription
    );

    if (memory) {
      const memoryContext = formatMemoryContext(memory);
      return baseInstruction + '\n\n' + memoryContext;
    }
  }

  return baseInstruction;
}
```

### 10.3 InterviewScreen.tsx Integration

```typescript
// In handleStartInterview():
const memory = await getUserMemory(`user:${userId}`, jobDescription);
const systemInstruction = await buildSystemInstruction({
  resume,
  jobDescription,
  personality,
  memory, // Injected context
});

// In handleEndInterview():
// CRITICAL: Use debrief as validation gate (not raw transcript)
const report = await generateDebrief(transcript);

await storeInterviewMemory(
  `user:${userId}`,
  {
    strengths: report.strengths,
    areasForImprovement: report.areasForImprovement,
    topicsDiscussed: report.topicsDiscussed,
    skillLevel: report.overallAssessment,
    recommendedFocus: report.recommendedNextSteps,
  },
  interviewId
);
```

---

## 11. Summary for Product Manager

| Question | Answer |
|----------|--------|
| **How fast can we ship?** | 2 weeks to MVP (session memory + persistence + basic profile). 3 weeks for full personalization + history UI. |
| **Will memory slow responses?** | Session start: +50-100ms. During conversation: +5-15% model generation time (larger prompts). Audio stream unaffected. |
| **What does this cost?** | ~$0.02-0.04 per interview. ~$30-40/month at 1000 interviews (memory + database + optional audio). |
| **What do users gain?** | Continuity (interviewer remembers them), progress tracking, shareable interview links, cost visibility. |
| **How risky is this?** | Low. Integration is additive. If memory/DB fails, interview continues normally with graceful degradation. |

**Recommendation:** Proceed with Phase 1 + Phase 2. Validate user response before investing in Phase 3.

---

*Document prepared by: Claude (Technical Architect)*
*Review status: Pending Product Manager approval*