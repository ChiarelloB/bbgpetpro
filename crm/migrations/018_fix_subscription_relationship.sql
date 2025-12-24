-- Add plan_id column to subscriptions if it doesn't exist
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_id UUID;

-- Update the plan_id based on the plan_name matching the subscription_plans name
-- This links existing subscriptions to their plans
UPDATE subscriptions s
SET plan_id = sp.id
FROM subscription_plans sp
WHERE s.plan_name = sp.name;

-- Add the foreign key constraint
-- Using DO block to check if constraint exists to avoid errors on re-runs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_subscription_plan'
    ) THEN
        ALTER TABLE subscriptions
        ADD CONSTRAINT fk_subscription_plan
        FOREIGN KEY (plan_id)
        REFERENCES subscription_plans(id);
    END IF;
END $$;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON subscriptions(plan_id);
