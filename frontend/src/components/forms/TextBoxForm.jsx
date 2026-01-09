export default function TextBoxForm({ task, onUpdate }) {
    const colorOptions = [
        { name: 'Czerwony', bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-700' },
        { name: 'Żółty', bg: 'bg-yellow-100', border: 'border-yellow-500', text: 'text-yellow-700' },
        { name: 'Zielony', bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-700' },
        { name: 'Niebieski', bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-700' },
        { name: 'Fioletowy', bg: 'bg-purple-100', border: 'border-purple-500', text: 'text-purple-700' },
    ];

    const handleInputChange = (e) => {
        onUpdate({
            ...task,
            [e.target.name]: e.target.value
        });
    };

    const handleColorChange = (option) => {
        onUpdate({
            ...task,
            bgColor: option.bg,
            borderColor: option.border
        });
    };

    return (
        <div className={`space-y-4 p-4 border-l-4 rounded-r-lg transition-colors ${task.borderColor} ${task.bgColor}`}>
            <h4 className="font-semibold text-lg text-gray-800">Edytor: Treść / Kod</h4>

            <div>
                <label htmlFor={`sentence-${task.id}`} className="block text-sm font-medium text-gray-700">
                    Treść lub fragment kodu
                </label>
                <textarea
                    id={`sentence-${task.id}`}
                    name="sentence"
                    value={task.sentence}
                    onChange={handleInputChange}
                    rows="8"
                    required
                    className="text-black font-mono mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border bg-white"
                    placeholder="Wklej tutaj tekst lub kod z zachowaniem formatowania."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wybierz kolorystykę zadania
                </label>
                <div className="flex flex-wrap gap-3">
                    {colorOptions.map((option) => (
                        <button
                            key={option.name}
                            type="button"
                            onClick={() => handleColorChange(option)}
                            className={`
                                px-4 py-2 rounded-md border-2 transition-all
                                ${option.bg} ${option.border} ${option.text}
                                ${task.bgColor === option.bg ? 'ring-2 ring-offset-2 ring-indigo-500 font-bold' : 'opacity-70 hover:opacity-100'}
                            `}
                        >
                            {option.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}