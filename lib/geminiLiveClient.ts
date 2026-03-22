/**
 * This is a client-side utility for the Gemini Multimodal Live API.
 * In a production app, you'd use ephemeral tokens via a backend.
 */

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private apiKey: string;
  private model: string;
  private onMessage: (msg: any) => void;
  private onError: (err: any) => void;

  constructor(apiKey: string, onMessage: (msg: any) => void, onError: (err: any) => void) {
    this.apiKey = apiKey;
    this.model = 'gemini-2.5-flash-native-audio-latest'; // Use the latest available for Live API
    this.onMessage = onMessage;
    this.onError = onError;
  }

  connect(systemInstruction: string) {
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;
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
            parts: [{ text: systemInstruction }]
          }
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
        realtime_input: {
          media_chunks: [
            {
              data: base64Data,
              mime_type: "audio/pcm;rate=16000"
            }
          ]
        }
      };
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onopen = null;
      this.ws.close();
      this.ws = null;
    }
  }
}
