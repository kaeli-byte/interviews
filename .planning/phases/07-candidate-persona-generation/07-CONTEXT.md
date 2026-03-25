# Phase 7: Candidate Persona Generation - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a system that extracts candidate information from resumes and generates a coherent AI persona for interview simulation. The persona must be reviewable/editable by users before simulation starts.

</domain>

<decisions>
## Implementation Decisions

### Extraction Method
- **D-01:** AI-powered extraction using Gemini (one API call extracts all persona fields)
- Rationale: Inference value (communication style, knowledge gaps) justifies cost; Gemini already integrated for interview/debrief

### Persona Structure
- **D-02:** CandidatePersona type includes:
  - Experience level: `junior` | `mid` | `senior` | `staff`
  - Skills: Categorized list (Technical, Soft, Domain) — top 5-8 per category
  - Communication style: Pair `(Formal|Casual, Technical|Narrative)`
  - Knowledge gaps: Categories with 2-3 specific missing skills each

### Persona Review UI
- **D-03:** Dedicated PersonaScreen between Setup and Simulation
- All fields editable — user can override AI extraction
- Card-based display matching existing design system

### Knowledge Gap Depth
- **D-04:** Category-level gaps (3-5 categories with 2-3 specific missing skills each)
- Resume + JD required for persona extraction (enables gap analysis)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Types
- `lib/types.ts` — AgentId, AgentDefinition patterns to follow
- `lib/agents.ts` — Agent persona structure for reference

### Existing Patterns
- `lib/promptBuilder.ts` — XML-delimited context injection pattern
- `lib/documentParser.ts` — Document validation utilities

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/types.ts` — Type system patterns; extend with CandidatePersona
- `lib/agents.ts` — Persona definition patterns (persona, tone, behaviors)
- `lib/promptBuilder.ts` — XML context injection, MAX_CONTEXT_CHARS=8000
- `lib/documentParser.ts` — isValidExtractedText, isEmptyOrNonsense

### Established Patterns
- Agent definitions use structured objects with persona/tone/boundaries
- Context injection uses XML tags (`<resume>`, `<jobDescription>`)
- 8000 char truncation per field for token safety

### Integration Points
- New PersonaScreen between SetupScreen and SimulationScreen
- Persona extraction API route (similar to existing document parsing)
- CandidatePersona type extends existing type system

</code_context>

<specifics>
## Specific Ideas

- Persona should feel like a "character sheet" for the AI candidate
- Communication style affects how the AI candidate phrases responses in simulation
- Knowledge gaps highlight areas where the AI candidate should struggle/show uncertainty

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 07-candidate-persona-generation*
*Context gathered: 2026-03-25*