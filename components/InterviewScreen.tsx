import * as React from 'react';
import { Mic, MicOff, PhoneOff, Timer, AlertCircle, MessageSquare, Video, VideoOff, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { GeminiLiveClient } from '@/lib/geminiLiveClient';
import { AudioRecorder } from '@/lib/audioRecorder';
import { AudioStreamer } from '@/lib/audioStreamer';
import { buildSystemInstruction } from '@/lib/promptBuilder';
import { TranscriptEntry, TranscriptUpdate, DebriefReport, AgentId, CandidatePersona, SimulationSpeed, SimulationMessage } from '@/lib/types';
import { generateDebrief } from '@/lib/debriefGenerator';
import { AGENT_DEFINITIONS } from '@/lib/agents';
import { AgentAudioVisualizerAura } from '@/components/agent-audio-visualizer-aura';
import {
  LiquidGlassCard,
  LiquidGlassActionButton,
  LiveTranscriptPanel,
} from '@/components/ui/liquid-glass';

interface InterviewScreenProps {
  duration: number;
  onFinish: (transcript: TranscriptEntry[], report: DebriefReport | null) => void;
  resume: string;
  jobDescription: string;
  selectedAgent: AgentId;
  // Simulation mode props (per D-02)
  simulationMode?: boolean;
  candidatePersona?: CandidatePersona;
}

/**
 * Microphone Level Gauge Component
 */
function MicrophoneGauge({ level, isActive }: { level: number; isActive: boolean }) {
  const bars = 12;
  const activeBars = isActive ? Math.floor((level / 100) * bars) : 0;

  return (
    <LiquidGlassCard className="p-4">
      <div className="relative z-10 flex flex-col items-center gap-2">
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
    </LiquidGlassCard>
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
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  React.useEffect(() => {
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
      <LiquidGlassCard className="w-48 h-36 md:w-56 md:h-42 lg:w-64 lg:h-48 overflow-hidden">
        <div className="relative z-10 w-full h-full">
          {isCameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1] rounded-xl"
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
      </LiquidGlassCard>
      <LiquidGlassActionButton
        variant={isCameraOn ? 'primary' : 'ghost'}
        size="sm"
        onClick={onToggle}
        className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full"
      >
        {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </LiquidGlassActionButton>
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
    <LiquidGlassCard className="inline-flex items-center gap-2 px-5 py-2.5">
      <div className="relative z-10 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${config.color} ${status === 'listening' ? 'animate-pulse' : ''}`} />
        <span className={`text-sm font-semibold uppercase tracking-wider ${config.textColor}`}>
          {config.label}
        </span>
      </div>
    </LiquidGlassCard>
  );
}

/**
 * Speed Control Component for Simulation
 * Per D-08: Speed options 1x, 1.5x, 2x
 */
function SpeedControl({
  speed,
  onSpeedChange,
  disabled
}: {
  speed: SimulationSpeed;
  onSpeedChange: (speed: SimulationSpeed) => void;
  disabled?: boolean;
}) {
  const speeds: SimulationSpeed[] = ['1x', '1.5x', '2x'];

  return (
    <LiquidGlassCard className="inline-flex items-center gap-1 px-3 py-2">
      <div className="relative z-10 flex items-center gap-1">
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            disabled={disabled}
            className={`px-2.5 py-1 rounded-lg text-sm font-semibold transition-all ${
              speed === s
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-container-high'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {s}
          </button>
        ))}
      </div>
    </LiquidGlassCard>
  );
}

/**
 * Simulation Chat Display Component
 * Per D-04: Display messages as generated
 */
function SimulationChatDisplay({
  messages,
  isRunning
}: {
  messages: SimulationMessage[];
  isRunning: boolean;
}) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Waiting for simulation to start...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg) => (
        <motion.div
          key={msg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex ${msg.speaker === 'interviewer' ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.speaker === 'interviewer'
                ? 'bg-surface-container-high text-foreground rounded-tl-sm'
                : 'bg-primary text-primary-foreground rounded-tr-sm'
            }`}
          >
            <div className="text-xs font-medium opacity-70 mb-1">
              {msg.speaker === 'interviewer' ? 'Interviewer' : 'Candidate'}
            </div>
            <p className="text-sm leading-relaxed">{msg.text}</p>
          </div>
        </motion.div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}

/**
 * Simulation Mode Component
 * Per D-02: Uses existing InterviewScreen, but different UI for simulation
 */
function SimulationModeComponent({
  candidatePersona,
  selectedAgent,
  resume,
  jobDescription,
  onFinish
}: {
  candidatePersona: CandidatePersona;
  selectedAgent: AgentId;
  resume: string;
  jobDescription: string;
  onFinish: (transcript: TranscriptEntry[], report: DebriefReport | null) => void;
}) {
  const [speed, setSpeed] = React.useState<SimulationSpeed>('1x'); // Per D-06
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<SimulationMessage[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [isComplete, setIsComplete] = React.useState(false);
  const [completedTranscript, setCompletedTranscript] = React.useState<TranscriptEntry[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const agent = AGENT_DEFINITIONS[selectedAgent];

  // Start simulation
  const startSimulation = React.useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setMessages([]);

    try {
      const response = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            candidatePersona,
            interviewerAgentId: selectedAgent,
            resume,
            jobDescription,
            speed,
            maxQuestions: 5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start simulation');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              switch (data.type) {
                case 'session':
                  setSessionId(data.sessionId);
                  break;
                case 'message':
                  setMessages(prev => {
                    // Avoid duplicates
                    if (prev.some(m => m.id === data.message.id)) return prev;
                    return [...prev, data.message];
                  });
                  break;
                case 'complete':
                  setIsComplete(true);
                  setIsRunning(false);
                  // Store transcript for user to review before proceeding
                  setCompletedTranscript(data.transcript);
                  break;
                case 'error':
                  setError(data.error);
                  setIsRunning(false);
                  break;
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e);
            }
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Simulation failed');
      setIsRunning(false);
    }
  }, [candidatePersona, selectedAgent, resume, jobDescription, speed, onFinish]);

  // Stop simulation
  const stopSimulation = React.useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch(`/api/simulation?action=stop&sessionId=${sessionId}`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setIsRunning(false);
        setIsComplete(true);
        // Store partial transcript for user to review
        setCompletedTranscript(data.transcript);
      }
    } catch (e) {
      console.error('Failed to stop simulation:', e);
    }
  }, [sessionId]);

  // Proceed to debrief after reviewing simulation
  const handleViewDebrief = React.useCallback(async () => {
    if (!completedTranscript) return;

    const report = await generateDebrief(completedTranscript);
    onFinish(completedTranscript, report);
  }, [completedTranscript, onFinish]);

  // Auto-start simulation on mount
  React.useEffect(() => {
    startSimulation();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Top Bar */}
      <header className="px-6 lg:px-12 xl:px-16 py-5 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <LiquidGlassCard className="flex items-center gap-3 px-5 py-2.5">
            <div className="relative z-10 flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest text-secondary">Observer Mode</span>
            </div>
          </LiquidGlassCard>
          <SpeedControl speed={speed} onSpeedChange={setSpeed} disabled={isRunning} />
        </div>
        <LiquidGlassCard className="flex items-center gap-3 px-5 py-2.5">
          <div className="relative z-10 flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">
              {agent.label}
            </span>
            <span className="text-xs text-muted-foreground">
              Q: {messages.filter(m => m.speaker === 'interviewer').length}/5
            </span>
          </div>
        </LiquidGlassCard>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col px-6 lg:px-12 xl:px-16 py-6 overflow-hidden">
        <LiquidGlassCard className="flex-1 flex flex-col overflow-hidden">
          <SimulationChatDisplay messages={messages} isRunning={isRunning} />
        </LiquidGlassCard>
      </main>

      {/* Bottom Controls */}
      <footer className="px-6 lg:px-12 xl:px-16 py-5 shrink-0">
        <LiquidGlassCard className="flex justify-center items-center gap-4 p-4">
          <div className="relative z-10 flex justify-center items-center gap-4">
            {isRunning && (
              <LiquidGlassActionButton
                variant="danger"
                size="lg"
                onClick={stopSimulation}
                className="flex flex-col items-center gap-1 h-auto py-3 px-6"
              >
                <Square className="w-7 h-7" />
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  Stop
                </span>
              </LiquidGlassActionButton>
            )}
            {isComplete && (
              <LiquidGlassActionButton
                variant="primary"
                size="lg"
                onClick={handleViewDebrief}
                className="flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                <span>View Debrief</span>
              </LiquidGlassActionButton>
            )}
            {error && (
              <div className="text-center">
                <p className="text-sm font-semibold text-destructive">Error: {error}</p>
                <Button onClick={startSimulation} size="sm" className="mt-2">
                  Retry
                </Button>
              </div>
            )}
          </div>
        </LiquidGlassCard>
      </footer>
    </div>
  );
}

