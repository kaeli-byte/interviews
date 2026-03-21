---
phase: 01-ui-extraction
plan: 02
type: execute
wave: 1
depends_on: []
files_modified: [package.json, app/api/parse-document/route.ts, lib/documentParser.ts]
autonomous: true
requirements: [PROC-01, PROC-03]
---

<objective>
Create server-side document parsing API route and validation utilities for PDF/Word file processing.

Purpose: Enable file upload parsing (PROC-01) and empty text detection (PROC-03) using Node.js libraries.
Output: API endpoint at /api/parse-document and validation utility functions.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-ui-extraction/01-RESEARCH.md
@lib/utils.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install document parsing dependencies</name>
  <files>package.json</files>
  <read_first>
    - package.json (current dependencies)
  </read_first>
  <action>
    Install the required npm packages for server-side document parsing:
    ```bash
    npm install pdf-parse mammoth
    ```

    - pdf-parse (v2.4.5): PDF text extraction for Node.js, handles text-layer PDFs
    - mammoth (v1.12.0): Word .docx text extraction, semantic extraction ignoring styling

    These are Node.js-only libraries and must run in API routes, not client-side.
  </action>
  <verify>
    <automated>npm list pdf-parse mammoth</automated>
  </verify>
  <done>
    - pdf-parse installed and appears in package.json dependencies
    - mammoth installed and appears in package.json dependencies
  </done>
</task>

<task type="auto">
  <name>Task 2: Create document parsing API route</name>
  <files>app/api/parse-document/route.ts</files>
  <read_first>
    - .planning/phases/01-ui-extraction/01-RESEARCH.md (Pattern 1: Server-Side File Parsing API)
  </read_first>
  <action>
    Create the Next.js API route at app/api/parse-document/route.ts with:

    ```typescript
    import { NextRequest, NextResponse } from 'next/server'
    import pdfParse from 'pdf-parse'
    import mammoth from 'mammoth'

    export async function POST(request: NextRequest) {
      const formData = await request.formData()
      const file = formData.get('file') as File

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Validate file type
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      if (!validTypes.includes(file.type)) {
        return NextResponse.json(
          { error: 'Unsupported file type. Please upload a PDF or Word document.' },
          { status: 400 }
        )
      }

      try {
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        let text = ''

        if (file.type === 'application/pdf') {
          const data = await pdfParse(buffer)
          text = data.text
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          const result = await mammoth.extractRawText({ buffer })
          text = result.value
        }

        // Validate extracted text
        const isEmpty = !text || text.trim().length === 0
        const cleaned = text.replace(/[\s\n\r]+/g, '')
        const isNonsense = cleaned.length < 20

        return NextResponse.json({
          text: text || '',
          success: true,
          isEmpty: isEmpty || isNonsense
        })
      } catch (error) {
        console.error('Parse error:', error)
        return NextResponse.json(
          { error: 'Failed to parse document. The file may be encrypted or corrupted.' },
          { status: 500 }
        )
      }
    }
    ```

    The route:
    - Accepts FormData with a 'file' field
    - Validates MIME type (PDF or .docx only)
    - Uses pdf-parse for PDFs, mammoth for .docx
    - Returns { text, success, isEmpty } where isEmpty flags empty/nonsense extraction
  </action>
  <verify>
    <automated>ls app/api/parse-document/route.ts</automated>
  </verify>
  <done>
    - app/api/parse-document/route.ts exists
    - Exports POST async function
    - Handles 'application/pdf' with pdf-parse
    - Handles 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' with mammoth
    - Returns JSON with { text, success, isEmpty } structure
  </done>
</task>

<task type="auto">
  <name>Task 3: Create document validation utility</name>
  <files>lib/documentParser.ts</files>
  <read_first>
    - .planning/phases/01-ui-extraction/01-RESEARCH.md (Validation Utility for Empty Text Detection)
    - lib/utils.ts (existing utility pattern)
  </read_first>
  <action>
    Create lib/documentParser.ts with validation utilities for PROC-03:

    ```typescript
    /**
     * Validates extracted document text for minimum content quality
     * Returns true if text appears to contain meaningful content
     */
    export function isValidExtractedText(text: string): boolean {
      if (!text || text.trim().length === 0) {
        return false
      }

      // Remove whitespace and check minimum length
      const cleaned = text.replace(/[\s\n\r]+/g, '')
      if (cleaned.length < 20) {
        return false
      }

      // Check if mostly gibberish (high special char ratio)
      const specialCharRatio = (cleaned.match(/[^a-zA-Z0-9]/g) || []).length / cleaned.length
      if (specialCharRatio > 0.5) {
        return false
      }

      return true
    }

    /**
     * Checks if text is empty or nonsense (image-only PDF, corrupted file, etc.)
     */
    export function isEmptyOrNonsense(text: string): boolean {
      return !isValidExtractedText(text)
    }

    export const EMPTY_TEXT_THRESHOLD = 20 // minimum meaningful characters
    ```
  </action>
  <verify>
    <automated>ls lib/documentParser.ts</automated>
  </verify>
  <done>
    - lib/documentParser.ts exists
    - Exports isValidExtractedText function
    - Exports isEmptyOrNonsense function
    - Exports EMPTY_TEXT_THRESHOLD constant
  </done>
</task>

</tasks>

<verification>
- API route responds to POST with FormData file
- PDF files return extracted text
- .docx files return extracted text
- Empty/corrupt files return isEmpty: true
- Validation utilities correctly identify empty/nonsense text
</verification>

<success_criteria>
- pdf-parse and mammoth installed (npm list shows versions)
- app/api/parse-document/route.ts exists with correct MIME type handling
- lib/documentParser.ts exports validation functions
</success_criteria>

<output>
After completion, create `.planning/phases/01-ui-extraction/01-02-SUMMARY.md`
</output>
