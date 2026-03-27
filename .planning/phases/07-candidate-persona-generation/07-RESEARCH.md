# Phase 7: Candidate Persona Generation - Research

**Researched:** 2026-03-25
**Domain:** AI-powered persona extraction, structured data generation, form-based UI
**Confidence:** HIGH

## Summary

Phase 7 requires implementing an AI-powered persona extraction system that transforms resume and job description text into a structured `CandidatePersona` type. The persona must capture experience level, categorized skills, communication style, and knowledge gaps for use in AI candidate simulation (Phase 8). The implementation follows established patterns in the codebase: Gemini API for AI extraction, structured JSON output with validation, XML-delimited context injection, and LiquidGlass design system components.

**Primary recommendation:** Use a single Gemini API call with structured JSON schema output (matching the debriefGenerator pattern) to extract all persona fields at once, then display in a dedicated PersonaScreen using existing LiquidGlassCard components with editable form fields.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Implementation Decisions

#### Extraction Method
- **D-01:** AI-powered extraction using Gemini (one API call extracts all persona fields)
- Rationale: Inference value (communication style, knowledge gaps) justifies cost; Gemini already integrated for interview/debrief

#### Persona Structure
- **D-02:** CandidatePersona type includes:
  - Experience level: `junior` | `mid` | `senior` | `staff`
  - Skills: Categorized list (Technical, Soft, Domain) - top 5-8 per category
  - Communication style: Pair `(Formal|Casual, Technical|Narrative)`
  - Knowledge gaps: Categories with 2-3 specific missing skills each

#### Persona Review UI
- **D-03:** Dedicated PersonaScreen between Setup and Simulation
- All fields editable - user can override AI extraction
- Card-based display matching existing design system

#### Knowledge Gap Depth
- **D-04:** Category-level gaps (3-5 categories with 2-3 specific missing skills each)
- Resume + JD required for persona extraction (enables gap analysis)

### Deferred Ideas (OUT OF SCOPE)
None - discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CAND-01 | System can parse uploaded resume to extract skills, work history, and qualifications | Gemini extraction with JSON schema; follow debriefGenerator pattern |
| CAND-02 | System can infer experience level (junior/mid/senior/staff) from work history duration and roles | Prompt engineering with year-based heuristics; Gemini inference |
| CAND-03 | System can detect communication style indicators from resume content (formal/casual/technical/narrative) | Language pattern analysis via Gemini; output as type-safe pair |
| CAND-04 | System can identify knowledge gaps by comparing resume skills against job description requirements | JD + Resume comparison in single prompt; structured gap categories |
| CAND-05 | System can generate a coherent AI candidate persona with consistent traits for simulation | Single extraction call ensures consistency; validation layer |
| CAND-06 | User can review and adjust candidate persona before starting simulation | PersonaScreen with editable fields; form state management |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @google/generative-ai | ^0.24.1 | Gemini API for AI extraction | Already integrated for interview/debrief; consistent AI provider |
| React | 19.2.4 | UI components | Project standard |
| TypeScript | ^5 | Type safety | Project standard |
| Tailwind CSS | ^4 | Styling | Project standard |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | ^0.577.0 | Icons for persona fields | UI elements |
| clsx + tailwind-merge | ^2.1.1 / ^3.5.0 | Class utilities | Dynamic styling |
| class-variance-authority | ^0.7.1 | Component variants | Form field states |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Gemini extraction | Local regex/NLP parsing | Local parsing fails on inference (communication style, experience level) - Gemini justified per D-01 |
| Multiple API calls | Single extraction call | Single call ensures consistency and reduces latency per D-01 |

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── types.ts              # Add CandidatePersona type
├── personaExtractor.ts   # NEW: Gemini extraction logic
├── personaPrompts.ts     # NEW: Structured prompt for extraction
├── documentParser.ts     # Existing: validation utilities

components/
├── PersonaScreen.tsx     # NEW: Persona review/edit UI
├── ui/
│   ├── liquid-glass/     # Design system components
│   └── input.tsx         # Form inputs

app/api/
└── extract-persona/      # NEW: API route for extraction
    └── route.ts
```

### Pattern 1: Gemini Structured Output with JSON Schema
**What:** Single API call returns structured JSON matching CandidatePersona type
**When to use:** All persona extraction (per D-01 single-call decision)
**Example:**
```typescript
// Source: lib/debriefGenerator.ts pattern
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const result = await model.generateContent(prompt);
const text = result.response.text();
const jsonMatch = text.match(/\{[\s\S]*\}/);
const persona = JSON.parse(jsonMatch[0]);

