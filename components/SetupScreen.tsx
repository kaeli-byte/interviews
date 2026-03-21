'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Play, RotateCcw } from 'lucide-react';

interface SetupScreenProps {
  onStart: (duration: number) => void;
  lastReport: any;
  onViewLastReport: () => void;
  resume: string;
  jobDescription: string;
  personality: string;
  onResumeChange: (text: string) => void;
  onJobDescriptionChange: (text: string) => void;
  onPersonalityChange: (value: string) => void;
  onFileParsed: (type: 'resume' | 'jd', text: string) => void;
}

export default function SetupScreen({
  onStart,
  lastReport,
  onViewLastReport,
  resume,
  jobDescription,
  personality,
  onResumeChange,
  onJobDescriptionChange,
  onPersonalityChange,
  onFileParsed,
}: SetupScreenProps) {
  const [duration, setDuration] = useState(10);

  return (
    <Card className="border-none shadow-none h-full flex flex-col justify-between p-6">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Play className="text-blue-600 w-8 h-8 fill-current" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight">MyCareer AI</CardTitle>
        <CardDescription className="text-slate-500">
          Your AI-powered career coach. Prepare your professional pitch through a 
          live voice conversation.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="duration" className="text-sm font-semibold">Interview Duration</Label>
            <span className="text-blue-600 font-bold">{duration} minutes</span>
          </div>
          <Slider 
            id="duration"
            min={1} 
            max={20} 
            step={1} 
            value={[duration]} 
            onValueChange={(vals) => {
              const val = Array.isArray(vals) ? vals[0] : vals;
              setDuration(val);
            }}
            className="cursor-pointer"
          />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">How it works</h4>
          <p className="text-sm text-slate-600">
            Talk to the AI for {duration} minutes about your career. It will ask questions to help you refine your value.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button 
          className="w-full h-14 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all shadow-lg"
          onClick={() => onStart(duration)}
        >
          Start Conversation
        </Button>
        {lastReport && (
          <Button 
            variant="ghost" 
            className="w-full text-slate-500 font-medium"
            onClick={onViewLastReport}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            View Last Debrief
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
