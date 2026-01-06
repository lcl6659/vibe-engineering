/**
 * 全局类型定义
 */

/**
 * 通用响应类型
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp?: number;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * 用户信息类型
 */
export interface User {
  id: string | number;
  username: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 文件上传类型
 */
export interface UploadFile {
  file: File;
  url?: string;
  progress?: number;
  status?: "uploading" | "success" | "error";
}

/**
 * 选择项类型
 */
export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * 表格列配置类型
 */
export interface TableColumn<T = unknown> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  width?: number | string;
  align?: "left" | "center" | "right";
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  fixed?: "left" | "right";
}

/**
 * 菜单项类型
 */
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  disabled?: boolean;
  hidden?: boolean;
}

/**
 * 主题类型
 */
export type Theme = "light" | "dark" | "system";

/**
 * 语言类型
 */
export type Language = "zh-CN" | "en-US";

