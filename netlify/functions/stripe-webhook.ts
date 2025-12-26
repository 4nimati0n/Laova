import Stripe from 'stripe';
import * as admin from 'firebase-admin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: process.env.FIREBASE_DATABASE_URL
        });
    } catch (e) {
        console.error('Firebase Admin initialization failed:', e);
    }
}

export const handler = async (event: any) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return { statusCode: 400, body: 'Missing signature or webhook secret' };
    }

    let stripeEvent;

    try {
        stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return { statusCode: 400, body: `Webhook Error: ${err.message}` };
    }

    // Handle the event
    if (stripeEvent.type === 'checkout.session.completed') {
        const session = stripeEvent.data.object as Stripe.Checkout.Session;

        // Extract relevant data
        const customerEmail = session.customer_details?.email || session.customer_email;
        const customerName = session.customer_details?.name || 'Unknown';
        const paymentStatus = session.payment_status;
        const amountTotal = session.amount_total; // in cents
        const currency = session.currency;
        const mode = session.mode;

        console.log(`Processing subscription for: ${customerEmail}`);

        try {
            // Check if Firebase Admin is ready
            if (!admin.apps.length) {
                console.error("Firebase Admin not initialized, cannot save to DB.");
                return { statusCode: 500, body: 'Database configuration error' };
            }

            // Save to 'subscribers' node in Realtime Database
            const db = admin.database();
            const ref = db.ref('subscribers');

            await ref.push({
                email: customerEmail,
                name: customerName,
                stripeSessionId: session.id,
                paymentStatus: paymentStatus, // 'paid'
                amount: amountTotal,
                currency: currency,
                mode: mode, // 'subscription' or 'payment'
                createdAt: admin.database.ServerValue.TIMESTAMP,
                tier: mode === 'subscription' ? 'Explorer' : 'Visionary' // Heuristic based on previous logic
            });

            console.log(`Successfully added ${customerEmail} to subscribers list.`);

        } catch (dbError) {
            console.error('Error saving to Firebase:', dbError);
            return { statusCode: 500, body: 'Error saving to database' };
        }
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
