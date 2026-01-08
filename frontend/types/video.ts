export interface VideoMetadata {
  videoId: string;
  title: string;
  author: string;
  thumbnailUrl: string;
  duration: number;
}

export interface Chapter {
  title: string;
  timestamp: string;
  seconds: number;
}

export interface TranscriptItem {
  text: string;
  timestamp: string;
  seconds: number;
}

export interface AnalysisResult {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  summary?: string;
  keyPoints?: string[];
  chapters?: Chapter[];
  transcription?: TranscriptItem[];
}

export interface HistoryItem {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
}