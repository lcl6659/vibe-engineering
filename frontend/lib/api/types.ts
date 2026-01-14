/**
 * API 类型定义
 */

/**
 * API 响应基础结构
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 分页响应结构
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 请求配置
 */
export interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

/**
 * HTTP 错误类
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
    message?: string
  ) {
    super(message || statusText);
    this.name = "ApiError";
  }
}

/**
 * 请求选项
 */
export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  params?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
}

/**
 * Insight 相关类型定义
 */

export type InsightSourceType = "youtube" | "twitter" | "podcast";
export type InsightStatus = "pending" | "processing" | "completed" | "failed";

export interface Insight {
  id: number;
  source_type: InsightSourceType;
  source_url: string;
  title: string;
  author: string;
  thumbnail_url: string;
  status: InsightStatus;
  target_lang: string;
  created_at: string;
  updated_at: string;
}

export interface GroupedInsights {
  today: Insight[];
  yesterday: Insight[];
  previous: Insight[];
}

export interface InsightsListResponse {
  data: GroupedInsights;
  total: number;
}

export interface CreateInsightRequest {
  source_url: string;
  target_lang?: string;
}

export interface CreateInsightResponse {
  id: number;
  status: InsightStatus;
  message: string;
}

