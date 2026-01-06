/**
 * 全局错误页面
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>出现错误</CardTitle>
          <CardDescription>
            应用程序遇到了一个错误，请尝试刷新页面。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-mono text-destructive">
                {error.message}
              </p>
            </div>
          )}
          {error.digest && (
            <p className="text-xs text-muted-foreground">
              错误 ID: {error.digest}
            </p>
          )}
          <div className="flex gap-2">
            <Button onClick={reset} variant="default">
              重试
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
            >
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

