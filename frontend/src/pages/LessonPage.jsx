import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

// --- TASK COMPONENTS (Reconstructed from provided snippets) ---

/**
 * A component to display a single sentence or piece of explanatory text
 * NOTE: This component automatically signals completion to the parent.
 * @param {object} props
 * @param {string} props.sentence The text content to display.
 * @param {string} [props.bgColor='bg-indigo-100'] Tailwind class for background color.
 * @param {string} [props.borderColor='border-indigo-400'] Tailwind class for border color.
 * @param {function} props.onTaskComplete Callback to signal completion.
 */
function TextBox({ 
  sentence, 
  bgColor = 'bg-indigo-100', 
  borderColor = 'border-indigo-400',
  onTaskComplete // Add onTaskComplete prop
}) {
  
  // Use useEffect to signal completion immediately upon mounting
  useEffect(() => {
    // Signal to the LevelTemplate that this non-interactive task is complete
    onTaskComplete(true); 
  }, [onTaskComplete]); // Dependency array ensures it runs once when the component is created

  return (
    <div 
      className={`
        p-6 
        border-l-8 
        ${borderColor} 
        ${bgColor} 
        rounded-r-lg 
        shadow-md 
        transition duration-300 
        hover:shadow-lg
      `}
    >
      <p className="text-lg text-gray-800 font-medium leading-relaxed">
        {sentence}
      </p>
    </div>
  );
}

TextBox.propTypes = {
    sentence: PropTypes.string.isRequired,
    bgColor: PropTypes.string,
    borderColor: PropTypes.string,
    onTaskComplete: PropTypes.func.isRequired,
};


/**
 * Component for a matching pairs exercise.
 * @param {object} props
 * @param {Array<object>} props.items Array of objects: { key, left, right }
 * @param {function} props.onTaskComplete Callback to signal LevelTemplate (true only when all pairs matched).
 */
