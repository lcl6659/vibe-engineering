"use client";

import { cn } from "@/lib/utils";
import type { Insight } from "@/lib/api/types";
import { Youtube, Twitter, Podcast } from "lucide-react";

interface InsightItemProps {
  insight: Insight;
  isSelected?: boolean;
  onSelect: (id: number) => void;
}

/**
 * Get source icon based on source type
 */
function getSourceIcon(sourceType: Insight["source_type"]) {
  switch (sourceType) {
    case "youtube":
      return Youtube;
    case "twitter":
      return Twitter;
    case "podcast":
      return Podcast;
    default:
      return Youtube;
  }
}

/**
 * InsightItem Component
 * Displays a single insight item in the Memory Rail
 */
export function InsightItem({
  insight,
  isSelected,
  onSelect,
}: InsightItemProps) {
  const Icon = getSourceIcon(insight.source_type);

  return (
    <button
      onClick={() => onSelect(insight.id)}
      className={cn(
        "w-full text-left px-4 py-3 rounded-lg",
        "transition-colors duration-200",
        "hover:bg-muted/50",
        "focus:bg-muted/50 focus:outline-none",
        isSelected && "bg-muted"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Source Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground truncate">
            {insight.title}
          </h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {insight.author}
          </p>
        </div>

        {/* Status indicator */}
        {insight.status === "pending" && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
          </div>
        )}
        {insight.status === "processing" && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
        )}
        {insight.status === "failed" && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-red-500" />
          </div>
        )}
      </div>
    </button>
  );
}
