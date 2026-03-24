// Structured AI prompts for STAR analysis and coaching generation
// Per D-04: AI classification for behavioral question detection
// Per D-03: Pattern detection requires 3+ instances

import { QAPair } from './types';

/**
 * JSON schema describing the expected AI output format for interview analysis.
 * This schema is included in the prompt to ensure structured, parseable responses.
 */
export const ANALYSIS_SCHEMA = `
{
  "evaluations": [
    {
      "qaPairId": "string - the ID from the QAPair",
      "questionType": "behavioral | icebreaker | technical | clarification",
      "starScore": {
        "situation": "clear | partial | moderate | weak",
        "task": "clear | partial | moderate | weak",
        "action": "clear | partial | moderate | weak",
        "result": "clear | partial | moderate | weak"
      },
      "communicationScore": { "clarity": 1-10, "conciseness": 1-10, "structure": 1-10, "confidence": 1-10 },
      "behavioralSignals": { "ownership": 1-10, "problemSolving": 1-10, "impact": 1-10, "selfAwareness": 1-10 },
      "feedback": "Brief feedback for this answer"
    }
  ],
  "analysis": {
    "overallScore": "1-10",
    "hireSignal": "strong_yes | lean_yes | neutral | lean_no | strong_no",
    "starAverages": { "situation": 1-10, "task": 1-10, "action": 1-10, "result": 1-10 },
    "communicationAverages": { "clarity": 1-10, "conciseness": 1-10, "structure": 1-10, "confidence": 1-10 },
    "strengths": ["string array of 3-4 items"],
    "weaknesses": ["string array of 2-3 items"],
    "patterns": [
      {
        "type": "positive | attention",
        "description": "string",
        "instanceCount": "number - MUST be 3 or higher",
        "affectedAnswerIds": ["array of qaPairId strings"]
      }
    ]
  },
  "coaching": {
    "topPriorities": [
      { "issue": "string", "whyItMatters": "string", "fix": "string", "example": "string" }
    ],
    "quickWins": ["string array of 2-3 actionable items"],
    "practicePlan": {
      "nextSessionFocus": "string",
      "recommendedAgent": "agent-id from: hiring-manager, high-pressure, supportive-coach, rapid-fire, story-architect, efficiency-screener, behavioral-analyst",
      "drill": "string"
    }
  }
}
`;

/**
 * Valid agent IDs for practice plan recommendations.
 * Must match AgentId type from lib/types.ts.
 */
export const VALID_AGENT_IDS = [
  'hiring-manager',
  'high-pressure',
  'supportive-coach',
  'rapid-fire',
  'story-architect',
  'efficiency-screener',
  'behavioral-analyst',
] as const;

/**
 * Valid STAR level values.
 * Must match STARLevel type from lib/types.ts.
 */
export const VALID_STAR_LEVELS = ['clear', 'partial', 'moderate', 'weak'] as const;

/**
 * Valid question types for classification.
 * Must match QuestionType type from lib/types.ts.
 */
export const VALID_QUESTION_TYPES = ['behavioral', 'icebreaker', 'technical', 'clarification'] as const;

/**
 * Valid hire signal values.
 * Must match AnalysisReport.hireSignal.
 */
export const VALID_HIRE_SIGNALS = ['strong_yes', 'lean_yes', 'neutral', 'lean_no', 'strong_no'] as const;

/**
 * Builds the AI prompt for structured interview analysis.
 *
 * Key constraints enforced:
 * - D-04: Only behavioral questions receive STAR evaluation
 * - D-03: Patterns require 3+ instances before being flagged
 * - Non-behavioral questions should have starScore: null
 *
 * @param transcriptText - Full transcript formatted as speaker: text
 * @param pairs - Q/A pairs with IDs for reference
 * @returns Complete prompt string for Gemini API
 */
