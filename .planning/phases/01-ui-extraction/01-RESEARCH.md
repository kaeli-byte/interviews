# Phase 1: UI & Extraction - Research

**Researched:** 2026-03-21
**Domain:** Next.js 16 UI components, PDF/Word document parsing, form state management
**Confidence:** HIGH

## Summary

This phase expands the existing `SetupScreen.tsx` component to add resume/JD text inputs, file upload with parsing, and AI personality selection. The project uses Next.js 16.2.0 with React 19, shadcn/ui (base-ui), and TypeScript.

**Key findings:**
- **File parsing must be server-side** - `pdf-parse` and `mammoth` are Node.js-only libraries; browser-based alternatives like `pdfjs-dist` add significant bundle complexity
- **shadcn/ui has all needed components** - textarea, select/radio-group, alert already available via the project's shadcn setup
- **react-dropzone** is the standard for file uploads with drag-and-drop support
- **State lifts to parent** - Resume, JD, and personality must be stored in `MyCareerApp.tsx` for Phase 2 integration with `geminiLiveClient.ts`

**Primary recommendation:** Use Next.js API routes for file parsing (server-side), react-dropzone for file uploads, shadcn components for UI, and lift all form state to `MyCareerApp.tsx`.

<user_constraints>
## User Constraints (from CONTEXT.md)

*No CONTEXT.md file exists for this phase - no locked decisions or constraints.*
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INPT-01 | SetupScreen includes a text area for pasting a Resume | shadcn `<Textarea>` component with controlled state |
| INPT-02 | SetupScreen includes a text area for pasting a Job Description | shadcn `<Textarea>` component with controlled state |
| INPT-03 | SetupScreen includes a file dropzone allowing users to upload PDF/Word files | react-dropzone + Next.js API route for parsing |
| INPT-04 | SetupScreen includes a personality selector with four choices | shadcn `<Select>` or `<RadioGroup>` component |
| PROC-01 | Uploaded files are parsed to extract raw text | Server-side: `pdf-parse` for PDFs, `mammoth` for .docx |
| PROC-02 | Extracted text auto-populates the Resume and JD text areas | Controlled component state, file-type routing |
| PROC-03 | App warns if file extraction yields no text | shadcn `<Alert>` component with validation logic |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui (base-ui) | 1.3.0 | UI component library | Already installed, uses Radix primitives, matches project style |
| react-dropzone | 15.0.0 | File upload with drag-and-drop | Industry standard, TypeScript support, accessible |
| pdf-parse | 2.4.5 | PDF text extraction (Node.js) | Pure TypeScript, cross-platform, text-only extraction |
| mammoth | 1.12.0 | Word .docx text extraction (Node.js) | Semantic extraction, ignores styling, browser + Node.js |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| shadcn Alert | - | Warning messages | Displaying parsing failure warnings (PROC-03) |
| shadcn Select | - | Dropdown selector | Personality selector (INPT-04) - compact UI |
| shadcn RadioGroup | - | Radio button group | Alternative to Select for personality |
| shadcn Textarea | - | Multi-line text input | Resume/JD paste areas (INPT-01, INPT-02) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pdf-parse (server) | pdfjs-dist (client) | pdfjs-dist adds 500KB+ bundle, complex WASM setup, pdf-parse is simpler |
| mammoth (server) | mammoth.browser (client) | Browser version works but adds bundle weight; server is cleaner |
| react-dropzone | Native `<input type="file">` | No drag-and-drop, worse UX, more manual event handling |
| Next.js API route | Edge Function | Edge has file size limits, API routes have full Node.js support |

**Installation:**
```bash
# UI components (shadcn)
npx shadcn@latest add textarea
npx shadcn@latest add select
npx shadcn@latest add radio-group
npx shadcn@latest add alert

# File parsing (server-side)
npm install pdf-parse mammoth

# File upload
npm install react-dropzone
```

**Version verification:**
```bash
npm view pdf-parse version      # 2.4.5
npm view mammoth version        # 1.12.0
npm view react-dropzone version # 15.0.0
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── api/
│   └── parse-document/
│       └── route.ts         # POST endpoint for file parsing
components/
├── SetupScreen.tsx          # Main form component (expand this)
├── ui/
│   ├── textarea.tsx         # Add via shadcn
│   ├── select.tsx           # Add via shadcn
│   ├── radio-group.tsx      # Add via shadcn
│   └── alert.tsx            # Add via shadcn
lib/
├── documentParser.ts        # Shared validation utilities
MyCareerApp.tsx              # Lifted state (resume, jd, personality)
```

### Pattern 1: Server-Side File Parsing API
**What:** Next.js API route that accepts file uploads and returns extracted text
**When to use:** All file parsing for PDFs and Word documents
**Example:**
```typescript
// app/api/parse-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
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
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    return NextResponse.json({ text, success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse document' }, { status: 500 })
  }
}
```

