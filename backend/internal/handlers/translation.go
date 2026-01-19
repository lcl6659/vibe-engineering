package handlers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"vibe-backend/internal/models"
	"vibe-backend/internal/repository"
	"vibe-backend/internal/services"
)

// TranslationHandler handles translation endpoints.
type TranslationHandler struct {
	translationRepo   *repository.TranslationRepository
	translationSvc    *services.TranslationService
	transcriptSvc     *services.TranscriptService
	log               *zap.Logger
}

// NewTranslationHandler creates a new TranslationHandler.
func NewTranslationHandler(
	translationRepo *repository.TranslationRepository,
	translationSvc *services.TranslationService,
	transcriptSvc *services.TranscriptService,
	log *zap.Logger,
) *TranslationHandler {
	return &TranslationHandler{
		translationRepo: translationRepo,
		translationSvc:  translationSvc,
		transcriptSvc:   transcriptSvc,
		log:             log,
	}
}

// Translate handles translation requests.
// POST /api/translate
func (h *TranslationHandler) Translate(c *gin.Context) {
	var req models.TranslateRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.TranslateResponse{
			Status:  "error",
			Message: "请求参数无效: " + err.Error(),
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		h.log.Warn("Invalid translation request",
			zap.Error(err),
		)
		c.JSON(http.StatusBadRequest, models.TranslateResponse{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Process translation
	translation, err := h.translationSvc.ProcessTranslation(c.Request.Context(), &req, h.transcriptSvc)
	if err != nil {
		h.log.Error("Translation processing failed",
			zap.Error(err),
			zap.String("youtube_url", req.YoutubeURL),
			zap.String("target_language", req.TargetLanguage),
		)

		// Save failed translation
		if translation != nil {
			if saveErr := h.translationRepo.Create(c.Request.Context(), translation); saveErr != nil {
				h.log.Error("Failed to save failed translation record",
					zap.Error(saveErr),
				)
			}
		}

		c.JSON(http.StatusBadRequest, models.TranslateResponse{
			Status:  "error",
			Message: err.Error(),
		})
		return
	}

	// Save translation to database
	if err := h.translationRepo.Create(c.Request.Context(), translation); err != nil {
		h.log.Error("Failed to save translation",
			zap.Error(err),
		)
		// Continue anyway, return the result
	}

	// Save dual subtitles if enabled
	if req.EnableDualSubs && len(translation.DualSubtitles) > 0 {
		for i := range translation.DualSubtitles {
			translation.DualSubtitles[i].TranslationID = translation.ID
		}
		if err := h.translationRepo.CreateDualSubtitles(c.Request.Context(), translation.DualSubtitles); err != nil {
			h.log.Error("Failed to save dual subtitles",
				zap.Error(err),
			)
		}
	}

	// Build response
	response := models.TranslateResponse{
		Status: "success",
	}

	// Add source language if detected
	if translation.SourceLanguage != "" {
		response.SourceLanguage = &translation.SourceLanguage
	}

	if req.EnableDualSubs {
		// Return dual subtitles
		dualSubs := make([]models.DualSubtitleResponse, len(translation.DualSubtitles))
		for i, sub := range translation.DualSubtitles {
			dualSubs[i] = models.DualSubtitleResponse{
				Original:   sub.Original,
				Translated: sub.Translated,
				StartTime:  sub.StartTime,
				EndTime:    sub.EndTime,
			}
		}
		response.DualSubtitles = dualSubs
	} else {
		// Return translated text
		response.TranslatedText = &translation.TranslatedText
	}

	h.log.Info("Translation completed successfully",
		zap.Uint("translation_id", translation.ID),
		zap.String("target_language", req.TargetLanguage),
		zap.Bool("dual_subtitles", req.EnableDualSubs),
	)

	c.JSON(http.StatusOK, response)
}

// GetTranslation retrieves a translation by ID.
// GET /api/translate/:id
func (h *TranslationHandler) GetTranslation(c *gin.Context) {
	id := c.Param("id")
	if id == "" {
		c.JSON(http.StatusBadRequest, models.TranslateResponse{
			Status:  "error",
			Message: "Translation ID is required",
		})
		return
	}

	var translationID uint
	if _, err := fmt.Sscanf(id, "%d", &translationID); err != nil {
		c.JSON(http.StatusBadRequest, models.TranslateResponse{
			Status:  "error",
			Message: "Invalid translation ID",
		})
		return
	}

	translation, err := h.translationRepo.GetByID(c.Request.Context(), translationID)
	if err != nil {
		h.log.Error("Failed to get translation",
			zap.Error(err),
			zap.Uint("id", translationID),
		)
		c.JSON(http.StatusNotFound, models.TranslateResponse{
			Status:  "error",
			Message: "Translation not found",
		})
		return
	}

	// Build response
	response := models.TranslateResponse{
		Status: "success",
	}

	if translation.SourceLanguage != "" {
		response.SourceLanguage = &translation.SourceLanguage
	}

	if translation.EnableDualSubs {
		dualSubs := make([]models.DualSubtitleResponse, len(translation.DualSubtitles))
		for i, sub := range translation.DualSubtitles {
			dualSubs[i] = models.DualSubtitleResponse{
				Original:   sub.Original,
				Translated: sub.Translated,
				StartTime:  sub.StartTime,
				EndTime:    sub.EndTime,
			}
		}
		response.DualSubtitles = dualSubs
	} else {
		response.TranslatedText = &translation.TranslatedText
	}

	c.JSON(http.StatusOK, response)
}
