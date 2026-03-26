/**
 * Gemini Live API client using @google/genai SDK
 * Based on: https://github.com/jaydanurwin/gemini-live-agent-demo
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { TranscriptEntry, TranscriptUpdate } from './types';
import { Buffer } from 'buffer';

// Track partial transcriptions per speaker
interface PartialTranscription {
  text: string;
  timestamp: number;
  lastUpdate: number;
}

export class GeminiLiveClient {
  private client: GoogleGenAI | null = null;
  private session: any = null;
  private apiKey: string;
  private model: string;
  private onMessage: (msg: any) => void;
  private onError: (err: any) => void;
  private onTranscript: (entry: TranscriptUpdate) => void;
  private partials: Map<'candidate' | 'interviewer', PartialTranscription> = new Map();

  constructor(
    apiKey: string,
    onMessage: (msg: any) => void,
    onError: (err: any) => void,
    onTranscript: (entry: TranscriptUpdate) => void
  ) {
    this.apiKey = apiKey;
    this.model = 'gemini-2.5-flash-native-audio-preview-12-2025'; // Live API model (preview)
    this.onMessage = onMessage;
    this.onError = onError;
    this.onTranscript = onTranscript;
  }

  /**
   * Finalize a partial transcription and clear it
   */
  private finalizePartial(speaker: 'candidate' | 'interviewer') {
    const partial = this.partials.get(speaker);
    if (partial) {
      console.log(`[Gemini] ${speaker === 'candidate' ? 'User' : 'AI'}: "${partial.text}"`);
      this.onTranscript({
        speaker,
        text: partial.text,
        timestamp: partial.timestamp,
        isPartial: false
      });
      this.partials.delete(speaker);
    }
  }

  async connect(systemInstruction: string) {
    // Safety check for existing connections
    if (this.session) {
      this.disconnect();
    }

    console.log('[Gemini] Connecting with model:', this.model);
    this.client = new GoogleGenAI({ apiKey: this.apiKey });

    try {
      this.session = await this.client.live.connect({
        model: this.model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: systemInstruction,
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onmessage: (event: any) => {
            console.log('[Gemini] Received message:', JSON.stringify(event).substring(0, 200));
            this.handleMessage(event);
          },
          onerror: (error: any) => {
            console.error('[Gemini] Error:', error);
            this.onError(error);
          },
          onclose: (event: any) => {
            console.log('[Gemini] Closed:', event);
          }
        }
      });
      console.log('[Gemini] Connected successfully');
    } catch (error) {
      console.error('[Gemini] Failed to connect:', error);
      this.onError(error);
    }
  }

  private handleMessage(data: any) {
    try {
      // Check for setupComplete first
      if (data.setupComplete) {
        console.log('[Gemini] Setup complete, sessionId:', data.setupComplete.sessionId);
      }

      const serverContent = data.serverContent || data.server_content;

      if (serverContent) {
        const turnComplete = serverContent.turnComplete || serverContent.turn_complete;
        const modelTurn = serverContent.modelTurn || serverContent.model_turn;

        // Handle model turn - finalize user's partial when AI starts speaking
        if (modelTurn?.parts) {
          this.finalizePartial('candidate');
        }

        // When turn completes, finalize AI's partial
        if (turnComplete) {
          this.finalizePartial('interviewer');
        }

        // Input transcription (candidate/user speech)
        const inputTranscription = serverContent.inputTranscription || serverContent.input_transcription;
        if (inputTranscription?.text && typeof inputTranscription.text === 'string') {
          const chunkText = inputTranscription.text;
          if (chunkText) {
            const existing = this.partials.get('candidate');
            if (existing) {
              existing.text += chunkText;
              existing.lastUpdate = Date.now();
            } else {
              this.partials.set('candidate', {
                text: chunkText,
                timestamp: Date.now(),
                lastUpdate: Date.now()
              });
            }

            this.onTranscript({
              speaker: 'candidate',
              text: this.partials.get('candidate')!.text,
              timestamp: this.partials.get('candidate')!.timestamp,
              isPartial: true
            });
          }
        }

        // Output transcription (interviewer/AI speech)
        const outputTranscription = serverContent.outputTranscription || serverContent.output_transcription;
        if (outputTranscription?.text && typeof outputTranscription.text === 'string') {
          const chunkText = outputTranscription.text;
          if (chunkText) {
            const existing = this.partials.get('interviewer');
            if (existing) {
              existing.text += chunkText;
              existing.lastUpdate = Date.now();
            } else {
              this.partials.set('interviewer', {
                text: chunkText,
                timestamp: Date.now(),
                lastUpdate: Date.now()
              });
            }

            this.onTranscript({
              speaker: 'interviewer',
              text: this.partials.get('interviewer')!.text,
              timestamp: this.partials.get('interviewer')!.timestamp,
              isPartial: true
            });
          }
        }
      }

      this.onMessage(data);
    } catch (e) {
      console.error('Failed to parse message', e);
    }
  }

  sendAudio(base64Data: string) {
    if (this.session) {
      // Working demo format: {media: {data, mimeType}}
      console.log('[Gemini] Sending audio chunk, base64 length:', base64Data.length);
      this.session.sendRealtimeInput({
        media: {
          data: base64Data,
          mimeType: 'audio/pcm;rate=16000'
        }
      });
    } else {
      console.warn('[Gemini] No session - cannot send audio');
    }
  }

  disconnect() {
    if (this.session) {
      this.session.close();
      this.session = null;
    }
    this.client = null;
  }
}