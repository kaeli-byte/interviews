import { GoogleGenerativeAI } from "@google/generative-ai";

export async function generateDebrief(transcript: string[]) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
    Based on the following transcript of a career coaching session, generate a structured career debrief.
    The debrief should help the user improve their branding and selling themselves.
    
    Transcript:
    ${transcript.join('\n')}
    
    Please return the result in the following JSON format:
    {
      "elevatorPitch": "A concise 2-3 sentence pitch summarizing the user's value.",
      "keyAchievements": ["Achievement 1", "Achievement 2", "Achievement 3"],
      "uniqueValueProposition": "A short statement about what makes this user unique.",
      "areasForImprovement": ["Improvement 1", "Improvement 2"]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Extract JSON from the response (sometimes Gemini wraps it in code blocks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse JSON from AI response");
  } catch (error) {
    console.error("Debrief generation failed", error);
    // Fallback if AI fails or quota is hit
    return {
      elevatorPitch: "A results-oriented professional ready for new challenges.",
      keyAchievements: ["Completed a major career session"],
      uniqueValueProposition: "Versatile and growth-oriented mindset.",
      areasForImprovement: ["Articulate more specific metrics for your achievements."]
    };
  }
}
