/**
 * Room API client
 * Handles all room-related API calls
 */

import { request } from "./client";
import type {
  JoinRoomRequest,
  JoinRoomResponse,
  LeaveRoomRequest,
  LeaveRoomResponse,
  RoomStatusResponse,
  MediaOfferRequest,
  MediaOfferResponse,
  ICECandidateRequest,
  ICECandidateResponse,
} from "@/types/room";

/**
 * Room API endpoints
 */
export const roomApi = {
  /**
   * Join a video room
   */
  async join(roomId: string): Promise<JoinRoomResponse> {
    const data = await request<JoinRoomResponse>("/room/join", {
      method: "POST",
      body: { roomId } as JoinRoomRequest,
    });
    return data;
  },

  /**
   * Leave a video room
   */
  async leave(roomId: string, userId: string): Promise<LeaveRoomResponse> {
    const data = await request<LeaveRoomResponse>("/room/leave", {
      method: "POST",
      body: { roomId, userId } as LeaveRoomRequest,
    });
    return data;
  },

  /**
   * Get room status
   */
  async getStatus(roomId: string): Promise<RoomStatusResponse> {
    const data = await request<RoomStatusResponse>("/room/status", {
      method: "GET",
      params: { roomId },
    });
    return data;
  },

  /**
   * Send WebRTC SDP offer
   */
  async sendOffer(
    roomId: string,
    userId: string,
    sdp: string
  ): Promise<MediaOfferResponse> {
    const data = await request<MediaOfferResponse>("/media/offer", {
      method: "POST",
      body: { roomId, userId, sdp } as MediaOfferRequest,
    });
    return data;
  },

  /**
   * Send ICE candidate
   */
  async sendIceCandidate(
    roomId: string,
    userId: string,
    candidate: string
  ): Promise<ICECandidateResponse> {
    const data = await request<ICECandidateResponse>("/media/iceCandidate", {
      method: "POST",
      body: { roomId, userId, candidate } as ICECandidateRequest,
    });
    return data;
  },
};
