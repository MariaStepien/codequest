import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';

export default function CodeFix({ instructions, incorrectCode, fixedCode, onTaskComplete }) {
  const [userInput, setUserInput] = useState(incorrectCode || '');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0); 
  
  const [lastSubmittedCode, setLastSubmittedCode] = useState(null);
  const [lineCorrectness, setLineCorrectness] = useState([]);
    
  const compareLines = (userCode, correctCode) => {
    const userLines = userCode.replace(/\r\n/g, '\n').split('\n');
    const fixedLines = correctCode.replace(/\r\n/g, '\n').split('\n');

    const maxLength = Math.max(userLines.length, fixedLines.length);
    const correctness = [];
    let allLinesMatch = true;

    for (let i = 0; i < maxLength; i++) {
        const userLine = i < userLines.length ? userLines[i].trim() : '';
        const fixedLine = i < fixedLines.length ? fixedLines[i].trim() : '';

        const isCorrect = userLine === fixedLine;
        correctness.push(isCorrect);
        if (!isCorrect) {
            allLinesMatch = false;
        }
    }
    return { correctness, allLinesMatch };
  };

  const hasSucceeded = useMemo(() => isSubmitted && lineCorrectness.every(c => c === true), [isSubmitted, lineCorrectness]);
  const hasFailed = isSubmitted && !hasSucceeded;

  const handleSubmit = () => {
    setIsSubmitted(true);
    setAttempts(prev => prev + 1);
    
    setLastSubmittedCode(userInput);
    const { correctness, allLinesMatch } = compareLines(userInput, fixedCode);
    setLineCorrectness(correctness);

    onTaskComplete(allLinesMatch);
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setLineCorrectness([]);
  };

  const renderFeedbackDisplay = () => {
    if (!lastSubmittedCode || hasSucceeded) return null;

    const submittedLines = lastSubmittedCode.replace(/\r\n/g, '\n').split('\n');
    
    return (
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Last Submitted Feedback (Line by Line):</h4>
        <div className="border border-gray-300 rounded-md overflow-hidden bg-white shadow-inner">
          {submittedLines.map((line, index) => {
            const isLineCorrect = lineCorrectness[index];
            const lineNumber = index + 1;
            
            let bgColorClass = 'bg-gray-50';
            if (isSubmitted) {
                if (isLineCorrect) {
                    bgColorClass = 'bg-green-100/70';
                } else {
                    bgColorClass = 'bg-red-100/70';
                }
            }
            
            return (
              <div 
                key={index}
                className={`flex text-sm font-mono transition-colors duration-200 ${bgColorClass}`}
                style={{ lineHeight: '1.4' }}
              >
                <div className="text-right text-gray-500 pr-3 select-none w-8 shrink-0 bg-gray-200/70 py-1" style={{ fontSize: '12px' }}>
                    {lineNumber}
                </div>
                <div className="w-full whitespace-pre font-mono text-black px-2 py-1">
                    {line}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const inputStyle = {
    fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
    fontSize: '14px',
    minHeight: '200px',
    width: '100%',
    padding: '10px',
    border: `2px solid ${hasSucceeded ? '#28a745' : hasFailed ? '#dc3545' : '#ccc'}`,
    borderRadius: '4px',
    outline: 'none',
    resize: 'vertical',
    color: '#000000', 
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-xl font-bold mb-4 text-gray-700">Code Fix Task 🛠️</h3>
      
      {instructions && <p className="mb-4 text-gray-600">{instructions}</p>}
      
      {renderFeedbackDisplay()}

      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-2">Code Editor: Fix the Error Below</h4>
        <textarea
          style={inputStyle}
          value={userInput}
          onChange={(e) => {
            if (!hasSucceeded) {
              setUserInput(e.target.value);
              setIsSubmitted(false);
            }
          }}
          disabled={hasSucceeded}
          placeholder="Enter the corrected code here..."
        />
      </div>

      <div className="space-y-3">
        {hasSucceeded && (
          <p className="text-sm text-green-600 font-bold mt-2 text-center">
            Success! Code compiled and works flawlessly! 🎉 (Attempt {attempts})
          </p>
        )}
        
        {hasFailed ? (
          <button
            onClick={handleTryAgain}
            className="w-full py-2 px-4 font-semibold rounded-md transition duration-150 bg-yellow-500 text-white hover:bg-yellow-600"
          >
            Try Again (Attempt {attempts} Failed)
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={hasSucceeded}
            className={`
              w-full py-2 px-4 font-semibold rounded-md transition duration-150
              ${hasSucceeded
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }
            `}
          >
            {hasSucceeded ? 'Task Completed' : 'Check Code'}
          </button>
        )}
        
        {isSubmitted && !hasSucceeded && (
          <p className="text-sm text-red-600 text-center">
            Error: Compilation failed. Review the lines marked in red above.
          </p>
        )}
      </div>
    </div>
  );
}

CodeFix.propTypes = {
    instructions: PropTypes.string,
    incorrectCode: PropTypes.string.isRequired,
    fixedCode: PropTypes.string.isRequired,
    onTaskComplete: PropTypes.func.isRequired,
};