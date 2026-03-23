# Phase 3: Layout System - Context

**Gathered:** 2026-03-23
**Status:** Ready for planning

<domain>
## Phase Boundary

A persistent sidebar navigation and flexible body container that all screens inherit, with proper overflow handling. This phase creates a reusable layout pattern that wraps the existing step-based flow (Setup → Interview → Debrief).

</domain>

<decisions>
## Implementation Decisions

### Sidebar Content
- **D-01:** Flow-based navigation items: Start Interview, Active Interview, Results (maps to existing step state)
- **D-02:** Icons + text for each navigation item (Play, Mic, FileText icons from Lucide)

### Sidebar Behavior
- **D-03:** Responsive hide pattern: sidebar visible on desktop, hamburger menu on mobile
- **D-04:** Mobile sidebar: overlay drawer with backdrop, click outside to close

### Layout Integration
- **D-05:** New `AppLayout` component wraps `MyCareerApp`
- **D-06:** Sidebar rendered outside the step switch in MyCareerApp
- **D-07:** Navigation state syncs with existing `step` state in MyCareerApp

### Overflow Strategy
- **D-08:** Layout-managed scroll: layout provides the scroll container, screens fill it
- **D-09:** No hardcoded heights — use flex/grid with overflow-auto on body container

### Layout Slots
- **D-10:** Header slot available for page titles, breadcrumbs
- **D-11:** Footer slot available for branding, action buttons

### Claude's Discretion
- Specific icon choices for navigation items
- Transition animations for sidebar open/close
- Exact pixel widths for sidebar
- Breakpoint for mobile/desktop switch

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Architecture
- `.planning/codebase/ARCHITECTURE.md` — Current app structure and module boundaries
- `.planning/codebase/CONVENTIONS.md` — Code style and Tailwind patterns
- `.planning/codebase/STRUCTURE.md` — Directory structure and key files

### Current Implementation
- `components/MyCareerApp.tsx` — Step-based state machine to be wrapped
- `app/layout.tsx` — Root layout with font configuration

No external specs — requirements fully captured in decisions above

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `components/ui/button.tsx` — Can use for sidebar navigation items
- Lucide React icons — Already imported in screens (Play, Mic, FileText, etc.)

### Established Patterns
- Tailwind utility classes with `clsx`/`twMerge` for dynamic styling
- Client-side state with `useState` hooks
- Step-based flow controlled by `step` state in `MyCareerApp.tsx`

### Integration Points
- `MyCareerApp.tsx` exports `AppStep` type (`'setup' | 'interview' | 'debrief'`)
- Current container: `div className="w-full h-screen bg-surface-container-lowest flex flex-col overflow-hidden"`
- This container will move inside the new layout's body area

</code_context>

<specifics>
## Specific Ideas

- Sidebar width: ~240-280px on desktop (not collapsed)
- Mobile breakpoint: match Tailwind `lg` breakpoint (1024px)
- Use Shadcn Sheet component for mobile drawer if available, otherwise custom overlay

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-layout-system*
*Context gathered: 2026-03-23*