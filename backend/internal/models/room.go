package models

import (
	"time"

	"gorm.io/gorm"
)

// Room represents a video conference room.
type Room struct {
	ID           uint           `json:"id" gorm:"primaryKey"`
	RoomID       string         `json:"room_id" gorm:"uniqueIndex;type:varchar(255);not null"`
	Status       string         `json:"status" gorm:"type:varchar(50);default:'IDLE'"` // IDLE, CONNECTING, CONNECTED, ERROR, DISCONNECTED
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `json:"-" gorm:"index"`
	Participants []Participant  `json:"participants" gorm:"foreignKey:RoomID;references:RoomID"`
}

// TableName returns the table name for Room model.
func (Room) TableName() string {
	return "rooms"
}

// Participant represents a user in a video room.
type Participant struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	RoomID    string         `json:"room_id" gorm:"index;type:varchar(255);not null"`
	UserID    string         `json:"user_id" gorm:"type:varchar(255);not null"` // Client-generated unique user ID
	Status    string         `json:"status" gorm:"type:varchar(50);default:'ONLINE'"` // ONLINE, OFFLINE
	JoinedAt  time.Time      `json:"joined_at"`
	LeftAt    *time.Time     `json:"left_at,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName returns the table name for Participant model.
func (Participant) TableName() string {
	return "participants"
}

// WebRTCSignal stores WebRTC signaling data (SDP offers/answers and ICE candidates).
// Note: In production, this should be handled via WebSocket for real-time communication.
// This implementation uses database storage as a stateless alternative.
type WebRTCSignal struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	RoomID      string         `json:"room_id" gorm:"index;type:varchar(255);not null"`
	UserID      string         `json:"user_id" gorm:"type:varchar(255);not null"`
	SignalType  string         `json:"signal_type" gorm:"type:varchar(50);not null"` // OFFER, ANSWER, ICE_CANDIDATE
	SDPOffer    string         `json:"sdp_offer,omitempty" gorm:"type:text"`
	SDPAnswer   string         `json:"sdp_answer,omitempty" gorm:"type:text"`
	ICECandidate string        `json:"ice_candidate,omitempty" gorm:"type:text"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

// TableName returns the table name for WebRTCSignal model.
func (WebRTCSignal) TableName() string {
	return "webrtc_signals"
}

// JoinRoomRequest represents the request body for joining a room.
type JoinRoomRequest struct {
	RoomID string `json:"roomId" binding:"required"`
}

// JoinRoomResponse represents the response for joining a room.
type JoinRoomResponse struct {
	Status       string                `json:"status"`
	Participants []ParticipantResponse `json:"participants"`
}

// LeaveRoomRequest represents the request body for leaving a room.
type LeaveRoomRequest struct {
	RoomID string `json:"roomId" binding:"required"`
	UserID string `json:"userId" binding:"required"`
}

// LeaveRoomResponse represents the response for leaving a room.
type LeaveRoomResponse struct {
	Status string `json:"status"`
}

// RoomStatusResponse represents the response for room status.
type RoomStatusResponse struct {
	Status       string                `json:"status"`
	Participants []ParticipantResponse `json:"participants"`
}

// ParticipantResponse represents a participant in the response.
type ParticipantResponse struct {
	ID     string `json:"id"`
	Status string `json:"status"`
}

// MediaOfferRequest represents the request body for WebRTC offer.
type MediaOfferRequest struct {
	RoomID string `json:"roomId" binding:"required"`
	UserID string `json:"userId" binding:"required"`
	SDP    string `json:"sdp" binding:"required"`
}

// MediaOfferResponse represents the response for WebRTC offer.
type MediaOfferResponse struct {
	SDP string `json:"sdp"`
}

// ICECandidateRequest represents the request body for ICE candidate.
type ICECandidateRequest struct {
	RoomID    string `json:"roomId" binding:"required"`
	UserID    string `json:"userId" binding:"required"`
	Candidate string `json:"candidate" binding:"required"`
}

// ICECandidateResponse represents the response for ICE candidate.
type ICECandidateResponse struct {
	Status string `json:"status"`
}

// ToResponse converts a Participant to ParticipantResponse.
func (p *Participant) ToResponse() ParticipantResponse {
	return ParticipantResponse{
		ID:     p.UserID,
		Status: p.Status,
	}
}
