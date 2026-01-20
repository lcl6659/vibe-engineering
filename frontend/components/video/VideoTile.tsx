"use client";

import { useEffect, useRef } from "react";
import { Mic, MicOff, VideoOff, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoTileProps {
  stream: MediaStream | null;
  userId: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

/**
 * VideoTile - Individual video window for a participant
 * Displays real-time video stream with status indicators
 */
export default function VideoTile({
  stream,
  userId,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-secondary rounded-xl overflow-hidden border-0">
      {/* Video element */}
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Always mute local video to prevent feedback
          className={cn(
            "w-full h-full object-cover",
            isLocal && "scale-x-[-1]" // Mirror local video
          )}
        />
      ) : (
        /* Placeholder when video is off */
        <div className="w-full h-full flex items-center justify-center bg-secondary">
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              {isLocal ? "You" : userId.slice(0, 8)}
            </p>
          </div>
        </div>
      )}

      {/* Status indicators */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        {/* User label */}
        <div className="px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border-0">
          <p className="text-xs font-medium">
            {isLocal ? "You" : userId.slice(0, 8)}
          </p>
        </div>

        {/* Mute indicator */}
        {isMuted && (
          <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border-0 flex items-center justify-center">
            <MicOff className="w-4 h-4 text-foreground" />
          </div>
        )}

        {/* Video off indicator */}
        {isVideoOff && (
          <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border-0 flex items-center justify-center">
            <VideoOff className="w-4 h-4 text-foreground" />
          </div>
        )}
      </div>

      {/* Microphone status in top-right */}
      {!isMuted && (
        <div className="absolute top-3 right-3">
          <div className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border-0 flex items-center justify-center">
            <Mic className="w-4 h-4 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
