---
phase: 01-ui-extraction
plan: 03
type: execute
wave: 3
depends_on: [01, 02, 04]
files_modified: [components/SetupScreen.tsx]
autonomous: true
requirements: [INPT-01, INPT-02, INPT-03, PROC-02, PROC-03]
---

<objective>
Expand SetupScreen component with resume/JD text areas, file dropzone, and personality selector.

Purpose: Complete all user input UI requirements (INPT-01 through INPT-04) with file parsing integration.
Output: Fully functional SetupScreen with paste areas, file upload, and personality selection.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-ui-extraction/01-RESEARCH.md
@components/SetupScreen.tsx
@components/ui/textarea.tsx
@components/ui/select.tsx
@components/ui/alert.tsx
@lib/documentParser.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install react-dropzone for file uploads</name>
  <files>package.json</files>
  <read_first>
    - package.json (current dependencies)
  </read_first>
  <action>
    Install react-dropzone for drag-and-drop file upload support:
    ```bash
    npm install react-dropzone
    ```

    This provides the useDropzone hook for accessible drag-and-drop with keyboard support.
  </action>
  <verify>
    <automated>npm list react-dropzone</automated>
  </verify>
  <done>
    - react-dropzone installed at version 15.x
    - Appears in package.json dependencies
  </done>
</task>

<task type="auto">
  <name>Task 2: Expand SetupScreen with text areas, dropzone, and personality selector</name>
  <files>components/SetupScreen.tsx</files>
  <read_first>
    - components/SetupScreen.tsx (current implementation)
    - .planning/phases/01-ui-extraction/01-RESEARCH.md (Pattern 2: Controlled Form State Lifting, Pattern 3: react-dropzone Integration)
    - components/ui/textarea.tsx
    - components/ui/select.tsx
    - components/ui/alert.tsx
  </read_first>
  <action>
    Rewrite SetupScreen.tsx to add:

    1. **New props** (lifted state from MyCareerApp per Plan 04):
       - resume: string
       - jobDescription: string
       - personality: string
       - onResumeChange: (text: string) => void
       - onJobDescriptionChange: (text: string) => void
       - onPersonalityChange: (value: string) => void
       - onFileParsed: (type: 'resume' | 'jd', text: string) => void

    2. **Resume section** (INPT-01, INPT-03):
       - Label "Resume"
       - Textarea with value={resume}, onChange={(e) => onResumeChange(e.target.value)}, placeholder="Paste your resume text here..."
       - FileDropzone component for resume uploads (accepts PDF/DOCX, calls onFileParsed('resume', text))

    3. **Job Description section** (INPT-02, INPT-03):
       - Label "Job Description"
       - Textarea with value={jobDescription}, onChange={(e) => onJobDescriptionChange(e.target.value)}, placeholder="Paste the job description here..."
       - FileDropzone component for JD uploads

    4. **Personality selector** (INPT-04):
       - Label "AI Interviewer Personality"
       - Select component with value={personality}, onValueChange={onPersonalityChange}
       - Four options:
         - warm: "Warm & Encouraging - Supportive and positive"
         - professional: "Professional & Neutral - Balanced and objective"
         - direct: "Direct & Challenging - Pushes you to think deeper"
         - coaching: "Coaching-Focused - Helps you grow and learn"

    5. **Warning Alert** (PROC-03):
       - Conditional Alert variant="destructive" when isEmptyText state is true
       - Message: "The uploaded document appears to be empty or image-only. Please paste the text manually or upload a different file."

    6. **FileDropzone component** (inline or separate):
       ```typescript
       function FileDropzone({
         onFileParsed,
         label
       }: {
         onFileParsed: (text: string) => void
         label: string
       }) {
         const [isParsing, setIsParsing] = useState(false)
         const [parseError, setParseError] = useState<string | null>(null)

         const onDrop = useCallback(async (acceptedFiles: File[]) => {
           const file = acceptedFiles[0]
           if (!file) return

           setIsParsing(true)
           setParseError(null)

           const formData = new FormData()
           formData.append('file', file)

           try {
             const response = await fetch('/api/parse-document', {
               method: 'POST',
               body: formData,
             })
             const data = await response.json()

             if (response.ok && data.success) {
               onFileParsed(data.text)
             } else {
               setParseError(data.error || 'Failed to parse document')
             }
           } catch (err) {
             setParseError('Network error - please try again')
           } finally {
             setIsParsing(false)
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
           <div className="space-y-2">
             <div
               {...getRootProps()}
               className="border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors bg-slate-50"
             >
               <input {...getInputProps()} />
               {isParsing ? (
                 <p className="text-sm text-slate-500">Parsing document...</p>
               ) : isDragActive ? (
                 <p className="text-sm text-slate-600">Drop the file here...</p>
               ) : (
                 <p className="text-sm text-slate-600">
                   Drag 'n' drop a PDF or Word file, or click to select
                 </p>
               )}
             </div>
             {parseError && (
               <Alert variant="destructive">
                 <AlertTitle>Error</AlertTitle>
                 <AlertDescription>{parseError}</AlertDescription>
               </Alert>
             )}
           </div>
         )
       }
       ```

    7. **Update the card structure**:
       - Move existing duration slider to a "Interview Settings" section
       - Add new sections for Resume, Job Description, Personality
       - Keep existing "How it works" info box
       - Update "Start Conversation" button to only enable when resume AND jobDescription are non-empty
  </action>
  <verify>
    <automated>grep -q "Textarea" components/SetupScreen.tsx && grep -q "Select" components/SetupScreen.tsx && grep -q "useDropzone" components/SetupScreen.tsx</automated>
  </verify>
  <done>
    - SetupScreen imports Textarea, Select, Alert components
    - SetupScreen imports useDropzone from react-dropzone
    - Resume section has textarea + dropzone
    - JD section has textarea + dropzone
    - Personality selector shows 4 options
    - Warning alert shows when isEmptyText is true
    - Start button disabled when resume or jobDescription is empty
  </done>
</task>

</tasks>

<verification>
- User can paste text into Resume textarea
- User can paste text into JD textarea
- User can upload PDF/DOCX files for both
- Uploaded files trigger API parse and populate textareas
- Personality selector allows choosing one of four options
- Empty text warning appears for image-only PDFs
</verification>

<success_criteria>
- react-dropzone installed
- SetupScreen.tsx contains all required UI elements
- File upload calls /api/parse-document and handles response
- Textareas are controlled components with proper value/onChanged handlers
</success_criteria>

<output>
After completion, create `.planning/phases/01-ui-extraction/01-03-SUMMARY.md`
</output>
