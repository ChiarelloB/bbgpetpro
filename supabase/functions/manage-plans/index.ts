// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

console.log("Hello from Functions!")

// Retrieve Stripe Secret Key from environment variables
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { action, name, description, price, frequency, id } = await req.json()

        if (action === 'create_coupon') {
            const { name, duration, duration_in_months, percent_off, amount_off } = await req.json()

            // Validate inputs
            if (!name) {
                throw new Error("Missing coupon name");
            }
            if (!percent_off && !amount_off) {
                throw new Error("Must provide either percent_off or amount_off");
            }

            const couponParams: any = {
                name: name,
                duration: duration || 'once',
            };

            if (duration === 'repeating') {
                couponParams.duration_in_months = duration_in_months;
            }

            if (percent_off) couponParams.percent_off = percent_off;
            if (amount_off) { // Amount off requires currency
                couponParams.amount_off = Math.round(amount_off * 100);
                couponParams.currency = 'brl';
            }

            const coupon = await stripe.coupons.create(couponParams);

            return new Response(
                JSON.stringify({
                    coupon_id: coupon.id,
                    valid: coupon.valid,
                    name: coupon.name
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            )
        }

        if (action === 'create_plan') {
            if (!name || !price) {
                throw new Error("Missing required fields: name, price")
            }

            // 1. Create Product in Stripe
            const product = await stripe.products.create({
                name: name,
                description: description,
            });

            // 2. Create Price in Stripe
            const priceRecord = await stripe.prices.create({
                product: product.id,
                unit_amount: Math.round(price * 100), // Convert to cents
                currency: 'brl',
                recurring: {
                    interval: frequency === 'yearly' ? 'year' : 'month',
                },
            });

            // 3. Create Payment Link
            const paymentLink = await stripe.paymentLinks.create({
                line_items: [
                    {
                        price: priceRecord.id,
                        quantity: 1,
                    },
                ],
                // Add functionality to handle redirects if needed, Stripe handles it or we pass it
            });

            return new Response(
                JSON.stringify({
                    stripe_product_id: product.id,
                    stripe_price_id: priceRecord.id,
                    stripe_payment_link: paymentLink.url
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            )
        }

        if (action === 'delete_plan') {
            // Ideally verify if we want to delete from Stripe or just archive.
            // For now, we might just return success and handle DB deletion.
            // Stripe APIs for deletion are restricted.
            return new Response(
                JSON.stringify({ message: "Plan deletion handled in DB" }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" } },
            )
        }

        throw new Error(`Unknown action: ${action}`)

    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" }
            },
        )
    }
})
