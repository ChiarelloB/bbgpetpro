-- Create a secure function to get global dashboard stats bypassing RLS
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
BEGIN
    SELECT json_build_object(
        'companies', (SELECT count(*) FROM tenants),
        'pets', (SELECT count(*) FROM pets),
        'appointments', (SELECT count(*) FROM appointments),
        'new_clients_today', (SELECT count(*) FROM clients WHERE created_at >= CURRENT_DATE),
        'mrr', (
            SELECT COALESCE(SUM(sp.price), 0)
            FROM subscriptions s
            JOIN subscription_plans sp ON s.plan_id = sp.id
            WHERE s.status = 'active'
        )
    ) INTO result;

    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users (Super Admin needs to be authenticated)
GRANT EXECUTE ON FUNCTION get_admin_dashboard_stats() TO authenticated;
