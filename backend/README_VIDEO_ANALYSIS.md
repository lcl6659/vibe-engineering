# YouTube Video Analysis API

Backend implementation for the YouTube AI Reading Assistant.

## Overview

This backend provides API endpoints to analyze YouTube videos using AI (Gemini via OpenRouter), extracting:
- Video metadata (title, author, thumbnail)
- AI-generated summary (max 300 characters)
- 3-5 key points
- Chapter breakdown with timestamps
- Complete transcription with timestamps

## Architecture

The implementation follows the existing project patterns:

```
backend/
├── cmd/server/          # Application entry point
├── internal/
│   ├── config/         # Configuration (added OPENROUTER_API_KEY)
│   ├── handlers/       # HTTP handlers
│   │   └── video.go    # Video analysis endpoints
│   ├── models/         # Data models
│   │   └── video.go    # Video analysis models
│   ├── repository/     # Data access layer
│   │   └── video.go    # Video repository
│   └── services/       # Business logic
│       └── youtube.go  # YouTube/OpenRouter integration
└── api/
    └── contract.json   # API contract specification
```

## Database Models

### VideoAnalysis
Main table storing video analysis records with status tracking.

### Chapter
Video chapters with timestamps (MM:SS format).

### Transcription
Video transcription segments with timestamps.

### KeyPoint
Core viewpoints extracted from the video (3-5 points).

## API Endpoints

All endpoints are under `/api/v1/`:

### 1. Get Video Metadata
```
POST /api/v1/videos/metadata
```
Fetches basic video information for validation.

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "videoId": "VIDEO_ID",
  "title": "Video Title",
  "author": "Channel Name",
  "thumbnailUrl": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
  "duration": 600
}
```

### 2. Start Video Analysis
```
POST /api/v1/videos/analyze
```
Submits a video for AI analysis (async job).

**Request:**
```json
{
  "videoId": "VIDEO_ID",
  "targetLanguage": "zh"
}
```

**Response:**
```json
{
  "jobId": "uuid-job-id",
  "status": "pending"
}
```

### 3. Get Analysis Result
```
GET /api/v1/videos/result/:jobId
```
Retrieves the analysis result (poll until completed).

**Response (pending/processing):**
```json
{
  "status": "processing"
}
```

**Response (completed):**
```json
{
  "status": "completed",
  "summary": "AI-generated summary...",
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "chapters": [
    {
      "title": "Introduction",
      "timestamp": "00:00",
      "seconds": 0
    }
  ],
  "transcription": [
    {
      "text": "Transcribed text...",
      "timestamp": "00:00",
      "seconds": 0
    }
  ]
}
```

### 4. Get History
```
GET /api/v1/history
```
Returns user's analysis history (recent 20 items).

**Response:**
```json
{
  "items": [
    {
      "videoId": "VIDEO_ID",
      "title": "Video Title",
      "thumbnailUrl": "thumbnail URL",
      "createdAt": "2026-01-08T12:00:00Z"
    }
  ]
}
```

### 5. Export Analysis
```
POST /api/v1/videos/export
```
Exports analysis results to Markdown (PDF not yet implemented).

**Request:**
```json
{
  "videoId": "VIDEO_ID",
  "format": "markdown"
}
```

**Response:**
```json
{
  "downloadUrl": "/api/v1/downloads/VIDEO_ID_20260108.md",
  "fileName": "VIDEO_ID_20260108.md"
}
```

## Configuration

Add the following environment variable:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

Get your API key from: https://openrouter.ai/

## Database Migration

The following tables will be auto-created on startup:
- `video_analyses` - Main analysis records
- `chapters` - Video chapters
- `transcriptions` - Video transcriptions
- `key_points` - Key viewpoints

## Usage Notes

1. **OpenRouter API Key Required**: You must set `OPENROUTER_API_KEY` environment variable for the service to work.

2. **Async Processing**: Video analysis is performed asynchronously. After calling `/api/v1/videos/analyze`, poll `/api/v1/videos/result/:jobId` to check status.

3. **User Authentication**: Currently uses placeholder user ID (1). TODO: Implement JWT authentication.

4. **Error Handling**: All endpoints return appropriate HTTP status codes and error messages in Chinese as per requirements.

5. **Supported Languages**: The `targetLanguage` parameter accepts language codes (e.g., "zh" for Chinese, "en" for English, "ja" for Japanese).

## Testing

To test the API locally:

1. Set environment variables:
```bash
export OPENROUTER_API_KEY=your_key
export DATABASE_URL=your_postgres_url
export REDIS_URL=your_redis_url
```

2. Run the server:
```bash
cd backend
go run cmd/server/main.go
```

3. Test metadata endpoint:
```bash
curl -X POST http://localhost:8080/api/v1/videos/metadata \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## Future Improvements

1. Implement JWT authentication for user management
2. Add rate limiting for API calls
3. Implement PDF export functionality
4. Add WebSocket support for real-time progress updates
5. Cache frequently analyzed videos
6. Add support for longer videos (currently optimized for <10 min)
7. Implement retry logic for failed analyses
8. Add more detailed error messages

## API Contract

The complete API contract is documented in `/api/contract.json`.
