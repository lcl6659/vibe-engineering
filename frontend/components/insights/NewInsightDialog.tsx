"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insightApi, translationApi } from "@/lib/api/endpoints";
import { TranslateResponse } from "@/lib/api/types";
import { toast } from "sonner";
import { Lightbulb, Languages } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewInsightDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  onTranslationComplete?: (result: TranslateResponse) => void;
}

type ProcessMode = "insight" | "translate";

/**
 * NewInsightDialog Component
 * Dialog for creating a new insight parsing task or translation
 */
export function NewInsightDialog({
  open,
  onOpenChange,
  onSuccess,
  onTranslationComplete,
}: NewInsightDialogProps) {
  const [mode, setMode] = useState<ProcessMode>("insight");
  const [sourceUrl, setSourceUrl] = useState("");
  const [targetLang, setTargetLang] = useState("zh");
  const [enableDualSubs, setEnableDualSubs] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sourceUrl.trim()) {
      toast.error("请输入内容链接");
      return;
    }

    try {
      setIsLoading(true);

      if (mode === "translate") {
        // 翻译模式
        const response = await translationApi.translate({
          youtube_url: sourceUrl,
          target_language: targetLang,
          enable_dual_subtitles: enableDualSubs,
        });

        if (response.status === "success") {
          toast.success("翻译完成！");
          // 关闭当前对话框
          setSourceUrl("");
          setTargetLang("zh");
          setEnableDualSubs(true);
          onOpenChange(false);
          // 调用回调显示翻译结果
          onTranslationComplete?.(response);
          return;
        } else {
          toast.error(response.message || "翻译失败");
          setIsLoading(false);
          return;
        }
      } else {
        // 解析模式
        const response = await insightApi.createInsight({
          source_url: sourceUrl,
          target_lang: targetLang,
        });
        toast.success(response.message || "解析任务已创建");
      }

      setSourceUrl("");
      setTargetLang("zh");
      setEnableDualSubs(true);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to process:", error);
      toast.error(mode === "translate" ? "翻译失败，请重试" : "创建失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">新建任务</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            输入 YouTube{mode === "insight" ? "、Twitter 或播客" : ""}链接开始{mode === "insight" ? "解析" : "翻译"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* 模式选择 */}
          <div className="space-y-2">
            <Label>处理模式</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("insight")}
                disabled={isLoading}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all",
                  mode === "insight"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Lightbulb className="h-4 w-4" />
                <span className="font-medium">AI 解析</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("translate")}
                disabled={isLoading}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all",
                  mode === "translate"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Languages className="h-4 w-4" />
                <span className="font-medium">字幕翻译</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="source-url">内容链接</Label>
            <Input
              id="source-url"
              type="url"
              placeholder="https://youtube.com/watch?v=..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              className="h-12 rounded-lg bg-muted focus:bg-background transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-lang">目标语言</Label>
            <select
              id="target-lang"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full h-12 rounded-lg bg-muted px-4 text-base focus:bg-background focus:outline-none transition-colors"
              disabled={isLoading}
            >
              <option value="zh">中文 (Chinese)</option>
              <option value="en">English (英文)</option>
              <option value="ja">日本語 (Japanese)</option>
              <option value="ko">한국어 (Korean)</option>
            </select>
          </div>

          {/* 翻译模式下的中英对照选项 */}
          {mode === "translate" && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <input
                type="checkbox"
                id="dual-subs"
                checked={enableDualSubs}
                onChange={(e) => setEnableDualSubs(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
                disabled={isLoading}
              />
              <Label htmlFor="dual-subs" className="cursor-pointer font-normal">
                启用中英对照（并排显示原文和译文）
              </Label>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
              className="rounded-lg"
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isLoading ? "处理中..." : mode === "insight" ? "开始解析" : "开始翻译"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
