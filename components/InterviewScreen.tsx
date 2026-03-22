'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Timer, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GeminiLiveClient } from '@/lib/geminiLiveClient';
import { AudioRecorder } from '@/lib/audioRecorder';
import { AudioStreamer } from '@/lib/audioStreamer';
import { buildSystemInstruction } from '@/lib/promptBuilder';

interface InterviewScreenProps {
  duration: number;
  onFinish: (transcript: string[], report: any) => void;
  resume: string;
  jobDescription: string;
  personality: string;
}

export default function InterviewScreen({
  duration,
  onFinish,
  resume,
  jobDescription,
  personality
}: InterviewScreenProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRecording, setIsRecording] = useState(true);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'connecting' | 'talking' | 'listening' | 'finished'>('connecting');

  const clientRef = useRef<GeminiLiveClient | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const streamerRef = useRef<AudioStreamer | null>(null);
  const transcriptRef = useRef<string[]>([]);
  const isRecordingRef = useRef(isRecording);

  // Sync ref with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const handleFinish = useCallback(async () => {
    setStatus('finished');
    clientRef.current?.disconnect();
    recorderRef.current?.stop();
    streamerRef.current?.stop();

    // Use standard Gemini API for report generation (Step 5)
    // For now, pass the transcript to the next step
    onFinish(transcriptRef.current, null);
  }, [onFinish]);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      setError("Gemini API Key is missing. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file.");
      setIsConnecting(false);
      return;
    }

    // Initialize tools
    streamerRef.current = new AudioStreamer();
    recorderRef.current = new AudioRecorder((base64) => {
      if (isRecordingRef.current && clientRef.current) {
        clientRef.current.sendAudio(base64);
      }
    });

    clientRef.current = new GeminiLiveClient(
      apiKey,
      (msg) => {
        // Handle incoming messages
        const setupComplete = msg.setup_complete || msg.setupComplete;
        if (setupComplete) {
          setIsConnecting(false);
          setStatus('listening');
          streamerRef.current?.start();
          recorderRef.current?.start();
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
              if (part.text) {
                transcriptRef.current.push(`AI: ${part.text}`);
              }
            });
          }

          if (serverContent.turn_complete || serverContent.turnComplete) {
            setStatus('listening');
          }

          const inputTranscription = serverContent.input_transcription || serverContent.inputTranscription;
          if (inputTranscription) {
            transcriptRef.current.push(`User: ${inputTranscription.text}`);
          }
        }
      },
      (err) => {
        setError("A connection error occurred. Please try again.");
        setIsConnecting(false);
      }
    );

    // Build dynamic system instruction from context
    const systemInstruction = buildSystemInstruction({
      resume,
      jobDescription,
      personality: personality as 'warm' | 'professional' | 'direct' | 'coaching'
    });

    clientRef.current.connect(systemInstruction);

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          // Defer handleFinish to avoid updating parent state during render
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
    };
  }, [resume, jobDescription, personality]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <Card className="border-none shadow-none h-full flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <CardTitle className="text-xl font-bold mb-2">Something went wrong</CardTitle>
        <CardDescription className="mb-6">{error}</CardDescription>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-none h-full flex flex-col justify-between p-6">
      <CardHeader className="text-center">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-slate-600 font-mono text-sm">
            <Timer className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider">
            <span className={`w-2 h-2 rounded-full ${isConnecting ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
            {isConnecting ? 'Connecting AI' : 'Live'}
          </div>
        </div>
        <CardTitle className="text-xl font-bold">Interviewing MyCareer AI</CardTitle>
        <CardDescription>
          {status === 'listening' ? 'AI is listening to you...' :
            status === 'talking' ? 'AI is speaking...' :
              isConnecting ? 'Preparing your session...' : 'Session complete'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <AnimatePresence>
            {!isConnecting && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: status === 'talking' || status === 'listening' ? [1, 1.2, 1] : 1,
                  opacity: status === 'talking' || status === 'listening' ? [0.3, 0.6, 0.3] : 0.1
                }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20"
              />
            )}
          </AnimatePresence>

          <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-2xl z-10 relative ${isRecording ? 'bg-white border-4 border-blue-600' : 'bg-slate-200'
            }`}>
            {isRecording ? (
              <Mic className="w-12 h-12 text-blue-600" />
            ) : (
              <MicOff className="w-12 h-12 text-slate-400" />
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <div className="flex justify-center gap-6 w-full">
          <Button
            variant="outline"
            size="icon"
            className={`w-14 h-14 rounded-full border-2 ${isRecording ? 'text-blue-600 border-blue-100 hover:bg-blue-50' : 'text-slate-400 bg-slate-100 border-transparent hover:bg-slate-200'}`}
            onClick={() => setIsRecording(!isRecording)}
            disabled={isConnecting}
          >
            {isRecording ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          <Button
            variant="destructive"
            size="icon"
            className="w-14 h-14 rounded-full shadow-lg"
            onClick={handleFinish}
            disabled={isConnecting}
          >
            <Square className="w-6 h-6 fill-current" />
          </Button>
        </div>

        <p className="text-center text-xs text-slate-400 font-medium">
          {isConnecting ? 'Please wait while we establish the connection' : 'Keep talking! AI will guide the conversation.'}
        </p>
      </CardFooter>
    </Card>
  );
}
