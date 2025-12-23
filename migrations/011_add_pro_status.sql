-- Add is_pro column to subscription_plans
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE;

-- Update RLS policies to ensure it's included (already covered by * but good to verify)
COMMENT ON COLUMN subscription_plans.is_pro IS 'Indicates if this plan grants access to PRO features like courses.';
