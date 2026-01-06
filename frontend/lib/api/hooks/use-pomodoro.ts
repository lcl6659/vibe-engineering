/**
 * Pomodoro React Hook
 * 提供便捷的 React Hook 来使用 Pomodoro 服务
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { pomodoroService, ApiError } from "../index";
import type { Pomodoro, CreatePomodoroRequest, UpdatePomodoroRequest } from "../services/pomodoro.service";

/**
 * 使用 Pomodoro 列表的 Hook
 */
export function usePomodoros() {
  const [pomodoros, setPomodoros] = useState<Pomodoro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPomodoros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pomodoroService.list();
      setPomodoros(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch pomodoros"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPomodoros();
  }, [fetchPomodoros]);

  return {
    pomodoros,
    loading,
    error,
    refetch: fetchPomodoros,
  };
}

/**
 * 使用单个 Pomodoro 的 Hook
 */
export function usePomodoro(id: string | number | null) {
  const [pomodoro, setPomodoro] = useState<Pomodoro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPomodoro = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await pomodoroService.getById(id);
      setPomodoro(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch pomodoro"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPomodoro();
  }, [fetchPomodoro]);

  return {
    pomodoro,
    loading,
    error,
    refetch: fetchPomodoro,
  };
}

/**
 * 创建 Pomodoro 的 Hook
 */
export function useCreatePomodoro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPomodoro = useCallback(async (data: CreatePomodoroRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await pomodoroService.create(data);
      return result;
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new Error("Failed to create pomodoro");
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createPomodoro,
    loading,
    error,
  };
}

/**
 * 更新 Pomodoro 的 Hook
 */
export function useUpdatePomodoro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updatePomodoro = useCallback(
    async (id: string | number, data: UpdatePomodoroRequest) => {
      try {
        setLoading(true);
        setError(null);
        const result = await pomodoroService.update(id, data);
        return result;
      } catch (err) {
        const apiError = err instanceof ApiError ? err : new Error("Failed to update pomodoro");
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updatePomodoro,
    loading,
    error,
  };
}

/**
 * 删除 Pomodoro 的 Hook
 */
export function useDeletePomodoro() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deletePomodoro = useCallback(async (id: string | number) => {
    try {
      setLoading(true);
      setError(null);
      await pomodoroService.delete(id);
    } catch (err) {
      const apiError = err instanceof ApiError ? err : new Error("Failed to delete pomodoro");
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deletePomodoro,
    loading,
    error,
  };
}

