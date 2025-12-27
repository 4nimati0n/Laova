
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
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
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/terms">Terms of Service</Link>
                    <Link to="/safety">Safety Protocols</Link>
                    <a href="https://988lifeline.org" target="_blank" rel="noopener noreferrer">Crisis Resources (988)</a>
                    <a href="mailto:laova@un1ty.dev">Contact: laova@un1ty.dev</a>
                </div>

                <div className="copyright">
                    © {new Date().getFullYear()} Laova. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
