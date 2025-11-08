import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Component for a fill-in-the-blank exercise supporting multiple blanks.
 * @param {object} props
 * @param {string} props.sentence The sentence string containing one or more [BLANK] placeholders.
 * @param {string[]} props.correctAnswers An array of expected correct answers, in order.
 */
export default function FillInTheBlank({ sentence, correctAnswers }) {
  // Split the sentence by the placeholder to get text segments
  const textSegments = sentence.split('[BLANK]');
  
  // Initialize state for user inputs. Needs one input for each blank.
  const [userInputs, setUserInputs] = useState(
    Array(textSegments.length - 1).fill('')
  );
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Error handling: Ensure the number of answers matches the number of blanks
  if (textSegments.length - 1 !== correctAnswers.length) {
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded-md">
        Configuration Error: Must provide {textSegments.length - 1} correct answers, but {correctAnswers.length} were given.
      </div>
    );
  }

  // --- Logic Functions ---

  const handleInputChange = (index, value) => {
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
    setIsSubmitted(false); // Reset submission status if user is typing
  };
  
  const checkAnswer = (input, correct) => {
    return input.trim().toLowerCase() === correct.trim().toLowerCase();
  };

  const allCorrect = userInputs.every((input, index) => 
    checkAnswer(input, correctAnswers[index])
  );
  
  const handleSubmit = () => {
    setIsSubmitted(true);
    console.log(`Submission complete. All Correct: ${allCorrect}`);
  };

  // --- Rendering Functions ---

  const getInputStyles = (index) => {
    if (!isSubmitted) {
      return 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500';
    }
    const isThisCorrect = checkAnswer(userInputs[index], correctAnswers[index]);
    return isThisCorrect
      ? 'border-green-500 bg-green-50 focus:ring-green-500' 
      : 'border-red-500 bg-red-50 focus:ring-red-500';
  };

  const isAnyInputEmpty = userInputs.some(input => !input.trim());
  const buttonDisabled = isSubmitted || isAnyInputEmpty;

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl mx-auto space-y-4">
      <h3 className="text-xl font-semibold text-gray-700">Fill in the Missing Words</h3>
      
      <div className="flex flex-wrap items-center text-lg text-gray-800 leading-relaxed">
        {textSegments.map((segment, index) => (
          <React.Fragment key={index}>
            {/* Display the text segment */}
            <span>{segment}</span>
            
            {/* If there's another segment, we need an input field here */}
            {index < textSegments.length - 1 && (
              <input
                type="text"
                value={userInputs[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                disabled={isSubmitted && allCorrect} // Disable only if submitted AND all correct
                placeholder={`Answer ${index + 1}`}
                className={`
                  mx-2 p-2 
                  text-lg text-center font-bold 
                  border-b-2 rounded-md 
                  shadow-inner 
                  outline-none transition duration-150 
                  w-32 
                  ${getInputStyles(index)}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={buttonDisabled}
        className={`
          w-full py-2 px-4 font-semibold rounded-md transition duration-150
          ${buttonDisabled
            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }
        `}
      >
        {isSubmitted ? (allCorrect ? 'All Correct!' : 'Check Answers') : 'Check Answers'}
      </button>

      {/* Optional: Show feedback after submission */}
      {isSubmitted && !allCorrect && (
        <p className="text-sm text-red-600 mt-2">
          Review your answers. Some inputs are incorrect.
        </p>
      )}
    </div>
  );
}

FillInTheBlank.propTypes = {
  sentence: PropTypes.string.isRequired,
  correctAnswers: PropTypes.arrayOf(PropTypes.string).isRequired,
};