import { useEffect } from 'react';
import PropTypes from 'prop-types'; 

/**
 * Component for displaying static instructional text or information within a lesson
 * @param {string} sentence The text content to be displayed
 * @param {string} bgColor Tailwind CSS background color class
 * @param {string} borderColor Tailwind CSS border color class
 * @param {Function} onTaskComplete Callback function that automatically signals task completion on mount
 */
export default function TextBox({ 
  sentence, 
  bgColor = 'bg-slate-900', 
  borderColor = 'border-indigo-500',
  onTaskComplete
}) {
  
  useEffect(() => {
    onTaskComplete(true); 
  }, [onTaskComplete]);

  return (
    <div 
      className={`
        p-6 
        border-l-8 
        ${borderColor} 
        ${bgColor} 
        rounded-r-lg 
        shadow-md 
        transition duration-300 
        hover:shadow-lg
      `}
    >
      <div className="text-sm md:text-base text-gray-900 font-mono whitespace-pre-wrap leading-relaxed">
        {sentence}
      </div>
    </div>
  );
}

TextBox.propTypes = {
  sentence: PropTypes.string.isRequired,
  bgColor: PropTypes.string,
  borderColor: PropTypes.string,
  onTaskComplete: PropTypes.func.isRequired,
};