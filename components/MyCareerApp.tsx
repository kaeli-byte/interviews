'use client';

import { useState, useEffect } from 'react';
import SetupScreen from '@/components/SetupScreen';
import InterviewScreen from '@/components/InterviewScreen';
import DebriefScreen from '@/components/DebriefScreen';

export type AppStep = 'setup' | 'interview' | 'debrief';

export interface InterviewData {
  duration: number;
  transcript: string[];
  report: {
    elevatorPitch: string;
    keyAchievements: string[];
    uniqueValueProposition: string;
    areasForImprovement: string[];
  } | null;
  resume: string;           // User's resume text
  jobDescription: string;   // Job description text
  personality: string;      // 'warm' | 'professional' | 'direct' | 'coaching'
}

export default function MyCareerApp() {
  const [step, setStep] = useState<AppStep>('setup');
  const [interviewData, setInterviewData] = useState<InterviewData>({
    duration: 10,
    transcript: [],
    report: null,
    resume: '',
    jobDescription: '',
    personality: 'warm',  // Default to warm/encouraging
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mycareer-last-report');
    if (saved) {
      try {
        const report = JSON.parse(saved);
        setInterviewData(prev => ({ ...prev, report }));
        // If we have a report, maybe we want to show it? 
        // For now, let's just keep it in state and let the user decide.
      } catch (e) {
        console.error("Failed to parse saved report", e);
      }
    }
  }, []);

  const handleStartInterview = (duration: number) => {
    // Validate that resume and JD are not empty
    if (!interviewData.resume.trim() || !interviewData.jobDescription.trim()) {
      // SetupScreen handles disabled button, but we guard here too
      return;
    }
    setInterviewData(prev => ({
      ...prev,
      duration,
      transcript: [],
      report: null,
      // Keep resume, jobDescription, personality - they're needed for Phase 2
    }));
    setStep('interview');
  };

  const handleFinishInterview = async (transcript: string[], report: InterviewData['report']) => {
    // If report is null (normal flow), we trigger generation
    setStep('debrief');

    if (!report) {
      const { generateDebrief } = await import('@/lib/debriefGenerator');
      try {
        const generatedReport = await generateDebrief(transcript);
        setInterviewData(prev => ({ ...prev, transcript, report: generatedReport }));
        localStorage.setItem('mycareer-last-report', JSON.stringify(generatedReport));
      } catch (e) {
        console.error("Failed to generate report", e);
      }
    } else {
      setInterviewData(prev => ({ ...prev, transcript, report }));
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
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col">
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
    </main>
  );
}
