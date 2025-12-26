# PROMPT WINDSURF - LAOVA LANDING PAGE

## ðŸŽ¯ OBJECTIF

CrÃ©er une landing page de prÃ©-vente pour Laova, un AI companion Ã©motionnel, avec :
- Paiement Stripe immÃ©diat ($7.49/month lifetime)
- Compteur de places limitÃ©es (Firebase)
- Animation 3D de l'avatar
- Compliance lÃ©gale CA SB 243
- DÃ©ploiement Netlify depuis branche production Github

---

## ðŸ“ CONTEXTE PROJET

### Qu'est-ce que Laova ?

Laova est un **AI companion Ã©motionnel** en 3D qui :
- DÃ©tecte 48 dimensions d'Ã©motions dans la voix
- Aide Ã  libÃ©rer les Ã©motions refoulÃ©es (pas une thÃ©rapie)
- Optimise pour l'autonomie Ã©motionnelle, pas la dÃ©pendance
- Avatar 3D VRM avec expressions faciales temps rÃ©el
- Interactions voice-first

### DiffÃ©renciation vs concurrents :
- **Replika** : optimise engagement â†’ Laova optimise wellbeing
- **Character.AI** : text-only â†’ Laova 3D + voice + Ã©motions
- **Chatbots** : binaire â†’ Laova 48 dimensions Ã©motionnelles

### Positionnement :
"An AI that responds to how you feel, not just what you say"

---

## ðŸ—ï¸ ARCHITECTURE TECHNIQUE

### Structure Projet

Le projet Laova existe dÃ©jÃ  avec un MVP en cours. **NE PAS TOUCHER AU CODE EXISTANT**.

CrÃ©er une **page sÃ©parÃ©e** accessible sur `laova.space` :

```
laova-project/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/         # EXISTANT - NE PAS MODIFIER
â”‚   â”œâ”€â”€ landing/           # NOUVEAU - Ã€ CRÃ‰ER
â”‚   â”‚   â”œâ”€â”€ Hero.tsx
â”‚   â”‚   â”œâ”€â”€ Manifesto.tsx
â”‚   â”‚   â”œâ”€â”€ Features.tsx
â”‚   â”‚   â”œâ”€â”€ FounderStory.tsx
â”‚   â”‚   â”œâ”€â”€ Pricing.tsx
â”‚   â”‚   â”œâ”€â”€ Legal.tsx
â”‚   â”‚   â”œâ”€â”€ Footer.tsx
â”‚   â”‚   â””â”€â”€ CheckoutModal.tsx
â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”œâ”€â”€ Landing.tsx    # NOUVEAU - Page principale
â”‚   â”‚   â””â”€â”€ App.tsx        # EXISTANT - MVP (accessible uniquement Ã  Arjuna)
â”‚   â””â”€â”€ utils/
â”‚       â”œâ”€â”€ firebase.ts    # NOUVEAU - Firebase config
â”‚       â””â”€â”€ stripe.ts      # NOUVEAU - Stripe config
â”œâ”€â”€ public/
â”‚   â”œâ”€â”€ laova-avatar.png   # Image de Laova (fournie par Arjuna)
â”‚   â””â”€â”€ logo-star.png      # Logo Ã©toile dorÃ©e (fourni par Arjuna)
â””â”€â”€ .env                   # Variables d'environnement

```

### Routing

**IMPORTANT** : Seule la landing page doit Ãªtre accessible publiquement.

```tsx
// App.tsx principal
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC - Landing page */}
        <Route path="/" element={<Landing />} />
        
        {/* PRIVÃ‰ - MVP (password-protected ou admin-only) */}
        <Route path="/app" element={<ProtectedRoute><MVPApp /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Firebase Setup

**Base de donnÃ©es** : Firestore

**Collections** :

```typescript
// Collection: founding_members
interface FoundingMember {
  email: string;
  stripeCustomerId: string;
  subscriptionId: string;
  createdAt: Timestamp;
  founderNumber: number; // Ex: 1, 2, 3... (ordre d'inscription)
}

