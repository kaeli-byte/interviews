# FEATURES.md

## Table Stakes (Required for v1)
- Text area input for copying and pasting a resume directly.
- Text area input for copying and pasting a job description directly.
- File upload capabilities (PDF/Word) to auto-fill the text areas.
- Pass the combined data into the Gemini voice session before starting.
- Distinctly update the AI's instruction prompt to start with an icebreaker based on this data.

## Differentiators
- Automated parsing error handling (e.g. telling the user the PDF was an image vs text).
- Showing the extracted text for the user to edit before beginning the interview.

## Anti-features
- Storing the uploaded documents in a remote database or cloud storage (S3) is an anti-feature due to privacy concerns and scope creep.
