---
phase: 04-transcript-foundation
plan: 01
subsystem: transcript
tags: [typescript, transcript-processing, qa-pairing, utterance-merging]

# Dependency graph
requires:
  - phase: 03-layout-system
    provides: Layout foundation for interview screens
provides:
  - QAPair type definition for downstream debrief
  - UtteranceAccumulator for buffering speech chunks
  - SessionStats for debrief metadata
  - mergeUtterances function for combining fragmented chunks
  - createQAPairs function for interviewer->candidate pairing
  - processTranscript pipeline function
affects: [phase-5-agent-system, phase-6-star-analysis]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Turn-based utterance merging per D-01
    - Sequential Q/A pairing per D-02
    - crypto.randomUUID fallback for unique IDs

key-files:
  created:
    - lib/transcriptProcessor.ts
    - lib/transcriptProcessor.test.ts
  modified:
    - lib/types.ts

key-decisions:
  - "Used crypto.randomUUID fallback instead of nanoid to avoid dependency"
  - "Pass raw entries to calculateSessionStats for accurate duration (merged entries only have start timestamps)"

patterns-established:
  - "Utterance merging: accumulate chunks until speaker changes"
  - "Q/A pairing: sequential interviewer turn + following candidate turn = 1 Q/A pair"
  - "ID generation: crypto.randomUUID with fallback for unique QAPair IDs"

requirements-completed: [TRANS-03, TRANS-04]

# Metrics
duration: 8min
completed: 2026-03-24
---

# Phase 04 Plan 01: Type System & Transcript Processing Summary

**QAPair type definition and transcript processing functions for merging fragmented speech chunks into complete utterances and pairing interviewer questions with candidate responses.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-23T15:52:08Z
- **Completed:** 2026-03-24T00:01:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added QAPair, UtteranceAccumulator, and SessionStats type definitions to lib/types.ts
- Implemented mergeUtterances() to combine consecutive same-speaker chunks per D-01
- Implemented createQAPairs() for sequential interviewer->candidate pairing per D-02
- Implemented calculateSessionStats() for duration, word counts, and question count
- Implemented processTranscript() as full pipeline for debrief integration
- Created comprehensive test suite with 15 passing tests

## Task Commits

Each task was committed atomically:

1. **Task 1: Add QAPair and UtteranceAccumulator types to lib/types.ts** - `31a7b95` (feat)
2. **Task 2: Create transcriptProcessor.ts with mergeUtterances and createQAPairs functions** - `1810d70` (test), `3e324ad` (feat)

_Note: TDD tasks have multiple commits (test -> feat)_

## Files Created/Modified

- `lib/types.ts` - Added QAPair, UtteranceAccumulator, SessionStats interfaces for transcript structure
- `lib/transcriptProcessor.ts` - Core transcript processing logic with mergeUtterances, createQAPairs, calculateSessionStats, processTranscript
- `lib/transcriptProcessor.test.ts` - Comprehensive test suite with 15 tests covering all functions

## Decisions Made

- Used crypto.randomUUID fallback instead of adding nanoid dependency - reduces bundle size while providing unique IDs
- Passed raw entries to calculateSessionStats instead of merged entries - ensures accurate duration calculation since merged entries only preserve start timestamps

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Initial duration calculation returned 2000ms instead of expected 2500ms because merged entries only preserve start timestamps. Fixed by passing raw entries to calculateSessionStats in processTranscript pipeline.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Type system and processing logic ready for integration with debrief generator
- 04-02-PLAN.md can now use QAPair type and processTranscript() for debrief generation
- All functions exported and tested for downstream consumption

---
*Phase: 04-transcript-foundation*
*Completed: 2026-03-24*