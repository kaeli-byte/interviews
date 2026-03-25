import { Buffer } from 'buffer';

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private onAudio: (base64Data: string) => void;

  constructor(onAudio: (base64Data: string) => void) {
    this.onAudio = onAudio;
  }

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioContext = new AudioContext({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(this.stream);

    // Create analyser for level monitoring
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    // Using ScriptProcessor for simplicity in this prototype
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    this.analyser.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    this.processor.onaudioprocess = (e) => {
      const inputData = e.inputBuffer.getChannelData(0);
      // Convert Float32 to Int16
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }

      const base64Data = Buffer.from(pcmData.buffer).toString('base64');
      this.onAudio(base64Data);
    };
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  stop() {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.analyser) {
      this.analyser.disconnect();
      this.analyser = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }
}
