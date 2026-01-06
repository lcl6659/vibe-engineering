/**
 * 主布局组件
 */

"use client";

import { ReactNode } from "react";

interface MainLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  sidebar?: ReactNode;
}

export function MainLayout({
  children,
  header,
  footer,
  sidebar,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {header && <header>{header}</header>}
      <div className="flex flex-1">
        {sidebar && <aside className="w-64">{sidebar}</aside>}
        <main className="flex-1">{children}</main>
      </div>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}

