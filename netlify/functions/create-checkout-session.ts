import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const handler = async (event: any) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { priceId, mode, email } = JSON.parse(event.body || '{}');

        // Resolve Price ID
        // Resolve Price ID
        let finalPriceId = priceId;

        // Handle aliases
        if (priceId === 'visionary') {
            finalPriceId = process.env.STRIPE_PRICE_ID_VISIONARY || 'price_1SifwBCzq6pJOi14DUbFs9Nr';
        } else if (priceId === 'explorer') {
            finalPriceId = process.env.STRIPE_PRICE_ID_EXPLORER;
        }

        if (!finalPriceId) {
            // Fallback old logic
            if (event.queryStringParameters?.price === 'visionary') {
                finalPriceId = process.env.STRIPE_PRICE_ID_VISIONARY || 'price_1SifwBCzq6pJOi14DUbFs9Nr';
            } else {
                finalPriceId = process.env.STRIPE_PRICE_ID_FOUNDING || process.env.STRIPE_PRICE_ID_EXPLORER;
            }
        }

        if (!finalPriceId) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Missing Price ID' }) };
        }

        try {
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price: finalPriceId,
                        quantity: 1,
                    },
                ],
                mode: mode || 'subscription',
                success_url: `${process.env.APP_URL || process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.APP_URL || process.env.URL}/`,
                allow_promotion_codes: true,
                billing_address_collection: 'required',
                customer_email: email || event.queryStringParameters?.email,
            });

            return {
                statusCode: 200,
                body: JSON.stringify({ id: session.id, url: session.url }),
            };
        } catch (error: any) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: error.message }),
            };
        }
    } catch (error: any) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid Request: ' + error.message }),
        };
    }
};
