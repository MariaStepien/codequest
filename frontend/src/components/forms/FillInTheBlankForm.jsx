import { ChevronRight } from 'lucide-react';

/**
 * Form component for the Fill in the Blank task type
 * @param {Object} task the task object containing the sentence with [BLANK] tags and correct answers
 * @param {Function} onUpdate callback function to update the task data in the parent state
 */
export default function FillInTheBlankForm({ task, onUpdate }) {

    const handleSentenceChange = (e) => {
        const newSentence = e.target.value;
        const numBlanks = (newSentence.match(/\[BLANK\]/g) || []).length;
        
        const newCorrectAnswers = Array(numBlanks).fill('').map((_, index) => 
            task.correctAnswers[index] !== undefined ? task.correctAnswers[index] : ''
        );

        onUpdate({ 
            ...task, 
            sentence: newSentence,
            correctAnswers: newCorrectAnswers 
        });
    };

    const handleAnswerChange = (index, value) => {
        const newCorrectAnswers = [...task.correctAnswers];
        newCorrectAnswers[index] = value;
        onUpdate({ 
            ...task, 
            correctAnswers: newCorrectAnswers 
        });
    };

    const numBlanks = (task.sentence.match(/\[BLANK\]/g) || []).length;

    return (
        <div className="space-y-4 p-4 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
            <h4 className="font-semibold text-lg text-green-700">Edytor: Uzupełnianie Luki</h4>
            
            <div>
                <label htmlFor={`sentence-${task.id}`} className="block text-sm font-medium text-gray-700">
                    Zdanie z Lukami (użyj [BLANK] dla każdej luki)
                </label>
                <textarea
                    id={`sentence-${task.id}`}
                    name="sentence"
                    value={task.sentence}
                    onChange={handleSentenceChange}
                    rows="4"
                    required
                    className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border font-mono"
                    placeholder="W Java, klasa musi być zadeklarowana jako [BLANK] aby nie można było jej dziedziczyć."
                />
            </div>
            
            <p className="text-sm font-medium text-gray-600">
                Wykryto {numBlanks} {numBlanks === 1 ? 'lukę' : (numBlanks % 10 >= 2 && numBlanks % 10 <= 4 && (numBlanks < 10 || numBlanks > 20) ? 'luki' : 'luk')}.
            </p>

            <div className="space-y-3 pt-2 border-t border-green-200">
                <label className="block text-sm font-medium text-gray-700">Poprawne Odpowiedzi (jedna na lukę, w kolejności)</label>
                {Array.from({ length: numBlanks }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <ChevronRight className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <input
                            type="text"
                            value={task.correctAnswers[index] || ''}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            required
                            className="text-black flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder={`Odpowiedź dla Luki #${index + 1}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}