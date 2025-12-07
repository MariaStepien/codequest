import { Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import TaskFormSelector from './TaskFormSelector';
import MultipleChoiceForm from './forms/MultipleChoiceForm';
import TextBoxForm from './forms/TextBoxForm';
import FillInTheBlankForm from './forms/FillInTheBlankForm';
import MatchingPairsForm from './forms/MatchingPairsForm';
import OrderableListForm from './forms/OrderableListForm';
import CodeFixForm from './forms/CodeFixForm';

let taskIdCounter = 1;
const createNewId = () => `task-${taskIdCounter++}-${Date.now()}`;

const TaskFormMap = {
    TextBox: TextBoxForm,
    MultipleChoice: MultipleChoiceForm,
    FillInTheBlank: FillInTheBlankForm,
    MatchingPairs: MatchingPairsForm,
    OrderableList: OrderableListForm,
    CodeFix: CodeFixForm,
};

const getInitialTask = (type) => {
    const common = { id: createNewId(), type: type };

    switch (type) {
        case 'TextBox':
            return {
                ...common,
                sentence: 'Wprowadź treść informacyjną dla użytkownika.',
                bgColor: 'bg-blue-50',
                borderColor: 'border-blue-500'
            };
        case 'MultipleChoice':
            return {
                ...common,
                question: 'Wybierz poprawną odpowiedź:',
                options: ['Opcja 1', 'Opcja 2', 'Opcja 3'],
                correctAnswer: 'Opcja 1'
            };
        case 'FillInTheBlank':
            return {
                ...common,
                sentence: 'Pamiętaj o użyciu [BLANK] w zdaniu. Np: Java to język [BLANK].',
                correctAnswers: ['obiektowy'] 
            };
        case 'MatchingPairs':
            return {
                ...common,
                prompt: 'Dopasuj terminy do definicji.',
                items: [
                    { key: 'pair-1', left: 'Klasa', right: 'Szablon Obiektu' },
                    { key: 'pair-2', left: 'Obiekt', right: 'Instancja Klasy' },
                ]
            };
        case 'OrderableList':
            const initialOrder = [
                { id: 'i1', text: 'Deklaracja zmiennej' },
                { id: 'i2', text: 'Inicjalizacja zmiennej' }
            ];
            return {
                ...common,
                prompt: 'Uporządkuj proces:',
                correctOrder: initialOrder,
                initialItems: initialOrder
            };
        case 'CodeFix':
            return {
                ...common,
                instructions: 'Popraw błąd składniowy w kodzie.',
                incorrectCode: 'console.log("Nie działa");',
                fixedCode: 'System.out.println("Działa");'
            };
        default:
            return common;
    }
};

function TaskFormWrapper({ task, onUpdate }) {
    const TaskComponent = TaskFormMap[task.type];

    if (!TaskComponent) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg text-sm">
                Nieznany typ zadania: **{task.type}**
            </div>
        );
    }

    return (
        <TaskComponent 
            task={task} 
            onUpdate={onUpdate} 
        />
    );
}


export default function TaskEditor({ tasks, onTasksChange, disabled }) {

    const handleAddTask = (type) => {
        const newTask = getInitialTask(type);
        const newTasks = [...tasks, newTask];
        onTasksChange(newTasks);
    };

    const handleRemoveTask = (taskId) => {
        const newTasks = tasks.filter(task => task.id !== taskId);
        onTasksChange(newTasks);
    };

    const handleUpdateTask = (updatedTask) => {
        const newTasks = tasks.map(task =>
            task.id === updatedTask.id ? updatedTask : task
        );
        onTasksChange(newTasks);
    };

    const handleMoveTask = (index, direction) => {
        const newTasks = [...tasks];
        const targetIndex = index + (direction === 'up' ? -1 : 1);
        
        if (targetIndex >= 0 && targetIndex < newTasks.length) {
            [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
            onTasksChange(newTasks);
        }
    };
    
    return (
        <div className="border border-indigo-200 rounded-lg p-4 bg-indigo-50 space-y-4">
            
            <h3 className="font-semibold text-gray-700">Dodaj Nowe Zadanie:</h3>
            <TaskFormSelector onAddTask={handleAddTask} />

            {tasks.length === 0 && (
                <p className="text-center text-gray-500 py-4 border-t pt-4">Brak zadań w lekcji. Dodaj pierwsze zadanie powyżej.</p>
            )}

            <div className="space-y-6 pt-4 border-t border-indigo-200">
                {tasks.map((task, index) => (
                    <div 
                        key={task.id} 
                        className="bg-white p-4 shadow-xl rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-2xl"
                        style={{ opacity: disabled ? 0.6 : 1 }}
                    >
                        <div className="flex justify-between items-center pb-3 border-b mb-3">
                            <h3 className="text-xl font-extrabold text-indigo-700">
                                Zadanie {index + 1}: <span className="text-gray-600 font-semibold">{task.type}</span>
                            </h3>
                            <div className="flex items-center space-x-2">
                                <button
                                    type="button"
                                    onClick={() => handleMoveTask(index, 'up')}
                                    disabled={index === 0 || disabled}
                                    className={`p-2 rounded-full transition-colors ${index === 0 || disabled ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                                    title="Przesuń w górę"
                                >
                                    <ArrowUp className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleMoveTask(index, 'down')}
                                    disabled={index === tasks.length - 1 || disabled}
                                    className={`p-2 rounded-full transition-colors ${index === tasks.length - 1 || disabled ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-100'}`}
                                    title="Przesuń w dół"
                                >
                                    <ArrowDown className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTask(task.id)}
                                    disabled={disabled}
                                    className="p-2 rounded-full text-red-600 hover:bg-red-100 disabled:text-gray-400 transition-colors"
                                    title="Usuń zadanie"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        
                        <TaskFormWrapper 
                            task={task} 
                            onUpdate={handleUpdateTask} 
                        />
                        
                    </div>
                ))}
            </div>
        </div>
    );
}