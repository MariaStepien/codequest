export default function CodeFixForm({ task, onUpdate }) {
    
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        
        onUpdate({
            ...task,
            [name]: type === 'number' ? parseInt(value) : value
        });
    };

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
                    Kod bazowy (Zawiera lukę, która będzie edytowalna)
                </label>
                <textarea
                    id={`incorrectCode-${task.id}`}
                    name="incorrectCode"
                    value={task.incorrectCode || ''}
                    onChange={handleInputChange}
                    rows="8"
                    required
                    className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border font-mono text-sm"
                    placeholder='public class Main { public static void main(String[] args) { for (int i = 0 i < 10; i++) { ... } } }'
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor={`correctGapText-${task.id}`} className="block text-sm font-medium text-gray-700">
                        Poprawny tekst w luce (np. ";")
                    </label>
                    <input
                        id={`correctGapText-${task.id}`}
                        name="correctGapText"
                        value={task.correctGapText || ''}
                        onChange={handleInputChange}
                        required
                        className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border font-mono text-sm"
                        placeholder="Poprawna treść luki"
                    />
                </div>
            </div>

            <h5 className="font-semibold text-gray-700 mt-4">Definicja Luki w Kodzie:</h5>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor={`fixLineStart-${task.id}`} className="block text-sm font-medium text-gray-700">Linia (0-indexed)</label>
                    <input
                        id={`fixLineStart-${task.id}`}
                        name="fixLineStart"
                        type="number"
                        value={task.fixLineStart ?? ''}
                        onChange={handleInputChange}
                        required
                        className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                        placeholder="0"
                    />
                </div>
                <div>
                    <label htmlFor={`fixCharStart-${task.id}`} className="block text-sm font-medium text-gray-700">Znak POCZĄTEK</label>
                    <input
                        id={`fixCharStart-${task.id}`}
                        name="fixCharStart"
                        type="number"
                        value={task.fixCharStart ?? ''}
                        onChange={handleInputChange}
                        required
                        className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                        placeholder="21"
                    />
                </div>
                <div>
                    <label htmlFor={`fixCharEnd-${task.id}`} className="block text-sm font-medium text-gray-700">Znak KONIEC</label>
                    <input
                        id={`fixCharEnd-${task.id}`}
                        name="fixCharEnd"
                        type="number"
                        value={task.fixCharEnd ?? ''}
                        onChange={handleInputChange}
                        required
                        className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                        placeholder="22"
                    />
                </div>
            </div>
            
            <p className="text-xs text-gray-500 pt-2">
                Linie kodu są liczone od 0. Pozycje znaków również są liczone od 0 i są *wycinane* (end jest wyłączny), tak jak w funkcji `substring`.
            </p>
        </div>
    );
}