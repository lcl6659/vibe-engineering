import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

/**
 * Base.org 推荐字体配置
 * 
 * 主字体: Inter (作为 Base Sans 的替代)
 * - 现代几何结构
 * - 优化的可读性
 * - 完整的字重支持
 */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  // 支持的字重: Thin(100) 到 Black(900)
  weight: ["100", "300", "400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Network Protocol | Built on Base",
  description: "The next generation of on-chain creativity.",
  keywords: ["Base", "blockchain", "web3", "crypto"],
  authors: [{ name: "Base Team" }],
  openGraph: {
    type: "website",
    title: "Network Protocol | Built on Base",
    description: "The next generation of on-chain creativity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          // 字体变量
          inter.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
