package handlers

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"
	"vibe-backend/internal/middleware"
	"vibe-backend/internal/models"
	"vibe-backend/internal/repository"
)

// UserHandler handles user-related HTTP requests.
type UserHandler struct {
	userRepo *repository.UserRepository
	log      *zap.Logger
}

// NewUserHandler creates a new UserHandler.
func NewUserHandler(userRepo *repository.UserRepository, log *zap.Logger) *UserHandler {
	return &UserHandler{
		userRepo: userRepo,
		log:      log,
	}
}

// Register handles POST /api/v1/auth/register - user registration
func (h *UserHandler) Register(c *gin.Context) {
	requestID := c.GetString("request_id")

	// Parse request body
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.Warn("Invalid register request",
			zap.String("request_id", requestID),
			zap.Error(err),
		)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:      "INVALID_REQUEST",
			Message:   "Invalid request format.",
			RequestID: requestID,
		})
		return
	}

	// Check if user already exists
	existingUser, err := h.userRepo.GetByEmail(c.Request.Context(), req.Email)
	if err != nil && err != gorm.ErrRecordNotFound {
		h.log.Error("Failed to check existing user",
			zap.String("request_id", requestID),
			zap.String("email", req.Email),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to register user.",
			RequestID: requestID,
		})
		return
	}

	if existingUser != nil {
		h.log.Warn("User already exists",
			zap.String("request_id", requestID),
			zap.String("email", req.Email),
		)
		c.JSON(http.StatusConflict, models.ErrorResponse{
			Code:      "USER_EXISTS",
			Message:   "User with this email already exists.",
			RequestID: requestID,
		})
		return
	}

	// Create user
	user := &models.User{
		Email:    strings.ToLower(strings.TrimSpace(req.Email)),
		Password: req.Password, // Will be hashed in repository
		Name:     req.Name,
	}

	if err := h.userRepo.Create(c.Request.Context(), user); err != nil {
		h.log.Error("Failed to create user",
			zap.String("request_id", requestID),
			zap.String("email", req.Email),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to register user.",
			RequestID: requestID,
		})
		return
	}

	h.log.Info("User registered successfully",
		zap.String("request_id", requestID),
		zap.Uint("user_id", user.ID),
		zap.String("email", user.Email),
	)

	// Return user info and API key
	c.JSON(http.StatusCreated, models.AuthResponse{
		User: models.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			CreatedAt: user.CreatedAt,
		},
		APIKey: user.APIKey,
	})
}

// Login handles POST /api/v1/auth/login - user login
func (h *UserHandler) Login(c *gin.Context) {
	requestID := c.GetString("request_id")

	// Parse request body
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.Warn("Invalid login request",
			zap.String("request_id", requestID),
			zap.Error(err),
		)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:      "INVALID_REQUEST",
			Message:   "Invalid request format.",
			RequestID: requestID,
		})
		return
	}

	// Get user by email
	user, err := h.userRepo.GetByEmail(c.Request.Context(), strings.ToLower(strings.TrimSpace(req.Email)))
	if err != nil {
		h.log.Warn("User not found or invalid credentials",
			zap.String("request_id", requestID),
			zap.String("email", req.Email),
		)
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Code:      "INVALID_CREDENTIALS",
			Message:   "Invalid email or password.",
			RequestID: requestID,
		})
		return
	}

	// Verify password
	if !h.userRepo.VerifyPassword(user, req.Password) {
		h.log.Warn("Invalid password",
			zap.String("request_id", requestID),
			zap.String("email", req.Email),
		)
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Code:      "INVALID_CREDENTIALS",
			Message:   "Invalid email or password.",
			RequestID: requestID,
		})
		return
	}

	h.log.Info("User logged in successfully",
		zap.String("request_id", requestID),
		zap.Uint("user_id", user.ID),
		zap.String("email", user.Email),
	)

	// Return user info and API key
	c.JSON(http.StatusOK, models.AuthResponse{
		User: models.UserResponse{
			ID:        user.ID,
			Email:     user.Email,
			Name:      user.Name,
			CreatedAt: user.CreatedAt,
		},
		APIKey: user.APIKey,
	})
}

// GetProfile handles GET /api/v1/auth/profile - get current user profile
func (h *UserHandler) GetProfile(c *gin.Context) {
	requestID := c.GetString("request_id")
	userID := middleware.MustGetUserID(c)

	user, err := h.userRepo.GetByID(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("Failed to get user profile",
			zap.String("request_id", requestID),
			zap.Uint("user_id", userID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to get user profile.",
			RequestID: requestID,
		})
		return
	}

	c.JSON(http.StatusOK, models.UserResponse{
		ID:        user.ID,
		Email:     user.Email,
		Name:      user.Name,
		CreatedAt: user.CreatedAt,
	})
}

// RegenerateAPIKey handles POST /api/v1/auth/regenerate-key - regenerate API key
func (h *UserHandler) RegenerateAPIKey(c *gin.Context) {
	requestID := c.GetString("request_id")
	userID := middleware.MustGetUserID(c)

	apiKey, err := h.userRepo.RegenerateAPIKey(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("Failed to regenerate API key",
			zap.String("request_id", requestID),
			zap.Uint("user_id", userID),
			zap.Error(err),
		)
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to regenerate API key.",
			RequestID: requestID,
		})
		return
	}

	h.log.Info("API key regenerated",
		zap.String("request_id", requestID),
		zap.Uint("user_id", userID),
	)

	c.JSON(http.StatusOK, gin.H{
		"api_key": apiKey,
	})
}