// Validate against schema
const validatedPersona = validatePersonaOutput(persona);
```

### Pattern 2: XML-Delimited Context Injection
**What:** Wrap resume and JD in XML tags for clear context boundaries
**When to use:** All AI prompts with document context
**Example:**
```typescript
// Source: lib/promptBuilder.ts pattern
const prompt = `
<context>
<resume>
${resume.slice(0, MAX_CONTEXT_CHARS)}
</resume>

<jobDescription>
${jd.slice(0, MAX_CONTEXT_CHARS)}
</jobDescription>
</context>
`;
```

### Pattern 3: LiquidGlassCard Form Layout
**What:** Card-based sections with editable fields inside glass containers
**When to use:** PersonaScreen UI (per D-03)
**Example:**
```typescript
// Source: components/SetupScreen.tsx pattern
<LiquidGlassCard className="p-6">
  <div className="relative z-10">
    <Label className="text-base font-semibold text-white">Experience Level</Label>
    <Select value={experienceLevel} onValueChange={setExperienceLevel}>
      {/* Options */}
    </Select>
  </div>
</LiquidGlassCard>
```

### Anti-Patterns to Avoid
- **Multiple extraction calls for different fields:** Violates D-01 single-call decision; creates consistency issues
- **Storing persona in localStorage before validation:** AI output requires validation before persistence
- **Inline prompt construction:** Extract prompts to dedicated file like analysisPrompts.ts pattern
- **Skipping validation layer:** Gemini output may be malformed; follow debriefGenerator validation pattern

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON schema validation | Custom type guards | Validation helpers (follow validateAnalysisOutput pattern) | Consistent validation, handles edge cases |
| Form state management | Complex useState chains | React Hook Form or simple controlled state | Proven patterns, less buggy |
| AI prompt formatting | String concatenation | XML-delimited template (promptBuilder pattern) | Clear context boundaries for AI |
| Loading states | Custom spinner logic | Loader2 from lucide-react (existing pattern) | Consistent UX |

**Key insight:** The codebase has established patterns for Gemini extraction, validation, and UI components. Following these patterns reduces implementation risk and maintains consistency.

## Runtime State Inventory

This is a greenfield phase (new features), not a rename/refactor. No runtime state inventory required.

## Common Pitfalls

### Pitfall 1: Gemini Output Malformation
**What goes wrong:** Gemini returns invalid JSON or missing required fields
**Why it happens:** LLM output is non-deterministic; schema not enforced at API level
**How to avoid:** Validation layer with fallbacks (follow validateAnalysisOutput pattern in debriefGenerator.ts)
**Warning signs:** JSON.parse throws, required fields undefined

### Pitfall 2: Experience Level Misclassification
**What goes wrong:** Junior candidates classified as senior due to keyword matching
**Why it happens:** AI focuses on skills/technologies rather than years of experience
**How to avoid:** Explicit prompt instructions for year-based inference with role progression analysis
**Warning signs:** 2-year engineer marked as "senior"

### Pitfall 3: Knowledge Gaps Not Actionable
**What goes wrong:** Gaps too generic ("lacks leadership") or too specific ("missing React 18.2 hooks")
**Why it happens:** Prompt doesn't specify gap granularity
**How to avoid:** Per D-04: 3-5 categories with 2-3 specific skills each; explicit prompt constraints
**Warning signs:** Single gap category, or 20+ gap items

### Pitfall 4: Communication Style Binary Mismatch
**What goes wrong:** Output like "formal-technical" instead of tuple pair
**Why it happens:** Prompt unclear about output format
**How to avoid:** Explicit schema with `{ formality: "formal" | "casual", approach: "technical" | "narrative" }`
**Warning signs:** String values instead of structured object

### Pitfall 5: PersonaScreen State Desync
**What goes wrong:** User edits persona but changes don't persist to simulation
**Why it happens:** Form state not lifted to parent or not passed to Phase 8
**How to avoid:** Follow MyCareerApp pattern - lift persona state to parent component
**Warning signs:** Edits lost on navigation, simulation uses wrong persona

## Code Examples

### CandidatePersona Type Definition
```typescript
// Source: Following lib/types.ts patterns
export type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'staff';

export type CommunicationFormality = 'formal' | 'casual';
export type CommunicationApproach = 'technical' | 'narrative';

