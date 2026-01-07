import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import { Flag, Clock } from 'lucide-react';

import FillInTheBlank from './FillInTheBlank';
import MatchingPairs from './MatchingPairs';
import MultipleChoice from './MultipleChoice';
import OrderableList from './OrderableList';
import TextBox from './TextBox';
import CodeFix from './CodeFix';
import PlayerSprite from './PlayerSprite';
import EnemySprite from './EnemySprite';
import ReportModal from './ReportModal';
import Toast from '../components/Toast';

import defaultLevelBackground from '../assets/testbackground.png';

const TaskComponentMap = {
    'TextBox': TextBox,
    'MultipleChoice': MultipleChoice,
    'FillInTheBlank': FillInTheBlank,
    'MatchingPairs': MatchingPairs,
    'OrderableList': OrderableList,
    'CodeFix' : CodeFix
};

const INITIAL_HEALTH = 100;

const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => String(num).padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}`;
};

const calculateStars = (currentHealth) => {
    if (currentHealth === 100) return 3;
    if (currentHealth >= 60) return 2;
    if (currentHealth >= 20) return 1;
    return 0;
};

const calculatePoints = (timeTakenSeconds) => {
    const MAX_POINTS = 1000;
    const TIME_PENALTY_RATE = 1;
    const MIN_POINTS = 50;
    let calculatedPoints = MAX_POINTS - (timeTakenSeconds * TIME_PENALTY_RATE);
    return Math.max(MIN_POINTS, calculatedPoints);
};

export default function LevelTemplate({ nextLevelPath, isAdminPreview = false }) {
    const { courseId, levelNumber: routeLevelNumber } = useParams();
    const orderIndex = routeLevelNumber ? parseInt(routeLevelNumber, 10) : null;
    
    const [lessonData, setLessonData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [isCurrentTaskComplete, setIsCurrentTaskComplete] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [showExitConfirmation, setShowExitConfirmation] = useState(false); 

    const [health, setHealth] = useState(INITIAL_HEALTH);
    const [elapsedTime, setElapsedTime] = useState(0);

    const [reportData, setReportData] = useState({ show: false, targetType: 'LESSON', targetId: null });
    const [toast, setToast] = useState({ show: false, message: '', isError: false });

    const tasks = lessonData?.tasks || [];
    const currentTaskObject = tasks[currentTaskIndex];
    const isLevelComplete = currentTaskIndex >= tasks.length; 
    const isGameOver = health <= 0;

    const interactiveTasksCount = tasks.filter(t => t.type !== 'TextBox').length;
    const healthLossPerFail = interactiveTasksCount > 0 ? INITIAL_HEALTH / interactiveTasksCount : 0;
    
    const triggerToast = (msg, err = false) => {
        setToast({ show: true, message: msg, isError: err });
        setTimeout(() => setToast({ show: false, message: '', isError: false }), 3000);
    };

    useEffect(() => {
        let interval;
        const isTextBox = currentTaskObject?.type === 'TextBox';

        if (!isLevelComplete && !isGameOver && !isTextBox) {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        
        return () => clearInterval(interval);
    }, [isLevelComplete, isGameOver, currentTaskObject]); 

    const handleRetryLevel = () => {
        setHealth(INITIAL_HEALTH);
        setCurrentTaskIndex(0);
        setIsCurrentTaskComplete(false);
        setFeedbackMessage('');
        setElapsedTime(0);
    };

    const handleSendReport = async (data) => {
        try {
            const token = localStorage.getItem('token');
            const userRes = await fetch('http://localhost:8080/api/user/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const userData = await userRes.json();

            const res = await fetch(`http://localhost:8080/api/reports?reporterId=${userData.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                triggerToast("Zgłoszenie zostało wysłane.");
            } else {
                triggerToast("Błąd podczas wysyłania zgłoszenia.", true);
            }
        } catch (error) {
            triggerToast("Błąd połączenia z serwerem.", true);
        }
    };

    const updateUserProgress = async (courseId, completedLevelOrderIndex) => {
        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) return;

        try {
            await fetch('http://localhost:8080/api/progress/update', {
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
        } catch (e) {
            console.error(e);
        }
    };
    
    const recordLessonProgress = async (lessonId, courseId, timeTakenSeconds, starsEarned, pointsEarned) => {
        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) return;
        
        try {
            await fetch('http://localhost:8080/api/lesson-progress/record', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`,
                },
                body: JSON.stringify({
                    lessonId, courseId, starsEarned, timeTakenSeconds, pointsEarned
                }),
            });
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        if (!courseId || !orderIndex) {
            setIsLoading(false);
            return;
        }

        const fetchLessonData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`/api/lessons/course/${courseId}/order/${orderIndex}`);
                const data = await response.json();
                setLessonData(data);
                setReportData(prev => ({ ...prev, targetId: data.id }));
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessonData();
    }, [courseId, orderIndex]);

    const handleTaskCompletion = (isCorrect) => {
        if (isCorrect) {
            setIsCurrentTaskComplete(true);
            setFeedbackMessage('Zadanie zakończone sukcesem! Możemy ruszać dalej.');
        } else {
            setHealth(prevHealth => Math.max(0, prevHealth - healthLossPerFail));
            setIsCurrentTaskComplete(false);
            setFeedbackMessage(`Stój! Zadanie jest źle wykonane. Utracono ${Math.round(healthLossPerFail)}% życia. Spróbuj ponownie.`);
        }
    };

    const handleNextTask = async () => {
        const canProceed = isCurrentTaskComplete || isAdminPreview;
            if (canProceed) {
                if (currentTaskIndex < tasks.length - 1) {
                    setCurrentTaskIndex(prevIndex => prevIndex + 1);
                    setIsCurrentTaskComplete(false);
                    setFeedbackMessage('');
                } else {
                    const courseIdNum = parseInt(courseId, 10);
                    const lessonIdNum = lessonData?.id; 
                    const starsEarned = calculateStars(health);
                    const pointsEarned = calculatePoints(elapsedTime);

                    if (!isAdminPreview && courseIdNum && lessonIdNum) {
                        await recordLessonProgress(lessonIdNum, courseIdNum, elapsedTime, starsEarned, pointsEarned);
                        await updateUserProgress(courseIdNum, orderIndex);
                    }
                    setCurrentTaskIndex(tasks.length);
                    setIsCurrentTaskComplete(false);
                }
            }
    };

    const handlePreviousTask = () => {
        if (currentTaskIndex > 0) {
            setCurrentTaskIndex(prevIndex => prevIndex - 1);
            setIsCurrentTaskComplete(false);
            setFeedbackMessage('');
        }
    };

    const getBackgroundImage = () => {
        if (lessonData && lessonData.backgroundImage) {
            return `url(http://localhost:8080/api/${lessonData.backgroundImage})`;
        }
        return `url(${defaultLevelBackground})`;
    };

    const backgroundStyle = {
        backgroundImage: getBackgroundImage(),
        backgroundSize: 'cover', 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
    };
    
    if (isLoading) return <div className="text-center py-20 text-xl font-semibold">Ładowanie lekcji...</div>;
    if (error) return <div className="text-center py-20 text-xl font-bold text-red-600">Błąd: {error}</div>;
    
    if (isGameOver) {
        return (
            <div className="flex items-center justify-center p-4" style={backgroundStyle}>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-10 w-full max-w-lg border-t-8 border-red-600 text-center">
                    <p className="text-5xl font-extrabold text-red-700 mb-4">Misja nieudana</p>
                    <p className="text-xl text-gray-600 mb-8">Wykorzystałeś całe swoje życie.</p>
                    <button onClick={handleRetryLevel} className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition shadow-lg">Ponów poziom</button>
                </div>
            </div>
        );
    }

    const CurrentTaskComponent = currentTaskObject ? TaskComponentMap[currentTaskObject.type] : null;

    return (
        <div className="flex flex-col items-center justify-center p-4 gap-6" style={backgroundStyle}>
            <Toast {...toast} />
            <ReportModal 
                {...reportData}
                onClose={() => setReportData(prev => ({ ...prev, show: false }))}
                onReport={handleSendReport}
            />
            {isAdminPreview && (
                <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white text-center py-1.5 text-sm font-bold z-[100] shadow-md uppercase tracking-wider">
                    Tryb Podglądu Administratora - Nawigacja Odblokowana
                </div>
            )}

            {!isLevelComplete && (
                <button onClick={() => setShowExitConfirmation(true)} className="fixed top-4 left-4 p-3 rounded-full bg-red-500 text-white text-xl hover:bg-red-600 transition shadow-lg z-50">
                    &times;
                </button>
            )}

            {!isLevelComplete && (
                <div className="bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-indigo-100 flex items-center gap-3 animate-bounce-subtle">
                    <Clock className="w-6 h-6 text-indigo-600" />
                    <span className="text-2xl font-mono font-bold text-gray-800 tracking-wider">
                        {formatTime(elapsedTime)}
                    </span>
                </div>
            )}

            <div className="flex items-center justify-center w-full max-w-7xl">
                <div className="flex-shrink-0 hidden lg:block">
                    {lessonData?.hasEnemy ? <PlayerSprite /> : <div className="w-32"></div>}
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-8 w-full max-w-3xl border-t-8 border-indigo-500 mx-4">
                    <header className="mb-6 border-b pb-4">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800">{lessonData?.title || `Poziom ${orderIndex}`}</h2>
                                    {!isLevelComplete && <p className="text-sm text-indigo-500 font-semibold mt-2">{currentTaskIndex + 1} z {tasks.length}</p>}
                                </div>
                                {!isLevelComplete && (
                                    <button 
                                        onClick={() => setReportData(prev => ({ ...prev, show: true }))}
                                        className="text-gray-400 hover:text-orange-500 p-1 mt-1 transition"
                                        title="Zgłoś błąd w lekcji"
                                    >
                                        <Flag className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            
                            {!isLevelComplete && (
                                <div className="w-1/3 min-w-[120px] ml-4">
                                    <p className="text-sm font-semibold text-red-600 mb-1">Życie: {Math.max(0, Math.round(health))}%</p>
                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
                                        <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(health / INITIAL_HEALTH) * 100}%` }}></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </header>

                    <div className="min-h-[250px] flex flex-col justify-center">
                        {!isLevelComplete ? (
                            CurrentTaskComponent ? (
                                <CurrentTaskComponent key={currentTaskIndex} {...currentTaskObject} onTaskComplete={handleTaskCompletion} />
                            ) : <p className="text-red-500 font-bold">Błąd typu zadania</p>
                        ) : (
                            <div className="text-center py-10">
                                <p className="text-3xl font-extrabold text-green-700 mb-4">👑 Poziom ukończony! 👑</p>
                                <button onClick={() => navigate(isAdminPreview ? '/admin/courses' : (nextLevelPath || '/dashboard'))} className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-700 transition shadow-lg">
                                    {isAdminPreview ? 'Powróć do panelu' : 'Powróć do mapy'}
                                </button>
                            </div>
                        )}
                    </div>

                    {!isLevelComplete && (
                        <div className="mt-8 pt-4 border-t flex justify-between items-center">
                            <div className="flex gap-2">
                                {isAdminPreview && (
                                    <button 
                                        onClick={handlePreviousTask}
                                        disabled={currentTaskIndex === 0}
                                        className={`px-4 py-2 rounded-lg font-semibold transition ${currentTaskIndex === 0 ? 'bg-gray-200 text-gray-400' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
                                    >
                                        Poprzednie
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center">
                                {feedbackMessage && <p className={`mr-4 self-center font-medium ${isCurrentTaskComplete ? 'text-green-600' : 'text-red-600'}`}>{feedbackMessage}</p>}
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleNextTask} 
                                        disabled={!isCurrentTaskComplete && !isAdminPreview} 
                                        className={`px-8 py-3 rounded-full text-white font-semibold transition shadow-md ${isCurrentTaskComplete || isAdminPreview ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                                    >
                                        {currentTaskIndex < tasks.length - 1 ? 'Następne zadanie' : 'Ukończ poziom'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-shrink-0 hidden lg:block">
                    {lessonData?.hasEnemy && lessonData?.enemyId ? <EnemySprite enemyId={lessonData.enemyId} /> : <div className="w-32"></div>}
                </div>
            </div>

            {showExitConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Czy na pewno chcesz opuścić ten poziom?</h3>
                        <div className="flex justify-center space-x-4">
                            <button onClick={() => navigate('/dashboard')} className="px-6 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700">Tak</button>
                            <button onClick={() => setShowExitConfirmation(false)} className="px-6 py-2 rounded-md bg-gray-300 text-gray-800 font-semibold hover:bg-gray-400">Nie</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

LevelTemplate.propTypes = {
    nextLevelPath: PropTypes.string,
};