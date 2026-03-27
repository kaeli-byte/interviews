/**
 * Simulation runner for AI-to-AI text chat interview simulation.
 * Per D-09: Alternating API calls between interviewer and candidate.
 * Per D-03: 5 question-answer pairs per simulation.
 * Per D-12: Question count triggers end.
 * Per D-13: Stop button triggers immediate stop + partial debrief.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  SimulationConfig,
  SimulationSession,
  SimulationState,
  SimulationMessage,
  TranscriptEntry,
  QAPair,
} from './types';
import { buildInterviewerPrompt, buildCandidatePrompt } from './simulationPrompts';

export type SimulationCallback = (state: SimulationState) => void;
export type SimulationCompleteCallback = (transcript: TranscriptEntry[]) => void;

/**
 * SimulationRunner manages the AI-to-AI interview simulation.
 */
export class SimulationRunner {
  private config: SimulationConfig;
  private session: SimulationSession;
  private callbacks: SimulationCallback[] = [];
  private onComplete?: SimulationCompleteCallback;
  private abortController: AbortController | null = null;
  private genAI: GoogleGenerativeAI;

  constructor(config: SimulationConfig) {
    // Per D-06: Default speed is 1x
    this.config = {
      ...config,
      speed: config.speed || '1x',
      maxQuestions: config.maxQuestions || 5, // Per D-03
    };

    this.session = {
      id: crypto.randomUUID(),
      config: this.config,
      state: {
        messages: [],
        qaPairs: [],
        currentQuestionCount: 0,
        isRunning: false,
        isComplete: false,
      },
      startTime: Date.now(),
    };

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Subscribe to state updates during simulation.
   */
  onStateUpdate(callback: SimulationCallback): () => void {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Set the completion callback.
   */
  setOnComplete(callback: SimulationCompleteCallback): void {
    this.onComplete = callback;
  }

  /**
   * Get current session state.
   */
  getState(): SimulationState {
    return this.session.state;
  }

  /**
   * Run the simulation.
   * Per D-09: Alternating interviewer -> candidate API calls.
   */
  async runSimulation(): Promise<TranscriptEntry[]> {
    this.abortController = new AbortController();
    this.session.state.isRunning = true;
    this.notifyStateUpdate();

    try {
      const interviewerPrompt = buildInterviewerPrompt(
        this.config.interviewerAgentId,
        this.config.resume,
        this.config.jobDescription
      );
      const candidatePrompt = buildCandidatePrompt(this.config.candidatePersona);

      // Create models for each role with system instructions
      const interviewerModel = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: interviewerPrompt,
      });
      const candidateModel = this.genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: candidatePrompt,
      });

      // Start chat sessions
      const interviewerChat = interviewerModel.startChat();
      const candidateChat = candidateModel.startChat();

      // Per D-03/D-12: Run for maxQuestions Q/A pairs
      while (
        this.session.state.currentQuestionCount < this.config.maxQuestions &&
        !this.abortController.signal.aborted
      ) {
        // Step 1: Interviewer asks a question
        // Chat session maintains history, so just ask for next question
        const questionNum = this.session.state.currentQuestionCount + 1;
        const questionPrompt = questionNum === 1
          ? 'Start the interview by asking your FIRST question. Ask only ONE question.'
          : `Ask your next question (this is question ${questionNum} of 5). Ask only ONE question.`;

        const questionResult = await this.generateWithTimeout(
          interviewerChat,
          questionPrompt,
          this.abortController.signal
        );

        if (!questionResult || this.abortController.signal.aborted) break;

        const questionText = questionResult.trim();
        const questionTimestamp = Date.now() - this.session.startTime;

        // Add question to messages
        this.addMessage({
          id: crypto.randomUUID(),
          speaker: 'interviewer',
          text: questionText,
          timestamp: questionTimestamp,
          isComplete: true,
        });

        // Per D-07: Apply speed-based delay before candidate responds
        await this.delayForSpeed();

        if (this.abortController.signal.aborted) break;

        // Step 2: Candidate responds
        // Candidate chat maintains its own history
        const answerResult = await this.generateWithTimeout(
          candidateChat,
          `The interviewer just asked: "${questionText}"\n\nRespond to this question as the candidate.`,
          this.abortController.signal
        );

        if (!answerResult || this.abortController.signal.aborted) break;

        const answerText = answerResult.trim();
        const answerTimestamp = Date.now() - this.session.startTime;

        // Add answer to messages
        this.addMessage({
          id: crypto.randomUUID(),
          speaker: 'candidate',
          text: answerText,
          timestamp: answerTimestamp,
          isComplete: true,
        });

        // Create QAPair for this exchange
        const qaPair: QAPair = {
          id: crypto.randomUUID(),
          question: {
            speaker: 'interviewer',
            text: questionText,
            timestamp: questionTimestamp,
          },
          response: [{
            speaker: 'candidate',
            text: answerText,
            timestamp: answerTimestamp,
          }],
          startTimestamp: questionTimestamp,
          endTimestamp: answerTimestamp,
        };
        this.session.state.qaPairs.push(qaPair);

        // Increment question count
        this.session.state.currentQuestionCount++;
        this.notifyStateUpdate();

        // Per D-07: Delay between Q/A pairs based on speed
        if (this.session.state.currentQuestionCount < this.config.maxQuestions) {
          await this.delayForSpeed();
        }
      }

