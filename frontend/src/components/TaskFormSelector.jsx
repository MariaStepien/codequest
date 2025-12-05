import { useState } from 'react';
import { PlusCircle } from 'lucide-react';

const availableTaskTypes = [
    { type: 'TextBox', name: 'Treść (Informacja)' },
    { type: 'MultipleChoice', name: 'Wielokrotny Wybór' },
    { type: 'FillInTheBlank', name: 'Uzupełnianie Luki' },
    { type: 'MatchingPairs', name: 'Łączenie w Pary' },
    { type: 'OrderableList', name: 'Uporządkuj Listę' },
    { type: 'CodeFix', name: 'Poprawa Kodu' },
];

export default function TaskFormSelector({ onAddTask }) {
    const [selectedType, setSelectedType] = useState(availableTaskTypes[0].type);

    const handleAdd = () => {
        if (selectedType) {
            onAddTask(selectedType);
        }
    };

    return (
        <div className="flex items-center space-x-4 p-4 border-t">
            <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
                {availableTaskTypes.map(task => (
                    <option key={task.type} value={task.type}>
                        {task.name}
                    </option>
                ))}
            </select>
            <button
                type="button"
                onClick={handleAdd}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition"
            >
                <PlusCircle className="w-5 h-5" />
                <span>Dodaj Zadanie</span>
            </button>
        </div>
    );
}