export function buildAnalysisPrompt(transcriptText: string, pairs: QAPair[]): string {
  // Format Q/A pairs with IDs for AI reference
  const pairsFormatted = pairs.map((pair, index) => {
    const questionText = pair.question.text;
    const responseText = pair.response.map(r => r.text).join(' ');
    return `[ID: ${pair.id}] Q${index + 1}: ${questionText}\nA${index + 1}: ${responseText}`;
  }).join('\n\n');

  return `You are an expert interview coach analyzing a mock interview transcript. Your task is to provide structured, actionable feedback.

## Interview Transcript

${transcriptText}

## Q/A Pairs with IDs (for evaluation reference)

${pairsFormatted}

## Output Format

Return your analysis as valid JSON matching this schema:
${ANALYSIS_SCHEMA}

## Critical Constraints

### Question Type Classification (IMPORTANT)
Classify each question type accurately:
- **behavioral**: Questions asking about past experiences ("Tell me about a time...", "Describe a situation...", "Give me an example of...")
- **icebreaker**: Opening questions ("Tell me about yourself", "Walk me through your background")
- **technical**: Questions testing specific knowledge or skills
- **clarification**: Follow-up questions asking for more detail

### STAR Evaluation Rules (CRITICAL)
1. **ONLY apply STAR evaluation to behavioral questions**
2. For non-behavioral questions (icebreaker, technical, clarification), set starScore to null
3. Non-behavioral questions still need communicationScore, behavioralSignals, and feedback

### Pattern Detection Rules (CRITICAL - Pitfall 5)
1. **A pattern MUST appear in 3 or more different answers** before being flagged
2. If an issue appears in only 1-2 answers, do NOT include it as a pattern
3. Patterns must have instanceCount >= 3
4. Each pattern must list affectedAnswerIds referencing the qaPairId values

### STAR Level Definitions
- **clear**: Fully articulated with specific details and impact
- **partial**: Present but lacking specificity or depth
- **moderate**: Mentioned but vague or incomplete
- **weak**: Missing or extremely unclear

### Communication Score Scale (1-10)
Rate each dimension independently:
- **clarity**: How easy was the answer to understand?
- **conciseness**: Was the answer appropriately brief without being too short?
- **structure**: How well organized was the response?
- **confidence**: How confident did the candidate sound?

### Behavioral Signals Scale (1-10)
- **ownership**: Did the candidate take responsibility vs. crediting others vaguely?
- **problemSolving**: Quality of analytical thinking demonstrated
- **impact**: Tangible outcomes and measurable results
- **selfAwareness**: Evidence of reflection and learning

### Coaching Guidelines
1. topPriorities should contain exactly 3 items
2. Each priority needs: issue, whyItMatters, fix, and optional example
3. quickWins should be 2-3 immediately actionable items
4. recommendedAgent must be one of: ${VALID_AGENT_IDS.join(', ')}

### Agent Recommendations
- **story-architect**: Best for improving STAR structure and depth
- **supportive-coach**: Best for building confidence and practicing basics
- **high-pressure**: Best for handling challenging questions under stress
- **behavioral-analyst**: Best for identifying and fixing recurring patterns
- **rapid-fire**: Best for breadth of practice and quick recall
- **hiring-manager**: Best for realistic full simulation practice
- **efficiency-screener**: Best for concise, high-level preparation

## Example Output (for reference)

Here's an example of proper formatting:
\`\`\`json
{
  "evaluations": [
    {
      "qaPairId": "abc123",
      "questionType": "behavioral",
      "starScore": { "situation": "clear", "task": "partial", "action": "moderate", "result": "weak" },
      "communicationScore": { "clarity": 7, "conciseness": 6, "structure": 6, "confidence": 6 },
      "behavioralSignals": { "ownership": 6, "problemSolving": 5, "impact": 4, "selfAwareness": 5 },
      "feedback": "Good setup, but impact isn't clear. What changed because of your actions?"
    },
    {
      "qaPairId": "def456",
      "questionType": "icebreaker",
      "starScore": null,
      "communicationScore": { "clarity": 8, "conciseness": 7, "structure": 7, "confidence": 7 },
      "behavioralSignals": { "ownership": 6, "problemSolving": 6, "impact": 5, "selfAwareness": 6 },
      "feedback": "Clear and engaging. Consider adding a memorable differentiator."
    }
  ],
  "analysis": {
    "overallScore": 6.5,
    "hireSignal": "lean_yes",
    "starAverages": { "situation": 7, "task": 5, "action": 6, "result": 4 },
    "communicationAverages": { "clarity": 7, "conciseness": 6, "structure": 6, "confidence": 6 },
    "strengths": ["Clear communication", "Good interpersonal awareness", "Relevant examples"],
    "weaknesses": ["Results lack metrics", "Actions too vague", "Weak ownership in Task"],
    "patterns": [
      {
        "type": "attention",
        "description": "Missing quantification in results across multiple answers",
        "instanceCount": 4,
        "affectedAnswerIds": ["abc123", "ghi789", "jkl012", "mno345"]
      }
    ]
  },
  "coaching": {
    "topPriorities": [
      {
        "issue": "Results lack measurable outcomes",
        "whyItMatters": "Interviewers judge impact, not effort",
        "fix": "End every answer with a concrete, quantified result",
        "example": "Instead of 'engagement improved', say 'increased onboarding completion by 25%'"
      }
    ],
    "quickWins": ["Add one number to every answer", "Practice ending with impact statements"],
    "practicePlan": {
      "nextSessionFocus": "Strengthening result statements",
      "recommendedAgent": "story-architect",
      "drill": "Answer 5 questions with forced metrics in every result"
    }
  }
}
\`\`\`

Now analyze the interview transcript above and return your JSON response.`;
}