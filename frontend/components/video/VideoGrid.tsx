"use client";

import { useMemo } from "react";
import VideoTile from "./VideoTile";
import { cn } from "@/lib/utils";

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  localUserId: string;
  isMuted: boolean;
  isVideoOff: boolean;
}

/**
 * VideoGrid - Responsive grid layout for video participants
 * Automatically adjusts grid columns based on participant count
 */
export default function VideoGrid({
  localStream,
  remoteStreams,
  localUserId,
  isMuted,
  isVideoOff,
}: VideoGridProps) {
  /**
   * Calculate grid columns based on participant count
   */
  const gridColumns = useMemo(() => {
    const totalParticipants = 1 + remoteStreams.size; // Local + remote

    if (totalParticipants === 1) return "grid-cols-1";
    if (totalParticipants === 2) return "grid-cols-2";
    if (totalParticipants <= 4) return "grid-cols-2";
    if (totalParticipants <= 6) return "grid-cols-3";
    if (totalParticipants <= 9) return "grid-cols-3";
    return "grid-cols-4";
  }, [remoteStreams.size]);

  /**
   * Calculate aspect ratio class based on participant count
   */
  const aspectRatio = useMemo(() => {
    const totalParticipants = 1 + remoteStreams.size;

    if (totalParticipants === 1) return "aspect-video"; // 16:9 for single user
    if (totalParticipants === 2) return "aspect-video";
    return "aspect-video"; // Always 16:9 for consistency
  }, [remoteStreams.size]);

  return (
    <div
      className={cn(
        "w-full h-full grid gap-4 p-6",
        gridColumns,
        "auto-rows-fr" // Equal height rows
      )}
    >
      {/* Local video (always first) */}
      <div className={cn("w-full", aspectRatio)}>
        <VideoTile
          stream={localStream}
          userId={localUserId}
          isLocal={true}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
        />
      </div>

      {/* Remote videos */}
      {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
        <div key={userId} className={cn("w-full", aspectRatio)}>
          <VideoTile
            stream={stream}
            userId={userId}
            isLocal={false}
            isMuted={false}
            isVideoOff={false}
          />
        </div>
      ))}
    </div>
  );
}
