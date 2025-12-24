ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS price_at_start numeric;

-- Optional: updates existing subscriptions with current plan price if linked
UPDATE subscriptions s
SET price_at_start = sp.price
FROM subscription_plans sp
WHERE s.plan_id = sp.id
AND s.price_at_start IS NULL;
