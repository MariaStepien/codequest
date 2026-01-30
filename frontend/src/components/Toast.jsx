import { CheckCircle, XCircle } from 'lucide-react';

/**
 * Notification component for displaying brief success or error messages at the top of the screen
 * @param {boolean} show Controls whether the toast is visible
 * @param {string} message The text message to display
 * @param {boolean} isError Determines the color scheme (red for error, green for success)
 */
export default function Toast({ show, message, isError }) {
    if (!show) return null;

    return (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className={`px-6 py-3 rounded-full shadow-2xl border text-white font-medium flex items-center space-x-3 ${
                isError ? 'bg-red-500 border-red-600' : 'bg-green-500 border-green-600'
            }`}>
                {isError ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <span>{message}</span>
            </div>
        </div>
    );
}