# Requirements: MyCareer App - Interview Refinement

**Core Value:** The AI interviewer must feel conversational, adaptive, and highly personalized from the moment the user starts the interview, accurately grounding its responses in the provided resume and job description context.

## v1 Requirements (Validated)

### Data Input
| ID | Requirement | Status |
|----|-------------|--------|
| INPT-01 | SetupScreen includes a text area for pasting a Resume | validated |
| INPT-02 | SetupScreen includes a text area for pasting a Job Description | validated |
| INPT-03 | SetupScreen includes a file dropzone allowing users to upload PDF/Word files for their Resume/JD | validated |
| INPT-04 | SetupScreen includes a personality selector for the AI interviewer with four choices: Warm/encouraging, Professional/neutral, Direct/challenging, and Coaching-focused | validated |

### Processing
| ID | Requirement | Status |
|----|-------------|--------|
| PROC-01 | Uploaded files are parsed to extract raw text (either client-side or via a lightweight API route) | validated |
| PROC-02 | Extracted text auto-populates the Resume and JD text areas, allowing the user to review and manually edit the parsed context before proceeding | validated |
| PROC-03 | The app warns the user visually if file extraction yields basically no text (e.g., an image-only PDF) | validated |

### Integration
| ID | Requirement | Status |
|----|-------------|--------|
| INTG-01 | The Resume string, Job Description string, and Interviewer Personality selection are stored in the parent component's state (MyCareerApp.tsx) | validated |
| INTG-02 | These values are passed into geminiLiveClient.ts as system instructions/context when the WebSocket connects | validated |
| INTG-03 | The AI prompt strictly instructs the agent to use the provided Resume/JD to open with a personalized, friendly icebreaker question before diving into the main interview | validated |
| INTG-04 | The AI prompt dynamically applies constraints based on the user's selected Personality to alter its tone and feedback style throughout the session | validated |

---

## v1.1 Requirements (Active) — M002: Interview Transcript & Analysis

### Live Transcript (During Interview)
| ID | Requirement | Status | Primary Owner | Notes |
|----|-------------|--------|---------------|-------|
| R003 | Live transcript display during interview with toggleable visibility | active | M002/S01 | Panel slides in/out on toggle |
| R004 | Speaker labels (Interviewer/Candidate) with timestamps for each transcript entry | active | M002/S01 | Format: MM:SS relative to interview start |
| R005 | Voice visualizer component showing AI speech activity | active | M002/S01 | Animated bars in glassmorphic container |
| R006 | Real-time feedback grid showing Confidence, Pace, and Next Step Tip | active | M002/S02 | Derived from transcript patterns (heuristics) |

### Transcript Review & Export (After Interview)
| ID | Requirement | Status | Primary Owner | Notes |
|----|-------------|--------|---------------|-------|
| R007 | Transcript Review screen as required step between Interview and Debrief | active | M002/S03 | User must pass through before debrief |
| R008 | Search/filter capability for transcript | active | M002/S03 | Keyword search with highlighting |
| R009 | Export options: clipboard, markdown, plain text | active | M002/S03 | Download buttons in sidebar |
| R010 | Session metrics display (Duration, Confidence, WPM, Clarity) | active | M002/S03 | Stats card in sidebar |

### Enhanced Debrief with Answer Analysis
| ID | Requirement | Status | Primary Owner | Notes |
|----|-------------|--------|---------------|-------|
| R011 | Overall performance score (X/100) | active | M002/S04 | Derived from answer quality scores |
| R012 | STAR compliance indicator per answer | active | M002/S04 | Percentage for behavioral questions |
| R013 | Question-by-question breakdown with strengths and suggestions | active | M002/S04 | Expandable cards per Q/A pair |
| R014 | Quality scores (1-5) per answer | active | M002/S04 | Star rating display |
| R015 | Tone analysis visualization | active | M002/S04 | Circular chart showing tone distribution |
| R016 | Coach's final verdict with actionable next steps | active | M002/S04 | Summary paragraph + recommendations |

### Design System
| ID | Requirement | Status | Primary Owner | Notes |
|----|-------------|--------|---------------|-------|
| R017 | Cognitive Canvas design system applied to all screens | active | M002/S05 | No borders, tonal layering, glassmorphism, Manrope/Inter fonts |

---

## v2 Requirements (Deferred)

| ID | Requirement | Status |
|----|-------------|--------|
| D001 | Saving user profiles/resumes to a database | deferred |
| D002 | Generating detailed PDF score report after interview | deferred |

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-modal Video | Focus is purely on conversational voice flow. Video adds complexity without core value. |
| Automatic JD fetching | Scraping from LinkedIn is heavily rate-limited/blocked. Manual copy-paste is safer. |
| Backend database/auth | Deferred to v2 for user profile persistence |
| Custom fine-tuning | Using Gemini's natural language understanding via prompts |
| Real-time AI analysis during interview | Using heuristics for M002; AI analysis reserved for post-interview |

---

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| INPT-01 | core-capability | validated | M001/S01 | none | validated |
| INPT-02 | core-capability | validated | M001/S01 | none | validated |
| INPT-03 | core-capability | validated | M001/S01 | none | validated |
| INPT-04 | core-capability | validated | M001/S01 | none | validated |
| PROC-01 | core-capability | validated | M001/S01 | none | validated |
| PROC-02 | core-capability | validated | M001/S01 | none | validated |
| PROC-03 | core-capability | validated | M001/S01 | none | validated |
| INTG-01 | integration | validated | M001/S02 | none | validated |
| INTG-02 | integration | validated | M001/S02 | none | validated |
| INTG-03 | integration | validated | M001/S02 | none | validated |
| INTG-04 | integration | validated | M001/S02 | none | validated |
| R003 | primary-user-loop | active | M002/S01 | none | mapped |
| R004 | primary-user-loop | active | M002/S01 | none | mapped |
| R005 | differentiator | active | M002/S01 | none | mapped |
| R006 | differentiator | active | M002/S02 | M002/S01 | mapped |
| R007 | primary-user-loop | active | M002/S03 | M002/S01 | mapped |
| R008 | quality-attribute | active | M002/S03 | none | mapped |
| R009 | primary-user-loop | active | M002/S03 | none | mapped |
| R010 | quality-attribute | active | M002/S03 | M002/S01 | mapped |
| R011 | differentiator | active | M002/S04 | M002/S01 | mapped |
| R012 | differentiator | active | M002/S04 | M002/S01 | mapped |
| R013 | differentiator | active | M002/S04 | M002/S01 | mapped |
| R014 | differentiator | active | M002/S04 | M002/S01 | mapped |
| R015 | differentiator | active | M002/S04 | M002/S01 | mapped |
| R016 | differentiator | active | M002/S04 | M002/S01 | mapped |
| R017 | quality-attribute | active | M002/S05 | S01,S02,S03,S04 | mapped |

## Coverage Summary

- Active requirements: 15
- Mapped to slices: 15
- Validated: 11
- Unmapped active requirements: 0

---
*Migrated from .planning/milestones/v1.0-REQUIREMENTS.md, updated 2026-03-23 for M002*