### Pattern 2: Controlled Form State Lifting
**What:** Parent component (`MyCareerApp.tsx`) holds resume/JD/personality state
**When to use:** State needed across phases (Phase 1 -> Phase 2 integration)
**Example:**
```typescript
// MyCareerApp.tsx
export interface InterviewData {
  duration: number
  transcript: string[]
  report: { ... } | null
  resume: string           // New field
  jobDescription: string   // New field
  personality: string      // New field: 'warm' | 'professional' | 'direct' | 'coaching'
}

export default function MyCareerApp() {
  const [interviewData, setInterviewData] = useState<InterviewData>({
    duration: 10,
    transcript: [],
    report: null,
    resume: '',
    jobDescription: '',
    personality: 'warm',
  })
  // ... pass setters to SetupScreen
}
```

### Pattern 3: react-dropzone Integration
**What:** Drag-and-drop file upload with automatic file type detection
**When to use:** Resume/JD file upload UI
**Example:**
```typescript
import { useDropzone } from 'react-dropzone'

function FileDropzone({ onFileParsed }: { onFileParsed: (text: string) => void }) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch('/api/parse-document', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    if (data.success) {
      onFileParsed(data.text)
    }
  }, [onFileParsed])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  })

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8">
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the file here...</p>
      ) : (
        <p>Drag 'n' drop a PDF or Word file, or click to select</p>
      )}
    </div>
  )
}
```

### Anti-Patterns to Avoid
- **Don't parse PDFs client-side** - Adds 500KB+ bundle weight, WASM complexity, no benefit
- **Don't store form state only in SetupScreen** - Phase 2 needs access to resume/JD/personality
- **Don't use Edge Functions for parsing** - File size limits, potential memory constraints
- **Don't skip file type validation** - Always verify MIME type server-side

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF text extraction | Custom PDF parser | `pdf-parse` | PDF format is complex; library handles all edge cases |
| Word doc extraction | Manual .docx XML parsing | `mammoth` | DOCX is zipped XML; mammoth handles all variants |
| Drag-and-drop file upload | Custom drag/drop handlers | `react-dropzone` | Handles 20+ edge cases (multiple monitors, keyboard, etc.) |
| Form validation | Custom isEmpty() checks | Custom utility + shadcn Alert | Simple validation is fine; use Alert for UX consistency |
| Personality selector | Custom radio buttons | shadcn `<Select>` or `<RadioGroup>` | Accessible, keyboard nav, consistent styling |

**Key insight:** Document parsing libraries are mature and battle-tested. Custom implementations will miss edge cases (encrypted PDFs, complex Word layouts, image-only PDFs).

## Runtime State Inventory

*Not applicable - this is a greenfield feature phase, not a rename/refactor.*

## Common Pitfalls

### Pitfall 1: Client-Side PDF Parsing Assumption
**What goes wrong:** Assuming `pdf-parse` works in browser code
**Why it happens:** Library documentation says "cross-platform" but browser usage requires bundler workarounds
**How to avoid:** Always use API route for parsing; client sends file, receives text
**Warning signs:** "Module not found: buffer" errors in browser console

### Pitfall 2: Empty/Corrupt PDF Silent Failure
**What goes wrong:** Image-only PDFs return empty strings with no error
**Why it happens:** `pdf-parse` extracts text layer only; scanned PDFs have no text layer
**How to avoid:** Validate extracted text length/content before accepting (PROC-03)
**Warning signs:** `text.length < 50` or text is only whitespace/newlines

### Pitfall 3: State Lost on Navigation
**What goes wrong:** User fills form, navigates back, data is gone
**Why it happens:** State only in `SetupScreen`, not lifted to parent
**How to avoid:** Store resume/JD/personality in `MyCareerApp.tsx` state
**Warning signs:** Reset component unmounts, state not persisted

### Pitfall 4: File Type Mismatch
**What goes wrong:** User uploads .txt or .rtf, parser crashes
**Why it happens:** Dropzone accepts any file, parser assumes PDF/DOCX
**How to avoid:**
1. Set `accept` in useDropzone config
2. Validate MIME type in API route
3. Return clear error messages

## Code Examples

### Textarea Component (INPT-01, INPT-02)
```typescript
// components/ui/textarea.tsx (add via shadcn)
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
```

### Select Component for Personality (INPT-04)
```typescript
// SetupScreen.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const PERSONALITY_OPTIONS = [
  { value: 'warm', label: 'Warm & Encouraging' },
  { value: 'professional', label: 'Professional & Neutral' },
  { value: 'direct', label: 'Direct & Challenging' },
  { value: 'coaching', label: 'Coaching-Focused' },
]

<Select
  value={personality}
  onValueChange={(value) => setPersonality(value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select interviewer personality" />
  </SelectTrigger>
  <SelectContent>
    {PERSONALITY_OPTIONS.map((opt) => (
      <SelectItem key={opt.value} value={opt.value}>
        {opt.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Alert Component for Empty Text Warning (PROC-03)
```typescript
// components/ui/alert.tsx (add via shadcn)
import * as React from "react"
import { cn } from "@/lib/utils"

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'destructive' }
>(({ className, variant = 'default', ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-lg border px-4 py-3 text-sm",
      variant === 'destructive'
        ? "border-destructive/50 text-destructive dark:border-destructive"
        : "bg-background text-foreground",
      className
    )}
    {...props}
  />
))
Alert.displayName = "Alert"

