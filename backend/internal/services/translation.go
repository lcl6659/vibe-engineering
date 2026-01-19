package services

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"go.uber.org/zap"
	"vibe-backend/internal/models"
)

// TranslationService handles translation operations.
type TranslationService struct {
	apiKey string
	model  string
	log    *zap.Logger
}

// NewTranslationService creates a new TranslationService.
// Uses OpenRouter API with Gemini model for translation.
func NewTranslationService(apiKey, model string, log *zap.Logger) *TranslationService {
	// Validate API key on service initialization
	if apiKey == "" {
		log.Warn("⚠️  OpenRouter API 密钥未设置（翻译服务）",
			zap.String("环境变量", "OPENROUTER_API_KEY"),
			zap.String("影响功能", "翻译功能将无法使用"),
		)
	} else {
		maskedKey := apiKey[:10] + "..." + apiKey[len(apiKey)-4:]
		log.Info("✅ 翻译服务已初始化",
			zap.String("model", model),
			zap.String("api_key", maskedKey),
		)
	}
	
	return &TranslationService{
		apiKey: apiKey,
		model:  model,
		log:    log,
	}
}

// DetectLanguage detects the language of the input text.
func (s *TranslationService) DetectLanguage(ctx context.Context, text string) (string, error) {
	// Use OpenRouter API to detect language
	prompt := fmt.Sprintf(`Detect the language of the following text and return ONLY the language code (e.g., "en" for English, "zh" for Chinese, "ja" for Japanese, etc.). Do not include any explanation.

Text: %s

Language code:`, text)

	req := map[string]interface{}{
		"model": s.model,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
		"temperature": 0.1,
		"max_tokens":  10,
	}

	result, err := s.callOpenRouter(ctx, req)
	if err != nil {
		return "", fmt.Errorf("language detection failed: %w", err)
	}

	// Extract language code from response
	langCode := strings.TrimSpace(result)
	langCode = strings.ToLower(langCode)

	// Normalize common language codes
	if strings.HasPrefix(langCode, "zh") {
		return "zh", nil
	}
	if strings.HasPrefix(langCode, "en") {
		return "en", nil
	}

	return langCode, nil
}

// TranslateText translates text from source language to target language.
func (s *TranslationService) TranslateText(ctx context.Context, text, sourceLang, targetLang string) (string, error) {
	// Build translation prompt
	var prompt string
	if sourceLang != "" {
		prompt = fmt.Sprintf(`Translate the following text from %s to %s. Return ONLY the translation without any explanation or additional text.

Text: %s

Translation:`, s.getLanguageName(sourceLang), s.getLanguageName(targetLang), text)
	} else {
		prompt = fmt.Sprintf(`Translate the following text to %s. Return ONLY the translation without any explanation or additional text.

Text: %s

Translation:`, s.getLanguageName(targetLang), text)
	}

	req := map[string]interface{}{
		"model": s.model,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
		"temperature": 0.3,
		"max_tokens":  2000,
	}

	result, err := s.callOpenRouter(ctx, req)
	if err != nil {
		return "", fmt.Errorf("translation failed: %w", err)
	}

	return strings.TrimSpace(result), nil
}

// TranslateBatch translates multiple text segments at once (more efficient for subtitles).
func (s *TranslationService) TranslateBatch(ctx context.Context, texts []string, sourceLang, targetLang string) ([]string, error) {
	if len(texts) == 0 {
		return []string{}, nil
	}

	// Build batch translation prompt
	var textList strings.Builder
	for i, text := range texts {
		textList.WriteString(fmt.Sprintf("%d. %s\n", i+1, text))
	}

	var prompt string
	if sourceLang != "" {
		prompt = fmt.Sprintf(`Translate the following numbered text segments from %s to %s. Return ONLY the translations in the same numbered format, without any explanation.

%s
Translations:`, s.getLanguageName(sourceLang), s.getLanguageName(targetLang), textList.String())
	} else {
		prompt = fmt.Sprintf(`Translate the following numbered text segments to %s. Return ONLY the translations in the same numbered format, without any explanation.

%s
Translations:`, s.getLanguageName(targetLang), textList.String())
	}

	req := map[string]interface{}{
		"model": s.model,
		"messages": []map[string]string{
			{
				"role":    "user",
				"content": prompt,
			},
		},
		"temperature": 0.3,
		"max_tokens":  4000,
	}

	result, err := s.callOpenRouter(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("batch translation failed: %w", err)
	}

	// Parse the numbered results
	translations := s.parseNumberedTranslations(result, len(texts))
	if len(translations) != len(texts) {
		s.log.Warn("Batch translation count mismatch",
			zap.Int("expected", len(texts)),
			zap.Int("got", len(translations)),
		)
		// Fallback: translate one by one if batch fails
		return s.translateOneByOne(ctx, texts, sourceLang, targetLang)
	}

	return translations, nil
}

