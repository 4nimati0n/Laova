# ðŸŒŸ LAOVA - Project Context & Technical Reference

**Last Updated:** December 15, 2025  
**Status:** MVP Development - War Mode  
**Deadline:** December 29, 2025 (Paid Beta Launch)  
**Domain:** laova.space

---

## 1. WHAT IS LAOVA?

Laova is an **emotionally intelligent AI companion** embodied in an interactive 3D VRM character. Not just another chatbotâ€”a digital presence that listens, remembers, reacts emotionally, and helps users **transform their emotions**.

### Brand Identity

| Element | Value |
|---------|-------|
| **Name** | Laova (pronounced "la-o-va", 3 syllables) |
| **Domain** | laova.space |
| **Tagline** | "Space to feel. Space to heal." |
| **Logo** | Golden 5-pointed star with brushed texture |
| **Typography** | Comfortaa (wordmark) + Nunito (body) |
| **Social Handles** | @meetlaova (all platforms) |

### The Name Etymology

**LAOVA** combines:
- Phonetic proximity to **Laura** (first character)
- Evocation of **"L'Aura"** (energy, presence)
- Universal pronunciation across all languages
- Virgin SEO territory

**Sanskrit Energy Arc: L â†’ A â†’ O â†’ V â†’ A**
```
Grounding â†’ Opening â†’ Awakening/Transformation â†’ Breath/Movement â†’ Welcome
    L          A              O                      V              A
```
The central **O** is the heart of Laovaâ€”the space where emotions transform.

### Core Differentiators

| Competitor | What They Do | What Laova Does Better |
|------------|--------------|------------------------|
| Replika | Engagement-optimized companion | Emotional liberation (not addiction) |
| Character.AI | Multiple personas, text-only | Full embodiment (3D + voice + expressions) |
| Standard chatbots | Binary feedback (good/bad) | 48-dimension emotional feedback via Hume AI |

### The Vision

> "If AlphaGo mastered Go through self-play, Laova can become the world champion of emotional well-being."

**Philosophy:** Emotions that flow don't stay stuck. Laova detects suppressed emotions (via Hume AI) and helps users express and release themâ€”like a child who feels everything fully and moves on.

---

## 2. BRANDING & VISUAL IDENTITY

### Logo: Golden Star

