import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResult } from "@/types/video";
import ReactMarkdown from 'react-markdown';

interface SummaryPanelProps {
  result: AnalysisResult;
  onSeek: (seconds: number) => void;
}

export default function SummaryPanel({ result, onSeek }: SummaryPanelProps) {
  // Get content from summary or first transcription item
  const summaryContent = result.summary || 
    (result.transcription && result.transcription.length > 0 ? result.transcription[0].text : null);

  return (
    <div className="animate-in fade-in duration-500">
      <Card className="border-0 shadow-xl rounded-[2rem] bg-muted/30">
        <CardContent className="pt-6 pb-6">
          {summaryContent ? (
            <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
              <ReactMarkdown>{summaryContent}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed italic">
              Generating summary...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
