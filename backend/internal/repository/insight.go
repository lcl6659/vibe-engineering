package repository

import (
	"context"
	"time"

	"gorm.io/gorm"
	"vibe-backend/internal/models"
)

// InsightRepository handles database operations for insights.
type InsightRepository struct {
	db *gorm.DB
}

// NewInsightRepository creates a new InsightRepository.
func NewInsightRepository(db *gorm.DB) *InsightRepository {
	return &InsightRepository{db: db}
}

// Create creates a new insight record.
func (r *InsightRepository) Create(ctx context.Context, insight *models.Insight) error {
	return r.db.WithContext(ctx).Create(insight).Error
}

// GetByID returns an insight by ID.
func (r *InsightRepository) GetByID(ctx context.Context, id uint) (*models.Insight, error) {
	var insight models.Insight
	err := r.db.WithContext(ctx).First(&insight, id).Error
	if err != nil {
		return nil, err
	}
	return &insight, nil
}

// GetByIDWithRelations returns an insight by ID with highlights preloaded.
func (r *InsightRepository) GetByIDWithRelations(ctx context.Context, id uint) (*models.Insight, error) {
	var insight models.Insight
	err := r.db.WithContext(ctx).
		Preload("Highlights", func(db *gorm.DB) *gorm.DB {
			return db.Order("start_offset ASC")
		}).
		First(&insight, id).Error
	if err != nil {
		return nil, err
	}
	return &insight, nil
}

// GetByUserID returns insights for a user, optionally filtered by status.
func (r *InsightRepository) GetByUserID(ctx context.Context, userID uint, status *models.InsightStatus, limit, offset int) ([]models.Insight, int64, error) {
	var insights []models.Insight
	var total int64

	query := r.db.WithContext(ctx).Model(&models.Insight{}).Where("user_id = ?", userID)

	if status != nil {
		query = query.Where("status = ?", *status)
	}

	// Get total count
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&insights).Error

	return insights, total, err
}

// GetByUserIDGroupedByDate returns insights grouped by today, yesterday, and previous.
func (r *InsightRepository) GetByUserIDGroupedByDate(ctx context.Context, userID uint, search string, limit int) (*models.InsightListResponse, error) {
	var insights []models.Insight

	// Get current time boundaries
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	yesterdayStart := todayStart.AddDate(0, 0, -1)

	query := r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Order("created_at DESC")

	// Apply search filter if provided
	if search != "" {
		query = query.Where("title ILIKE ?", "%"+search+"%")
	}

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&insights).Error; err != nil {
		return nil, err
	}

	// Group by date
	response := &models.InsightListResponse{
		Today:     make([]models.InsightListItem, 0),
		Yesterday: make([]models.InsightListItem, 0),
		Previous:  make([]models.InsightListItem, 0),
		Total:     len(insights),
	}

	for _, insight := range insights {
		item := models.InsightListItem{
			ID:           insight.ID,
			SourceType:   insight.SourceType,
			Title:        insight.Title,
			Author:       insight.Author,
			ThumbnailURL: insight.ThumbnailURL,
			Status:       insight.Status,
			CreatedAt:    insight.CreatedAt,
		}

		if insight.CreatedAt.After(todayStart) || insight.CreatedAt.Equal(todayStart) {
			response.Today = append(response.Today, item)
		} else if insight.CreatedAt.After(yesterdayStart) || insight.CreatedAt.Equal(yesterdayStart) {
			response.Yesterday = append(response.Yesterday, item)
		} else {
			response.Previous = append(response.Previous, item)
		}
	}

	return response, nil
}

// GetBySourceID returns an insight by source ID and user ID.
func (r *InsightRepository) GetBySourceID(ctx context.Context, sourceID string, userID uint) (*models.Insight, error) {
	var insight models.Insight
	err := r.db.WithContext(ctx).
		Where("source_id = ? AND user_id = ?", sourceID, userID).
		Order("created_at DESC").
		First(&insight).Error
	if err != nil {
		return nil, err
	}
	return &insight, nil
}

