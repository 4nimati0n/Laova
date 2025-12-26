import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createCheckoutSession() {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    try {
        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }

        const session = await response.json();

        // Cast to any to avoid "Property 'redirectToCheckout' does not exist" error
        // caused by strict typing in some versions of @stripe/stripe-js
        const result = await (stripe as any).redirectToCheckout({
            sessionId: session.id,
        });

        if (result.error) {
            console.error(result.error.message);
            throw new Error(result.error.message);
        }
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
}
