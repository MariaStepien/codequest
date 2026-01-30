import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';

const StarIcon = ({ isActive }) => (
    <Star 
        className={`h-5 w-5 inline-block mr-2 transition-colors duration-200 ${
            isActive ? 'fill-yellow-500 text-yellow-500' : 'text-gray-300'
        }`} 
    />
);
/**
 * Component for showing modal with information on progress in level
 * @param {Object} lessonDetails Object containing title, orderIndex, and enemy info
 * @param {Object} progress Object containing user's previous performance (starsEarned, timeTakenSeconds)
 * @param {Function} onClose Function to handle closing the modal
 * @param {Long} courseId The ID of the current course
 * @param {number} userHearts Current number of hearts the user has
 */
export default function LevelDetailsModal({ lessonDetails, progress, onClose, courseId, userHearts }) {
    const navigate = useNavigate();

    if (!lessonDetails) {
        return null;
    }
    
    const allStarCriteria = [
        "Ukończ lekcję. (5 monet)",
        "Przejdź lekcję z conajmniej 60% życia. (5 monet)",
        "Przejdź lekcję z 100% życia. (10 monet)",
    ];

    const { title, orderIndex } = lessonDetails;
    const userStars = progress ? progress.starsEarned : 0;
    const userTime = progress ? progress.timeTakenSeconds : null;
    const hasNoHearts = userHearts !== null && userHearts <= 0;

    const handleStartLevel = () => {
        if (hasNoHearts) return;
        navigate(`/course/${courseId}/level/${orderIndex}`);
        console.log(`Rozpoczynanie lekcji ${orderIndex} (${title}) w kursie ${courseId}`);
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
                <p className="text-sm font-medium text-gray-500 mb-6">Lekcja {orderIndex}</p>

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
                    {hasNoHearts && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                            <Heart className="w-5 h-5 fill-red-500" />
                            <p className="text-sm font-bold">
                                Nie masz serc! Poczekaj na regenerację, aby rozpocząć lekcję.
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleStartLevel}
                    disabled={hasNoHearts}
                    className={`w-full py-3 font-bold rounded-lg shadow-md transition duration-150 
                        ${hasNoHearts 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[.99]'}`}
                >
                    {hasNoHearts ? 'Brak serc' : `Rozpocznij lekcję ${orderIndex}`}
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