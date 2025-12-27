import { Link } from 'react-router-dom';
import '../landing/landing.css';

export default function Privacy() {
    return (
        <div className="landing-page" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none' }}>← Back to Home</Link>
            </div>

            <h1 style={{ color: '#D4AF37', marginBottom: '0.5rem' }}>Privacy Policy</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Last updated: December 27, 2024</p>

            <div style={{ color: '#e0e0e0', lineHeight: '1.8' }}>
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>1. Introduction</h2>
                    <p>
                        Laova ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI companion service at laova.space (the "Service").
                    </p>
                    <p>
                        By using Laova, you agree to the collection and use of information in accordance with this policy.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>2. Information We Collect</h2>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>2.1 Information You Provide</h3>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li><strong>Account Information:</strong> Email address, name (optional), and payment information when you subscribe.</li>
                        <li><strong>Conversation Data:</strong> Text and voice messages you exchange with Laova.</li>
                        <li><strong>Preferences:</strong> Settings and configurations you choose within the app.</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>2.2 Information Collected Automatically</h3>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li><strong>Emotional Data:</strong> When you use voice features, we may analyze emotional patterns in your voice using Hume AI to provide better responses. This data is processed in real-time and not permanently stored.</li>
                        <li><strong>Usage Data:</strong> Browser type, device information, pages visited, and interaction patterns.</li>
                        <li><strong>Cookies:</strong> We use essential cookies for authentication and preferences.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>3. How We Use Your Information</h2>
                    <p>We use the collected information to:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Provide, maintain, and improve the Laova service</li>
                        <li>Process transactions and send related information</li>
                        <li>Personalize your experience and remember your preferences</li>
                        <li>Provide contextual, emotionally-aware responses during conversations</li>
                        <li>Send you updates about the service (with your consent)</li>
                        <li>Detect, prevent, and address technical issues</li>
                        <li>Comply with legal obligations</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>4. Third-Party Services</h2>
                    <p>Laova integrates with the following third-party services to provide our features:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li><strong>Mistral AI:</strong> Powers Laova's conversational intelligence.</li>
                        <li><strong>ElevenLabs:</strong> Provides voice synthesis for Laova's speech.</li>
                        <li><strong>Hume AI:</strong> Analyzes emotional patterns in voice interactions.</li>
                        <li><strong>Stripe:</strong> Processes all payment transactions securely.</li>
                        <li><strong>Firebase:</strong> Stores subscriber information securely.</li>
                        <li><strong>Netlify:</strong> Hosts the Laova application.</li>
                    </ul>
                    <p style={{ marginTop: '1rem' }}>
                        Each of these services has their own privacy policies. We encourage you to review them.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>5. Data Retention</h2>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li><strong>Conversation Data:</strong> Stored during your session to provide context. We do not permanently store full conversation logs.</li>
                        <li><strong>Account Data:</strong> Retained as long as your account is active or as needed to provide services.</li>
                        <li><strong>Payment Data:</strong> Handled by Stripe; we do not store credit card numbers.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>6. Data Security</h2>
                    <p>
                        We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure. We strive to use commercially acceptable means to protect your data.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>7. Your Rights</h2>
                    <p>Depending on your location, you may have the right to:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Access the personal information we hold about you</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to or restrict certain processing</li>
                        <li>Data portability</li>
                        <li>Withdraw consent at any time</li>
                    </ul>
                    <p style={{ marginTop: '1rem' }}>
                        To exercise these rights, contact us at <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a>.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>8. Children's Privacy</h2>
                    <p>
                        Laova is intended for users who are 18 years of age or older. We do not knowingly collect personal information from anyone under 18. If you become aware that a child has provided us with personal data, please contact us immediately.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>9. International Data Transfers</h2>
                    <p>
                        Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>10. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>11. Contact Us</h2>
                    <p>
                        If you have questions about this Privacy Policy or our data practices, please contact us:
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        <strong>Email:</strong> <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
