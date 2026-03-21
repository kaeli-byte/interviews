# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## pdf-parse-esm-import-error — Next.js 16 Turbopack cannot resolve pdf-parse and mammoth imports (Export default doesn't exist)
- **Date:** 2026-03-21
- **Error patterns:** Export default doesn't exist, pdf-parse, mammoth, ESM import error, Turbopack
- **Root cause:** pdf-parse@2.4.5 ESM build exports named `PDFParse` class (not default export); mammoth@1.12.0 is CommonJS-only with no ESM entry point. Route used incorrect namespace imports (`import * as pdfParse from 'pdf-parse'`) expecting a default export that doesn't exist.
- **Fix:** Changed pdf-parse import to named import `import { PDFParse } from 'pdf-parse'` and instantiated class with `new PDFParse({ data: buffer })`. Changed mammoth to dynamic import `await import('mammoth')` for CommonJS compatibility in ESM context.
- **Files changed:** app/api/parse-document/route.ts
---
