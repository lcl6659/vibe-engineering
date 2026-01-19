"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, X } from "lucide-react";
import { TranslateResponse, DualSubtitle } from "@/lib/api/types";

interface TranslationResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: TranslateResponse | null;
}

/**
 * TranslationResultDialog Component
 * Displays translation results in a dialog
 */
export function TranslationResultDialog({
  open,
  onOpenChange,
  result,
}: TranslationResultDialogProps) {
  if (!result) return null;

  const handleDownload = () => {
    if (!result.dual_subtitles) return;

    // 生成 SRT 格式的字幕文件
    let srtContent = "";
    result.dual_subtitles.forEach((sub, index) => {
      srtContent += `${index + 1}\n`;
      srtContent += `${sub.start_time} --> ${sub.end_time}\n`;
      srtContent += `${sub.original}\n`;
      srtContent += `${sub.translated}\n\n`;
    });

    // 下载文件
    const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translation_${Date.now()}.srt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] rounded-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">翻译完成</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {result.source_language && (
                    <span>
                      检测到源语言：
                      {result.source_language === "en"
                        ? "英文 (English)"
                        : result.source_language === "zh"
                        ? "中文 (Chinese)"
                        : result.source_language === "ja"
                        ? "日本語 (Japanese)"
                        : result.source_language}
                    </span>
                  )}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {result.dual_subtitles && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载字幕
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 overflow-y-auto max-h-[60vh]">
          {/* 双语字幕显示 */}
          {result.dual_subtitles && result.dual_subtitles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold mb-4">中英对照字幕</h3>
              {result.dual_subtitles.map((subtitle, index) => (
                <SubtitleRow key={index} subtitle={subtitle} />
              ))}
            </div>
          )}

          {/* 纯文本翻译显示 */}
          {result.translated_text && !result.dual_subtitles && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">翻译结果</h3>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {result.translated_text}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * SubtitleRow Component
 * Displays a single bilingual subtitle entry
 */
function SubtitleRow({ subtitle }: { subtitle: DualSubtitle }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr] gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      {/* 时间戳 */}
      {subtitle.start_time && (
        <div className="flex items-center">
          <span className="text-xs font-mono text-muted-foreground bg-background px-2 py-1 rounded">
            {subtitle.start_time}
          </span>
        </div>
      )}

      {/* 原文 */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">原文</p>
        <p className="text-sm leading-relaxed">{subtitle.original}</p>
      </div>

      {/* 译文 */}
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground font-medium">译文</p>
        <p className="text-sm leading-relaxed text-primary font-medium">
          {subtitle.translated}
        </p>
      </div>
    </div>
  );
}