// Usage in SetupScreen
{isEmptyText && (
  <Alert variant="destructive">
    <AlertTitle>Warning</AlertTitle>
    <AlertDescription>
      The uploaded document appears to be empty or image-only.
      Please paste the text manually or upload a different file.
    </AlertDescription>
  </Alert>
)}
```

### Validation Utility for Empty Text Detection
```typescript
// lib/documentParser.ts
export function isValidExtractedText(text: string): boolean {
  if (!text || text.trim().length === 0) {
    return false
  }

  // Check for nonsense (only special chars, too short)
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

export const EMPTY_TEXT_THRESHOLD = 50 // minimum characters
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side PDF.js with WASM | Server-side pdf-parse via API route | 2024+ | Simpler client code, smaller bundles |
| Custom file upload handlers | react-dropzone hook | 2020+ | Better accessibility, less code |
| Radio buttons for selectors | shadcn Select/RadioGroup | 2023+ | Consistent design, Radix primitives |
| Edge Functions for everything | API routes for file ops | 2024+ | Full Node.js APIs, no size limits |

**Deprecated/outdated:**
- Client-side PDF parsing for simple text extraction - bundle weight not worth it
- Custom drag-and-drop implementations - react-dropzone is standard
- Plain `<select>` elements - shadcn components provide consistent styling

## Open Questions

1. **PDF password protection** - Should we handle encrypted PDFs?
   - What we know: `pdf-parse` will throw on encrypted PDFs
   - What's unclear: User experience for password-protected files
   - Recommendation: Return clear error message "Password-protected PDFs not supported"

2. **File size limits** - What's the max file size to accept?
   - What we know: Next.js API routes have default limits
   - What's unclear: Optimal limit for resume/JD files
   - Recommendation: Set 5MB limit, show error if exceeded

3. **Client-side fallback** - Should we offer pdfjs-dist as fallback?
   - What we know: Adds 500KB+ bundle
   - What's unclear: If server-side parsing failing is common enough to justify
   - Recommendation: Skip for v1; add later if needed

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected - no test config found |
| Config file | none - see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INPT-01 | Resume textarea renders | Manual | N/A | Wave 0 |
| INPT-02 | JD textarea renders | Manual | N/A | Wave 0 |
| INPT-03 | File dropzone accepts PDF/DOCX | Manual | N/A | Wave 0 |
| INPT-04 | Personality selector shows 4 options | Manual | N/A | Wave 0 |
| PROC-01 | API parses PDF correctly | Unit | N/A | Wave 0 |
| PROC-02 | Parsed text populates textarea | Manual | N/A | Wave 0 |
| PROC-03 | Empty text shows warning | Manual | N/A | Wave 0 |

### Sampling Rate
- **Per task commit:** N/A - no test framework configured
- **Per wave merge:** N/A
- **Phase gate:** Manual verification required

### Wave 0 Gaps
- [ ] Framework setup (Jest/Vitest or Playwright) - if automated tests desired
- [ ] API route tests for `/api/parse-document`
- [ ] Component tests for SetupScreen

*(No existing test infrastructure - all validation will be manual during Phase 1)*

## Sources

### Primary (HIGH confidence)
- [shadcn/ui Textarea](https://ui.shadcn.com/docs/components/textarea) - Component API, installation
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select) - Component API, examples
- [shadcn/ui RadioGroup](https://ui.shadcn.com/docs/components/radio-group) - Component API
- [shadcn/ui Alert](https://ui.shadcn.com/docs/components/alert) - Alert variants, usage
- [react-dropzone](https://github.com/react-dropzone/react-dropzone) - Hook API, drag-and-drop pattern
- [mammoth.js](https://github.com/mwilliamson/mammoth.js) - Word doc extraction API
- [pdf-parse npm](https://www.npmjs.com/package/pdf-parse) - Package description, capabilities

### Secondary (MEDIUM confidence)
- npm registry version checks for pdf-parse, mammoth, react-dropzone
- Project package.json for existing dependencies

### Tertiary (LOW confidence)
- Web search results for "best PDF parsing library" - verified against official npm pages

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via npm registry and official docs
- Architecture: HIGH - Patterns follow Next.js 16 documentation and shadcn conventions
- Pitfalls: MEDIUM - Based on library documentation and common patterns; runtime validation needed

**Research date:** 2026-03-21
**Valid until:** 2026-09-21 (6 months - stable libraries, Next.js 16 is LTS)
