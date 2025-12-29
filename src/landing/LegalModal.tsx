import { type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export default function LegalModal({ isOpen, onClose, title, children }: LegalModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="legal-modal-content"
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'linear-gradient(180deg, rgba(35, 28, 22, 0.95) 0%, rgba(20, 16, 12, 0.98) 100%)',
                    backdropFilter: 'blur(20px) saturate(150%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                    border: '2px solid #B8963F',
                    boxShadow: '0 0 0 1px rgba(184, 150, 63, 0.3) inset, 0 30px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(184, 150, 63, 0.15)',
                    width: '90%',
                    maxWidth: '700px',
                    maxHeight: '80vh',
                    borderRadius: '16px',
                    position: 'relative',
                    animation: 'modalPopIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.5rem 2rem 1rem',
                    borderBottom: '1px solid rgba(184, 150, 63, 0.3)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                }}>
                    <h2 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '1.8rem',
                        fontWeight: 400,
                        color: '#D4AF37',
                        margin: 0
                    }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#B8963F',
                            fontSize: '2rem',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            lineHeight: 1,
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#F5EFE0'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#B8963F'}
                    >
                        ×
                    </button>
                </div>

                {/* Scrollable Content */}
                <div style={{
                    padding: '1.5rem 2rem 2rem',
                    overflowY: 'auto',
                    flex: 1,
                    color: '#e0e0e0',
                    lineHeight: 1.8
                }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
