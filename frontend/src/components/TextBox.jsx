import React from 'react';
import PropTypes from 'prop-types'; // Recommended for type checking props (apparently depricated and not used anymore?)

/**
 * A component to display a single sentence or piece of explanatory text
 * within a clearly defined, styled box.
 * * @param {object} props
 * @param {string} props.sentence The text content to display.
 * @param {string} [props.bgColor='bg-indigo-100'] Tailwind class for background color.
 * @param {string} [props.borderColor='border-indigo-400'] Tailwind class for border color.
 */
export default function TextBox({ 
  sentence, 
  bgColor = 'bg-indigo-100', 
  borderColor = 'border-indigo-400' 
}) {
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
};