ALTER TABLE appointments ADD COLUMN IF NOT EXISTS checklist_data JSONB DEFAULT '{}'::jsonb;
