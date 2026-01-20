"use client";

import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface MediaControlsProps {
  isMuted: boolean;
  isVideoOff: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onLeave: () => void;
  roomId: string;
}

/**
 * MediaControls - Control buttons for audio/video
 * Displayed at the bottom of the video room
 */
export default function MediaControls({
  isMuted,
  isVideoOff,
  onToggleMute,
  onToggleVideo,
  onLeave,
  roomId,
}: MediaControlsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/room/${roomId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Room info */}
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              Room: <span className="font-mono text-foreground">{roomId}</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="h-9 px-3 rounded-lg border-0 hover:bg-muted"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Control buttons */}
          <div className="flex items-center gap-3">
            {/* Mute toggle */}
            <Button
              onClick={onToggleMute}
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              className={cn(
                "w-14 h-14 rounded-full border-0",
                isMuted
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </Button>

            {/* Video toggle */}
            <Button
              onClick={onToggleVideo}
              variant={isVideoOff ? "destructive" : "secondary"}
              size="lg"
              className={cn(
                "w-14 h-14 rounded-full border-0",
                isVideoOff
                  ? "bg-destructive hover:bg-destructive/90"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {isVideoOff ? (
                <VideoOff className="w-6 h-6" />
              ) : (
                <Video className="w-6 h-6" />
              )}
            </Button>

            {/* Leave button */}
            <Button
              onClick={onLeave}
              variant="destructive"
              size="lg"
              className="w-14 h-14 rounded-full border-0 bg-destructive hover:bg-destructive/90"
            >
              <PhoneOff className="w-6 h-6" />
            </Button>
          </div>

          {/* Right spacer for balance */}
          <div className="w-[200px]" />
        </div>
      </div>
    </div>
  );
}
