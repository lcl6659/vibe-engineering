/**
 * useMediaDevices Hook
 * Manages camera and microphone access
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { MediaPermissions, MediaDeviceError } from "@/types/room";

interface UseMediaDevicesReturn {
  localStream: MediaStream | null;
  permissions: MediaPermissions;
  error: MediaDeviceError | null;
  isLoading: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  requestPermissions: () => Promise<void>;
  toggleMute: () => void;
  toggleVideo: () => void;
  cleanup: () => void;
}

export function useMediaDevices(): UseMediaDevicesReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [permissions, setPermissions] = useState<MediaPermissions>({
    camera: false,
    microphone: false,
  });
  const [error, setError] = useState<MediaDeviceError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Request camera and microphone permissions
   */
  const requestPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setLocalStream(stream);
      setPermissions({
        camera: true,
        microphone: true,
      });
    } catch (err) {
      let errorType: MediaDeviceError["type"] = "unknown";
      let errorMessage = "Failed to access media devices";

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorType = "permission_denied";
          errorMessage = "Camera and microphone access was denied. Please allow permissions to join the video room.";
        } else if (err.name === "NotFoundError") {
          errorType = "not_found";
          errorMessage = "No camera or microphone found. Please connect a device to join the video room.";
        } else if (err.name === "NotReadableError") {
          errorType = "not_readable";
          errorMessage = "Camera or microphone is already in use by another application.";
        }
      }

      setError({
        type: errorType,
        message: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Toggle microphone mute
   */
  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      const audioTracks = streamRef.current.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);
    }
  }, []);

  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const videoTracks = streamRef.current.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  }, []);

  /**
   * Cleanup media stream
   */
  const cleanup = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setLocalStream(null);
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    localStream,
    permissions,
    error,
    isLoading,
    isMuted,
    isVideoOff,
    requestPermissions,
    toggleMute,
    toggleVideo,
    cleanup,
  };
}
