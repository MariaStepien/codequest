import MultipleChoiceForm from './forms/MultipleChoiceForm';
import TextBoxForm from './forms/TextBoxForm';
import FillInTheBlankForm from './forms/FillInTheBlankForm';
import MatchingPairsForm from './forms/MatchingPairsForm';
import OrderableListForm from './forms/OrderableListForm';
import CodeFixForm from './forms/CodeFixForm';

const TaskFormMap = {
    TextBox: TextBoxForm,
    MultipleChoice: MultipleChoiceForm,
    FillInTheBlank: FillInTheBlankForm,
    MatchingPairs: MatchingPairsForm,
    OrderableList: OrderableListForm,
    CodeFix: CodeFixForm,
};

export default function TaskEditor({ task, onUpdate }) {
    const TaskComponent = TaskFormMap[task.type];

    if (!TaskComponent) {
        return (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg">
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