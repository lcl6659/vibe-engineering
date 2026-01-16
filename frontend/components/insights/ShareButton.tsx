"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { ShareDialog } from "./ShareDialog";

interface ShareButtonProps {
  insightId: number;
  insightTitle: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareButton({
  insightId,
  insightTitle,
  variant = "ghost",
  size = "icon",
  className,
}: ShareButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
        className={className}
        title="分享"
      >
        <Share2 className="h-4 w-4" />
        {size !== "icon" && <span className="ml-2">分享</span>}
      </Button>

      <ShareDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        insightId={insightId}
        insightTitle={insightTitle}
      />
    </>
  );
}
