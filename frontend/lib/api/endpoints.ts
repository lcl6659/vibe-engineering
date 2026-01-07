import { apiClient } from "./client";
import { CardData } from "@/types";

export interface ParseRequest {
  url: string;
}

export interface ParseResponse {
  id: string;
  source: "youtube" | "twitter";
  title: string;
  author: string;
  summary: string; // Backend returns string, not array
  thumbnailUrl: string;
  originalUrl: string;
  metadata?: {
    publishedAt?: string;
  };
}

export const contentApi = {
  parseUrl: (url: string) =>
    apiClient.post<ParseResponse>("/parse", { url }),
};