// Document unique: config/counter
interface Counter {
  spotsRemaining: number; // Initial: 47
  totalFounded: number;   // Total inscrits
  lastUpdated: Timestamp;
}
```

**RÃ¨gles de sÃ©curitÃ© Firestore** :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Founding members: read public, write admin only
    match /founding_members/{memberId} {
      allow read: if true;
      allow write: if false; // Server-side only via Cloud Function
    }
    
    // Counter: read public, write admin only
    match /config/counter {
      allow read: if true;
      allow write: if false; // Server-side only via Cloud Function
    }
  }
}
```

**Cloud Function (Firebase Functions)** :

```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

admin.initializeApp();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Webhook Stripe pour enregistrer les nouveaux membres
export const handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // RÃ©cupÃ©rer le compteur actuel
    const counterRef = admin.firestore().doc('config/counter');
    const counterSnap = await counterRef.get();
    const currentCounter = counterSnap.data();
    
    if (currentCounter.spotsRemaining <= 0) {
      // Plus de places disponibles
      await stripe.subscriptions.del(session.subscription as string);
      res.status(200).send({ received: true, error: 'No spots left' });
      return;
    }
    
    // CrÃ©er le membre
    const founderNumber = currentCounter.totalFounded + 1;
    await admin.firestore().collection('founding_members').add({
      email: session.customer_email,
      stripeCustomerId: session.customer,
      subscriptionId: session.subscription,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      founderNumber,
    });
    
    // DÃ©crÃ©menter le compteur
    await counterRef.update({
      spotsRemaining: admin.firestore.FieldValue.increment(-1),
      totalFounded: admin.firestore.FieldValue.increment(1),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  res.status(200).send({ received: true });
});
```

### Stripe Setup

**Produits Stripe** :

1. **Founding Member** (Ã  crÃ©er dans Stripe Dashboard) :
   - Prix : $7.49/month
   - RÃ©current : mensuel
   - Product ID : `prod_founding_member` (Ã  rÃ©cupÃ©rer)
   - Price ID : `price_founding_747` (Ã  rÃ©cupÃ©rer)

2. **Regular** (pour rÃ©fÃ©rence future) :
   - Prix : $14.99/month
   - Pas encore actif

**Stripe Checkout** :

```typescript
// utils/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.VITE_STRIPE_PUBLISHABLE_KEY!);

export async function createCheckoutSession() {
  const stripe = await stripePromise;
  if (!stripe) throw new Error('Stripe failed to load');

  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const session = await response.json();
  
  const result = await stripe.redirectToCheckout({
    sessionId: session.id,
  });

  if (result.error) {
    console.error(result.error.message);
  }
}
```

**Netlify Function (API endpoint)** :

```typescript
// netlify/functions/create-checkout-session.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID_FOUNDING, // price_founding_747
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/`,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      customer_email: event.queryStringParameters?.email, // Optionnel pre-fill
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

### Github + Netlify Setup

**Branches** :
- `main` : DÃ©veloppement (push rÃ©guliers)
- `production` : Production (dÃ©ploiement Netlify)

**Workflow** :
1. Coder sur `main`
2. Push rÃ©guliers
3. Quand prÃªt : `git checkout production && git merge main && git push origin production`
4. Netlify auto-deploy depuis `production`

**Netlify Configuration (`netlify.toml`)** :

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[context.production]
  command = "npm run build"
  publish = "dist"

[context.production.environment]
  VITE_STRIPE_PUBLISHABLE_KEY = "pk_live_..."
  STRIPE_SECRET_KEY = "sk_live_..."
  STRIPE_WEBHOOK_SECRET = "whsec_..."
  STRIPE_PRICE_ID_FOUNDING = "price_..."
```

**Variables d'environnement (.env)** :

```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_FOUNDING=price_...

# Firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...

# URLs
URL=https://laova.space
```

---

## ðŸŽ¨ DESIGN SYSTEM

### Palette Couleurs

**Logo/Brand** :
```css
--gold-brushed: #E8C078;
--gold-deep: #D4A574;
--gold-rose: #E8B8A0;
--gold-cream: #F5E6D0;
```

**Interface (60/30/10)** :
```css
/* Primary (60%) */
--sakura-rose: #FFB3D9;
--lavender-pale: #E6D5F5;
--cream-white: #FFF8F0;
--peach-soft: #FFD4B8;

