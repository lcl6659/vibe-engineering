/**
 * Dashboard 共享布局组件
 * Sidebar 只挂载一次，避免重复 API 调用
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