// GetByShareToken returns an insight by share token.
func (r *InsightRepository) GetByShareToken(ctx context.Context, token string) (*models.Insight, error) {
	var insight models.Insight
	err := r.db.WithContext(ctx).
		Where("share_token = ? AND is_public = ?", token, true).
		Preload("Highlights", func(db *gorm.DB) *gorm.DB {
			return db.Order("start_offset ASC")
		}).
		First(&insight).Error
	if err != nil {
		return nil, err
	}
	return &insight, nil
}

// Update updates an insight record.
func (r *InsightRepository) Update(ctx context.Context, insight *models.Insight) error {
	return r.db.WithContext(ctx).Save(insight).Error
}

// UpdateStatus updates only the status and error message of an insight.
func (r *InsightRepository) UpdateStatus(ctx context.Context, id uint, status models.InsightStatus, errorMsg string) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}
	if errorMsg != "" {
		updates["error_message"] = errorMsg
	}
	return r.db.WithContext(ctx).Model(&models.Insight{}).Where("id = ?", id).Updates(updates).Error
}

// Delete soft-deletes an insight and all related records.
func (r *InsightRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Delete related records first (hard delete since they don't have DeletedAt)
		if err := tx.Where("insight_id = ?", id).Delete(&models.Highlight{}).Error; err != nil {
			return err
		}
		if err := tx.Where("insight_id = ?", id).Delete(&models.ChatMessage{}).Error; err != nil {
			return err
		}
		// Soft delete the insight
		return tx.Delete(&models.Insight{}, id).Error
	})
}

// --- Highlight operations ---

// CreateHighlight creates a new highlight record.
func (r *InsightRepository) CreateHighlight(ctx context.Context, highlight *models.Highlight) error {
	return r.db.WithContext(ctx).Create(highlight).Error
}

// GetHighlightsByInsightID returns all highlights for an insight.
func (r *InsightRepository) GetHighlightsByInsightID(ctx context.Context, insightID uint) ([]models.Highlight, error) {
	var highlights []models.Highlight
	err := r.db.WithContext(ctx).
		Where("insight_id = ?", insightID).
		Order("start_offset ASC").
		Find(&highlights).Error
	return highlights, err
}

// GetHighlightByID returns a highlight by ID.
func (r *InsightRepository) GetHighlightByID(ctx context.Context, id uint) (*models.Highlight, error) {
	var highlight models.Highlight
	err := r.db.WithContext(ctx).First(&highlight, id).Error
	if err != nil {
		return nil, err
	}
	return &highlight, nil
}

// UpdateHighlight updates a highlight record.
func (r *InsightRepository) UpdateHighlight(ctx context.Context, highlight *models.Highlight) error {
	return r.db.WithContext(ctx).Save(highlight).Error
}

// DeleteHighlight deletes a highlight record.
func (r *InsightRepository) DeleteHighlight(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Highlight{}, id).Error
}

// --- ChatMessage operations ---

// CreateChatMessage creates a new chat message record.
func (r *InsightRepository) CreateChatMessage(ctx context.Context, message *models.ChatMessage) error {
	return r.db.WithContext(ctx).Create(message).Error
}

// GetChatMessagesByInsightID returns all chat messages for an insight.
func (r *InsightRepository) GetChatMessagesByInsightID(ctx context.Context, insightID uint) ([]models.ChatMessage, error) {
	var messages []models.ChatMessage
	err := r.db.WithContext(ctx).
		Where("insight_id = ?", insightID).
		Order("created_at ASC").
		Find(&messages).Error
	return messages, err
}

// GetChatMessagesByInsightIDPaginated returns paginated chat messages for an insight.
func (r *InsightRepository) GetChatMessagesByInsightIDPaginated(ctx context.Context, insightID uint, limit, offset int) ([]models.ChatMessage, int64, error) {
	var messages []models.ChatMessage
	var total int64

	query := r.db.WithContext(ctx).Model(&models.ChatMessage{}).Where("insight_id = ?", insightID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&messages).Error

	return messages, total, err
}

// DeleteChatMessagesByInsightID deletes all chat messages for an insight.
func (r *InsightRepository) DeleteChatMessagesByInsightID(ctx context.Context, insightID uint) error {
	return r.db.WithContext(ctx).Where("insight_id = ?", insightID).Delete(&models.ChatMessage{}).Error
}
