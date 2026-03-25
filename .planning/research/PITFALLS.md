# Pitfalls Research

**Domain:** Multi-Agent Interview System with Transcript-Based Debrief
**Researched:** 2026-03-23
**Confidence:** HIGH (based on existing codebase analysis and established LLM patterns)

---

## Critical Pitfalls

### Pitfall 1: Transcript-Based Debrief Uses Resume/JD Instead of Actual Responses

**What goes wrong:**
The current `DebriefScreen.tsx` receives `report` data derived from resume/job description context, NOT from what the candidate actually said during the interview. The debrief shows generic insights like "elevatorPitch" and "uniqueValueProposition" derived from document parsing, not from actual interview performance. This makes coaching feedback disconnected from reality.

**Why it happens:**
The current architecture passes `report: any` to `DebriefScreen` but the `InterviewScreen.onFinish` callback receives `(transcript: string[], report: any)` where `report` is `null` (line 262 of InterviewScreen.tsx). The debrief generator was never implemented to use the transcript. The ideas-for-v3 spec explicitly flags this: "current debrief uses resume/JD (WRONG - must use transcript)".

**How to avoid:**
1. Create a new `debriefGenerator.ts` that takes the structured transcript as input, NOT resume/JD
2. Define the structured transcript format first (Q/A pairs with timestamps)
3. Use Gemini API (separate from Live API) to analyze the transcript and generate STAR evaluation
4. The debrief must be generated from `transcriptRef.current` after `handleFinish()` is called

**Warning signs:**
- Debrief mentions skills/projects not discussed in the interview
- Feedback is generic and could apply to anyone with that resume
- No specific quotes or references to actual answers given

**Phase to address:** Phase 1 (Transcript Capture & Structure) - Must fix data flow before building analysis

---

### Pitfall 2: Agent Persona Prompts Bleed Into Each Other

**What goes wrong:**
When implementing 7 distinct personas, the AI "forgets" which persona it should embody and drifts into hybrid behaviors. A "High-Pressure Panelist" suddenly becomes encouraging like a "Supportive Coach", or a "Drill Sergeant" starts giving deep coaching explanations. This breaks the interview simulation authenticity.

**Why it happens:**
The current `buildSystemInstruction()` merges personality instructions as a single string block. With 7 agents having overlapping but different behaviors (e.g., all ask behavioral questions, but differ in follow-up style), the prompt structure lacks explicit boundary enforcement. The `PERSONALITY_PRESETS` approach (lines 4-21 of personalities.ts) works for 4 simple modes but does not scale to complex persona definitions with edge case handling.

**How to avoid:**
1. Structure agent prompts with explicit `<persona_identity>`, `<behavioral_constraints>`, and `<anti_behaviors>` sections
2. Each agent prompt must include what it should NOT do (see ideas-for-v3 "Boundaries" sections)
3. Add a "persona consistency check" in the system instruction that reminds the model of its role
4. Test each agent in isolation before enabling user selection

**Warning signs:**
- Agent gives feedback mid-interview when it should hold until debrief
- "Supportive Coach" becomes critical and harsh
- "High-Pressure Panelist" offers hints or coaching
- Agent tone drifts during longer sessions (15-20 min)

**Phase to address:** Phase 2 (Agent System Implementation) - Requires dedicated prompt engineering iteration

---

### Pitfall 3: Transcript Fragmentation During Real-Time Streaming

**What goes wrong:**
Gemini Live's `inputTranscription` and `outputTranscription` events fire with partial text chunks, leading to fragmented transcript entries. A single sentence like "Tell me about a time you handled conflict" might arrive as 3 separate entries: "Tell me about", "a time you", "handled conflict". This breaks Q/A pairing and makes STAR evaluation impossible.

**Why it happens:**
The `onTranscript` callback in `geminiLiveClient.ts` (lines 66-89) appends each transcription event immediately to the transcript array without debouncing or chunking. The current `TranscriptEntry` interface lacks a way to merge partial utterances. Gemini Live API streams transcription in real-time, not in complete sentences.

**How to avoid:**
1. Implement utterance buffering: accumulate transcription chunks until a pause or turn boundary
2. Use the `turn_complete` / `turnComplete` signal (already detected at line 310 of InterviewScreen.tsx) to finalize utterances
3. Add a `mergeTranscriptEntries()` function that combines consecutive same-speaker entries
4. Consider storing both raw chunks (for debugging) and merged utterances (for analysis)

**Warning signs:**
- Transcript shows 50+ entries for a 15-minute interview
- Same speaker has consecutive 2-3 word entries
- STAR evaluation fails because question text is split across entries

