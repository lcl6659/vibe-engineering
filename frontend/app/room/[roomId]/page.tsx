"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoGrid from "@/components/video/VideoGrid";
import MediaControls from "@/components/video/MediaControls";
import { useMediaDevices } from "@/hooks/use-media-devices";
import { useWebRTC } from "@/hooks/use-webrtc";
import { roomApi } from "@/lib/api/rooms";
import type { RoomStatus } from "@/types/room";

/**
 * Video Room Page
 * Main page for video conferencing
 */
export default function VideoRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const [userId, setUserId] = useState<string>("");
  const [roomStatus, setRoomStatus] = useState<RoomStatus>("IDLE");
  const [joinError, setJoinError] = useState<string | null>(null);

  const {
    localStream,
    permissions,
    error: mediaError,
    isLoading: isMediaLoading,
    isMuted,
    isVideoOff,
    requestPermissions,
    toggleMute,
    toggleVideo,
    cleanup: cleanupMedia,
  } = useMediaDevices();

  const {
    remoteStreams,
    participants,
    isConnected,
    error: webrtcError,
    cleanup: cleanupWebRTC,
  } = useWebRTC({
    roomId,
    userId,
    localStream,
  });

  /**
   * Join the room
   */
  const handleJoinRoom = useCallback(async () => {
    setRoomStatus("CONNECTING");
    setJoinError(null);

    try {
      // Request media permissions first
      await requestPermissions();

      // Join the room via API
      const response = await roomApi.join(roomId);
      setUserId(response.userId);
      setRoomStatus("CONNECTED");
    } catch (err) {
      console.error("Failed to join room:", err);
      setRoomStatus("ERROR");
      setJoinError(
        err instanceof Error ? err.message : "Failed to join room"
      );
    }
  }, [roomId, requestPermissions]);

  /**
   * Leave the room
   */
  const handleLeaveRoom = useCallback(async () => {
    if (!userId) return;

    try {
      await roomApi.leave(roomId, userId);
    } catch (err) {
      console.error("Failed to leave room:", err);
    } finally {
      cleanupMedia();
      cleanupWebRTC();
      setRoomStatus("DISCONNECTED");
      router.push("/room");
    }
  }, [roomId, userId, cleanupMedia, cleanupWebRTC, router]);

  /**
   * Auto-join on mount
   */
  useEffect(() => {
    if (roomStatus === "IDLE") {
      handleJoinRoom();
    }
  }, [roomStatus, handleJoinRoom]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (userId) {
        roomApi.leave(roomId, userId).catch(console.error);
      }
      cleanupMedia();
      cleanupWebRTC();
    };
  }, [roomId, userId, cleanupMedia, cleanupWebRTC]);

  /**
   * Render loading state
   */
  if (roomStatus === "IDLE" || roomStatus === "CONNECTING" || isMediaLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {isMediaLoading
              ? "Requesting camera and microphone access..."
              : "Connecting to room..."}
          </h2>
          <p className="text-sm text-muted-foreground">
            Please allow access to your camera and microphone
          </p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (roomStatus === "ERROR" || mediaError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card rounded-2xl p-8 border-0">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">
            Unable to join room
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            {mediaError?.message || joinError || "An unknown error occurred"}
          </p>
          <div className="space-y-3">
            <Button
              onClick={handleJoinRoom}
              className="w-full h-12 rounded-xl border-0 bg-primary hover:bg-primary/90"
            >
              Try Again
            </Button>
            <Button
              onClick={() => router.push("/room")}
              variant="ghost"
              className="w-full h-12 rounded-xl border-0 hover:bg-muted"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render video room
   */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Video grid */}
      <div className="flex-1 overflow-auto pb-24">
        <VideoGrid
          localStream={localStream}
          remoteStreams={remoteStreams}
          localUserId={userId}
          isMuted={isMuted}
          isVideoOff={isVideoOff}
        />
      </div>

      {/* Media controls */}
      <MediaControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        onToggleMute={toggleMute}
        onToggleVideo={toggleVideo}
        onLeave={handleLeaveRoom}
        roomId={roomId}
      />

      {/* WebRTC error notification */}
      {webrtcError && (
        <div className="fixed top-4 right-4 bg-destructive/10 border border-destructive/20 rounded-xl p-4 max-w-md">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <p className="text-sm font-medium">Connection Error</p>
              <p className="text-sm text-muted-foreground mt-1">
                {webrtcError.message}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
