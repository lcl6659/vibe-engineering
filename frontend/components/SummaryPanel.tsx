import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AnalysisResult } from "@/types/video";

interface SummaryPanelProps {
  result: AnalysisResult;
  onSeek: (seconds: number) => void;
}

export default function SummaryPanel({ result, onSeek }: SummaryPanelProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Section */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">AI Summary</h3>
        <Card className="border-0 shadow-xl rounded-[2rem] bg-muted/30">
          <CardContent className="pt-6">
            <p className="text-muted-foreground leading-relaxed italic">
              {result.summary || "Generating summary..."}
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="bg-border/50" />

      {/* Key Points */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Key Insights</h3>
        <div className="grid gap-3">
          {result.keyPoints?.map((point, idx) => (
            <div key={idx} className="flex items-start gap-4 group">
              <Badge className="mt-1 rounded-full h-6 w-6 flex items-center justify-center p-0 bg-primary/10 text-primary border-0">
                {idx + 1}
              </Badge>
              <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                {point}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-border/50" />

      {/* Chapters */}
      <section className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight">Chapters</h3>
        <Accordion type="single" collapsible className="w-full space-y-2">
          {result.chapters?.map((chapter, idx) => (
            <AccordionItem 
              key={idx} 
              value={`item-${idx}`} 
              className="border-0 shadow-sm bg-background rounded-2xl px-4"
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <span 
                    className="text-xs font-mono text-primary font-bold cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSeek(chapter.seconds);
                    }}
                  >
                    {chapter.timestamp}
                  </span>
                  <span className="font-medium">{chapter.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Click the timestamp to jump to this section in the video.
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}