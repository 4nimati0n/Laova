import { useState } from 'react';
import LegalModal from './LegalModal';
import { PrivacyContent, TermsContent, SafetyContent } from './LegalContent';

export default function Footer() {
    const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'safety' | null>(null);

    return (
        <>
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="legal-disclaimer">
                        <p>
                            Laova is an AI companion designed to support emotional wellbeing.
                            Laova is not a medical device, healthcare provider, or mental health service.
                            Not a substitute for professional care. If you're experiencing a crisis,
                            please contact 988 (Suicide & Crisis Lifeline) or visit your local emergency room.
                        </p>
                        <p>18+ only. By continuing, you confirm you are 18 years or older.</p>
                    </div>

                    <div className="footer-links">
                        <button
                            onClick={() => setActiveModal('privacy')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'inherit',
                                font: 'inherit',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            Privacy Policy
                        </button>
                        <button
                            onClick={() => setActiveModal('terms')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'inherit',
                                font: 'inherit',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            Terms of Service
                        </button>
                        <button
                            onClick={() => setActiveModal('safety')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'inherit',
                                font: 'inherit',
                                cursor: 'pointer',
                                padding: 0
                            }}
                        >
                            Safety Protocols
                        </button>
                        <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer">Crisis Resources (988)</a>
                        <a href="mailto:laova@un1ty.dev">Contact: laova@un1ty.dev</a>
                    </div>

                    <div className="copyright">
                        © {new Date().getFullYear()} Laova. All rights reserved.
                    </div>
                </div>
            </footer>

            {/* Legal Modals */}
            <LegalModal
                isOpen={activeModal === 'privacy'}
                onClose={() => setActiveModal(null)}
                title="Privacy Policy"
            >
                <PrivacyContent />
            </LegalModal>

            <LegalModal
                isOpen={activeModal === 'terms'}
                onClose={() => setActiveModal(null)}
                title="Terms of Service"
            >
                <TermsContent />
            </LegalModal>

            <LegalModal
                isOpen={activeModal === 'safety'}
                onClose={() => setActiveModal(null)}
                title="Safety Protocols"
            >
                <SafetyContent />
            </LegalModal>
        </>
    );
}
