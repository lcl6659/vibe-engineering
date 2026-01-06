/**
 * 日期时间工具函数
 */

import { format, parseISO, isValid, differenceInDays, differenceInHours, differenceInMinutes } from "date-fns";
import { zhCN } from "date-fns/locale";
import { DATE_FORMAT } from "@/lib/constants";

/**
 * 格式化日期
 */
export function formatDate(
  date: Date | string | number,
  pattern: string = DATE_FORMAT.DATE
): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) return "";
    return format(dateObj, pattern, { locale: zhCN });
  } catch {
    return "";
  }
}

/**
 * 格式化日期时间
 */
export function formatDateTime(
  date: Date | string | number,
  pattern: string = DATE_FORMAT.DATETIME
): string {
  return formatDate(date, pattern);
}

/**
 * 格式化时间
 */
export function formatTime(
  date: Date | string | number,
  pattern: string = DATE_FORMAT.TIME
): string {
  return formatDate(date, pattern);
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(date: Date | string | number): string {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) return "";

    const now = new Date();
    const days = differenceInDays(now, dateObj);
    const hours = differenceInHours(now, dateObj);
    const minutes = differenceInMinutes(now, dateObj);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;

    return formatDate(dateObj, DATE_FORMAT.DATE);
  } catch {
    return "";
  }
}

/**
 * 判断是否为今天
 */
export function isToday(date: Date | string | number): boolean {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) return false;

    const today = new Date();
    return formatDate(dateObj, DATE_FORMAT.DATE) === formatDate(today, DATE_FORMAT.DATE);
  } catch {
    return false;
  }
}

/**
 * 判断是否为昨天
 */
export function isYesterday(date: Date | string | number): boolean {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    if (!isValid(dateObj)) return false;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(dateObj, DATE_FORMAT.DATE) === formatDate(yesterday, DATE_FORMAT.DATE);
  } catch {
    return false;
  }
}

/**
 * 获取日期范围
 */
export function getDateRange(days: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

/**
 * 判断日期是否在范围内
 */
export function isDateInRange(
  date: Date | string | number,
  start: Date | string | number,
  end: Date | string | number
): boolean {
  try {
    const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
    const startObj = typeof start === "string" ? parseISO(start) : new Date(start);
    const endObj = typeof end === "string" ? parseISO(end) : new Date(end);

    if (!isValid(dateObj) || !isValid(startObj) || !isValid(endObj)) {
      return false;
    }

    return dateObj >= startObj && dateObj <= endObj;
  } catch {
    return false;
  }
}

