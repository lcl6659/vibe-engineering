package models

import (
	"time"

	"gorm.io/gorm"
)

// Translation represents a translation task.
type Translation struct {
	ID              uint           `json:"id" gorm:"primaryKey"`
	SourceText      string         `json:"source_text,omitempty" gorm:"type:text"`
	YoutubeURL      string         `json:"youtube_url,omitempty" gorm:"type:varchar(500)"`
	VideoID         string         `json:"video_id,omitempty" gorm:"type:varchar(50);index"`
	SourceLanguage  string         `json:"source_language,omitempty" gorm:"type:varchar(10)"`
	TargetLanguage  string         `json:"target_language" gorm:"type:varchar(10);not null"`
	TranslatedText  string         `json:"translated_text,omitempty" gorm:"type:text"`
	EnableDualSubs  bool           `json:"enable_dual_subtitles" gorm:"default:false"`
	Status          string         `json:"status" gorm:"type:varchar(50);default:'pending'"` // pending, processing, completed, failed
	ErrorMessage    string         `json:"error_message,omitempty" gorm:"type:text"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
	DualSubtitles   []DualSubtitle `json:"dual_subtitles,omitempty" gorm:"foreignKey:TranslationID;constraint:OnDelete:CASCADE"`
}

// TableName returns the table name for Translation model.
func (Translation) TableName() string {
	return "translations"
}

// DualSubtitle represents a bilingual subtitle entry.
type DualSubtitle struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	TranslationID uint      `json:"translation_id" gorm:"index;not null"`
	Original      string    `json:"original" gorm:"type:text"`
	Translated    string    `json:"translated" gorm:"type:text"`
	StartTime     string    `json:"start_time,omitempty" gorm:"type:varchar(20)"` // e.g., "00:00:15.000"
	EndTime       string    `json:"end_time,omitempty" gorm:"type:varchar(20)"`   // e.g., "00:00:18.000"
	OrderIndex    int       `json:"order_index"`                                  // for maintaining order
	CreatedAt     time.Time `json:"created_at"`
}

// TableName returns the table name for DualSubtitle model.
func (DualSubtitle) TableName() string {
	return "dual_subtitles"
}

// TranslateRequest represents the translation API request.
type TranslateRequest struct {
	SourceText      string `json:"source_text,omitempty"`
	YoutubeURL      string `json:"youtube_url,omitempty"`
	SourceLanguage  string `json:"source_language,omitempty"`
	TargetLanguage  string `json:"target_language" binding:"required"`
	EnableDualSubs  bool   `json:"enable_dual_subtitles"`
}

// Validate validates the translation request.
func (r *TranslateRequest) Validate() error {
	if r.SourceText == "" && r.YoutubeURL == "" {
		return ErrTranslationInvalidInput
	}
	if r.SourceText != "" && r.YoutubeURL != "" {
		return ErrTranslationInvalidInput
	}
	if r.TargetLanguage == "" {
		return ErrTranslationInvalidInput
	}
	return nil
}

// DualSubtitleResponse represents a bilingual subtitle in the API response.
type DualSubtitleResponse struct {
	Original   string `json:"original"`
	Translated string `json:"translated"`
	StartTime  string `json:"start_time,omitempty"`
	EndTime    string `json:"end_time,omitempty"`
}

// TranslateResponse represents the translation API response.
type TranslateResponse struct {
	Status         string                  `json:"status"`
	Message        string                  `json:"message,omitempty"`
	TranslatedText *string                 `json:"translated_text,omitempty"`
	DualSubtitles  []DualSubtitleResponse  `json:"dual_subtitles,omitempty"`
	SourceLanguage *string                 `json:"source_language,omitempty"`
}

// Translation-specific error codes
const (
	ErrorTranslationInvalidInput ErrorCode = "TRANSLATION_INVALID_INPUT"
	ErrorYouTubeFetch            ErrorCode = "YOUTUBE_FETCH_ERROR"
	ErrorTranslation             ErrorCode = "TRANSLATION_ERROR"
	ErrorNoSubtitles             ErrorCode = "NO_SUBTITLES_AVAILABLE"
)

// Translation-specific errors
var (
	ErrTranslationInvalidInput = &ErrorResponse{
		Code:    ErrorTranslationInvalidInput,
		Message: "必须提供 source_text 或 youtube_url，且不能同时提供两者",
	}
	ErrTranslationYouTubeFetch = &ErrorResponse{
		Code:    ErrorYouTubeFetch,
		Message: "获取 YouTube 视频字幕失败",
	}
	ErrTranslationFailed = &ErrorResponse{
		Code:    ErrorTranslation,
		Message: "翻译失败",
	}
	ErrNoSubtitles = &ErrorResponse{
		Code:    ErrorNoSubtitles,
		Message: "该视频没有可用的字幕",
	}
)

// Error implements the error interface for ErrorResponse.
func (e *ErrorResponse) Error() string {
	return e.Message
}
