import React, { useEffect } from 'react';
import PropTypes from 'prop-types'; 

/**
 * A component to display a single sentence or piece of explanatory text
 * within a clearly defined, styled box.
 * * NOTE: This component automatically signals completion to the parent 
 * LevelTemplate component upon render, as it is non-interactive.
 * * @param {object} props
 * @param {string} props.sentence The text content to display.
 * @param {string} [props.bgColor='bg-indigo-100'] Tailwind class for background color.
 * @param {string} [props.borderColor='border-indigo-400'] Tailwind class for border color.
 * @param {function} props.onTaskComplete Callback to signal LevelTemplate (REQUIRED by LevelTemplate).
 */
export default function TextBox({ 
  sentence, 
  bgColor = 'bg-indigo-100', 
  borderColor = 'border-indigo-400',
  onTaskComplete // Add onTaskComplete prop
}) {
  
  // Use useEffect to signal completion immediately upon mounting
  useEffect(() => {
    // Signal to the LevelTemplate that this non-interactive task is complete
    onTaskComplete(true); 
  }, [onTaskComplete]); // Dependency array ensures it runs once when the component is created

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
      <p className="text-lg text-gray-800 font-medium leading-relaxed">
        {sentence}
      </p>
    </div>
  );
}

// Optional: Add PropTypes for robust development
TextBox.propTypes = {
  sentence: PropTypes.string.isRequired,
  bgColor: PropTypes.string,
  borderColor: PropTypes.string,
  onTaskComplete: PropTypes.func.isRequired, // onTaskComplete is now required
};