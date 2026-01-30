import { AlertTriangle } from 'lucide-react';

/**
 * A reusable confirmation modal component for handling user approval or rejection of an action.
 * @param {boolean} show controls the visibility of the modal.
 * @param {string} title the header text displayed at the top of the modal.
 * @param {string} message the descriptive text asking for user confirmation.
 * @param {Function} onConfirm callback executed when the user clicks the confirmation button.
 * @param {Function} onCancel callback executed when the user clicks the cancel/deny button.
 * @param {string} confirmText text label for the confirmation button.
 * @param {string} cancelText text label for the cancellation button.
 */
export default function ConfirmationModal({ 
    show, 
    title = "Potwierdzenie", 
    message, 
    onConfirm, 
    onCancel, 
    confirmText = "TAK", 
    cancelText = "Anuluj" 
}) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all animate-in zoom-in duration-200">
                <div className="flex items-center space-x-3 mb-4 text-red-600">
                    <AlertTriangle className="w-6 h-6" />
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                    {message}
                </p>
                
                <div className="flex space-x-3">
                    <button 
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}