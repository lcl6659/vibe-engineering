package handlers

import (
	"errors"
	"net/http"

	"vibe-backend/internal/models"
	"vibe-backend/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// RoomHandler handles room-related HTTP requests.
type RoomHandler struct {
	repo *repository.RoomRepository
	log  *zap.Logger
}

// NewRoomHandler creates a new RoomHandler.
func NewRoomHandler(repo *repository.RoomRepository, log *zap.Logger) *RoomHandler {
	return &RoomHandler{
		repo: repo,
		log:  log,
	}
}

// JoinRoom handles POST /api/room/join
// Allows a user to join a video room.
func (h *RoomHandler) JoinRoom(c *gin.Context) {
	var req models.JoinRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Generate a unique user ID for this participant
	userID := uuid.New().String()

	// Get or create room
	room, err := h.repo.GetOrCreateRoom(c.Request.Context(), req.RoomID)
	if err != nil {
		h.log.Error("Failed to get or create room",
			zap.String("room_id", req.RoomID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to join room",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Add participant to room
	_, err = h.repo.AddParticipant(c.Request.Context(), req.RoomID, userID)
	if err != nil {
		h.log.Error("Failed to add participant",
			zap.String("room_id", req.RoomID),
			zap.String("user_id", userID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to add participant",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Update room status to CONNECTED
	if err := h.repo.UpdateRoomStatus(c.Request.Context(), req.RoomID, "CONNECTED"); err != nil {
		h.log.Warn("Failed to update room status",
			zap.String("room_id", req.RoomID),
			zap.Error(err),
		)
	}

	// Get all participants
	participants, err := h.repo.GetParticipants(c.Request.Context(), req.RoomID)
	if err != nil {
		h.log.Error("Failed to get participants",
			zap.String("room_id", req.RoomID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to get participants",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Convert to response format
	participantResponses := make([]models.ParticipantResponse, len(participants))
	for i, p := range participants {
		participantResponses[i] = p.ToResponse()
	}

	response := models.JoinRoomResponse{
		Status:       room.Status,
		Participants: participantResponses,
	}

	// Include the generated user_id in response for client to use
	c.JSON(http.StatusOK, gin.H{
		"status":       response.Status,
		"participants": response.Participants,
		"user_id":      userID, // Client needs this to identify themselves
	})
}

// LeaveRoom handles POST /api/room/leave
// Allows a user to leave a video room.
func (h *RoomHandler) LeaveRoom(c *gin.Context) {
	var req models.LeaveRoomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Remove participant from room
	if err := h.repo.RemoveParticipant(c.Request.Context(), req.RoomID, req.UserID); err != nil {
		h.log.Error("Failed to remove participant",
			zap.String("room_id", req.RoomID),
			zap.String("user_id", req.UserID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to leave room",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Check if room is empty
	participants, err := h.repo.GetParticipants(c.Request.Context(), req.RoomID)
	if err != nil {
		h.log.Warn("Failed to check participants after leave",
			zap.String("room_id", req.RoomID),
			zap.Error(err),
		)
	} else if len(participants) == 0 {
		// Update room status to DISCONNECTED if no participants
		if err := h.repo.UpdateRoomStatus(c.Request.Context(), req.RoomID, "DISCONNECTED"); err != nil {
			h.log.Warn("Failed to update room status to DISCONNECTED",
				zap.String("room_id", req.RoomID),
				zap.Error(err),
			)
		}
	}

	response := models.LeaveRoomResponse{
		Status: "OK",
	}

	c.JSON(http.StatusOK, response)
}

// GetRoomStatus handles GET /api/room/status
// Returns the current status of a room and its participants.
func (h *RoomHandler) GetRoomStatus(c *gin.Context) {
	roomID := c.Query("roomId")
	if roomID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "roomId query parameter is required",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Get room
	room, err := h.repo.GetOrCreateRoom(c.Request.Context(), roomID)
	if err != nil {
		h.log.Error("Failed to get room",
			zap.String("room_id", roomID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to get room status",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Get all participants
	participants, err := h.repo.GetParticipants(c.Request.Context(), roomID)
	if err != nil {
		h.log.Error("Failed to get participants",
			zap.String("room_id", roomID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to get participants",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Convert to response format
	participantResponses := make([]models.ParticipantResponse, len(participants))
	for i, p := range participants {
		participantResponses[i] = p.ToResponse()
	}

	response := models.RoomStatusResponse{
		Status:       room.Status,
		Participants: participantResponses,
	}

	c.JSON(http.StatusOK, response)
}

// SendMediaOffer handles POST /api/media/offer
// Handles WebRTC offer from client.
func (h *RoomHandler) SendMediaOffer(c *gin.Context) {
	var req models.MediaOfferRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Save the offer
	signal, err := h.repo.SaveWebRTCOffer(c.Request.Context(), req.RoomID, req.UserID, req.SDP)
	if err != nil {
		h.log.Error("Failed to save WebRTC offer",
			zap.String("room_id", req.RoomID),
			zap.String("user_id", req.UserID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to save offer",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// In a real WebRTC implementation, the answer would come from another peer
	// For this stateless implementation, we generate a simple SDP answer
	// Note: This is a placeholder. In production, use a proper WebRTC signaling server.
	sdpAnswer := generateSDPAnswer(req.SDP)

	// Save the answer
	if err := h.repo.SaveWebRTCAnswer(c.Request.Context(), signal.ID, sdpAnswer); err != nil {
		h.log.Warn("Failed to save WebRTC answer",
			zap.String("room_id", req.RoomID),
			zap.String("user_id", req.UserID),
			zap.Error(err),
		)
	}

	response := models.MediaOfferResponse{
		SDP: sdpAnswer,
	}

	c.JSON(http.StatusOK, response)
}

// SendICECandidate handles POST /api/media/iceCandidate
// Handles ICE candidate from client.
func (h *RoomHandler) SendICECandidate(c *gin.Context) {
	var req models.ICECandidateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// Save the ICE candidate
	if err := h.repo.SaveICECandidate(c.Request.Context(), req.RoomID, req.UserID, req.Candidate); err != nil {
		h.log.Error("Failed to save ICE candidate",
			zap.String("room_id", req.RoomID),
			zap.String("user_id", req.UserID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to save ICE candidate",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	response := models.ICECandidateResponse{
		Status: "OK",
	}

	c.JSON(http.StatusOK, response)
}

// generateSDPAnswer generates a placeholder SDP answer.
// Note: This is a simplified placeholder implementation.
// In production, use a proper WebRTC signaling server (e.g., WebSocket-based)
// or a selective forwarding unit (SFU) like mediasoup, Janus, or Pion WebRTC.
func generateSDPAnswer(offer string) string {
	// This is a placeholder implementation
	// In a real system, you would:
	// 1. Parse the SDP offer
	// 2. Create a peer connection
	// 3. Set the remote description (offer)
	// 4. Create an answer
	// 5. Return the SDP answer

	// For now, return a simple acknowledgment
	// The client will need to implement proper WebRTC peer connection handling
	return "v=0\no=- 0 0 IN IP4 127.0.0.1\ns=WebRTC Session\nt=0 0\na=group:BUNDLE 0\n"
}

// GetICECandidates handles GET /api/media/iceCandidates (optional helper endpoint)
// Returns ICE candidates for a room/user pair.
func (h *RoomHandler) GetICECandidates(c *gin.Context) {
	roomID := c.Query("roomId")
	userID := c.Query("userId")

	if roomID == "" || userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "roomId and userId query parameters are required",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	candidates, err := h.repo.GetICECandidates(c.Request.Context(), roomID, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":      "No ICE candidates found",
				"request_id": c.GetString("request_id"),
			})
			return
		}
		h.log.Error("Failed to get ICE candidates",
			zap.String("room_id", roomID),
			zap.String("user_id", userID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "Failed to get ICE candidates",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": candidates})
}
