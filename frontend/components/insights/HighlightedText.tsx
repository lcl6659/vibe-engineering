"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Highlight } from "@/lib/api/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface HighlightedTextProps {
  content: string;
  highlights: Highlight[];
  onHighlightClick?: (highlight: Highlight) => void;
  onHighlightDelete?: (highlightId: number) => void;
}

interface TextSegment {
  text: string;
  highlight?: Highlight;
}

/**
 * Color mapping for highlights following Base.org palette
 */
const HIGHLIGHT_COLOR_MAP: Record<string, string> = {
  yellow: "bg-[#ffd12f]/30 hover:bg-[#ffd12f]/40",
  green: "bg-[#66c800]/30 hover:bg-[#66c800]/40",
  blue: "bg-[#3c8aff]/30 hover:bg-[#3c8aff]/40",
  purple: "bg-[#b8a581]/30 hover:bg-[#b8a581]/40",
  red: "bg-[#ee2737]/30 hover:bg-[#ee2737]/40",
};

/**
 * HighlightedText - Renders text with highlight annotations
 * Features:
 * - Renders text with colored backgrounds for highlights
 * - Handles overlapping highlights
 * - Shows popover with note on click
 * - Allows deleting highlights
 * - Follows Base.org design system
 */
export function HighlightedText({
  content,
  highlights,
  onHighlightClick,
  onHighlightDelete,
}: HighlightedTextProps) {
  const [activeHighlight, setActiveHighlight] = useState<Highlight | null>(null);

  // Sort highlights by start offset to handle overlapping
  const sortedHighlights = [...highlights].sort(
    (a, b) => a.start_offset - b.start_offset
  );

  // Build text segments with highlight information
  const segments = buildSegments(content, sortedHighlights);

  return (
    <div className="whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        if (!segment.highlight) {
          return <span key={index}>{segment.text}</span>;
        }

        const colorClass =
          HIGHLIGHT_COLOR_MAP[segment.highlight.color] || HIGHLIGHT_COLOR_MAP.yellow;

        return (
          <Popover
            key={index}
            open={activeHighlight?.id === segment.highlight.id}
            onOpenChange={(open) => {
              if (open) {
                setActiveHighlight(segment.highlight!);
                onHighlightClick?.(segment.highlight!);
              } else {
                setActiveHighlight(null);
              }
            }}
          >
            <PopoverTrigger asChild>
              <mark
                className={cn(
                  "cursor-pointer rounded-sm px-0.5",
                  "transition-colors duration-150",
                  colorClass
                )}
              >
                {segment.text}
              </mark>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 rounded-xl p-0"
              side="top"
              align="start"
            >
              <div className="p-4 space-y-3">
                {/* Highlighted text */}
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm font-medium">{segment.highlight.text}</p>
                </div>

                {/* Note if exists */}
                {segment.highlight.note && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">备注</p>
                    <p className="text-sm">{segment.highlight.note}</p>
                  </div>
                )}

                {/* Created time */}
                <p className="text-xs text-muted-foreground">
                  {new Date(segment.highlight.created_at).toLocaleString("zh-CN")}
                </p>

                {/* Delete button */}
                {onHighlightDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      onHighlightDelete(segment.highlight!.id);
                      setActiveHighlight(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    删除高亮
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}

/**
 * Build text segments from content and highlights
 * Handles overlapping highlights by prioritizing earlier highlights
 */
function buildSegments(content: string, highlights: Highlight[]): TextSegment[] {
  if (highlights.length === 0) {
    return [{ text: content }];
  }

  const segments: TextSegment[] = [];
  let currentOffset = 0;

  for (const highlight of highlights) {
    // Add plain text before highlight if needed
    if (currentOffset < highlight.start_offset) {
      segments.push({
        text: content.slice(currentOffset, highlight.start_offset),
      });
    }

    // Add highlighted text
    // Handle case where highlights might overlap - skip if we're past the start
    if (currentOffset <= highlight.start_offset) {
      segments.push({
        text: content.slice(highlight.start_offset, highlight.end_offset),
        highlight,
      });
      currentOffset = highlight.end_offset;
    }
  }

  // Add remaining plain text
  if (currentOffset < content.length) {
    segments.push({
      text: content.slice(currentOffset),
    });
  }

  return segments;
}