**Phase to address:** Phase 1 (Transcript Capture & Structure) - Foundation for all downstream analysis

---

### Pitfall 4: STAR Evaluation Applied to Non-Behavioral Questions

**What goes wrong:**
The debrief attempts STAR evaluation on every answer, including responses to non-behavioral questions like icebreakers ("Tell me about yourself"), technical questions, or clarifying follow-ups. This produces nonsensical evaluations like "Situation: weak" for a question that does not require a STAR structure.

**Why it happens:**
The ideas-for-v3 spec shows STAR evaluation per answer, but does not account for question classification. The JSON structure has `star_evaluation` on every question object. The AI will try to fit square pegs into round holes if not explicitly told which questions warrant STAR analysis.

**How to avoid:**
1. Add a `question_type` field to the transcript structure: `behavioral`, `icebreaker`, `technical`, `clarification`
2. Only apply STAR evaluation to `behavioral` questions
3. Define alternative evaluation criteria for non-behavioral questions (e.g., "clarity" for icebreakers)
4. Include question classification logic in the debrief generation prompt

**Warning signs:**
- STAR scores on questions like "Tell me about yourself"
- "Result: weak" on clarification questions
- Evaluation feedback does not match question type

**Phase to address:** Phase 3 (STAR Evaluation & Analysis Layer) - Requires transcript structure first

---

### Pitfall 5: Pattern Detection Claims Patterns That Do Not Exist

**What goes wrong:**
The "Behavioral Pattern Analyst" agent and the pattern detection layer claim to find patterns across answers (e.g., "repeated missing quantification"), but with only 4-7 questions in a typical interview, the sample size is too small for meaningful pattern detection. The AI hallucinates patterns based on 1-2 instances.

**Why it happens:**
The ideas-for-v3 spec shows `patterns_detected` as an array with confident claims like "Repeated missing quantification in results". But with only 5 answers, seeing something twice is not a "pattern" - it is coincidence. LLMs are eager to find patterns and will over-claim.

**How to avoid:**
1. Set explicit thresholds: "pattern detected" requires 3+ instances across different questions
2. Use hedged language for weak signals: "Tendency toward X" vs "Consistent pattern of X"
3. Only the "Behavioral Pattern Analyst" agent should claim patterns; other agents should not
4. Add a `pattern_confidence` field: `strong` (3+ instances), `moderate` (2 instances), `insufficient_data`

**Warning signs:**
- Pattern claimed based on 2 instances
- Patterns contradict each other
- Pattern detection is different each time the same transcript is analyzed

**Phase to address:** Phase 3 (STAR Evaluation & Analysis Layer) - Analysis logic must be robust

---

### Pitfall 6: Agent Selection UI Mismatch With Interview Flow

**What goes wrong:**
User selects "Rapid-Fire Drill Sergeant" expecting the "Top 25 behavioral questions" drill, but the app flow (SetupScreen -> InterviewScreen -> DebriefScreen) does not support this mode's unique requirements (question tracking, coverage metrics, different duration expectations).

**Why it happens:**
The existing `SetupScreen` assumes a single interview flow with duration selection. The 7 agents have fundamentally different interview types (see ideas-for-v3 summary):
- **Full simulations:** 10-30 min, standard flow
- **Targeted prep:** Question-based (not time-based), coverage tracking

The "Drill Sergeant" needs question tracking, not a 15-minute timer. The "Story Architect" needs depth indicators, not breadth.

**How to avoid:**
1. Group agents by interview type in the UI
2. For targeted prep agents, change the "Duration" selector to "Question Count" or hide it entirely
3. Different agents may need different `InterviewScreen` variants or conditional UI
4. Update the `interview_duration_minutes` prop to support different modes

**Warning signs:**
- User selects "Drill Sergeant" but interview ends at 15 min regardless of question count
- "Story Architect" asks 10 questions in 15 minutes (impossible for deep dives)
- Agent behavior does not match user expectations from selection screen

