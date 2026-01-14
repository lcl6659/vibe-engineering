package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"vibe-backend/internal/models"
	"vibe-backend/internal/repository"
)

// InsightHandler handles InsightFlow HTTP requests.
type InsightHandler struct {
	repo *repository.InsightRepository
	log  *zap.Logger
}

// NewInsightHandler creates a new InsightHandler.
func NewInsightHandler(repo *repository.InsightRepository, log *zap.Logger) *InsightHandler {
	return &InsightHandler{
		repo: repo,
		log:  log,
	}
}

// List returns a list of insights grouped by date for the current user.
// GET /api/v1/insights
func (h *InsightHandler) List(c *gin.Context) {
	// TODO: Get user ID from JWT token
	userID := uint(1)

	search := c.Query("search")
	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	result, err := h.repo.GetByUserIDGroupedByDate(c.Request.Context(), userID, search, limit)
	if err != nil {
		h.log.Error("Failed to get insights", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取 Insight 列表失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": result})
}

// Get returns a single insight by ID with all related data.
// GET /api/v1/insights/:id
func (h *InsightHandler) Get(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Insight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	insight, err := h.repo.GetByIDWithRelations(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":      "Insight 不存在",
				"request_id": c.GetString("request_id"),
			})
			return
		}
		h.log.Error("Failed to get insight", zap.Error(err), zap.Uint64("id", id))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取 Insight 失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Verify user ownership
	c.JSON(http.StatusOK, gin.H{"data": insight})
}

// Create creates a new insight from a source URL.
// POST /api/v1/insights
func (h *InsightHandler) Create(c *gin.Context) {
	var req models.CreateInsightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Get user ID from JWT token
	userID := uint(1)

	// Set default target language
	if req.TargetLang == "" {
		req.TargetLang = "zh"
	}

	insight := &models.Insight{
		UserID:     userID,
		SourceURL:  req.SourceURL,
		TargetLang: req.TargetLang,
		Status:     models.InsightStatusPending,
	}

	// TODO: Detect source type from URL and extract source ID
	// For now, we'll leave this for Issue #178+ to implement fully

	if err := h.repo.Create(c.Request.Context(), insight); err != nil {
		h.log.Error("Failed to create insight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "创建 Insight 失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": models.CreateInsightResponse{
			ID:      insight.ID,
			Status:  insight.Status,
			Message: "Insight 创建成功，正在处理中",
		},
	})
}