export interface CommunicationStyle {
  formality: CommunicationFormality;
  approach: CommunicationApproach;
}

export interface CategorizedSkills {
  technical: string[];    // 5-8 skills
  soft: string[];         // 5-8 skills
  domain: string[];       // 5-8 skills
}

export interface KnowledgeGap {
  category: string;       // e.g., "Cloud Infrastructure", "Leadership"
  missingSkills: string[]; // 2-3 specific skills
}

export interface CandidatePersona {
  experienceLevel: ExperienceLevel;
  skills: CategorizedSkills;
  communicationStyle: CommunicationStyle;
  knowledgeGaps: KnowledgeGap[]; // 3-5 categories per D-04
  workHistorySummary: string;    // Brief summary for context
  yearsOfExperience: number;     // Derived from work history
}
```

### Persona Extraction Prompt Structure
```typescript
// Source: Following lib/analysisPrompts.ts pattern
export const PERSONA_SCHEMA = `
{
  "experienceLevel": "junior | mid | senior | staff",
  "yearsOfExperience": "number - total years of professional experience",
  "workHistorySummary": "string - 1-2 sentence summary of career trajectory",
  "skills": {
    "technical": ["array of 5-8 technical skills"],
    "soft": ["array of 5-8 soft skills"],
    "domain": ["array of 5-8 domain/industry skills"]
  },
  "communicationStyle": {
    "formality": "formal | casual",
    "approach": "technical | narrative"
  },
  "knowledgeGaps": [
    {
      "category": "string - skill category from JD requirements",
      "missingSkills": ["array of 2-3 specific missing skills"]
    }
  ]
}
`;

export function buildPersonaExtractionPrompt(resume: string, jd: string): string {
  return `You are an expert career analyst extracting candidate persona data for interview simulation.

## Documents

<resume>
${resume.slice(0, 8000)}
</resume>

<jobDescription>
${jd.slice(0, 8000)}
</jobDescription>

## Output Format

Return valid JSON matching this schema:
${PERSONA_SCHEMA}

## Extraction Rules

### Experience Level Inference
- **junior**: 0-2 years, entry-level roles, internship experience
- **mid**: 2-5 years, individual contributor roles, growing autonomy
- **senior**: 5-10 years, lead roles, mentoring responsibilities, significant scope
- **staff**: 10+ years, cross-team impact, strategic influence, principal-level roles

### Skill Categorization
- **technical**: Programming languages, frameworks, tools, methodologies
- **soft**: Communication, leadership, collaboration, problem-solving traits
- **domain**: Industry-specific knowledge, business domains, vertical expertise

### Communication Style Detection
- **formal**: Professional language, structured sentences, corporate tone
- **casual**: Conversational tone, contractions, personal anecdotes
- **technical**: Data-driven, metrics-focused, process-oriented descriptions
- **narrative**: Story-based, situation-focused, outcome-emphasized

### Knowledge Gap Analysis (CRITICAL)
1. Identify 3-5 skill categories from the JD requirements
2. For each category, check if resume demonstrates proficiency
3. If gap exists, list 2-3 specific missing skills
4. Only include categories where clear gaps exist

Return your JSON response.`;
}
```

### PersonaScreen Component Structure
```typescript
// Source: Following components/SetupScreen.tsx pattern
'use client';

import * as React from 'react';
import { LiquidGlassCard, LiquidGlassActionButton } from '@/components/ui/liquid-glass';
import { Loader2, User, Briefcase, MessageSquare, AlertCircle } from 'lucide-react';
import type { CandidatePersona } from '@/lib/types';

interface PersonaScreenProps {
  persona: CandidatePersona | null;
  isLoading: boolean;
  error: string | null;
  onPersonaChange: (persona: CandidatePersona) => void;
  onProceed: () => void;
  onBack: () => void;
}

