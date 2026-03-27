/**
 * API endpoint for running AI-to-AI interview simulation.
 * Per D-04: Stream each message as generated.
 * Per D-13: Support stop functionality with partial transcript.
 *
 * POST /api/simulation
 * Request body: { config: SimulationConfig }
 * Response: SSE stream with simulation messages
 *
 * POST /api/simulation?action=stop&sessionId=xxx
 * Response: { transcript: TranscriptEntry[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { SimulationRunner } from '@/lib/simulationRunner';
import { SimulationConfig, TranscriptEntry } from '@/lib/types';

// Store active runners for stop functionality
const activeRunners = new Map<string, SimulationRunner>();

/**
 * POST handler for simulation streaming and stop.
 */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const sessionId = url.searchParams.get('sessionId');

  // Handle stop action
  if (action === 'stop' && sessionId) {
    const runner = activeRunners.get(sessionId);
    if (!runner) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const transcript = runner.stopSimulation();
    activeRunners.delete(sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      transcript,
      messageCount: transcript.length,
    });
  }

  // Handle start simulation
  try {
    const body = await request.json();
    const config: SimulationConfig = body.config;

    if (!config) {
      return NextResponse.json(
        { error: 'Missing config in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!config.candidatePersona || !config.interviewerAgentId) {
      return NextResponse.json(
        { error: 'Missing required config fields: candidatePersona, interviewerAgentId' },
        { status: 400 }
      );
    }

    // Create runner
    const runner = new SimulationRunner(config);
    const newSessionId = crypto.randomUUID();

    // Store runner for potential stop
    activeRunners.set(newSessionId, runner);

    // Create SSE stream
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        // Send session ID first
        const sessionEvent = `data: ${JSON.stringify({
          type: 'session',
          sessionId: newSessionId,
        })}\n\n`;
        controller.enqueue(encoder.encode(sessionEvent));

        // Subscribe to state updates
        const unsubscribe = runner.onStateUpdate((state) => {
          const latestMessage = state.messages[state.messages.length - 1];
          if (latestMessage && latestMessage.isComplete) {
            const messageEvent = `data: ${JSON.stringify({
              type: 'message',
              message: latestMessage,
              questionCount: state.currentQuestionCount,
              isComplete: state.isComplete,
            })}\n\n`;
            controller.enqueue(encoder.encode(messageEvent));
          }
        });

        try {
          // Run simulation
          const transcript = await runner.runSimulation();

          // Send completion event
          const completeEvent = `data: ${JSON.stringify({
            type: 'complete',
            sessionId: newSessionId,
            transcript,
            totalQuestions: runner.getState().currentQuestionCount,
          })}\n\n`;
          controller.enqueue(encoder.encode(completeEvent));

          // Clean up
          activeRunners.delete(newSessionId);
          unsubscribe();
          controller.close();
        } catch (error) {
          // Send error event
          const errorEvent = `data: ${JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Simulation failed',
          })}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));

          activeRunners.delete(newSessionId);
          unsubscribe();
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no', // Disable nginx buffering
      },
    });

  } catch (error) {
    console.error('[API/simulation] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for checking active sessions.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');

  if (sessionId) {
    const runner = activeRunners.get(sessionId);
    if (runner) {
      const state = runner.getState();
      return NextResponse.json({
        active: true,
        sessionId,
        state: {
          messageCount: state.messages.length,
          questionCount: state.currentQuestionCount,
          isRunning: state.isRunning,
          isComplete: state.isComplete,
        },
      });
    }
    return NextResponse.json({
      active: false,
      sessionId,
    });
  }

  // List all active sessions
  return NextResponse.json({
    activeSessions: Array.from(activeRunners.keys()),
    count: activeRunners.size,
  });
}