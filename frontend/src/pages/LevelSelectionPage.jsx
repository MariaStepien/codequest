import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import LevelButton from '../components/LevelButton';

const SPACING_Y = 120; 
const INITIAL_OFFSET_Y = 60; 

// Path Styling Constants
const ACTIVE_PATH_COLOR = '#60a5fa'; // Tailwind blue-400
const DISABLED_PATH_COLOR = '#9ca3af'; // Tailwind gray-400
const PATH_STROKE_WIDTH = 10;
const BUTTON_CENTER_OFFSET_PX = 32; // Half the size of LevelButton (used for Y-coordinates)

{/*Generates positions for levels in a straight vertical line.*/}
const generateHorizontalPositions = (totalLevels) => {
    const positions = {};
    
    let finalY = INITIAL_OFFSET_Y;

    for (let i = 1; i <= totalLevels; i++) {
        const y = INITIAL_OFFSET_Y + (i - 1) * SPACING_Y;
        positions[i] = { y: y, x: 50}; 

        if (i === totalLevels) {
            finalY = y;
        }
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

    useEffect(() => {
        const jwtToken = localStorage.getItem('token');
    
        if (!jwtToken) {
            setLoading(false);
            setError("Użytkownik niezalogowany. Przekierowanie do logowania...");
            
            setTimeout(() => {
                window.location.replace('/'); 
            }, 1500); 
            return;
        }

        const fetchDetails = async () => {
            try {
                const response = await fetch(`/api/courses/${courseId}`); 
                if (!response.ok) {
                    throw new Error(`Nieznaleziono kursu (ID: ${courseId})`);
                }
                const data = await response.json();
                setCourseDetails(data);

                const progressResponse = await fetch(`/api/courses/completed-levels/${courseId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`, 
                        'Content-Type': 'application/json',
                    },
                });
                if (!progressResponse.ok) {
                    console.error(`Nie udało się pobrać postępu użytkownika dla kursu ${courseId}. Status: ${progressResponse.status}`);
                    setLastCompletedLevel(0);
                } else {
                    const completedLevels = await progressResponse.json();
                    setLastCompletedLevel(completedLevels);
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

    const levelButtonOffset = '32px'; 

    if (loading) {
        return <div className="p-8 text-center text-xl">Ładowanie szczegółów kursu</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 font-semibold">Błąd: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 text-gray-800">
            <div className="mx-auto w-full max-w-7xl"> 
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0">
                    <Link to="/dashboard" className="text-blue-400 hover:text-blue-500 transition duration-150 flex items-center space-x-2 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Powrót do kursów</span>
                    </Link>
                    <h1 className="text-4xl font-extrabold text-blue-400">
                        {courseTitle}
                    </h1>
                </header>

                {/* Level Map Container */}
                <div className="border-4 border-blue-200 rounded-xl shadow-xl bg-white p-4 sm:p-6 md:p-8"> 

                    <div 
                        className="relative w-full overflow-y-scroll overflow-x-hidden" 
                        style={{ height: '70vh' }}
                    >
                        {/* CONTENT CONTAINER: Height is set to match the total path length */}
                        <div 
                            className="relative w-full"
                            style={{ height: `${mapHeight}px` }} 
                        >
                            
                            <svg
                                className="absolute top-0 left-0 w-full h-full"
                                style={{ height: `${mapHeight}px` }}
                                preserveAspectRatio="none"
                            >
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

                            
                            {/* Render Level Buttons */}
                            {Object.keys(normalizedPositions).map(level => {
                                const pos = normalizedPositions[level];
                                const levelNumber = Number(level);
                                const isUnlocked = levelStatus[levelNumber];

                                return (
                                    <div 
                                        key={level} 
                                        className="absolute z-10"
                                        style={{
                                            left: `calc(${pos.x}% - ${levelButtonOffset})`, 
                                            top: `calc(${pos.y}px - ${levelButtonOffset})`, 
                                        }}
                                    >
                                        <Link 
                                            to={isUnlocked ? `/course/${courseId}/level/${levelNumber}` : '#'}
                                            onClick={(e) => {
                                                if (!isUnlocked) e.preventDefault();
                                            }}
                                            className={!isUnlocked ? 'cursor-not-allowed' : ''}
                                        >
                                            <LevelButton 
                                                levelNumber={levelNumber} 
                                                isUnlocked={isUnlocked} 
                                                courseId={courseId}
                                            />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}