export default function PersonaScreen({
  persona,
  isLoading,
  error,
  onPersonaChange,
  onProceed,
  onBack,
}: PersonaScreenProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <LiquidGlassCard className="p-6">
        <AlertCircle className="w-6 h-6 text-destructive" />
        <p>{error}</p>
        <LiquidGlassActionButton onClick={onBack}>Go Back</LiquidGlassActionButton>
      </LiquidGlassCard>
    );
  }

  if (!persona) return null;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-8 pb-6">
        <h1 className="text-2xl font-bold">Candidate Persona</h1>
        <p className="text-white/60">Review and adjust before simulation</p>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 space-y-6">
        {/* Experience Level Card */}
        <LiquidGlassCard className="p-6">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <Label>Experience Level</Label>
            </div>
            <Select
              value={persona.experienceLevel}
              onValueChange={(val) => onPersonaChange({
                ...persona,
                experienceLevel: val as ExperienceLevel
              })}
            >
              {/* Options */}
            </Select>
            <p className="text-sm text-white/50 mt-2">
              {persona.yearsOfExperience} years of experience
            </p>
          </div>
        </LiquidGlassCard>

        {/* Skills Card */}
        <LiquidGlassCard className="p-6">
          {/* Skills display with edit capability */}
        </LiquidGlassCard>

        {/* Communication Style Card */}
        <LiquidGlassCard className="p-6">
          {/* Communication style toggles */}
        </LiquidGlassCard>

        {/* Knowledge Gaps Card */}
        <LiquidGlassCard className="p-6">
          {/* Knowledge gaps display */}
        </LiquidGlassCard>
      </div>

      {/* Footer Actions */}
      <footer className="px-6 py-6">
        <LiquidGlassActionButton onClick={onProceed}>
          Start Simulation
        </LiquidGlassActionButton>
      </footer>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Multiple AI calls for persona fields | Single structured extraction | D-01 decision | Lower latency, better consistency |
| Hardcoded persona rules | AI-inferred persona | This phase | Personalization from actual resume data |
| Static skill lists | Categorized dynamic extraction | This phase | Accurate skill representation |

**Deprecated/outdated:**
- Rule-based experience level inference: Replaced by AI inference with context understanding
- Predefined skill taxonomies: Replaced by dynamic categorization based on actual content

## Open Questions

1. **Persona Persistence Between Sessions**
   - What we know: MyCareerApp uses localStorage for lastReport
   - What's unclear: Should personas be persisted for reuse?
   - Recommendation: Phase 7 scope: no persistence needed. Persona generated fresh each session. Consider for v4.1+ if users request it.

2. **Maximum Skills Per Category**
   - What we know: D-02 specifies "top 5-8 per category"
   - What's unclear: How to handle candidates with extensive skill lists
   - Recommendation: Prompt constrains to 8 max; truncation at validation layer if exceeded

3. **PersonaScreen Integration Point**
   - What we know: D-03 says "between Setup and Simulation"
   - What's unclear: Does this mean between Setup and Interview, or before Phase 8 simulation?
   - Recommendation: Based on ROADMAP.md, Phase 8 is Text Chat Simulation. PersonaScreen should be added to MyCareerApp flow but the exact integration depends on whether we're modifying existing interview flow or creating separate simulation flow. Clarify in planning.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | — | — |
| Next.js | App framework | ✓ | 16.2.0 | — |
| @google/generative-ai | AI extraction | ✓ | ^0.24.1 | — |
| lucide-react | Icons | ✓ | ^0.577.0 | — |
| Vitest | Testing | ✓ | ^4.1.0 | — |

**Missing dependencies with no fallback:**
- None identified

**Missing dependencies with fallback:**
- None identified

## Sources

### Primary (HIGH confidence)
- lib/types.ts - Type definition patterns (252 lines)
- lib/agents.ts - Persona structure patterns (259 lines)
- lib/promptBuilder.ts - XML context injection, MAX_CONTEXT_CHARS=8000 (109 lines)
- lib/debriefGenerator.ts - Gemini API pattern, validation helpers (417 lines)
- lib/analysisPrompts.ts - Structured JSON schema pattern (238 lines)
- components/SetupScreen.tsx - UI patterns, LiquidGlassCard usage (456 lines)
- components/MyCareerApp.tsx - Screen flow pattern (187 lines)
- app/api/parse-document/route.ts - API route pattern (56 lines)

### Secondary (MEDIUM confidence)
- components/ui/liquid-glass/lg-card.tsx - Design system component (68 lines)
- lib/documentParser.ts - Validation utilities (33 lines)
- lib/promptBuilder.test.ts - Testing patterns (215 lines)

### Tertiary (LOW confidence)
- None required - all findings from code inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies already in project, well-established patterns
- Architecture: HIGH - Clear patterns in existing code for all components needed
- Pitfalls: HIGH - Derived from existing codebase patterns and documented decisions

**Research date:** 2026-03-25
**Valid until:** 30 days (stable patterns, no external API changes expected)