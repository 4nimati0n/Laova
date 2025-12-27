// Legal content components for use in modals
// These contain the same content as the page components but without the page wrapper

export function PrivacyContent() {
    return (
        <>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Last updated: December 27, 2024</p>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>1. Introduction</h3>
                <p>
                    Laova ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI companion service at laova.space (the "Service").
                </p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>2. Information We Collect</h3>
                <p><strong>Account Information:</strong> Email address, name (optional), and payment information when you subscribe.</p>
                <p><strong>Conversation Data:</strong> Text and voice messages you exchange with Laova.</p>
                <p><strong>Emotional Data:</strong> When you use voice features, we may analyze emotional patterns using Hume AI. This data is processed in real-time and not permanently stored.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>3. How We Use Your Information</h3>
                <ul style={{ marginLeft: '1.5rem' }}>
                    <li>Provide, maintain, and improve the Laova service</li>
                    <li>Process transactions and send related information</li>
                    <li>Personalize your experience</li>
                    <li>Provide emotionally-aware responses</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>4. Third-Party Services</h3>
                <p>We integrate with: Mistral AI, ElevenLabs, Hume AI, Stripe, Firebase, and Netlify.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>5. Your Rights</h3>
                <p>You may request access, correction, or deletion of your data. Contact us at <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a>.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>6. Children's Privacy</h3>
                <p>Laova is intended for users 18 years of age or older.</p>
            </section>

            <section>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>7. Contact</h3>
                <p><strong>Email:</strong> <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a></p>
            </section>
        </>
    );
}

export function TermsContent() {
    return (
        <>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Last updated: December 27, 2024</p>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>1. Acceptance of Terms</h3>
                <p>By using Laova, you agree to these Terms of Service.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>2. Description of Service</h3>
                <p>Laova is an <strong>AI companion</strong> for emotional wellbeing.</p>
                <div style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                }}>
                    <p style={{ margin: 0 }}>
                        <strong style={{ color: '#D4AF37' }}>⚠️ Important:</strong> Laova is NOT a medical device or mental health service. Not a substitute for professional care.
                    </p>
                </div>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>3. Eligibility</h3>
                <p>You must be <strong>18 years or older</strong> to use Laova.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>4. AI Disclosure</h3>
                <p>Laova is powered by AI. All interactions are with an AI system, not a human.</p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>5. Payments & Refunds</h3>
                <p>Payments processed via Stripe. Refund requests within 7 days: <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a></p>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>6. Crisis Situations</h3>
                <p><strong>If you're in crisis:</strong></p>
                <ul style={{ marginLeft: '1.5rem' }}>
                    <li><strong>USA:</strong> Call or text 988</li>
                    <li><strong>France:</strong> Call 3114</li>
                    <li><strong>International:</strong> <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>findahelpline.com</a></li>
                </ul>
            </section>

            <section>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>7. Contact</h3>
                <p><strong>Email:</strong> <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a></p>
            </section>
        </>
    );
}

export function SafetyContent() {
    return (
        <>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Last updated: December 27, 2024</p>

            {/* Crisis Resources */}
            <section style={{
                background: 'rgba(255, 100, 100, 0.15)',
                border: '1px solid rgba(255, 100, 100, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <h3 style={{ color: '#ff6b6b', fontSize: '1.2rem', marginTop: 0 }}>🚨 If You're in Crisis</h3>
                <ul style={{ marginLeft: '1.5rem', marginBottom: 0 }}>
                    <li><strong>USA:</strong> <a href="tel:988" style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Call or text 988</a></li>
                    <li><strong>France:</strong> <a href="tel:3114" style={{ color: '#ff6b6b', fontWeight: 'bold' }}>3114</a></li>
                    <li><strong>International:</strong> <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6b6b' }}>findahelpline.com</a></li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>What Laova IS:</h3>
                <ul style={{ marginLeft: '1.5rem' }}>
                    <li>An AI companion for emotional support</li>
                    <li>A tool for self-reflection</li>
                    <li>Designed for emotional autonomy and growth</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>What Laova is NOT:</h3>
                <ul style={{ marginLeft: '1.5rem' }}>
                    <li>A therapist or medical professional</li>
                    <li>A replacement for human relationships</li>
                    <li>Equipped for crisis or emergency situations</li>
                </ul>
            </section>

            <section style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>Healthy Usage</h3>
                <ul style={{ marginLeft: '1.5rem' }}>
                    <li>Take breaks - real-world connections matter</li>
                    <li>Seek professional help when needed</li>
                    <li>Laova is 18+ only</li>
                </ul>
            </section>

            <section>
                <h3 style={{ color: '#D4AF37', fontSize: '1.2rem' }}>Contact</h3>
                <p><strong>Email:</strong> <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a></p>
            </section>
        </>
    );
}
