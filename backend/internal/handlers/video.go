package handlers

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
	"gorm.io/gorm"

	"vibe-backend/internal/models"
	"vibe-backend/internal/repository"
	"vibe-backend/internal/services"
)

// VideoHandler handles video analysis HTTP requests.
type VideoHandler struct {
	repo           *repository.VideoRepository
	youtubeService *services.YouTubeService
	log            *zap.Logger
}

// NewVideoHandler creates a new VideoHandler.
func NewVideoHandler(repo *repository.VideoRepository, youtubeService *services.YouTubeService, log *zap.Logger) *VideoHandler {
	return &VideoHandler{
		repo:           repo,
		youtubeService: youtubeService,
		log:            log,
	}
}

// GetMetadata fetches basic video metadata.
// POST /api/v1/videos/metadata
func (h *VideoHandler) GetMetadata(c *gin.Context) {
	var req models.MetadataRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    "INVALID_REQUEST",
			"message": err.Error(),
		})
		return
	}

	// Extract video ID
	videoID, err := h.youtubeService.ExtractVideoID(req.URL)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    "INVALID_URL",
			"message": "请输入有效的公开 YouTube 链接",
		})
		return
	}

	// Get metadata
	metadata, err := h.youtubeService.GetVideoMetadata(c.Request.Context(), req.URL)
	if err != nil {
		h.log.Error("Failed to get video metadata",
			zap.Error(err),
			zap.String("video_id", videoID),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "METADATA_FETCH_FAILED",
			"message": "无法获取视频信息",
		})
		return
	}

	// Check if it's a private video (simplified check)
	if metadata.Title == "" || metadata.Title == "Video "+videoID {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    "PRIVATE_VIDEO",
			"message": "无法解析私有或受版权保护的视频",
		})
		return
	}

	c.JSON(http.StatusOK, models.MetadataResponse{
		VideoID:      metadata.VideoID,
		Title:        metadata.Title,
		Author:       metadata.Author,
		ThumbnailURL: metadata.ThumbnailURL,
		Duration:     metadata.Duration,
	})
}

// AnalyzeVideo starts a video analysis job.
// POST /api/v1/videos/analyze
func (h *VideoHandler) AnalyzeVideo(c *gin.Context) {
	var req models.AnalyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    "INVALID_REQUEST",
			"message": err.Error(),
		})
		return
	}

	// TODO: Get user ID from JWT token
	userID := uint(1)

	// Generate job ID
	jobID := uuid.New().String()

	// Create analysis record
	analysis := &models.VideoAnalysis{
		UserID:         userID,
		VideoID:        req.VideoID,
		TargetLanguage: req.TargetLanguage,
		JobID:          jobID,
		Status:         "pending",
	}

	if err := h.repo.CreateAnalysis(c.Request.Context(), analysis); err != nil {
		h.log.Error("Failed to create analysis record",
			zap.Error(err),
			zap.String("video_id", req.VideoID),
		)
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "ANALYSIS_FAILED",
			"message": "无法创建解析任务",
		})
		return
	}

	// Start analysis in background
	go h.processAnalysis(context.Background(), analysis.ID, req.VideoID, req.TargetLanguage)

	c.JSON(http.StatusOK, models.AnalyzeResponse{
		JobID:  jobID,
		Status: "pending",
	})
}