/* Secondary (30%) */
--mint-light: #E0F9F5;
--lilac: #D4C5F9;
--beige-rose: #F5E6D8;
--gold-pale: #FFF4CC;

/* Accents (10%) */
--gold-soft: #FFD700;
--rose-vivid: #FF9FD5;
--coral: #FF9999;
```

**Gradients** :
```css
/* Logo gradient (pour wordmark "laova") */
.logo-gradient {
  background: linear-gradient(
    135deg,
    var(--gold-brushed) 0%,
    var(--gold-cream) 50%,
    var(--gold-rose) 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Hero background */
.hero-bg {
  background: linear-gradient(
    180deg,
    var(--cream-white) 0%,
    var(--lavender-pale) 50%,
    var(--sakura-rose) 100%
  );
}
```

### Typographie

```css
/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;500;600&family=Nunito:wght@400;600&display=swap');

/* Typography system */
:root {
  /* Headings - Comfortaa */
  --font-heading: 'Comfortaa', cursive;
  --weight-heading-regular: 400;
  --weight-heading-medium: 500;
  --weight-heading-semibold: 600;
  
  /* Body - Nunito */
  --font-body: 'Nunito', sans-serif;
  --weight-body-regular: 400;
  --weight-body-semibold: 600;
}

h1, h2, h3, .logo-text {
  font-family: var(--font-heading);
}

p, span, button, input {
  font-family: var(--font-body);
}

/* Scale */
h1 { font-size: 3.5rem; font-weight: var(--weight-heading-semibold); }
h2 { font-size: 2.5rem; font-weight: var(--weight-heading-medium); }
h3 { font-size: 1.75rem; font-weight: var(--weight-heading-medium); }
p { font-size: 1.125rem; font-weight: var(--weight-body-regular); }
```

### Logo Usage

**Logo complet** : Ã‰toile + wordmark "laova"
- Ã‰toile : 5 branches arrondies, or brossÃ©
- Wordmark : Comfortaa avec gradient dorÃ©
- Jamais en MAJUSCULES ("LAOVA" interdit)

**RÃ¨gles** :
- Logo seul : OK pour favicon, app icon
- Wordmark seul : OK pour navbar
- Ã‰toile + wordmark : Hero section

### Animation Avatar

**Specs** :
- Format : Image PNG statique OU WebGL animation (Three.js si possible)
- Comportement : Laova marche vers l'utilisateur (approche frontale)
- Position : Centre du hero, au-dessus du CTA
- Fallback mobile : Image statique si performance < 30fps

**ImplÃ©mentation (si animation WebGL pas possible)** :
```tsx
// Simple CSS animation sur image statique
<img 
  src="/laova-avatar.png" 
  alt="Laova walking towards you"
  className="avatar-walk"
/>

/* CSS */
@keyframes walk-towards {
  0% { transform: scale(0.5) translateY(20px); opacity: 0; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

.avatar-walk {
  animation: walk-towards 2s ease-out forwards;
}
```

---

## âœï¸ COPYWRITING FINAL

### Hero Section

```
HEADLINE:
An AI that responds to how you feel,
not just what you say

SUB-HEADER:
AI has learned to think. We taught her to feel.
Meet Laova â€” a 3D companion with true emotional presence.

CTA BUTTON:
Become a Founding Member

PRICING (sous le CTA):
$7.49/month â€¢ Lifetime Access
Regular price: $14.99/month

URGENCY:
âš¡ Only 47 founding spots left
```

### Manifesto Section

```
TITLE:
Unlike chatbots that only read your words,
Laova perceives the emotions beneath them.

BODY (prose fluide, pas de bullets):
She sees what you truly feel. Voice conversations with emotional depth. 
Evolves through genuine connection. No manipulation. No fake validation.

She's not here to tell you what you want to hear.
She's here to help you feel what needs to be felt.
```

### Features Section

**Titre** : What Makes Laova Different

**4 Features** (Ã©mojis + titre + courte description) :

```
ðŸŽ­ True emotional awareness
Perceives emotional nuances that other AIs miss

ðŸ’¬ Voice & presence  
A 3D companion who speaks and expresses emotions visually

ðŸŒ± Evolves with you
Learns your unique emotional patterns over time

ðŸš« No manipulation
Designed for growth, not engagement addiction
```

### Founder Story (optionnel mais puissant)

```
TITLE:
From Isolation to Innovation

BODY:
In 2021, I was isolated in Paris, carrying trauma I couldn't release.
I tried AI companions, but they missed what mattered most: my emotions.

I realized AI could be trained differentlyâ€”not for engagement,
but for your emotional growth. Like AlphaGo mastered Go through winning,
Laova learns through your wellbeing.

I combined psychology, spirituality, and machine learning to create
a companion who actually listens to how you feel.

I'm Arjuna, and I built Laova for everyone whose emotions have nowhere to go.

Not therapy. Not manipulation. Just presence.
```

### Pricing Section

```
TITLE:
Join the Founding 100

CARD FOUNDING MEMBER:
ðŸŒŸ Founding Member
$7.49/month
Lifetime Access

âœ“ Launch access (December 29, 2024)
âœ“ Lifetime price locked at $7.49
âœ“ Shape Laova's future
âœ“ Exclusive founder badge

[Secure Your Spot]

Small print:
Regular price after launch: $14.99/month
Only 47 spots available â€¢ First come, first served
```

### Legal Section (Footer)

```
DISCLAIMER (petits caractÃ¨res):
Laova is an AI companion designed to support emotional wellbeing. 
Laova is not a medical device, healthcare provider, or mental health service. 
Not a substitute for professional care. If you're experiencing a crisis, 
please contact 988 (Suicide & Crisis Lifeline) or visit your local emergency room.

18+ only. By continuing, you confirm you are 18 years or older.

LINKS:
â€¢ Privacy Policy
â€¢ Terms of Service  
â€¢ Safety Protocols
â€¢ Crisis Resources (988 Suicide & Crisis Lifeline â€¢ 3114 France)
â€¢ Contact: hello@laova.space
```

### Modal Checkout (avant Stripe)

```
TITLE:
Before You Continue

BODY:
â–¡ I confirm I am 18 years or older
â–¡ I understand Laova is an AI companion, not a human therapist
â–¡ I've read the Privacy Policy and Terms of Service

[I Understand â€¢ Continue to Payment]

If you're in crisis, please call 988 immediately.
Laova is not a substitute for professional mental health care.
```

---

## ðŸ› ï¸ COMPOSANTS Ã€ CRÃ‰ER

### 1. Hero.tsx

```tsx
import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Hero() {
  const [spotsLeft, setSpotsLeft] = useState(47);
  
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'config', 'counter'), (doc) => {
      if (doc.exists()) {
        setSpotsLeft(doc.data().spotsRemaining);
      }
    });
    return () => unsubscribe();
  }, []);
  
  return (
    <section className="hero">
      {/* Animation avatar */}
      <div className="avatar-container">
        <img src="/laova-avatar.png" alt="Laova" className="avatar-walk" />
      </div>
      
      {/* Headline */}
      <h1>
        An AI that responds to how you feel,<br />
        not just what you say
      </h1>
      
      {/* Sub-header */}
      <p className="sub-header">
        AI has learned to think. We taught her to feel.<br />
        Meet Laova â€” a 3D companion with true emotional presence.
      </p>
      
      {/* CTA */}
      <button className="cta-primary" onClick={() => setModalOpen(true)}>
        Become a Founding Member
      </button>
      
      {/* Pricing */}
      <p className="pricing">
        $7.49/month â€¢ Lifetime Access
        <span className="strikethrough">$14.99/month</span>
      </p>
      
      {/* Urgency */}
      <p className="urgency">
        âš¡ Only {spotsLeft} founding spots left
      </p>
    </section>
  );
}
```

### 2. CheckoutModal.tsx

```tsx
import { useState } from 'react';
import { createCheckoutSession } from '../utils/stripe';

