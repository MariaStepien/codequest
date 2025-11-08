import React, { useState, useEffect } from 'react';

// Example initial data structure (you will pass this as a prop)
const initialSentences = [
    { id: 's1', text: "First, you need to open the application." },
    { id: 's2', text: "Next, locate the settings menu." },
    { id: 's3', text: "Finally, save your changes and exit." },
];

/**
 * A component allowing users to reorder a list of items using up/down buttons.
 */
export default function OrderableList({ initialItems = initialSentences, onOrderChange }) {
    const [items, setItems] = useState(initialItems);

    // If the initial items prop changes, reset the state
    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    // Function to move an item up in the list
    const moveItem = (index, direction) => {
        // Only proceed if there's a valid move (not already at the top/bottom)
        if ((direction === 'up' && index > 0) || (direction === 'down' && index < items.length - 1)) {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            
            // 1. Create a copy of the list
            const newItems = [...items];
            
            // 2. Swap the item with the one in the new position
            [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];

            // 3. Update the state
            setItems(newItems);

            // Optional: Call a function to notify the parent component of the new order
            if (onOrderChange) {
                onOrderChange(newItems);
            }
        }
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
                        className="flex items-center bg-gray-50 border border-gray-200 rounded-md p-3"
                    >
                        {/* Current Position Marker */}
                        <span className="text-lg font-bold text-indigo-600 mr-4 w-6 text-center">
                            {index + 1}.
                        </span>

                        {/* Item Content */}
                        <p className="flex-grow text-gray-700">{item.text}</p>

                        {/* Ordering Buttons */}
                        <div className="flex flex-col ml-4 space-y-1">
                            <button
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0} // Disable 'Up' if it's the first item
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
                                disabled={index === items.length - 1} // Disable 'Down' if it's the last item
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
            
            {/* Optional Submit Button */}
            <div className="pt-4 border-t mt-4">
                <button
                    className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-150"
                    onClick={() => console.log('Final Order Submitted:', items)}
                >
                    Submit Order
                </button>
            </div>
        </div>
    );
}