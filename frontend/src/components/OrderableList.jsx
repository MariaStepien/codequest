import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Helper function to shuffle an array (Fisher-Yates)
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

/**
 * A component allowing users to reorder a list of items using up/down buttons.
 * @param {Array<object>} props.initialItems The items to be ordered by the user.
 * @param {Array<object>} props.correctOrder The array of items in the correct order (must have same IDs as initialItems).
 * @param {function} props.onTaskComplete Callback to signal LevelTemplate (true for correct order, false otherwise).
 */
export default function OrderableList({ initialItems, correctOrder, onTaskComplete }) {
    const [items, setItems] = useState(() => shuffleArray(initialItems));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        setItems(shuffleArray(initialItems));
        setIsSubmitted(false);
        setIsCorrect(false);
    }, [initialItems, correctOrder]);

    const moveItem = (index, direction) => {
        if (isSubmitted && isCorrect) return;

        if ((direction === 'up' && index > 0) || (direction === 'down' && index < items.length - 1)) {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            const newItems = [...items];
            
            [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

            setItems(newItems);
            setIsSubmitted(false); 
        }
    };

    const handleSubmit = () => {
        const isOrderCorrect = items.every((item, index) => item.id === correctOrder[index].id);
        
        setIsSubmitted(true);
        setIsCorrect(isOrderCorrect);
        
        onTaskComplete(isOrderCorrect);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl space-y-3 w-full max-w-xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">
                Arrange the Steps
            </h3>
            
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div 
                        key={item.id} 
                        className={`flex items-center border rounded-md p-3 transition duration-150
                            ${isSubmitted && isCorrect ? 'bg-green-100 border-green-500' : 'bg-gray-50 border-gray-200'}
                        `}
                    >
                        {/* Current Position Marker */}
                        <span className={`text-lg font-bold mr-4 w-6 text-center ${isSubmitted && isCorrect ? 'text-green-700' : 'text-indigo-600'}`}>
                            {index + 1}.
                        </span>

                        {/* Item Content */}
                        <p className="flex-grow text-gray-700">{item.text}</p>

                        {/* Ordering Buttons */}
                        <div className="flex flex-col ml-4 space-y-1">
                            <button
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0 || (isSubmitted && isCorrect)}
                                className={`
                                    p-1 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 
                                    disabled:bg-gray-300 disabled:cursor-not-allowed
                                `}
                                title="Move Up"
                            >
                                ▲
                            </button>
                            <button
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === items.length - 1 || (isSubmitted && isCorrect)}
                                className={`
                                    p-1 rounded-full text-white bg-indigo-500 hover:bg-indigo-600 
                                    disabled:bg-gray-300 disabled:cursor-not-allowed
                                `}
                                title="Move Down"
                            >
                                ▼
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Submit Button */}
            <div className="pt-4 border-t mt-4">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitted && isCorrect}
                    className={`w-full py-2 px-4 font-semibold rounded-md transition duration-150
                        ${isSubmitted && isCorrect
                            ? 'bg-green-600 text-white cursor-default'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }
                    `}
                >
                    {isSubmitted && isCorrect ? 'Order Sealed!' : 'Submit Sequence'}
                </button>
            </div>
            {isSubmitted && !isCorrect && (
                <p className="text-center text-red-600 font-medium">
                    The incantation sequence is out of order. Try again!
                </p>
            )}
        </div>
    );
}

OrderableList.propTypes = {
    initialItems: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
    })).isRequired,
    correctOrder: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
    })).isRequired,
    onTaskComplete: PropTypes.func.isRequired,
};