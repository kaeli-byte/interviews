import { useCallback, useEffect, useRef, useState } from 'react';

export interface AudioAnalysisData {
  /** Overall volume level (0-1) */
  volume: number;
  /** Bass frequencies (0-1) */
  bass: number;
  /** Mid frequencies (0-1) */
  mid: number;
  /** Treble frequencies (0-1) */
  treble: number;
  /** Raw frequency data array (normalized 0-1) */
  frequencyData: number[];
}

const DEFAULT_ANALYSIS_DATA: AudioAnalysisData = {
  volume: 0,
  bass: 0,
  mid: 0,
  treble: 0,
  frequencyData: [],
};

interface UseAudioAnalyserOptions {
  /** Existing AnalyserNode to use (e.g., from AudioRecorder) */
  analyser?: AnalyserNode | null;
  /** Smoothing time constant (0-1) */
  smoothing?: number;
  /** FFT size (must be power of 2) */
  fftSize?: number;
  /** Whether to analyze audio */
  enabled?: boolean;
}

/**
 * Hook for analyzing audio data from an AnalyserNode.
 * Can use an existing AnalyserNode (e.g., from AudioRecorder) or create its own.
 */
export function useAudioAnalyser(options: UseAudioAnalyserOptions = {}) {
  const { analyser: externalAnalyser, smoothing = 0.8, fftSize = 256, enabled = true } = options;

  const [data, setData] = useState<AudioAnalysisData>(DEFAULT_ANALYSIS_DATA);
  const internalAnalyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Use external analyser if provided, otherwise use internal one
  const analyser = externalAnalyser ?? internalAnalyserRef.current;

  const analyzeFrame = useCallback(() => {
    if (!analyser || !dataArrayRef.current) {
      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    // Normalize to 0-1 range
    const normalized = Array.from(dataArray).map(v => v / 255);

    // Calculate frequency bands
    const bassEnd = Math.floor(bufferLength * 0.1); // 0-10% of frequencies
    const midEnd = Math.floor(bufferLength * 0.5); // 10-50% of frequencies

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;
    let totalSum = 0;

    for (let i = 0; i < bufferLength; i++) {
      const value = normalized[i] ?? 0;
      totalSum += value;

      if (i < bassEnd) {
        bassSum += value;
      } else if (i < midEnd) {
        midSum += value;
      } else {
        trebleSum += value;
      }
    }

    const volume = totalSum / bufferLength;
    const bass = bassSum / bassEnd;
    const mid = midSum / (midEnd - bassEnd);
    const treble = trebleSum / (bufferLength - midEnd);

    setData({
      volume,
      bass,
      mid,
      treble,
      frequencyData: normalized,
    });

    animationFrameRef.current = requestAnimationFrame(analyzeFrame);
  }, [analyser]);

  // Start/stop analysis based on enabled state
  useEffect(() => {
    if (enabled && analyser) {
      // Initialize data array if needed
      const binCount = analyser.frequencyBinCount;
      if (!dataArrayRef.current || dataArrayRef.current.length !== binCount) {
        dataArrayRef.current = new Uint8Array(binCount);
      }
      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    }

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, analyser, analyzeFrame]);

  // Create internal analyser if no external one provided
  useEffect(() => {
    if (!externalAnalyser && enabled) {
      // Create audio context and analyser for demo/standalone use
      audioContextRef.current = new AudioContext();
      internalAnalyserRef.current = audioContextRef.current.createAnalyser();
      internalAnalyserRef.current.fftSize = fftSize;
      internalAnalyserRef.current.smoothingTimeConstant = smoothing;
      dataArrayRef.current = new Uint8Array(internalAnalyserRef.current.frequencyBinCount);

      return () => {
        internalAnalyserRef.current = null;
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
      };
    }
  }, [externalAnalyser, enabled, fftSize, smoothing]);

  return data;
}

/**
 * Hook for microphone audio analysis.
 * Creates its own AudioContext and connects to the microphone.
 */
export function useMicrophoneAnalyser(enabled: boolean = true) {
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Cleanup when disabled
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setAnalyser(null);
      setIsListening(false);
      return;
    }

    let mounted = true;

    async function startListening() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        const analyserNode = audioContext.createAnalyser();
        analyserNode.fftSize = 256;
        analyserNode.smoothingTimeConstant = 0.8;

        source.connect(analyserNode);

        setAnalyser(analyserNode);
        setIsListening(true);
        setError(null);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to access microphone');
          setIsListening(false);
        }
      }
    }

    startListening();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [enabled]);

  const analysisData = useAudioAnalyser({ analyser, enabled: isListening });

  return {
    ...analysisData,
    analyser,
    isListening,
    error,
  };
}