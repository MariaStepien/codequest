import React, { useState } from 'react';

export default function OptionSelectionPage() {
  const [selectedOption, setSelectedOption] = useState(null);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    console.log(`User selected: ${option}`);
    // You can add logic here to navigate or perform an action based on the selection
    // For example, if using React Router: navigate(`/${option.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">What is your experience with programing?</h1>

      <div className="space-y-6 w-full max-w-sm">
        {['None', 'a little bit', 'I learned some things', 'professional programer'].map((option) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            // Apply conditional styling based on whether this option is selected
            className={`
              w-full py-6 px-4
              text-xl font-semibold text-brown-700
              border-4 rounded-lg
              transition duration-200 ease-in-out
              ${selectedOption === option
                ? 'bg-brown-200 border-brown-700 shadow-md transform scale-105' // Styles for selected
                : 'bg-yellow-200 border-brown-500 hover:bg-yellow-300 hover:border-brown-700' // Styles for unselected/hover
              }
              flex items-center justify-center
            `}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)} {/* Capitalize first letter */}
          </button>
        ))}
      </div>

      {selectedOption && (
        <p className="mt-8 text-lg text-gray-700">
          You have selected: <span className="font-bold text-brown-800">{selectedOption.charAt(0).toUpperCase() + selectedOption.slice(1)}</span>
        </p>
      )}

      <p className="text-center text-sm text-gray-600 mt-2">
            <a href="/test-level" className= "text-pink-600 font-medium hover:underline">
            Go further
            </a>
        </p>
    </div>
  );
}