# M001: UI & Extraction + Prompt Engineering

**Vision:** An AI-driven mock interview application that uses Google's Gemini Multimodal Live API to conduct real-time voice interviews, with personalized icebreakers generated from user-provided resume and job description context.

## Success Criteria

1. User can paste text or upload a PDF/Word file for Resume and Job Description
2. Parsed text populates into text areas for user editing before interview
3. User receives warning if document parsing returns empty content
4. User can select from 4 distinct AI personality modes
5. AI opens with personalized icebreaker referencing resume details
6. AI adapts tone based on personality selection

## Slices

- [x] **S01: UI & Extraction** `risk:medium` `depends:[]`
  > After this: SetupScreen has text areas, file upload, personality selector, and document parsing
- [x] **S02: Prompt Engineering** `risk:medium` `depends:[S01]`
  > After this: Gemini Live receives context-injected system instructions with personality constraints
