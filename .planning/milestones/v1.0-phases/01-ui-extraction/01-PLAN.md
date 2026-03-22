---
phase: 01-ui-extraction
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [components/ui/textarea.tsx, components/ui/select.tsx, components/ui/alert.tsx, lib/utils.ts]
autonomous: true
requirements: [INPT-01, INPT-02, INPT-04]
---

<objective>
Add required shadcn/ui components (Textarea, Select, Alert) to support the expanded SetupScreen form.

Purpose: Provide accessible, consistent UI primitives for resume/JD text inputs, personality selector, and parsing warnings.
Output: Three new UI component files ready for import into SetupScreen.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/phases/01-ui-extraction/01-RESEARCH.md
@components/ui/button.tsx
@components/ui/card.tsx
@lib/utils.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add shadcn Textarea and Select components</name>
  <files>components/ui/textarea.tsx, components/ui/select.tsx</files>
  <read_first>
    - components/ui/button.tsx (existing shadcn component pattern)
    - lib/utils.ts (cn utility function)
  </read_first>
  <action>
    Run shadcn CLI to add the two components:
    ```bash
    npx shadcn@latest add textarea
    npx shadcn@latest add select
    ```

    This creates:
    - components/ui/textarea.tsx - Textarea component with Tailwind classes matching existing button/card style
    - components/ui/select.tsx - Select component with Radix primitives for accessibility

    Verify the components use the same cn() utility and styling patterns as existing components.
  </action>
  <verify>
    <automated>ls components/ui/textarea.tsx components/ui/select.tsx</automated>
  </verify>
  <done>
    - components/ui/textarea.tsx exists with Textarea export
    - components/ui/select.tsx exists with Select, SelectContent, SelectItem, SelectTrigger, SelectValue exports
  </done>
</task>

<task type="auto">
  <name>Task 2: Add shadcn Alert component</name>
  <files>components/ui/alert.tsx</files>
  <read_first>
    - components/ui/button.tsx (existing shadcn component pattern)
    - lib/utils.ts (cn utility function)
  </read_first>
  <action>
    Run shadcn CLI to add the Alert component:
    ```bash
    npx shadcn@latest add alert
    ```

    This creates:
    - components/ui/alert.tsx - Alert component with variant support (default, destructive)

    The Alert component will be used for PROC-03 to show warnings when document parsing returns empty/nonsense text.
  </action>
  <verify>
    <automated>ls components/ui/alert.tsx</automated>
  </verify>
  <done>
    - components/ui/alert.tsx exists with Alert, AlertTitle, AlertDescription exports
    - Component supports variant="destructive" prop for warning styling
  </done>
</task>

</tasks>

<verification>
- All three UI components (Textarea, Select, Alert) exist in components/ui/
- Components are importable from @/components/ui/{component}
</verification>

<success_criteria>
- npx shadcn@latest add commands complete without errors
- Three new component files created matching existing shadcn patterns
</success_criteria>

<output>
After completion, create `.planning/phases/01-ui-extraction/01-01-SUMMARY.md`
</output>
