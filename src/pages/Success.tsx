import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import '../landing/landing.css';

const Success = () => {
    const navigate = useNavigate();

    // Optional: confetti or sound effect could go here

    return (
        <div className="landing-page" style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)', // fallback
            position: 'relative'
        }}>
            {/* Re-using the background from landing if possible, 
               or just a dark elegant background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, #2a2010 0%, #0d0b0a 100%)',
                zIndex: 0
            }} />

            <div className="modal-content" style={{
                zIndex: 1,
                maxWidth: '600px',
                animation: 'modalPopIn 0.5s ease-out'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '2rem'
                }}>
                    <div style={{
                        background: 'rgba(212, 175, 55, 0.1)',
                        padding: '1.5rem',
                        borderRadius: '50%',
                        border: '1px solid rgba(212, 175, 55, 0.3)',
                        boxShadow: '0 0 30px rgba(212, 175, 55, 0.2)'
                    }}>
                        <CheckCircle size={64} color="#D4AF37" />
                    </div>
                </div>

                <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome!</h2>

                <p style={{
                    color: '#e0e0e0',
                    fontSize: '1.1rem',
                    marginBottom: '1rem',
                    lineHeight: '1.6'
                }}>
                    Your payment has been successfully processed.
                </p>

                <p style={{
                    color: '#aaa',
                    fontSize: '1rem',
                    marginBottom: '2.5rem',
                    lineHeight: '1.6'
                }}>
                    You are now one of our early supporters. You will receive a confirmation email shortly,
                    and we will keep you informed about Laova's official launch.
                </p>

                <button
                    className="cta-primary"
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.8rem'
                    }}
                >
                    <ArrowLeft size={20} />
                    Back to home
                </button>
            </div>
        </div>
    );
};

export default Success;
