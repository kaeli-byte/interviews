# Roadmap

**2 phases** | **11 requirements mapped** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | UI & Extraction | Expand SetupScreen UI and parse user files | INPT-01, INPT-02, INPT-03, INPT-04, PROC-01, PROC-02, PROC-03 | 5 |
| 2 | Prompt Engineering | Inject context and alter AI personality | INTG-01, INTG-02, INTG-03, INTG-04 | 4 |

### Phase Details

**Phase 1: UI & Extraction**
Goal: Expand SetupScreen UI and parse user files
Requirements: INPT-01, INPT-02, INPT-03, INPT-04, PROC-01, PROC-02, PROC-03
Success criteria:
1. User can paste text or upload a PDF/Word file into the Setup Screen for Resume and JD
2. App successfully reads the text from the files using client-side or Next.js API parsing
3. Parsed text populates into the text areas so the user can edit it
4. User receives an immediate warning if the document parsing returns empty or nonsense strings
5. User can select 1 of 4 distinct AI personalities from a Dropdown/Radio group

**Plans:** 4 plans
- [ ] 01-ui-extraction-01-PLAN.md — Add shadcn/ui components (Textarea, Select, Alert)
- [ ] 01-ui-extraction-02-PLAN.md — Create document parsing API route and validation utilities
- [ ] 01-ui-extraction-03-PLAN.md — Expand SetupScreen with text areas, file dropzone, personality selector
- [ ] 01-ui-extraction-04-PLAN.md — Lift resume, JD, personality state to MyCareerApp parent component

**Phase 2: Prompt Engineering**
Goal: Inject context and alter AI personality
Requirements: INTG-01, INTG-02, INTG-03, INTG-04
Success criteria:
1. Parent component (`MyCareerApp`) correctly holds the state of the Resume, JD, and Personality choice
2. Setup Screen payload (strings) seamlessly passes down to `geminiLiveClient.ts` during WS init
3. The AI successfully alters its system instruction to greet the user natively based on their unique resume details (icebreaker)
4. The AI successfully alters its tone (Warm, Professional, Direct, Coaching) based on the user's personality selection
