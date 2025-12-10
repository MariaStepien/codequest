import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

const StarIcon = ({ isActive }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className={`h-5 w-5 fill-current inline-block mr-2 transition-colors duration-200 ${
            isActive ? 'text-yellow-500' : 'text-gray-300'
        }`} 
        viewBox="0 0 20 20" 
        fill="currentColor"
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.381-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
);

export default function LevelDetailsModal({ lessonDetails, progress, onClose, courseId }) {
    const navigate = useNavigate();

    if (!lessonDetails) {
        return null;
    }
    
    const allStarCriteria = [
        "Ukończ poziom.",
        "Przejdź poziom z conajmniej 60% życia.",
        "Przejdź poziom z 100% życia.",
    ];

    const { title, orderIndex } = lessonDetails;
    const userStars = progress ? progress.starsEarned : 0;
    const userTime = progress ? progress.timeTakenSeconds : null;

    const handleStartLevel = () => {
        navigate(`/course/${courseId}/level/${orderIndex}`);
        console.log(`Rozpoczynanie poziomu ${orderIndex} (${title}) w kursie ${courseId}`);
        onClose();
    };

    const formattedTime = userTime !== null 
        ? `${Math.floor(userTime / 60)}m ${userTime % 60}s`
        : 'Nie ukończono';
        
    const maxStars = allStarCriteria.length; 

    return (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-20 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-md border border-gray-200">
                <button 
                    onClick={onClose} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
                    title="Zamknij"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-3xl font-extrabold text-blue-500 mb-4">{title}</h2>
                <p className="text-sm font-medium text-gray-500 mb-6">Poziom {orderIndex}</p>

                <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Twój Postęp</h3>
                        
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                                <span className="text-xl font-bold text-gray-500">{userStars}</span>
                                <span className="text-xl font-bold text-gray-500">/ {maxStars}</span>
                                <StarIcon isActive={true}/>
                            </div>
                            
                            <div className="text-gray-700">
                                <span className="font-bold">Czas:</span> {formattedTime}
                            </div>
                        </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Jak zdobyć gwiazdki?</h3>
                        <ul className="text-sm text-gray-700 space-y-2">
                            {allStarCriteria.map((criteria, index) => {
                                const isEarned = userStars > index; 

                                return (
                                    <li key={index} className="flex items-center">
                                        <StarIcon isActive={isEarned} />
                                        <span>{criteria}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>

                <button
                    onClick={handleStartLevel}
                    className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition duration-150 active:scale-[.99]"
                >
                    Rozpocznij poziom {orderIndex}
                </button>
            </div>
        </div>
    );
}

LevelDetailsModal.propTypes = {
    lessonDetails: PropTypes.object,
    progress: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    courseId: PropTypes.string.isRequired,
};