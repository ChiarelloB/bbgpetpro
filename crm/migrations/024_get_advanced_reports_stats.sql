CREATE OR REPLACE FUNCTION get_advanced_reports_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_mrr numeric;
    total_subs integer;
    active_subs integer;
    cancelled_subs integer;
    churn_rate numeric;
    avg_ticket numeric;
    plans_distribution json;
BEGIN
    -- Calculate MRR (Sum of price_at_start for active/trialing subs)
    SELECT COALESCE(SUM(price_at_start), 0)
    INTO total_mrr
    FROM subscriptions
    WHERE status IN ('active', 'trialing');

    -- Subscription Counts
    SELECT COUNT(*), 
           COUNT(*) FILTER (WHERE status IN ('active', 'trialing')),
           COUNT(*) FILTER (WHERE status = 'canceled')
    INTO total_subs, active_subs, cancelled_subs
    FROM subscriptions;

    -- Calculate Churn (Simple: Cancelled / Total)
    IF total_subs > 0 THEN
        churn_rate := round((cancelled_subs::numeric / total_subs::numeric) * 100, 2);
        avg_ticket := round(total_mrr / NULLIF(active_subs, 0), 2);
    ELSE
        churn_rate := 0;
        avg_ticket := 0;
    END IF;

    -- Plans Distribution
    SELECT json_agg(t) FROM (
        SELECT sp.name, COUNT(s.id) as count
        FROM subscription_plans sp
        LEFT JOIN subscriptions s ON sp.id = s.plan_id AND s.status IN ('active', 'trialing')
        WHERE sp.tenant_id = '00000000-0000-0000-0000-000000000001'
        GROUP BY sp.name
    ) t INTO plans_distribution;

    RETURN json_build_object(
        'mrr', total_mrr,
        'active_subscriptions', active_subs,
        'churn_rate', churn_rate,
        'avg_ticket', COALESCE(avg_ticket, 0),
        'plans_distribution', plans_distribution
    );
END;
$$;
