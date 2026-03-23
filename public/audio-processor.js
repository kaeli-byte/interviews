/**
 * AudioWorklet processor for capturing PCM audio data.
 * This runs in a separate audio thread for better performance.
 */
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferIndex = 0;
    this.chunkCount = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    
    // Debug: log input status for first few chunks
    if (this.chunkCount < 3) {
      this.port.postMessage({
        type: 'debug',
        inputLength: input ? input.length : -1,
        hasChannel: input && input.length > 0,
        sampleValues: input && input.length > 0 ? Array.from(input[0].slice(0, 10)) : null
      });
    }
    
    if (input.length > 0) {
      const channelData = input[0]; // Float32 mono input
      
      // Convert Float32 to Int16 PCM
      for (let i = 0; i < channelData.length; i++) {
        // Clamp and convert to 16-bit integer
        const sample = Math.max(-1, Math.min(1, channelData[i]));
        this.buffer[this.bufferIndex++] = sample < 0 
          ? sample * 0x8000 
          : sample * 0x7FFF;
        
        // Send buffer when full
        if (this.bufferIndex >= this.bufferSize) {
          // Post a copy of the buffer data
          this.port.postMessage({
            type: 'audio',
            data: this.buffer.slice(0)
          });
          this.bufferIndex = 0;
          this.chunkCount++;
        }
      }
    }
    
    return true; // Keep the processor alive
  }
}

registerProcessor('audio-processor', AudioProcessor);