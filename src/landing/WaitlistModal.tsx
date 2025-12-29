import { useState } from 'react';
import { createPortal } from 'react-dom';
import { rtdb } from '../utils/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';

interface WaitlistModalProps {
    isOpen: boolean;
    onClose: () => void;
    tier: 'explorer' | 'visionary';
}

export default function WaitlistModal({ isOpen, onClose, tier }: WaitlistModalProps) {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (rtdb) {
                const waitlistRef = ref(rtdb, 'waitlist');
                await push(waitlistRef, {
                    email,
                    tier,
                    createdAt: serverTimestamp()
                });
            }
            setSubmitted(true);
        } catch (err) {
            console.error('Error adding to waitlist:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content waitlist-modal" onClick={(e) => e.stopPropagation()}>
                {submitted ? (
                    <>
                        <h2>You're on the list! ✨</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            We'll contact you as soon as new {tier === 'explorer' ? 'Explorer' : 'Visionary'} spots open.
                        </p>
                        <button className="cta-primary" onClick={onClose}>
                            Close
                        </button>
                    </>
                ) : (
                    <>
                        <h2>{tier === 'explorer' ? 'Explorer' : 'Visionary'} — Sold Out</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            All founding spots are taken for now.<br />
                            Join the waitlist to be notified when more open.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '1rem',
                                    border: '1px solid var(--gold-dim)',
                                    borderRadius: '8px',
                                    background: 'var(--bg-surface)',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            />

                            {error && (
                                <p style={{ color: '#e74c3c', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="cta-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                            </button>
                        </form>

                        <button
                            className="cta-secondary"
                            onClick={onClose}
                            style={{ marginTop: '0.5rem' }}
                        >
                            Cancel
                        </button>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}