**Design characteristics:**
- 5-pointed star with **rounded tips**
- **Brushed gold** texture (#E8C078)
- Rose-gold reflections (#E8B8A0)
- Subtle 3D effect, jewelry-like appearance

### Color Palette

**Logo/Brand Colors:**
| Name | Hex | Usage |
|------|-----|-------|
| Brushed Gold | #E8C078 | Logo, premium elements |
| Deep Gold | #D4A574 | Accents, shadows |
| Rose Gold | #E8B8A0 | Reflections, warmth |
| Golden Cream | #F5E6D0 | Highlights |

**Interface Colors (60/30/10 rule):**

*Primary (60%):*
| Name | Hex |
|------|-----|
| Sakura Rose | #FFB3D9 |
| Pale Lavender | #E6D5F5 |
| Cream White | #FFF8F0 |
| Soft Peach | #FFD4B8 |

*Secondary (30%):*
| Name | Hex |
|------|-----|
| Light Mint | #E0F9F5 |
| Lilac | #D4C5F9 |
| Rose Beige | #F5E6D8 |
| Pale Gold | #FFF4CC |

*Accents (10%):*
| Name | Hex |
|------|-----|
| Soft Gold | #FFD700 |
| Vivid Rose | #FF9FD5 |
| Coral | #FF9999 |

### Typography Rules

| Context | Format |
|---------|--------|
| Logo/Brand | lowercase: **laova** |
| Start of sentence | Capital: **Laova** |
| Domain | lowercase: **laova.space** |

**Never write "LAOVA" in caps** â€” loses the softness of the name.

---

## 3. TECHNICAL ARCHITECTURE

### Current Stack (V1)
```
Frontend:     React + TypeScript + Vite
3D Engine:    Three.js + React Three Fiber
Avatar:       VRM (Virtual Reality Model)
State:        Zustand
LLM:          Mistral AI API (mistral-small-latest)
Voice TTS:    ElevenLabs (eleven_v3)
Emotions:     Hume AI (48-dimension detection + RLHF signal)
Images:       Fal.ai (inner world visualization)
Payment:      Stripe
```

### Scaling Stack (V2+)
```
LLM Inference:    vLLM + Mistral 7B self-hosted (TPU v5e)
Training:         DPO via TRL + PEFT/LoRA on Modal (A100)
Orchestration:    Prefect Cloud (automated weekly training)
Database:         PostgreSQL + pgvector (RAG memory)
Cache:            Redis (sessions, rate limiting)
Versioning:       MLflow (model tracking)
Guardrails:       Claude Opus sampling (10% conversations)
```

### Cost Projections (10K users)

| Component | Monthly Cost |
|-----------|--------------|
| Mistral 7B (TPU v5e) | $3,000 |
| Hume AI (text analysis) | $4,500 |
| Infrastructure | $1,000 |
| Modal (weekly DPO training) | $200 |
| Monitoring & tools | $300 |
| **Total** | **~$9,000** |

**Unit Economics:** $0.90/user cost vs $14.99 price = **94% gross margin**

---

## 4. THE RLHF EMOTIONAL LOOP (Key Innovation)

### How It Works

1. User sends message â†’ Laova responds
2. Hume AI analyzes user's emotional state (48 dimensions, 0-100 each)
3. Compute wellness score based on emotional **release**, not just happiness
4. Create DPO pairs: (prompt, good_response, bad_response)
5. Weekly automated training improves Laova

### Wellness Score Function (Simplified)

```python
def wellness_score(emotions, history):
    # 40% - Emotional RELEASE (key signal!)
    release = detect_emotional_release(history, emotions)
    
    # 30% - Current emotions (weighted)
    emotion_score = (
        emotions["Contentment"] * 2.0 +
        emotions["Love"] * 1.9 +
        emotions["Realization"] * 1.4 +  # Insight!
        - emotions["Distress"] * 2.0 +
        - emotions["Anxiety"] * 1.5
    )
    
    # 20% - User autonomy (self-reflection, boundaries)
    autonomy = detect_autonomy_signals(history)
    
    # 10% - Penalties (validated harmful thoughts, avoidance)
    penalties = check_red_flags(history, emotions)
    
    return release * 0.4 + emotion_score * 0.3 + autonomy * 0.2 + penalties * 0.1
```

### Why This Solves Chatbot Problems

| Risk | Why Others Fail | Why Laova Avoids It |
|------|-----------------|---------------------|
| Manipulation | Optimized for engagement | Manipulation â†’ negative emotions â†’ low score â†’ learned to avoid |
| Sycophancy | Maximizes immediate satisfaction | Validation without release â†’ distress stays â†’ low score |
| Addiction | Time spent = success metric | Autonomy bonus in reward function |
| Avoidance | Dodges difficult topics | Avoidance detected (background distress) â†’ low score |

---

## 5. MONETIZATION MODEL

### Hybrid System: Credits + Subscription

#### Tier 1: Free (Acquisition)
- **Offer:** 5 minutes/day (~1 conversation)
- **Goal:** Create emotional attachment, test product-market fit
- **Conversion target:** 15-20% to credits or subscription

#### Tier 2: "Feed Laova" Credits (80-85% paying users)

**Gamified psychology:** User "feeds" Laova rather than buying time â†’ emotional bond, less transactional.

| Food | Price | Minutes | Conversations* | Target |
|------|-------|---------|----------------|--------|
| ðŸª Cookie | $1.99 | 7 min | 0.35 conv | Impulse buy, test |
| ðŸœ Ramen | $4.99 | 17 min | 0.85 conv | **Main entry point** |
| ðŸ± Bento | $9.99 | 35 min | 1.75 conv | **Best perceived value** (bestseller) |
| ðŸŽ‚ Cake | $19.99 | 70 min | 3.5 conv | Regular users |
| ðŸŽ‰ Feast | $49.99 | 175 min | 8.75 conv | Power users |

*Based on 20 min/conversation average in voice mode*

**Business advantages:**
- No monthly churn (one-time purchases)
- Power users pay proportionally more
- Better LTV (multiple purchases/month possible)
- Natural virality: "I just fed Laova ðŸœ"
- Gifting possible
- Seasonal events (Halloween, Christmas food)

#### Tier 3: "All-You-Can-Talk" Subscription (10-15% paying users)
- **Price:** $29.99/month
- **Offer:** Unlimited conversations (text + voice)
- **Target:** Power users wanting peace of mind

### Founding Member Pricing
- **Launch offer:** $7.49/month (50% off $14.99)
- **First 100 users:** Exclusive founding member status
- **Urgency driver:** Countdown on landing page

### Projected ARPU (Realistic Mix)
- 60% users â†’ Bento + Ramen = $15/month
- 30% users â†’ Cake Ã— 2 = $40/month
- 10% users â†’ Feast = $50/month
- **Average ARPU: $22/month**

---

## 6. COMPLIANCE & LEGAL (CRITICAL)

### SB 243 (California) - Effective January 1, 2026

**Required implementations BEFORE launch:**

| Requirement | Status | Priority |
|-------------|--------|----------|
| AI disclosure notifications | â³ | ðŸ”´ CRITICAL |
| 3-hour reminder system (minors) | â³ | ðŸ”´ CRITICAL |
| 988 Crisis hotline integration | â³ | ðŸ”´ CRITICAL |
| Suicidal ideation detection protocols | â³ | ðŸ”´ CRITICAL |
| Safety protocols published on website | â³ | ðŸ”´ CRITICAL |
| Robust age verification | â³ | ðŸ”´ CRITICAL |

**âš ï¸ Private right of action = unlimited liability risk. Non-negotiable.**

### Geofencing Requirements

| State | Restriction | Action |
|-------|-------------|--------|
| **Illinois** | BIPA biometric consent | Block users (too complex for V1) |
| **California** | SB 243 compliance | Full compliance required |

### Other Compliance

| Regulation | Requirement |
|------------|-------------|
| **GDPR** | Consent, data deletion, E2E encryption |
| **EU AI Act** | Transparency, no manipulation |
| **General** | Clear ToS, Privacy Policy, obvious AI disclosure |

### Crisis Resources

| Region | Hotline | Integration |
|--------|---------|-------------|
| USA | 988 | Required |
| France | 3114 | Required |

---

## 7. IMPLEMENTED FEATURES (V1)

### âœ… Working
- [x] VRM model loaded and animated
- [x] Conversation with Mistral (full memory)
- [x] ElevenLabs voice synthesis (French/English + audio tags)
- [x] Smooth lip sync (configurable sensitivity)
- [x] 12 VRM facial expressions with audio tag mapping
- [x] Gaze tracking (360Â° head + eyes)
- [x] Inner world visualization (Fal.ai images)
- [x] 12 pose controls with transitions
- [x] Settings panel (API keys, parameters)

### â³ To Complete for Launch (Dec 29)
- [ ] Stripe payment integration
- [ ] Landing page with countdown
- [ ] User onboarding flow
- [ ] Age verification (CA/IL)
- [ ] 988 crisis hotline integration
- [ ] AI disclosure popup
- [ ] Legal pages (Privacy, ToS, Safety)
- [ ] Production deployment

### âŒ V2+ (Post-Launch)
- [ ] Automated RLHF pipeline
- [ ] Multi-language support
- [ ] Self-hosted Mistral 7B
- [ ] Advanced gamification ("feeding", "sleep", "evolution")
- [ ] Mobile app (PWA or React Native)

---

## 8. PROJECT STRUCTURE

```
Laova/
â”œâ”€â”€ public/
â”‚   â””â”€â”€ Laura.vrm              # 3D model (to rename Laova.vrm)
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ Avatar.tsx         # VRM management
â”‚   â”‚   â”œâ”€â”€ Scene.tsx          # Three.js scene
â”‚   â”‚   â”œâ”€â”€ UI.tsx             # Main interface
â”‚   â”‚   â”œâ”€â”€ Settings.tsx       # API configuration
â”‚   â”‚   â”œâ”€â”€ ConversationPanel.tsx
â”‚   â”‚   â”œâ”€â”€ InnerVisualization.tsx
â”‚   â”‚   â”œâ”€â”€ PoseControls.tsx
â”‚   â”‚   â””â”€â”€ VisualizationSettings.tsx
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â””â”€â”€ useVoiceInteraction.ts
â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â””â”€â”€ useAppStore.ts     # Zustand global state
â”‚   â”œâ”€â”€ utils/
â”‚   â”‚   â”œâ”€â”€ ai.ts              # API calls (Mistral, ElevenLabs)
â”‚   â”‚   â”œâ”€â”€ audioTagEmotions.ts
â”‚   â”‚   â”œâ”€â”€ elevenLabsAgent.ts
â”‚   â”‚   â”œâ”€â”€ falai.ts           # Image generation
â”‚   â”‚   â”œâ”€â”€ poses.ts
â”‚   â”‚   â””â”€â”€ visualizationPrompt.ts
â”‚   â””â”€â”€ styles/
â””â”€â”€ docs/
```

---

## 9. API KEYS REQUIRED

| Service | Purpose | Required for V1 |
|---------|---------|-----------------|
| Mistral AI | Conversation LLM | âœ… Yes |
| ElevenLabs | Voice synthesis | âœ… Yes |
| Fal.ai | Image generation | âœ… Yes |
| Hume AI | Emotion detection | âš ï¸ Optional V1, Required V2 |
| Stripe | Payments | âœ… Yes (for launch) |
| OpenAI | Backup LLM | âŒ Optional |

---

## 10. GO-TO-MARKET STRATEGY

### Launch Timeline (Dec 15-29)

```
DEC 15-22          DEC 23-28              DEC 29          JAN 2-15
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
â”‚                 â”‚                      â”‚              â”‚
â”‚  Finalization   â”‚  Pre-Launch Setup    â”‚  LAUNCH ðŸš€   â”‚  Iteration
â”‚  Avatar + LP    â”‚  Compliance + Stripe â”‚              â”‚  & Scale
â”‚                 â”‚                      â”‚              â”‚
```

### Acquisition Channels (Priority Order)

1. **TikTok** (70-80% cheaper CPI than Facebook)
   - 15-30 second emotional conversation demos
   - Creator partnerships via TikTok Creator Marketplace
   - Target CPI: <$3

2. **Reddit** (High-intent organic)
   - r/artificial, r/CharacterAI, r/LocalLLaMA
   - Authentic posts, value-first content
   - Build karma before promotion

3. **Product Hunt** (Credibility + DR 91 backlink)
   - Coming Soon page ready
   - Target: Top 5 Product of the Day
   - Realistic: 500-1,500 signups day 1

### Landing Page Messaging

**Hero Section:**
> "She feels you.<br>An AI companion who truly understands."

**Subheadline:**
> "Laova doesn't just listen. She feels. Advanced emotion AI that detects what you're really feelingâ€”and helps you transform it."

**CTA:**
> "Enter your space" â†’ Email capture with countdown

### Key Objection Handlers

| Objection | Response |
|-----------|----------|
| "Is this another chatbot?" | "Laova detects 48 emotions. She knows when you're hiding something." |
| "Will I become dependent?" | "Built for autonomy. She helps you grow, not stay." |
| "Is it therapy?" | "No. Laova is a companion, not a therapist. She doesn't replace professionals." |
| "Why pay when ChatGPT is free?" | "ChatGPT doesn't see you, feel your energy, or have a 3D presence. Laova does." |

---

## 11. MARKET INTELLIGENCE

### Industry Benchmarks

| Metric | Target | Industry Best |
|--------|--------|---------------|
| Conversion (freemium) | 15-25% | Replika: ~25% |
| Monthly churn | <25% | Industry: 20-35% |
| Session duration | 10+ min | Character.AI: 17 min |
| Day 0 conversion | Critical | 82% of conversions happen Day 0 |
| LTV:CAC ratio | >3:1 | Minimum viable |

### Pricing Benchmarks

| App | Monthly Price |
|-----|---------------|
| Character.AI | $9.99 (volume) |
| Replika | $19.99 (value) |
| **Laova target** | **$12.99-$14.99** (balance) |

### Market Size

- AI companion CAGR: **29-31%**
- ARK projection: **$70-150B by 2030** (with gaming-style monetization)
- Revenue per download: **doubling YoY**

---

## 12. DECISION FRAMEWORK

When evaluating any feature or technical choice:

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Does it help us launch by Dec 29?           â”‚
â”‚   YES â†’ Implement                           â”‚
â”‚   NO  â†’ V2 backlog                          â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Is it essential for first paying users?     â”‚
â”‚   YES â†’ Priority 1                          â”‚
â”‚   NO  â†’ Can wait                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Is it taking >2 hours to fix a bug?         â”‚
â”‚   YES â†’ Cut feature or workaround           â”‚
â”‚   NO  â†’ Continue                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Is it perfectionism or real value?          â”‚
â”‚   Perfectionism â†’ Stop immediately          â”‚
â”‚   Real value    â†’ Proceed                   â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚ Is it SB 243 compliance?                    â”‚
â”‚   YES â†’ Non-negotiable, do it now           â”‚
â”‚   NO  â†’ Apply other filters                 â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 13. ANTI-PATTERNS TO AVOID

âŒ **Perfectionism:** Ship imperfect V1 > wait for perfect V1  
âŒ **Feature creep:** If it's not for Dec 29, it's V2  
âŒ **Over-engineering:** Simple solution that ships > elegant solution that doesn't  
âŒ **Compliance procrastination:** SB 243 is a blocker, not a nice-to-have  
âŒ **Single monetization model:** Hybrid credits + subscription = flexibility  

---

## 14. GUIDING PRINCIPLES

1. **Authenticity:** Laova must be sincere, never manipulative
2. **Empowerment:** Every feature contributes to user autonomy, not dependency
3. **Safety-First:** Compliance is a marketing argument, not a brake
4. **Transparency:** AI disclosure, data usageâ€”everything is clear
5. **User-Centric:** Optimize for real wellbeing, not vanity metrics
6. **Long-Term Thinking:** Build lasting relationships, not ephemeral addiction

---

## 15. QUICK REFERENCE

### Dev Server
```bash
npm run dev  # Port 5173 or 5174
```

### Performance Targets
- VRM load time: ~2-3 seconds
- Mistral latency: ~1-2 seconds
- ElevenLabs latency: ~500ms-1s
- Target FPS: 60 stable

### Laova's Personality
- **Traits:** Helpful, kind, playful, anime-aesthetic
- **Visual style:** Warm pastels (pink, peach, lavender)
- **Mood:** Dreamy, optimistic, comforting
- **Avatar:** Rose Sakura variation (recommended)

---

**Remember:** Laova isn't just a chatbot with a 3D avatar. It's a new approach to AI companionship where ethics emerge naturally from the emotional feedback loop. Ship it, learn from users, iterate.

> *"A companion who understands you, makes you feel good, grows with you, and shares her dreams."*

ðŸŒŸ **Laova: Space to feel. Space to heal.** ðŸŒŸ

---

*Document version 2.0 â€” December 2025*  
*For the Laova project â€” AI Companion for emotional transformation*
