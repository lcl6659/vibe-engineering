"use client";

import { useEffect, useRef, useState } from "react";
import { Highlighter, MessageCircle, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextSelection } from "@/hooks/use-text-selection";

interface SelectionToolbarProps {
  selection: TextSelection;
  onHighlight: () => void;
  onAsk: () => void;
  onTranslate: () => void;
  onClose: () => void;
}

/**
 * SelectionToolbar - Floating toolbar that appears when text is selected
 * Features:
 * - Positions above selected text
 * - Provides highlight, ask, and translate actions
 * - Supports keyboard shortcuts (H, A, T)
 * - Auto-closes when clicking outside
 * - Follows Base.org design system (no borders, no shadows)
 */
export function SelectionToolbar({
  selection,
  onHighlight,
  onAsk,
  onTranslate,
  onClose,
}: SelectionToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  // Calculate toolbar position based on selection rect
  useEffect(() => {
    if (!selection || !toolbarRef.current) return;

    const rect = selection.rect;
    const toolbar = toolbarRef.current;
    const toolbarRect = toolbar.getBoundingClientRect();

    // Position above the selection with some padding
    const top = rect.top + window.scrollY - toolbarRect.height - 8;
    // Center horizontally
    const left = rect.left + window.scrollX + rect.width / 2 - toolbarRect.width / 2;

    setPosition({ top, left });
  }, [selection]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "h" || e.key === "H") {
        e.preventDefault();
        onHighlight();
      } else if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        onAsk();
      } else if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        onTranslate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onHighlight, onAsk, onTranslate, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "fixed z-50",
        "flex items-center gap-1",
        "bg-foreground text-background",
        "rounded-lg px-2 py-1.5",
        "animate-in fade-in slide-in-from-bottom-2 duration-200"
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <ToolbarButton
        icon={<Highlighter className="w-4 h-4" />}
        label="高亮"
        shortcut="H"
        onClick={onHighlight}
      />
      <div className="w-px h-4 bg-background/20" />
      <ToolbarButton
        icon={<MessageCircle className="w-4 h-4" />}
        label="提问"
        shortcut="A"
        onClick={onAsk}
      />
      <div className="w-px h-4 bg-background/20" />
      <ToolbarButton
        icon={<Languages className="w-4 h-4" />}
        label="翻译"
        shortcut="T"
        onClick={onTranslate}
      />
    </div>
  );
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  shortcut: string;
  onClick: () => void;
}

function ToolbarButton({ icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5",
        "rounded-md",
        "text-sm font-medium",
        "hover:bg-background/10",
        "active:scale-95",
        "transition-all duration-150"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
