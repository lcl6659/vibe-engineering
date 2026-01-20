/**
 * Room and WebRTC types for video conference system
 */

/**
 * Room status states
 */
export type RoomStatus = 'IDLE' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'DISCONNECTED';

/**
 * Participant status
 */
export type ParticipantStatus = 'ONLINE' | 'OFFLINE';

/**
 * Participant in a room
 */
export interface Participant {
  id: string;
  status: ParticipantStatus;
}

/**
 * Room information
 */
export interface Room {
  roomId: string;
  status: RoomStatus;
  participants: Participant[];
}

/**
 * Join room request
 */
export interface JoinRoomRequest {
  roomId: string;
}

/**
 * Join room response
 */
export interface JoinRoomResponse {
  userId: string;
  status: RoomStatus;
  participants: Participant[];
}

/**
 * Leave room request
 */
export interface LeaveRoomRequest {
  roomId: string;
  userId: string;
}

/**
 * Leave room response
 */
export interface LeaveRoomResponse {
  status: string;
}

/**
 * Room status response
 */
export interface RoomStatusResponse {
  status: RoomStatus;
  participants: Participant[];
}

/**
 * WebRTC SDP offer request
 */
export interface MediaOfferRequest {
  roomId: string;
  userId: string;
  sdp: string;
}

/**
 * WebRTC SDP offer response
 */
export interface MediaOfferResponse {
  sdp: string;
}

/**
 * ICE candidate request
 */
export interface ICECandidateRequest {
  roomId: string;
  userId: string;
  candidate: string;
}

/**
 * ICE candidate response
 */
export interface ICECandidateResponse {
  status: string;
}

/**
 * Peer connection data
 */
export interface PeerConnection {
  userId: string;
  connection: RTCPeerConnection;
  stream: MediaStream | null;
}

/**
 * Media device permissions state
 */
export interface MediaPermissions {
  camera: boolean;
  microphone: boolean;
}

/**
 * Media device error
 */
export interface MediaDeviceError {
  type: 'permission_denied' | 'not_found' | 'not_readable' | 'unknown';
  message: string;
}
