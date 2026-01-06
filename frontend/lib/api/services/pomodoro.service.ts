/**
 * Pomodoro API 服务
 */

import { apiClient } from "../client";
import { API_ENDPOINTS } from "../config";
import { ApiResponse, PaginatedResponse } from "../types";

/**
 * Pomodoro 模型
 */
export interface Pomodoro {
  id: number;
  start_time: string;
  end_time: string;
  is_completed: boolean;
  duration: number; // 分钟
  created_at: string;
  updated_at: string;
}

/**
 * 创建 Pomodoro 请求参数
 */
export interface CreatePomodoroRequest {
  start_time: string;
  end_time: string;
  duration: number;
  is_completed?: boolean;
}

/**
 * 更新 Pomodoro 请求参数
 */
export interface UpdatePomodoroRequest {
  start_time?: string;
  end_time?: string;
  duration?: number;
  is_completed?: boolean;
}

/**
 * Pomodoro 服务类
 */
class PomodoroService {
  /**
   * 创建 Pomodoro
   */
  async create(data: CreatePomodoroRequest): Promise<Pomodoro> {
    const response = await apiClient.post<ApiResponse<Pomodoro>>(
      API_ENDPOINTS.POMODORO.CREATE,
      data
    );
    return response.data || (response as unknown as Pomodoro);
  }

  /**
   * 获取 Pomodoro 列表
   */
  async list(params?: {
    page?: number;
    pageSize?: number;
    is_completed?: boolean;
  }): Promise<Pomodoro[] | PaginatedResponse<Pomodoro>> {
    const response = await apiClient.get<ApiResponse<Pomodoro[]>>(
      API_ENDPOINTS.POMODORO.LIST,
      { params }
    );
    return response.data || (response as unknown as Pomodoro[]);
  }

  /**
   * 根据 ID 获取 Pomodoro
   */
  async getById(id: string | number): Promise<Pomodoro> {
    const response = await apiClient.get<ApiResponse<Pomodoro>>(
      API_ENDPOINTS.POMODORO.GET(id)
    );
    return response.data || (response as unknown as Pomodoro);
  }

  /**
   * 更新 Pomodoro
   */
  async update(
    id: string | number,
    data: UpdatePomodoroRequest
  ): Promise<Pomodoro> {
    const response = await apiClient.put<ApiResponse<Pomodoro>>(
      API_ENDPOINTS.POMODORO.UPDATE(id),
      data
    );
    return response.data || (response as unknown as Pomodoro);
  }

  /**
   * 删除 Pomodoro
   */
  async delete(id: string | number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.POMODORO.DELETE(id));
  }
}

// 导出单例实例
export const pomodoroService = new PomodoroService();

// 导出类以便需要时可以创建新实例
export default PomodoroService;

