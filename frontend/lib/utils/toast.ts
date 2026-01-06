/**
 * Toast 工具函数
 * 封装 sonner 的 toast 方法，提供便捷的调用方式
 */

import { toast as sonnerToast, type ExternalToast } from "sonner";

/**
 * Toast 选项
 */
interface ToastOptions {
  description?: string;
  duration?: number;
  action?: ExternalToast["action"];
  cancel?: ExternalToast["cancel"];
}

/**
 * Toast 工具对象
 */
export const toast = {
  /**
   * 成功提示
   */
  success: (message: string, options?: ToastOptions) =>
    sonnerToast.success(message, options as ExternalToast),

  /**
   * 错误提示
   */
  error: (message: string, options?: ToastOptions) =>
    sonnerToast.error(message, options as ExternalToast),

  /**
   * 信息提示
   */
  info: (message: string, options?: ToastOptions) =>
    sonnerToast.info(message, options as ExternalToast),

  /**
   * 警告提示
   */
  warning: (message: string, options?: ToastOptions) =>
    sonnerToast.warning(message, options as ExternalToast),

  /**
   * 加载提示
   */
  loading: (message: string, options?: ToastOptions) =>
    sonnerToast.loading(message, options as ExternalToast),

  /**
   * 普通提示
   */
  message: (message: string, options?: ToastOptions) =>
    sonnerToast(message, options as ExternalToast),

  /**
   * Promise Toast
   * 自动处理 Promise 状态
   */
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },

  /**
   * 关闭 Toast
   */
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
};

// 导出默认 toast
export default toast;
