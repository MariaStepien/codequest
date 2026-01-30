import { useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * form component for the Code Fix task type
 * @param {Object} task the task object containing code, line/char offsets, and explanation
 * @param {Function} onUpdate callback function to update the task data in the parent state
 */
export default function CodeFixForm({ task, onUpdate }) {
    
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        
        onUpdate({
            ...task,
            [name]: type === 'number' ? parseInt(value) : value
        });
    };

    const isInvalidRange = (task.fixCharEnd ?? 0) < (task.fixCharStart ?? 0);

    const renderCodePreview = useMemo(() => {
        if (!task.incorrectCode || isInvalidRange) return null;

        const lines = task.incorrectCode.split('\n');
        const lineIdx = task.fixLineStart || 0;
        const charStart = task.fixCharStart || 0;
        const charEnd = task.fixCharEnd || 0;

        return (
            <div className="mt-4 p-4 bg-gray-900 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed border border-gray-700">
                <div className="text-gray-500 mb-2 border-b border-gray-700 pb-1 text-xs uppercase tracking-widest">Podgląd luki w kodzie:</div>
                {lines.map((line, idx) => {
                    if (idx === lineIdx) {
                        const before = line.substring(0, charStart);
                        const gap = line.substring(charStart, charEnd);
                        const after = line.substring(charEnd);

                        return (
                            <div key={idx} className="flex">
                                <span className="w-8 text-gray-600 select-none text-right mr-4">{idx}</span>
                                <pre className="text-white">
                                    <span>{before}</span>
                                    <span className="bg-yellow-500/40 text-yellow-200 border-b-2 border-yellow-500 px-0.5 rounded-t font-bold">
                                        {gap || ' '}
                                    </span>
                                    <span>{after}</span>
                                </pre>
                            </div>
                        );
                    }
                    return (
                        <div key={idx} className="flex">
                            <span className="w-8 text-gray-600 select-none text-right mr-4">{idx}</span>
                            <pre className="text-gray-500">{line || ' '}</pre>
                        </div>
                    );
                })}
            </div>
        );
    }, [task.incorrectCode, task.fixLineStart, task.fixCharStart, task.fixCharEnd, isInvalidRange]);

    return (
        <div className="space-y-4 p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
            <h4 className="font-semibold text-lg text-red-700">Edytor: Naprawa Kodu (Uzupełnianie Luki)</h4>
            
            <div>
                <label htmlFor={`instructions-${task.id}`} className="block text-sm font-medium text-gray-700">Instrukcje dla Użytkownika</label>
                <textarea
                    id={`instructions-${task.id}`}
                    name="instructions"
                    value={task.instructions || ''}
                    onChange={handleInputChange}
                    rows="2"
                    required
                    className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Wstaw poprawny operator logiczny w puste miejsce."
                />
            </div>

            <div>
                <label htmlFor={`incorrectCode-${task.id}`} className="block text-sm font-medium text-gray-700">
                    Kod bazowy (Cały kod z luką)
                </label>
                <textarea
                    id={`incorrectCode-${task.id}`}
                    name="incorrectCode"
                    value={task.incorrectCode || ''}
                    onChange={handleInputChange}
                    rows="8"
                    required
                    className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border font-mono text-sm"
                    placeholder='np. for (int i = 0; i < 10; i++)'
                />
            </div>

            {isInvalidRange ? (
                <div className="flex items-center space-x-2 p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                    <AlertCircle size={18} />
                    <span><strong>Błąd zakresu:</strong> Znak końca luki nie może być mniejszy niż znak początku!</span>
                </div>
            ) : renderCodePreview}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`correctGapText-${task.id}`} className="block text-sm font-medium text-gray-700">
                        Poprawny tekst w luce
                    </label>
                    <input
                        id={`correctGapText-${task.id}`}
                        name="correctGapText"
                        value={task.correctGapText || ''}
                        onChange={handleInputChange}
                        required
                        className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border font-mono text-sm"
                        placeholder="np. ;"
                    />
                </div>
            </div>

            <h5 className="font-semibold text-gray-700 mt-4">Definicja Luki w Kodzie:</h5>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Linia (0-indexed)</label>
                    <input
                        name="fixLineStart"
                        type="number"
                        value={task.fixLineStart ?? ''}
                        onChange={handleInputChange}
                        required
                        className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium ${isInvalidRange ? 'text-red-600' : 'text-gray-700'}`}>Znak POCZĄTEK</label>
                    <input
                        name="fixCharStart"
                        type="number"
                        value={task.fixCharStart ?? ''}
                        onChange={handleInputChange}
                        required
                        className={`text-black mt-1 block w-full shadow-sm rounded-md p-2 border ${isInvalidRange ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                </div>
                <div>
                    <label className={`block text-sm font-medium ${isInvalidRange ? 'text-red-600' : 'text-gray-700'}`}>Znak KONIEC</label>
                    <input
                        name="fixCharEnd"
                        type="number"
                        value={task.fixCharEnd ?? ''}
                        onChange={handleInputChange}
                        required
                        className={`text-black mt-1 block w-full shadow-sm rounded-md p-2 border ${isInvalidRange ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
                    />
                </div>
            </div>
            
            <p className="text-xs text-gray-500 pt-2 italic">
                Wskazówka: Znak na pozycji "end" nie jest wliczany do luki.
            </p>
        </div>
    );
}