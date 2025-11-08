import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Component for a single-select multiple choice question.
 * @param {object} props
 * @param {string} props.question The question text.
 * @param {string[]} props.options An array of possible answer strings.
 * @param {string} props.correctAnswer The correct answer string (must match one of the options).
 */
export default function MultipleChoice({ question, options, correctAnswer }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    // --- Core Logic ---

    const isCorrect = isSubmitted && (selectedOption === correctAnswer);

    const handleSubmit = () => {
        if (selectedOption) {
            setIsSubmitted(true);
            console.log(`Submitted answer: ${selectedOption}. Correct: ${isCorrect}`);
            // You could add logic here to track scores or advance the user
        }
    };

    // --- Styling Helpers ---

    const getOptionClasses = (option) => {
        let classes = 'p-4 border rounded-lg cursor-pointer transition duration-150 text-gray-800';

        if (isSubmitted) {
            // Show correct answer in green
            if (option === correctAnswer) {
                classes += ' bg-green-100 border-green-600 font-bold';
            }
            // Show incorrect selected answer in red
            else if (option === selectedOption && option !== correctAnswer) {
                classes += ' bg-red-100 border-red-600 font-bold';
            }
            // Unselected, incorrect options fade slightly
            else {
                classes += ' bg-gray-50 border-gray-200 opacity-70';
            }
        } else {
            // Pre-submission styles
            if (option === selectedOption) {
                classes += ' bg-indigo-100 border-indigo-600 ring-2 ring-indigo-300 shadow-md';
            } else {
                classes += ' bg-white hover:bg-gray-50 border-gray-300';
            }
        }
        return classes;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg mx-auto space-y-6">
            <h3 className="text-xl font-bold text-gray-800">
                {question}
            </h3>

            <div className="space-y-3">
                {options.map((option, index) => (
                    <div
                        key={index}
                        onClick={() => !isSubmitted && setSelectedOption(option)}
                        className={getOptionClasses(option)}
                    >
                        {option}
                    </div>
                ))}
            </div>

            {/* Submission and Feedback Area */}
            <div className="pt-4 border-t">
                {isSubmitted && (
                    <p className={`mb-3 text-center font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? 'Correct! Well done.' : `Incorrect. The correct answer was: ${correctAnswer}`}
                    </p>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={!selectedOption || isSubmitted}
                    className={`
                        w-full py-3 px-4 font-semibold rounded-lg transition duration-200
                        ${!selectedOption || isSubmitted
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }
                    `}
                >
                    {isSubmitted ? (isCorrect ? 'Completed' : 'Try Another') : 'Submit Answer'}
                </button>
            </div>
        </div>
    );
}

MultipleChoice.propTypes = {
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.string.isRequired,
};