function MatchingPairs({ items, onTaskComplete }) {
    // State stores the 'key' of the currently selected item in each column.
    const [leftSelectionKey, setLeftSelectionKey] = useState(null); 
    const [rightSelectionKey, setRightSelectionKey] = useState(null); 
    const [matchedPairsKeys, setMatchedPairsKeys] = useState([]); 
    const [feedback, setFeedback] = useState(null);
    const [isFinished, setIsFinished] = useState(false);

    // --- Core Logic ---

    const handleSelect = (key, type) => {
        if (matchedPairsKeys.includes(key)) return; // Do nothing if already matched

        if (type === 'left') {
            setLeftSelectionKey(leftSelectionKey === key ? null : key); 
        } else {
            setRightSelectionKey(rightSelectionKey === key ? null : key); 
        }
        setFeedback(null);
    };

    const handleSubmit = () => {
        if (!leftSelectionKey || !rightSelectionKey) {
            setFeedback({ type: 'error', message: 'Please select one item from each column.' });
            return;
        }

        const leftItem = items.find(i => i.key === leftSelectionKey);
        const rightItem = items.find(i => i.key === rightSelectionKey);
        
        // This logic assumes the right column items have keys that match the correct left item's key.
        // A better check is matching by the core 'key' property.
        if (leftSelectionKey === rightSelectionKey) {
            // Found a match!
            const newMatchedKeys = [...matchedPairsKeys, leftSelectionKey];
            setMatchedPairsKeys(newMatchedKeys);
            setFeedback({ type: 'success', message: 'Pair forged! Excellent work.' });

            // Clear selections
            setLeftSelectionKey(null);
            setRightSelectionKey(null);
            
            // Check for final completion
            if (newMatchedKeys.length === items.length) {
                setIsFinished(true);
                onTaskComplete(true);
            }
        } else {
            setFeedback({ type: 'error', message: 'That pairing did not resonate. Try again.' });
            setLeftSelectionKey(null);
            setRightSelectionKey(null);
        }
    };

    // Shuffle right items once on load for mixing
    const [shuffledRightItems] = useState(() => {
        return [...items].sort(() => Math.random() - 0.5);
    });
    
    // --- Styling Helpers ---
    const getItemClasses = (key, currentSelectionKey) => {
        let classes = 'p-3 border rounded-lg transition duration-150 cursor-pointer mb-2 text-gray-800 font-medium';
        
        if (matchedPairsKeys.includes(key)) {
            return classes + ' bg-green-100 border-green-600 text-green-800 opacity-70 cursor-default';
        }

        if (key === currentSelectionKey) {
            classes += ' bg-indigo-200 border-indigo-600 shadow-lg';
        } else {
            classes += ' hover:bg-gray-100 border-gray-200';
        }
        return classes;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Matching Pairs</h3>
            <p className="mb-4 text-gray-600">Forge the correct bonds between the two sides.</p>

            <div className="flex justify-between space-x-4">
                {/* Left Column (Fixed Order) */}
                <div className="w-1/2">
                    <h4 className="font-semibold text-gray-500 mb-2">Concept</h4>
                    {items.map((item) => (
                        <div
                            key={item.key}
                            onClick={() => handleSelect(item.key, 'left')}
                            className={getItemClasses(item.key, leftSelectionKey)}
                        >
                            {item.left}
                        </div>
                    ))}
                </div>

                {/* Right Column (Shuffled Order) */}
                <div className="w-1/2">
                    <h4 className="font-semibold text-gray-500 mb-2">Description</h4>
                    {shuffledRightItems.map((item) => (
                        <div
                            key={item.key} // Use the correct key for matching
                            onClick={() => handleSelect(item.key, 'right')}
                            className={getItemClasses(item.key, rightSelectionKey)}
                        >
                            {item.right}
                        </div>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t mt-4">
                {feedback && (
                    <p className={`mb-3 text-center font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback.message}
                    </p>
                )}
                
                <button
                    onClick={handleSubmit}
                    disabled={isFinished || !leftSelectionKey || !rightSelectionKey}
                    className={`
                        w-full py-3 px-4 font-semibold rounded-lg transition duration-200
                        ${isFinished
                            ? 'bg-green-500 text-white cursor-default'
                            : (!leftSelectionKey || !rightSelectionKey
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                            )
                        }
                    `}
                >
                    {isFinished ? 'Sealed All Bonds! 🎉' : 'Forge Pairing'}
                </button>
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

/**
 * Component for a single-select multiple choice question.
 * @param {object} props
 * @param {string} props.question The question text.
 * @param {string[]} props.options An array of possible answer strings.
 * @param {string} props.correctAnswer The correct answer string.
 * @param {function} props.onTaskComplete Callback to signal completion.
 */
function MultipleChoice({ question, options, correctAnswer, onTaskComplete }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // Derived state for convenience
    const isCorrect = selectedOption === correctAnswer; 
    const disableInteraction = isSubmitted && isCorrect;

    const handleSubmit = () => {
        if (selectedOption) {
            setIsSubmitted(true);
            const isCorrectResult = selectedOption === correctAnswer;
            // Signal the parent LessonPage
            onTaskComplete(isCorrectResult);
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
            else if (option === selectedOption) {
                classes += ' bg-red-100 border-red-600 font-bold';
            }
            // Dim unselected incorrect answers
            else {
                classes += ' bg-gray-50 border-gray-200 opacity-60';
            }
            // All options become non-interactive after submission
            classes += ' cursor-default'; 
        } else {
            // Pre-submission styling
            if (option === selectedOption) {
                classes += ' bg-indigo-100 border-indigo-600 shadow-md';
            } else {
                classes += ' hover:bg-gray-100 border-gray-200';
            }
        }
        return classes;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Multiple Choice</h3>
            <p className="text-lg font-medium mb-6 text-gray-600">{question}</p>
            
            <div className="space-y-3 mb-6">
                {options.map((option, index) => (
                    <div 
                        key={index}
                        onClick={() => {
                            if (!disableInteraction) setSelectedOption(option);
                        }}
                        className={getOptionClasses(option)}
                    >
                        <span className="font-mono text-indigo-600 mr-3">{String.fromCharCode(65 + index)}.</span>
                        {option}
                    </div>
                ))}
            </div>

            {/* Submission and Feedback Area */}
            <div className="pt-4 border-t">
                {isSubmitted && (
                    <p className={`mb-3 text-center font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {isCorrect ? 'Correct! Rune power accepted.' : `Incorrect. The correct rune was: ${correctAnswer}`}
                    </p>
                )}

                <button
                    onClick={handleSubmit}
                    // Disable if not selected OR already submitted correctly
                    disabled={!selectedOption || disableInteraction}
                    className={`
                        w-full py-3 px-4 font-semibold rounded-lg transition duration-200
                        ${!selectedOption || disableInteraction
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }
                    `}
                >
                    {disableInteraction ? 'Task Completed' : 'Forge Rune'}
                </button>
            </div>
        </div>
    );
}

MultipleChoice.propTypes = {
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correctAnswer: PropTypes.string.isRequired,
    onTaskComplete: PropTypes.func.isRequired,
};

/**
 * Component for a fill-in-the-blank exercise supporting multiple blanks.
 * @param {object} props
 * @param {string} props.sentence The sentence string containing one or more [BLANK] placeholders.
 * @param {string[]} props.correctAnswers An array of expected correct answers, in order.
 * @param {function} props.onTaskComplete Callback to signal completion.
 */
function FillInTheBlank({ sentence, correctAnswers, onTaskComplete }) {
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
    if (isSubmitted) return; 
    const newInputs = [...userInputs];
    newInputs[index] = value;
    setUserInputs(newInputs);
  };

  // Check if all answers are correct
  const allCorrect = userInputs.every((input, index) => {
    return input.trim().toLowerCase() === correctAnswers[index].toLowerCase();
  });
  
  const handleSubmit = () => {
    setIsSubmitted(true);
    onTaskComplete(allCorrect);
  };

  const buttonDisabled = isSubmitted && allCorrect;
  
  // --- Styling Helper ---

  const getInputStyles = (index) => {
    if (!isSubmitted) {
      // Default style before submission
      return 'border-gray-300 focus:border-indigo-500';
    }
    
    // After submission
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
      
      <div className="text-xl mb-8 flex flex-wrap justify-center items-center leading-relaxed">
        {textSegments.map((segment, index) => (
          <React.Fragment key={index}>
            <span className="p-1">{segment}</span>
            {index < correctAnswers.length && (
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
        {isSubmitted && allCorrect ? 'Correct Runes Sealed! 🎉' : 'Check Runes'}
      </button>

      {/* Optional: Show feedback after submission */}
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


/**
 * A component allowing users to reorder a list of items using up/down buttons.
 * @param {Array<object>} props.initialItems The items to be ordered by the user.
 * @param {Array<object>} props.correctOrder The array of items in the correct order.
 * @param {function} props.onTaskComplete Callback to signal completion.
 */
function OrderableList({ initialItems, correctOrder, onTaskComplete }) {
    const [items, setItems] = useState(initialItems);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // If the initial items prop changes, reset the state
    useEffect(() => {
        setItems(initialItems);
        setIsSubmitted(false);
        setIsCorrect(false);
    }, [initialItems, correctOrder]);

    // Function to move an item up or down in the list
    const moveItem = (index, direction) => {
        if (isSubmitted && isCorrect) return; // Prevent moves after correct submission

        if ((direction === 'up' && index > 0) || (direction === 'down' && index < items.length - 1)) {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            const newItems = [...items];
            
            // Swap items
            [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
            
            setItems(newItems);
        }
    };

    // Check if the current user order matches the correct order
    const checkOrder = (currentItems) => {
        if (currentItems.length !== correctOrder.length) return false;
        
        return currentItems.every((item, index) => item.id === correctOrder[index].id);
    };

    const handleSubmit = () => {
        const correct = checkOrder(items);
        setIsSubmitted(true);
        setIsCorrect(correct);
        onTaskComplete(correct);
    };

    // Styling helper
    const getItemClasses = (index) => {
        let classes = 'flex items-center justify-between p-4 rounded-lg shadow-sm border transition duration-150 ';

        if (!isSubmitted) {
            classes += 'bg-white border-gray-200';
        } else if (isCorrect) {
            classes += 'bg-green-100 border-green-500 text-green-800 cursor-default';
        } else {
            // Show incorrect order in a neutral/error color
            classes += 'bg-red-50 border-red-300 text-gray-700';
        }
        return classes;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Sequence The Incantation</h3>
            <p className="mb-4 text-gray-600 font-medium">{initialItems[0].text ? 'Put the following steps in the correct sequence:' : prompt}</p>
            
            <div className="space-y-3">
                {items.map((item, index) => (
                    <div 
                        key={item.id} 
                        className={getItemClasses(index)}
                    >
                        <span className="font-semibold text-lg flex items-center">
                            <span className="text-indigo-600 mr-4 font-mono w-6 text-center">{index + 1}.</span>
                            {item.text}
                        </span>
                        
                        {/* Up/Down Controls */}
                        <div className="flex space-x-2">
                            <button
                                onClick={() => moveItem(index, 'up')}
                                disabled={index === 0 || (isSubmitted && isCorrect)}
                                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
                            </button>
                            <button
                                onClick={() => moveItem(index, 'down')}
                                disabled={index === items.length - 1 || (isSubmitted && isCorrect)}
                                className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
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
                    {isSubmitted && isCorrect ? 'Order Sealed! 🎉' : 'Submit Sequence'}
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

// --- TASK COMPONENT MAP ---

const TASK_COMPONENTS = {
    MatchingPairs: MatchingPairs,
    MultipleChoice: MultipleChoice,
    FillInTheBlank: FillInTheBlank,
    OrderableList: OrderableList,
    TextBox: TextBox,
    // Add other components here as you create them
};

// --- MAIN LESSON PAGE COMPONENT ---

/**
 * Main component to fetch and render a lesson sequence dynamically.
 * @param {object} props
 * @param {number} props.lessonId The ID of the lesson to load.
 */
export default function LessonPage({ lessonId = 1 }) {
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [completedTasks, setCompletedTasks] = useState({}); // Stores { taskId: boolean }

    // --- Data Fetching ---

    useEffect(() => {
        const fetchLessonData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch from the Spring Boot API endpoint you created
                const response = await fetch(`/api/lessons/${lessonId}`); 
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setLesson(data);
                
                // Initialize completion status for all tasks
                const initialCompletion = {};
                if (data.tasks) {
                    data.tasks.forEach(task => {
                        // All tasks start as incomplete
                        initialCompletion[task.id] = false; 
                    });
                }
                setCompletedTasks(initialCompletion);

            } catch (err) {
                console.error("Failed to fetch lesson data:", err);
                // Fallback to mock data if API fails (useful for local development)
                setLesson(MOCK_LESSON_DATA); 
                setError(`Could not fetch lesson ID ${lessonId}. Showing mock data.`);
            } finally {
                setLoading(false);
            }
        };

        fetchLessonData();
    }, [lessonId]);

    // --- Task Completion Handler ---
    
    // Using useCallback to ensure handleTaskCompletion has a stable reference
    const handleTaskCompletion = useCallback((taskId, isSuccessful) => {
        if (isSuccessful) {
            setCompletedTasks(prev => {
                const newState = { ...prev, [taskId]: true };
                
                // Check if all tasks are completed
                const allTasksCompleted = lesson.tasks.every(task => newState[task.id]);
                if (allTasksCompleted) {
                    console.log("Lesson Complete! Congratulations!");
                    // Here you would typically trigger an API call to save progress
                }
                
                return newState;
            });
        }
    }, [lesson]);

    // --- Render Logic ---

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="text-xl font-semibold text-indigo-600 animate-pulse">Loading Lesson Arc...</div>
            </div>
        );
    }

    if (error && !lesson) {
         return (
            <div className="p-8 max-w-4xl mx-auto mt-10 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
                <p className="text-gray-700">{error}</p>
                <p className="text-sm text-gray-500 mt-2">Check your backend API status or network connection.</p>
            </div>
        );
    }
    
    // Calculate overall progress
    const totalTasks = lesson?.tasks?.length || 0;
    const completedCount = Object.values(completedTasks).filter(isDone => isDone).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;
    
    // Function to dynamically render the correct component
    const renderTask = (task) => {
        const TaskComponent = TASK_COMPONENTS[task.type];
        
        if (!TaskComponent) {
            console.error(`Unknown task type: ${task.type}`);
            return (
                <div key={task.id} className="p-4 bg-red-100 border border-red-400 rounded-lg my-4">
                    <p className="font-bold">Error: Unknown Component Type "{task.type}"</p>
                </div>
            );
        }

        // Filter out the 'id' and 'type' to pass the rest as props
        const { id, type, ...taskProps } = task;
        const isCompleted = completedTasks[id];
        
        // Pass the task-specific props and the completion callback
        return (
            <div 
                key={id} 
                className={`py-8 transition-all duration-500 ${isCompleted ? 'opacity-70 border-b-4 border-green-500' : 'border-b border-gray-200'}`}
            >
                <div className='relative'>
                    {isCompleted && (
                         <span className="absolute -top-10 right-0 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full shadow-lg">
                            Task Complete
                        </span>
                    )}
                    <TaskComponent 
                        // Spread the rest of the DTO fields as props (e.g., question, items, sentence)
                        {...taskProps} 
                        // Inject the callback with the specific task ID
                        onTaskComplete={(isSuccessful) => handleTaskCompletion(id, isSuccessful)}
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen pt-12 pb-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Lesson Header */}
                <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 border-t-4 border-indigo-600">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{lesson?.title || 'Unknown Lesson'}</h1>
                    <p className="text-indigo-600 text-lg font-medium">Lesson #{lesson?.orderIndex || 'N/A'}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                        <div className="flex justify-between mb-1 text-sm font-medium text-gray-600">
                            <span>Progress: {completedCount} / {totalTasks} Tasks</span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Task Rendering */}
                {lesson?.tasks?.length > 0 ? (
                    lesson.tasks.map(renderTask)
                ) : (
                    <div className="p-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg">
                        <p className="font-bold">Lesson Content Missing</p>
                        <p>No tasks were loaded for this lesson. Check the `tasks_json` data.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


// --- MOCK DATA FALLBACK (Matches Java DTO structure) ---
const MOCK_LESSON_DATA = {
    id: 1,
    title: "Introduction to JavaScript Variables",
    orderIndex: 3,
    tasks: [
        {
            id: "intro_text",
            type: "TextBox",
            sentence: "JavaScript variables are containers for storing data values. The 'var', 'let', and 'const' keywords are used to declare them. Use 'let' for variables that might change, and 'const' for variables that should remain constant.",
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-500'
        },
        {
            id: "mc_1",
            type: "MultipleChoice",
            question: "Which keyword should you use for a variable that will store a user's date of birth?",
            options: ["var", "let", "const"],
            correctAnswer: "const"
        },
        {
            id: "fitb_1",
            type: "FillInTheBlank",
            sentence: "The [BLANK] keyword is generally preferred today over the older [BLANK] keyword for mutable variables.",
            correctAnswers: ["let", "var"]
        },
        {
            id: "match_1",
            type: "MatchingPairs",
            prompt: "Match the variable type to its behavior.",
            items: [
                { key: "const", left: "const", right: "Cannot be reassigned." },
                { key: "let", left: "let", right: "Can be block-scoped and reassigned." },
                { key: "var", left: "var", right: "Globally or function scoped (avoid if possible)." }
            ]
        },
         {
            id: "order_1",
            type: "OrderableList",
            prompt: "Sequence the steps required to declare and assign a constant variable.",
            initialItems: [
                { id: "step3", text: "Assign the initial value." },
                { id: "step1", text: "Choose a meaningful variable name." },
                { id: "step2", text: "Use the 'const' keyword." },
            ],
            correctOrder: [
                { id: "step2", text: "Use the 'const' keyword." },
                { id: "step1", text: "Choose a meaningful variable name." },
                { id: "step3", text: "Assign the initial value." },
            ]
        }
    ]
};