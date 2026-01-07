import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, AlertCircle, User, Youtube, Twitter } from "lucide-react";
import { CardData } from "@/types";

interface ContentCardProps {
  data: CardData;
  loading?: boolean;
  error?: string;
}

export default function ContentCard({ data, loading, error }: ContentCardProps) {
  if (loading) {
    return (
      <Card className="w-full overflow-hidden border-slate-200">
        <div className="h-48 w-full animate-skeleton" />
        <CardHeader className="space-y-2">
          <div className="h-6 w-3/4 animate-skeleton rounded" />
          <div className="h-4 w-1/4 animate-skeleton rounded" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-4 w-full animate-skeleton rounded" />
          <div className="h-4 w-full animate-skeleton rounded" />
          <div className="h-4 w-2/3 animate-skeleton rounded" />
        </CardContent>
      </Card>
    );
  }

  if (error || data.status === 'PARSING_FAILED') {
    return (
      <Card className="w-full border-destructive/50 bg-destructive/5">
        <CardContent className="pt-6 flex flex-col items-center text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="space-y-1">
            <p className="font-semibold text-destructive">Parsing Failed</p>
            <p className="text-sm text-muted-foreground">{error || "We couldn't process this URL. Please check if it's a valid YouTube or Twitter link."}</p>
          </div>
          <a 
            href={data.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs underline text-muted-foreground hover:text-primary"
          >
            View Original Link
          </a>
        </CardContent>
      </Card>
    );
  }

  const isYoutube = data.url.includes('youtube.com') || data.url.includes('youtu.be');

  return (
    <Card className="w-full overflow-hidden transition-all hover:shadow-md border-slate-200">
      <a 
        href={data.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block relative group"
      >
        <div className="h-48 bg-slate-100 flex items-center justify-center overflow-hidden relative">
          {data.thumbnailUrl ? (
            <>
              <img 
                src={data.thumbnailUrl} 
                alt={data.title || "Content thumbnail"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center hidden">
                <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <ExternalLink className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="flex flex-col items-center text-slate-400">
                {isYoutube ? <Youtube size={48} /> : <Twitter size={48} />}
                <span className="text-xs mt-2">Preview available at source</span>
              </div>
            </>
          )}
        </div>
      </a>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <a 
            href={data.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            <CardTitle className="text-lg leading-tight line-clamp-2">
              {data.title || "Untitled Content"}
            </CardTitle>
          </a>
          <Badge variant="secondary" className="shrink-0">
            {isYoutube ? 'YouTube' : 'Twitter'}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mt-1">
          <User className="h-3 w-3 mr-1" />
          <span>{data.author || "Unknown Author"}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {data.summary?.map((point, idx) => (
            <div key={idx} className="flex gap-2 text-sm text-slate-600">
              <span className="text-primary font-bold">•</span>
              <p>{point}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
            Parsed {new Date(data.timestamp).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}