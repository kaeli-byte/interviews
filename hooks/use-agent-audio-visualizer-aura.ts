import { useEffect, useRef, useState, useCallback } from 'react';
import {
  type ValueAnimationTransition,
  animate,
  useMotionValue,
  useMotionValueEvent,
} from 'framer-motion';
import { useAudioAnalyser, type AudioAnalysisData } from './use-audio-analyser';

// Agent state type (local definition, not from LiveKit)
export type AgentState =
  | 'idle'
  | 'connecting'
  | 'initializing'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'pre-connect-buffering'
  | 'failed'
  | 'disconnected';

const DEFAULT_SPEED = 10;
const DEFAULT_AMPLITUDE = 2;
const DEFAULT_FREQUENCY = 0.5;
const DEFAULT_SCALE = 0.2;
const DEFAULT_BRIGHTNESS = 1.5;
const DEFAULT_TRANSITION: ValueAnimationTransition = { duration: 0.5, ease: 'easeOut' };
const DEFAULT_PULSE_TRANSITION: ValueAnimationTransition = {
  duration: 0.35,
  ease: 'easeOut',
  repeat: Infinity,
  repeatType: 'mirror',
};

function useAnimatedValue<T>(initialValue: T) {
  const [value, setValue] = useState(initialValue);
  const motionValue = useMotionValue(initialValue);
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null);
  useMotionValueEvent(motionValue, 'change', (value) => setValue(value as T));

  const animateFn = useCallback(
    (targetValue: T | T[], transition: ValueAnimationTransition) => {
      controlsRef.current = animate(motionValue, targetValue, transition);
    },
    [motionValue],
  );

  return { value, motionValue, controls: controlsRef, animate: animateFn };
}

export function useAgentAudioVisualizerAura(
  state: AgentState | undefined,
  analyser?: AnalyserNode | null
) {
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const {
    value: scale,
    animate: animateScale,
    motionValue: scaleMotionValue,
  } = useAnimatedValue(DEFAULT_SCALE);
  const { value: amplitude, animate: animateAmplitude } = useAnimatedValue(DEFAULT_AMPLITUDE);
  const { value: frequency, animate: animateFrequency } = useAnimatedValue(DEFAULT_FREQUENCY);
  const { value: brightness, animate: animateBrightness } = useAnimatedValue(DEFAULT_BRIGHTNESS);

  // Audio analysis - reactive when speaking or listening
  const isAudioReactive = state === 'speaking' || state === 'listening';
  const audioData = useAudioAnalyser({
    analyser,
    enabled: isAudioReactive
  });

  useEffect(() => {
    switch (state) {
      case 'idle':
      case 'failed':
      case 'disconnected':
        setSpeed(10);
        animateScale(0.2, DEFAULT_TRANSITION);
        animateAmplitude(1.2, DEFAULT_TRANSITION);
        animateFrequency(0.4, DEFAULT_TRANSITION);
        animateBrightness(1.0, DEFAULT_TRANSITION);
        return;
      case 'listening':
      case 'pre-connect-buffering':
        setSpeed(20);
        animateScale(0.3, { type: 'spring', duration: 1.0, bounce: 0.35 });
        animateAmplitude(1.0, DEFAULT_TRANSITION);
        animateFrequency(0.7, DEFAULT_TRANSITION);
        animateBrightness([1.5, 2.0], DEFAULT_PULSE_TRANSITION);
        return;
      case 'thinking':
      case 'connecting':
      case 'initializing':
        setSpeed(30);
        animateScale(0.3, DEFAULT_TRANSITION);
        animateAmplitude(0.5, DEFAULT_TRANSITION);
        animateFrequency(1, DEFAULT_TRANSITION);
        animateBrightness([0.5, 2.5], DEFAULT_PULSE_TRANSITION);
        return;
      case 'speaking':
        setSpeed(70);
        animateScale(0.3, DEFAULT_TRANSITION);
        animateAmplitude(0.75, DEFAULT_TRANSITION);
        animateFrequency(1.25, DEFAULT_TRANSITION);
        animateBrightness(1.5, DEFAULT_TRANSITION);
        return;
    }
  }, [state, animateScale, animateAmplitude, animateFrequency, animateBrightness]);

  // Audio-reactive animations - modulate parameters based on audio levels
  useEffect(() => {
    if (!isAudioReactive || !audioData.volume) return;

    // Map audio volume to visual parameters
    const volumeScale = 0.25 + audioData.volume * 0.2; // 0.25-0.45
    const bassAmplitude = 0.5 + audioData.bass * 0.5; // 0.5-1.0
    const trebleFrequency = 0.8 + audioData.treble * 0.5; // 0.8-1.3
    const volumeBrightness = 1.0 + audioData.volume * 1.0; // 1.0-2.0

    // Smoothly animate to audio-driven values
    if (state === 'speaking') {
      // More reactive during speaking
      animateScale(volumeScale, { duration: 0.1 });
      animateAmplitude(bassAmplitude, { duration: 0.1 });
      animateFrequency(trebleFrequency, { duration: 0.1 });
      animateBrightness(volumeBrightness, { duration: 0.1 });
    } else if (state === 'listening') {
      // Subtle reaction during listening (user is speaking)
      animateScale(0.3 + audioData.volume * 0.1, { duration: 0.15 });
      animateBrightness(1.5 + audioData.volume * 0.5, { duration: 0.15 });
    }
  }, [audioData, isAudioReactive, state, animateScale, animateAmplitude, animateFrequency, animateBrightness]);

  return {
    speed,
    scale,
    amplitude,
    frequency,
    brightness,
    audioData: isAudioReactive ? audioData : undefined,
  };
}