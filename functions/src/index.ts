import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16',
});

// Webhook Stripe pour enregistrer les nouveaux membres
export const handleStripeWebhook = functions.https.onRequest(async (req: any, res: any) => {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.rawBody,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;

        // Récupérer le compteur actuel
        const counterRef = admin.firestore().doc('config/counter');

        try {
            await admin.firestore().runTransaction(async (transaction: any) => {
                const counterSnap = await transaction.get(counterRef);
                if (!counterSnap.exists) {
                    throw "Counter does not exist!";
                }

                const currentCounter = counterSnap.data()!;

                if (currentCounter.spotsRemaining <= 0) {
                    // Plus de places disponibles
                    if (session.subscription) {
                        await stripe.subscriptions.cancel(session.subscription as string);
                    }
                } else {
                    // Créer le membre
                    const founderNumber = currentCounter.totalFounded + 1;
                    const memberRef = admin.firestore().collection('founding_members').doc();
                    transaction.set(memberRef, {
                        email: session.customer_email,
                        stripeCustomerId: session.customer,
                        subscriptionId: session.subscription,
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        founderNumber,
                    });

                    // Décrémenter le compteur
                    transaction.update(counterRef, {
                        spotsRemaining: admin.firestore.FieldValue.increment(-1),
                        totalFounded: admin.firestore.FieldValue.increment(1),
                        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
            });
        } catch (e) {
            console.error("Transaction failed: ", e);
        }
    }

    res.status(200).send({ received: true });
});
