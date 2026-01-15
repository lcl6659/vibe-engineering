"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { HighlightColor } from "@/lib/api/types";

interface HighlightPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (color: HighlightColor, note: string) => void;
  selectedText: string;
}

/**
 * Color configurations following Base.org design system
 */
const HIGHLIGHT_COLORS: {
  value: HighlightColor;
  label: string;
  bgClass: string;
  hoverClass: string;
  emoji: string;
}[] = [
  {
    value: "yellow",
    label: "黄色",
    bgClass: "bg-[#ffd12f]",
    hoverClass: "hover:bg-[#ffd12f]/80",
    emoji: "🟡",
  },
  {
    value: "green",
    label: "绿色",
    bgClass: "bg-[#66c800]",
    hoverClass: "hover:bg-[#66c800]/80",
    emoji: "🟢",
  },
  {
    value: "blue",
    label: "蓝色",
    bgClass: "bg-[#3c8aff]",
    hoverClass: "hover:bg-[#3c8aff]/80",
    emoji: "🔵",
  },
  {
    value: "purple",
    label: "紫色",
    bgClass: "bg-[#b8a581]",
    hoverClass: "hover:bg-[#b8a581]/80",
    emoji: "🟣",
  },
  {
    value: "red",
    label: "红色",
    bgClass: "bg-[#ee2737]",
    hoverClass: "hover:bg-[#ee2737]/80",
    emoji: "🔴",
  },
];

/**
 * HighlightPopover - Color picker dialog for creating highlights
 * Features:
 * - Color selection with Base.org palette
 * - Optional note input
 * - Preview of selected text
 * - Follows Base.org design system (no borders, rounded-2xl)
 */
export function HighlightPopover({
  open,
  onOpenChange,
  onConfirm,
  selectedText,
}: HighlightPopoverProps) {
  const [selectedColor, setSelectedColor] = useState<HighlightColor>("yellow");
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    onConfirm(selectedColor, note);
    // Reset state
    setSelectedColor("yellow");
    setNote("");
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset state
    setSelectedColor("yellow");
    setNote("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>选择高亮颜色</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected text preview */}
          <div className="rounded-xl bg-muted p-3">
            <p className="text-sm text-muted-foreground line-clamp-3">
              {selectedText}
            </p>
          </div>

          {/* Color picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">颜色</label>
            <div className="flex items-center gap-2">
              {HIGHLIGHT_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    "w-10 h-10 rounded-full",
                    "flex items-center justify-center",
                    "text-lg",
                    "transition-all duration-200",
                    color.bgClass,
                    color.hoverClass,
                    selectedColor === color.value && "ring-2 ring-foreground ring-offset-2"
                  )}
                  title={color.label}
                >
                  {color.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Note input */}
          <div className="space-y-2">
            <label htmlFor="note" className="text-sm font-medium">
              备注（可选）
            </label>
            <Textarea
              id="note"
              placeholder="添加备注..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none rounded-lg h-20"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={handleCancel}>
            取消
          </Button>
          <Button onClick={handleConfirm}>
            确认高亮
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
