package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"vibe-backend/internal/models"
	"vibe-backend/internal/repository"
)

const (
	// AuthorizationHeader is the HTTP header key for API key.
	AuthorizationHeader = "Authorization"
	// UserIDKey is the context key for user ID.
	UserIDKey = "user_id"
	// UserKey is the context key for full user object.
	UserKey = "user"
)

// Auth returns a Gin middleware that validates API key authentication.
func Auth(userRepo *repository.UserRepository, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetString(RequestIDKey)

		// Get API key from Authorization header
		authHeader := c.GetHeader(AuthorizationHeader)
		if authHeader == "" {
			log.Warn("Missing authorization header",
				zap.String("request_id", requestID),
				zap.String("path", c.Request.URL.Path),
			)
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Code:      "UNAUTHORIZED",
				Message:   "Missing authorization header.",
				RequestID: requestID,
			})
			c.Abort()
			return
		}

		// Extract API key (format: "Bearer <api_key>")
		apiKey := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer"))
		if apiKey == "" || apiKey == authHeader {
			log.Warn("Invalid authorization header format",
				zap.String("request_id", requestID),
				zap.String("path", c.Request.URL.Path),
			)
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Code:      "UNAUTHORIZED",
				Message:   "Invalid authorization header format. Use: Bearer <api_key>",
				RequestID: requestID,
			})
			c.Abort()
			return
		}

		// Validate API key
		user, err := userRepo.GetByAPIKey(c.Request.Context(), apiKey)
		if err != nil {
			log.Warn("Invalid API key",
				zap.String("request_id", requestID),
				zap.String("path", c.Request.URL.Path),
				zap.Error(err),
			)
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Code:      "UNAUTHORIZED",
				Message:   "Invalid API key.",
				RequestID: requestID,
			})
			c.Abort()
			return
		}

		// Set user information in context
		c.Set(UserIDKey, user.ID)
		c.Set(UserKey, user)

		log.Debug("User authenticated",
			zap.String("request_id", requestID),
			zap.Uint("user_id", user.ID),
			zap.String("email", user.Email),
		)

		c.Next()
	}
}

// OptionalAuth returns a Gin middleware that optionally validates authentication.
// If authentication is provided, it validates it. If not, the request continues without user context.
func OptionalAuth(userRepo *repository.UserRepository, log *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader(AuthorizationHeader)
		if authHeader == "" {
			c.Next()
			return
		}

		// Extract API key
		apiKey := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer"))
		if apiKey == "" || apiKey == authHeader {
			c.Next()
			return
		}

		// Validate API key (silently ignore errors)
		user, err := userRepo.GetByAPIKey(c.Request.Context(), apiKey)
		if err == nil {
			c.Set(UserIDKey, user.ID)
			c.Set(UserKey, user)
		}

		c.Next()
	}
}

// GetUserID extracts the user ID from the Gin context.
func GetUserID(c *gin.Context) (uint, bool) {
	userID, exists := c.Get(UserIDKey)
	if !exists {
		return 0, false
	}
	id, ok := userID.(uint)
	return id, ok
}

// GetUser extracts the full user object from the Gin context.
func GetUser(c *gin.Context) (*models.User, bool) {
	user, exists := c.Get(UserKey)
	if !exists {
		return nil, false
	}
	u, ok := user.(*models.User)
	return u, ok
}

// MustGetUserID extracts the user ID from context, panics if not found.
// Should only be used in handlers protected by Auth middleware.
func MustGetUserID(c *gin.Context) uint {
	userID, ok := GetUserID(c)
	if !ok {
		panic("user_id not found in context - Auth middleware not applied?")
	}
	return userID
}
