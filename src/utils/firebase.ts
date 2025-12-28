import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

const env = import.meta.env;

const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    databaseURL: env.VITE_FIREBASE_DATABASE_URL || (env.VITE_FIREBASE_PROJECT_ID ? `https://${env.VITE_FIREBASE_PROJECT_ID}.firebaseio.com` : undefined)
};

let app: any = null;
let db: any = null;
let rtdb: any = null;

if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        // Use a try-catch for RTDB specifically as it can throw on bad URLs
        try {
            console.log("Initializing RTDB with URL:", firebaseConfig.databaseURL);
            rtdb = getDatabase(app);
            console.log("RTDB initialized successfully");
        } catch (e) {
            console.warn("Firebase RTDB init failed (likely URL)", e);
        }
    } catch (error) {
        console.warn("Firebase init failed:", error);
    }
} else {
    console.warn("Firebase config missing. Running in offline/mock mode.");
}

export { app, db, rtdb };
