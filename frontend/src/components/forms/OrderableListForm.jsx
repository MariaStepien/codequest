import { MinusCircle, PlusCircle, ChevronsUp, ChevronsDown } from 'lucide-react';

const createNewItem = (index) => ({
    id: `item-${Date.now()}-${index}`, 
    text: `Nowy element ${index + 1}`
});

export default function OrderableListForm({ task, onUpdate }) {
    
    const handlePromptChange = (e) => {
        onUpdate({ 
            ...task, 
            prompt: e.target.value 
        });
    };

    const handleItemTextChange = (index, value) => {
        const newCorrectOrder = [...task.correctOrder];
        newCorrectOrder[index] = {
            ...newCorrectOrder[index],
            text: value
        };
        
        onUpdate({ 
            ...task, 
            correctOrder: newCorrectOrder,
            initialItems: newCorrectOrder
        });
    };

    const handleAddItem = () => {
        const index = task.correctOrder.length;
        const newItem = createNewItem(index);
        const newCorrectOrder = [...task.correctOrder, newItem];
        
        onUpdate({ 
            ...task, 
            correctOrder: newCorrectOrder,
            initialItems: newCorrectOrder
        });
    };

    const handleRemoveItem = (index) => {
        if (task.correctOrder.length <= 1) return; 
        
        const newCorrectOrder = task.correctOrder.filter((_, i) => i !== index);
        
        onUpdate({ 
            ...task, 
            correctOrder: newCorrectOrder,
            initialItems: newCorrectOrder
        });
    };
    
    const handleMoveItem = (index, direction) => {
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < task.correctOrder.length) {
            const newCorrectOrder = [...task.correctOrder];
            [newCorrectOrder[index], newCorrectOrder[newIndex]] = 
            [newCorrectOrder[newIndex], newCorrectOrder[index]];
            
            onUpdate({ 
                ...task, 
                correctOrder: newCorrectOrder,
                initialItems: newCorrectOrder
            });
        }
    };

    return (
        <div className="space-y-4 p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded-r-lg">
            <h4 className="font-semibold text-lg text-yellow-800">Edytor: Uporządkowanie Listy</h4>
            
            <div>
                <label htmlFor={`prompt-${task.id}`} className="block text-sm font-medium text-gray-700">Instrukcja (Prompt)</label>
                <input
                    type="text"
                    id={`prompt-${task.id}`}
                    name="prompt"
                    value={task.prompt}
                    onChange={handlePromptChange}
                    required
                    className="mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Ułóż kroki w poprawnej kolejności."
                />
            </div>

            <div className="space-y-2 pt-2 border-t border-yellow-200">
                <label className="block text-sm font-medium text-gray-700">
                    Poprawna Kolejność Elementów ({task.correctOrder.length})
                </label>
                {task.correctOrder.map((item, index) => (
                    <div key={item.id} className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm border">
                        <div className="flex flex-col space-y-1">
                            <button 
                                type="button" 
                                onClick={() => handleMoveItem(index, -1)} 
                                disabled={index === 0}
                                className="p-0.5 rounded text-gray-500 hover:text-green-600 disabled:text-gray-300"
                                title="Przenieś w górę"
                            >
                                <ChevronsUp className="w-4 h-4" />
                            </button>
                            <button 
                                type="button" 
                                onClick={() => handleMoveItem(index, 1)} 
                                disabled={index === task.correctOrder.length - 1}
                                className="p-0.5 rounded text-gray-500 hover:text-green-600 disabled:text-gray-300"
                                title="Przenieś w dół"
                            >
                                <ChevronsDown className="w-4 h-4" />
                            </button>
                        </div>

                        <span className="font-bold text-lg text-yellow-700 w-6 text-center">{index + 1}.</span>
                        
                        <input
                            type="text"
                            value={item.text}
                            onChange={(e) => handleItemTextChange(index, e.target.value)}
                            required
                            className="flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder={`Krok ${index + 1}`}
                        />

                        <button 
                            type="button" 
                            onClick={() => handleRemoveItem(index)} 
                            disabled={task.correctOrder.length <= 1}
                            className="text-red-500 hover:text-red-700 disabled:text-gray-400 p-1"
                            title="Usuń element"
                        >
                            <MinusCircle className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 mt-2 text-sm text-yellow-700 hover:text-yellow-900"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Dodaj Element</span>
                </button>
            </div>
        </div>
    );
}