      // Mark complete
      this.session.state.isComplete = true;
      this.session.state.isRunning = false;
      this.session.endTime = Date.now();
      this.notifyStateUpdate();

      // Convert messages to TranscriptEntry[] for debrief
      const transcript: TranscriptEntry[] = this.session.state.messages.map(msg => ({
        speaker: msg.speaker,
        text: msg.text,
        timestamp: msg.timestamp,
      }));

      // Call completion callback
      this.onComplete?.(transcript);

      return transcript;

    } catch (error) {
      console.error('[SimulationRunner] Error during simulation:', error);
      this.session.state.isRunning = false;
      this.notifyStateUpdate();
      throw error;
    }
  }

  /**
   * Per D-13: Stop simulation immediately and return partial transcript.
   */
  stopSimulation(): TranscriptEntry[] {
    if (this.abortController) {
      this.abortController.abort();
    }

    this.session.state.isRunning = false;
    this.session.endTime = Date.now();
    this.notifyStateUpdate();

    // Return partial transcript for debrief
    const transcript: TranscriptEntry[] = this.session.state.messages.map(msg => ({
      speaker: msg.speaker,
      text: msg.text,
      timestamp: msg.timestamp,
    }));

    return transcript;
  }

  /**
   * Add a message to the session state.
   */
  private addMessage(message: SimulationMessage): void {
    this.session.state.messages.push(message);
    this.notifyStateUpdate();
  }

  /**
   * Notify all subscribers of state update.
   */
  private notifyStateUpdate(): void {
    this.callbacks.forEach(cb => cb(this.session.state));
  }

  /**
   * Generate content with timeout and abort support.
   */
  private async generateWithTimeout(
    chat: any,
    prompt: string,
    signal: AbortSignal
  ): Promise<string | null> {
    try {
      const result = await Promise.race([
        chat.sendMessage(prompt),
        new Promise<null>((_, reject) => {
          signal.addEventListener('abort', () => reject(new Error('Aborted')));
          setTimeout(() => reject(new Error('Timeout')), 60000); // 60s timeout
        }),
      ]);

      if (signal.aborted) return null;

      return result.response.text();
    } catch (error) {
      if (signal.aborted) return null;
      throw error;
    }
  }

  /**
   * Per D-07: Calculate delay based on speed setting.
   * Speed affects message timing only, not streaming speed.
   */
  private delayForSpeed(): Promise<void> {
    // Base delay between messages (in ms)
    const baseDelay = 1500; // 1.5 seconds at 1x

    const speedMultipliers: Record<string, number> = {
      '1x': 1,
      '1.5x': 0.67,
      '2x': 0.5,
    };

    const delay = baseDelay * (speedMultipliers[this.config.speed] || 1);
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

/**
 * Convenience function to run a simulation with callbacks.
 */
export async function runSimulation(
  config: SimulationConfig,
  onStateUpdate?: SimulationCallback
): Promise<TranscriptEntry[]> {
  const runner = new SimulationRunner(config);
  if (onStateUpdate) {
    runner.onStateUpdate(onStateUpdate);
  }
  return runner.runSimulation();
}

/**
 * Convenience function to stop a running simulation.
 * Note: You need to keep a reference to the SimulationRunner instance.
 */
export function stopSimulation(runner: SimulationRunner): TranscriptEntry[] {
  return runner.stopSimulation();
}