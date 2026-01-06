/**
 * 验证工具函数
 */

import { VALIDATION } from "@/lib/constants";

/**
 * 验证邮箱
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION.EMAIL_REGEX.test(email);
}

/**
 * 验证手机号
 */
export function isValidPhone(phone: string): boolean {
  return VALIDATION.PHONE_REGEX.test(phone);
}

/**
 * 验证密码强度
 */
export function isValidPassword(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `密码长度至少为 ${VALIDATION.PASSWORD_MIN_LENGTH} 位`,
    };
  }

  // 检查是否包含数字
  if (!/\d/.test(password)) {
    return {
      valid: false,
      message: "密码必须包含至少一个数字",
    };
  }

  // 检查是否包含字母
  if (!/[a-zA-Z]/.test(password)) {
    return {
      valid: false,
      message: "密码必须包含至少一个字母",
    };
  }

  return { valid: true };
}

/**
 * 验证用户名
 */
export function isValidUsername(username: string): {
  valid: boolean;
  message?: string;
} {
  if (username.length < VALIDATION.USERNAME_MIN_LENGTH) {
    return {
      valid: false,
      message: `用户名长度至少为 ${VALIDATION.USERNAME_MIN_LENGTH} 位`,
    };
  }

  if (username.length > VALIDATION.USERNAME_MAX_LENGTH) {
    return {
      valid: false,
      message: `用户名长度不能超过 ${VALIDATION.USERNAME_MAX_LENGTH} 位`,
    };
  }

  // 只能包含字母、数字、下划线
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      valid: false,
      message: "用户名只能包含字母、数字和下划线",
    };
  }

  return { valid: true };
}

/**
 * 验证 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 验证身份证号（简单验证）
 */
export function isValidIdCard(idCard: string): boolean {
  const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  return regex.test(idCard);
}

/**
 * 验证文件类型
 */
export function isValidFileType(
  file: File,
  allowedTypes: string[]
): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * 验证文件大小
 */
export function isValidFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

