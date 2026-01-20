/**
 * Route Registry - 路由注册表
 *
 * 这是项目的路由单一真相来源 (Single Source of Truth)
 * 所有需要路由信息的组件（如 Sidebar、Header、Breadcrumb）都应该从这里导入
 *
 * 当使用 /agent-fe 创建新页面时，必须同时在这里添加路由配置
 *
 * @example
 * import { routes, getNavRoutes } from '@/lib/routes';
 * const navItems = getNavRoutes();
 */

import { LucideIcon, ShieldCheck, Lightbulb, Home, Video } from "lucide-react";

/**
 * 路由配置项类型定义
 */
export interface RouteConfig {
  /** 路由唯一标识符 */
  id: string;
  /** 显示标签 */
  label: string;
  /** 路由路径 */
  href: string;
  /** Lucide 图标组件 */
  icon: LucideIcon;
  /** 是否在导航中显示 */
  showInNav: boolean;
  /** 导航排序顺序（数字越小越靠前） */
  order: number;
  /** 可选的描述信息 */
  description?: string;
}

/**
 * 路由注册表
 *
 * 添加新页面时，在此处添加路由配置：
 * 1. id: 与路径保持一致（如 '/insights' -> 'insights'）
 * 2. label: 导航菜单显示的文字
 * 3. href: 页面路径
 * 4. icon: 从 lucide-react 导入的图标
 * 5. showInNav: 是否在侧边栏显示
 * 6. order: 菜单排序顺序
 */
export const routes: RouteConfig[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
    icon: Home,
    showInNav: false, // 首页通过 Logo 访问，不在导航中显示
    order: 0,
  },
  {
    id: 'auth',
    label: 'Authorization',
    href: '/auth',
    icon: ShieldCheck,
    showInNav: true,
    order: 10,
    description: 'YouTube API 授权管理',
  },
  {
    id: 'insights',
    label: 'Insights',
    href: '/insights',
    icon: Lightbulb,
    showInNav: true,
    order: 20,
    description: 'AI 灵感解析工作台（含翻译功能）',
  },
  {
    id: 'room',
    label: 'Video Room',
    href: '/room',
    icon: Video,
    showInNav: true,
    order: 30,
    description: '实时视频会议室',
  },
];

/**
 * 获取导航菜单路由（按 order 排序）
 */
export function getNavRoutes(): RouteConfig[] {
  return routes
    .filter(route => route.showInNav)
    .sort((a, b) => a.order - b.order);
}

/**
 * 根据 ID 获取路由配置
 */
export function getRouteById(id: string): RouteConfig | undefined {
  return routes.find(route => route.id === id);
}

/**
 * 根据路径获取路由配置
 */
export function getRouteByPath(path: string): RouteConfig | undefined {
  return routes.find(route => route.href === path);
}

/**
 * 检查路径是否匹配路由（支持动态路由）
 */
export function isPathActive(currentPath: string, routePath: string): boolean {
  if (routePath === '/') {
    return currentPath === '/';
  }
  return currentPath.startsWith(routePath);
}
