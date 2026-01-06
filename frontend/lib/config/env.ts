/**
 * 环境配置
 */

/**
 * 环境类型
 */
export type Env = "development" | "production" | "test";

/**
 * 获取环境变量
 */
function getEnv(key: string, defaultValue?: string): string {
  if (typeof window === "undefined") {
    return process.env[key] || defaultValue || "";
  }
  return process.env[`NEXT_PUBLIC_${key}`] || defaultValue || "";
}

/**
 * 环境配置
 */
export const env = {
  // 环境
  NODE_ENV: (process.env.NODE_ENV || "development") as Env,
  IS_DEV: process.env.NODE_ENV === "development",
  IS_PROD: process.env.NODE_ENV === "production",
  IS_TEST: process.env.NODE_ENV === "test",

  // API 配置
  API_URL: getEnv("API_URL", "http://localhost:8080"),
  API_TIMEOUT: Number(getEnv("API_TIMEOUT", "30000")),

  // 应用配置
  APP_NAME: getEnv("APP_NAME", "VibeFlow"),
  APP_VERSION: getEnv("APP_VERSION", "1.0.0"),

  // 功能开关
  ENABLE_ANALYTICS: getEnv("ENABLE_ANALYTICS", "false") === "true",
  ENABLE_DEBUG: getEnv("ENABLE_DEBUG", "false") === "true",
} as const;

/**
 * 验证必需的环境变量
 */
export function validateEnv() {
  const required = ["API_URL"];

  for (const key of required) {
    if (!env[key as keyof typeof env]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
}

// 在开发环境下验证环境变量
if (env.IS_DEV) {
  validateEnv();
}

