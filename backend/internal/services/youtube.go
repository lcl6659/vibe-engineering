package services

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strconv"
	"strings"
	"time"

	"go.uber.org/zap"
)

// YouTubeService handles YouTube video operations using OpenRouter and Gemini.
type YouTubeService struct {
	openRouterAPIKey string
	httpClient       *http.Client
	log              *zap.Logger
}

// NewYouTubeService creates a new YouTubeService.
func NewYouTubeService(apiKey string, log *zap.Logger) *YouTubeService {
	return &YouTubeService{
		openRouterAPIKey: apiKey,
		httpClient: &http.Client{
			Timeout: 120 * time.Second,
		},
		log: log,
	}
}

// VideoMetadata represents basic video information.
type VideoMetadata struct {
	VideoID      string
	Title        string
	Author       string
	ThumbnailURL string
	Duration     int // in seconds
}

// AnalysisResult represents the complete analysis of a video.
type AnalysisResult struct {
	Summary       string
	KeyPoints     []string
	Chapters      []ChapterData
	Transcription []TranscriptionData
}

// ChapterData represents a video chapter.
type ChapterData struct {
	Title     string
	Timestamp string
	Seconds   int
}

// TranscriptionData represents a transcription segment.
type TranscriptionData struct {
	Text      string
	Timestamp string
	Seconds   int
}

// ExtractVideoID extracts the YouTube video ID from various URL formats.
func (s *YouTubeService) ExtractVideoID(videoURL string) (string, error) {
	// Parse URL
	u, err := url.Parse(videoURL)
	if err != nil {
		return "", errors.New("invalid URL format")
	}

	// Check if it's a YouTube domain
	if !strings.Contains(u.Host, "youtube.com") && !strings.Contains(u.Host, "youtu.be") {
		return "", errors.New("not a YouTube URL")
	}

	// Handle youtu.be format
	if strings.Contains(u.Host, "youtu.be") {
		videoID := strings.TrimPrefix(u.Path, "/")
		if videoID == "" {
			return "", errors.New("invalid YouTube URL")
		}
		return videoID, nil
	}

	// Handle youtube.com format
	query := u.Query()
	videoID := query.Get("v")
	if videoID == "" {
		return "", errors.New("video ID not found in URL")
	}

	return videoID, nil
}

// GetVideoMetadata fetches basic video metadata.
// Note: This is a simplified version. In production, you would use YouTube Data API v3.
// For now, we'll use Gemini to extract metadata from the URL.
func (s *YouTubeService) GetVideoMetadata(ctx context.Context, videoURL string) (*VideoMetadata, error) {
	videoID, err := s.ExtractVideoID(videoURL)
	if err != nil {
		return nil, err
	}

	// Call Gemini via OpenRouter to get video metadata
	prompt := fmt.Sprintf(`Extract metadata from this YouTube video URL: %s

Please provide the response in JSON format with the following structure:
{
  "title": "video title",
  "author": "channel name",
  "thumbnailUrl": "thumbnail URL",
  "duration": duration_in_seconds
}`, videoURL)

	response, err := s.callGemini(ctx, prompt)
	if err != nil {
		s.log.Error("Failed to get video metadata from Gemini", zap.Error(err))
		// Return basic metadata with video ID
		return &VideoMetadata{
			VideoID:      videoID,
			Title:        "Video " + videoID,
			Author:       "Unknown",
			ThumbnailURL: fmt.Sprintf("https://img.youtube.com/vi/%s/maxresdefault.jpg", videoID),
			Duration:     0,
		}, nil
	}

	// Parse response
	var metadata struct {
		Title        string `json:"title"`
		Author       string `json:"author"`
		ThumbnailURL string `json:"thumbnailUrl"`
		Duration     int    `json:"duration"`
	}

	if err := json.Unmarshal([]byte(response), &metadata); err != nil {
		s.log.Warn("Failed to parse metadata response, using defaults", zap.Error(err))
		return &VideoMetadata{
			VideoID:      videoID,
			Title:        "Video " + videoID,
			Author:       "Unknown",
			ThumbnailURL: fmt.Sprintf("https://img.youtube.com/vi/%s/maxresdefault.jpg", videoID),
			Duration:     0,
		}, nil
	}

	return &VideoMetadata{
		VideoID:      videoID,
		Title:        metadata.Title,
		Author:       metadata.Author,
		ThumbnailURL: metadata.ThumbnailURL,
		Duration:     metadata.Duration,
	}, nil
}

