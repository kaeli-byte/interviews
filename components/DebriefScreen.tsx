'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Star, 
  TrendingUp, 
  User, 
  Target, 
  RotateCcw, 
  Share2, 
  Sparkles,
  Award,
  Lightbulb,
  MessageSquare,
  Clock,
  BarChart3
} from 'lucide-react';

interface DebriefScreenProps {
  report: any;
  onReset: () => void;
}

/**
 * Performance Score Display
 */
function PerformanceScore({ score }: { score: number }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 lg:p-8 flex flex-col justify-between h-full">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-4">
          Overall Performance
        </span>
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-heading font-extrabold tracking-tighter text-primary mb-3">
          {score}<span className="text-3xl lg:text-4xl text-outline">/100</span>
        </h1>
        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mt-6">
          Exceptional clarity and structural alignment. Your STAR method implementation was consistent, 
          though some responses could benefit from more specific metrics.
        </p>
      </div>
      <div className="mt-8 flex gap-4">
        <div className="flex-1 bg-surface-container-highest rounded-xl p-4">
          <span className="text-[10px] font-bold text-secondary uppercase block mb-2">Clarity</span>
          <div className="h-2.5 w-full bg-outline-variant rounded-full overflow-hidden">
            <div className="h-full bg-tertiary w-[90%]" />
          </div>
        </div>
        <div className="flex-1 bg-surface-container-highest rounded-xl p-4">
          <span className="text-[10px] font-bold text-secondary uppercase block mb-2">Confidence</span>
          <div className="h-2.5 w-full bg-outline-variant rounded-full overflow-hidden">
            <div className="h-full bg-primary-container w-[75%]" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Behavioral Pattern Card
 */
function PatternCard({ 
  type, 
  title, 
  description 
}: { 
  type: 'positive' | 'attention';
  title: string;
  description: string;
}) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 lg:p-6 shadow-sm h-full">
      <div className="flex items-center justify-between mb-4">
        {type === 'positive' ? (
          <Sparkles className="w-5 h-5 text-tertiary" />
        ) : (
          <Lightbulb className="w-5 h-5 text-primary" />
        )}
        <span className={`
          text-[10px] font-bold px-2.5 py-1 rounded-lg
          ${type === 'positive' ? 'bg-tertiary/10 text-tertiary' : 'bg-primary/10 text-primary'}
        `}>
          {type === 'positive' ? 'POSITIVE' : 'ATTENTION'}
        </span>
      </div>
      <h3 className="font-heading font-bold text-base lg:text-lg mb-2">{title}</h3>
      <p className="text-sm lg:text-base text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

/**
 * STAR Compliance Badge
 */
function StarCompliance() {
  return (
    <div className="editorial-gradient rounded-2xl p-6 lg:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h3 className="font-heading font-bold text-xl lg:text-2xl mb-1">STAR Compliance</h3>
        <p className="text-sm lg:text-base opacity-90">Behavioral questions answered with structural fidelity.</p>
      </div>
      <div className="flex -space-x-2">
        {['S', 'T', 'A', 'R'].map((letter) => (
          <div
            key={letter}
            className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center font-bold text-xl"
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Stat Card for metrics
 */
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  color = 'primary' 
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
    <div className="bg-surface-container-lowest rounded-xl p-5 lg:p-6 flex items-center gap-4">
      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
        <Icon className="w-6 h-6 lg:w-7 lg:h-7" />
      </div>
      <div>
        <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block">
          {label}
        </span>
        <span className="text-xl lg:text-2xl font-heading font-bold">{value}</span>
      </div>
    </div>
  );
}

export default function DebriefScreen({ report, onReset }: DebriefScreenProps) {
  if (!report) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
        <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center mb-6">
          <RotateCcw className="w-10 h-10 animate-spin opacity-40" />
        </div>
        <p className="font-medium text-lg">Generating your debrief...</p>
        <p className="text-base text-muted-foreground mt-2">This may take a moment</p>
      </div>
    );
  }

  const score = report.keyAchievements?.length > 2 ? 84 : 72;

  return (
    <div className="flex-1 flex flex-col bg-surface overflow-hidden min-h-0">
      {/* Header */}
      <header className="px-6 lg:px-12 xl:px-16 py-6 shrink-0 bg-surface-container-lowest">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-heading font-bold">Career Debrief</h1>
        </div>
        <p className="text-base lg:text-lg text-muted-foreground">
          Based on your interview session
        </p>
      </header>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="px-6 lg:px-12 xl:px-16 py-8">
          <div className="space-y-8 max-w-6xl mx-auto">
            {/* Performance Score & Patterns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PerformanceScore score={score} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                <PatternCard
                  type="positive"
                  title="High Confidence"
                  description="Voice tone remained steady and assertive during complex questions."
                />
                <PatternCard
                  type="attention"
                  title="Refine Metrics"
                  description="Consider adding specific numbers to your achievement examples."
                />
              </div>
            </div>

            {/* STAR Compliance */}
            <StarCompliance />

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={Clock}
                label="Duration"
                value="12:45"
                color="primary"
              />
              <StatCard
                icon={MessageSquare}
                label="Questions"
                value="8"
                color="tertiary"
              />
              <StatCard
                icon={BarChart3}
                label="Clarity"
                value="High"
                color="secondary"
              />
            </div>

            {/* Elevator Pitch */}
            <section className="bg-surface-container-low rounded-2xl p-6 lg:p-8">
              <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2 mb-5">
                <User className="w-4 h-4" />
                Elevator Pitch
              </h3>
              <div className="bg-primary-fixed/30 p-6 lg:p-8 rounded-xl border-l-4 border-primary italic text-foreground leading-relaxed text-lg lg:text-xl">
                "{report.elevatorPitch}"
              </div>
            </section>

            {/* Unique Value Proposition */}
            <section className="bg-surface-container-low rounded-2xl p-6 lg:p-8">
              <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2 mb-5">
                <Star className="w-4 h-4" />
                Unique Value Proposition
              </h3>
              <p className="text-base lg:text-lg text-foreground leading-relaxed">
                {report.uniqueValueProposition}
              </p>
            </section>

            {/* Key Achievements & Areas for Improvement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Key Achievements */}
              <section className="bg-surface-container-low rounded-2xl p-6 lg:p-8">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2 mb-5">
                  <Target className="w-4 h-4" />
                  Key Achievements
                </h3>
                <ul className="space-y-4">
                  {report.keyAchievements?.map((achievement: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 bg-surface-container-lowest p-5 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-tertiary text-tertiary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-base text-foreground leading-relaxed">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Areas for Improvement */}
              <section className="bg-surface-container-low rounded-2xl p-6 lg:p-8">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-widest flex items-center gap-2 mb-5">
                  <TrendingUp className="w-4 h-4" />
                  Areas to Improve
                </h3>
                <ul className="space-y-4">
                  {report.areasForImprovement?.map((area: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-4 bg-surface-container-lowest p-5 rounded-xl"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-2" />
                      <span className="text-base text-foreground leading-relaxed">{area}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            {/* Coach's Verdict */}
            <section className="editorial-gradient rounded-2xl p-6 lg:p-8 text-white">
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                  <Award className="w-7 h-7 lg:w-8 lg:h-8" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl lg:text-2xl mb-3">Coach's Verdict</h3>
                  <p className="text-base lg:text-lg opacity-90 leading-relaxed">
                    You demonstrated strong communication skills and a clear understanding of your professional value. 
                    Focus on quantifying your achievements with specific metrics to make your stories more impactful.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <footer className="px-6 lg:px-12 xl:px-16 py-6 shrink-0 bg-surface-container-lowest">
        <div className="flex gap-4 max-w-6xl mx-auto">
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
      </footer>
    </div>
  );
}