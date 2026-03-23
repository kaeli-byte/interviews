'use client';

import { useState, useEffect } from 'react';
import SetupScreen from '@/components/SetupScreen';
import InterviewScreen from '@/components/InterviewScreen';
import DebriefScreen from '@/components/DebriefScreen';
import { AppLayout } from '@/components/AppLayout';
import { Sidebar } from '@/components/Sidebar';
import { TranscriptEntry } from '@/lib/types';

export type AppStep = 'setup' | 'interview' | 'debrief';

export interface InterviewData {
  duration: number;
  transcript: TranscriptEntry[];
  report: {
    elevatorPitch: string;
    keyAchievements: string[];
    uniqueValueProposition: string;
    areasForImprovement: string[];
  } | null;
  resume: string;
  jobDescription: string;
  personality: string;
}

export default function MyCareerApp() {
  const [step, setStep] = useState<AppStep>('setup');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [interviewData, setInterviewData] = useState<InterviewData>({
    duration: 10,
    transcript: [],
    report: null,
    resume: '',
    jobDescription: '',
    personality: 'warm',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mycareer-last-report');
    if (saved) {
      try {
        const report = JSON.parse(saved);
        setInterviewData(prev => ({ ...prev, report }));
      } catch (e) {
        console.error("Failed to parse saved report", e);
      }
    }
  }, []);

  const handleNavigate = (newStep: AppStep) => {
    setStep(newStep);
    setMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleStartInterview = (duration: number) => {
    if (!interviewData.resume.trim() || !interviewData.jobDescription.trim()) {
      return;
    }
    setInterviewData(prev => ({
      ...prev,
      duration,
      transcript: [],
      report: null,
    }));
    setStep('interview');
  };

  const handleFinishInterview = async (transcript: string[], report: InterviewData['report']) => {
    console.log('[MyCareerApp] handleFinishInterview called');
    console.log('[MyCareerApp] transcript length:', transcript.length);
    
    setStep('debrief');

    const transcriptEntries: TranscriptEntry[] = transcript.map((line, index) => {
      const isAI = line.startsWith('AI:');
      return {
        speaker: isAI ? 'interviewer' : 'candidate',
        text: line.replace(/^(AI|User): /, ''),
        timestamp: index * 1000
      };
    });

    if (!report) {
      console.log('[MyCareerApp] Calling generateDebrief...');
      const { generateDebrief } = await import('@/lib/debriefGenerator');
      try {
        const generatedReport = await generateDebrief(transcript);
        console.log('[MyCareerApp] Generated report:', generatedReport);
        setInterviewData(prev => ({ ...prev, transcript: transcriptEntries, report: generatedReport }));
        localStorage.setItem('mycareer-last-report', JSON.stringify(generatedReport));
      } catch (e) {
        console.error("[MyCareerApp] Failed to generate report", e);
      }
    } else {
      setInterviewData(prev => ({ ...prev, transcript: transcriptEntries, report }));
      localStorage.setItem('mycareer-last-report', JSON.stringify(report));
    }
  };

  const handleResumeChange = (text: string) => {
    setInterviewData(prev => ({ ...prev, resume: text }));
  };

  const handleJobDescriptionChange = (text: string) => {
    setInterviewData(prev => ({ ...prev, jobDescription: text }));
  };

  const handlePersonalityChange = (value: string | null) => {
    setInterviewData(prev => ({ ...prev, personality: value || 'warm' }));
  };

  const handleFileParsed = (type: 'resume' | 'jd', text: string) => {
    if (type === 'resume') {
      setInterviewData(prev => ({ ...prev, resume: text }));
    } else {
      setInterviewData(prev => ({ ...prev, jobDescription: text }));
    }
  };

  const handleReset = () => {
    setStep('setup');
  };

  return (
    <AppLayout
      sidebar={
        <Sidebar
          currentStep={step}
          onNavigate={handleNavigate}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      }
      mobileMenuOpen={mobileMenuOpen}
      onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
    >
      <div className="h-full flex flex-col">
        {step === 'setup' && (
          <SetupScreen
            onStart={handleStartInterview}
            lastReport={interviewData.report}
            onViewLastReport={() => setStep('debrief')}
            resume={interviewData.resume}
            jobDescription={interviewData.jobDescription}
            personality={interviewData.personality}
            onResumeChange={handleResumeChange}
            onJobDescriptionChange={handleJobDescriptionChange}
            onPersonalityChange={handlePersonalityChange}
            onFileParsed={handleFileParsed}
          />
        )}
        {step === 'interview' && (
          <InterviewScreen
            duration={interviewData.duration}
            onFinish={handleFinishInterview}
            resume={interviewData.resume}
            jobDescription={interviewData.jobDescription}
            personality={interviewData.personality}
          />
        )}
        {step === 'debrief' && (
          <DebriefScreen
            report={interviewData.report}
            onReset={handleReset}
          />
        )}
      </div>
    </AppLayout>
  );
}