"use client";

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import SearchInputGroup from "@/components/SearchInputGroup";
import { youtubeApi } from "@/lib/api/endpoints";
import { PlaylistVideo } from "@/types/video";
import { toast } from "@/lib/utils/toast";
import { extractPlaylistId } from "@/lib/utils/youtube";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ListVideo } from "lucide-react";

export default function PlaylistPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playlistData, setPlaylistData] = useState<PlaylistVideo[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const playlistId = extractPlaylistId(query);
      if (!playlistId) {
        setError("Invalid playlist URL or ID. Please enter a valid YouTube playlist link.");
        toast.error("Invalid playlist URL or ID");
        setLoading(false);
        return;
      }
      const data = await youtubeApi.getPlaylist(playlistId);
      setPlaylistData(data.items);
    } catch (e: any) {
      const msg = e.status === 401 ? "Authorization required. Please authenticate with Google." :
                  e.status === 404 ? "Resource not found" :
                  e.status === 429 ? "API Quota exhausted" :
                  "Failed to fetch data";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="Playlist Explorer"
      description="Extract structured data directly from YouTube Data API v3."
    >
      <div className="space-y-10">
        <SearchInputGroup
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
          error={!!error}
          placeholder="Enter playlist URL or ID (e.g., PLxxx...)"
        />

        {error && (
          <Alert variant="destructive" className="rounded-xl border-0 bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {playlistData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playlistData.map((item) => (
                <Card key={item.videoId} className="border-0 rounded-xl bg-card hover:bg-muted/50 transition-colors">
                  <CardContent className="p-4 flex gap-4">
                    <img src={item.thumbnailUrl} className="w-24 aspect-video rounded-lg object-cover" alt="" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">ID: {item.videoId}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {playlistData.length === 0 && !loading && !error && (
            <div className="py-20 text-center bg-card rounded-2xl">
              <ListVideo className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No data extracted yet. Enter a valid playlist ID to begin.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
