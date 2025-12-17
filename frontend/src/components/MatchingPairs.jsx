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

const PAIR_COLORS = [
    'bg-blue-100 border-blue-400 text-blue-900',
    'bg-amber-100 border-amber-400 text-amber-900',
    'bg-purple-100 border-purple-400 text-purple-900',
    'bg-pink-100 border-pink-400 text-pink-900',
    'bg-cyan-100 border-cyan-400 text-cyan-900',
    'bg-orange-100 border-orange-400 text-orange-900',
];

export default function MatchingPairs({ items, onTaskComplete }) {
    const [selected, setSelected] = useState({ key: null, side: null });
    const [userPairs, setUserPairs] = useState({});
    const [results, setResults] = useState(null);
    const [shuffledRightItems, setShuffledRightItems] = useState(() => shuffleArray(items));

    const handleSelect = (key, side) => {
        if (results) return;

        if (selected.side && selected.side !== side) {
            const leftKey = side === 'left' ? key : selected.key;
            const rightKey = side === 'right' ? key : selected.key;

            const newPairs = { ...userPairs };
            
            Object.keys(newPairs).forEach(k => {
                if (newPairs[k] === rightKey) delete newPairs[k];
            });

            newPairs[leftKey] = rightKey;
            setUserPairs(newPairs);
            setSelected({ key: null, side: null });
        } else {
            setSelected(selected.key === key && selected.side === side 
                ? { key: null, side: null } 
                : { key, side }
            );
        }
    };

    const handleSubmit = () => {
        let correctCount = 0;
        const evaluation = {};

        items.forEach(item => {
            const isCorrect = userPairs[item.key] === item.key;
            evaluation[item.key] = isCorrect;
            if (isCorrect) correctCount++;
        });

        const allCorrect = correctCount === items.length;
        setResults(evaluation);
        onTaskComplete(allCorrect);
    };

    const handleReset = () => {
        setUserPairs({});
        setResults(null);
        setSelected({ key: null, side: null });
        setShuffledRightItems(shuffleArray(items));
    };

    const isAllPaired = Object.keys(userPairs).length === items.length;

    const getItemStyles = (key, side) => {
        const isSelected = selected.key === key && selected.side === side;
        
        let pairIndex = -1;
        let isPaired = false;

        if (side === 'left') {
            if (userPairs[key]) {
                isPaired = true;
                pairIndex = items.findIndex(item => item.key === key);
            }
        } else {
            const leftKey = Object.keys(userPairs).find(k => userPairs[k] === key);
            if (leftKey) {
                isPaired = true;
                pairIndex = items.findIndex(item => item.key === leftKey);
            }
        }

        if (results) {
            const leftKey = side === 'left' ? key : Object.keys(userPairs).find(k => userPairs[k] === key);
            const isCorrect = results[leftKey];
            return isCorrect 
                ? 'bg-green-200 border-green-600 text-green-900 opacity-90' 
                : 'bg-red-200 border-red-600 text-red-900';
        }

        if (isSelected) return 'bg-indigo-600 border-indigo-900 text-white shadow-lg scale-[1.05] z-10';
        
        if (isPaired && pairIndex !== -1) {
            return PAIR_COLORS[pairIndex % PAIR_COLORS.length];
        }
        
        return 'bg-white text-black border-gray-300 hover:bg-gray-100';
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-3xl mx-auto space-y-8 border border-gray-100">
            <div className="flex justify-between items-center border-b pb-4">
                <h3 className="text-2xl font-extrabold text-gray-800">
                    Dopasuj pary
                </h3>
            </div>

            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                    <h4 className="text-sm uppercase tracking-wider font-bold text-gray-400 mb-4">Kolumna A</h4>
                    {items.map(item => (
                        <div
                            key={item.key}
                            onClick={() => handleSelect(item.key, 'left')}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 font-medium ${getItemStyles(item.key, 'left')}`}
                        >
                            {item.left}
                        </div>
                    ))}
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm uppercase tracking-wider font-bold text-gray-400 mb-4">Kolumna B</h4>
                    {shuffledRightItems.map(item => (
                        <div
                            key={item.key}
                            onClick={() => handleSelect(item.key, 'right')}
                            className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 font-medium ${getItemStyles(item.key, 'right')}`}
                        >
                            {item.right}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-6 border-t space-y-4">
                {results && (
                    <div className={`p-4 rounded-lg text-center font-bold ${Object.values(results).every(v => v) ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {Object.values(results).every(v => v) 
                            ? 'Brawo! Wszystko poprawnie! 🎉' 
                            : `Wynik: ${Object.values(results).filter(v => v).length} / ${items.length} poprawnych.`}
                    </div>
                )}
                
                <div className="flex gap-4">
                    {results ? (
                        <button
                            onClick={handleReset}
                            className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-900 transition shadow-lg"
                        >
                            Spróbuj ponownie
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!isAllPaired}
                            className={`
                                w-full py-4 font-bold rounded-xl transition shadow-lg
                                ${!isAllPaired
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                }
                            `}
                        >
                            {isAllPaired ? 'Sprawdź odpowiedzi' : 'Połącz wszystkie elementy'}
                        </button>
                    )}
                </div>
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