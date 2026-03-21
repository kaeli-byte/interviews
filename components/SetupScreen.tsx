'use client';

import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Play, RotateCcw, Upload, FileText, Loader2 } from 'lucide-react';
import { isEmptyOrNonsense } from '@/lib/documentParser';

interface SetupScreenProps {
  onStart: (duration: number) => void;
  lastReport: any;
  onViewLastReport: () => void;
  resume: string;
  jobDescription: string;
  personality: string;
  onResumeChange: (text: string) => void;
  onJobDescriptionChange: (text: string) => void;
  onPersonalityChange: (value: string | null) => void;
  onFileParsed: (type: 'resume' | 'jd', text: string) => void;
}

const PERSONALITY_OPTIONS = [
  { value: 'warm', label: 'Warm & Encouraging', description: 'Supportive and positive' },
  { value: 'professional', label: 'Professional & Neutral', description: 'Balanced and objective' },
  { value: 'direct', label: 'Direct & Challenging', description: 'Pushes you to think deeper' },
  { value: 'coaching', label: 'Coaching-Focused', description: 'Helps you grow and learn' },
];

function FileDropzone({
  onFileParsed,
  label,
  documentType,
}: {
  onFileParsed: (text: string) => void;
  label: string;
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
        className="border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors bg-slate-50"
      >
        <input {...getInputProps()} />
        {isParsing ? (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p>Parsing document...</p>
          </div>
        ) : isDragActive ? (
          <p className="text-sm text-slate-600">Drop the file here...</p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
            <Upload className="w-4 h-4" />
            <p>Drag 'n' drop a PDF or Word file, or click to select</p>
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
  personality,
  onResumeChange,
  onJobDescriptionChange,
  onPersonalityChange,
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

      <CardContent className="space-y-6 flex-1 overflow-y-auto">
        {/* Interview Settings */}
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

        {/* Resume Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <Label className="text-sm font-semibold">Resume</Label>
          </div>
          <Textarea
            value={resume}
            onChange={(e) => {
              onResumeChange(e.target.value);
              setResumeEmptyText(false);
            }}
            placeholder="Paste your resume text here..."
            className="min-h-[150px] resize-y"
          />
          <FileDropzone
            onFileParsed={handleResumeFileParsed}
            label="Resume"
            documentType="resume"
          />
          {resumeEmptyText && (
            <Alert variant="destructive">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                The uploaded document appears to be empty or image-only. Please paste the text manually or upload a different file.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Job Description Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-500" />
            <Label className="text-sm font-semibold">Job Description</Label>
          </div>
          <Textarea
            value={jobDescription}
            onChange={(e) => {
              onJobDescriptionChange(e.target.value);
              setJdEmptyText(false);
            }}
            placeholder="Paste the job description here..."
            className="min-h-[150px] resize-y"
          />
          <FileDropzone
            onFileParsed={handleJdFileParsed}
            label="Job Description"
            documentType="jd"
          />
          {jdEmptyText && (
            <Alert variant="destructive">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                The uploaded document appears to be empty or image-only. Please paste the text manually or upload a different file.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Personality Selector */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">AI Interviewer Personality</Label>
          <Select value={personality} onValueChange={onPersonalityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select interviewer personality" />
            </SelectTrigger>
            <SelectContent>
              {PERSONALITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} - {opt.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* How it works info box */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">How it works</h4>
          <p className="text-sm text-slate-600">
            Talk to the AI for {duration} minutes about your career. It will ask questions to help you refine your value.
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          className="w-full h-14 text-lg font-bold rounded-2xl bg-blue-600 hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => onStart(duration)}
          disabled={!canStart}
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
