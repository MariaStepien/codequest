import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function CodeFix({ 
    instructions, 
    incorrectCode, 
    correctGapText, 
    fixLineStart, 
    fixCharStart, 
    fixCharEnd, 
    onTaskComplete 
}) {
    const codeLines = incorrectCode.replace(/\r\n/g, '\n').split('\n');
    
    const initialGapText = useMemo(() => {
        if (fixLineStart != null && codeLines[fixLineStart]) {
            return codeLines[fixLineStart].substring(fixCharStart, fixCharEnd);
        }
        return '';
    }, [codeLines, fixLineStart, fixCharStart, fixCharEnd]);

    const [userInput, setUserInput] = useState(initialGapText);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [attempts, setAttempts] = useState(0); 

    const expectedText = correctGapText || '';
    
    const isCorrect = userInput.trim().toLowerCase() === expectedText.trim().toLowerCase();
    
    const hasSucceeded = isSubmitted && isCorrect;
    const hasFailed = isSubmitted && !isCorrect;

    const disableInteraction = hasSucceeded || hasFailed; 

    const handleSubmit = () => {
        if (hasSucceeded || !userInput.trim()) return;
        
        setIsSubmitted(true);
        setAttempts(prev => prev + 1);

        if (isCorrect) {
            onTaskComplete(true);
        } else {
            onTaskComplete(false);
        }
    };

    const handleTryAgain = () => {
        setUserInput(initialGapText);
        setIsSubmitted(false);
    };

    const handleInputChange = (e) => {
        if (disableInteraction) return; 
        setUserInput(e.target.value);
    };

    const renderCodeWithGap = useMemo(() => {
        return codeLines.map((line, lineIndex) => {
            if (lineIndex !== fixLineStart) {
                return <span key={lineIndex} className="block whitespace-pre-wrap">{line}</span>;
            }

            const preGap = line.substring(0, fixCharStart);
            const postGap = line.substring(fixCharEnd);
            
            let inputClasses = 'font-mono text-base bg-gray-200 text-black border-b-2 outline-none p-0 mx-0.5 align-baseline transition duration-150';
            
            if (isSubmitted) {
                inputClasses += isCorrect 
                    ? ' border-green-500 bg-green-100 text-green-800' 
                    : ' border-red-500 bg-red-100 text-red-800';
            } else {
                inputClasses += ' border-indigo-500 focus:border-indigo-700 focus:bg-white';
            }
            
            const inputWidth = Math.max(1, expectedText.length) * 11;

            return (
                <span key={lineIndex} className="block whitespace-pre-wrap">
                    {preGap}
                    <input
                        type="text"
                        value={userInput}
                        onChange={handleInputChange}
                        disabled={disableInteraction}
                        style={{ width: `${inputWidth}px` }}
                        className={inputClasses}
                        autoFocus={!disableInteraction}
                    />
                    {postGap}
                </span>
            );
        });
    }, [codeLines, fixLineStart, fixCharStart, fixCharEnd, userInput, isSubmitted, isCorrect, disableInteraction, handleInputChange, expectedText.length]);

    if (fixLineStart == null || fixCharStart == null || fixCharEnd == null || fixLineStart >= codeLines.length || fixCharStart > fixCharEnd) {
         return <div className="text-red-600 p-4 border border-red-300 rounded-md">Błąd konfiguracji zadania: Nieprawidłowe parametry luki (Line/Char indices).</div>;
    }
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 w-full max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Naprawa Kodu (Uzupełnianie Luki)</h3>
            <p className="mb-4 text-gray-600 font-medium">{instructions}</p>
            
            <div className="bg-gray-800 text-gray-200 p-4 rounded-lg font-mono text-base overflow-x-auto mb-6 shadow-xl">
                {renderCodeWithGap}
            </div>

            <div className="space-y-3 pt-4 border-t">
                {hasSucceeded && (
                    <p className="text-sm text-green-600 font-bold mt-2 text-center">
                        Poprawnie naprawiono błąd! (Próba {attempts})
                    </p>
                )}
                
                {hasFailed ? (
                    <button
                        onClick={handleTryAgain}
                        className="w-full py-2 px-4 font-semibold rounded-md transition duration-150 bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                        Spróbuj ponownie (Nieudana próba {attempts})
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={!userInput.trim() || hasSucceeded}
                        className={`
                            w-full py-2 px-4 font-semibold rounded-md transition duration-150
                            ${!userInput.trim() || hasSucceeded
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            }
                        `}
                    >
                        {hasSucceeded ? 'Zadanie wykonane' : 'Sprawdź Lukę'}
                    </button>
                )}
                
                {isSubmitted && !isCorrect && (
                    <p className="text-sm text-red-600 text-center">
                        Wprowadzona wartość jest nieprawidłowa. Spróbuj jeszcze raz.
                    </p>
                )}
            </div>
        </div>
    );
}

CodeFix.propTypes = {
    instructions: PropTypes.string.isRequired,
    incorrectCode: PropTypes.string.isRequired,
    correctGapText: PropTypes.string.isRequired,
    fixLineStart: PropTypes.number.isRequired,
    fixCharStart: PropTypes.number.isRequired,
    fixCharEnd: PropTypes.number.isRequired,
    onTaskComplete: PropTypes.func.isRequired,
};