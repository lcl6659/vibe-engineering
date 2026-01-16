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
import { Switch } from "@/components/ui/switch";
import { insightApi } from "@/lib/api/endpoints";
import { toast } from "sonner";
import { Copy, Check, Link2, Lock, Eye, EyeOff } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insightId: number;
  insightTitle: string;
}

interface ShareConfig {
  includeSummary: boolean;
  includeKeyPoints: boolean;
  includeHighlights: boolean;
  includeChat: boolean;
  isPublic: boolean;
  password: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  insightId,
  insightTitle,
}: ShareDialogProps) {
  const [config, setConfig] = useState<ShareConfig>({
    includeSummary: true,
    includeKeyPoints: true,
    includeHighlights: false,
    includeChat: false,
    isPublic: true,
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleShare = async () => {
    try {
      setIsLoading(true);
      const response = await insightApi.shareInsight(insightId, {
        include_summary: config.includeSummary,
        include_key_points: config.includeKeyPoints,
        include_highlights: config.includeHighlights,
        include_chat: config.includeChat,
        is_public: config.isPublic,
        password: config.password || undefined,
      });

      const fullUrl = `${window.location.origin}/share/${response.share_token}`;
      setShareUrl(fullUrl);
      toast.success("分享链接已生成");
    } catch (error) {
      console.error("Failed to share insight:", error);
      toast.error("生成分享链接失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("链接已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("复制失败，请手动复制");
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    onOpenChange(false);
  };

  const updateConfig = (key: keyof ShareConfig, value: boolean | string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setShareUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            分享笔记
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {insightTitle.length > 50
              ? `${insightTitle.substring(0, 50)}...`
              : insightTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 分享内容配置 */}
          <div className="space-y-4">
            <Label className="text-base font-medium">分享内容</Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="summary" className="text-sm">
                    AI 摘要
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    包含内容总结
                  </p>
                </div>
                <Switch
                  id="summary"
                  checked={config.includeSummary}
                  onCheckedChange={(checked) =>
                    updateConfig("includeSummary", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="keypoints" className="text-sm">
                    关键要点
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    包含核心观点列表
                  </p>
                </div>
                <Switch
                  id="keypoints"
                  checked={config.includeKeyPoints}
                  onCheckedChange={(checked) =>
                    updateConfig("includeKeyPoints", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="highlights" className="text-sm">
                    高亮笔记
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    包含标注和备注
                  </p>
                </div>
                <Switch
                  id="highlights"
                  checked={config.includeHighlights}
                  onCheckedChange={(checked) =>
                    updateConfig("includeHighlights", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="chat" className="text-sm">
                    对话记录
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    包含 AI 问答历史
                  </p>
                </div>
                <Switch
                  id="chat"
                  checked={config.includeChat}
                  onCheckedChange={(checked) =>
                    updateConfig("includeChat", checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* 访问权限 */}
          <div className="space-y-4 border-t pt-4">
            <Label className="text-base font-medium">访问权限</Label>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public" className="text-sm flex items-center gap-1.5">
                  {config.isPublic ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {config.isPublic ? "公开访问" : "密码保护"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {config.isPublic
                    ? "任何人可通过链接访问"
                    : "需要输入密码才能查看"}
                </p>
              </div>
              <Switch
                id="public"
                checked={config.isPublic}
                onCheckedChange={(checked) =>
                  updateConfig("isPublic", checked)
                }
              />
            </div>

            {!config.isPublic && (
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm">
                  访问密码
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="设置访问密码"
                    value={config.password}
                    onChange={(e) => updateConfig("password", e.target.value)}
                    className="pr-10 h-10 rounded-lg bg-muted focus:bg-background transition-colors"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-10 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 分享链接展示 */}
          {shareUrl && (
            <div className="space-y-2 border-t pt-4">
              <Label className="text-base font-medium">分享链接</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="h-10 rounded-lg bg-muted text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="h-10 w-10 rounded-lg shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="rounded-lg"
          >
            关闭
          </Button>
          {!shareUrl ? (
            <Button
              onClick={handleShare}
              disabled={isLoading || (!config.isPublic && !config.password)}
              className="rounded-lg"
            >
              {isLoading ? "生成中..." : "生成链接"}
            </Button>
          ) : (
            <Button onClick={handleCopy} className="rounded-lg">
              {copied ? "已复制" : "复制链接"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
