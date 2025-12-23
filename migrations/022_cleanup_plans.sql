-- Clean up duplicate/non-official plans for the global tenant
DELETE FROM subscription_plans 
WHERE tenant_id = '00000000-0000-0000-0000-000000000001'
AND name NOT IN ('Inicial', 'Profissional', 'Elite');

-- Optional: If we want to be very aggressive and clear everything for a fresh start (safest for user request)
-- DELETE FROM subscription_plans WHERE tenant_id = '00000000-0000-0000-0000-000000000001';
-- And re-run the previous INSERT. But let's try to just remove the extras first.
