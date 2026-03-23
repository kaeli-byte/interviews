'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Play, RotateCcw, Upload, FileText, Loader2, Brain, Sparkles, Briefcase, Zap, Heart, Target, BookOpen, Clock, BarChart, ArrowRight } from 'lucide-react';
import { isEmptyOrNonsense } from '@/lib/documentParser';
import { AGENT_SELECTIONS, AGENT_DEFINITIONS, type AgentId, type AgentDefinition } from '@/lib/agents';

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
    <button
      onClick={onSelect}
      className={`
        p-4 rounded-xl flex flex-col items-start gap-2 transition-all text-left w-full
        ${isSelected
          ? 'bg-primary-fixed ring-2 ring-primary'
          : 'bg-surface-container-lowest hover:bg-surface-container'
        }
      `}
      data-testid={`agent-card-${agent.id}`}
    >
      <div className="flex items-center gap-2 w-full">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center shrink-0
          ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-secondary'}
        `}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
            {agent.label}
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">
        {agent.description}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary/10 text-secondary font-medium">
          {agent.interviewType}
        </span>
      </div>
    </button>
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
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all
          ${isDragActive 
            ? 'border-primary bg-primary-fixed/20' 
            : 'ghost-border hover:border-primary bg-surface-container-lowest'
          }
        `}
      >
        <input {...getInputProps()} />
        {isParsing ? (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p>Parsing document...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-sm text-primary font-medium">Drop the file here...</p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Upload className="w-4 h-4" />
            <p>Drag & drop PDF or Word file, or click to select</p>
          </div>
        )}
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
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary-fixed flex items-center justify-center">
            <Brain className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight">
          Cognitive Canvas
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mt-2">
          Your AI-powered interview coach
        </p>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 lg:px-12 xl:px-16 py-6 max-w-6xl mx-auto space-y-8">
          {/* Duration Slider - Only for simulation agents */}
          {showDurationPicker ? (
            <div className="bg-surface-container-low rounded-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <Label htmlFor="duration" className="text-xs font-bold uppercase tracking-widest text-secondary">
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
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: {selectedAgentDef.duration.min}-{selectedAgentDef.duration.max} minutes
              </p>
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-6">
              <p className="text-sm text-muted-foreground">
                This agent runs until the question list is complete. No duration selection needed.
              </p>
            </div>
          )}

          {/* Document Upload Grid - Two columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resume Section */}
            <div className="bg-surface-container-low rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <Label className="text-base font-semibold">Resume</Label>
                </div>
                {resume.trim() && (
                  <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
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
                className="min-h-[180px] lg:min-h-[220px] resize-y bg-surface-container-lowest border-0 focus-visible:ring-2 focus-visible:ring-primary text-base"
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

            {/* Job Description Section */}
            <div className="bg-surface-container-low rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <Label className="text-base font-semibold">Job Description</Label>
                </div>
                {jobDescription.trim() && (
                  <span className="text-[10px] font-bold text-tertiary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-tertiary" />
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
                className="min-h-[180px] lg:min-h-[220px] resize-y bg-surface-container-lowest border-0 focus-visible:ring-2 focus-visible:ring-primary text-base"
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
          </div>

          {/* Interview Agent Selector */}
          <div className="bg-surface-container-low rounded-2xl p-6">
            <Label className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 block">
              Interview Agent
            </Label>

            {/* Full Simulations Group */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Full Simulations</h3>
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
              <h3 className="text-sm font-semibold text-foreground mb-3">Targeted Prep</h3>
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

            <div className="mt-5 p-4 bg-tertiary/10 rounded-xl flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-tertiary shrink-0 mt-0.5" />
              <p className="text-sm text-tertiary leading-relaxed">
                Selecting an agent determines the interview style, tone, and feedback approach.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-surface-container-lowest rounded-2xl p-6">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">
              How it works
            </h4>
            <p className="text-base text-muted-foreground leading-relaxed">
              Talk to the AI for {duration} minutes about your career. It will ask questions to help you refine your professional value and prepare for interviews.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="px-6 lg:px-12 xl:px-16 py-6 space-y-4 bg-surface-container-lowest shrink-0">
        <div className="max-w-6xl mx-auto space-y-4">
          <Button
            className="w-full h-16 text-lg font-bold rounded-xl editorial-gradient text-white shadow-lg transition-all hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => onStart(duration)}
            disabled={!canStart}
          >
            <Play className="w-6 h-6 mr-3" />
            Start Interview
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          {lastReport && (
            <Button
              variant="ghost"
              className="w-full h-12 text-muted-foreground font-medium hover:text-primary"
              onClick={onViewLastReport}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              View Last Debrief
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}