package repository

import (
	"context"

	"gorm.io/gorm"
	"vibe-backend/internal/models"
)

// VideoRepository handles database operations for video analyses.
type VideoRepository struct {
	db *gorm.DB
}

// NewVideoRepository creates a new VideoRepository.
func NewVideoRepository(db *gorm.DB) *VideoRepository {
	return &VideoRepository{db: db}
}

// CreateAnalysis creates a new video analysis record.
func (r *VideoRepository) CreateAnalysis(ctx context.Context, analysis *models.VideoAnalysis) error {
	return r.db.WithContext(ctx).Create(analysis).Error
}

// GetAnalysisByID returns a video analysis by ID.
func (r *VideoRepository) GetAnalysisByID(ctx context.Context, id uint) (*models.VideoAnalysis, error) {
	var analysis models.VideoAnalysis
	err := r.db.WithContext(ctx).First(&analysis, id).Error
	if err != nil {
		return nil, err
	}
	return &analysis, nil
}

// GetAnalysisByJobID returns a video analysis by job ID.
func (r *VideoRepository) GetAnalysisByJobID(ctx context.Context, jobID string) (*models.VideoAnalysis, error) {
	var analysis models.VideoAnalysis
	err := r.db.WithContext(ctx).Where("job_id = ?", jobID).First(&analysis).Error
	if err != nil {
		return nil, err
	}
	return &analysis, nil
}

// GetAnalysisByVideoID returns the latest analysis for a video ID.
func (r *VideoRepository) GetAnalysisByVideoID(ctx context.Context, videoID string, userID uint) (*models.VideoAnalysis, error) {
	var analysis models.VideoAnalysis
	err := r.db.WithContext(ctx).
		Where("video_id = ? AND user_id = ?", videoID, userID).
		Order("created_at DESC").
		First(&analysis).Error
	if err != nil {
		return nil, err
	}
	return &analysis, nil
}

// UpdateAnalysis updates a video analysis record.
func (r *VideoRepository) UpdateAnalysis(ctx context.Context, analysis *models.VideoAnalysis) error {
	return r.db.WithContext(ctx).Save(analysis).Error
}

// GetHistoryByUserID returns all video analyses for a user.
func (r *VideoRepository) GetHistoryByUserID(ctx context.Context, userID uint, limit int) ([]models.VideoAnalysis, error) {
	var analyses []models.VideoAnalysis
	query := r.db.WithContext(ctx).
		Where("user_id = ? AND status = ?", userID, "completed").
		Order("created_at DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&analyses).Error
	return analyses, err
}

// CreateChapters creates multiple chapter records.
func (r *VideoRepository) CreateChapters(ctx context.Context, chapters []models.Chapter) error {
	if len(chapters) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(&chapters).Error
}

// GetChaptersByAnalysisID returns all chapters for an analysis.
func (r *VideoRepository) GetChaptersByAnalysisID(ctx context.Context, analysisID uint) ([]models.Chapter, error) {
	var chapters []models.Chapter
	err := r.db.WithContext(ctx).
		Where("analysis_id = ?", analysisID).
		Order("order_index ASC").
		Find(&chapters).Error
	return chapters, err
}

// CreateTranscriptions creates multiple transcription records.
func (r *VideoRepository) CreateTranscriptions(ctx context.Context, transcriptions []models.Transcription) error {
	if len(transcriptions) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(&transcriptions).Error
}

// GetTranscriptionsByAnalysisID returns all transcriptions for an analysis.
func (r *VideoRepository) GetTranscriptionsByAnalysisID(ctx context.Context, analysisID uint) ([]models.Transcription, error) {
	var transcriptions []models.Transcription
	err := r.db.WithContext(ctx).
		Where("analysis_id = ?", analysisID).
		Order("order_index ASC").
		Find(&transcriptions).Error
	return transcriptions, err
}

// CreateKeyPoints creates multiple key point records.
func (r *VideoRepository) CreateKeyPoints(ctx context.Context, keyPoints []models.KeyPoint) error {
	if len(keyPoints) == 0 {
		return nil
	}
	return r.db.WithContext(ctx).Create(&keyPoints).Error
}

// GetKeyPointsByAnalysisID returns all key points for an analysis.
func (r *VideoRepository) GetKeyPointsByAnalysisID(ctx context.Context, analysisID uint) ([]models.KeyPoint, error) {
	var keyPoints []models.KeyPoint
	err := r.db.WithContext(ctx).
		Where("analysis_id = ?", analysisID).
		Order("order_index ASC").
		Find(&keyPoints).Error
	return keyPoints, err
}

// DeleteAnalysis deletes a video analysis and all related records.
func (r *VideoRepository) DeleteAnalysis(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// Delete related records first
		if err := tx.Where("analysis_id = ?", id).Delete(&models.Chapter{}).Error; err != nil {
			return err
		}
		if err := tx.Where("analysis_id = ?", id).Delete(&models.Transcription{}).Error; err != nil {
			return err
		}
		if err := tx.Where("analysis_id = ?", id).Delete(&models.KeyPoint{}).Error; err != nil {
			return err
		}
		// Delete the analysis
		return tx.Delete(&models.VideoAnalysis{}, id).Error
	})
}
