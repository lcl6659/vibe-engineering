/**
 * 本地存储 Hook
 */

import { useState, useEffect } from "react";
import { getStorageItem, setStorageItem } from "@/lib/utils/storage";

/**
 * 本地存储 Hook
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // 初始化状态
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = getStorageItem<T>(key, null);
      return item ?? initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 返回包装的 setter 函数，持久化新值到 localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // 允许值是一个函数，这样我们就可以有与 useState 相同的 API
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== "undefined") {
        setStorageItem(key, valueToStore);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

