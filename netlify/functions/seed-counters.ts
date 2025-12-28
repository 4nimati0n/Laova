import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized (reusing logic from webhook)
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
    // Basic protection
    if (event.queryStringParameters?.secret !== process.env.STRIPE_WEBHOOK_SECRET) {
        return { statusCode: 403, body: 'Forbidden' };
    }

    const { explorer, visionary } = event.queryStringParameters;

    // Default to current values or the ones provided
    // If no params provided, default to the initial seed (safe fallback)
    const explorerCount = explorer ? parseInt(explorer) : 34;
    const visionaryCount = visionary ? parseInt(visionary) : 13;

    try {
        const db = admin.database();
        await db.ref('counters/availableSpots').update({
            ...(explorer && { explorer: explorerCount }),
            ...(visionary && { visionary: visionaryCount })
        });

        return {
            statusCode: 200,
            body: `Counters updated. Explorer: ${explorer ? explorerCount : '(unchanged)'}, Visionary: ${visionary ? visionaryCount : '(unchanged)'}`
        };
    } catch (error) {
        return { statusCode: 500, body: JSON.stringify(error) };
    }
};
