import { apiClient } from "./client";
import { VideoMetadata, AnalysisResult, HistoryItem } from "@/types/video";

export const videoApi = {
  getMetadata: (url: string) => 
    apiClient.post<VideoMetadata>("/v1/videos/metadata", { url }),
  
  analyze: (videoId: string, targetLanguage: string) =>
    apiClient.post<{ jobId: string; status: string }>("/v1/videos/analyze", { videoId, targetLanguage }),
  
  getResult: (jobId: string) =>
    apiClient.get<AnalysisResult>(`/v1/videos/result/${jobId}`),
  
  getHistory: () =>
    apiClient.get<{ items: HistoryItem[] }>("/v1/history"),
  
  export: (videoId: string, format: 'pdf' | 'markdown') =>
    apiClient.post<{ downloadUrl: string; fileName: string }>("/v1/videos/export", { videoId, format }),
};

// Keep existing contentApi for backward compatibility
export const contentApi = {
  parseUrl: (url: string) =>
    apiClient.post<any>("/parse", { url }),
};