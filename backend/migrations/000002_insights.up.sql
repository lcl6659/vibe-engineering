-- Create insights table (main table for InsightFlow)
CREATE TABLE IF NOT EXISTS insights (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,

    -- Source information
    source_type VARCHAR(20) NOT NULL,
    source_url VARCHAR(2000) NOT NULL,
    source_id VARCHAR(100),

    -- Content metadata
    title VARCHAR(500),
    author VARCHAR(255),
    thumbnail_url VARCHAR(1000),
    duration INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,

    -- AI generated content
    summary TEXT,
    key_points JSONB,
    target_lang VARCHAR(10) DEFAULT 'zh',

    -- Raw content
    raw_content TEXT,
    trans_content TEXT,
    transcripts JSONB,

    -- Processing status
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,

    -- Sharing
    share_token VARCHAR(64) UNIQUE,
    share_password VARCHAR(255),
    share_config JSONB,
    is_public BOOLEAN DEFAULT FALSE,
    shared_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create indexes for insights table
CREATE INDEX IF NOT EXISTS idx_insights_user_id ON insights(user_id);
CREATE INDEX IF NOT EXISTS idx_insights_source_id ON insights(source_id);
CREATE INDEX IF NOT EXISTS idx_insights_source_type ON insights(source_type);
CREATE INDEX IF NOT EXISTS idx_insights_status ON insights(status);
CREATE INDEX IF NOT EXISTS idx_insights_published_at ON insights(published_at);
CREATE INDEX IF NOT EXISTS idx_insights_created_at ON insights(created_at);
CREATE INDEX IF NOT EXISTS idx_insights_deleted_at ON insights(deleted_at);
CREATE INDEX IF NOT EXISTS idx_insights_share_token ON insights(share_token) WHERE share_token IS NOT NULL;

-- Add comments for insights table
COMMENT ON TABLE insights IS 'InsightFlow: AI-powered media content analysis and notes';
COMMENT ON COLUMN insights.source_type IS 'Type of content source: youtube, twitter, podcast';
COMMENT ON COLUMN insights.source_id IS 'Unique identifier from the source platform (e.g., YouTube video ID)';
COMMENT ON COLUMN insights.duration IS 'Duration in seconds for video/audio content';
COMMENT ON COLUMN insights.key_points IS 'JSON array of key points extracted by AI';
COMMENT ON COLUMN insights.transcripts IS 'JSON array of transcript items with timestamps';
COMMENT ON COLUMN insights.status IS 'Processing status: pending, processing, completed, failed';
COMMENT ON COLUMN insights.share_config IS 'JSON config for what to include when sharing';

-- Create highlights table
CREATE TABLE IF NOT EXISTS highlights (
    id SERIAL PRIMARY KEY,
    insight_id INTEGER NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,

    -- Highlight content
    text TEXT NOT NULL,
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    color VARCHAR(20) DEFAULT 'yellow',
    note TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for highlights table
CREATE INDEX IF NOT EXISTS idx_highlights_insight_id ON highlights(insight_id);
CREATE INDEX IF NOT EXISTS idx_highlights_user_id ON highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_highlights_start_offset ON highlights(start_offset);

-- Add comments for highlights table
COMMENT ON TABLE highlights IS 'User highlights/annotations on insight content';
COMMENT ON COLUMN highlights.start_offset IS 'Character offset where highlight starts';
COMMENT ON COLUMN highlights.end_offset IS 'Character offset where highlight ends';
COMMENT ON COLUMN highlights.color IS 'Highlight color: yellow, green, blue, purple, red';

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id SERIAL PRIMARY KEY,
    insight_id INTEGER NOT NULL REFERENCES insights(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL,

    -- Message content
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,

    -- Optional reference to highlight
    highlight_id INTEGER REFERENCES highlights(id) ON DELETE SET NULL,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for chat_messages table
CREATE INDEX IF NOT EXISTS idx_chat_messages_insight_id ON chat_messages(insight_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_highlight_id ON chat_messages(highlight_id) WHERE highlight_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Add comments for chat_messages table
COMMENT ON TABLE chat_messages IS 'AI conversation history for each insight';
COMMENT ON COLUMN chat_messages.role IS 'Message role: user or assistant';
COMMENT ON COLUMN chat_messages.highlight_id IS 'Optional reference to a highlight this message relates to';
