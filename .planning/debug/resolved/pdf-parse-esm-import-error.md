---
status: verifying
trigger: "Next.js 16 Turbopack cannot resolve pdf-parse and mammoth imports - Export default doesn't exist"
created: 2026-03-21T00:00:00.000Z
updated: 2026-03-21T00:06:00.000Z
---

## Current Focus
<!-- OVERWRITE on each update - reflects NOW -->

hypothesis: CONFIRMED - pdf-parse ESM uses named export `PDFParse` class (not default); mammoth is CommonJS only requiring dynamic import in ESM context
test: VERIFIED - Build compiles successfully
expecting: Fix is complete
next_action: Update resolution and archive

## Symptoms
<!-- Written during gathering, then IMMUTABLE -->

expected: API route imports pdf-parse and mammoth, parses uploaded PDF/Word files
actual: Build fails with "Export default doesn't exist in target module" for both imports
errors:
  - "The export default was not found in module [project]/node_modules/pdf-parse/dist/pdf-parse/esm/index.js"
  - "Did you mean to import Rectangle?"
  - "All exports of the module are statically known"
reproduction: Run npm run dev, Next.js Turbopack build fails on app/api/parse-document/route.ts
started: Started after Plan 01-02 execution installed pdf-parse@2.4.5 and mammoth@1.12.0

## Eliminated
<!-- APPEND only - prevents re-investigating -->

## Evidence
<!-- APPEND only - facts discovered -->

- timestamp: 2026-03-21T00:00:00.000Z
  checked: node_modules/pdf-parse/dist/pdf-parse/esm/index.js
  found: Exports are: `export { PDFParse }; export { VerbosityLevel }; export * from './Exception.js'; export * from './geometry/index.js';` - NO default export
  implication: Code using `import * as pdfParse from 'pdf-parse'` or `import pdfParse from 'pdf-parse'` will fail - must use named import `import { PDFParse } from 'pdf-parse'`

- timestamp: 2026-03-21T00:01:00.000Z
  checked: node_modules/mammoth/package.json
  found: main: "./lib/index.js", no "exports" field, no "module" field, no ESM entry point
  implication: mammoth is CommonJS only; Next.js Turbopack may have issues with CJS in ESM context

- timestamp: 2026-03-21T00:02:00.000Z
  checked: app/api/parse-document/route.ts
  found: Uses `import * as pdfParse from 'pdf-parse'` and `import * as mammoth from 'mammoth'`, then calls `pdfParse.default()` and `mammoth.default.extractRawText()`
  implication: Import syntax is wrong for both packages

- timestamp: 2026-03-21T00:03:00.000Z
  checked: node_modules/pdf-parse/dist/pdf-parse/esm/PDFParse.js
  found: PDFParse is a class with constructor taking options (data: Uint8Array/Buffer, etc.). Method `getText(params)` returns Promise with extracted text
  implication: Usage should be `const pdf = new PDFParse({ data: buffer }); const result = await pdf.getText();`

- timestamp: 2026-03-21T00:04:00.000Z
  checked: node_modules/mammoth/lib/index.js
  found: CommonJS exports with `exports.extractRawText = ...`. Function signature: `extractRawText(input)` where input can be `{ buffer: Buffer }`
  implication: In ESM context, need dynamic import: `const mammoth = await import('mammoth')` then `mammoth.extractRawText({ buffer })`

- timestamp: 2026-03-21T00:05:00.000Z
  checked: next build output
  found: "Compiled successfully in 38.7s" - no ESM import errors
  implication: Fix is working - imports now resolve correctly

## Resolution
<!-- OVERWRITE as understanding evolves -->

root_cause: pdf-parse@2.4.5 ESM build exports named `PDFParse` class (not default export); mammoth@1.12.0 is CommonJS-only with no ESM entry point. Route used incorrect namespace imports (`import * as pdfParse from 'pdf-parse'`) expecting a default export that doesn't exist.
fix: Changed pdf-parse import to named import `import { PDFParse } from 'pdf-parse'` and instantiated class with `new PDFParse({ data: buffer })`. Changed mammoth to dynamic import `await import('mammoth')` for CommonJS compatibility in ESM context.
verification: Build compiles successfully: "Compiled successfully in 38.7s" with no ESM import errors
files_changed:
  - app/api/parse-document/route.ts
