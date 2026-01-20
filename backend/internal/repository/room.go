package repository

import (
	"context"
	"time"

	"gorm.io/gorm"
	"vibe-backend/internal/models"
)

// RoomRepository handles database operations for rooms and participants.
type RoomRepository struct {
	db *gorm.DB
}

// NewRoomRepository creates a new RoomRepository.
func NewRoomRepository(db *gorm.DB) *RoomRepository {
	return &RoomRepository{db: db}
}

// GetOrCreateRoom gets an existing room or creates a new one.
func (r *RoomRepository) GetOrCreateRoom(ctx context.Context, roomID string) (*models.Room, error) {
	var room models.Room
	err := r.db.WithContext(ctx).
		Preload("Participants", "status = ?", "ONLINE").
		Where("room_id = ?", roomID).
		First(&room).Error

	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new room
			room = models.Room{
				RoomID: roomID,
				Status: "IDLE",
			}
			if err := r.db.WithContext(ctx).Create(&room).Error; err != nil {
				return nil, err
			}
			return &room, nil
		}
		return nil, err
	}

	return &room, nil
}

// UpdateRoomStatus updates the room status.
func (r *RoomRepository) UpdateRoomStatus(ctx context.Context, roomID string, status string) error {
	return r.db.WithContext(ctx).
		Model(&models.Room{}).
		Where("room_id = ?", roomID).
		Update("status", status).Error
}

// AddParticipant adds a participant to a room.
func (r *RoomRepository) AddParticipant(ctx context.Context, roomID, userID string) (*models.Participant, error) {
	// Check if participant already exists
	var existing models.Participant
	err := r.db.WithContext(ctx).
		Where("room_id = ? AND user_id = ? AND status = ?", roomID, userID, "ONLINE").
		First(&existing).Error

	if err == nil {
		// Participant already exists and is online
		return &existing, nil
	}

	if err != gorm.ErrRecordNotFound {
		return nil, err
	}

	// Create new participant
	participant := models.Participant{
		RoomID:   roomID,
		UserID:   userID,
		Status:   "ONLINE",
		JoinedAt: time.Now().UTC(),
	}

	if err := r.db.WithContext(ctx).Create(&participant).Error; err != nil {
		return nil, err
	}

	return &participant, nil
}

// RemoveParticipant marks a participant as offline.
func (r *RoomRepository) RemoveParticipant(ctx context.Context, roomID, userID string) error {
	now := time.Now().UTC()
	return r.db.WithContext(ctx).
		Model(&models.Participant{}).
		Where("room_id = ? AND user_id = ?", roomID, userID).
		Updates(map[string]interface{}{
			"status":  "OFFLINE",
			"left_at": now,
		}).Error
}

// GetParticipants returns all online participants in a room.
func (r *RoomRepository) GetParticipants(ctx context.Context, roomID string) ([]models.Participant, error) {
	var participants []models.Participant
	err := r.db.WithContext(ctx).
		Where("room_id = ? AND status = ?", roomID, "ONLINE").
		Find(&participants).Error
	return participants, err
}

// SaveWebRTCOffer saves a WebRTC offer.
func (r *RoomRepository) SaveWebRTCOffer(ctx context.Context, roomID, userID, sdp string) (*models.WebRTCSignal, error) {
	signal := models.WebRTCSignal{
		RoomID:     roomID,
		UserID:     userID,
		SignalType: "OFFER",
		SDPOffer:   sdp,
	}

	if err := r.db.WithContext(ctx).Create(&signal).Error; err != nil {
		return nil, err
	}

	return &signal, nil
}

// GetLatestWebRTCOffer gets the latest WebRTC offer for a room/user.
func (r *RoomRepository) GetLatestWebRTCOffer(ctx context.Context, roomID, userID string) (*models.WebRTCSignal, error) {
	var signal models.WebRTCSignal
	err := r.db.WithContext(ctx).
		Where("room_id = ? AND user_id = ? AND signal_type = ?", roomID, userID, "OFFER").
		Order("created_at DESC").
		First(&signal).Error

	if err != nil {
		return nil, err
	}

	return &signal, nil
}

// SaveWebRTCAnswer saves a WebRTC answer.
func (r *RoomRepository) SaveWebRTCAnswer(ctx context.Context, signalID uint, sdpAnswer string) error {
	return r.db.WithContext(ctx).
		Model(&models.WebRTCSignal{}).
		Where("id = ?", signalID).
		Update("sdp_answer", sdpAnswer).Error
}

// SaveICECandidate saves an ICE candidate.
func (r *RoomRepository) SaveICECandidate(ctx context.Context, roomID, userID, candidate string) error {
	signal := models.WebRTCSignal{
		RoomID:       roomID,
		UserID:       userID,
		SignalType:   "ICE_CANDIDATE",
		ICECandidate: candidate,
	}

	return r.db.WithContext(ctx).Create(&signal).Error
}

// GetICECandidates gets all ICE candidates for a room/user.
func (r *RoomRepository) GetICECandidates(ctx context.Context, roomID, userID string) ([]models.WebRTCSignal, error) {
	var signals []models.WebRTCSignal
	err := r.db.WithContext(ctx).
		Where("room_id = ? AND user_id = ? AND signal_type = ?", roomID, userID, "ICE_CANDIDATE").
		Order("created_at ASC").
		Find(&signals).Error

	return signals, err
}
