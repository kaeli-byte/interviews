'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  BarChart,
  Target,
  TrendingUp,
  RotateCcw,
  Share2,
  Sparkles,
  Lightbulb,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { DebriefReport, STARLevel, AgentId } from '@/lib/types';
import { AGENT_DEFINITIONS } from '@/lib/agents';
import {
  LiquidGlassCard,
  LiquidGlassActionButton,
} from '@/components/ui/liquid-glass';

interface DebriefScreenProps {
  report: DebriefReport | null;
  onReset: () => void;
}

/**
 * Tab Button Component
 */
function TabButton({
  id,
  label,
  icon: Icon,
  active,
  onClick,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/**
 * Stat Card for metrics
 */
function StatCard({
  icon: Icon,
  label,
  value,
  color = 'primary',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: 'primary' | 'tertiary' | 'secondary';
}) {
  const colorClasses = {
    primary: 'text-primary bg-primary-fixed',
    tertiary: 'text-tertiary bg-tertiary-fixed',
    secondary: 'text-secondary bg-secondary-fixed',
  };

  return (
    <LiquidGlassCard className="flex items-center gap-4 p-4">
      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block">
          {label}
        </span>
        <span className="text-xl lg:text-2xl font-heading font-bold">{value}</span>
      </div>
    </LiquidGlassCard>
  );
}

/**
 * Format duration from milliseconds to MM:SS
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Transcript Tab - Shows Q/A pairs with timestamps
 */
function TranscriptTab({ report }: { report: DebriefReport }) {
  const pairs = report.transcriptSummary?.pairs || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="px-6 lg:px-12 xl:px-16 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Session Stats Header */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Clock}
            label="Duration"
            value={formatDuration(report.sessionStats?.durationMs || 0)}
            color="primary"
          />
          <StatCard
            icon={MessageSquare}
            label="Questions"
            value={String(report.sessionStats?.questionCount || 0)}
            color="tertiary"
          />
          <StatCard
            icon={BarChart}
            label="Words"
            value={String(report.sessionStats?.candidateWordCount || 0)}
            color="secondary"
          />
        </div>

        {/* Q/A Pairs */}
        {pairs.map((pair, index) => (
          <LiquidGlassCard
            key={pair.id}
            className="overflow-hidden"
          >
            {/* Question */}
            <div className="p-5 lg:p-6 border-b border-white/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
                  Q{index + 1}
                </div>
                <div>
                  <span className="text-xs text-secondary uppercase tracking-wider">Question</span>
                  <p className="text-foreground font-medium mt-1">{pair.question}</p>
                  <span className="text-xs text-muted-foreground mt-1">{pair.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Response */}
            <div className="p-5 lg:p-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center text-sm font-bold shrink-0">
                  A
                </div>
                <div className="flex-1">
                  <span className="text-xs text-secondary uppercase tracking-wider">Your Response</span>
                  <p className="text-foreground mt-1 leading-relaxed">
                    {expandedId === pair.id || pair.response.length < 300
                      ? pair.response
                      : pair.response.slice(0, 300) + '...'}
                  </p>
                  {pair.response.length > 300 && (
                    <button
                      onClick={() => setExpandedId(expandedId === pair.id ? null : pair.id)}
                      className="text-primary text-sm mt-2 flex items-center gap-1"
                    >
                      {expandedId === pair.id ? (
                        <>Show less <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>Show more <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </LiquidGlassCard>
        ))}

        {/* Fallback if no transcript data */}
        {pairs.length === 0 && (
          <LiquidGlassCard className="text-center p-6">
            <p className="text-white/60">No transcript data available for this session.</p>
          </LiquidGlassCard>
        )}
      </div>
    </div>
  );
}

/**
 * STAR Progress Bar with color coding
 */
const STAR_COLORS: Record<STARLevel, { bg: string; width: string }> = {
  clear: { bg: 'bg-green-500', width: '100%' },
  partial: { bg: 'bg-yellow-500', width: '75%' },
  moderate: { bg: 'bg-orange-500', width: '50%' },
  weak: { bg: 'bg-red-500', width: '25%' },
};

function StarProgressBar({ label, level }: { label: string; level: STARLevel }) {
  const config = STAR_COLORS[level];
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/60 w-20 capitalize">{label}</span>
      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${config.bg} transition-all duration-500`} style={{ width: config.width }} />
      </div>
      <span className="text-xs font-semibold uppercase tracking-wider w-16 text-right">{level}</span>
    </div>
  );
}

/**
 * Analysis Tab - Shows STAR progress bars, patterns, strengths/weaknesses
 */
function AnalysisTab({ report }: { report: DebriefReport }) {
  const evaluations = report.evaluations || [];
  const analysis = report.analysis;
  const patterns = analysis?.patterns || [];

  // Get question text from transcript for each evaluation
  const getQuestionText = (qaPairId: string): string => {
    const pair = report.transcriptSummary?.pairs.find(p => p.id === qaPairId);
    return pair?.question || 'Unknown question';
  };

  return (
    <div className="px-6 lg:px-12 xl:px-16 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Overall Score */}
        {analysis && (
          <LiquidGlassCard className="p-6">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Overall Performance</h3>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-heading font-extrabold text-primary">
                {analysis.overallScore}/10
              </div>
              <div className="text-sm text-white/60 capitalize">
                {analysis.hireSignal?.replace('_', ' ')}
              </div>
            </div>
          </LiquidGlassCard>
        )}

        {/* Per-Answer STAR Evaluation */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">STAR Evaluation by Answer</h3>
          {evaluations.filter(e => e.starScore).map((evaluation, index) => (
            <LiquidGlassCard key={evaluation.qaPairId} className="p-4">
              <div className="mb-4">
                <span className="text-xs text-muted-foreground uppercase">Q{index + 1} - {evaluation.questionType}</span>
                <p className="text-sm text-foreground mt-1 line-clamp-2">{getQuestionText(evaluation.qaPairId)}</p>
              </div>
              <div className="space-y-3">
                <StarProgressBar label="Situation" level={evaluation.starScore!.situation} />
                <StarProgressBar label="Task" level={evaluation.starScore!.task} />
                <StarProgressBar label="Action" level={evaluation.starScore!.action} />
                <StarProgressBar label="Result" level={evaluation.starScore!.result} />
              </div>
              {evaluation.feedback && (
                <p className="text-sm text-white/60 mt-4 italic">"{evaluation.feedback}"</p>
              )}
            </LiquidGlassCard>
          ))}

          {/* Fallback if no evaluations */}
          {evaluations.filter(e => e.starScore).length === 0 && (
            <LiquidGlassCard className="text-center p-6">
              <p className="text-white/60">No STAR evaluations available. Complete a behavioral interview to see analysis.</p>
            </LiquidGlassCard>
          )}
        </div>

        {/* Patterns Detected */}
        {patterns.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Patterns Detected</h3>
            {patterns.map((pattern, index) => (
              <LiquidGlassCard key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {pattern.type === 'positive' ? (
                      <Sparkles className="w-5 h-5 text-green-500" />
                    ) : (
                      <Lightbulb className="w-5 h-5 text-orange-500" />
                    )}
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                      pattern.type === 'positive' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                    }`}>
                      {pattern.type.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {pattern.instanceCount} instances
                  </span>
                </div>
                <p className="text-white">{pattern.description}</p>
              </LiquidGlassCard>
            ))}
          </div>
        )}

        {/* Strengths & Weaknesses */}
        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LiquidGlassCard className="p-4">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Strengths</h4>
              <ul className="space-y-3">
                {analysis.strengths?.map((strength, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-white">{strength}</span>
                  </li>
                ))}
              </ul>
            </LiquidGlassCard>
            <LiquidGlassCard className="p-4">
              <h4 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Areas to Improve</h4>
              <ul className="space-y-3">
                {analysis.weaknesses?.map((weakness, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-white">{weakness}</span>
                  </li>
                ))}
              </ul>
            </LiquidGlassCard>
          </div>
        )}

        {/* Fallback if no analysis data */}
        {!analysis && (
          <LiquidGlassCard className="text-center p-6">
            <p className="text-white/60">No analysis data available for this session.</p>
          </LiquidGlassCard>
        )}
      </div>
    </div>
  );
}