// processAnalysis performs the actual video analysis asynchronously.
func (h *VideoHandler) processAnalysis(ctx context.Context, analysisID uint, videoID, targetLanguage string) {
	h.log.Info("Starting video analysis",
		zap.Uint("analysis_id", analysisID),
		zap.String("video_id", videoID),
	)

	// Perform analysis
	result, err := h.youtubeService.AnalyzeVideo(ctx, videoID, targetLanguage)
	if err != nil {
		h.log.Error("Video analysis failed",
			zap.Error(err),
			zap.String("video_id", videoID),
		)
		return
	}

	// Get the analysis record from database by ID
	analysisRecord, err := h.repo.GetAnalysisByID(ctx, analysisID)
	if err != nil {
		h.log.Error("Failed to retrieve analysis record", zap.Error(err))
		return
	}

	// Update analysis with results
	analysisRecord.Summary = result.Summary
	analysisRecord.Status = "completed"
	if err := h.repo.UpdateAnalysis(ctx, &analysisRecord); err != nil {
		h.log.Error("Failed to update analysis", zap.Error(err))
		return
	}

	// Save key points
	keyPoints := make([]models.KeyPoint, len(result.KeyPoints))
	for i, kp := range result.KeyPoints {
		keyPoints[i] = models.KeyPoint{
			AnalysisID: analysisID,
			Content:    kp,
			OrderIndex: i,
		}
	}
	if err := h.repo.CreateKeyPoints(ctx, keyPoints); err != nil {
		h.log.Error("Failed to save key points", zap.Error(err))
	}

	// Save chapters
	chapters := make([]models.Chapter, len(result.Chapters))
	for i, ch := range result.Chapters {
		chapters[i] = models.Chapter{
			AnalysisID: analysisID,
			Title:      ch.Title,
			Timestamp:  ch.Timestamp,
			Seconds:    ch.Seconds,
			OrderIndex: i,
		}
	}
	if err := h.repo.CreateChapters(ctx, chapters); err != nil {
		h.log.Error("Failed to save chapters", zap.Error(err))
	}

	// Save transcriptions
	transcriptions := make([]models.Transcription, len(result.Transcription))
	for i, tr := range result.Transcription {
		transcriptions[i] = models.Transcription{
			AnalysisID: analysisID,
			Text:       tr.Text,
			Timestamp:  tr.Timestamp,
			Seconds:    tr.Seconds,
			OrderIndex: i,
		}
	}
	if err := h.repo.CreateTranscriptions(ctx, transcriptions); err != nil {
		h.log.Error("Failed to save transcriptions", zap.Error(err))
	}

	h.log.Info("Video analysis completed",
		zap.Uint("analysis_id", analysisID),
		zap.String("video_id", videoID),
	)
}

// GetResult retrieves the analysis result by job ID.
// GET /api/v1/videos/result/:jobId
func (h *VideoHandler) GetResult(c *gin.Context) {
	jobID := c.Param("jobId")
	if jobID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    "INVALID_REQUEST",
			"message": "Job ID is required",
		})
		return
	}

	// Get analysis
	analysis, err := h.repo.GetAnalysisByJobID(c.Request.Context(), jobID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"code":    "JOB_NOT_FOUND",
				"message": "解析任务不存在",
			})
			return
		}
		h.log.Error("Failed to get analysis", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "INTERNAL_ERROR",
			"message": "获取解析结果失败",
		})
		return
	}

	// If still processing or pending, return status
	if analysis.Status == "pending" || analysis.Status == "processing" {
		c.JSON(http.StatusOK, models.AnalysisResultResponse{
			Status: analysis.Status,
		})
		return
	}

	// If failed, return error
	if analysis.Status == "failed" {
		c.JSON(http.StatusOK, gin.H{
			"code":    "ANALYSIS_FAILED",
			"message": "解析失败，请重试",
			"status":  "failed",
		})
		return
	}

	// Get related data
	keyPoints, err := h.repo.GetKeyPointsByAnalysisID(c.Request.Context(), analysis.ID)
	if err != nil {
		h.log.Error("Failed to get key points", zap.Error(err))
	}

	chapters, err := h.repo.GetChaptersByAnalysisID(c.Request.Context(), analysis.ID)
	if err != nil {
		h.log.Error("Failed to get chapters", zap.Error(err))
	}

	transcriptions, err := h.repo.GetTranscriptionsByAnalysisID(c.Request.Context(), analysis.ID)
	if err != nil {
		h.log.Error("Failed to get transcriptions", zap.Error(err))
	}

	// Convert to response format
	keyPointsStr := make([]string, len(keyPoints))
	for i, kp := range keyPoints {
		keyPointsStr[i] = kp.Content
	}

	chaptersResp := make([]models.ChapterResponse, len(chapters))
	for i, ch := range chapters {
		chaptersResp[i] = models.ChapterResponse{
			Title:     ch.Title,
			Timestamp: ch.Timestamp,
			Seconds:   ch.Seconds,
		}
	}

	transcriptionsResp := make([]models.TranscriptionResponse, len(transcriptions))
	for i, tr := range transcriptions {
		transcriptionsResp[i] = models.TranscriptionResponse{
			Text:      tr.Text,
			Timestamp: tr.Timestamp,
			Seconds:   tr.Seconds,
		}
	}

	c.JSON(http.StatusOK, models.AnalysisResultResponse{
		Status:        "completed",
		Summary:       analysis.Summary,
		KeyPoints:     keyPointsStr,
		Chapters:      chaptersResp,
		Transcription: transcriptionsResp,
	})
}

