import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function createCheckoutSession(priceId?: string, mode: 'subscription' | 'payment' = 'subscription') {
    const stripe = await stripePromise;
    if (!stripe) throw new Error('Stripe failed to load');

    try {
        const response = await fetch('/.netlify/functions/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priceId, mode }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }

        const session = await response.json();

        if (session.url) {
            window.location.href = session.url;
        } else {
            // Fallback for older sessions or if URL is missing (should not happen with standard checkout)
            console.error('No checkout URL found in session response');
            throw new Error('Could not redirect to checkout');
        }
    } catch (error) {
        console.error("Error creating checkout session:", error);
        throw error;
    }
}
