import { useAppStore } from '../store/useAppStore';
import { getEstimatedTimeRemaining, formatTimeRemaining } from '../utils/costTracker';
import './Energy.css';

export const EnergyDisplay = () => {
    const { energy, maxEnergy, energyStatus, setIsEnergyModalOpen } = useAppStore();

    const timeRemaining = getEstimatedTimeRemaining(energy);

    // Dynamic styles based on energy status
    const getStatusClass = () => {
        switch (energyStatus) {
            case 'full': return 'energy-full';
            case 'good': return 'energy-good';
            case 'hungry': return 'energy-hungry';
            case 'very_hungry': return 'energy-very-hungry';
            case 'exhausted': return 'energy-exhausted';
            case 'empty': return 'energy-empty';
            default: return 'energy-good';
        }
    };

    return (
        <button
            className={`energy-display ${getStatusClass()}`}
            onClick={() => setIsEnergyModalOpen(true)}
            title={`Énergie de Laura: ${energy}/${maxEnergy} (${formatTimeRemaining(timeRemaining)} restant)`}
        >
            <span className="energy-icon">⚡</span>
            <span className="energy-value">{energy.toLocaleString()}</span>
            {energyStatus === 'hungry' || energyStatus === 'very_hungry' || energyStatus === 'exhausted' ? (
                <span className="energy-warning">!</span>
            ) : null}
        </button>
    );
};
