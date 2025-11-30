import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';

import FillInTheBlank from './FillInTheBlank';
import MatchingPairs from './MatchingPairs';
import MultipleChoice from './MultipleChoice';
import OrderableList from './OrderableList';
import TextBox from './TextBox';
import CodeFix from './CodeFix';

import levelBackground from '../assets/testbackground.png';

const TaskComponentMap = {
    'TextBox': TextBox,                // Matches TextBoxTaskDto.java type
    'MultipleChoice': MultipleChoice,  // Matches MultipleChoiceTaskDto.java type
    'FillInTheBlank': FillInTheBlank,  // Matches FillInTheBlankTaskDto.java type
    'MatchingPairs': MatchingPairs,    // Matches MatchingPairsTaskDto.java type
    'OrderableList': OrderableList,    // Matches OrderableListTaskDto.java type
    'CodeFix' : CodeFix                // Matches CodeFixTaskDto.java type
};

export default function LevelTemplate({ nextLevelPath, backgroundImage = levelBackground }) {
    // Get levelId from the URL path
    const { courseId, levelNumber: routeLevelNumber } = useParams();
    const orderIndex = routeLevelNumber ? parseInt(routeLevelNumber, 10) : null;
    
    // State for lesson data and loading
    const [lessonData, setLessonData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for task progression and exit confirmation
    const navigate = useNavigate();
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [isCurrentTaskComplete, setIsCurrentTaskComplete] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showExitConfirmation, setShowExitConfirmation] = useState(false); 

    const updateUserProgress = async (courseId, completedLevelOrderIndex) => {
        const jwtToken = localStorage.getItem('token');
        
        if (!jwtToken) {
            console.error("Brak tokena uwierzytelniającego. Nie można zapisać postępu.");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/progress/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({
                    courseId: courseId,
                    completedLevelOrderIndex: completedLevelOrderIndex
                }),
            });

            if (!response.ok) {
                console.error("Nie udało się zapisać postępu.", await response.json());
            } else {
                console.log("Pomyślnie zapisano postęp!", await response.json());
            }
        } catch (e) {
            console.error("Błąd sieciowy podczas zapisywania postępu:", e);
        }
    };

    useEffect(() => {
        if (!courseId || !orderIndex) {
            setError("Na trasie brakuje identyfikatora kursu lub numeru poziomu (indeksu kolejności).");
            setIsLoading(false);
            return;
        }

        const fetchLessonData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const url = `/api/lessons/course/${courseId}/order/${orderIndex}`;
                const response = await fetch(url); 
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error(`Lekcja nieznaleziona dla kursu o ID ${courseId} i indeksie kolejności ${orderIndex}. (Status 404)`);
                    }
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setLessonData(data);
                
            } catch (err) {
                console.error("Nie udało się pobrać danych lekcji:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessonData();
    }, [courseId, orderIndex]);

    const handleExitLevel = () => {
        setShowExitConfirmation(true);
    };

    const handleConfirmExit = () => {
        navigate('/dashboard');
    };

    const handleCancelExit = () => {
        setShowExitConfirmation(false);
    };

    const tasks = lessonData?.tasks || [];
    const isLevelComplete = currentTaskIndex >= tasks.length; 

    const handleTaskCompletion = (isCorrect) => {
        if (isCorrect) {
            setIsCurrentTaskComplete(true);
            setFeedbackMessage('Zadanie zakończone sukcesem! Możemy ruszać dalej.');
        } else {
            setIsCurrentTaskComplete(false);
            setFeedbackMessage('Stój! Zadanie jest źle wykonane. Spróbuj ponownie.');
        }
    };

    const handleNextTask = async () => {
        if (isCurrentTaskComplete) {
            if (currentTaskIndex < tasks.length - 1) {
                setCurrentTaskIndex(prevIndex => prevIndex + 1);
                setIsCurrentTaskComplete(false);
                setFeedbackMessage('');
            } else {
                const courseIdNum = parseInt(courseId, 10);
                
                if (courseIdNum && orderIndex) {
                    await updateUserProgress(courseIdNum, orderIndex);
                }
                
                setCurrentTaskIndex(tasks.length);
                
                setIsCurrentTaskComplete(false);
                setFeedbackMessage('Postęp zapisany!');
            }
        }
    };

    const handleLevelCompletion = () => {
        if (nextLevelPath) {
            navigate(nextLevelPath);
        } else {
            navigate('/dashboard');
        }
    };

    const currentTaskObject = tasks[currentTaskIndex];
    const taskProps = currentTaskObject || {}; 
    const CurrentTaskComponent = currentTaskObject ? TaskComponentMap[currentTaskObject.type] : null;

    const currentTaskNumber = currentTaskIndex + 1;
    const totalTasks = tasks.length;
    const levelTitle = lessonData?.title || `Poziom ${orderIndex || '?'}`;
    const backgroundStyle = {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover', 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
    };

    if (isLoading) {
        return <div className="text-center py-20 text-xl font-semibold">Ładowanie lekcji...</div>;
    }

    if (error) {
        return <div className="text-center py-20 text-xl font-bold text-red-600">Błąd: {error}</div>;
    }
    
    if (tasks.length === 0 && !isLoading) {
        return <div className="text-center py-20 text-xl font-bold text-orange-600">Nie znaleziono zadań dla tej lekcji.</div>;
    }

    return (
        <div 
            className="flex items-center justify-center p-4" 
            style={backgroundStyle}
        >
            {/* NEW: Top-left fixed Exit Button */}
            {!isLevelComplete && (
                <button
                    onClick={handleExitLevel}
                    className="fixed top-4 left-4 p-3 rounded-full bg-red-500 text-white text-xl hover:bg-red-600 transition duration-200 shadow-lg z-50"
                    title="Exit Level (Return to Dashboard)"
                >
                    <span className="sr-only">Opuść poziom</span>
                    &times;
                </button>
            )}

            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-3xl border-t-8 border-indigo-500">
                <header className="mb-6 border-b pb-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">{levelTitle}</h2>
                        {!isLevelComplete && (
                            <p className="text-sm text-indigo-500 font-semibold mt-2">
                                {currentTaskNumber} z {totalTasks}
                            </p>
                        )}
                    </div>
                </header>

                <div className="min-h-[250px] flex flex-col justify-center">
                    {!isLevelComplete ? (
                        <>
                            {CurrentTaskComponent ? (
                                <CurrentTaskComponent 
                                    {...taskProps} 
                                    onTaskComplete={handleTaskCompletion} 
                                />
                            ) : (
                                <p className="text-red-500 font-bold">Błąd: Nie znaleziono żadnego komponentu dla typu zadania: "{currentTaskObject?.type}"</p>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-3xl font-extrabold text-green-700 mb-4">
                                👑 Poziom ukończony! 👑
                            </p>
                            <p className="text-xl text-gray-600 mb-8">Pomyślnie ukończyłeś swoje zadanie.</p>
                            <button
                                onClick={handleLevelCompletion}
                                className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition duration-200 shadow-lg"
                            >
                                Powróć do mapy
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
                            {currentTaskIndex < tasks.length - 1 ? 'Następne zadanie' : 'Ukończ poziom'}
                        </button>
                    </div>
                )}
            </div>
            
            {showExitConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Czy na pewno chcesz opuścić ten poziom?</h3>
                        <p className="text-red-500 mb-6 font-medium">
                            Postęp nie zostanie zapisany!
                        </p>
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleConfirmExit}
                                className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition duration-150"
                            >
                                Tak (Opuść)
                            </button>
                            <button
                                onClick={handleCancelExit}
                                className="px-6 py-2 rounded-md bg-black-200 text-white-800 font-semibold hover:bg-gray-300 transition duration-150"
                            >
                                Nie (Zostań)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

LevelTemplate.propTypes = {
    nextLevelPath: PropTypes.string,
    backgroundImage: PropTypes.string,
};