package models

import "time"

// Entity represents a detected entity in the content.
type Entity struct {
	Type   string `json:"type"`   // "stock", "crypto", etc.
	Name   string `json:"name"`   // "NVIDIA", "Bitcoin"
	Ticker string `json:"ticker"` // "NVDA", "BTC"
}

// Suggestion represents an AI-generated suggestion.
type Suggestion struct {
	Type   string `json:"type"`   // "position", "prediction"
	Entity string `json:"entity"` // ticker
	Prompt string `json:"prompt"` // suggested prompt
}

// Request/Response DTOs

// ChatMessageResponse represents a single message in the response.
type ChatMessageResponse struct {
	ID        uint      `json:"id"`
	Role      string    `json:"role"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"created_at"`
}

// ChatHistoryResponse represents the chat history response.
type ChatHistoryResponse struct {
	Messages []ChatMessageResponse `json:"messages"`
}

// ChatStreamEvent represents a streaming chat event.
type ChatStreamEvent struct {
	Role      string `json:"role"`
	Content   string `json:"content"`
	Done      bool   `json:"done"`
	MessageID *uint  `json:"message_id,omitempty"`
}

// AnalyzeEntitiesResponse represents the entity analysis response.
type AnalyzeEntitiesResponse struct {
	Entities    []Entity     `json:"entities"`
	Suggestions []Suggestion `json:"suggestions"`
}
