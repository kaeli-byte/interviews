# Requirements: My-Career AI App - Interview Refinement

**Defined:** 2026-03-21
**Core Value:** The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description context.

## v1 Requirements

### Data Input 
- [ ] **INPT-01**: SetupScreen includes a text area for pasting a Resume.
- [ ] **INPT-02**: SetupScreen includes a text area for pasting a Job Description.
- [ ] **INPT-03**: SetupScreen includes a file dropzone allowing users to upload PDF/Word files for their Resume/JD.
- [ ] **INPT-04**: SetupScreen includes a personality selector for the AI interviewer with four choices: Warm/encouraging, Professional/neutral, Direct/challenging, and Coaching-focused.

### Processing
- [ ] **PROC-01**: Uploaded files are parsed to extract raw text (either client-side or via a lightweight API route).
- [ ] **PROC-02**: Extracted text auto-populates the Resume and JD text areas, allowing the user to review and manually edit the parsed context before proceeding.
- [ ] **PROC-03**: The app warns the user visually if file extraction yields basically no text (e.g., an image-only PDF).

### Integration
- [ ] **INTG-01**: The Resume string, Job Description string, and Interviewer Personality selection are stored in the parent component's state (`MyCareerApp.tsx`).
- [ ] **INTG-02**: These values are passed into `geminiLiveClient.ts` as system instructions/context when the WebSocket connects.
- [ ] **INTG-03**: The AI prompt strictly instructs the agent to use the provided Resume/JD to open with a personalized, friendly icebreaker question before diving into the main interview.
- [ ] **INTG-04**: The AI prompt dynamically applies constraints based on the user's selected Personality to alter its tone and feedback style throughout the session.

## v2 Requirements
- Saving user profiles/resumes to a database so they don't have to upload it every time.
- Generating a detailed PDF score report after the interview based on the selected personality.

## Out of Scope
| Feature | Reason |
|---------|--------|
| Multi-modal Video | Focus is purely on conversational logic right now. Adding video is too complex for this phase. |
| Automatic JD fetching | Scraping a JD from a LinkedIn URL is heavily rate-limited/blocked. Manual copy-paste is safer. |

## Traceability
| Requirement | Phase | Status |
|-------------|-------|--------|
| INPT-01     |       | Pending |
| INPT-02     |       | Pending |
| INPT-03     |       | Pending |
| INPT-04     |       | Pending |
| PROC-01     |       | Pending |
| PROC-02     |       | Pending |
| PROC-03     |       | Pending |
| INTG-01     |       | Pending |
| INTG-02     |       | Pending |
| INTG-03     |       | Pending |
| INTG-04     |       | Pending |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 0
- Unmapped: 11 ⚠️

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after initial definition*
