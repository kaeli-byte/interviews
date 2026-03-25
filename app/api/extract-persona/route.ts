import { NextRequest, NextResponse } from 'next/server';
import { extractPersona } from '@/lib/personaExtractor';

/**
 * API route for extracting candidate persona from resume and job description.
 * Per D-01: Single API call extracts all persona fields using Gemini.
 *
 * POST /api/extract-persona
 * Body: { resume: string, jobDescription: string }
 * Response: CandidatePersona | { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resume, jobDescription } = body;

    // Validate required fields
    if (!resume || typeof resume !== 'string' || resume.trim().length === 0) {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Job description text is required' },
        { status: 400 }
      );
    }

    // Extract persona using Gemini
    const persona = await extractPersona(resume.trim(), jobDescription.trim());

    return NextResponse.json(persona);
  } catch (error) {
    console.error('Persona extraction error:', error);
    const message = error instanceof Error ? error.message : 'Failed to extract persona';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}