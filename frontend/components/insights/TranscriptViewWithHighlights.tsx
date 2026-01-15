"use client";

import { useState, useRef } from "react";
import { FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTextSelection } from "@/hooks/use-text-selection";
import { useHighlights } from "@/hooks/use-highlights";
import { SelectionToolbar } from "./SelectionToolbar";
import { HighlightPopover } from "./HighlightPopover";
import { HighlightedText } from "./HighlightedText";
import type { TranscriptItem, HighlightColor } from "@/lib/api/types";
import { toast } from "sonner";

type DisplayMode = "zh" | "en" | "bilingual";

interface TranscriptViewWithHighlightsProps {
  insightId: number;
  transcripts: TranscriptItem[];
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  onTimestampClick: (seconds: number) => void;
}

const displayModeLabels: Record<DisplayMode, string> = {
  zh: "中文",
  en: "原文",
  bilingual: "中英对照",
};

/**
 * TranscriptViewWithHighlights - Enhanced transcript view with text selection and highlighting
 * Features:
 * - Text selection detection
 * - Floating toolbar for highlight/ask/translate
 * - Highlight color picker
 * - Highlighted text rendering
 * - Timestamp navigation
 */
export function TranscriptViewWithHighlights({
  insightId,
  transcripts,
  displayMode,
  onDisplayModeChange,
  onTimestampClick,
}: TranscriptViewWithHighlightsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { selection, clearSelection } = useTextSelection(containerRef);
  const {
    highlights,
    createHighlight,
    deleteHighlight,
    error: highlightError,
  } = useHighlights(insightId);

  const [showHighlightPopover, setShowHighlightPopover] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<typeof selection>(null);

  if (!transcripts || transcripts.length === 0) {
    return null;
  }

  // Concatenate all transcript text for highlight offset calculation
  const fullText = transcripts.map((t) => t.text).join("\n");

  const handleHighlight = () => {
    if (!selection) return;
    setPendingSelection(selection);
    setShowHighlightPopover(true);
  };

  const handleConfirmHighlight = async (color: HighlightColor, note: string) => {
    if (!pendingSelection) return;

    const result = await createHighlight({
      text: pendingSelection.text,
      start_offset: pendingSelection.startOffset,
      end_offset: pendingSelection.endOffset,
      color,
      note: note || undefined,
    });

    if (result) {
      toast.success("高亮已保存");
    } else {
      toast.error(highlightError || "保存高亮失败");
    }

    clearSelection();
    setPendingSelection(null);
  };

  const handleAsk = () => {
    if (!selection) return;
    // TODO: Open chat panel with selected text as question context
    toast.info("提问功能开发中...");
    clearSelection();
  };

  const handleTranslate = () => {
    if (!selection) return;
    // TODO: Show translation tooltip
    toast.info("翻译功能开发中...");
    clearSelection();
  };

  const handleDeleteHighlight = async (highlightId: number) => {
    const success = await deleteHighlight(highlightId);
    if (success) {
      toast.success("高亮已删除");
    } else {
      toast.error(highlightError || "删除高亮失败");
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              内容全文
            </CardTitle>
            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              {(Object.keys(displayModeLabels) as DisplayMode[]).map((mode) => (
                <Button
                  key={mode}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs",
                    displayMode === mode && "bg-background"
                  )}
                  onClick={() => onDisplayModeChange(mode)}
                >
                  {displayModeLabels[mode]}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={containerRef}
            className="space-y-3 max-h-[500px] overflow-y-auto pr-2"
          >
            {transcripts.map((item, index) => (
              <TranscriptLine
                key={index}
                item={item}
                displayMode={displayMode}
                onTimestampClick={onTimestampClick}
                highlights={highlights}
                onHighlightDelete={handleDeleteHighlight}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selection Toolbar */}
      {selection && (
        <SelectionToolbar
          selection={selection}
          onHighlight={handleHighlight}
          onAsk={handleAsk}
          onTranslate={handleTranslate}
          onClose={clearSelection}
        />
      )}

      {/* Highlight Color Picker */}
      <HighlightPopover
        open={showHighlightPopover}
        onOpenChange={setShowHighlightPopover}
        onConfirm={handleConfirmHighlight}
        selectedText={pendingSelection?.text || ""}
      />
    </>
  );
}

interface TranscriptLineProps {
  item: TranscriptItem;
  displayMode: DisplayMode;
  onTimestampClick: (seconds: number) => void;
  highlights: Array<{
    id: number;
    insight_id: number;
    text: string;
    start_offset: number;
    end_offset: number;
    color: string;
    note?: string;
    created_at: string;
  }>;
  onHighlightDelete: (highlightId: number) => void;
}

function TranscriptLine({
  item,
  displayMode,
  onTimestampClick,
  highlights,
  onHighlightDelete,
}: TranscriptLineProps) {
  return (
    <div className="flex gap-3 group">
      {/* Timestamp Button */}
      <button
        onClick={() => onTimestampClick(item.seconds)}
        className="flex-shrink-0 text-xs font-mono text-primary hover:text-primary/80 hover:underline transition-colors pt-0.5"
      >
        [{item.timestamp}]
      </button>

      {/* Text Content with Highlights */}
      <div className="flex-1 text-sm text-muted-foreground leading-relaxed">
        {displayMode === "zh" && (
          <HighlightedText
            content={item.text}
            highlights={highlights}
            onHighlightDelete={onHighlightDelete}
          />
        )}
        {displayMode === "en" && (
          <HighlightedText
            content={item.text}
            highlights={highlights}
            onHighlightDelete={onHighlightDelete}
          />
        )}
        {displayMode === "bilingual" && (
          <div className="space-y-1">
            <HighlightedText
              content={item.text}
              highlights={highlights}
              onHighlightDelete={onHighlightDelete}
            />
            <p className="text-xs text-muted-foreground/70">{item.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
