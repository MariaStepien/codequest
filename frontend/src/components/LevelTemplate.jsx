import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';

import FillInTheBlank from './FillInTheBlank';
import MatchingPairs from './MatchingPairs';
import MultipleChoice from './MultipleChoice';
import OrderableList from './OrderableList';
import TextBox from './TextBox';

const TaskComponentMap = {
    'TextBox': TextBox,          // Matches TextBoxTaskDto.java type
    'MultipleChoice': MultipleChoice,  // Matches MultipleChoiceTaskDto.java type
    'FillInTheBlank': FillInTheBlank,  // Matches FillInTheBlankTaskDto.java type
    'MatchingPairs': MatchingPairs,    // Matches MatchingPairsTaskDto.java type
    'OrderableList': OrderableList,    // Matches OrderableListTaskDto.java type
};

import levelBackground from '../assets/testbackground.png';

export default function LevelTemplate({ nextLevelPath, backgroundImage = levelBackground }) {
    // Get lessonId from the URL path
    const { lessonId: routeLessonId } = useParams();
    const lessonId = routeLessonId ? parseInt(routeLessonId, 10) : null;
    
    // State for lesson data and loading
    const [lessonData, setLessonData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for task progression
    const navigate = useNavigate();
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [isCurrentTaskComplete, setIsCurrentTaskComplete] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');

    useEffect(() => {
        if (!lessonId) {
            setError("Lesson ID is missing from the route.");
            setIsLoading(false);
            return;
        }

        const fetchLessonData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/lessons/${lessonId}`); 
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error("Lesson not found. (Status 404)");
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setLessonData(data);
                
            } catch (err) {
                console.error("Failed to fetch lesson data:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessonData();
    }, [lessonId]);

    const tasks = lessonData?.tasks || [];
    const isLevelComplete = currentTaskIndex >= tasks.length;

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
            setIsCurrentTaskComplete(false);
            setFeedbackMessage('');
        }
    };

    const handleLevelCompletion = () => {
        if (nextLevelPath) {
            navigate(nextLevelPath);
        } else {
            navigate('/levels');
        }
    };

    const currentTaskObject = tasks[currentTaskIndex]; // The TaskDto object
    const taskProps = currentTaskObject || {}; 
    const CurrentTaskComponent = currentTaskObject ? TaskComponentMap[currentTaskObject.type] : null;

    const currentTaskNumber = currentTaskIndex + 1;
    const totalTasks = tasks.length;
    const levelTitle = lessonData?.title || `Level ${lessonId || '?'}`;

    const backgroundStyle = {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'contain', 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
    };

    if (isLoading) {
        return <div className="text-center py-20 text-xl font-semibold">Loading Lesson...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-xl font-bold text-red-600">Error: {error}</div>;
    }
    
    if (tasks.length === 0) {
        return <div className="text-center py-20 text-xl font-bold text-orange-600">No tasks found for this lesson.</div>;
    }

    return (
        <div 
            className="flex items-center justify-center p-4" 
            style={backgroundStyle}
        >
            {/* The main container remains visually unchanged */}
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
                            {/* Dynamic Task Rendering */}
                            {CurrentTaskComponent ? (
                                <CurrentTaskComponent 
                                    {...taskProps} 
                                    onTaskComplete={handleTaskCompletion} 
                                />
                            ) : (
                                <p className="text-red-500 font-bold">Error: No component found for task type: "{currentTaskObject?.type}"</p>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-3xl font-extrabold text-green-700 mb-4">
                                👑 Quest Complete! 👑
                            </p>
                            <p className="text-xl text-gray-600 mb-8">You successfully finished your quest.</p>
                            <button
                                onClick={handleLevelCompletion}
                                className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition duration-200 shadow-lg"
                            >
                                Return to the World Map
                            </button>
                        </div>
                    )}
                </div>

                {/* Task Progression Button Area (Unchanged Look) */}
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
    nextLevelPath: PropTypes.string,
    backgroundImage: PropTypes.string,
};