export default function CodeFixForm({ task, onUpdate }) {
    
    const handleInputChange = (e) => {
        onUpdate({
            ...task,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="space-y-4 p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
            <h4 className="font-semibold text-lg text-red-700">Edytor: Naprawa Kodu</h4>
            
            <div>
                <label htmlFor={`instructions-${task.id}`} className="block text-sm font-medium text-gray-700">Instrukcje dla Użytkownika</label>
                <textarea
                    id={`instructions-${task.id}`}
                    name="instructions"
                    value={task.instructions}
                    onChange={handleInputChange}
                    rows="2"
                    required
                    className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Popraw błąd w pętli for, aby drukowała 10 razy."
                />
            </div>

            <div>
                <label htmlFor={`incorrectCode-${task.id}`} className="block text-sm font-medium text-gray-700">
                    Kod Niepoprawny (Wyświetlany użytkownikowi jako startowy)
                </label>
                <textarea
                    id={`incorrectCode-${task.id}`}
                    name="incorrectCode"
                    value={task.incorrectCode}
                    onChange={handleInputChange}
                    rows="8"
                    required
                    className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border font-mono text-sm"
                    placeholder="public class Main { ... }"
                />
            </div>

            <div>
                <label htmlFor={`fixedCode-${task.id}`} className="block text-sm font-medium text-gray-700">
                    Kod Poprawny (Wymagana Poprawna Odpowiedź)
                </label>
                <textarea
                    id={`fixedCode-${task.id}`}
                    name="fixedCode"
                    value={task.fixedCode}
                    onChange={handleInputChange}
                    rows="8"
                    required
                    className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border font-mono text-sm bg-gray-100"
                    placeholder="public class Main { ... }"
                />
            </div>
        </div>
    );
}