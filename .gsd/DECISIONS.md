# Decisions

<!-- Append-only register of architectural and pattern decisions -->

| ID | When | Scope | Decision | Choice | Rationale | Revisable? | Made By |
|----|------|-------|----------|--------|-----------|------------|---------|
| D001 | M001/S01 | library | Validation library | Zod | Type inference, already in deps | No | agent |
| D002 | M001/S01 | arch | Session storage | HTTP-only cookies | Security, SSR compat | Yes — if mobile added | agent |
| D003 | M001/S01 | library | Testing framework | Vitest | Lightweight, fast, Vite-native | No | agent |
| D004 | M001/S01 | pattern | Context delimiters | XML tags | Clear parsing boundaries in system instruction | No | agent |
| D005 | M001/S01 | arch | Document parsing | Server-side API route | Avoid client bundle bloat from pdf-parse/mammoth | No | agent |
| D006 | M001/S01 | pattern | Truncation limit | 8000 chars per field | Safe token limit (~2K tokens) per context field | No | agent |
| D007 | M001/S02 | pattern | Function design | Pure functions for buildSystemInstruction | Testable, deterministic output | No | agent |
| D008 | M001/S01 | library | UI primitives | Base UI | Project already uses @base-ui/react | No | agent |
| D009 | M002 | arch | Real-time metrics | Heuristics from transcript patterns | Reduces complexity and API cost vs. real-time AI analysis | Yes — can add AI analysis later | collaborative |
| D010 | M002 | ux | Transcript Review step | Required (not optional) | Reinforces review → analyze → improve narrative | No | collaborative |
| D011 | M002 | design | Design system scope | All screens | Cohesive experience across Setup, Interview, Transcript Review, Debrief | No | collaborative |
| D012 | M002 | api | Answer analysis format | Structured JSON schema via Gemini | Ensures parseable, consistent analysis output | No | collaborative |