/**
 * Coaching Tab - Shows top 3 priorities, quick wins, and practice plan
 */
function CoachingTab({ report }: { report: DebriefReport }) {
  const coaching = report.coaching;
  const priorities = coaching?.topPriorities || [];
  const quickWins = coaching?.quickWins || [];
  const practicePlan = coaching?.practicePlan;

  // Get agent label from AGENT_DEFINITIONS
  const getAgentLabel = (agentId: AgentId): string => {
    return AGENT_DEFINITIONS[agentId]?.label || agentId;
  };

  return (
    <div className="px-6 lg:px-12 xl:px-16 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top 3 Priorities */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest">Top 3 Priorities</h3>
          {priorities.map((priority, index) => (
            <LiquidGlassCard key={index} className="p-6">
              <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-heading font-bold text-lg text-white mb-2">{priority.issue}</h4>
                  <p className="text-sm text-white/60 mb-3">{priority.whyItMatters}</p>
                  <div className="mt-2 p-4 bg-white/5 border border-white/20 rounded-xl">
                    <span className="text-xs text-white/60 uppercase tracking-wider">How to fix</span>
                    <p className="text-white mt-1">{priority.fix}</p>
                  </div>
                  {priority.example && (
                    <div className="mt-3 p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg">
                      <span className="text-xs text-primary uppercase tracking-wider">Example</span>
                      <p className="text-sm text-white mt-1 italic">{priority.example}</p>
                    </div>
                  )}
                </div>
              </div>
            </LiquidGlassCard>
          ))}

          {/* Fallback if no priorities */}
          {priorities.length === 0 && (
            <LiquidGlassCard className="text-center p-6">
              <p className="text-white/60">No coaching priorities available. Complete an interview to receive personalized guidance.</p>
            </LiquidGlassCard>
          )}
        </div>

        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <LiquidGlassCard className="p-6">
            <h3 className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Quick Wins</h3>
            <ul className="space-y-3">
              {quickWins.map((win, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-white">{win}</span>
                </li>
              ))}
            </ul>
          </LiquidGlassCard>
        )}

        {/* Practice Plan */}
        {practicePlan && (
          <LiquidGlassCard className="p-6 lg:p-8 editorial-gradient text-white">
            <h3 className="text-xs font-bold uppercase tracking-widest opacity-80 mb-4">Practice Plan</h3>
            <div className="space-y-4">
              <div>
                <span className="text-sm opacity-80">Next Session Focus</span>
                <p className="text-lg font-semibold">{practicePlan.nextSessionFocus}</p>
              </div>
              <div>
                <span className="text-sm opacity-80">Recommended Agent</span>
                <p className="text-lg font-semibold">{getAgentLabel(practicePlan.recommendedAgent)}</p>
              </div>
              <div>
                <span className="text-sm opacity-80">Drill</span>
                <p className="text-base">{practicePlan.drill}</p>
              </div>
            </div>
          </LiquidGlassCard>
        )}

        {/* Fallback if no coaching data */}
        {!coaching && (
          <LiquidGlassCard className="text-center p-6">
            <p className="text-white/60">No coaching insights available for this session.</p>
          </LiquidGlassCard>
        )}
      </div>
    </div>
  );
}

