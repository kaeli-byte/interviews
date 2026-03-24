'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, PhoneOff, Timer, AlertCircle, MessageSquare, Video, VideoOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiLiveClient } from '@/lib/geminiLiveClient';
import { AudioRecorder } from '@/lib/audioRecorder';
import { AudioStreamer } from '@/lib/audioStreamer';
import { buildSystemInstruction } from '@/lib/promptBuilder';
import { TranscriptEntry, DebriefReport, AgentId } from '@/lib/types';
import { generateDebrief } from '@/lib/debriefGenerator';
import { AgentAudioVisualizerAura } from '@/components/agent-audio-visualizer-aura';

interface InterviewScreenProps {
  duration: number;
  onFinish: (transcript: TranscriptEntry[], report: DebriefReport | null) => void;
  resume: string;
  jobDescription: string;
  selectedAgent: AgentId;
}

/**
 * Microphone Level Gauge Component
 */
function MicrophoneGauge({ level, isActive }: { level: number; isActive: boolean }) {
  const bars = 12;
  const activeBars = isActive ? Math.floor((level / 100) * bars) : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-end justify-center gap-1.5 h-10">
        {Array.from({ length: bars }).map((_, i) => {
          const height = 10 + (i * 2.5);
          const isActiveBar = i < activeBars;
          const isWarning = i >= bars * 0.8 && isActiveBar;
          
          return (
            <motion.div
              key={i}
              className={`w-2 rounded-full transition-colors duration-75 ${
                !isActive
                  ? 'bg-surface-container-highest'
                  : isWarning
                  ? 'bg-yellow-500'
                  : isActiveBar
                  ? 'bg-tertiary'
                  : 'bg-surface-container-highest'
              }`}
              style={{ height: `${height}px` }}
              animate={{
                opacity: isActive && i < activeBars ? 1 : 0.4,
              }}
              transition={{ duration: 0.05 }}
            />
          );
        })}
      </div>
      <span className="text-[11px] font-semibold uppercase tracking-widest text-secondary">
        {isActive ? 'Mic Active' : 'Mic Off'}
      </span>
    </div>
  );
}

/**
 * Camera Preview Component
 */
function CameraPreview({ 
  isCameraOn, 
  onToggle 
}: { 
  isCameraOn: boolean; 
  onToggle: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: 'user', width: 480, height: 360 } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Failed to access camera:', err);
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn]);

  return (
    <div className="relative">
      <div className="w-48 h-36 md:w-56 md:h-42 lg:w-64 lg:h-48 rounded-2xl overflow-hidden bg-surface-container-lowest shadow-lg">
        {isCameraOn ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <VideoOff className="w-10 h-10 text-secondary mx-auto mb-2" />
              <span className="text-xs text-muted-foreground">Camera off</span>
            </div>
          </div>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`
          absolute -bottom-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center
          shadow-lg transition-all
          ${isCameraOn 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-surface-container-high text-secondary'
          }
        `}
      >
        {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </button>
    </div>
  );
}

/**
 * Status Indicator Badge
 */
