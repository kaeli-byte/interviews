---
phase: 05-agent-system
plan: 01
subsystem: ai-prompt-engineering

tags: [gemini-live, agent-personas, prompt-engineering, type-definitions]

requires:
  - phase: 04-transcript-foundation
    provides: QAPair structure, debrief integration, transcript processing

provides:
  - 7 interviewer agent persona definitions with full behavioral specs
  - AgentId and AgentDefinition types for type-safe agent selection
  - Updated prompt builder with agent-specific system instructions
  - Boundaries and anti-behaviors for persona drift prevention
  - Backwards compatibility layer for legacy personality field

affects: [05-02, 05-03, interview-flow]

tech-stack:
  added: []
  patterns:
    - Agent persona with boundaries/anti-behaviors for drift prevention
    - Agent type grouping (simulation vs targeted)
    - Legacy personality -> agent ID mapping for backwards compatibility

key-files:
  created:
    - lib/agents.ts
  modified:
    - lib/types.ts
    - lib/promptBuilder.ts
    - lib/promptBuilder.test.ts

key-decisions:
  - "Added backwards compatibility for personality field to prevent build break until 05-02 updates UI"
  - "Re-exported AgentId from agents.ts for convenience"
  - "Grouped agents by type (simulation/targeted) per D-01"

patterns-established:
  - "AgentDefinition includes persona, coreBehaviors, tone, boundaries, edgeCaseHandling"
  - "Boundaries section in prompts prevents persona drift per Pitfall 2"
  - "Agent selection uses DEFAULT_AGENT_ID ('hiring-manager') as fallback"

requirements-completed: [AGENT-02, AGENT-04, AGENT-05]

duration: 10min
completed: 2026-03-23
---

# Phase 5 Plan 01: Agent Definitions Summary

**7 interviewer persona definitions with full behavioral specs and updated prompt builder generating agent-specific system instructions with anti-behaviors**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-23T22:54:00Z
- **Completed:** 2026-03-23T23:04:00Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Created lib/agents.ts with 7 complete agent persona definitions from ideas-for-v3 spec
- Added AgentId, AgentType, and AgentDefinition types to lib/types.ts
- Updated promptBuilder.ts to generate agent-specific prompts with boundaries, tone, and edge case handling
- Implemented backwards compatibility layer for legacy `personality` field

## Task Commits

Each task was committed atomically:

1. **Task 1: Add AgentId and AgentDefinition types** - `0913b6e` (feat)
2. **Task 2: Create lib/agents.ts with 7 agent definitions** - `f2588f5` (feat)
3. **Task 3: Update lib/promptBuilder.ts to use agent definitions** - `0d2d9db` (feat)

## Files Created/Modified

- `lib/types.ts` - Added AgentId, AgentType, AgentDefinition types
- `lib/agents.ts` - NEW: 7 agent definitions with AGENT_SELECTIONS grouping
- `lib/promptBuilder.ts` - Updated to use agent definitions with backwards compatibility
- `lib/promptBuilder.test.ts` - Updated tests for new agent interface and backwards compatibility

## Decisions Made

- **Backwards compatibility:** Added personality-to-agentId mapping to prevent build break until 05-02 updates UI components. Maps: warm->supportive-coach, professional->hiring-manager, direct->high-pressure, coaching->supportive-coach
- **Re-exported AgentId:** Exported AgentId type from agents.ts for convenience, avoiding dual imports
- **Default agent:** hiring-manager is DEFAULT_AGENT_ID as most common use case

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Added backwards compatibility for personality field**
- **Found during:** Task 3 (promptBuilder update)
- **Issue:** Updating PromptContext to use agentId broke TypeScript compilation - InterviewScreen, SetupScreen, MyCareerApp still use `personality` prop
- **Fix:** Added optional `personality` field to PromptContext with mapping function to convert legacy personality values to agent IDs
- **Files modified:** lib/promptBuilder.ts, lib/promptBuilder.test.ts
- **Verification:** TypeScript compilation passes, 13 tests pass
- **Committed in:** 0d2d9db (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking issue)
**Impact on plan:** Essential fix to maintain build stability during transition. Plan 05-02 will update UI components to use selectedAgent, after which the legacy personality field can be deprecated.

## Issues Encountered

None beyond the backwards compatibility issue documented above.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Agent definitions ready for UI integration in 05-02
- Prompt builder generates agent-specific instructions with anti-behaviors
- TypeScript compiles, tests pass
- No blockers for 05-02

---
*Phase: 05-agent-system*
*Completed: 2026-03-23*