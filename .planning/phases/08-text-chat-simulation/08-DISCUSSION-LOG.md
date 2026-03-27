# Phase 8: Text Chat Simulation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 08-text-chat-simulation
**Areas discussed:** Chat UI, Speed Control, Backend, Stop Behavior, Message Timing, End Trigger, Interviewer Selection, Question Count

---

## Chat UI Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Side-by-side bubbles | Candidate on left, interviewer on right — familiar messaging app pattern | |
| Single column with labels | All messages in one column with speaker labels above each | |
| Timeline view | Timeline with timestamps and speaker avatars | |
| Use existing interview page | Reuse InterviewScreen component — no new UI needed | ✓ |

**User's choice:** Use existing interview page
**Notes:** No need to add new UI — adapt existing InterviewScreen for simulation mode

---

## Speed Default

| Option | Description | Selected |
|--------|-------------|----------|
| 1x default | Simulates real-time pacing — user can absorb each message before next appears | ✓ |
| 1.5x default | Faster for users who want to scan quickly | |
| Prompt for speed at start | User picks speed before simulation starts | |

---

## Backend Communication

| Option | Description | Selected |
|--------|-------------|----------|
| Alternating API calls | Each AI 'turn' is one Gemini call — interviewer generates question, then candidate responds — alternating loop | ✓ |
| Single batch generation | One Gemini call generates full conversation — faster but less dynamic | |
| Parallel pipelining | Generate next question while candidate is 'responding' — more complex | |

---

## Stop Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Immediate stop + debrief | Stop immediately, generate debrief with current Q/A pairs | ✓ |
| Graceful finish current exchange | Let current Q/A pair finish, then stop | |
| No stop until complete | No partial debrief — user must let simulation complete | |

---

## Message Appearance

| Option | Description | Selected |
|--------|-------------|----------|
| Stream each message | Each message appears as it's generated — realistic | ✓ |
| Show complete messages only | Each message appears all at once after generation | |
| Stream + thinking delays | Each message streams + brief pause between turns | |

---

## End Trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Duration timer | Based on selected duration from setup (10-30 min) | |
| Question count | After N question-answer pairs (e.g., 5-7 questions) | ✓ |
| AI interviewer decides | Interviewer decides when interview feels complete | |

---

## Interviewer Personas

| Option | Description | Selected |
|--------|-------------|----------|
| Existing 7 agents | Use the 7 agents from Phase 5 with text-based prompts | ✓ |
| New simulation-specific prompts | Create new simulation-specific interviewer prompts | |
| Default only | Just use default Hiring Manager for simulation | |

---

## Question Count

| Option | Description | Selected |
|--------|-------------|----------|
| 5 questions | Shorter sessions, good for quick practice | ✓ |
| 7 questions | Matches typical interview depth | |
| 10 questions | Longer sessions, more thorough | |
| User-configurable | Let user choose question count in setup | |

---

## Speed Effect

| Option | Description | Selected |
|--------|-------------|----------|
| Affects message timing only | Delay between messages is shorter at 1.5x/2x | ✓ |
| Affects streaming speed | Messages appear faster (streaming speed increases) | |
| Both timing and streaming | Both message timing and streaming speed adjust | |

---

## Claude's Discretion

None — all decisions were user-selected.

## Deferred Ideas

None — discussion stayed within phase scope.