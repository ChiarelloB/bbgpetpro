-- Sync plan_name in subscriptions table with the name from the linked subscription_plans
-- This fixes the issue where plan_name became stale because previous updates only changed plan_id
UPDATE subscriptions
SET plan_name = subscription_plans.name
FROM subscription_plans
WHERE subscriptions.plan_id = subscription_plans.id
  AND subscriptions.plan_name IS DISTINCT FROM subscription_plans.name;
