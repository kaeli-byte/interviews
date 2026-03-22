# SUMMARY.md

## Synthesis
To achieve a personalized AI interview icebreaker, we need to bridge the gap between user-provided documents and the Gemini Live WebSocket initialization.

The safest, most privacy-conscious path is to extract text from PDFs/Word docs entirely on the client or via a lightweight Next.js API route, maintaining the extracted content in React State before injecting it into the Gemini `systemInstruction` prop. This avoids needing backend storage.

However, the UI should immediately display the extracted text back to the user to allow manual editing. This mitigates the risk of bad parsing (e.g., image-based PDFs failing), so they aren't surprised by a blank context.

Lastly, the AI prompt engineering must be extremely explicit: "You have received the user's resume and job description. DO NOT begin a technical interview yet. Instead, greet them warmly, reference one specific detail from their resume as an icebreaker, and ask a single friendly open-ended question to start."
