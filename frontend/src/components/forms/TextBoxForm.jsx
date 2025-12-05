export default function TextBoxForm({ task, onUpdate }) {
    const handleInputChange = (e) => {
        onUpdate({
            ...task,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="space-y-4 p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
            <h4 className="font-semibold text-lg text-blue-700">Edytor: Treść (Informacja)</h4>

            <div>
                <label htmlFor={`sentence-${task.id}`} className="block text-sm font-medium text-gray-700">
                    Treść Lekcji / Informacja
                </label>
                <textarea
                    id={`sentence-${task.id}`}
                    name="sentence"
                    value={task.sentence}
                    onChange={handleInputChange}
                    rows="6"
                    required
                    className="mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Wprowadź treść, którą użytkownik ma przeczytać."
                />
            </div>

            <div className="flex space-x-4">
                <div className="flex-1">
                    <label htmlFor={`bgColor-${task.id}`} className="block text-sm font-medium text-gray-700">
                        Klasa Koloru Tła (Tailwind - np. bg-blue-50)
                    </label>
                    <input
                        type="text"
                        id={`bgColor-${task.id}`}
                        name="bgColor"
                        value={task.bgColor}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                        placeholder="bg-indigo-100"
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor={`borderColor-${task.id}`} className="block text-sm font-medium text-gray-700">
                        Klasa Koloru Ramki (Tailwind - np. border-blue-500)
                    </label>
                    <input
                        type="text"
                        id={`borderColor-${task.id}`}
                        name="borderColor"
                        value={task.borderColor}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                        placeholder="border-indigo-400"
                    />
                </div>
            </div>
        </div>
    );
}