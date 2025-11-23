import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            setLoading(true);
            setError(null);
            
            const jwtToken = localStorage.getItem('token'); 
            
            if (!jwtToken) {
                setError("Authentication token missing. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/courses/with-progress', { 
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${jwtToken}`, 
                    },
                }); 
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCourses(data); 
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleButtonClick = (courseId) => {
        navigate(`/course/${courseId}`); 
    };

    const calculateProgressPercentage = (completed, total) => {
        if (total === 0) return 0;
        return Math.min(100, Math.round((completed / total) * 100));
    };

    if (loading) {
        return <div style={styles.container}>Loading courses...</div>;
    }

    if (error) {
        return <div style={styles.container}>Error: {error.message}</div>;
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.pageTitle}>Available Courses</h1>
            <div style={styles.coursesGrid}>
                {courses.map((course) => {
                    const completed = course.completedLevels || 0; 
                    const total = course.totalLessons || 1;
                    const progressPercentage = calculateProgressPercentage(completed, total);
                    const accentColor = ['#5E56E7', '#F5A623', '#9B51E0'][course.id % 3];

                    return (
                        <div key={course.id} style={styles.courseCard}>
                            <h2 style={styles.courseTitle}>{course.title}</h2>
                            <div style={styles.courseInfo}>
                                <p style={styles.infoText}>
                                    <span role="img" aria-label="lessons">📖</span> {course.totalLessons} Lessons
                                </p>
                                <p style={styles.infoText}>
                                    <span role="img" aria-label="time">🕒</span> ~{course.estimatedHours} Hours
                                </p>
                            </div>
                            <div style={styles.progressBarContainer}>
                                <div style={{...styles.progressBarFill, width: `${progressPercentage}%`, backgroundColor: accentColor}}></div>
                            </div>
                            <p style={styles.overallProgress}>
                                 Overall Progress: {progressPercentage}% ({completed} / {course.totalLessons})
                            </p>
                            <button 
                                onClick={() => handleButtonClick(course.id)} 
                                style={{
                                    ...styles.button,
                                    backgroundColor: accentColor
                                }}
                            >
                                {/* Change button text based on progress */}
                                {progressPercentage === 0 ? 'Start Course →' : 'Continue Learning →'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const styles = {
    container: {
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    pageTitle: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '40px',
    },
    coursesGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '25px',
    },
    courseCard: {
        backgroundColor: '#fff',
        borderRadius: '15px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        padding: '25px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '250px',
    },
    courseTitle: {
        fontSize: '1.4em',
        fontWeight: '600',
        marginBottom: '15px',
        color: '#333',
    },
    courseInfo: {
        marginBottom: '15px',
    },
    infoText: {
        fontSize: '0.95em',
        color: '#666',
        margin: '5px 0',
        display: 'flex',
        alignItems: 'center',
    },
    progressBarContainer: {
        height: '8px',
        backgroundColor: '#e0e0e0',
        borderRadius: '4px',
        marginBottom: '10px',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: '4px',
        transition: 'width 0.5s ease-in-out',
    },
    overallProgress: {
        fontSize: '0.9em',
        color: '#555',
        marginBottom: '20px',
    },
    button: {
        padding: '12px 20px',
        borderRadius: '8px',
        border: 'none',
        color: 'white',
        fontSize: '1em',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        textAlign: 'center',
        textDecoration: 'none', 
    },
};

export default CoursesPage;