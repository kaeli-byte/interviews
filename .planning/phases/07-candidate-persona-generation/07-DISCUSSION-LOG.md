# Phase 7: Candidate Persona Generation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 07-candidate-persona-generation
**Areas discussed:** Extraction method, Persona structure, Persona review UI, Knowledge gap depth

---

## Extraction Method

| Option | Description | Selected |
|--------|-------------|----------|
| AI-powered (Gemini) | One Gemini call extracts all persona fields — handles varied formats, infers soft skills | ✓ |
| Rule-based parsing | Instant, no cost, but can't detect communication style or nuanced gaps | |
| Hybrid approach | Rules for basics (years, titles), AI for inference (style, gaps) | |

**User's choice:** AI-powered (Gemini)
**Notes:** Inference value justifies cost; Gemini already integrated

---

## Persona Structure - Experience

| Option | Description | Selected |
|--------|-------------|----------|
| Experience level only | Level only: junior/mid/senior/staff — simpler, matches interviewer personas | ✓ |
| Detailed work history | Level + years total + years per role | |

---

## Persona Structure - Skills

| Option | Description | Selected |
|--------|-------------|----------|
| Categorized skill list | Top 5-8 skills extracted from resume, categorized (Technical, Soft, Domain) | ✓ |
| Flat skill list | All skills found, no categorization | |
| Skills by proficiency | Grouped by proficiency level (Expert, Proficient, Familiar) | |

---

## Persona Structure - Communication Style

| Option | Description | Selected |
|--------|-------------|----------|
| Communication style pair | Formal/Casual, Technical/Narrative — affects how AI candidate responds | ✓ |
| Freeform style description | Brief description of detected style traits | |

---

## Persona Structure - Knowledge Gaps

| Option | Description | Selected |
|--------|-------------|----------|
| Gap categories with examples | Missing skills vs JD requirements, grouped by category | ✓ |
| Flat missing skills list | Simple list of missing skills | |
| Gap scores per category | Gap score per category (Technical: 2/5, Leadership: 4/5) | |

---

## Persona Review UI - Location

| Option | Description | Selected |
|--------|-------------|----------|
| Dedicated PersonaScreen | New screen after Setup, before Simulation — shows extracted persona in editable cards | ✓ |
| Inline in SetupScreen | Collapsible panel in SetupScreen, expand to review/edit | |
| Modal dialog | Modal overlay when starting simulation | |

---

## Persona Review UI - Editability

| Option | Description | Selected |
|--------|-------------|----------|
| All fields editable | User can override AI extraction | ✓ |
| Partial editing | Level and style editable, skills/gaps locked | |
| Read-only display | Read-only, user must re-upload resume to change | |

---

## Knowledge Gap Depth - Granularity

| Option | Description | Selected |
|--------|-------------|----------|
| Category-level gaps | 3-5 high-level categories with 2-3 specific missing skills each | ✓ |
| Granular skill matching | Every JD requirement not in resume, detailed list | |
| Gap scores only | Just a gap score per category (Technical: 40%, Leadership: 80%) | |

---

## Knowledge Gap Depth - Source Requirements

| Option | Description | Selected |
|--------|-------------|----------|
| Resume + JD required | Require JD uploaded before extracting persona — enables gap analysis | ✓ |
| Resume only, gaps optional | Extract persona from resume, skip gaps if no JD | |

---

## Claude's Discretion

None — all decisions were user-selected.

## Deferred Ideas

None — discussion stayed within phase scope.