// Update updates an existing insight.
// PATCH /api/v1/insights/:id
func (h *InsightHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Insight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	insight, err := h.repo.GetByID(c.Request.Context(), uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":      "Insight 不存在",
				"request_id": c.GetString("request_id"),
			})
			return
		}
		h.log.Error("Failed to get insight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取 Insight 失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Verify user ownership

	// Bind update fields
	var updates struct {
		Title      *string `json:"title"`
		TargetLang *string `json:"target_lang"`
	}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	if updates.Title != nil {
		insight.Title = *updates.Title
	}
	if updates.TargetLang != nil {
		insight.TargetLang = *updates.TargetLang
	}

	if err := h.repo.Update(c.Request.Context(), insight); err != nil {
		h.log.Error("Failed to update insight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "更新 Insight 失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": insight})
}

// Delete soft-deletes an insight.
// DELETE /api/v1/insights/:id
func (h *InsightHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Insight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Verify user ownership

	if err := h.repo.Delete(c.Request.Context(), uint(id)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":      "Insight 不存在",
				"request_id": c.GetString("request_id"),
			})
			return
		}
		h.log.Error("Failed to delete insight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "删除 Insight 失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Insight 已删除"})
}

// --- Highlight endpoints ---

// CreateHighlight creates a new highlight for an insight.
// POST /api/v1/insights/:id/highlights
func (h *InsightHandler) CreateHighlight(c *gin.Context) {
	insightIDStr := c.Param("id")
	insightID, err := strconv.ParseUint(insightIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Insight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	var req models.CreateHighlightRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Get user ID from JWT token
	userID := uint(1)

	// Verify insight exists
	if _, err := h.repo.GetByID(c.Request.Context(), uint(insightID)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":      "Insight 不存在",
				"request_id": c.GetString("request_id"),
			})
			return
		}
		h.log.Error("Failed to get insight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取 Insight 失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	color := req.Color
	if color == "" {
		color = "yellow"
	}

	highlight := &models.Highlight{
		InsightID:   uint(insightID),
		UserID:      userID,
		Text:        req.Text,
		StartOffset: req.StartOffset,
		EndOffset:   req.EndOffset,
		Color:       color,
		Note:        req.Note,
	}

	if err := h.repo.CreateHighlight(c.Request.Context(), highlight); err != nil {
		h.log.Error("Failed to create highlight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "创建高亮失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": highlight})
}

// ListHighlights returns all highlights for an insight.
// GET /api/v1/insights/:id/highlights
func (h *InsightHandler) ListHighlights(c *gin.Context) {
	insightIDStr := c.Param("id")
	insightID, err := strconv.ParseUint(insightIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Insight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	highlights, err := h.repo.GetHighlightsByInsightID(c.Request.Context(), uint(insightID))
	if err != nil {
		h.log.Error("Failed to get highlights", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取高亮列表失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": highlights})
}

// UpdateHighlight updates an existing highlight.
// PATCH /api/v1/insights/:id/highlights/:highlightId
func (h *InsightHandler) UpdateHighlight(c *gin.Context) {
	highlightIDStr := c.Param("highlightId")
	highlightID, err := strconv.ParseUint(highlightIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Highlight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	highlight, err := h.repo.GetHighlightByID(c.Request.Context(), uint(highlightID))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":      "高亮不存在",
				"request_id": c.GetString("request_id"),
			})
			return
		}
		h.log.Error("Failed to get highlight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取高亮失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Verify user ownership

	var updates struct {
		Color *string `json:"color"`
		Note  *string `json:"note"`
	}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	if updates.Color != nil {
		highlight.Color = *updates.Color
	}
	if updates.Note != nil {
		highlight.Note = *updates.Note
	}

	if err := h.repo.UpdateHighlight(c.Request.Context(), highlight); err != nil {
		h.log.Error("Failed to update highlight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "更新高亮失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": highlight})
}

// DeleteHighlight deletes a highlight.
// DELETE /api/v1/insights/:id/highlights/:highlightId
func (h *InsightHandler) DeleteHighlight(c *gin.Context) {
	highlightIDStr := c.Param("highlightId")
	highlightID, err := strconv.ParseUint(highlightIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Highlight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Verify user ownership

	if err := h.repo.DeleteHighlight(c.Request.Context(), uint(highlightID)); err != nil {
		h.log.Error("Failed to delete highlight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "删除高亮失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "高亮已删除"})
}

// --- Chat endpoints ---

// ListChatMessages returns all chat messages for an insight.
// GET /api/v1/insights/:id/chat
func (h *InsightHandler) ListChatMessages(c *gin.Context) {
	insightIDStr := c.Param("id")
	insightID, err := strconv.ParseUint(insightIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Insight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	limitStr := c.DefaultQuery("limit", "20")
	offsetStr := c.DefaultQuery("offset", "0")
	limit, _ := strconv.Atoi(limitStr)
	offset, _ := strconv.Atoi(offsetStr)

	messages, total, err := h.repo.GetChatMessagesByInsightIDPaginated(c.Request.Context(), uint(insightID), limit, offset)
	if err != nil {
		h.log.Error("Failed to get chat messages", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取对话历史失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   messages,
		"limit":  limit,
		"offset": offset,
		"total":  total,
	})
}

// CreateChatMessage creates a new chat message (user message).
// POST /api/v1/insights/:id/chat
// Note: AI responses will be handled separately via streaming in a future issue
func (h *InsightHandler) CreateChatMessage(c *gin.Context) {
	insightIDStr := c.Param("id")
	insightID, err := strconv.ParseUint(insightIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Insight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	var req models.ChatRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      err.Error(),
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Get user ID from JWT token
	userID := uint(1)

	// Verify insight exists
	if _, err := h.repo.GetByID(c.Request.Context(), uint(insightID)); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":      "Insight 不存在",
				"request_id": c.GetString("request_id"),
			})
			return
		}
		h.log.Error("Failed to get insight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取 Insight 失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	message := &models.ChatMessage{
		InsightID:   uint(insightID),
		UserID:      userID,
		Role:        "user",
		Content:     req.Message,
		HighlightID: req.HighlightID,
	}

	if err := h.repo.CreateChatMessage(c.Request.Context(), message); err != nil {
		h.log.Error("Failed to create chat message", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "创建消息失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Trigger AI response (will be implemented in Issue #181)
	c.JSON(http.StatusCreated, gin.H{
		"data": models.ChatResponse{
			ID:      message.ID,
			Role:    message.Role,
			Content: message.Content,
		},
	})
}

// ClearChatHistory clears all chat messages for an insight.
// DELETE /api/v1/insights/:id/chat
func (h *InsightHandler) ClearChatHistory(c *gin.Context) {
	insightIDStr := c.Param("id")
	insightID, err := strconv.ParseUint(insightIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的 Insight ID",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Verify user ownership

	if err := h.repo.DeleteChatMessagesByInsightID(c.Request.Context(), uint(insightID)); err != nil {
		h.log.Error("Failed to clear chat history", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "清空对话历史失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "对话历史已清空"})
}

// GetShared returns a publicly shared insight.
// GET /api/v1/shared/:token
func (h *InsightHandler) GetShared(c *gin.Context) {
	token := c.Param("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":      "无效的分享链接",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	insight, err := h.repo.GetByShareToken(c.Request.Context(), token)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error":      "分享链接不存在或已过期",
				"request_id": c.GetString("request_id"),
			})
			return
		}
		h.log.Error("Failed to get shared insight", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":      "获取分享内容失败",
			"request_id": c.GetString("request_id"),
		})
		return
	}

	// TODO: Apply ShareConfig to filter what's visible
	c.JSON(http.StatusOK, gin.H{"data": insight})
}
