'use client';

import * as React from 'react';
import {
  LiquidGlassCard,
  LiquidGlassActionButton,
} from '@/components/ui/liquid-glass';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, User, Briefcase, MessageSquare, AlertCircle, ArrowLeft, Play, ArrowRight } from 'lucide-react';
import type {
  CandidatePersona,
  ExperienceLevel,
  CommunicationFormality,
  CommunicationApproach,
} from '@/lib/types';

interface PersonaScreenProps {
  persona: CandidatePersona | null;
  isLoading: boolean;
  error: string | null;
  onPersonaChange: (persona: CandidatePersona) => void;
  onProceed: () => void;
  onBack: () => void;
}

/**
 * PersonaScreen displays the extracted candidate persona for review and editing.
 * Per D-03: Dedicated screen between Setup and Simulation with editable fields.
 */
export default function PersonaScreen({
  persona,
  isLoading,
  error,
  onPersonaChange,
  onProceed,
  onBack,
}: PersonaScreenProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <LiquidGlassCard className="p-8">
          <div className="relative z-10 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-white/70 text-lg">Extracting your persona...</p>
            <p className="text-white/50 text-sm">This may take a few seconds</p>
          </div>
        </LiquidGlassCard>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <LiquidGlassCard className="p-8 max-w-md">
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <AlertCircle className="w-10 h-10 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Extraction Failed</h2>
            <p className="text-white/70">{error}</p>
            <LiquidGlassActionButton
              variant="default"
              size="md"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Go Back
            </LiquidGlassActionButton>
          </div>
        </LiquidGlassCard>
      </div>
    );
  }

  // No persona state
  if (!persona) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0">
        <LiquidGlassCard className="p-8">
          <div className="relative z-10 flex flex-col items-center gap-4 text-center">
            <User className="w-10 h-10 text-white/50" />
            <p className="text-white/70">No persona data available</p>
            <LiquidGlassActionButton
              variant="default"
              size="md"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Go Back
            </LiquidGlassActionButton>
          </div>
        </LiquidGlassCard>
      </div>
    );
  }

  // Update helper functions
  const updateExperienceLevel = (level: string | null) => {
    if (level && ['junior', 'mid', 'senior', 'staff'].includes(level)) {
      onPersonaChange({
        ...persona,
        experienceLevel: level as ExperienceLevel,
      });
    }
  };

  const updateSkillCategory = (category: 'technical' | 'soft' | 'domain', skillsText: string) => {
    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 8);

    onPersonaChange({
      ...persona,
      skills: {
        ...persona.skills,
        [category]: skills,
      },
    });
  };

  const updateCommunicationStyle = (
    dimension: 'formality' | 'approach',
    value: string
  ) => {
    onPersonaChange({
      ...persona,
      communicationStyle: {
        ...persona.communicationStyle,
        [dimension]: value as CommunicationFormality | CommunicationApproach,
      },
    });
  };

  const updateKnowledgeGapSkill = (index: number, skillsText: string) => {
    const skills = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 3);

    const newGaps = [...persona.knowledgeGaps];
    if (newGaps[index]) {
      newGaps[index] = {
        ...newGaps[index],
        missingSkills: skills,
      };
    }

    onPersonaChange({
      ...persona,
      knowledgeGaps: newGaps,
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Header */}
      <header className="px-6 lg:px-12 xl:px-16 pt-8 pb-6 text-center shrink-0">
        <LiquidGlassCard className="inline-flex flex-col items-center justify-center mb-4 p-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg">
            <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
        </LiquidGlassCard>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-white drop-shadow-lg">
          Candidate Persona
        </h1>
        <p className="text-base md:text-lg text-white/70 mt-2">
          Review and adjust before simulation
        </p>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 lg:px-12 xl:px-16 py-6 max-w-4xl mx-auto space-y-6">
          {/* Experience Level Card */}
          <LiquidGlassCard className="p-6">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold text-white">
                  Experience Level
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 block">
                    Level
                  </Label>
                  <Select
                    value={persona.experienceLevel}
                    onValueChange={updateExperienceLevel}
                  >
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                      <SelectItem value="mid">Mid (2-5 years)</SelectItem>
                      <SelectItem value="senior">Senior (5-10 years)</SelectItem>
                      <SelectItem value="staff">Staff (10+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-center md:justify-start">
                  <div className="bg-white/10 rounded-lg px-4 py-2">
                    <span className="text-2xl font-bold text-primary">
                      {persona.yearsOfExperience}
                    </span>
                    <span className="text-white/60 ml-2">years detected</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 block">
                  Work History Summary
                </Label>
                <p className="text-white/70 text-sm leading-relaxed bg-white/5 rounded-lg p-3">
                  {persona.workHistorySummary}
                </p>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Skills Card */}
          <LiquidGlassCard className="p-6">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold text-white">
                  Skills
                </Label>
                <span className="text-xs text-white/50 ml-auto">
                  Edit as comma-separated list
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Technical Skills */}
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 block">
                    Technical
                  </Label>
                  <Textarea
                    value={persona.skills.technical.join(', ')}
                    onChange={(e) => updateSkillCategory('technical', e.target.value)}
                    placeholder="Languages, frameworks, tools..."
                    className="min-h-[100px] resize-y bg-black/20 border-white/20 focus-visible:ring-primary/50 text-white placeholder:text-white/40 text-sm"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    {persona.skills.technical.length}/8 skills
                  </p>
                </div>

                {/* Soft Skills */}
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 block">
                    Soft Skills
                  </Label>
                  <Textarea
                    value={persona.skills.soft.join(', ')}
                    onChange={(e) => updateSkillCategory('soft', e.target.value)}
                    placeholder="Communication, leadership..."
                    className="min-h-[100px] resize-y bg-black/20 border-white/20 focus-visible:ring-primary/50 text-white placeholder:text-white/40 text-sm"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    {persona.skills.soft.length}/8 skills
                  </p>
                </div>

                {/* Domain Skills */}
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 block">
                    Domain
                  </Label>
                  <Textarea
                    value={persona.skills.domain.join(', ')}
                    onChange={(e) => updateSkillCategory('domain', e.target.value)}
                    placeholder="Industry expertise..."
                    className="min-h-[100px] resize-y bg-black/20 border-white/20 focus-visible:ring-primary/50 text-white placeholder:text-white/40 text-sm"
                  />
                  <p className="text-xs text-white/40 mt-1">
                    {persona.skills.domain.length}/8 skills
                  </p>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Communication Style Card */}
          <LiquidGlassCard className="p-6">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-primary" />
                <Label className="text-base font-semibold text-white">
                  Communication Style
                </Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Formality */}
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 block">
                    Formality
                  </Label>
                  <div className="flex gap-2">
                    {(['formal', 'casual'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => updateCommunicationStyle('formality', option)}
                        className={`
                          flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all
                          ${
                            persona.communicationStyle.formality === option
                              ? 'bg-primary/30 border-2 border-primary text-white'
                              : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/15'
                          }
                        `}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    {persona.communicationStyle.formality === 'formal'
                      ? 'Professional language, structured sentences'
                      : 'Conversational tone, approachable style'}
                  </p>
                </div>

                {/* Approach */}
                <div>
                  <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-2 block">
                    Approach
                  </Label>
                  <div className="flex gap-2">
                    {(['technical', 'narrative'] as const).map((option) => (
                      <button
                        key={option}
                        onClick={() => updateCommunicationStyle('approach', option)}
                        className={`
                          flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all
                          ${
                            persona.communicationStyle.approach === option
                              ? 'bg-primary/30 border-2 border-primary text-white'
                              : 'bg-white/10 border border-white/20 text-white/70 hover:bg-white/15'
                          }
                        `}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-white/40 mt-2">
                    {persona.communicationStyle.approach === 'technical'
                      ? 'Data-driven, metrics-focused'
                      : 'Story-based, outcome-emphasized'}
                  </p>
                </div>
              </div>
            </div>
          </LiquidGlassCard>

          {/* Knowledge Gaps Card */}
          <LiquidGlassCard className="p-6">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                <Label className="text-base font-semibold text-white">
                  Knowledge Gaps
                </Label>
                <span className="text-xs text-white/50 ml-auto">
                  Skills missing from JD requirements
                </span>
              </div>

              <div className="space-y-4">
                {persona.knowledgeGaps.map((gap, index) => (
                  <div
                    key={index}
                    className="bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-primary font-semibold">
                        {gap.category}
                      </span>
                    </div>
                    <Textarea
                      value={gap.missingSkills.join(', ')}
                      onChange={(e) => updateKnowledgeGapSkill(index, e.target.value)}
                      placeholder="Missing skills..."
                      className="min-h-[60px] resize-y bg-black/20 border-white/20 focus-visible:ring-primary/50 text-white placeholder:text-white/40 text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-200/80">
                  These gaps highlight areas where the simulation may expose weaknesses.
                  They are derived from comparing your resume to the job requirements.
                </p>
              </div>
            </div>
          </LiquidGlassCard>
        </div>
      </div>

      {/* Footer Actions */}
      <footer className="px-6 lg:px-12 xl:px-16 py-6 space-y-4 shrink-0">
        <LiquidGlassCard className="max-w-4xl mx-auto p-6">
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <LiquidGlassActionButton
              variant="ghost"
              size="lg"
              className="flex-1 h-14 text-white/70 font-medium hover:text-white"
              onClick={onBack}
              leftIcon={<ArrowLeft className="w-5 h-5" />}
            >
              Back
            </LiquidGlassActionButton>
            <LiquidGlassActionButton
              variant="primary"
              size="lg"
              className="flex-1 h-14 text-lg font-bold rounded-xl"
              onClick={onProceed}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Simulation
            </LiquidGlassActionButton>
          </div>
        </LiquidGlassCard>
      </footer>
    </div>
  );
}