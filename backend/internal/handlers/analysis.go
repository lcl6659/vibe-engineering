package handlers

import (
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"vibe-backend/internal/models"
	"vibe-backend/internal/repository"
)

// AnalysisHandler handles analysis HTTP requests.
type AnalysisHandler struct {
	repo *repository.AnalysisRepository
	log  *zap.Logger
}

// NewAnalysisHandler creates a new AnalysisHandler.
func NewAnalysisHandler(repo *repository.AnalysisRepository, log *zap.Logger) *AnalysisHandler {
	return &AnalysisHandler{
		repo: repo,
		log:  log,
	}
}

// Get retrieves an analysis record by ID.
// GET /api/analysis/:id
func (h *AnalysisHandler) Get(c *gin.Context) {
	requestID := c.GetString("request_id")
	analysisIDStr := c.Param("id")

	// Parse analysis ID
	analysisID, err := strconv.ParseUint(analysisIDStr, 10, 32)
	if err != nil {
		h.log.Warn("Invalid analysis ID format",
			zap.String("analysis_id", analysisIDStr),
			zap.String("request_id", requestID),
			zap.Error(err),
		)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:      "INVALID_ID",
			Message:   "Invalid analysis ID format.",
			RequestID: requestID,
		})
		return
	}

	// Get analysis from database
	analysis, err := h.repo.GetByID(c.Request.Context(), uint(analysisID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Log error with required fields: error code, analysis_id, request_id, timestamp
			h.log.Error("Analysis record not found",
				zap.String("error_code", "ANALYSIS_NOT_FOUND"),
				zap.Uint64("analysis_id", analysisID),
				zap.String("request_id", requestID),
			)

			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Code:      "ANALYSIS_NOT_FOUND",
				Message:   "Analysis record not found.",
				RequestID: requestID,
			})
			return
		}

		// Database connection or other internal errors
		h.log.Error("Failed to retrieve analysis record",
			zap.String("error_code", "INTERNAL_SERVER_ERROR"),
			zap.Uint64("analysis_id", analysisID),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to connect to database.",
			RequestID: requestID,
		})
		return
	}

	// Success response
	c.JSON(http.StatusOK, gin.H{
		"data": models.AnalysisResponse{
			ID:   fmt.Sprintf("%d", analysis.ID),
			Data: analysis.Data,
		},
	})
}

// List retrieves all analysis records with pagination.
// GET /api/analysis
func (h *AnalysisHandler) List(c *gin.Context) {
	requestID := c.GetString("request_id")

	// Get pagination parameters
	limit := 20
	offset := 0

	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	analyses, total, err := h.repo.List(c.Request.Context(), limit, offset)
	if err != nil {
		h.log.Error("Failed to retrieve analysis list",
			zap.String("error_code", "INTERNAL_SERVER_ERROR"),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to connect to database.",
			RequestID: requestID,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   analyses,
		"limit":  limit,
		"offset": offset,
		"total":  total,
	})
}

// Create creates a new analysis record.
// POST /api/analysis
func (h *AnalysisHandler) Create(c *gin.Context) {
	requestID := c.GetString("request_id")

	var req struct {
		Data string `json:"data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.Warn("Invalid request body",
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:      "INVALID_REQUEST",
			Message:   fmt.Sprintf("Invalid request format: %v", err),
			RequestID: requestID,
		})
		return
	}

	analysis := &models.Analysis{
		Data: req.Data,
	}

	if err := h.repo.Create(c.Request.Context(), analysis); err != nil {
		h.log.Error("Failed to create analysis record",
			zap.String("error_code", "INTERNAL_SERVER_ERROR"),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to create analysis record.",
			RequestID: requestID,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": models.AnalysisResponse{
			ID:   fmt.Sprintf("%d", analysis.ID),
			Data: analysis.Data,
		},
	})
}

// Update updates an existing analysis record.
// PATCH /api/analysis/:id
func (h *AnalysisHandler) Update(c *gin.Context) {
	requestID := c.GetString("request_id")
	analysisIDStr := c.Param("id")

	analysisID, err := strconv.ParseUint(analysisIDStr, 10, 32)
	if err != nil {
		h.log.Warn("Invalid analysis ID format",
			zap.String("analysis_id", analysisIDStr),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:      "INVALID_ID",
			Message:   "Invalid analysis ID format.",
			RequestID: requestID,
		})
		return
	}

	var req struct {
		Data string `json:"data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.Warn("Invalid request body",
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:      "INVALID_REQUEST",
			Message:   fmt.Sprintf("Invalid request format: %v", err),
			RequestID: requestID,
		})
		return
	}

	analysis, err := h.repo.GetByID(c.Request.Context(), uint(analysisID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.Error("Analysis record not found",
				zap.String("error_code", "ANALYSIS_NOT_FOUND"),
				zap.Uint64("analysis_id", analysisID),
				zap.String("request_id", requestID),
			)

			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Code:      "ANALYSIS_NOT_FOUND",
				Message:   "Analysis record not found.",
				RequestID: requestID,
			})
			return
		}

		h.log.Error("Failed to retrieve analysis record",
			zap.String("error_code", "INTERNAL_SERVER_ERROR"),
			zap.Uint64("analysis_id", analysisID),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to connect to database.",
			RequestID: requestID,
		})
		return
	}

	analysis.Data = req.Data
	if err := h.repo.Update(c.Request.Context(), analysis); err != nil {
		h.log.Error("Failed to update analysis record",
			zap.String("error_code", "INTERNAL_SERVER_ERROR"),
			zap.Uint64("analysis_id", analysisID),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to update analysis record.",
			RequestID: requestID,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": models.AnalysisResponse{
			ID:   fmt.Sprintf("%d", analysis.ID),
			Data: analysis.Data,
		},
	})
}

// Delete deletes an analysis record.
// DELETE /api/analysis/:id
func (h *AnalysisHandler) Delete(c *gin.Context) {
	requestID := c.GetString("request_id")
	analysisIDStr := c.Param("id")

	analysisID, err := strconv.ParseUint(analysisIDStr, 10, 32)
	if err != nil {
		h.log.Warn("Invalid analysis ID format",
			zap.String("analysis_id", analysisIDStr),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Code:      "INVALID_ID",
			Message:   "Invalid analysis ID format.",
			RequestID: requestID,
		})
		return
	}

	// Check if record exists
	_, err = h.repo.GetByID(c.Request.Context(), uint(analysisID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			h.log.Error("Analysis record not found",
				zap.String("error_code", "ANALYSIS_NOT_FOUND"),
				zap.Uint64("analysis_id", analysisID),
				zap.String("request_id", requestID),
			)

			c.JSON(http.StatusNotFound, models.ErrorResponse{
				Code:      "ANALYSIS_NOT_FOUND",
				Message:   "Analysis record not found.",
				RequestID: requestID,
			})
			return
		}

		h.log.Error("Failed to retrieve analysis record",
			zap.String("error_code", "INTERNAL_SERVER_ERROR"),
			zap.Uint64("analysis_id", analysisID),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to connect to database.",
			RequestID: requestID,
		})
		return
	}

	if err := h.repo.Delete(c.Request.Context(), uint(analysisID)); err != nil {
		h.log.Error("Failed to delete analysis record",
			zap.String("error_code", "INTERNAL_SERVER_ERROR"),
			zap.Uint64("analysis_id", analysisID),
			zap.String("request_id", requestID),
			zap.Error(err),
		)

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Code:      "INTERNAL_SERVER_ERROR",
			Message:   "Failed to delete analysis record.",
			RequestID: requestID,
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Analysis record deleted successfully",
	})
}
