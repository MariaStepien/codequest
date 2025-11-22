import { useMemo, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import LevelButton from '../components/LevelButton';

const MOCK_USER_PROGRESS = {
    '1': 5,
    '2': 3,
    '3': 10,
};


{/*Generates positions for levels in a straight horizontal line.*/}
const generateHorizontalPositions = (totalLevels) => {
    const positions = {};
    for (let i = 1; i <= totalLevels; i++) {
        let x;
        if (totalLevels === 1) {
            x = 50; 
        } else {
            x = 10 + (i - 1) * (80 / (totalLevels - 1));
        }
        positions[i] = { x: x, y: 50 };
    }
    return positions;
};


{ /* Creates connections between sequential levels */}
const generateSequentialPaths = (totalLevels) => {
    const paths = [];
    for (let i = 1; i < totalLevels; i++) {
        paths.push([i, i + 1]);
    }
    return paths;
};

export default function LevelSelectionPage() {
    const { courseId } = useParams();
    const [courseDetails, setCourseDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const response = await fetch(`/api/courses/${courseId}`); 
                if (!response.ok) {
                    throw new Error(`Course not found (ID: ${courseId})`);
                }
                const data = await response.json();
                setCourseDetails(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [courseId]);

    const courseTitle = courseDetails?.title || 'Loading Course...';
    const totalLessons = courseDetails?.totalLessons || 1;
    const lastCompletedLevel = MOCK_USER_PROGRESS[courseId] || 0; 

    const normalizedPositions = useMemo(() => 
        generateHorizontalPositions(totalLessons), 
        [totalLessons]
    );

    const paths = useMemo(() => 
        generateSequentialPaths(totalLessons), 
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

    const drawPaths = useMemo(() => {
        return paths.map(([startLevel, endLevel]) => {
            const start = normalizedPositions[startLevel];
            const end = normalizedPositions[endLevel];
            
            if (!start || !end) return null;

            const isPathUnlocked = levelStatus[startLevel] && levelStatus[endLevel];

            return (
                <line 
                    key={`${startLevel}-${endLevel}`}
                    x1={`${start.x}%`} 
                    y1={`${start.y}%`} 
                    x2={`${end.x}%`} 
                    y2={`${end.y}%`} 
                    stroke={isPathUnlocked ? "#7DD3FC" : "#D1D5DB"}
                    strokeWidth="4" 
                    strokeLinecap="round"
                />
            );
        }).filter(Boolean);
    }, [paths, normalizedPositions, levelStatus]);

    if (loading) {
        return <div className="p-8 text-center text-xl">Loading course details...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-red-600 font-semibold">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 text-gray-800">
            <div className="mx-auto w-full max-w-7xl"> 
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0">
                    <h1 className="text-4xl font-extrabold text-blue-400">
                        {/* Display dynamic Course Title */}
                        {courseTitle}
                    </h1>
                    <Link to="/courses" className="text-blue-400 hover:text-blue-500 transition duration-150 flex items-center space-x-2 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Go back to Courses</span>
                    </Link>
                </header>

                {/* Level Map Container */}
                <div className="border-4 border-blue-200 rounded-xl shadow-xl bg-white p-4 sm:p-6 md:p-8"> 

                    <div className="relative w-full h-0 pt-[25%] overflow-hidden bg-gray-100 rounded-lg"> 
                        <svg 
                            className="absolute inset-0 w-full h-full z-0" 
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                        >
                            {drawPaths}
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
                                        top: `calc(${pos.y}% - ${levelButtonOffset})`,
                                    }}
                                >
                                    <Link 
                                        to={isUnlocked ? `/level/${levelNumber}` : '#'}
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
    );
}