import React, { useState } from 'react';
import PropTypes from 'prop-types';

const shuffleArray = (array) => {
    if (!Array.isArray(array)) {
        return [];
    }
    const shuffled = [...array]; 
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export default function MatchingPairs({ items, onTaskComplete }) {
    const [leftSelectionKey, setLeftSelectionKey] = useState(null); 
    const [rightSelectionKey, setRightSelectionKey] = useState(null); 
    const [matchedPairsKeys, setMatchedPairsKeys] = useState([]); 
    const [feedback, setFeedback] = useState(null);
    
    const [shuffledRightItems] = useState(() => shuffleArray(items)); 

    const handleSelect = (key, type) => {
        if (matchedPairsKeys.includes(key)) return;

        if (type === 'left') {
            setLeftSelectionKey(leftSelectionKey === key ? null : key); 
        } else {
            setRightSelectionKey(rightSelectionKey === key ? null : key); 
        }
        setFeedback(null);
    };

    const handleSubmit = () => {
        if (!leftSelectionKey || !rightSelectionKey) {
            setFeedback({ type: 'error', message: 'Please select one item from each column.' });
            return;
        }

        if (leftSelectionKey === rightSelectionKey) { 
            const newMatchedKeys = [...matchedPairsKeys, leftSelectionKey];
            setMatchedPairsKeys(newMatchedKeys);
            setFeedback({ type: 'success', message: 'Correct match! Pair completed.' });
            
            if (newMatchedKeys.length === items.length) {
                onTaskComplete(true);
            }
        } else {
            setFeedback({ type: 'error', message: 'Incorrect pairing. Try again!' });
        }
        setLeftSelectionKey(null);
        setRightSelectionKey(null);
    };

    const isFinished = matchedPairsKeys.length === items.length;

    const getItemStyles = (key, type) => {
        const isMatched = matchedPairsKeys.includes(key);
        const isSelected = (type === 'left' && leftSelectionKey === key) || (type === 'right' && rightSelectionKey === key);

        if (isMatched) return 'bg-green-100 border-green-500 text-green-800 pointer-events-none opacity-80';
        
        if (isSelected) {
            return 'bg-indigo-200 border-4 border-indigo-700 text-indigo-900 shadow-xl transform scale-[1.02]';
        }
        
        return 'bg-white text-black border-gray-300 hover:bg-gray-100';
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl shadow-2xl w-full max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 border-b pb-3">
                Match the Ancient Runes
            </h3>

            <div className="flex justify-between space-x-6">
                <div className="w-1/2 space-y-3">
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">Glyphs</h4>
                    {items.map(item => (
                        <div
                            key={item.key} 
                            onClick={() => handleSelect(item.key, 'left')}
                            className={`
                                p-4 border-2 rounded-lg cursor-pointer transition duration-150
                                ${getItemStyles(item.key, 'left')} 
                            `}
                        >
                            {item.left}
                        </div>
                    ))}
                </div>

                <div className="w-1/2 space-y-3">
                    <h4 className="text-lg text-black font-semibold text-gray-700 mb-2">Meanings</h4>
                    {shuffledRightItems.map(item => (
                        <div
                            key={item.key} 
                            onClick={() => handleSelect(item.key, 'right')}
                            className={`
                                p-4 border-2 rounded-lg cursor-pointer transition duration-150
                                ${getItemStyles(item.key, 'right')} 
                            `}
                        >
                            {item.right}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t">
                {feedback && (
                    <p className={`mb-3 text-center font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback.message}
                    </p>
                )}
                
                <button
                    onClick={handleSubmit}
                    disabled={isFinished || !leftSelectionKey || !rightSelectionKey}
                    className={`
                        w-full py-3 px-4 font-semibold rounded-lg transition duration-200
                        ${isFinished
                            ? 'bg-green-500 text-white cursor-default'
                            : (!leftSelectionKey || !rightSelectionKey
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            )
                        }
                    `}
                >
                    {isFinished ? 'Sealed All Bonds! 🎉' : 'Forge Pairing'}
                </button>
            </div>
        </div>
    );
}

MatchingPairs.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            key: PropTypes.string.isRequired,
            left: PropTypes.string.isRequired,
            right: PropTypes.string.isRequired,
        })
    ).isRequired,
    onTaskComplete: PropTypes.func.isRequired,
};