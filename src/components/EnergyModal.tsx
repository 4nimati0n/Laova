import { createPortal } from 'react-dom';
import { useAppStore } from '../store/useAppStore';
import {
    getEstimatedTimeRemaining,
    formatTimeRemaining,
    FOOD_ITEMS,
    SUBSCRIPTION_PLANS,
    type FoodItem
} from '../utils/costTracker';
import { X } from 'lucide-react';
import './Energy.css';

export const EnergyModal = () => {
    const {
        energy,
        maxEnergy,
        energyStatus,
        isEnergyModalOpen,
        setIsEnergyModalOpen,
        addEnergy
    } = useAppStore();

    if (!isEnergyModalOpen) return null;

    const percentage = Math.round((energy / maxEnergy) * 100);
    const timeRemaining = getEstimatedTimeRemaining(energy);

    const handlePurchase = (item: FoodItem) => {
        // For now, just add the energy (mock purchase)
        // TODO: Integrate with Stripe/payment system
        addEnergy(item.energy, `Achat: ${item.name}`);
    };

    const getStatusEmoji = () => {
        switch (energyStatus) {
            case 'full': return '😊';
            case 'good': return '🙂';
            case 'hungry': return '😋';
            case 'very_hungry': return '😣';
            case 'exhausted': return '😫';
            case 'empty': return '😵';
            default: return '🙂';
        }
    };

    const getStatusMessage = () => {
        switch (energyStatus) {
            case 'full': return "Laura est pleine d'énergie !";
            case 'good': return "Laura va bien.";
            case 'hungry': return "Laura commence à avoir faim...";
            case 'very_hungry': return "Laura a vraiment faim ! 🥺";
            case 'exhausted': return "Laura est épuisée...";
            case 'empty': return "Laura n'a plus d'énergie !";
            default: return "";
        }
    };

    return createPortal(
        <div className="energy-modal-overlay" onClick={() => setIsEnergyModalOpen(false)}>
            <div className="energy-modal" onClick={(e) => e.stopPropagation()}>
                <button
                    className="energy-modal-close"
                    onClick={() => setIsEnergyModalOpen(false)}
                    aria-label="Fermer"
                >
                    <X size={24} />
                </button>

                <div className="energy-modal-header">
                    <h2>⚡ Énergie de Laura</h2>
                    <span className="energy-status-emoji">{getStatusEmoji()}</span>
                </div>

                <div className="energy-progress-container">
                    <div className="energy-progress-bar">
                        <div
                            className="energy-progress-fill"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="energy-progress-info">
                        <span className="energy-current">{energy.toLocaleString()} / {maxEnergy.toLocaleString()}</span>
                        <span className="energy-percentage">{percentage}%</span>
                    </div>
                </div>

                <p className="energy-status-message">{getStatusMessage()}</p>

                <div className="energy-time-remaining">
                    <span className="time-icon">⏱️</span>
                    <span>{formatTimeRemaining(timeRemaining)} de conversation restant</span>
                </div>

                <div className="energy-divider" />

                <h3 className="energy-section-title">🛒 Recharger l'énergie</h3>

                <div className="food-store-grid">
                    {FOOD_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            className="food-item"
                            onClick={() => handlePurchase(item)}
                            title={item.description}
                        >
                            <span className="food-emoji">{item.emoji}</span>
                            <span className="food-name">{item.name}</span>
                            <span className="food-energy">+{item.energy.toLocaleString()} ⚡</span>
                            <span className="food-price">${item.price.toFixed(2)}</span>
                        </button>
                    ))}
                </div>

                <div className="energy-divider" />

                <h3 className="energy-section-title">📅 Abonnements</h3>

                <div className="subscription-grid">
                    {SUBSCRIPTION_PLANS.map((plan) => (
                        <button
                            key={plan.id}
                            className="subscription-item"
                            onClick={() => {
                                // TODO: Integrate with subscription system
                                alert(`Abonnement ${plan.name} bientôt disponible !`);
                            }}
                        >
                            <span className="subscription-name">{plan.name}</span>
                            <span className="subscription-energy">
                                {plan.energyPerMonth === 'unlimited'
                                    ? '∞ énergie'
                                    : `${plan.energyPerMonth.toLocaleString()} ⚡/mois`}
                            </span>
                            <span className="subscription-price">${plan.pricePerMonth}/mois</span>
                            <span className="subscription-desc">{plan.description}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>,
        document.body
    );
};
