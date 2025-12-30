import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { createCheckoutSession } from '../utils/stripe';
import { trackConversionEvent } from '../hooks/useConversionTracking';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedTier: { priceId?: string; mode: 'subscription' | 'payment' };
}

export default function CheckoutModal({ isOpen, onClose, selectedTier }: CheckoutModalProps) {
    const [agreed18, setAgreed18] = useState(false);
    const [agreedAI, setAgreedAI] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Track modal opens
    useEffect(() => {
        if (isOpen) {
            trackConversionEvent('modal_open');
        }
    }, [isOpen]);

    const handleCheckout = async () => {
        if (!agreed18 || !agreedAI || !agreedTerms) {
            alert('Please confirm all checkboxes');
            return;
        }

        setIsLoading(true);
        try {
            await createCheckoutSession(selectedTier.priceId, selectedTier.mode);
        } catch (error) {
            console.error(error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Before You Continue</h2>

                <div className="checkbox-group">
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
                        I've read the <a href="/privacy" target="_blank">Privacy Policy</a> and <a href="/terms" target="_blank">Terms of Service</a>
                    </label>
                </div>

                <p className="crisis-note">
                    If you're in crisis, please call 988 immediately.
                    Laova is not a substitute for professional mental health care.
                </p>

                <button
                    className="cta-primary"
                    onClick={handleCheckout}
                    disabled={!agreed18 || !agreedAI || !agreedTerms || isLoading}
                >
                    {isLoading ? 'Loading...' : 'I Understand • Continue to Payment'}
                </button>

                <button className="cta-secondary" onClick={onClose} disabled={isLoading}>
                    Cancel
                </button>
            </div>
        </div>,
        document.body
    );
}
