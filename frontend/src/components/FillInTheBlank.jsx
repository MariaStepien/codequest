import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function FillInTheBlank({ sentence, correctAnswers, onTaskComplete }) {
  const safeSentence = sentence || ""; 
  const textSegments = safeSentence.split('[BLANK]');
  
  const [userInputs, setUserInputs] = useState(
    Array(textSegments.length - 1).fill('')
  );
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  if (textSegments.length - 1 !== correctAnswers.length) {
    if (safeSentence === "") {
        return (
             <div className="text-red-600 p-4 border border-red-300 rounded-md">
                Data Error: FillInTheBlank received no sentence.
             </div>
        );
    }
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded-md">
        Configuration Error: Must provide {textSegments.length - 1} correct answers, but {correctAnswers.length} were given.
      </div>
    );
  }

  const handleInputChange = (index, value) => {
    if (isSubmitted) return; 
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  const allCorrect = userInputs.every((input, index) => {
    return input.trim().toLowerCase() === correctAnswers[index].toLowerCase();
  });
  
  const handleSubmit = () => {
    setIsSubmitted(true);
    onTaskComplete(allCorrect);
  };

  const buttonDisabled = isSubmitted && allCorrect;
  
  const getInputStyles = (index) => {
    if (!isSubmitted) {
      return 'border-gray-300 focus:border-indigo-500';
    }
    
    const isThisCorrect = userInputs[index].trim().toLowerCase() === correctAnswers[index].toLowerCase();
    
    if (isThisCorrect) {
      return 'border-green-500 bg-green-50 text-green-700 cursor-default';
    } else {
      return 'border-red-500 bg-red-50 text-red-700';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-700">Fill In The Blank</h3>
      <p className="mb-4 text-gray-600">Complete the ritual sentence by filling in the missing runes.</p>
      
      <div className="text-xl text-black mb-8 flex flex-wrap items-center leading-relaxed">
        {textSegments.map((segment, index) => (
          <React.Fragment key={index}>
            <span className="p-1 mx-1">{segment}</span> 
            {index < correctAnswers.length && (
              <input
                type="text"
                value={userInputs[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                disabled={isSubmitted && allCorrect}
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
        {isSubmitted && allCorrect ? 'Correct Runes Sealed! 🎉' : 'Check Runes'}
      </button>

      {isSubmitted && !allCorrect && (
        <p className="text-sm text-red-600 mt-2 text-center">
          The glyphs are vibrating... Review your answers. Some runes are placed incorrectly.
        </p>
      )}
    </div>
  );
}

FillInTheBlank.propTypes = {
    sentence: PropTypes.string.isRequired,
    correctAnswers: PropTypes.arrayOf(PropTypes.string).isRequired,
    onTaskComplete: PropTypes.func.isRequired,
};