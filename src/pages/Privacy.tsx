import { Link } from 'react-router-dom';
import '../landing/landing.css';
import { PrivacyContent } from '../landing/LegalContent';

export default function Privacy() {
    return (
        <div className="landing-page" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link to="/" style={{ color: '#D4AF37', textDecoration: 'none' }}>← Back to Home</Link>
            </div>

            <h1 style={{ color: '#D4AF37', marginBottom: '0.5rem' }}>Privacy Policy</h1>

            <div style={{ color: '#e0e0e0', lineHeight: '1.8' }}>
                <PrivacyContent />
            </div>
        </div>
    );
}
