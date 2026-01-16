package repository

import (
	"context"

	"gorm.io/gorm"
	"vibe-backend/internal/models"
)

// AnalysisRepository handles database operations for analysis records.
type AnalysisRepository struct {
	db *gorm.DB
}

// NewAnalysisRepository creates a new AnalysisRepository.
func NewAnalysisRepository(db *gorm.DB) *AnalysisRepository {
	return &AnalysisRepository{db: db}
}

// GetByID retrieves an analysis record by ID.
func (r *AnalysisRepository) GetByID(ctx context.Context, id uint) (*models.Analysis, error) {
	var analysis models.Analysis
	err := r.db.WithContext(ctx).First(&analysis, id).Error
	if err != nil {
		return nil, err
	}
	return &analysis, nil
}

// Create creates a new analysis record.
func (r *AnalysisRepository) Create(ctx context.Context, analysis *models.Analysis) error {
	return r.db.WithContext(ctx).Create(analysis).Error
}

// Update updates an existing analysis record.
func (r *AnalysisRepository) Update(ctx context.Context, analysis *models.Analysis) error {
	return r.db.WithContext(ctx).Save(analysis).Error
}

// Delete soft deletes an analysis record.
func (r *AnalysisRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Analysis{}, id).Error
}

// List retrieves all analysis records with pagination.
func (r *AnalysisRepository) List(ctx context.Context, limit, offset int) ([]models.Analysis, int64, error) {
	var analyses []models.Analysis
	var total int64

	// Get total count
	if err := r.db.WithContext(ctx).Model(&models.Analysis{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Get paginated results
	err := r.db.WithContext(ctx).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&analyses).Error

	return analyses, total, err
}
