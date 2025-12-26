
interface PricingProps {
    onOpenModal: () => void;
}

export default function Pricing({ onOpenModal }: PricingProps) {
    return (
        <section className="pricing-section">
            <h2>Join the Founding Members</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                Laova launches when all spots are filled.
            </p>

            <div className="pricing-grid">

                {/* Option 1: Monthly Explorer */}
                <div className="pricing-card">
                    <span className="tier-name">Explorer</span>
                    <p className="tier-tagline">Start your journey.</p>
                    <div className="price">
                        <span className="amount">$7.49</span>
                        <span className="period">/ month</span>
                    </div>

                    <ul className="benefits">
                        <li>🎟️ Priority launch access</li>
                        <li>🔒 Price locked forever</li>
                        <li>🎁 Monthly credits included</li>
                        <li>🏅 Founding Member badge</li>
                    </ul>

                    <button className="cta-outline" onClick={onOpenModal}>
                        Become Explorer
                    </button>
                    <p className="small-print" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        After launch: $14.99/mo
                    </p>
                </div>

                {/* Option 2: Lifetime Visionary */}
                <div className="pricing-card premium">
                    <span className="tier-name">Visionary</span>
                    <p className="tier-tagline tier-tagline-gold">Be part of the story from day one.</p>
                    <div className="price">
                        <span className="amount">$149</span>
                        <span className="period">one-time</span>
                    </div>

                    <ul className="benefits">
                        <li>✨ <strong>Lifetime access</strong></li>
                        <li>🎁 Premium monthly credits</li>
                        <li>🔮 Early access to new features</li>
                        <li>🗳️ Roadmap voting power</li>
                        <li>🏅 Founding Visionary badge</li>
                        <li>💬 Private Discord access</li>
                    </ul>

                    <p className="killer-benefit">
                        Join once. Stay forever.<br />
                        <span>Monthly credits included. No subscription to manage.</span>
                    </p>

                    <button className="cta-primary" onClick={onOpenModal}>
                        Become Visionary
                    </button>
                    <p className="small-print" style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--gold-dim)' }}>
                        After launch: $299 (Founding offer only)
                    </p>
                </div>

            </div>
        </section>
    );
}