export default function InterviewScreen({
  duration,
  onFinish,
  resume,
  jobDescription,
  selectedAgent,
  simulationMode = false,
  candidatePersona,
}: InterviewScreenProps) {
  // Per D-02: Use existing InterviewScreen, but render simulation UI when in simulation mode
  if (simulationMode && candidatePersona) {
    return (
      <SimulationModeComponent
        candidatePersona={candidatePersona}
        selectedAgent={selectedAgent}
        resume={resume}
        jobDescription={jobDescription}
        onFinish={onFinish}
      />
    );
  }

  const [timeLeft, setTimeLeft] = React.useState(duration * 60);
  const [isRecording, setIsRecording] = React.useState(true);
  const [isConnecting, setIsConnecting] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<'connecting' | 'talking' | 'listening' | 'finished'>('connecting');
  const [transcript, setTranscript] = React.useState<TranscriptEntry[]>([]);
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [currentQuestion, setCurrentQuestion] = React.useState<string | null>(null);
  const [micLevel, setMicLevel] = React.useState(0);
  const [isCameraOn, setIsCameraOn] = React.useState(true);
  const [audioAnalyser, setAudioAnalyser] = React.useState<AnalyserNode | null>(null);

  const clientRef = React.useRef<GeminiLiveClient | null>(null);
  const recorderRef = React.useRef<AudioRecorder | null>(null);
  const streamerRef = React.useRef<AudioStreamer | null>(null);
  const transcriptRef = React.useRef<TranscriptEntry[]>([]);
  const interviewStartTimeRef = React.useRef<number>(0);
  const isRecordingRef = React.useRef(isRecording);
  const animationFrameRef = React.useRef<number | null>(null);

  // Sync refs with state
  React.useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  React.useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Microphone level monitoring
  React.useEffect(() => {
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

  const handleFinish = React.useCallback(async () => {
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

  React.useEffect(() => {
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
          recorderRef.current?.start().then(() => {
            // Capture the analyser for audio-reactive visualizer
            const analyser = recorderRef.current?.getAnalyser();
            if (analyser) {
              setAudioAnalyser(analyser);
            }
          }).catch(err => {
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
      (entry: TranscriptUpdate) => {
        const timestampOffset = Date.now() - interviewStartTimeRef.current;
        const newEntry: TranscriptEntry = {
          speaker: entry.speaker,
          text: entry.text,
          timestamp: timestampOffset
        };

        if (entry.speaker === 'interviewer') {
          setCurrentQuestion(entry.text);
        }

        // Handle partial vs complete transcription updates
        // Partial: update the last entry for same speaker (streaming in progress)
        // Complete: update last entry if same speaker (already exists from partial), else append
        if (entry.isPartial) {
          setTranscript(prev => {
            const lastIndex = prev.length - 1;
            // If last entry is same speaker, update it
            if (lastIndex >= 0 && prev[lastIndex].speaker === entry.speaker) {
              const updated = [...prev];
              updated[lastIndex] = { ...updated[lastIndex], text: entry.text };
              return updated;
            }
            // Otherwise append new entry for this partial
            return [...prev, newEntry];
          });
        } else {
          // Complete turn - update last entry if same speaker, else append
          setTranscript(prev => {
            const lastIndex = prev.length - 1;
            if (lastIndex >= 0 && prev[lastIndex].speaker === entry.speaker) {
              // Already have partial entry, just update text (should be same)
              const updated = [...prev];
              updated[lastIndex] = { ...updated[lastIndex], text: entry.text };
              return updated;
            }
            // No partial entry exists, append new
            return [...prev, newEntry];
          });
        }
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
        <LiquidGlassCard className="flex items-center gap-3 px-5 py-2.5">
          <div className="relative z-10 flex items-center gap-3">
            <Timer className="w-5 h-5 text-secondary" />
            <span className="font-mono text-xl font-medium">{formatTime(timeLeft)}</span>
          </div>
        </LiquidGlassCard>
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
          <LiquidGlassCard className="flex-1 max-w-2xl w-full aspect-video flex flex-col items-center justify-center relative overflow-hidden p-8">
            {/* Background Gradient */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,var(--primary)_0%,transparent_70%)]" />

            <div className="relative z-10 flex flex-col items-center gap-6 w-full">
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
                analyser={audioAnalyser}
              />

              {/* Current Question */}
              {currentQuestion && (
                <p className="font-heading text-base md:text-lg lg:text-xl text-secondary text-center max-w-lg italic px-4 line-clamp-2">
                  "{currentQuestion}"
                </p>
              )}
            </div>
          </LiquidGlassCard>

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

        {/* Live Transcript Panel */}
        <AnimatePresence>
          {showTranscript && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md mt-4"
            >
              <LiveTranscriptPanel
                transcript={transcript}
                isRecording={isRecording}
                status={status}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Controls */}
      <footer className="px-6 lg:px-12 xl:px-16 py-5 shrink-0">
        <LiquidGlassCard className="flex justify-center items-center gap-3 md:gap-4 p-4">
          <div className="relative z-10 flex justify-center items-center gap-3 md:gap-4">
            {/* Mute Toggle */}
            <LiquidGlassActionButton
              variant={isRecording ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setIsRecording(!isRecording)}
              disabled={isConnecting}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                {isRecording ? 'Mute' : 'Unmute'}
              </span>
            </LiquidGlassActionButton>

            {/* End Interview */}
            <LiquidGlassActionButton
              variant="danger"
              size="lg"
              onClick={handleFinish}
              disabled={isConnecting}
              className="flex flex-col items-center gap-1 h-auto py-3 px-6"
            >
              <PhoneOff className="w-7 h-7" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                End
              </span>
            </LiquidGlassActionButton>

            {/* Camera Toggle */}
            <LiquidGlassActionButton
              variant={isCameraOn ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setIsCameraOn(!isCameraOn)}
              className="flex flex-col items-center gap-1 h-auto py-2"
            >
              {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                {isCameraOn ? 'Camera' : 'No Cam'}
              </span>
            </LiquidGlassActionButton>

            {/* Transcript Toggle */}
            <LiquidGlassActionButton
              variant={showTranscript ? 'primary' : 'ghost'}
              size="md"
              onClick={() => setShowTranscript(!showTranscript)}
              className="hidden md:flex flex-col items-center gap-1 h-auto py-2"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                Chat
              </span>
            </LiquidGlassActionButton>
          </div>
        </LiquidGlassCard>
      </footer>
    </div>
  );
}