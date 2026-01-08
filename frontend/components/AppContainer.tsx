"use client";

import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import ContentCard from './ContentCard';
import { contentApi } from '@/lib/api/endpoints';
import { CardData } from '@/types';
import { toast } from '@/lib/utils/toast';

export default function AppContainer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<CardData[]>([]);

  const handleParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const tempId = Math.random().toString(36).substring(7);
    setLoading(true);

    try {
      const response = await contentApi.parseUrl(url);
      
      // Convert summary string to array (split by newlines or periods)
      const summaryArray = response.summary
        ? response.summary.split(/\n+|\.\s+/).filter(s => s.trim().length > 0)
        : [];
      
      const newCard: CardData = {
        id: response.id,
        url: response.originalUrl,
        status: 'DISPLAY_READY',
        timestamp: new Date().toISOString(),
        title: response.title,
        author: response.author,
        summary: summaryArray,
        thumbnailUrl: response.thumbnailUrl,
      };

      setCards(prev => [newCard, ...prev]);
      setUrl('');
      toast.success("Content parsed successfully");
    } catch (error: any) {
      console.error(error);
      const errorCard: CardData = {
        id: tempId,
        url: url,
        status: 'PARSING_FAILED',
        timestamp: new Date().toISOString(),
      };
      setCards(prev => [errorCard, ...prev]);
      toast.error(error.message || "Failed to parse URL");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      {/* Hero Section - Base Style */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium bg-primary/10 text-primary">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          AI-powered content analysis
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
          VIBE <br className="hidden sm:block" />
          <span className="text-primary">SUMMARIZER.</span>
        </h1>
        
        <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
          Paste a YouTube or Twitter link to get an instant AI summary.
        </p>
      </div>

      {/* Search Form - Base Style */}
      <form onSubmit={handleParse} className="relative mb-16">
        <div className="relative flex items-center">
          <Search className="absolute left-5 text-muted-foreground h-5 w-5" />
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=..."
            className="pl-14 pr-36 h-16 text-lg rounded-full border-0 bg-background shadow-xl focus:ring-2 focus:ring-primary focus:shadow-2xl transition-all duration-300"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
          />
          <Button 
            type="submit" 
            className="absolute right-2 rounded-full h-12 px-8 text-base font-medium bg-primary hover:bg-primary/90 transition-all duration-300"
            disabled={loading || !url}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Summarize'}
          </Button>
        </div>
      </form>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card) => (
          <ContentCard key={card.id} data={card} />
        ))}
        {loading && <ContentCard data={{} as any} loading={true} />}
      </div>

      {/* Empty State - Base Style */}
      {cards.length === 0 && !loading && (
        <div className="text-center py-24 rounded-[2rem] bg-muted/30 shadow-inner">
          <p className="text-muted-foreground text-lg">No summaries yet. Start by pasting a link above!</p>
        </div>
      )}
    </div>
  );
}