/**
 * 简单页面布局组件
 * 
 * 通用的页面布局，不包含侧边栏或导航
 * 适用于大部分功能页面
 */

"use client";

import { ReactNode } from "react";

interface SimplePageProps {
  children: ReactNode;
  title: string;
  description?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const maxWidthClasses = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  "2xl": "max-w-7xl",
  full: "max-w-full",
};

export function SimplePage({
  children,
  title,
  description,
  maxWidth = "lg",
}: SimplePageProps) {
  return (
    <div className="flex min-h-screen bg-[#f9f9f9]">
      <main className="flex-1 p-6 md:p-12 lg:p-16">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>
          {/* Header */}
          {(title || description) && (
            <div className="mb-12">
              {title && (
                <h1 className="text-4xl font-black tracking-tighter uppercase mb-4">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-muted-foreground text-lg">{description}</p>
              )}
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </main>
    </div>
  );
}
