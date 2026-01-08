"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ChevronLeft, Download, Loader2, Share2 } from "lucide-react";
import { VideoMetadata, AnalysisResult } from "@/types/video";
import { videoApi } from "@/lib/api/endpoints";
import { toast } from "@/lib/utils/toast";
import SummaryPanel from "./SummaryPanel";
import TranscriptionPanel from "./TranscriptionPanel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface VideoDetailViewProps {
  metadata: VideoMetadata;
  jobId: string;
  onBack: () => void;
}

export default function VideoDetailView({ metadata, jobId, onBack }: VideoDetailViewProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    const pollResult = async () => {
      try {
        const data = await videoApi.getResult(jobId);
        setResult(data);
        if (data.status === 'pending' || data.status === 'processing') {
          setTimeout(pollResult, 3000);
        } else if (data.status === 'failed') {
          toast.error("Analysis failed. Please try again.");
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    };

    pollResult();
  }, [jobId]);

  // Mock time tracking (in real app, use YouTube IFrame API events)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSeek = (seconds: number) => {
    // In real implementation: playerRef.current.seekTo(seconds)
    setCurrentTime(seconds);
    toast.info(`Jumping to ${seconds}s`);
  };

  const handleExport = async (format: 'pdf' | 'markdown') => {
    if (!result || result.status !== 'completed') return;
    setIsExporting(true);
    try {
      const { downloadUrl } = await videoApi.export(metadata.videoId, format);
      window.open(downloadUrl, '_blank');
      toast.success(`Exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="rounded-full hover:bg-primary/10 hover:text-primary"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight line-clamp-1">{metadata.title}</h1>
            <p className="text-sm text-muted-foreground">by {metadata.author}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                className="rounded-full bg-primary shadow-lg hover:shadow-xl transition-all"
                disabled={!result || result.status !== 'completed' || isExporting}
              >
                {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-0 shadow-2xl">
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-xl cursor-pointer">PDF Document</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('markdown')} className="rounded-xl cursor-pointer">Markdown File</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" className="rounded-full border-0 shadow-md">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Player Area */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="overflow-hidden border-0 shadow-2xl rounded-[2rem] bg-black aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${metadata.videoId}?enablejsapi=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </Card>
          
          <Card className="border-0 shadow-xl rounded-[2rem] p-6 bg-background">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                {metadata.author.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold">{metadata.author}</h4>
                <p className="text-xs text-muted-foreground">Video Creator</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Content Area */}
        <div className="lg:col-span-5 h-[calc(100vh-200px)]">
          <Tabs defaultValue="summary" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-full p-1 bg-muted/50 mb-6">
              <TabsTrigger value="summary" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md">Smart Summary</TabsTrigger>
              <TabsTrigger value="transcription" className="rounded-full data-[state=active]:bg-background data-[state=active]:shadow-md">Transcription</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              {!result || result.status === 'processing' ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">AI is analyzing...</h3>
                    <p className="text-sm text-muted-foreground max-w-xs">
                      We're processing the audio and generating your insights. This usually takes less than 30 seconds.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <TabsContent value="summary" className="h-full mt-0 overflow-y-auto no-scrollbar">
                    <SummaryPanel result={result} onSeek={handleSeek} />
                  </TabsContent>
                  <TabsContent value="transcription" className="h-full mt-0">
                    <TranscriptionPanel 
                      result={result} 
                      currentTime={currentTime} 
                      onSeek={handleSeek} 
                    />
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}