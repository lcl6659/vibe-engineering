/**
 * useWebRTC Hook
 * Manages WebRTC peer connections for video conferencing
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { roomApi } from "@/lib/api/rooms";
import type { PeerConnection, Participant } from "@/types/room";

interface UseWebRTCOptions {
  roomId: string;
  userId: string;
  localStream: MediaStream | null;
  onError?: (error: Error) => void;
}

interface UseWebRTCReturn {
  remoteStreams: Map<string, MediaStream>;
  participants: Participant[];
  isConnected: boolean;
  error: Error | null;
  cleanup: () => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const POLL_INTERVAL = 3000; // Poll for participants every 3 seconds

export function useWebRTC({
  roomId,
  userId,
  localStream,
  onError,
}: UseWebRTCOptions): UseWebRTCReturn {
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Create a new peer connection for a remote user
   */
  const createPeerConnection = useCallback(
    (remoteUserId: string): RTCPeerConnection => {
      const pc = new RTCPeerConnection(ICE_SERVERS);

      // Add local stream tracks to the peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle incoming remote tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0];
        if (remoteStream) {
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.set(remoteUserId, remoteStream);
            return newMap;
          });
        }
      };

      // Handle ICE candidates
      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          try {
            await roomApi.sendIceCandidate(
              roomId,
              userId,
              JSON.stringify(event.candidate)
            );
          } catch (err) {
            console.error("Failed to send ICE candidate:", err);
          }
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(
          `Peer connection with ${remoteUserId}: ${pc.connectionState}`
        );
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed"
        ) {
          // Remove disconnected peer
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(remoteUserId);
            return newMap;
          });
        }
      };

      return pc;
    },
    [roomId, userId, localStream]
  );

  /**
   * Create offer for a new peer
   */
  const createOffer = useCallback(
    async (remoteUserId: string) => {
      try {
        const pc = createPeerConnection(remoteUserId);
        peerConnectionsRef.current.set(remoteUserId, {
          userId: remoteUserId,
          connection: pc,
          stream: null,
        });

        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);

        // Send offer to signaling server
        const response = await roomApi.sendOffer(
          roomId,
          userId,
          JSON.stringify(offer)
        );

        // Set remote description from answer
        if (response.sdp) {
          const answer = JSON.parse(response.sdp);
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }

        setIsConnected(true);
      } catch (err) {
        console.error(`Failed to create offer for ${remoteUserId}:`, err);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        onError?.(error);
      }
    },
    [roomId, userId, createPeerConnection, onError]
  );

  /**
   * Poll for room participants and establish connections
   */
  const pollParticipants = useCallback(async () => {
    try {
      const status = await roomApi.getStatus(roomId);
      setParticipants(status.participants);

      // Find new participants and create peer connections
      const currentPeerIds = Array.from(peerConnectionsRef.current.keys());
      const newParticipants = status.participants.filter(
        (p) => p.id !== userId && !currentPeerIds.includes(p.id) && p.status === "ONLINE"
      );

      for (const participant of newParticipants) {
        await createOffer(participant.id);
      }

      // Remove connections for participants who left
      const participantIds = status.participants
        .filter((p) => p.status === "ONLINE")
        .map((p) => p.id);

      peerConnectionsRef.current.forEach((peerConn, peerId) => {
        if (!participantIds.includes(peerId)) {
          peerConn.connection.close();
          peerConnectionsRef.current.delete(peerId);
          setRemoteStreams((prev) => {
            const newMap = new Map(prev);
            newMap.delete(peerId);
            return newMap;
          });
        }
      });
    } catch (err) {
      console.error("Failed to poll participants:", err);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    }
  }, [roomId, userId, createOffer]);

  /**
   * Start polling for participants
   */
  useEffect(() => {
    if (!localStream) return;

    // Initial poll
    pollParticipants();

    // Start polling interval
    pollIntervalRef.current = setInterval(pollParticipants, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [localStream, pollParticipants]);

  /**
   * Cleanup all peer connections
   */
  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    peerConnectionsRef.current.forEach((peerConn) => {
      peerConn.connection.close();
    });
    peerConnectionsRef.current.clear();

    setRemoteStreams(new Map());
    setIsConnected(false);
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
    remoteStreams,
    participants,
    isConnected,
    error,
    cleanup,
  };
}
