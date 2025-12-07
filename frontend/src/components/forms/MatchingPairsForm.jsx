import { MinusCircle, PlusCircle, ArrowLeftRight } from 'lucide-react';

const createNewPair = () => ({
    key: `pair-${Date.now()}`, 
    left: 'Element A', 
    right: 'Element B'
});

export default function MatchingPairsForm({ task, onUpdate }) {
    
    const handlePromptChange = (e) => {
        onUpdate({ 
            ...task, 
            prompt: e.target.value 
        });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...task.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };
        onUpdate({ 
            ...task, 
            items: newItems 
        });
    };

    const handleAddItem = () => {
        onUpdate({ 
            ...task, 
            items: [...task.items, createNewPair()] 
        });
    };

    const handleRemoveItem = (index) => {
        if (task.items.length <= 1) return;
        onUpdate({ 
            ...task, 
            items: task.items.filter((_, i) => i !== index)
        });
    };

    return (
        <div className="space-y-4 p-4 border-l-4 border-purple-500 bg-purple-50 rounded-r-lg">
            <h4 className="font-semibold text-lg text-purple-700">Edytor: Łączenie w Pary</h4>
            
            <div>
                <label htmlFor={`prompt-${task.id}`} className="block text-sm font-medium text-gray-700">Instrukcja (Prompt)</label>
                <input
                    type="text"
                    id={`prompt-${task.id}`}
                    name="prompt"
                    value={task.prompt}
                    onChange={handlePromptChange}
                    required
                    className="text-black mt-1 block w-full shadow-sm border-gray-300 rounded-md p-2 border"
                    placeholder="Połącz definicje z ich terminami."
                />
            </div>

            <div className="space-y-3 pt-2 border-t border-purple-200">
                <label className="block text-sm font-medium text-gray-700">Zdefiniowane Pary (Left - Right)</label>
                {task.items.map((item, index) => (
                    <div key={item.key} className="flex items-center space-x-2 bg-white p-2 rounded-md shadow-sm border">
                        <span className="text-sm font-bold text-gray-500 w-8 text-center">{index + 1}.</span>
                        
                        <input
                            type="text"
                            value={item.left}
                            onChange={(e) => handleItemChange(index, 'left', e.target.value)}
                            required
                            className="text-black flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="Element Lewy (np. Klasa)"
                        />
                        
                        <ArrowLeftRight className="w-5 h-5 text-purple-600 flex-shrink-0" />

                        <input
                            type="text"
                            value={item.right}
                            onChange={(e) => handleItemChange(index, 'right', e.target.value)}
                            required
                            className="text-black flex-1 shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="Element Prawy (np. Szablon Obiektu)"
                        />

                        <button 
                            type="button" 
                            onClick={() => handleRemoveItem(index)} 
                            disabled={task.items.length <= 1}
                            className="text-red-500 hover:text-red-700 disabled:text-gray-400 p-1"
                            title="Usuń parę"
                        >
                            <MinusCircle className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center space-x-1 mt-2 text-sm text-purple-600 hover:text-purple-800"
                >
                    <PlusCircle className="w-4 h-4" />
                    <span>Dodaj Parę</span>
                </button>
            </div>
        </div>
    );
}