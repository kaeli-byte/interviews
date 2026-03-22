'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Star, TrendingUp, User, Target, RotateCcw, Share2 } from 'lucide-react';

interface DebriefScreenProps {
  report: any;
  onReset: () => void;
}

export default function DebriefScreen({ report, onReset }: DebriefScreenProps) {
  if (!report) return (
    <div className="flex flex-col items-center justify-center h-[600px] text-slate-500">
      <RotateCcw className="w-12 h-12 mb-4 animate-spin opacity-20" />
      <p>Generating your debrief...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <CardHeader className="bg-white border-b pb-4 shrink-0">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="text-blue-600 w-5 h-5" />
          Career Debrief
        </CardTitle>
        <CardDescription>
          Based on our conversation today.
        </CardDescription>
      </CardHeader>

      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-8 pb-8">
          {/* Elevator Pitch */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="w-3 h-3" />
              Elevator Pitch
            </h3>
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 italic text-slate-700 leading-relaxed">
              "{report.elevatorPitch}"
            </div>
          </section>

          {/* Unique Value Prop */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              Unique Value Proposition
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed pl-1">
              {report.uniqueValueProposition}
            </p>
          </section>

          {/* Key Achievements */}
          <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3 h-3 text-green-500" />
              Key Achievements
            </h3>
            <ul className="space-y-2">
              {report.keyAchievements.map((achievement: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 text-sm text-slate-600">
                   <div className="w-5 h-5 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                   </div>
                   {achievement}
                </li>
              ))}
            </ul>
          </section>

           {/* Areas for Improvement */}
           <section className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3 h-3 text-blue-500" />
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {report.areasForImprovement.map((area: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-slate-100 text-sm text-slate-600">
                   <div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5" />
                   {area}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </ScrollArea>

      <CardFooter className="bg-white border-t p-6 shrink-0 flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 rounded-xl h-12 font-semibold"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          New Interview
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-xl h-12 font-semibold shadow-md">
          <Share2 className="w-4 h-4 mr-2" />
          Share Pitch
        </Button>
      </CardFooter>
    </div>
  );
}
