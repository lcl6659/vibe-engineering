-- Create translations table
CREATE TABLE IF NOT EXISTS translations (
    id SERIAL PRIMARY KEY,
    source_text TEXT,
    youtube_url VARCHAR(500),
    video_id VARCHAR(50),
    source_language VARCHAR(10),
    target_language VARCHAR(10) NOT NULL,
    translated_text TEXT,
    enable_dual_subtitles BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Create dual_subtitles table
CREATE TABLE IF NOT EXISTS dual_subtitles (
    id SERIAL PRIMARY KEY,
    translation_id INTEGER NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
    original TEXT NOT NULL,
    translated TEXT NOT NULL,
    start_time VARCHAR(20),
    end_time VARCHAR(20),
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_translations_video_id ON translations(video_id);
CREATE INDEX IF NOT EXISTS idx_translations_status ON translations(status);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at);
CREATE INDEX IF NOT EXISTS idx_translations_deleted_at ON translations(deleted_at);
CREATE INDEX IF NOT EXISTS idx_dual_subtitles_translation_id ON dual_subtitles(translation_id);
CREATE INDEX IF NOT EXISTS idx_dual_subtitles_order_index ON dual_subtitles(translation_id, order_index);

-- Add comments
COMMENT ON TABLE translations IS 'Translation tasks for text and YouTube videos';
COMMENT ON TABLE dual_subtitles IS 'Bilingual subtitle entries for translations';
COMMENT ON COLUMN translations.status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN dual_subtitles.order_index IS 'Order of subtitle segment in the video';
