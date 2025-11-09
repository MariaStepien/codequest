import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable component for a single level button.
 * @param {object} props
 * @param {number} props.levelNumber The number displayed on the button.
 * @param {boolean} props.isUnlocked If true, the button is clickable.
 */
export default function LevelButton({ levelNumber, isUnlocked = true }) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (isUnlocked) {
            // Navigate to the dynamic route for this level, e.g., /level/1, /level/2
            navigate(`/level/${levelNumber}`); 
            console.log(`Navigating to Level ${levelNumber}`);
        }
    };

    const lockedClasses = 'bg-gray-300 border-gray-500 text-gray-600 cursor-not-allowed';
    const unlockedClasses = 'bg-indigo-500 border-indigo-700 text-white hover:bg-indigo-600 hover:scale-105';

    return (
        <button
            onClick={handleClick}
            disabled={!isUnlocked}
            title={isUnlocked ? `Start Level ${levelNumber}` : 'Level Locked'}
            className={`
                w-16 h-16 rounded-lg 
                flex items-center justify-center
                text-xl font-extrabold 
                shadow-lg border-4 transition-all duration-300
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