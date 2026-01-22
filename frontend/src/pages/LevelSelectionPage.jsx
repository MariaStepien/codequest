import { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import LevelButton from '../components/LevelButton';
import LevelDetailsModal from '../components/LevelDetailsModal'; 
import Header from '../components/Header';
import { Flag, PlayCircle } from 'lucide-react';

const SPACING_Y = 120; 
const INITIAL_OFFSET_Y = 100; 

const ACTIVE_PATH_COLOR = '#60a5fa'; 
const DISABLED_PATH_COLOR = '#9ca3af'; 
const PATH_STROKE_WIDTH = 10;
const BUTTON_CENTER_OFFSET_PX = 32; 

const generateHorizontalPositions = (totalLevels) => {
    const positions = {};
    let finalY = INITIAL_OFFSET_Y;

    for (let i = 1; i <= totalLevels; i++) {
        const y = INITIAL_OFFSET_Y + (i - 1) * SPACING_Y;
        positions[i] = { y: y, x: 50}; 
        if (i === totalLevels) finalY = y;
    }
    return {
        positions,
        mapHeight: finalY + INITIAL_OFFSET_Y 
    }
};

export default function LevelSelectionPage() {
    const { courseId } = useParams();
    const [courseDetails, setCourseDetails] = useState(null);
    const [lastCompletedLevel, setLastCompletedLevel] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [selectedLevelDetails, setSelectedLevelDetails] = useState(null);
    const [selectedLevelProgress, setSelectedLevelProgress] = useState(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);
    const [userHearts, setUserHearts] = useState(null);

    useEffect(() => {
        const jwtToken = localStorage.getItem('token');
        if (!jwtToken) {
            setLoading(false);
            setError("Użytkownik niezalogowany.");
            setTimeout(() => window.location.replace('/'), 1500); 
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await fetch(`/api/courses/${courseId}`); 
                if (!response.ok) throw new Error(`Nieznaleziono kursu`);
                const data = await response.json();
                setCourseDetails(data);

                const progressResponse = await fetch(`/api/courses/completed-levels/${courseId}`, {
                    headers: { 'Authorization': `Bearer ${jwtToken}` },
                });
                if (progressResponse.ok) {
                    const completedLevels = await progressResponse.json();
                    setLastCompletedLevel(completedLevels);
                }

                const userResponse = await fetch('/api/user/me', {
                    headers: { 'Authorization': `Bearer ${jwtToken}` }
                });
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUserHearts(userData.hearts);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [courseId]);

    const courseTitle = courseDetails?.title || 'Ładowanie kursu...';
    const totalLessons = courseDetails?.totalLessons || 1;

    const { positions: normalizedPositions, mapHeight } = useMemo(() => 
        generateHorizontalPositions(totalLessons),
        [totalLessons]    
    );

    const levelStatus = useMemo(() => {
        const status = {};
        for (let i = 1; i <= totalLessons; i++) {
            status[i] = i <= lastCompletedLevel + 1; 
        }
        return status;
    }, [totalLessons, lastCompletedLevel]);
    
    const fetchLevelDetails = useCallback(async (levelNumber) => {
        setIsDetailsLoading(true);
        setSelectedLevelDetails(null);
        setSelectedLevelProgress(null);
        const jwtToken = localStorage.getItem('token');
        
        try {
            const lessonResponse = await fetch(`/api/lessons/course/${courseId}/order/${levelNumber}`);
            if (!lessonResponse.ok) throw new Error(`Błąd detali`);
            const lessonDetails = await lessonResponse.json();
            setSelectedLevelDetails(lessonDetails);

            const progressResponse = await fetch(`/api/lesson-progress/lesson/${lessonDetails.id}`, {
                headers: { 'Authorization': `Bearer ${jwtToken}` },
            });
            if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                setSelectedLevelProgress(progressData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsDetailsLoading(false);
        }
    }, [courseId]);

    const handleLevelClick = (e, levelNumber, isUnlocked) => {
        if (isUnlocked) {
            e.preventDefault(); 
            fetchLevelDetails(levelNumber);
        }
    };

    const levelButtonOffset = '32px'; 

    if (loading) return (
        <div className="min-h-screen bg-gray-50">
            <Header currentPage="courses" />
            <div className="p-8 text-center text-xl">Ładowanie...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Header currentPage="courses" />
            
            <main className="mx-auto w-full max-w-7xl p-4 sm:p-8"> 
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0">
                    <Link to="/courses" className="text-blue-400 hover:text-blue-500 flex items-center space-x-2 font-medium">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Powrót do kursów</span>
                    </Link>
                    <h1 className="text-4xl font-extrabold text-blue-500 uppercase tracking-tight">
                        {courseTitle}
                    </h1>
                </header>

                <div className="border-4 border-blue-200 rounded-2xl shadow-2xl bg-white p-4 sm:p-6 md:p-8 relative overflow-hidden"> 
                    
                    {(selectedLevelDetails || isDetailsLoading) && (
                         <LevelDetailsModal 
                            lessonDetails={selectedLevelDetails}
                            progress={selectedLevelProgress}
                            onClose={() => { setSelectedLevelDetails(null); setSelectedLevelProgress(null); }}
                            courseId={courseId}
                            userHearts={userHearts}
                        />
                    )}

                    <div className="relative w-full overflow-y-scroll overflow-x-hidden custom-scrollbar" style={{ height: '70vh' }}>
                        <div className="relative w-full" style={{ height: `${mapHeight}px` }}>
                            
                            <div className="absolute w-full text-center" style={{ top: `${INITIAL_OFFSET_Y - 70}px` }}>
                                <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-green-200">
                                    Start Przygody
                                </span>
                            </div>

                            <svg className="absolute top-0 left-0 w-full h-full" style={{ height: `${mapHeight}px` }} preserveAspectRatio="none">
                                {Object.keys(normalizedPositions).map(level => {
                                    const n = Number(level);
                                    if (n === 1) return null;
                                    const p1 = normalizedPositions[n - 1];
                                    const p2 = normalizedPositions[n];
                                    const active = (n - 1) <= lastCompletedLevel;
                                    return (
                                        <line
                                            key={`line-${n - 1}-${n}`}
                                            x1={`${p1.x}%`} 
                                            y1={p1.y + BUTTON_CENTER_OFFSET_PX}
                                            x2={`${p2.x}%`} 
                                            y2={p2.y - BUTTON_CENTER_OFFSET_PX}
                                            stroke={active ? ACTIVE_PATH_COLOR : DISABLED_PATH_COLOR}
                                            strokeWidth={PATH_STROKE_WIDTH}
                                            strokeLinecap="round"
                                        />
                                    );
                                })}
                            </svg>

                            {Object.keys(normalizedPositions).map(level => {
                                const pos = normalizedPositions[level];
                                const levelNumber = Number(level);
                                const isUnlocked = levelStatus[levelNumber];
                                const isCurrent = levelNumber === lastCompletedLevel + 1;

                                return (
                                    <div 
                                        key={level} 
                                        className="absolute z-10 flex items-center"
                                        style={{
                                            left: `calc(${pos.x}% - ${levelButtonOffset})`, 
                                            top: `calc(${pos.y}px - ${levelButtonOffset})`, 
                                        }}
                                    >
                                        <Link 
                                            to={isUnlocked ? `/course/${courseId}/level/${levelNumber}` : '#'}
                                            onClick={(e) => handleLevelClick(e, levelNumber, isUnlocked)}
                                            className={`${!isUnlocked ? 'cursor-not-allowed' : ''} relative group`}
                                        >
                                            <LevelButton 
                                                levelNumber={levelNumber} 
                                                isUnlocked={isUnlocked} 
                                                courseId={courseId}
                                            />
                                            {isCurrent && (
                                                <div className="absolute -right-32 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 animate-bounce">
                                                    <PlayCircle size={14} />
                                                    <span>KONTYNUUJ</span>
                                                </div>
                                            )}
                                        </Link>
                                    </div>
                                );
                            })}

                            <div className="absolute w-full text-center" style={{ top: `${mapHeight - 40}px` }}>
                                <div className="flex flex-col items-center text-gray-400">
                                    <Flag size={24} className="mb-1" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Cel Kursu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}