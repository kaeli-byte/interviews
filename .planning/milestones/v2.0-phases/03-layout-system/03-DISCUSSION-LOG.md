# Phase 3: Layout System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

## Discussion Summary

**Date:** 2026-03-23
**Areas discussed:** Sidebar content, Sidebar behavior, Layout integration, Overflow strategy

---

## Q1: Navigation Items

**Question:** What navigation items should appear in the sidebar?

**Options:**
- Flow-based (Recommended): Simple linear flow: Start Interview, Active Interview, Results
- App sections: Section-based: Interview, History, Settings, etc.
- Dynamic items: Context-sensitive items based on current step

**Selected:** Flow-based (Recommended)

---

## Q2: Navigation Styling

**Question:** How should navigation items be styled?

**Options:**
- Text only (Recommended): Minimal: just the flow steps with clean text
- Icons + text: Each step has an icon (Play, Mic, FileText, etc.)
- Step numbers: Circular step indicators (1, 2, 3) like a wizard

**Selected:** Icons + text

---

## Q3: Sidebar Collapsibility

**Question:** Should the sidebar be collapsible?

**Options:**
- Always visible (Recommended): Fixed width, always visible. Clean and predictable.
- User-collapsible: User can collapse to icons-only to save space
- Responsive hide: Hidden on mobile, visible on desktop (hamburger menu on mobile)

**Selected:** Responsive hide

---

## Q4: Mobile Sidebar Style

**Question:** How should the mobile sidebar appear?

**Options:**
- Overlay drawer (Recommended): Opens over content with backdrop, click outside to close
- Push drawer: Pushes content to the right, always full-height
- Bottom sheet: Slides in from bottom of screen

**Selected:** Overlay drawer (Recommended)

---

## Q5: Layout Integration Approach

**Question:** How should the layout integrate with the existing step-based flow?

**Options:**
- Wrap MyCareerApp (Recommended): New AppLayout component wraps MyCareerApp. Sidebar outside the step switch.
- Inside MyCareerApp: Sidebar and body rendered inside MyCareerApp, step controls visibility
- Next.js nested routes: Use Next.js App Router layouts with nested routes for each step

**Selected:** Wrap MyCareerApp (Recommended)

---

## Q6: Overflow Handling

**Question:** How should overflow be handled across screens?

**Options:**
- Layout-managed (Recommended): Layout provides scroll container, screens just fill it. Predictable and simple.
- Screen-managed: Each screen handles its own overflow with layout-provided constraints
- CSS Grid slots: Layout sets up CSS grid with named areas, screens slot in

**Selected:** Layout-managed (Recommended)

---

## Q7: Layout Slots

**Question:** Should the layout provide header or footer slots?

**Options:**
- No header/footer slots: Sidebar + body only. Screens control their own headers.
- Header slot (Recommended): Optional header slot for page titles, breadcrumbs. Screens can use it.
- Header + footer slots: Both header and footer slots for consistent branding/actions

**Selected:** Header + footer slots

---

*End of discussion log*