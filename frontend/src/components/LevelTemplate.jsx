// src/components/LevelTemplate.jsx
import React, { useState, Children } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// 1. IMPORT THE BACKGROUND IMAGE (Assuming you'll place it in the same project directory structure)
import levelBackground from '../assets/testbackground.png'; // **ADJUST PATH IF NECESSARY**

/**
 * A template for displaying a sequence of interactive task components.
 * It manages progression using an `onTaskComplete(isCorrect)` callback provided to each child.
 *
 * NOTE: Each child component MUST accept and use the `onTaskComplete` prop.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children One or more React components, each representing a task.
 * @param {string} props.levelTitle The title for the current level.
 * @param {string} [props.nextLevelPath] Optional path to navigate to when all tasks are complete.
 * @param {string} [props.backgroundImage] Optional URL or imported image for the background.
 */
export default function LevelTemplate({ children, levelTitle, nextLevelPath, backgroundImage = levelBackground }) {
    const navigate = useNavigate();
    const tasks = Children.toArray(children);
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [isCurrentTaskComplete, setIsCurrentTaskComplete] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    const isLevelComplete = currentTaskIndex >= tasks.length;

    // Callback function passed to each task component
    const handleTaskCompletion = (isCorrect) => {
        if (isCorrect) {
            setIsCurrentTaskComplete(true);
            setFeedbackMessage('Task successful! Ready to move on.');
        } else {
            setIsCurrentTaskComplete(false);
            setFeedbackMessage('Halt! Your rune sequence is incorrect. Try again.');
        }
    };

    const handleNextTask = () => {
        if (isCurrentTaskComplete) {
            setCurrentTaskIndex(prevIndex => prevIndex + 1);
            setIsCurrentTaskComplete(false); // Reset for the next task
            setFeedbackMessage('');
        }
    };

    const handleLevelCompletion = () => {
        if (nextLevelPath) {
            navigate(nextLevelPath);
        } else {
            navigate('/level-selection'); // Default navigation
        }
    };

    // Render the current task component
    const CurrentTaskComponent = tasks[currentTaskIndex];
    const currentTaskNumber = currentTaskIndex + 1;
    const totalTasks = tasks.length;

    // 3. Define the background style object with 'contain'
    const backgroundStyle = {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'contain', // Set to 'contain'
        backgroundRepeat: 'no-repeat', // Prevent image tiling
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
    };

    return (
        <div 
            className="flex items-center justify-center p-4" 
            style={backgroundStyle}
        >
            {/* Added backdrop-blur-sm and changed background opacity for better readability */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-3xl border-t-8 border-indigo-500">
                <header className="mb-6 border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800">{levelTitle}</h2>
                    {!isLevelComplete && (
                        <p className="text-sm text-indigo-500 font-semibold mt-2">
                            Step {currentTaskNumber} of {totalTasks}
                        </p>
                    )}
                </header>

                <div className="min-h-[250px] flex flex-col justify-center">
                    {!isLevelComplete ? (
                        <>
                            {/* Render the current task component, passing the completion handler */}
                            {CurrentTaskComponent && 
                                React.cloneElement(CurrentTaskComponent, { 
                                    onTaskComplete: handleTaskCompletion 
                                })
                            }
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-3xl font-extrabold text-green-700 mb-4">
                                👑 Quest Complete! 👑
                            </p>
                            <p className="text-xl text-gray-600 mb-8">The Amulet of Code is yours. The realm is safe... for now.</p>
                            <button
                                onClick={handleLevelCompletion}
                                className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition duration-200 shadow-lg"
                            >
                                Return to the World Map
                            </button>
                        </div>
                    )}
                </div>

                {/* Task Progression Button Area */}
                {!isLevelComplete && (
                    <div className="mt-8 pt-4 border-t flex justify-end">
                        {feedbackMessage && (
                            <p className={`mr-4 self-center font-medium ${isCurrentTaskComplete ? 'text-green-600' : 'text-red-600'}`}>
                                {feedbackMessage}
                            </p>
                        )}
                        <button
                            onClick={handleNextTask}
                            disabled={!isCurrentTaskComplete}
                            className={`
                                px-8 py-3 rounded-full text-white font-semibold transition-colors duration-200 shadow-md
                                ${isCurrentTaskComplete 
                                    ? 'bg-green-500 hover:bg-green-600' 
                                    : 'bg-gray-400 cursor-not-allowed'
                                }
                            `}
                        >
                            {currentTaskIndex < tasks.length - 1 ? 'Next Task' : 'Finish Level'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

LevelTemplate.propTypes = {
    children: PropTypes.node.isRequired,
    levelTitle: PropTypes.string.isRequired,
    nextLevelPath: PropTypes.string,
    backgroundImage: PropTypes.string,
};