import React, { useState } from 'react';
import PropTypes from 'prop-types';

export default function FillInTheBlank({ sentence, correctAnswers, onTaskComplete }) {
  const safeSentence = sentence || ""; 
  const textSegments = safeSentence.split('[BLANK]');
  
  const initialInputs = Array(textSegments.length - 1).fill('');
  const [userInputs, setUserInputs] = useState(initialInputs);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0); 
  
  if (textSegments.length - 1 !== correctAnswers.length) {
    if (safeSentence === "") {
        return (
             <div className="text-red-600 p-4 border border-red-300 rounded-md">
                Błąd danych: FillInTheBlank nie otrzymał żadnego zdania.
             </div>
        );
    }
    return (
      <div className="text-red-600 p-4 border border-red-300 rounded-md">
        Błąd konfiguracji: Należy podać {textSegments.length - 1} poprawnych odpowiedzi, ale podano {correctAnswers.length}.
      </div>
    );
  }

  const allFilled = userInputs.every(input => input.trim() !== '');
  const allCorrect = userInputs.every((input, index) => {
    return input.trim().toLowerCase() === correctAnswers[index].toLowerCase();
  });
  const hasSucceeded = isSubmitted && allCorrect;
  const hasFailed = isSubmitted && !allCorrect;

  const handleInputChange = (index, value) => {
    if (hasSucceeded) return; 

    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);

    if (isSubmitted) {
        setIsSubmitted(false);
    }
  };

  const handleSubmit = () => {
    if (!allFilled) return;
    
    setIsSubmitted(true);
    setAttempts(prev => prev + 1);

    if (allCorrect) {
        onTaskComplete(true);
    }
  };

  const handleTryAgain = () => {
    setUserInputs(initialInputs);
    setIsSubmitted(false);
  };

  const getInputStyles = (index) => {
    if (!isSubmitted) {
      return 'border-gray-300 focus:border-indigo-500';
    }
    
    const isThisCorrect = userInputs[index].trim().toLowerCase() === correctAnswers[index].toLowerCase();
    
    if (isThisCorrect && hasSucceeded) {
      return 'border-green-500 bg-green-50 text-green-700 cursor-default';
    } else if (!isThisCorrect && hasFailed) {
      return 'border-red-500 bg-red-50 text-red-700';
    } else if (isThisCorrect && hasFailed) {
      return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    } 
    else {
      return 'border-green-500 bg-green-50 text-green-700 cursor-default';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-700">Uzupełnij puste pola</h3>
      <p className="mb-4 text-gray-600">Dokończ zdanie wstawiając odpowiednie słowa do tekstu.</p>
      
      <div className="text-xl text-black mb-8 flex flex-wrap items-center leading-relaxed">
        {textSegments.map((segment, index) => (
          <React.Fragment key={index}>
            <span className="p-1 mx-1">{segment}</span> 
            {index < correctAnswers.length && (
              <input
                type="text"
                value={userInputs[index]}
                onChange={(e) => handleInputChange(index, e.target.value)}
                disabled={hasSucceeded}
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

      <div className="space-y-3">
        {hasSucceeded && (
          <p className="text-sm text-green-600 font-bold mt-2 text-center">
            Poprawnie rozwiązano zadanie! 🎉 (Próba {attempts})
          </p>
        )}
        
        {hasFailed ? (
          <button
            onClick={handleTryAgain}
            className="w-full py-2 px-4 font-semibold rounded-md transition duration-150 bg-yellow-500 text-white hover:bg-yellow-600"
          >Spróbuj ponownie (Nieudana próba {attempts})
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!allFilled || hasSucceeded}
            className={`
              w-full py-2 px-4 font-semibold rounded-md transition duration-150
              ${!allFilled || hasSucceeded
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }
            `}
          >
            {hasSucceeded ? 'Zadanie wykonane' : 'Sprawdź'}
          </button>
        )}
        
        {isSubmitted && !allCorrect && (
          <p className="text-sm text-red-600 text-center">
            Glify wibrują... Sprawdź swoje odpowiedzi. Niektóre odpowiedzi są nieprawidłowo umieszczone.
          </p>
        )}
      </div>
    </div>
  );
}

FillInTheBlank.propTypes = {
    sentence: PropTypes.string.isRequired,
    correctAnswers: PropTypes.arrayOf(PropTypes.string).isRequired,
    onTaskComplete: PropTypes.func.isRequired,
};