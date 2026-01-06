/**
 * 404 页面
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-6xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            页面未找到
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            抱歉，您访问的页面不存在或已被移除。
          </p>
          <div className="flex justify-center gap-2">
            <Button asChild>
              <Link href="/">返回首页</Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              返回上一页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

