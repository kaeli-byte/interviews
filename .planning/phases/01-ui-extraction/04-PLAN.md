---
phase: 01-ui-extraction
plan: 04
type: execute
wave: 2
depends_on: [01, 02]
files_modified: [components/MyCareerApp.tsx]
autonomous: true
requirements: [INTG-01]
---

<objective>
Lift resume, jobDescription, and personality state to MyCareerApp parent component.

Purpose: Prepare state management for Phase 2 integration with geminiLiveClient.ts (INTG-01).
Output: Parent component holds all form state with proper TypeScript interfaces.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-ui-extraction/01-RESEARCH.md
@components/MyCareerApp.tsx
@components/SetupScreen.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend InterviewData interface and lift state</name>
  <files>components/MyCareerApp.tsx</files>
  <read_first>
    - components/MyCareerApp.tsx (current implementation)
    - .planning/phases/01-ui-extraction/01-RESEARCH.md (Pattern 2: Controlled Form State Lifting)
  </read_first>
  <action>
    Modify MyCareerApp.tsx to add resume, jobDescription, and personality state:

    1. **Extend InterviewData interface**:
       ```typescript
       export interface InterviewData {
         duration: number;
         transcript: string[];
         report: {
           elevatorPitch: string;
           keyAchievements: string[];
           uniqueValueProposition: string;
           areasForImprovement: string[];
         } | null;
         resume: string;           // NEW: User's resume text
         jobDescription: string;   // NEW: Job description text
         personality: string;      // NEW: 'warm' | 'professional' | 'direct' | 'coaching'
       }
       ```

    2. **Update initial state**:
       ```typescript
       const [interviewData, setInterviewData] = useState<InterviewData>({
         duration: 10,
         transcript: [],
         report: null,
         resume: '',
         jobDescription: '',
         personality: 'warm',  // Default to warm/encouraging
       });
       ```

    3. **Add setter handlers** (new functions):
       ```typescript
       const handleResumeChange = (text: string) => {
         setInterviewData(prev => ({ ...prev, resume: text }));
       };

       const handleJobDescriptionChange = (text: string) => {
         setInterviewData(prev => ({ ...prev, jobDescription: text }));
       };

       const handlePersonalityChange = (value: string) => {
         setInterviewData(prev => ({ ...prev, personality: value }));
       };

       const handleFileParsed = (type: 'resume' | 'jd', text: string) => {
         if (type === 'resume') {
           setInterviewData(prev => ({ ...prev, resume: text }));
         } else {
           setInterviewData(prev => ({ ...prev, jobDescription: text }));
         }
       };
       ```

    4. **Update handleStartInterview** to validate required fields:
       ```typescript
       const handleStartInterview = (duration: number) => {
         // Optional: Validate that resume and JD are not empty
         if (!interviewData.resume.trim() || !interviewData.jobDescription.trim()) {
           // Could show a toast/alert here, but for now let SetupScreen handle disabled button
           return;
         }
         setInterviewData(prev => ({
           ...prev,
           duration,
           transcript: [],
           report: null,
           // Keep resume, jobDescription, personality - they're needed for Phase 2
         }));
         setStep('interview');
       };
       ```

    5. **Pass new props to SetupScreen**:
       ```typescript
       <SetupScreen
         onStart={handleStartInterview}
         lastReport={interviewData.report}
         onViewLastReport={() => setStep('debrief')}
         resume={interviewData.resume}
         jobDescription={interviewData.jobDescription}
         personality={interviewData.personality}
         onResumeChange={handleResumeChange}
         onJobDescriptionChange={handleJobDescriptionChange}
         onPersonalityChange={handlePersonalityChange}
         onFileParsed={handleFileParsed}
       />
       ```
  </action>
  <verify>
    <automated>grep -q "resume: string" components/MyCareerApp.tsx && grep -q "jobDescription: string" components/MyCareerApp.tsx && grep -q "personality: string" components/MyCareerApp.tsx</automated>
  </verify>
  <done>
    - InterviewData interface includes resume, jobDescription, personality fields
    - Initial state has empty strings for resume/jd, 'warm' for personality
    - Handler functions exist: handleResumeChange, handleJobDescriptionChange, handlePersonalityChange, handleFileParsed
    - SetupScreen receives all new props
  </done>
</task>

</tasks>

<verification>
- MyCareerApp.tsx compiles without TypeScript errors
- Resume, JD, personality state persists when navigating between screens (if needed later)
- State is accessible for Phase 2 integration with geminiLiveClient.ts
</verification>

<success_criteria>
- InterviewData interface extended with three new fields
- State setters properly update interviewData
- SetupScreen receives controlled props for all form fields
</success_criteria>

<output>
After completion, create `.planning/phases/01-ui-extraction/01-04-SUMMARY.md`
</output>