**Phase to address:** Phase 2 (Agent System Implementation) - UI must match agent capabilities

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Reuse existing `PERSONALITY_PRESETS` structure for 7 agents | Faster implementation | Prompt structure does not support complex boundaries | Never - new structure required |
| Skip transcript merging, use raw chunks | Simpler code | STAR evaluation fails, debrief is unusable | Never |
| Generate debrief from resume/JD (current approach) | Already works | Feedback disconnected from actual performance | Never - this is the core bug |
| Hardcode STAR scores in debrief UI | Mock data works | Real evaluation not implemented | Prototype only |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Gemini Live transcription | Assuming events fire in order with complete utterances | Buffer chunks, use `turn_complete` signal to finalize |
| `buildSystemInstruction()` | Appending agent prompt to existing template | Replace template with agent-specific instruction structure |
| Debrief generation | Calling it with `report: null` (current bug) | Pass structured transcript to new `generateDebrief(transcript, agent)` function |
| Agent selection | Storing only `personality` string (current) | Store full agent config including interview type, question strategy |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Large transcript in state | React re-renders on every transcription event | Debounce transcript updates, use `useRef` for accumulation | 20+ min interview |
| Debrief generation delay | User sees "Generating debrief..." for 30+ seconds | Stream debrief sections progressively, cache results | Long transcript (10K+ chars) |
| Agent prompt token bloat | System instruction exceeds context window | Keep agent prompts under 2000 tokens, truncate resume/JD further | 7 complex agent prompts |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing transcript in localStorage | Resume/answer data persists across sessions | Use sessionStorage, clear on debrief completion |
| API key in `NEXT_PUBLIC_GEMINI_API_KEY` | Key exposed in client bundle (current implementation) | Move to server-side ephemeral token generation (future milestone) |
| No transcript data validation | Malformed transcription breaks debrief | Validate transcript structure before passing to debrief generator |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Wrong debrief source | Feedback does not match what they actually said | Use transcript-based analysis |
| Agent persona drift | Interview feels inconsistent, trust breaks | Rigorous prompt engineering, persona consistency tests |
| No progress indicator for debrief | User thinks app is broken during generation | Progressive loading with skeleton states |
| 7 agents with similar names | User cannot differentiate "Story Architect" vs "Supportive Coach" | Add agent comparison, preview descriptions, recommendation quiz |

---

## "Looks Done But Is Not" Checklist

- [ ] **Transcript Capture:** Often missing utterance merging - verify consecutive same-speaker entries are combined
- [ ] **STAR Evaluation:** Often applied to all questions - verify only behavioral questions get STAR scores
- [ ] **Pattern Detection:** Often claims patterns on 2 instances - verify threshold of 3+ for "pattern" label
- [ ] **Agent Boundaries:** Often bleeding between personas - verify each agent respects its "Boundaries" section from spec
- [ ] **Debrief Source:** Often uses resume/JD - verify debrief generator receives transcript, not documents
- [ ] **Agent-Specific Timing:** Often ignores agent duration expectations - verify "Drill Sergeant" can complete 25 questions, "Story Architect" can do deep dives

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong debrief source | MEDIUM | Re-generate debrief from stored transcript (if available), otherwise re-run interview |
| Agent persona drift | LOW | Restart interview with correct agent selection |
| Transcript fragmentation | HIGH | Requires re-architecture of transcription handling; existing transcripts are corrupted |
| Pattern detection hallucination | LOW | Re-run analysis with stricter thresholds, add confidence labels |
| UI mismatch with agent mode | MEDIUM | Patch agent selection to mode mapping, may need new UI components |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Wrong debrief source | Phase 1 (Transcript Capture) | Unit test: `generateDebrief()` receives transcript, not resume |
| Agent persona drift | Phase 2 (Agent System) | Integration test: Run 5 interviews per agent, check behavior consistency |
| Transcript fragmentation | Phase 1 (Transcript Capture) | Visual test: Single utterance appears as one entry in transcript array |
| STAR on non-behavioral | Phase 3 (STAR Evaluation) | Unit test: Icebreaker questions have no STAR scores |
| Pattern detection hallucination | Phase 3 (Analysis Layer) | Manual test: 2-instance "patterns" are labeled "tendency", not "pattern" |
| Agent/UI mismatch | Phase 2 (Agent System) | E2E test: Each agent type respects its interview mode |

---

## Sources

- **Existing codebase analysis:** `lib/geminiLiveClient.ts`, `lib/personalities.ts`, `lib/promptBuilder.ts`, `components/InterviewScreen.tsx`, `components/DebriefScreen.tsx`
- **Project specification:** `.planning/PROJECT.md`, `.planning/milestones/ideas-for-v3`
- **LLM agent persona patterns:** Established prompt engineering principles for role consistency
- **Real-time transcription handling:** WebSocket streaming best practices for utterance buffering
- **Personal experience:** Common patterns in interview/coaching AI applications

---
*Pitfalls research for: Multi-Agent Interview System with Transcript-Based Debrief*
*Researched: 2026-03-23*