package repository

import (
	"context"

	"gorm.io/gorm"
	"vibe-backend/internal/models"
)

// TranslationRepository handles database operations for translations.
type TranslationRepository struct {
	db *gorm.DB
}

// NewTranslationRepository creates a new TranslationRepository.
func NewTranslationRepository(db *gorm.DB) *TranslationRepository {
	return &TranslationRepository{db: db}
}

// Create creates a new translation record.
func (r *TranslationRepository) Create(ctx context.Context, translation *models.Translation) error {
	return r.db.WithContext(ctx).Create(translation).Error
}

// GetByID returns a translation by ID with dual subtitles.
func (r *TranslationRepository) GetByID(ctx context.Context, id uint) (*models.Translation, error) {
	var translation models.Translation
	err := r.db.WithContext(ctx).
		Preload("DualSubtitles", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index ASC")
		}).
		First(&translation, id).Error
	if err != nil {
		return nil, err
	}
	return &translation, nil
}

// GetByVideoID returns translations for a video ID.
func (r *TranslationRepository) GetByVideoID(ctx context.Context, videoID string, limit, offset int) ([]models.Translation, error) {
	var translations []models.Translation
	query := r.db.WithContext(ctx).
		Where("video_id = ?", videoID).
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	err := query.Find(&translations).Error
	return translations, err
}

// Update updates a translation record.
func (r *TranslationRepository) Update(ctx context.Context, translation *models.Translation) error {
	return r.db.WithContext(ctx).Save(translation).Error
}

// Delete soft deletes a translation record.
func (r *TranslationRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Translation{}, id).Error
}

// CreateDualSubtitles creates dual subtitle entries.
func (r *TranslationRepository) CreateDualSubtitles(ctx context.Context, subtitles []models.DualSubtitle) error {
	if len(subtitles) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(&subtitles).Error
}

// GetDualSubtitles returns dual subtitles for a translation.
func (r *TranslationRepository) GetDualSubtitles(ctx context.Context, translationID uint) ([]models.DualSubtitle, error) {
	var subtitles []models.DualSubtitle
	err := r.db.WithContext(ctx).
		Where("translation_id = ?", translationID).
		Order("order_index ASC").
		Find(&subtitles).Error
	return subtitles, err
}

// CountByVideoID returns the count of translations for a video.
func (r *TranslationRepository) CountByVideoID(ctx context.Context, videoID string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Translation{}).
		Where("video_id = ?", videoID).
		Count(&count).Error
	return count, err
}