// GetHistory retrieves the user's analysis history.
// GET /api/v1/history
func (h *VideoHandler) GetHistory(c *gin.Context) {
	// TODO: Get user ID from JWT token
	userID := uint(1)

	analyses, err := h.repo.GetHistoryByUserID(c.Request.Context(), userID, 20)
	if err != nil {
		h.log.Error("Failed to get history", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "INTERNAL_ERROR",
			"message": "获取历史记录失败",
		})
		return
	}

	items := make([]models.HistoryItem, len(analyses))
	for i, a := range analyses {
		items[i] = models.HistoryItem{
			VideoID:      a.VideoID,
			Title:        a.Title,
			ThumbnailURL: a.ThumbnailURL,
			CreatedAt:    a.CreatedAt,
		}
	}

	c.JSON(http.StatusOK, models.HistoryResponse{
		Items: items,
	})
}

// ExportVideo exports the analysis results to PDF or Markdown.
// POST /api/v1/videos/export
func (h *VideoHandler) ExportVideo(c *gin.Context) {
	var req models.ExportRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"code":    "INVALID_REQUEST",
			"message": err.Error(),
		})
		return
	}

	// TODO: Get user ID from JWT token
	userID := uint(1)

	// Get latest analysis for this video
	analysis, err := h.repo.GetAnalysisByVideoID(c.Request.Context(), req.VideoID, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"code":    "VIDEO_NOT_FOUND",
				"message": "视频分析记录不存在",
			})
			return
		}
		h.log.Error("Failed to get analysis", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{
			"code":    "INTERNAL_ERROR",
			"message": "导出失败",
		})
		return
	}

	// Get all related data
	keyPoints, _ := h.repo.GetKeyPointsByAnalysisID(c.Request.Context(), analysis.ID)
	chapters, _ := h.repo.GetChaptersByAnalysisID(c.Request.Context(), analysis.ID)
	transcriptions, _ := h.repo.GetTranscriptionsByAnalysisID(c.Request.Context(), analysis.ID)

	// Generate file based on format
	var content string
	var fileName string

	if req.Format == "markdown" {
		content = h.generateMarkdown(analysis, keyPoints, chapters, transcriptions)
		fileName = fmt.Sprintf("%s_%s.md", analysis.VideoID, time.Now().Format("20060102"))
	} else {
		// PDF export would require a PDF library (not implemented in this version)
		c.JSON(http.StatusNotImplemented, gin.H{
			"code":    "NOT_IMPLEMENTED",
			"message": "PDF 导出功能暂未实现",
		})
		return
	}

	// In a real implementation, you would upload to cloud storage and return a URL
	// For now, we'll return the content directly
	downloadURL := fmt.Sprintf("/api/v1/downloads/%s", fileName)

	c.JSON(http.StatusOK, models.ExportResponse{
		DownloadURL: downloadURL,
		FileName:    fileName,
	})
}

// generateMarkdown generates Markdown content from analysis data.
func (h *VideoHandler) generateMarkdown(
	analysis *models.VideoAnalysis,
	keyPoints []models.KeyPoint,
	chapters []models.Chapter,
	transcriptions []models.Transcription,
) string {
	var md string

	md += fmt.Sprintf("# %s\n\n", analysis.Title)
	md += fmt.Sprintf("**作者**: %s\n\n", analysis.Author)
	md += fmt.Sprintf("**视频ID**: %s\n\n", analysis.VideoID)
	md += fmt.Sprintf("**分析时间**: %s\n\n", analysis.CreatedAt.Format("2006-01-02 15:04:05"))
	md += "---\n\n"

	md += "## 摘要\n\n"
	md += analysis.Summary + "\n\n"

	md += "## 核心观点\n\n"
	for i, kp := range keyPoints {
		md += fmt.Sprintf("%d. %s\n", i+1, kp.Content)
	}
	md += "\n"

	md += "## 章节\n\n"
	for _, ch := range chapters {
		md += fmt.Sprintf("### [%s] %s\n\n", ch.Timestamp, ch.Title)
	}

	md += "## 完整转录\n\n"
	for _, tr := range transcriptions {
		md += fmt.Sprintf("**[%s]** %s\n\n", tr.Timestamp, tr.Text)
	}

	return md
}