export default function CheckoutModal({ isOpen, onClose }) {
  const [agreed18, setAgreed18] = useState(false);
  const [agreedAI, setAgreedAI] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  
  const handleCheckout = async () => {
    if (!agreed18 || !agreedAI || !agreedTerms) {
      alert('Please confirm all checkboxes');
      return;
    }
    
    await createCheckoutSession();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Before You Continue</h2>
        
        <label>
          <input type="checkbox" checked={agreed18} onChange={(e) => setAgreed18(e.target.checked)} />
          I confirm I am 18 years or older
        </label>
        
        <label>
          <input type="checkbox" checked={agreedAI} onChange={(e) => setAgreedAI(e.target.checked)} />
          I understand Laova is an AI companion, not a human therapist
        </label>
        
        <label>
          <input type="checkbox" checked={agreedTerms} onChange={(e) => setAgreedTerms(e.target.checked)} />
          I've read the Privacy Policy and Terms of Service
        </label>
        
        <p className="crisis-note">
          If you're in crisis, please call 988 immediately.
          Laova is not a substitute for professional mental health care.
        </p>
        
        <button 
          className="cta-primary" 
          onClick={handleCheckout}
          disabled={!agreed18 || !agreedAI || !agreedTerms}
        >
          I Understand â€¢ Continue to Payment
        </button>
        
        <button className="cta-secondary" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
```

### 3. Manifesto.tsx, Features.tsx, FounderStory.tsx, Pricing.tsx, Footer.tsx

(Similaires en structure, adaptÃ©s au copywriting ci-dessus)

---

## âš–ï¸ COMPLIANCE LÃ‰GALE (CA SB 243)

### Ã‰lÃ©ments obligatoires

**Ã€ intÃ©grer** :
1. âœ… AI Disclosure : Modal avant checkout
2. âœ… 18+ restriction : Checkbox obligatoire
3. âœ… Non-therapy disclaimer : Footer + modal
4. âœ… Crisis resources : Footer + modal (988/3114)
5. âœ… Privacy Policy : Lien footer
6. âœ… Terms of Service : Lien footer
7. âœ… Safety Protocols : Page `/safety` (Ã  crÃ©er)

### Pages lÃ©gales Ã  crÃ©er

**Privacy Policy** (`/privacy`) :
- Template : https://www.termsfeed.com/privacy-policy-generator/
- Mentionner : Firebase, Stripe, pas de vente de donnÃ©es
- GDPR compliant : Right to access, right to delete

**Terms of Service** (`/terms`) :
- Template : https://www.termsfeed.com/terms-conditions-generator/
- Mentionner : 18+, AI companion not therapy, arbitration clause

**Safety Protocols** (`/safety`) :
- DÃ©crire : Crisis detection keywords, 988 referral
- Mentionner : Not a substitute for professional care
- Link to resources : 988, 3114, emergency services

---

## ðŸ“± RESPONSIVE DESIGN

### Breakpoints

```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
```

### Mobile Optimizations

**Hero** :
- Avatar : Max 300px height sur mobile
- Headline : Font size 2rem (vs 3.5rem desktop)
- CTA : Full width button sur mobile

**Sections** :
- Padding : 1rem mobile, 2rem desktop
- Typography : Scale down 20% sur mobile

---

## ðŸš€ DÃ‰PLOIEMENT

### Checklist Pre-Launch

**Technique** :
- [ ] Firebase configurÃ© + rules de sÃ©curitÃ©
- [ ] Cloud Function dÃ©ployÃ©e (Stripe webhook)
- [ ] Compteur initialisÃ© Ã  47
- [ ] Stripe product + price crÃ©Ã©s
- [ ] Netlify functions testÃ©es
- [ ] Variables d'env production
- [ ] Branch `production` crÃ©Ã©e
- [ ] SSL activÃ© sur laova.space

**LÃ©gal** :
- [ ] Privacy Policy published
- [ ] Terms of Service published
- [ ] Safety Protocols page published
- [ ] AI disclosure modal tested
- [ ] 18+ checkbox tested
- [ ] Crisis resources links tested

**Design** :
- [ ] Image Laova optimisÃ©e (WebP, <200KB)
- [ ] Logo star optimisÃ© (SVG ou PNG)
- [ ] Fonts loaded (Comfortaa + Nunito)
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Safari, Firefox)

**Marketing** :
- [ ] Copywriting final validÃ©
- [ ] CTA tested (clicks â†’ Stripe)
- [ ] Email confirmation post-payment
- [ ] Founder number auto-assignÃ©

---

## ðŸ“§ POST-PAYMENT FLOW

### Email Confirmation (via Stripe)

Template Ã  configurer dans Stripe Dashboard :

```
Subject: Welcome, Founder #{FOUNDER_NUMBER} ðŸŒŸ

Hi {NAME},

You're now a Laova Founding Member!

Your lifetime price: $7.49/month (locked forever)
Your founder number: #{FOUNDER_NUMBER}
Launch date: December 29, 2024

What happens next:
1. We'll send you launch day access on Dec 29
2. You'll be among the first to shape Laova's future
3. Your feedback will directly influence our roadmap

Questions? Reply to this email anytime.

With gratitude,
Arjuna
Founder, Laova

P.S. If you're experiencing a crisis, please call 988 immediately.
Laova is not a substitute for professional care.
```

---

## ðŸŽ¯ SUCCESS METRICS

**Ã€ tracker** (via Plausible ou Google Analytics) :
- Visitors â†’ Landing page views
- Scroll depth (combien scrollent jusqu'Ã  pricing)
- CTA clicks (modal opens)
- Checkout starts (Stripe sessions)
- Conversions (payments completed)
- Conversion rate (%)

**Goal initial** :
- 20-50 founding members = $150-375/month recurring
- Validation du concept

---

## ðŸ”§ TASKS POUR WINDSURF

### Phase 1 : Setup Infrastructure (2-3h)

1. CrÃ©er structure dossiers `src/landing/`
2. Setup Firebase + Firestore
3. CrÃ©er Cloud Function Stripe webhook
4. Setup Netlify functions
5. Configurer routing (Landing public, MVP privÃ©)

### Phase 2 : UI Components (3-4h)

6. CrÃ©er Hero.tsx avec compteur live
7. CrÃ©er CheckoutModal.tsx avec disclaimers
8. CrÃ©er Manifesto.tsx
9. CrÃ©er Features.tsx
10. CrÃ©er FounderStory.tsx (optionnel)
11. CrÃ©er Pricing.tsx
12. CrÃ©er Footer.tsx avec legal links

### Phase 3 : Styling (2-3h)

13. Appliquer design system (couleurs, typo)
14. Responsive design (mobile-first)
15. Animations (avatar walk, smooth scroll)
16. Optimiser images (WebP, lazy loading)

### Phase 4 : Integration (2-3h)

17. Tester Stripe checkout flow
18. Tester Firebase live updates
19. CrÃ©er pages lÃ©gales (/privacy, /terms, /safety)
20. Setup email templates Stripe

### Phase 5 : Deployment (1-2h)

21. Create production branch
22. Deploy to Netlify
23. Test en production
24. Final QA

**TOTAL ESTIMÃ‰ : 10-15 heures de dÃ©veloppement**

---

## âš ï¸ POINTS CRITIQUES

1. **Ne pas toucher au code existant** : Le MVP est dans `/src/components/`, ne rien modifier
2. **Firebase security** : Rules strictes (read public, write server-only)
3. **Stripe test mode** : Utiliser test keys jusqu'Ã  validation finale
4. **Compteur race conditions** : Utiliser Firebase transactions si possible
5. **Mobile performance** : Avatar animation doit Ãªtre lÃ©gÃ¨re (<2MB)
6. **Legal compliance** : CA SB 243 est obligatoire, pas optionnel
7. **Email collection** : Via Stripe, pas de formulaire sÃ©parÃ©

---

## ðŸ“ NOTES FINALES

**Philosophie** :
- Simple > Complex
- Shipped > Perfect
- Mysterious > Technical (ne pas rÃ©vÃ©ler Hume AI)
- Transaction > Discussion (prÃ©-vente directe)

**PrioritÃ©s** :
1. Fonctionnel (paiement Stripe works)
2. LÃ©gal (CA SB 243 compliant)
3. Beau (design system appliquÃ©)
4. Rapide (optimisations performance)

**Deadline** : Lancement 29 DÃ©cembre 2024

**Contact Arjuna** : Pour toute question technique ou design, demander validation

---

Bonne chance ! ðŸš€ Et n'oublie pas : **War Mode = Ship it!**