function StatusBadge({ status }: { status: 'connecting' | 'talking' | 'listening' | 'finished' }) {
  const statusConfig = {
    connecting: { label: 'Connecting', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    talking: { label: 'AI Speaking', color: 'bg-primary', textColor: 'text-primary' },
    listening: { label: 'AI Listening', color: 'bg-tertiary', textColor: 'text-tertiary' },
    finished: { label: 'Complete', color: 'bg-secondary', textColor: 'text-secondary' },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2 bg-surface-container-lowest/90 px-5 py-2.5 rounded-full shadow-sm">
      <span className={`w-2.5 h-2.5 rounded-full ${config.color} ${status === 'listening' ? 'animate-pulse' : ''}`} />
      <span className={`text-sm font-semibold uppercase tracking-wider ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}

export default function InterviewScreen({
  duration,
  onFinish,
  resume,
  jobDescription,
  selectedAgent
}: InterviewScreenProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRecording, setIsRecording] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'talking' | 'listening' | 'finished'>('connecting');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const [isCameraOn, setIsCameraOn] = useState(true);

  const clientRef = useRef<GeminiLiveClient | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const streamerRef = useRef<AudioStreamer | null>(null);
  const transcriptRef = useRef<TranscriptEntry[]>([]);
  const interviewStartTimeRef = useRef<number>(0);
  const isRecordingRef = useRef(isRecording);
  const animationFrameRef = useRef<number | null>(null);

  // Sync refs with state
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Microphone level monitoring
  useEffect(() => {
    const analyser = recorderRef.current?.getAnalyser();
    
    if (!isRecording || !analyser) {
      setMicLevel(0);
      return;
    }

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!isRecordingRef.current) {
        setMicLevel(0);
        return;
      }

      const currentAnalyser = recorderRef.current?.getAnalyser();
      if (!currentAnalyser) {
        setMicLevel(0);
        return;
      }

      currentAnalyser.getByteFrequencyData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const average = sum / dataArray.length;
      const scaledLevel = Math.min(100, average * 1.5);
      setMicLevel(scaledLevel);

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording]);

  const handleFinish = useCallback(async () => {
    setStatus('finished');
    clientRef.current?.disconnect();
    recorderRef.current?.stop();
    streamerRef.current?.stop();

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Per D-04: Generate debrief before calling onFinish
    // Per PITFALLS.md Pitfall 1: Fix the bug where null was passed for report
    try {
      const report = await generateDebrief(transcriptRef.current);
      onFinish(transcriptRef.current, report);
    } catch (error) {
      console.error('[InterviewScreen] Failed to generate debrief:', error);
      // Still call onFinish with transcript even if debrief fails
      onFinish(transcriptRef.current, null);
    }
  }, [onFinish]);

  useEffect(() => {
    interviewStartTimeRef.current = Date.now();

    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Gemini API Key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.");
      setIsConnecting(false);
      return;
    }

    streamerRef.current = new AudioStreamer();
    
    recorderRef.current = new AudioRecorder((base64) => {
      if (isRecordingRef.current && clientRef.current) {
        clientRef.current.sendAudio(base64);
      }
    });

    clientRef.current = new GeminiLiveClient(
      apiKey,
      (msg) => {
        const setupComplete = msg.setup_complete || msg.setupComplete;
        if (setupComplete) {
          setIsConnecting(false);
          setStatus('listening');
          streamerRef.current?.start();
          recorderRef.current?.start().catch(err => {
            console.error('[InterviewScreen] Failed to start recorder:', err);
            setError('Failed to access microphone. Please check permissions.');
          });
        }

        const serverContent = msg.server_content || msg.serverContent;
        if (serverContent) {
          const modelTurn = serverContent.model_turn || serverContent.modelTurn;
          if (modelTurn?.parts) {
            modelTurn.parts.forEach((part: any) => {
              const inlineData = part.inline_data || part.inlineData;
              if (inlineData) {
                streamerRef.current?.addChunk(inlineData.data);
                setStatus('talking');
              }
            });
          }

          if (serverContent.turn_complete || serverContent.turnComplete) {
            setStatus('listening');
          }
        }
      },
      (err) => {
        setError("A connection error occurred. Please try again.");
        setIsConnecting(false);
      },
      (entry: TranscriptEntry) => {
        const timestampOffset = Date.now() - interviewStartTimeRef.current;
        const newEntry: TranscriptEntry = {
          speaker: entry.speaker,
          text: entry.text,
          timestamp: timestampOffset
        };
        
        if (entry.speaker === 'interviewer') {
          setCurrentQuestion(entry.text);
        }
        
        setTranscript(prev => [...prev, newEntry]);
      }
    );

    const systemInstruction = buildSystemInstruction({
      resume,
      jobDescription,
      agentId: selectedAgent
    });

    clientRef.current.connect(systemInstruction);

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          setTimeout(() => handleFinish(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(countdown);
      clientRef.current?.disconnect();
      recorderRef.current?.stop();
      streamerRef.current?.stop();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [resume, jobDescription, selectedAgent]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 md:p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-heading font-bold mb-3">Something went wrong</h2>
        <p className="text-muted-foreground mb-8 max-w-md">{error}</p>
        <Button size="lg" onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Top Bar */}
      <header className="px-6 lg:px-12 xl:px-16 py-5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3 bg-surface-container-low px-5 py-2.5 rounded-full">
          <Timer className="w-5 h-5 text-secondary" />
          <span className="font-mono text-xl font-medium">{formatTime(timeLeft)}</span>
        </div>
        <StatusBadge status={status} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 lg:px-12 xl:px-16 py-6 overflow-hidden">
        {/* Job Title */}
        <div className="text-center mb-6 lg:mb-8">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">
            Live Session in Progress
          </p>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-foreground">
            Interview Session
          </h1>
        </div>

        {/* Main Layout - Camera, Visualizer, Mic Gauge */}
        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
          {/* Camera Preview - Left side on desktop */}
          <div className="order-2 lg:order-1 flex flex-col items-center gap-5">
            <CameraPreview isCameraOn={isCameraOn} onToggle={() => setIsCameraOn(!isCameraOn)} />
            {/* Mic Gauge below camera on mobile/tablet */}
            <div className="lg:hidden">
              <MicrophoneGauge level={micLevel} isActive={isRecording} />
            </div>
          </div>

          {/* Voice Interaction Visualizer - Center */}
          <div className="glass-panel flex-1 max-w-2xl w-full aspect-video rounded-3xl flex flex-col items-center justify-center p-8 md:p-10 lg:p-12 relative overflow-hidden order-1 lg:order-2">
            {/* Background Gradient */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,var(--primary)_0%,transparent_70%)]" />
            
            <div className="z-10 flex flex-col items-center gap-6 w-full">
              {/* Status Indicator */}
              <StatusBadge status={status} />

              {/* Aura Visualizer */}
              <AgentAudioVisualizerAura
                size="xl"
                state={
                  status === 'talking' ? 'speaking' :
                  status === 'connecting' ? 'connecting' :
                  status === 'finished' ? 'idle' : 'listening'
                }
                color="#1FD5F9"
                colorShift={0.05}
                themeMode="dark"
              />

              {/* Current Question */}
              {currentQuestion && (
                <p className="font-heading text-base md:text-lg lg:text-xl text-secondary text-center max-w-lg italic px-4 line-clamp-2">
                  "{currentQuestion}"
                </p>
              )}
            </div>
          </div>

          {/* Mic Gauge - Right side on desktop */}
          <div className="hidden lg:flex flex-col items-center gap-5 order-3">
            <MicrophoneGauge level={micLevel} isActive={isRecording} />
          </div>
        </div>

        {/* Transcript Toggle */}
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className="mt-6 flex items-center gap-2 text-base text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
        </button>

        {/* Transcript Panel */}
        <AnimatePresence>
          {showTranscript && transcript.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-3xl mt-4 bg-surface-container-low rounded-2xl p-6 max-h-48 overflow-y-auto"
            >
              {transcript.map((entry, index) => (
                <div
                  key={index}
                  className={`mb-3 ${entry.speaker === 'candidate' ? 'text-right' : 'text-left'}`}
                >
                  <span className={`
                    inline-block px-4 py-2 rounded-xl text-sm max-w-[80%]
                    ${entry.speaker === 'candidate'
                      ? 'bg-primary-fixed text-primary'
                      : 'bg-surface-container text-foreground'
                    }
                  `}>
                    <span className="font-semibold text-[10px] uppercase tracking-wider opacity-70 block mb-0.5">
                      {entry.speaker === 'candidate' ? 'You' : 'AI'}
                    </span>
                    {entry.text}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Controls */}
      <footer className="px-6 lg:px-12 xl:px-16 py-5 flex justify-center items-center gap-4 md:gap-6 shrink-0 bg-surface-container-lowest/90 backdrop-blur-xl">
        {/* Mute Toggle */}
        <button
          onClick={() => setIsRecording(!isRecording)}
          disabled={isConnecting}
          className={`
            flex flex-col items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all
            ${isRecording
              ? 'text-primary'
              : 'text-muted-foreground bg-surface-container'
            }
          `}
        >
          <div className={`
            w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
            ${isRecording ? 'bg-primary-fixed' : 'bg-surface-container-high'}
          `}>
            {isRecording ? <Mic className="w-6 h-6 md:w-7 md:h-7" /> : <MicOff className="w-6 h-6 md:w-7 md:h-7" />}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest">
            {isRecording ? 'Mute' : 'Unmute'}
          </span>
        </button>

        {/* End Interview */}
        <button
          onClick={handleFinish}
          disabled={isConnecting}
          className="flex flex-col items-center justify-center gap-2 bg-destructive text-destructive-foreground rounded-xl px-8 py-2 shadow-lg shadow-destructive/20 transition-all hover:shadow-xl"
        >
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-destructive-foreground/20 flex items-center justify-center">
            <PhoneOff className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest">
            End
          </span>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={() => setIsCameraOn(!isCameraOn)}
          className={`
            flex flex-col items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all
            ${isCameraOn
              ? 'text-primary'
              : 'text-muted-foreground bg-surface-container'
            }
          `}
        >
          <div className={`
            w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
            ${isCameraOn ? 'bg-primary-fixed' : 'bg-surface-container-high'}
          `}>
            {isCameraOn ? <Video className="w-6 h-6 md:w-7 md:h-7" /> : <VideoOff className="w-6 h-6 md:w-7 md:h-7" />}
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest">
            {isCameraOn ? 'Camera' : 'No Cam'}
          </span>
        </button>

        {/* Transcript Toggle */}
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className={`
            hidden md:flex flex-col items-center justify-center gap-2 px-4 py-2 rounded-xl transition-all
            ${showTranscript
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
            }
          `}
        >
          <div className={`
            w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
            ${showTranscript ? 'bg-primary-container' : 'bg-surface-container'}
          `}>
            <MessageSquare className="w-6 h-6 md:w-7 md:h-7" />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest">
            Chat
          </span>
        </button>
      </footer>
    </div>
  );
}