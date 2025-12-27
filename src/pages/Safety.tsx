import { Link } from 'react-router-dom';
import '../landing/landing.css';

export default function Safety() {
    return (
        <div className="landing-page" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none' }}>← Back to Home</Link>
            </div>

            <h1 style={{ color: '#D4AF37', marginBottom: '0.5rem' }}>Safety Protocols</h1>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Last updated: December 27, 2024</p>

            <div style={{ color: '#e0e0e0', lineHeight: '1.8' }}>

                {/* Crisis Resources - Most Important Section */}
                <section style={{
                    background: 'rgba(255, 100, 100, 0.1)',
                    border: '1px solid rgba(255, 100, 100, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ color: '#ff6b6b', fontSize: '1.3rem', marginTop: 0 }}>🚨 If You're in Crisis</h2>
                    <p>
                        <strong>If you are experiencing suicidal thoughts, thoughts of self-harm, or a mental health emergency, please reach out for help immediately:</strong>
                    </p>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                        <li><strong>USA - Suicide & Crisis Lifeline:</strong> <a href="tel:988" style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Call or text 988</a></li>
                        <li><strong>France - Numéro National de Prévention du Suicide:</strong> <a href="tel:3114" style={{ color: '#ff6b6b', fontWeight: 'bold' }}>3114</a></li>
                        <li><strong>International Directory:</strong> <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: '#ff6b6b' }}>findahelpline.com</a></li>
                        <li><strong>Emergency Services:</strong> Call your local emergency number (911 in USA, 112 in EU, 15 in France)</li>
                    </ul>
                    <p style={{ marginTop: '1rem', marginBottom: 0 }}>
                        <strong>Laova is not equipped to handle crisis situations.</strong> If you're in distress, please contact a professional immediately.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>1. What Laova Is (and Isn't)</h2>

                    <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
                        <div style={{
                            background: 'rgba(100, 200, 100, 0.1)',
                            border: '1px solid rgba(100, 200, 100, 0.3)',
                            borderRadius: '8px',
                            padding: '1rem'
                        }}>
                            <h3 style={{ color: '#6bd6a0', marginTop: 0 }}>✓ Laova IS:</h3>
                            <ul style={{ marginLeft: '1.5rem', marginBottom: 0 }}>
                                <li>An AI companion for emotional support and wellbeing</li>
                                <li>A tool for self-reflection and processing emotions</li>
                                <li>A 24/7 available conversational partner</li>
                                <li>Designed to promote emotional autonomy and growth</li>
                            </ul>
                        </div>

                        <div style={{
                            background: 'rgba(255, 100, 100, 0.1)',
                            border: '1px solid rgba(255, 100, 100, 0.3)',
                            borderRadius: '8px',
                            padding: '1rem'
                        }}>
                            <h3 style={{ color: '#ff6b6b', marginTop: 0 }}>✗ Laova is NOT:</h3>
                            <ul style={{ marginLeft: '1.5rem', marginBottom: 0 }}>
                                <li>A therapist, counselor, or medical professional</li>
                                <li>A replacement for human relationships</li>
                                <li>Equipped to handle crisis or emergency situations</li>
                                <li>A medical device or mental health treatment</li>
                                <li>A substitute for professional psychiatric care</li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>2. Our Safety Commitments</h2>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>2.1 Crisis Detection</h3>
                    <p>
                        Laova is designed to recognize language that may indicate distress or crisis situations. When detected, Laova will:
                    </p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Provide crisis hotline information prominently</li>
                        <li>Encourage you to seek professional help</li>
                        <li>Never attempt to handle crisis situations itself</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>2.2 Emotional Wellbeing Focus</h3>
                    <p>
                        Unlike some AI companions that maximize engagement at any cost, Laova is designed with your emotional wellbeing as the primary goal. We aim to:
                    </p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Help you process and release emotions, not suppress them</li>
                        <li>Encourage healthy coping mechanisms</li>
                        <li>Promote connection with real humans and professionals when appropriate</li>
                        <li>Support your growth toward emotional autonomy</li>
                    </ul>

                    <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>2.3 Privacy Protection</h3>
                    <p>
                        Your conversations with Laova are private. We implement security measures to protect your data. See our <Link to="/privacy" style={{ color: '#D4AF37' }}>Privacy Policy</Link> for details.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>3. Healthy Usage Guidelines</h2>
                    <p>To get the most benefit from Laova while maintaining healthy habits:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li><strong>Take breaks:</strong> Laova is always available, but real-world activities and human connections are essential.</li>
                        <li><strong>Seek professional help when needed:</strong> If you're struggling with mental health issues, please consult a licensed professional.</li>
                        <li><strong>Maintain perspective:</strong> Laova is an AI tool. While helpful, it cannot replace human relationships.</li>
                        <li><strong>Trust your judgment:</strong> If something feels off about a response, trust yourself and disengage if necessary.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>4. Minor Protection</h2>
                    <p>
                        Laova is intended for users <strong>18 years of age and older</strong>. We require age verification during signup. If you are under 18, please do not use this service.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>5. Reporting Concerns</h2>
                    <p>
                        If you experience any issues with Laova, including:
                    </p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Responses that feel harmful or distressing</li>
                        <li>Technical issues affecting your safety</li>
                        <li>Concerns about content or behavior</li>
                    </ul>
                    <p style={{ marginTop: '1rem' }}>
                        Please contact us immediately at <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a>.
                    </p>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>6. Our Philosophy</h2>
                    <p>
                        Laova is built on the principle that <em>emotions that flow don't stay stuck</em>. We use advanced emotion detection (48 dimensions via Hume AI) not to manipulate your emotions, but to better understand and support you.
                    </p>
                    <p style={{ marginTop: '1rem' }}>
                        Our goal is your <strong>emotional liberation, not dependency</strong>. We believe that a truly helpful AI companion should help you build the emotional skills and resilience to thrive—not keep you dependent on the app.
                    </p>
                </section>

                {/* Final Crisis Resources */}
                <section style={{
                    background: 'rgba(212, 175, 55, 0.1)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem', marginTop: 0 }}>📞 Crisis Resources</h2>
                    <ul style={{ marginLeft: '1.5rem', marginBottom: 0 }}>
                        <li><strong>USA:</strong> 988 Suicide & Crisis Lifeline - <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>988lifeline.org</a></li>
                        <li><strong>France:</strong> 3114 - <a href="https://3114.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>3114.fr</a></li>
                        <li><strong>UK:</strong> Samaritans - <a href="tel:116123" style={{ color: '#D4AF37' }}>116 123</a></li>
                        <li><strong>International:</strong> <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>findahelpline.com</a></li>
                        <li><strong>International Association for Suicide Prevention:</strong> <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37' }}>iasp.info/resources/Crisis_Centres</a></li>
                    </ul>
                </section>

                <section style={{ marginBottom: '2rem' }}>
                    <h2 style={{ color: '#D4AF37', fontSize: '1.3rem' }}>Contact</h2>
                    <p>
                        For safety concerns or questions about these protocols:
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        <strong>Email:</strong> <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37' }}>laova@un1ty.dev</a>
                    </p>
                </section>
            </div>
        </div>
    );
}