// translateOneByOne translates texts one by one (fallback method).
func (s *TranslationService) translateOneByOne(ctx context.Context, texts []string, sourceLang, targetLang string) ([]string, error) {
	translations := make([]string, len(texts))
	for i, text := range texts {
		translated, err := s.TranslateText(ctx, text, sourceLang, targetLang)
		if err != nil {
			return nil, fmt.Errorf("failed to translate segment %d: %w", i+1, err)
		}
		translations[i] = translated
	}
	return translations, nil
}

// parseNumberedTranslations parses numbered translation results.
func (s *TranslationService) parseNumberedTranslations(result string, expectedCount int) []string {
	lines := strings.Split(result, "\n")
	translations := make([]string, 0, expectedCount)

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// Try to extract numbered format: "1. Translation text"
		parts := strings.SplitN(line, ".", 2)
		if len(parts) == 2 {
			translation := strings.TrimSpace(parts[1])
			if translation != "" {
				translations = append(translations, translation)
			}
		} else if !strings.Contains(line, ":") {
			// If not numbered, just add the line as translation
			translations = append(translations, line)
		}
	}

	return translations
}

// callOpenRouter makes a request to the OpenRouter API.
func (s *TranslationService) callOpenRouter(ctx context.Context, request map[string]interface{}) (string, error) {
	if s.apiKey == "" {
		return "", fmt.Errorf("OpenRouter API key not configured")
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", "https://openrouter.ai/api/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))
	req.Header.Set("HTTP-Referer", "https://vibe-engineering-playbook.com")
	req.Header.Set("X-Title", "Vibe Translation Service")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed to read response: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		// Special handling for 401 authentication errors
		if resp.StatusCode == http.StatusUnauthorized {
			s.log.Error("❌ OpenRouter API 认证失败 - API密钥无效 (翻译服务)",
				zap.Int("status_code", resp.StatusCode),
				zap.String("response_body", string(body)),
				zap.String("error_type", "AUTHENTICATION_FAILED"),
				zap.String("解决方案", "请检查 OPENROUTER_API_KEY 环境变量，访问 https://openrouter.ai/ 获取有效密钥"),
			)
			return "", fmt.Errorf("OpenRouter API 认证失败（401）: %s - 请检查 OPENROUTER_API_KEY 是否有效", string(body))
		}
		
		s.log.Error("OpenRouter API error",
			zap.Int("status", resp.StatusCode),
			zap.String("body", string(body)),
		)
		return "", fmt.Errorf("OpenRouter API returned status %d: %s", resp.StatusCode, string(body))
	}

	var result struct {
		Choices []struct {
			Message struct {
				Content string `json:"content"`
			} `json:"message"`
		} `json:"choices"`
		Error *struct {
			Message string `json:"message"`
		} `json:"error"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", fmt.Errorf("failed to parse response: %w", err)
	}

	if result.Error != nil {
		return "", fmt.Errorf("OpenRouter API error: %s", result.Error.Message)
	}

	if len(result.Choices) == 0 {
		return "", fmt.Errorf("no choices returned from OpenRouter API")
	}

	return result.Choices[0].Message.Content, nil
}

// getLanguageName returns the full language name for a language code.
func (s *TranslationService) getLanguageName(code string) string {
	code = strings.ToLower(code)

	languageMap := map[string]string{
		"en":      "English",
		"zh":      "Chinese",
		"zh-cn":   "Simplified Chinese",
		"zh-tw":   "Traditional Chinese",
		"zh-hans": "Simplified Chinese",
		"zh-hant": "Traditional Chinese",
		"ja":      "Japanese",
		"ko":      "Korean",
		"es":      "Spanish",
		"fr":      "French",
		"de":      "German",
		"ru":      "Russian",
		"ar":      "Arabic",
		"pt":      "Portuguese",
		"it":      "Italian",
	}

	if name, ok := languageMap[code]; ok {
		return name
	}
	return code
}

// ProcessTranslation processes a translation request and returns the result.
func (s *TranslationService) ProcessTranslation(ctx context.Context, req *models.TranslateRequest, transcriptService *TranscriptService) (*models.Translation, error) {
	translation := &models.Translation{
		TargetLanguage: req.TargetLanguage,
		EnableDualSubs: req.EnableDualSubs,
		Status:         "processing",
	}

	var sourceText string
	var sourceLang string

	// Step 1: Get source text
	if req.YoutubeURL != "" {
		// Extract video ID
		videoID, err := ExtractVideoID(req.YoutubeURL)
		if err != nil {
			return nil, fmt.Errorf("invalid YouTube URL: %w", err)
		}

		translation.YoutubeURL = req.YoutubeURL
		translation.VideoID = videoID

		// Get transcript
		transcript, err := transcriptService.GetTranscript(ctx, videoID)
		if err != nil {
			translation.Status = "failed"
			translation.ErrorMessage = err.Error()
			return translation, fmt.Errorf("failed to fetch transcript: %w", err)
		}

		// Combine all transcript segments
		var textBuilder strings.Builder
		for i, segment := range transcript.Transcripts {
			if i > 0 {
				textBuilder.WriteString("\n")
			}
			textBuilder.WriteString(segment.Text)
		}
		sourceText = textBuilder.String()

		// For dual subtitles mode, we'll translate segments individually
		if req.EnableDualSubs {
			return s.processWithDualSubtitles(ctx, translation, transcript.Transcripts, req)
		}
	} else {
		sourceText = req.SourceText
		translation.SourceText = req.SourceText
	}

	// Step 2: Detect source language if not provided
	if req.SourceLanguage != "" {
		sourceLang = req.SourceLanguage
	} else {
		detectedLang, err := s.DetectLanguage(ctx, sourceText)
		if err != nil {
			s.log.Warn("Failed to detect language, proceeding without source language",
				zap.Error(err),
			)
		} else {
			sourceLang = detectedLang
		}
	}
	translation.SourceLanguage = sourceLang

	// Step 3: Translate text
	translated, err := s.TranslateText(ctx, sourceText, sourceLang, req.TargetLanguage)
	if err != nil {
		translation.Status = "failed"
		translation.ErrorMessage = err.Error()
		return translation, fmt.Errorf("translation failed: %w", err)
	}

	translation.TranslatedText = translated
	translation.Status = "completed"

	return translation, nil
}

// processWithDualSubtitles processes translation with dual subtitles mode.
func (s *TranslationService) processWithDualSubtitles(ctx context.Context, translation *models.Translation, segments []TranscriptSegment, req *models.TranslateRequest) (*models.Translation, error) {
	// Extract texts from segments
	texts := make([]string, len(segments))
	for i, segment := range segments {
		texts[i] = segment.Text
	}

	// Detect source language from first segment
	var sourceLang string
	if req.SourceLanguage != "" {
		sourceLang = req.SourceLanguage
	} else if len(texts) > 0 {
		detectedLang, err := s.DetectLanguage(ctx, texts[0])
		if err != nil {
			s.log.Warn("Failed to detect language",
				zap.Error(err),
			)
		} else {
			sourceLang = detectedLang
		}
	}
	translation.SourceLanguage = sourceLang

	// Translate all segments
	translations, err := s.TranslateBatch(ctx, texts, sourceLang, req.TargetLanguage)
	if err != nil {
		translation.Status = "failed"
		translation.ErrorMessage = err.Error()
		return translation, fmt.Errorf("batch translation failed: %w", err)
	}

	// Create dual subtitle entries
	dualSubtitles := make([]models.DualSubtitle, len(segments))
	for i, segment := range segments {
		dualSubtitles[i] = models.DualSubtitle{
			Original:   segment.Text,
			Translated: translations[i],
			StartTime:  segment.Start,
			EndTime:    segment.End,
			OrderIndex: i,
		}
	}

	translation.DualSubtitles = dualSubtitles
	translation.Status = "completed"

	return translation, nil
}
