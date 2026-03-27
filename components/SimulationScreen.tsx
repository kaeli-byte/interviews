'use client';

import * as React from 'react';
import { MessageSquare, Square, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { TranscriptEntry, DebriefReport, AgentId, SimulationSpeed, SimulationMessage, CandidatePersona } from '@/lib/types';
import { generateDebrief } from '@/lib/debriefGenerator';
import { AGENT_DEFINITIONS } from '@/lib/agents';
import {
  LiquidGlassCard,
  LiquidGlassActionButton,
} from '@/components/ui/liquid-glass';

interface SimulationScreenProps {
  candidatePersona: CandidatePersona;
  selectedAgent: AgentId;
  resume: string;
  jobDescription: string;
  onFinish: (transcript: TranscriptEntry[], report: DebriefReport | null) => void;
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

export default function SimulationScreen({
  candidatePersona,
  selectedAgent,
  resume,
  jobDescription,
  onFinish
}: SimulationScreenProps) {
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
  }, [candidatePersona, selectedAgent, resume, jobDescription, speed]);

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