ALTER TABLE products ADD COLUMN IF NOT EXISTS ugc_videos JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_products_ugc_videos ON products USING GIN (ugc_videos);

COMMENT ON COLUMN products.ugc_videos IS 'Array of UGC video objects with url, pet_type, created_at, job_id';
