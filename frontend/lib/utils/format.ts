/**
 * 格式化工具函数
 */

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化数字（添加千分位）
 */
export function formatNumber(num: number | string): string {
  return Number(num).toLocaleString();
}

/**
 * 格式化货币
 */
export function formatCurrency(
  amount: number | string,
  currency: string = "CNY"
): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
  }).format(Number(amount));
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * 格式化手机号（中间四位隐藏）
 */
export function formatPhone(phone: string): string {
  if (!phone || phone.length !== 11) return phone;
  return `${phone.slice(0, 3)}****${phone.slice(7)}`;
}

/**
 * 格式化邮箱（部分隐藏）
 */
export function formatEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [username, domain] = email.split("@");
  if (username.length <= 2) return email;
  const masked = `${username.slice(0, 2)}***${username.slice(-1)}`;
  return `${masked}@${domain}`;
}

/**
 * 截断文本
 */
export function truncateText(
  text: string,
  maxLength: number,
  suffix: string = "..."
): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}${suffix}`;
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const target = new Date(date);
  const diff = now.getTime() - target.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "刚刚";
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;

  return target.toLocaleDateString("zh-CN");
}

