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

    // Pastel Color Palette based on level number
    const colorMap = {
        // Red Pastel
        1: 'bg-red-300 border-red-400 hover:bg-red-400',
        4: 'bg-red-300 border-red-400 hover:bg-red-400',
        8: 'bg-red-300 border-red-400 hover:bg-red-400',
        // Yellow/Orange Pastel
        2: 'bg-yellow-300 border-yellow-400 hover:bg-yellow-400',
        5: 'bg-yellow-300 border-yellow-400 hover:bg-yellow-400',
        // Green Pastel
        3: 'bg-green-300 border-green-400 hover:bg-green-400',
        // Blue Pastel
        7: 'bg-blue-300 border-blue-400 hover:bg-blue-400',
    };

    const lockedClasses = 'bg-gray-200 border-gray-300 text-gray-500 cursor-not-allowed shadow-inner';
    
    // Choose the color based on the level number, defaulting to a pastel blue
    const unlockedColorClass = colorMap[levelNumber] || 'bg-blue-300 border-blue-400 hover:bg-blue-400';
    const unlockedClasses = `${unlockedColorClass} text-white hover:scale-105 active:scale-100`;

    return (
        <button
            onClick={handleClick}
            disabled={!isUnlocked}
            title={isUnlocked ? `Start Level ${levelNumber}` : 'Level Locked'}
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