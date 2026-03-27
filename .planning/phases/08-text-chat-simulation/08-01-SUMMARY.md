---
phase: 08-text-chat-simulation
plan: 01
subsystem: simulation-core
tags: [types, prompts, runner, gemini-api]
requires: [CandidatePersona, AgentId, QAPair, TranscriptEntry]
provides: [SimulationRunner, SimulationSession, simulationPrompts]
affects: [debrief-generator, simulation-ui]
tech-stack:
  added: [gemini-2.0-flash, abort-controller]
  patterns: [alternating-api-calls, state-callbacks]
key-files:
  created: [lib/simulationPrompts.ts, lib/simulationRunner.ts]
  modified: [lib/types.ts]
decisions:
  - Use gemini-2.0-flash for both interviewer and candidate agents
  - Use AbortController for clean simulation cancellation
  - Speed affects message timing (1.5s base at 1x), not streaming
metrics:
  duration: 10m
  completed: 2026-03-25
---

# Phase 08 Plan 01: Types & Simulation Core Summary

One-liner: Core simulation engine with alternating Gemini API calls between interviewer and candidate agents, producing TranscriptEntry[] for debrief integration.

## Completed Tasks

| Task | Name | Commit | Files |
| ---- | ---- | ------ | ----- |
| 1 | Add simulation types | 60f8aa9 | lib/types.ts |
| 2 | Create simulation prompts | 9f48659 | lib/simulationPrompts.ts |
| 3 | Create simulation runner | 5bb2e6b | lib/simulationRunner.ts |

## Key Outputs

### Types Added to lib/types.ts

- `SimulationSpeed` - '1x' | '1.5x' | '2x' for message pacing
- `SimulationMessage` - Single message with id, speaker, text, timestamp, isComplete
- `SimulationState` - Tracks messages, qaPairs, questionCount, running status
- `SimulationConfig` - Parameters including candidatePersona, interviewerAgentId, resume, jobDescription
- `SimulationSession` - Complete or partial simulation run with id, config, state, timestamps

### Simulation Prompts (lib/simulationPrompts.ts)

- `buildInterviewerPrompt(agentId, resume, jd)` - Creates agent-specific interviewer system prompt
- `buildCandidatePrompt(persona)` - Creates persona-driven candidate system prompt
- `buildFollowUpPrompt(role, history)` - Context for continued conversation

### Simulation Runner (lib/simulationRunner.ts)

- `SimulationRunner` class with state management and callbacks
- `runSimulation()` - Alternating API calls, returns TranscriptEntry[]
- `stopSimulation()` - Immediate halt with partial transcript
- Speed-based delays (1.5s at 1x, 1s at 1.5x, 0.75s at 2x)
- Auto-stops at maxQuestions (default 5 per D-03)

## Verification Results

- TypeScript compilation: All files compile without errors
- Types: SimulationSpeed, SimulationMessage, SimulationState, SimulationConfig, SimulationSession defined
- Prompts: buildInterviewerPrompt, buildCandidatePrompt exported and functional
- Runner: SimulationRunner class with runSimulation/stopSimulation methods

## Deviations from Plan

None - plan executed exactly as written.

## Self-Check: PASSED

- Files created: lib/simulationPrompts.ts, lib/simulationRunner.ts
- Files modified: lib/types.ts
- Commits exist: 60f8aa9, 9f48659, 5bb2e6b