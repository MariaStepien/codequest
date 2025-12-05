import { MinusCircle } from 'lucide-react';

export default function MultipleChoiceForm({ task, onUpdate }) {

    const handleInputChange = (e) => {
        onUpdate({ 
            ...task, 
            [e.target.name]: e.target.value 
        });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...task.options];
        newOptions[index] = value;
        onUpdate({ 
            ...task, 
            options: newOptions 
        });
    };

    const handleAddOption = () => {
        onUpdate({ 
            ...task, 
            options: [...task.options, `Opcja ${task.options.length + 1}`] 
        });
    };

    const handleRemoveOption = (index) => {
        if (task.options.length <= 2) return;
        
        const newOptions = task.options.filter((_, i) => i !== index);
        
        let newCorrectAnswer = task.correctAnswer;
        if (!newOptions.includes(task.correctAnswer)) {
            newCorrectAnswer = newOptions.length > 0 ? newOptions[0] : '';
        }
            
        onUpdate({ 
            ...task, 
            options: newOptions,
            correctAnswer: newCorrectAnswer
        });
    };

    return (
        <div className="space-y-4 p-4 border-l-4 border-indigo-500 bg-indigo-50 rounded-r-lg">
            <h4 className="font-semibold text-lg text-indigo-700">Edytor: Wielokrotny Wybór</h4>
            
            <div>
                <label htmlFor={`question-${task.id}`} className="block text-sm font-medium text-gray-700">Pytanie</label>
                <textarea
                    id={`question-${task.id}`}
                    name="question"
                    value={task.question}
                    onChange={handleInputChange}
                    rows="3"
                    required
                    className="mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Wpisz treść pytania (np. Jaki jest wynik 2+2?)"
                />
            </div>

            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Opcje (Wybierz jedną jako poprawną)</label>
                {task.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-white p-2 rounded-md border">
                        <input
                            type="radio"
                            name={`correctAnswer-${task.id}`}
                            value={option}
                            checked={task.correctAnswer === option}
                            onChange={() => onUpdate({ ...task, correctAnswer: option })}
                            className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                            title="Ustaw jako poprawną odpowiedź"
                        />
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(index, e.target.value)}
                            required
                            className="flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder={`Opcja ${index + 1}`}
                        />
                        <button 
                            type="button" 
                            onClick={() => handleRemoveOption(index)} 
                            disabled={task.options.length <= 2}
                            className="text-red-500 hover:text-red-700 disabled:text-gray-400 p-1"
                            title="Usuń opcję"
                        >
                            <MinusCircle className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddOption}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                    + Dodaj Opcję
                </button>
            </div>
            
            <p className="text-sm font-medium text-green-600 mt-2 border-t pt-2">
                Aktualna poprawna odpowiedź: **{task.correctAnswer || 'Nie wybrano'}**
            </p>
        </div>
    );
}