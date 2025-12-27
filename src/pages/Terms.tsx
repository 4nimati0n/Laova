import { Link } from 'react-router-dom';
import '../landing/landing.css';

export default function Terms() {
    return (
        <div className="landing-page" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none' }}>← Back to Home</Link>
            </div>

            <h1 style={{ color: '#D4AF37', marginBottom: '0.5rem' }}>Terms of Service</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Last updated: December 27, 2024</p>

            <div style={{ color: '#e0e0e0', lineHeight: '1.8' }}>
                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>1. Acceptance of Terms</h2>
                    <p>
                        By accessing or using Laova (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>2. Description of Service</h2>
                    <p>
                        Laova is an <strong>AI companion</strong> designed to support emotional wellbeing and personal growth through conversational interactions with an emotionally-aware 3D avatar.
                    </p>
                    <div style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginTop: '1rem'
                    }}>
                        <p style={{ margin: 0 }}>
                            <strong style={{ color: '#D4AF37' }}>⚠️ Important Disclaimer:</strong><br />
                            Laova is <strong>NOT</strong> a medical device, healthcare provider, or mental health service. Laova is not intended to diagnose, treat, cure, or prevent any disease or mental health condition. Conversations with Laova are <strong>not a substitute</strong> for professional medical advice, diagnosis, or treatment.
                        </p>
                    </div>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>3. Eligibility</h2>
                    <p>
                        You must be <strong>18 years of age or older</strong> to use Laova. By using the Service, you represent and warrant that you meet this age requirement.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>4. AI Disclosure</h2>
                    <p>
                        Laova is powered by artificial intelligence technology. All interactions with Laova are with an AI system, not a human. While Laova is designed to provide emotionally supportive conversations, it:
                    </p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Does not have consciousness, feelings, or genuine emotions</li>
                        <li>Cannot form actual relationships</li>
                        <li>May occasionally produce inaccurate or inappropriate responses</li>
                        <li>Should not be relied upon for medical, legal, financial, or professional advice</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>5. Subscriptions and Payments</h2>
                    <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>5.1 Billing</h3>
                    <p>
                        If you choose a paid subscription, you authorize us to charge your payment method on a recurring basis. All payments are processed securely through Stripe.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>5.2 Refunds</h3>
                    <p>
                        Refund requests are handled on a case-by-case basis. Contact us at <a href="mailto:hello@laova.space" style={{ color: '#D4AF37' }}>hello@laova.space</a> within 7 days of purchase if you are unsatisfied with the Service.
                    </p>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>5.3 Cancellation</h3>
                    <p>
                        You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>6. Acceptable Use</h2>
                    <p>You agree NOT to use Laova to:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Violate any applicable laws or regulations</li>
                        <li>Harass, abuse, or harm others</li>
                        <li>Generate illegal, harmful, or discriminatory content</li>
                        <li>Attempt to extract personal data about other users</li>
                        <li>Interfere with or disrupt the Service</li>
                        <li>Reverse engineer or attempt to extract the source code</li>
                        <li>Use automated systems to access the Service in bulk</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>7. Crisis Situations</h2>
                    <p>
                        <strong>If you are experiencing a mental health crisis, suicidal thoughts, or thoughts of self-harm, please seek immediate help:</strong>
                    </p>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                        <li><strong>USA:</strong> Call or text 988 (Suicide & Crisis Lifeline)</li>
                        <li><strong>France:</strong> Call 3114</li>
                        <li><strong>International:</strong> Visit <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>findahelpline.com</a></li>
                        <li><strong>Emergency:</strong> Call your local emergency services</li>
                    </ul>
                    <p style={{ marginTop: '1rem' }}>
                        Laova is <strong>not equipped to handle crisis situations</strong> and should never be used as a substitute for emergency services or professional mental health care.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>8. Intellectual Property</h2>
                    <p>
                        All content, features, and functionality of Laova (including but not limited to text, graphics, logos, 3D models, and software) are owned by Laova and are protected by intellectual property laws.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>9. Limitation of Liability</h2>
                    <p>
                        TO THE MAXIMUM EXTENT PERMITTED BY LAW, LAOVA AND ITS CREATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                        Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>10. Disclaimer of Warranties</h2>
                    <p>
                        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>11. Modifications to Terms</h2>
                    <p>
                        We reserve the right to modify these Terms at any time. We will provide notice of significant changes by updating the "Last updated" date. Your continued use of the Service after changes constitutes acceptance of the new Terms.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>12. Termination</h2>
                    <p>
                        We may terminate or suspend your access to the Service at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>13. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with the laws of France, without regard to its conflict of law provisions.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>14. Contact</h2>
                    <p>
                        For questions about these Terms, please contact us:
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        <strong>Email:</strong> <a href="mailto:hello@laova.space" style={{ color: '#D4AF37' }}>hello@laova.space</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