// AnalyzeVideo performs complete video analysis using Gemini.
func (s *YouTubeService) AnalyzeVideo(ctx context.Context, videoID, targetLanguage string) (*AnalysisResult, error) {
	videoURL := fmt.Sprintf("https://www.youtube.com/watch?v=%s", videoID)

	prompt := fmt.Sprintf(`Analyze this YouTube video: %s

Please extract and provide the following information in the target language (%s):

1. A summary (maximum 300 characters) of the video content
2. 3-5 key points from the video
3. Chapter breakdown with timestamps (format: MM:SS)
4. Complete transcription with timestamps for each segment

Provide the response in JSON format:
{
  "summary": "brief summary (max 300 chars)",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "chapters": [
    {"title": "Introduction", "timestamp": "00:00", "seconds": 0},
    {"title": "Main Topic", "timestamp": "05:12", "seconds": 312}
  ],
  "transcription": [
    {"text": "transcribed text", "timestamp": "00:00", "seconds": 0},
    {"text": "more text", "timestamp": "00:15", "seconds": 15}
  ]
}

IMPORTANT:
- Summary must be 300 characters or less
- Provide 3-5 key points
- Use %s for all text content
- Timestamps must be in MM:SS format
- Convert timestamps to seconds`, videoURL, targetLanguage, targetLanguage)

	response, err := s.callGemini(ctx, prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze video: %w", err)
	}

	// Parse the response
	var result struct {
		Summary       string `json:"summary"`
		KeyPoints     []string `json:"keyPoints"`
		Chapters      []struct {
			Title     string `json:"title"`
			Timestamp string `json:"timestamp"`
			Seconds   int    `json:"seconds"`
		} `json:"chapters"`
		Transcription []struct {
			Text      string `json:"text"`
			Timestamp string `json:"timestamp"`
			Seconds   int    `json:"seconds"`
		} `json:"transcription"`
	}

	if err := json.Unmarshal([]byte(response), &result); err != nil {
		return nil, fmt.Errorf("failed to parse analysis response: %w", err)
	}

	// Convert to our domain types
	analysisResult := &AnalysisResult{
		Summary:   result.Summary,
		KeyPoints: result.KeyPoints,
		Chapters:  make([]ChapterData, len(result.Chapters)),
		Transcription: make([]TranscriptionData, len(result.Transcription)),
	}

	for i, ch := range result.Chapters {
		analysisResult.Chapters[i] = ChapterData{
			Title:     ch.Title,
			Timestamp: ch.Timestamp,
			Seconds:   ch.Seconds,
		}
	}

	for i, tr := range result.Transcription {
		analysisResult.Transcription[i] = TranscriptionData{
			Text:      tr.Text,
			Timestamp: tr.Timestamp,
			Seconds:   tr.Seconds,
		}
	}

	return analysisResult, nil
}

// callGemini calls the Gemini API via OpenRouter.
func (s *YouTubeService) callGemini(ctx context.Context, prompt string) (string, error) {
	const openRouterURL = "https://openrouter.ai/api/v1/chat/completions"
	const geminiModel = "google/gemini-2.0-flash-exp:free"

	requestBody := map[string]interface{}{
		"model": geminiModel,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
	}

	jsonBody, err := json.Marshal(requestBody)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", openRouterURL, bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+s.openRouterAPIKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call OpenRouter API: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		s.log.Error("OpenRouter API error",
			zap.Int("status", resp.StatusCode),
			zap.String("response", string(body)),
		)
		return "", fmt.Errorf("OpenRouter API returned status %d: %s", resp.StatusCode, string(body))
	}

	// Parse response
	var apiResponse struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
	}

	if err := json.Unmarshal(body, &apiResponse); err != nil {
		return "", fmt.Errorf("failed to parse API response: %w", err)
	}

	if len(apiResponse.Choices) == 0 {
		return "", errors.New("no response from Gemini")
	}

	return apiResponse.Choices[0].Message.Content, nil
}

// TimestampToSeconds converts a timestamp string (MM:SS) to seconds.
func TimestampToSeconds(timestamp string) (int, error) {
	re := regexp.MustCompile(`^(\d+):(\d{2})$`)
	matches := re.FindStringSubmatch(timestamp)
	if matches == nil {
		return 0, errors.New("invalid timestamp format")
	}

	minutes, _ := strconv.Atoi(matches[1])
	seconds, _ := strconv.Atoi(matches[2])

	return minutes*60 + seconds, nil
}

// SecondsToTimestamp converts seconds to timestamp string (MM:SS).
func SecondsToTimestamp(seconds int) string {
	minutes := seconds / 60
	secs := seconds % 60
	return fmt.Sprintf("%02d:%02d", minutes, secs)
}
