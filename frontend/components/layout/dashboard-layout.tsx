/**
 * Dashboard 共享布局组件 (已废弃 - 不要使用)
 * 
 * ⚠️ 警告：此组件包含全局导航侧边栏，不应在新页面中使用
 * 
 * 项目要求：不要在功能页面中添加侧边栏
 * 请使用 SimplePage 或 MainLayout 组件代替
 * 
 * @deprecated 请使用不带侧边栏的布局组件
 */

"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function DashboardLayout({
  children,
  title,
  description,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <Sidebar />
      <main className="flex-1 p-6 md:p-12 lg:p-16">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg">{description}</p>
          </div>

          {/* Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
