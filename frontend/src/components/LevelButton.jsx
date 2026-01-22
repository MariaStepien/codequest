import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable component for a single level button.
 * @param {object} props
 * @param {number} props.levelNumber The number displayed on the button.
 * @param {boolean} props.isUnlocked If true, the button is clickable.
 */
export default function LevelButton({ levelNumber, isUnlocked = true }) {

    const colorMap = {
        1: 'bg-red-300 border-red-400 hover:bg-red-400',
        4: 'bg-red-300 border-red-400 hover:bg-red-400',
        8: 'bg-red-300 border-red-400 hover:bg-red-400',
        2: 'bg-yellow-300 border-yellow-400 hover:bg-yellow-400',
        5: 'bg-yellow-300 border-yellow-400 hover:bg-yellow-400',
        3: 'bg-green-300 border-green-400 hover:bg-green-400',
        7: 'bg-blue-300 border-blue-400 hover:bg-blue-400',
    };

    const lockedClasses = 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed shadow-inner';
    
    const unlockedColorClass = colorMap[levelNumber] || 'bg-blue-300 border-blue-400 hover:bg-blue-400';
    const unlockedClasses = `${unlockedColorClass} text-white hover:scale-105 active:scale-100`;

    return (
        <button
            disabled={!isUnlocked}
            title={isUnlocked ? `Zacznij lekcję ${levelNumber}` : 'Lekcja zablokowana'}
            className={`
                w-16 h-16 rounded-full 
                flex items-center justify-center
                text-xl font-extrabold 
                shadow-lg border-4 transition-all duration-200
                ${isUnlocked ? unlockedClasses : lockedClasses}
            `}
        >
            {levelNumber}
        </button>
    );
}

LevelButton.propTypes = {
    levelNumber: PropTypes.number.isRequired,
    isUnlocked: PropTypes.bool,
};