import React, { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { AnalysisResult } from "@/types/video";
import { cn } from "@/lib/utils";

interface TranscriptionPanelProps {
  result: AnalysisResult;
  currentTime: number;
  onSeek: (seconds: number) => void;
}

export default function TranscriptionPanel({ result, currentTime, onSeek }: TranscriptionPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTranscription = useMemo(() => {
    if (!searchQuery) return result.transcription || [];
    return (result.transcription || []).filter(item => 
      item.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [result.transcription, searchQuery]);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search in transcription..."
          className="pl-10 h-12 rounded-full border-0 shadow-md bg-muted/50 focus:ring-2 focus:ring-primary"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6 py-4">
          {filteredTranscription.map((item, idx) => {
            const isActive = currentTime >= item.seconds && 
              (!result.transcription?.[idx + 1] || currentTime < result.transcription[idx + 1].seconds);
            
            return (
              <div 
                key={idx} 
                className={cn(
                  "group flex gap-4 p-4 rounded-2xl transition-all duration-300",
                  isActive ? "bg-primary/5 shadow-sm" : "hover:bg-muted/30"
                )}
              >
                <button
                  onClick={() => onSeek(item.seconds)}
                  className="shrink-0 text-xs font-mono font-bold text-primary hover:underline h-fit mt-1"
                >
                  {item.timestamp}
                </button>
                <p className={cn(
                  "text-sm leading-relaxed transition-colors",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground",
                  searchQuery && item.text.toLowerCase().includes(searchQuery.toLowerCase()) && "bg-yellow-100 dark:bg-yellow-900/30"
                )}>
                  {item.text}
                </p>
              </div>
            );
          })}
          {filteredTranscription.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No matches found for "{searchQuery}"
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}