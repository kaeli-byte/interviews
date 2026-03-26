/**
 * This is a client-side utility for the Gemini Multimodal Live API.
 * In a production app, you'd use ephemeral tokens via a backend.
 */

import { TranscriptEntry, TranscriptUpdate } from './types';

// Track partial transcriptions per speaker
interface PartialTranscription {
  text: string;
  timestamp: number;
  lastUpdate: number; // Track when we last updated
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
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
    this.model = 'gemini-2.5-flash-native-audio-preview-12-2025'; // Validated model for Live API
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

  connect(systemInstruction: string) {
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

    // Safety check for existing connections
    if (this.ws) {
      this.disconnect();
    }

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      console.log('Gemini Live Connected');
      const config = {
        setup: {
          model: `models/${this.model}`,
          generation_config: {
            response_modalities: ["AUDIO"],
          },
          system_instruction: {
            role: "system",
            parts: [{ text: systemInstruction }]
          },
          // Enable transcription (v1beta format)
          input_audio_transcription: {},
          output_audio_transcription: {}
        }
      };
      this.ws?.send(JSON.stringify(config));
    };

    this.ws.onmessage = async (event) => {
      try {
        let text = event.data;
        if (text instanceof Blob) {
          text = await text.text();
        }
        const data = JSON.parse(text);

        const serverContent = data.serverContent || data.server_content;

        if (serverContent) {
          const turnComplete = serverContent.turnComplete || serverContent.turn_complete;
          const modelTurn = serverContent.modelTurn || serverContent.model_turn;

          // Handle text chunks directly from modelTurn (alternative path)
          if (modelTurn?.parts) {
            for (const part of modelTurn.parts) {
              // Text chunk for chat box
              if (part.text && !part.thought) {
                console.log(`[Gemini] AI text chunk: "${part.text}"`);
                const existing = this.partials.get('interviewer');
                if (existing) {
                  existing.text += part.text;
                  existing.lastUpdate = Date.now();
                } else {
                  this.partials.set('interviewer', {
                    text: part.text,
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
            // Finalize user's partial when AI starts speaking
            this.finalizePartial('candidate');
          }

          // When turn completes, finalize AI's partial
          if (turnComplete) {
            this.finalizePartial('interviewer');
          }

          // Input transcription (candidate/user speech)
          // API sends incremental chunks, need to accumulate
          const inputTranscription = serverContent.inputTranscription || serverContent.input_transcription;
          if (inputTranscription?.text && typeof inputTranscription.text === 'string') {
            const trimmedText = inputTranscription.text.trim();
            if (trimmedText) {
              const existing = this.partials.get('candidate');
              if (existing) {
                // API sends incremental chunks, append them
                existing.text += ' ' + trimmedText;
                existing.text = existing.text.replace(/\s+/g, ' ').trim(); // Normalize whitespace
                existing.lastUpdate = Date.now();
              } else {
                this.partials.set('candidate', {
                  text: trimmedText,
                  timestamp: Date.now(),
                  lastUpdate: Date.now()
                });
              }

              // Emit updated accumulated text as partial
              this.onTranscript({
                speaker: 'candidate',
                text: this.partials.get('candidate')!.text,
                timestamp: this.partials.get('candidate')!.timestamp,
                isPartial: true
              });
            }
          }

          // Output transcription (interviewer/AI speech)
          // API sends incremental chunks, need to accumulate
          const outputTranscription = serverContent.outputTranscription || serverContent.output_transcription;
          if (outputTranscription?.text && typeof outputTranscription.text === 'string') {
            const trimmedText = outputTranscription.text.trim();
            if (trimmedText) {
              const existing = this.partials.get('interviewer');
              if (existing) {
                // API sends incremental chunks, append them
                existing.text += ' ' + trimmedText;
                existing.text = existing.text.replace(/\s+/g, ' ').trim(); // Normalize whitespace
                existing.lastUpdate = Date.now();
              } else {
                this.partials.set('interviewer', {
                  text: trimmedText,
                  timestamp: Date.now(),
                  lastUpdate: Date.now()
                });
              }

              // Emit updated accumulated text as partial
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
        console.error('Failed to parse WS message', e);
      }
    };

    this.ws.onerror = (error) => {
      console.error('Gemini Live Error', error);
      this.onError(error);
    };

    this.ws.onclose = (event) => {
      console.log('Gemini Live Closed', event.code, event.reason);
    };
  }

  sendAudio(base64Data: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const msg = {
        realtimeInput: {
          media: {
            data: base64Data,
            mimeType: "audio/pcm;rate=16000"
          }
        }
      };
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect() {
    if (this.ws) {
      // Only close if it's actually open or connecting
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      this.ws.onopen = null;
      this.ws = null;
    }
  }
}