export default function DebriefScreen({ report, onReset }: DebriefScreenProps) {
  const [activeTab, setActiveTab] = useState<'transcript' | 'analysis' | 'coaching'>('transcript');

  if (!report) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-white/60 p-6">
        <LiquidGlassCard className="flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <RotateCcw className="w-8 h-8 animate-spin opacity-40" />
          </div>
          <p className="font-medium text-lg text-white">Generating your debrief...</p>
          <p className="text-base text-white/60 mt-2">This may take a moment</p>
        </LiquidGlassCard>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Header */}
      <LiquidGlassCard className="shrink-0 rounded-none border-b border-white/10 rounded-t-none p-4">
        <div className="relative z-10 flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold">Career Debrief</h1>
        </div>
        <p className="text-base lg:text-lg text-white/60 relative z-10">
          Based on your interview session
        </p>
      </LiquidGlassCard>

      {/* Tab Navigation */}
      <div className="shrink-0 border-b border-white/10 bg-white/5 backdrop-blur-xl p-4">
        <div className="relative z-10 flex gap-2">
          <TabButton
          id="transcript"
          label="Transcript"
          icon={FileText}
          active={activeTab === 'transcript'}
          onClick={() => setActiveTab('transcript')}
        />
        <TabButton
          id="analysis"
          label="Analysis"
          icon={BarChart}
          active={activeTab === 'analysis'}
          onClick={() => setActiveTab('analysis')}
        />
        <TabButton
          id="coaching"
          label="Coaching"
          icon={Target}
          active={activeTab === 'coaching'}
          onClick={() => setActiveTab('coaching')}
        />
        </div>
      </div>

      {/* Tab Content */}
      <ScrollArea className="flex-1">
        {activeTab === 'transcript' && <TranscriptTab report={report} />}
        {activeTab === 'analysis' && <AnalysisTab report={report} />}
        {activeTab === 'coaching' && <CoachingTab report={report} />}
      </ScrollArea>

      {/* Footer Actions */}
      <LiquidGlassCard className="shrink-0 border-t border-white/10 rounded-none p-4">
        <div className="relative z-10 flex gap-4 max-w-6xl mx-auto">
          <Button
            variant="outline"
            className="flex-1 h-14 lg:h-16 rounded-xl font-semibold text-base lg:text-lg"
            onClick={onReset}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            New Interview
          </Button>
          <Button className="flex-1 h-14 lg:h-16 rounded-xl font-semibold text-base lg:text-lg editorial-gradient text-white shadow-lg">
            <Share2 className="w-5 h-5 mr-2" />
            Share Pitch
          </Button>
        </div>
      </LiquidGlassCard>
    </div>
  );
}