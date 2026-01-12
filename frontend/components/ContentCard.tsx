import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle, User, Youtube, Twitter } from "lucide-react";
import { CardData } from "@/types";

interface ContentCardProps {
  data: CardData;
  loading?: boolean;
  error?: string;
  onRetry?: (id: string, url: string) => void;
}

export default function ContentCard({ data, loading, error, onRetry }: ContentCardProps) {
  if (loading) {
    return (
      <Card className="w-full overflow-hidden border-0 shadow-xl rounded-[2rem] bg-background">
        <div className="h-48 w-full animate-skeleton rounded-t-[2rem]" />
        <CardHeader className="space-y-3">
          <div className="h-6 w-3/4 animate-skeleton rounded-full" />
          <div className="h-4 w-1/4 animate-skeleton rounded-full" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 w-full animate-skeleton rounded-full" />
          <div className="h-4 w-full animate-skeleton rounded-full" />
          <div className="h-4 w-2/3 animate-skeleton rounded-full" />
        </CardContent>
      </Card>
    );
  }

  if (error || !data || data.status === 'PARSING_FAILED') {
    return (
      <Card className="w-full border-0 shadow-xl rounded-[2rem] bg-destructive/5">
        <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-4">
          <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="font-bold text-lg text-destructive">Parsing Failed</p>
            <p className="text-sm text-muted-foreground max-w-xs">{error || "We couldn't process this URL. Please check if it's a valid YouTube or Twitter link."}</p>
          </div>
          <div className="flex gap-3 items-center">
            {data?.url && (
              <a 
                href={data.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline transition-all"
              >
                View Original Link →
              </a>
            )}
            {onRetry && data?.id && data?.url && (
              <button
                onClick={() => onRetry(data.id, data.url)}
                className="text-sm font-medium text-primary hover:underline transition-all"
              >
                Retry
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const isYoutube = data.url.includes('youtube.com') || data.url.includes('youtu.be');

  return (
    <Card className="w-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-[2rem] bg-background group">
      <a 
        href={data.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative"
      >
        <div className="h-48 bg-muted flex items-center justify-center overflow-hidden relative rounded-t-[2rem]">
          {data.thumbnailUrl ? (
            <>
              <img 
                src={data.thumbnailUrl} 
                alt={data.title || "Content thumbnail"}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
              <div className="flex flex-col items-center text-muted-foreground z-10">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {isYoutube ? <Youtube size={32} className="text-primary" /> : <Twitter size={32} className="text-primary" />}
                </div>
                <span className="text-xs font-medium">Preview available at source</span>
              </div>
            </>
          )}
        </div>
      </a>
      
      <CardHeader className="pb-3 pt-5">
        <div className="flex justify-between items-start gap-3">
          <a 
            href={data.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors duration-200"
          >
            <CardTitle className="text-xl font-bold leading-tight line-clamp-2 tracking-tight">
              {data.title || "Untitled Content"}
            </CardTitle>
          </a>
          <Badge variant="secondary" className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold">
            {isYoutube ? 'YouTube' : 'Twitter'}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-2">
          <User className="h-4 w-4 mr-2" />
          <span className="font-medium">{data.author || "Unknown Author"}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {data.summary?.map((point, idx) => (
            <div key={idx} className="flex gap-3 text-sm text-muted-foreground">
              <span className="text-primary font-bold text-lg leading-none">•</span>
              <p className="leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 pt-5 border-t border-border flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Parsed {new Date(data.timestamp).toLocaleDateString()}
          </span>
          <a 
            href={data.url}
            target="_blank"
            rel="noopener noreferrer" 
            className="text-xs font-semibold text-primary hover:underline"
          >
            View source →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}