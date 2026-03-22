# STACK.md

## Target Feature Stack
Adding Resume/JD upload and parsing to Next.js + Gemini Live.

1. **Text Parsing (Client or Server)**
- `pdf-parse`: Good for server-side Next.js API Routes (easier integration, but requires a server roundtrip).
- `pdfjs-dist`: Good for client-side extraction without needing API routes (more complex bundler setup in Next.js).
- `mammoth`: Standard for Word (`.docx`) extraction.

2. **File Upload UI**
- `react-dropzone`: The standard for drag-and-drop file upload experiences in React.
- Standard `<input type="file" />` combined with Shadcn's visual libraries if we want to minimize dependencies.

3. **Gemini Configuration**
- `systemInstruction` field in the Gemini Live client connection payload.
