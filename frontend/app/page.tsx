"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/utils/toast";

export default function Home() {
  const handleToast = (type: "success" | "error" | "info" | "warning") => {
    switch (type) {
      case "success":
        toast.success("操作成功！", {
          description: "这是一条成功提示消息",
        });
        break;
      case "error":
        toast.error("操作失败", {
          description: "请检查网络连接或稍后重试",
        });
        break;
      case "info":
        toast.info("提示信息", {
          description: "这是一条信息提示",
        });
        break;
      case "warning":
        toast.warning("警告", {
          description: "请注意相关操作",
        });
        break;
    }
  };

  const handlePromiseToast = async () => {
    const promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        Math.random() > 0.5 ? resolve("成功") : reject("失败");
      }, 2000);
    });

    toast.promise(promise, {
      loading: "处理中...",
      success: (data) => `操作成功: ${data}`,
      error: (error) => `操作失败: ${error}`,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-8 px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            VibeFlow Frontend
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Next.js + Tailwind CSS + shadcn/ui 已成功配置
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button>默认按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="destructive">危险按钮</Button>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Toast 示例</h2>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={() => handleToast("success")} variant="default">
              成功 Toast
            </Button>
            <Button onClick={() => handleToast("error")} variant="destructive">
              错误 Toast
            </Button>
            <Button onClick={() => handleToast("info")} variant="secondary">
              信息 Toast
            </Button>
            <Button onClick={() => handleToast("warning")} variant="outline">
              警告 Toast
            </Button>
            <Button onClick={handlePromiseToast} variant="ghost">
              Promise Toast
            </Button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 text-lg font-semibold">Next.js</h3>
            <p className="text-sm text-muted-foreground">
              使用最新的 App Router 和 React Server Components
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 text-lg font-semibold">Tailwind CSS</h3>
            <p className="text-sm text-muted-foreground">
              使用 Tailwind CSS v4 进行样式设计
            </p>
          </div>
          <div className="rounded-lg border bg-card p-6 text-card-foreground">
            <h3 className="mb-2 text-lg font-semibold">shadcn/ui</h3>
            <p className="text-sm text-muted-foreground">
              可复用的高质量组件库
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
