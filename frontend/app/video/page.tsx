"use client";

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import SearchInputGroup from "@/components/SearchInputGroup";
import MetadataCard from "@/components/MetadataCard";
import { youtubeApi } from "@/lib/api/endpoints";
import { YoutubeMetadata } from "@/types/video";
import { toast } from "@/lib/utils/toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function VideoPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<(YoutubeMetadata & { cached: boolean }) | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await youtubeApi.getVideo(query);
      setVideoData(data);
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
      title="Video Intelligence"
      description="Extract structured data directly from YouTube Data API v3."
    >
      <div className="space-y-10">
        <SearchInputGroup
          value={query}
          onChange={setQuery}
          onSearch={handleSearch}
          loading={loading}
          error={!!error}
          placeholder="Enter YouTube video URL or ID"
        />

        {error && (
          <Alert variant="destructive" className="rounded-xl border-0 bg-destructive/10 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <MetadataCard data={videoData} loading={loading} />
        </div>
      </div>
    </DashboardLayout>
  );
}
