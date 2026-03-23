import { GoogleGenerativeAI } from "@google/generative-ai";
import { TranscriptEntry, QAPair, SessionStats, DebriefReport, TranscriptSummary, QAPairSummary } from "./types";
import { processTranscript } from "./transcriptProcessor";

/**
 * Generate debrief from actual interview transcript.
 * Per D-05: Full rewrite taking TranscriptEntry[] input.
 * Per D-06: Output includes transcript summary, session stats, legacy fields.
 */
export async function generateDebrief(entries: TranscriptEntry[]): Promise<DebriefReport> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  // Step 1: Process transcript into structured data
  const { merged, pairs, stats } = processTranscript(entries);

  // Step 2: Format transcript for AI analysis
  const transcriptText = formatTranscriptForAI(merged);

  // Step 3: Generate AI-powered insights
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = buildDebriefPrompt(transcriptText, pairs);

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error("Failed to parse JSON from AI response");
    }

    const aiInsights = JSON.parse(jsonMatch[0]);

    // Step 4: Build final report with transcript summary
    const report: DebriefReport = {
      // Legacy fields from AI
      elevatorPitch: aiInsights.elevatorPitch || "A dedicated professional with strong communication skills.",
      keyAchievements: aiInsights.keyAchievements || ["Completed interview session successfully"],
      uniqueValueProposition: aiInsights.uniqueValueProposition || "Demonstrated ability to articulate experiences clearly.",
      areasForImprovement: aiInsights.areasForImprovement || ["Continue practicing structured responses"],

      // Transcript-based fields
      transcriptSummary: buildTranscriptSummary(pairs),
      sessionStats: stats,
    };

    return report;

  } catch (error) {
    console.error("Debrief generation failed", error);

    // Fallback report with transcript data even if AI fails
    return {
      elevatorPitch: "A professional who completed the interview session.",
      keyAchievements: ["Participated in mock interview session"],
      uniqueValueProposition: "Committed to improving interview skills.",
      areasForImprovement: ["Practice more structured responses"],
      transcriptSummary: buildTranscriptSummary(pairs),
      sessionStats: stats,
    };
  }
}

/**
 * Format transcript entries for AI prompt.
 */
function formatTranscriptForAI(entries: TranscriptEntry[]): string {
  return entries
    .map(e => `${e.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${e.text}`)
    .join('\n');
}

/**
 * Build the AI prompt for debrief generation.
 * Uses transcript data, NOT resume/JD (per Pitfall 1).
 */
function buildDebriefPrompt(transcriptText: string, pairs: QAPair[]): string {
  return `
Based on the following interview transcript, generate a structured career debrief.
The debrief should help the user improve their interview performance based on WHAT THEY ACTUALLY SAID.

Interview Transcript:
${transcriptText}

Number of Q&A exchanges: ${pairs.length}

Please return the result in the following JSON format:
{
  "elevatorPitch": "A concise 2-3 sentence pitch summarizing the candidate's demonstrated value based on their responses.",
  "keyAchievements": ["Achievement or strength demonstrated in interview 1", "Achievement 2", "Achievement 3"],
  "uniqueValueProposition": "What makes this candidate stand out based on their interview responses.",
  "areasForImprovement": ["Specific improvement area based on their responses", "Another area"]
}

IMPORTANT:
- Base insights ONLY on what the candidate said during the interview
- Be specific and reference actual answers where possible
- Focus on communication clarity, structure, and impact
`;
}

/**
 * Build transcript summary from Q/A pairs.
 */
function buildTranscriptSummary(pairs: QAPair[]): TranscriptSummary {
  const pairSummaries: QAPairSummary[] = pairs.map(pair => ({
    id: pair.id,
    question: pair.question.text,
    response: pair.response.map(r => r.text).join(' '),
    timestamp: formatTimestamp(pair.startTimestamp),
  }));

  const fullText = pairs
    .map(p => `Q: ${p.question.text}\nA: ${p.response.map(r => r.text).join(' ')}`)
    .join('\n\n');

  return {
    pairs: pairSummaries,
    fullText,
  };
}

/**
 * Format timestamp (ms) as MM:SS.
 */
function formatTimestamp(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}