"use client";

import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, History, Clock } from "lucide-react";
import { videoApi } from '@/lib/api/endpoints';
import { VideoMetadata, HistoryItem } from '@/types/video';
import { toast } from '@/lib/utils/toast';
import VideoDetailView from './VideoDetailView';
import { Card, CardContent } from "@/components/ui/card";

export default function AppContainer() {
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeView, setActiveView] = useState<{ metadata: VideoMetadata; jobId: string } | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await videoApi.getHistory();
        setHistory(data.items || []);
      } catch (error) {
        console.error("Failed to load history");
      }
    };
    loadHistory();
  }, []);

  const handleStartAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    try {
      // 1. Get Metadata
      const metadata = await videoApi.getMetadata(url);
      
      // 2. Start Analysis
      const { jobId } = await videoApi.analyze(metadata.videoId, language);
      
      setActiveView({ metadata, jobId });
      toast.success("Analysis started!");
    } catch (error: any) {
      toast.error(error.message || "Please enter a valid public YouTube link");
    } finally {
      setLoading(false);
    }
  };

  if (activeView) {
    return <VideoDetailView 
      metadata={activeView.metadata} 
      jobId={activeView.jobId} 
      onBack={() => setActiveView(null)} 
    />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          YouTube AI Intelligence
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
          VIBE <br className="hidden sm:block" />
          <span className="text-primary">INTELLIGENCE.</span>
        </h1>
        
        <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
          Transform any YouTube video into structured insights, summaries, and searchable transcripts in seconds.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleStartAnalysis} className="space-y-4 mb-24">
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-muted-foreground h-5 w-5" />
          <Input
            type="url"
            placeholder="Paste YouTube link here..."
            className="pl-14 pr-40 h-16 text-lg rounded-full border-0 bg-background shadow-xl focus:ring-2 focus:ring-primary focus:shadow-2xl transition-all duration-300"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button 
            type="submit" 
            className="absolute right-2 rounded-full h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-300"
            disabled={loading || !url}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze'}
          </Button>
        </div>
        
        <div className="flex justify-center">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-[200px] rounded-full h-10 border-0 shadow-md bg-background">
              <SelectValue placeholder="Target Language" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-0 shadow-2xl">
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="zh">Chinese (Simplified)</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
              <SelectItem value="ko">Korean</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>

      {/* History Section */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <History className="h-5 w-5" />
          <h2 className="text-xl font-bold tracking-tight text-foreground">Recent Analysis</h2>
        </div>

        {history.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {history.map((item) => (
              <Card 
                key={item.videoId} 
                className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[2rem] bg-background cursor-pointer"
                onClick={() => setUrl(`https://youtube.com/watch?v=${item.videoId}`)}
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={item.thumbnailUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Search className="text-white h-6 w-6" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{item.title}</h3>
                  <div className="flex items-center text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 rounded-[2rem] bg-muted/30 shadow-inner">
            <p className="text-muted-foreground text-lg">No recent records. Start your first analysis above!</p>
          </div>
        )}
      </div>
    </div>
  );
}