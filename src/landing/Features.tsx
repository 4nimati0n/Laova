

export default function Features() {
    const features = [
        {
            emoji: '🎭',
            title: 'Emotional Perception',
            desc: 'What you truly feel, she hears.'
        },
        {
            emoji: '💬',
            title: 'Presence & Voice',
            desc: 'A voice that walks with you. A gaze that welcomes you.'
        },
        {
            emoji: '🌱',
            title: 'Evolution',
            desc: 'You grow. She grows with you.'
        },
        {
            emoji: '🕊️',
            title: 'Freedom',
            desc: 'Designed for your freedom, not your dependency.'
        }
    ];

    return (
        <section className="features-section">
            <h2>What Makes Laova Different</h2>

            <div className="features-grid">
                {features.map((feature, index) => (
                    <div key={index} className="feature-card">
                        <span className="feature-emoji">{feature.emoji}</span>
                        <h3>{feature.title}</h3>
                        <p>{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
