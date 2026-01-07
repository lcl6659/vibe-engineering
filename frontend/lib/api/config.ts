/**
 * API 配置模块
 * 统一管理 API 基础配置
 */

/**
 * API 基础 URL
 * 优先级：环境变量 > 默认值
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * API 请求超时时间（毫秒）
 */
export const API_TIMEOUT = 30000; // 30秒

/**
 * API 版本
 */
export const API_VERSION = "/api";

/**
 * 完整的 API 基础路径
 */
export const API_BASE_PATH = `${API_BASE_URL}${API_VERSION}`;

/**
 * 请求头配置
 */
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/**
 * API 端点配置
 */
export const API_ENDPOINTS = {
  // Pomodoro 相关
  POMODORO: {
    BASE: "/pomodoros",
    CREATE: "/pomodoros",
    LIST: "/pomodoros",
    GET: (id: string | number) => `/pomodoros/${id}`,
    UPDATE: (id: string | number) => `/pomodoros/${id}`,
    DELETE: (id: string | number) => `/pomodoros/${id}`,
  },
} as const;

