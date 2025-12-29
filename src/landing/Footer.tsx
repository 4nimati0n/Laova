import { useState, useEffect } from 'react';
import LegalModal from './LegalModal';
import { PrivacyContent, TermsContent, SafetyContent } from './LegalContent';
import { rtdb } from '../utils/firebase';
import { ref, onValue } from 'firebase/database';

export default function Footer() {
    const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'safety' | null>(null);
    const [spots, setSpots] = useState({ explorer: 34, visionary: 13 });

    useEffect(() => {
        if (!rtdb) {
            console.warn("Footer: RTDB not initialized");
            return;
        }

        const countersRef = ref(rtdb, 'counters/availableSpots');
        console.log("Footer: Listening to counters at", countersRef.toString());

        const unsubscribe = onValue(countersRef, (snapshot) => {
            const data = snapshot.val();
            console.log("Footer: Received data:", data);
            if (data) {
                setSpots({
                    explorer: data.explorer !== undefined ? data.explorer : 34,
                    visionary: data.visionary !== undefined ? data.visionary : 13
                });
            }
        }, (error) => {
            console.error("Footer: Firebase Read Error:", error);
        });

        return () => unsubscribe();
    }, []);


    return (
        <>
            <footer className="landing-footer" style={{ padding: '2rem 1rem', marginTop: 'auto', width: '100%', boxSizing: 'border-box' }}>
                <div className="footer-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', width: '100%', height: '100%', textAlign: 'center' }}>

                    {/* Live Spot Counters */}
                    <div style={{
                        display: 'flex',
                        gap: '1.5rem',
                        fontFamily: 'Playfair Display, serif',
                        color: '#D4AF37',
                        fontSize: '1.1rem',
                        marginBottom: '0.5rem'
                    }}>
                        <span>Explorer: {spots.explorer} spots left</span>
                        <span style={{ color: '#554a40' }}>|</span>
                        <span>Visionary: {spots.visionary} spots left</span>
                    </div>

                    {/* Minimalist Link/Button Row */}
                    <div className="footer-links" style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}>
                        <button
                            onClick={() => setActiveModal('privacy')}
                            style={{ background: 'transparent', border: 'none', color: '#D4AF37', font: 'inherit', cursor: 'pointer', fontSize: '0.9rem', transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Privacy
                        </button>
                        <span style={{ color: '#D4AF37', opacity: 0.5 }}>|</span>
                        <button
                            onClick={() => setActiveModal('terms')}
                            style={{ background: 'transparent', border: 'none', color: '#D4AF37', font: 'inherit', cursor: 'pointer', fontSize: '0.9rem', transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Terms
                        </button>
                        <span style={{ color: '#D4AF37', opacity: 0.5 }}>|</span>
                        <button
                            onClick={() => setActiveModal('safety')}
                            style={{ background: 'transparent', border: 'none', color: '#D4AF37', font: 'inherit', cursor: 'pointer', fontSize: '0.9rem', transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Safety
                        </button>
                        <span style={{ color: '#D4AF37', opacity: 0.5 }}>|</span>
                        <a
                            href="https://988lifeline.org"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.9rem', transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                        >
                            Crisis (988)
                        </a>
                    </div>

                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: '#D4AF37' }}>
                        <a href="mailto:laova@un1ty.dev" style={{ color: '#D4AF37', textDecoration: 'none', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>laova@un1ty.dev</a>
                        <span>© {new Date().getFullYear()} Laova</span>
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
