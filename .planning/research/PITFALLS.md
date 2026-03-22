# PITFALLS.md

## Pitfall 1: Token Limits and Latency
- Passing a massive 5-page resume and a long JD into the system prompt might increase TTFT (Time To First Token) for the Gemini API responses.
- **Prevention**: Pre-process the parsed text to remove heavy formatting, and consider warning the user if the copy-paste is excessively long (>10,000 words).

## Pitfall 2: Bad PDF Extraction (Images)
- User uploads a PDF that is just screenshots of their resume. A client-side parser will return empty strings.
- **Prevention**: Test the extracted string length. If length < 50 characters but file was uploaded, show a visual warning "Could not read text from this PDF. Please paste text directly."

## Pitfall 3: AI Ramble (Hallucination on start)
- Without strict instructions, providing two huge context documents might cause the AI to immediately jump into deep technical grilling or summarize the entire resume, rather than breaking the ice.
- **Prevention**: The prompt string must strictly enforce behavior: "LIMIT your first response to ONLY an icebreaker. Ask ONE question. Wait for the user to respond."
