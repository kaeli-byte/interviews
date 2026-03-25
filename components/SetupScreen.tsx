'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Play, RotateCcw, Upload, FileText, Loader2, Brain, Sparkles, Briefcase, Zap, Heart, Target, BookOpen, Clock, BarChart, ArrowRight } from 'lucide-react';
import { isEmptyOrNonsense } from '@/lib/documentParser';
import { AGENT_SELECTIONS, AGENT_DEFINITIONS, type AgentId, type AgentDefinition } from '@/lib/agents';
import {
  LiquidGlassCard,
  LiquidGlassActionButton,
} from '@/components/ui/liquid-glass';

interface SetupScreenProps {
  onStart: (duration: number) => void;
  lastReport: any;
  onViewLastReport: () => void;
  resume: string;
  jobDescription: string;
  selectedAgent: AgentId;
  onResumeChange: (text: string) => void;
  onJobDescriptionChange: (text: string) => void;
  onAgentChange: (agentId: AgentId) => void;
  onFileParsed: (type: 'resume' | 'jd', text: string) => void;
}

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Zap,
  Heart,
  Target,
  BookOpen,
  Clock,
  BarChart,
};

function AgentCard({
  agent,
  isSelected,
  onSelect
}: {
  agent: AgentDefinition;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = AGENT_ICONS[agent.icon] || Briefcase;

  return (
    <LiquidGlassCard
      className={`
        cursor-pointer transition-all text-left w-full
        ${isSelected ? 'ring-2 ring-primary/50' : 'hover:bg-white/10'}
      `}
      onClick={onSelect}
      data-testid={`agent-card-${agent.id}`}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 w-full">
          <div className={`
            w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors
            ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-white/10 text-white'}
          `}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold truncate ${isSelected ? 'text-white' : 'text-white/90'}`}>
              {agent.label}
            </p>
          </div>
        </div>
        <p className="text-xs text-white/60 line-clamp-2 mt-2">
          {agent.description}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
            {agent.interviewType}
          </span>
        </div>
      </div>
    </LiquidGlassCard>
  );
}

function FileDropzone({
  onFileParsed,
  documentType,
}: {
  onFileParsed: (text: string) => void;
  documentType: 'resume' | 'jd';
}) {
  const [isParsing, setIsParsing] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);
  const [isEmptyText, setIsEmptyText] = React.useState(false);

  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsParsing(true);
    setParseError(null);
    setIsEmptyText(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/parse-document', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (data.isEmpty) {
          setIsEmptyText(true);
        } else {
          onFileParsed(data.text);
        }
      } else {
        setParseError(data.error || 'Failed to parse document');
      }
    } catch (err) {
      setParseError('Network error - please try again');
    } finally {
      setIsParsing(false);
    }
  }, [onFileParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <div className="space-y-2">
      <div
        className={`
          relative rounded-xl border p-4
          bg-white/10 backdrop-blur-xl backdrop-saturate-150
          ${isDragActive ? 'border-primary/50 bg-white/15' : 'border-white/20 hover:border-white/40'}
          cursor-pointer transition-all border-dashed border-2
        `}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        <div className="relative z-10">
          {isParsing ? (
            <div className="flex items-center justify-center gap-2 text-sm text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <p>Parsing document...</p>
            </div>
          ) : isDragActive ? (
            <div className="flex items-center justify-center gap-2 text-sm text-white">
              <Upload className="w-4 h-4" />
              <p className="font-medium">Drop the file here...</p>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-white/60">
              <Upload className="w-4 h-4" />
              <p>Drag & drop PDF or Word file, or click to select</p>
            </div>
          )}
        </div>
      </div>
      {parseError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}
      {isEmptyText && (
        <Alert variant="destructive">
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            The uploaded document appears to be empty or image-only. Please paste the text manually or upload a different file.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default function SetupScreen({
  onStart,
  lastReport,
  onViewLastReport,
  resume,
  jobDescription,
  selectedAgent,
  onResumeChange,
  onJobDescriptionChange,
  onAgentChange,
  onFileParsed,
}: SetupScreenProps) {
  const [duration, setDuration] = React.useState(10);
  const [resumeEmptyText, setResumeEmptyText] = React.useState(false);
  const [jdEmptyText, setJdEmptyText] = React.useState(false);

  const handleResumeFileParsed = React.useCallback((text: string) => {
    onResumeChange(text);
    setResumeEmptyText(isEmptyOrNonsense(text));
  }, [onResumeChange]);

  const handleJdFileParsed = React.useCallback((text: string) => {
    onJobDescriptionChange(text);
    setJdEmptyText(isEmptyOrNonsense(text));
  }, [onJobDescriptionChange]);

  const canStart = resume.trim().length > 0 && jobDescription.trim().length > 0;

  const selectedAgentDef = AGENT_DEFINITIONS[selectedAgent];
  const showDurationPicker = selectedAgentDef.type === 'simulation';

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Hero Header */}
      <header className="px-6 lg:px-12 xl:px-16 pt-8 pb-6 text-center shrink-0">
        <LiquidGlassCard className="inline-flex flex-col items-center justify-center mb-4 p-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
        </LiquidGlassCard>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-white drop-shadow-lg">
          Cognitive Canvas
        </h1>
        <p className="text-base md:text-lg text-white/70 mt-2">
          Your AI-powered interview coach
        </p>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 lg:px-12 xl:px-16 py-6 max-w-6xl mx-auto space-y-8">
          {/* Duration Slider - Only for simulation agents */}
          {showDurationPicker ? (
            <LiquidGlassCard className="p-6">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-white/60">
                    Session Duration
                  </Label>
                  <span className="text-primary font-heading font-bold text-2xl">{duration} min</span>
                </div>
                <Slider
                  id="duration"
                  min={selectedAgentDef.duration.min}
                  max={selectedAgentDef.duration.max}
                  step={1}
                  value={[duration]}
                  onValueChange={(vals) => {
                    const val = Array.isArray(vals) ? vals[0] : vals;
                    setDuration(val);
                  }}
                  className="cursor-pointer"
                />
                <p className="text-xs text-white/50 mt-2">
                  Recommended: {selectedAgentDef.duration.min}-{selectedAgentDef.duration.max} minutes
                </p>
              </div>
            </LiquidGlassCard>
          ) : (
            <LiquidGlassCard className="p-6">
              <div className="relative z-10">
                <p className="text-sm text-white/60">
                  This agent runs until the question list is complete. No duration selection needed.
                </p>
              </div>
            </LiquidGlassCard>
          )}

          {/* Document Upload Grid - Two columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Section */}
            <LiquidGlassCard className="p-6">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <Label className="text-base font-semibold text-white">Resume</Label>
                  </div>
                  {resume.trim() && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Parsed
                    </span>
                  )}
                </div>
                <Textarea
                  value={resume}
                  onChange={(e) => {
                    onResumeChange(e.target.value);
                    setResumeEmptyText(false);
                  }}
                  placeholder="Paste your resume text here..."
                  className="min-h-[180px] lg:min-h-[220px] resize-y bg-black/20 border-white/20 focus-visible:ring-primary/50 text-white placeholder:text-white/40 text-base"
                />
                <div className="mt-4">
                  <FileDropzone
                    onFileParsed={handleResumeFileParsed}
                    documentType="resume"
                  />
                </div>
                {resumeEmptyText && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      The uploaded document appears to be empty. Please paste text manually.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </LiquidGlassCard>

            {/* Job Description Section */}
            <LiquidGlassCard className="p-6">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <Label className="text-base font-semibold text-white">Job Description</Label>
                  </div>
                  {jobDescription.trim() && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      Added
                    </span>
                  )}
                </div>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => {
                    onJobDescriptionChange(e.target.value);
                    setJdEmptyText(false);
                  }}
                  placeholder="Paste the job description here..."
                  className="min-h-[180px] lg:min-h-[220px] resize-y bg-black/20 border-white/20 focus-visible:ring-primary/50 text-white placeholder:text-white/40 text-base"
                />
                <div className="mt-4">
                  <FileDropzone
                    onFileParsed={handleJdFileParsed}
                    documentType="jd"
                  />
                </div>
                {jdEmptyText && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>
                      The uploaded document appears to be empty. Please paste text manually.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </LiquidGlassCard>
          </div>

          {/* Interview Agent Selector */}
          <LiquidGlassCard className="p-6">
            <div className="relative z-10">
              <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4 block">
                Interview Agent
              </Label>

              {/* Full Simulations Group */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-white/80 mb-3">Full Simulations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {AGENT_SELECTIONS.simulation.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgent === agent.id}
                      onSelect={() => onAgentChange(agent.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Targeted Prep Group */}
              <div>
                <h3 className="text-sm font-semibold text-white/80 mb-3">Targeted Prep</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {AGENT_SELECTIONS.targeted.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      isSelected={selectedAgent === agent.id}
                      onSelect={() => onAgentChange(agent.id)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 p-4 bg-white/5 border border-white/20 rounded-xl">
                <div className="relative z-10 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-white/70 leading-relaxed">
                    Selecting an agent determines the interview style, tone, and feedback approach.
                  </p>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* How it works */}
          <LiquidGlassCard className="p-6">
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-3">
                How it works
              </h4>
              <p className="text-base text-white/70 leading-relaxed">
                Talk to the AI for {duration} minutes about your career. It will ask questions to help you refine your professional value and prepare for interviews.
              </p>
            </div>
          </LiquidGlassCard>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="px-6 lg:px-12 xl:px-16 py-6 space-y-4 shrink-0">
        <LiquidGlassCard className="max-w-6xl mx-auto p-6">
          <div className="relative z-10 space-y-4">
            <LiquidGlassActionButton
              variant="primary"
              size="lg"
              className="w-full h-16 text-lg font-bold rounded-xl"
              onClick={() => onStart(duration)}
              disabled={!canStart}
            >
              <Play className="w-6 h-6 mr-3" />
              Start Interview
              <ArrowRight className="w-5 h-5 ml-2" />
            </LiquidGlassActionButton>
            {lastReport && (
              <LiquidGlassActionButton
                variant="ghost"
                size="md"
                className="w-full h-12 text-white/60 font-medium hover:text-white"
                onClick={onViewLastReport}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                View Last Debrief
              </LiquidGlassActionButton>
            )}
          </div>
        </LiquidGlassCard>
      </footer>
    </div>
  );
}