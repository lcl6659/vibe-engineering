/**
 * 应用常量配置
 */

/**
 * 应用信息
 */
export const APP_CONFIG = {
  name: "VibeFlow",
  version: "1.0.0",
  description: "VibeFlow AI-Native Development Workflow",
} as const;

/**
 * 路由路径
 */
export const ROUTES = {
  HOME: "/",
  // 在这里添加更多路由
} as const;

/**
 * 本地存储键名
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: "auth_token",
  USER_INFO: "user_info",
  THEME: "theme",
  LANGUAGE: "language",
} as const;

/**
 * HTTP 状态码
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * 分页默认配置
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

/**
 * 日期时间格式
 */
export const DATE_FORMAT = {
  DATE: "yyyy-MM-dd",
  DATETIME: "yyyy-MM-dd HH:mm:ss",
  TIME: "HH:mm:ss",
  MONTH: "yyyy-MM",
  YEAR: "yyyy",
} as const;

/**
 * 文件上传配置
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/gif", "application/pdf"],
} as const;

/**
 * 验证规则
 */
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^1[3-9]\d{9}$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
} as const;

/**
 * 防抖/节流延迟时间（毫秒）
 */
export const DEBOUNCE_DELAY = {
  SEARCH: 300,
  INPUT: 500,
  SCROLL: 100,
  RESIZE: 200,
} as const;

