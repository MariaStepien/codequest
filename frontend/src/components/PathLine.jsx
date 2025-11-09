// src/components/PathLine.jsx
import React from 'react';
import PropTypes from 'prop-types';

/**
 * A dedicated component for drawing a single line segment on the level map.
 * @param {object} props
 * @param {string} props.top CSS 'top' value for vertical placement (e.g., '10%').
 * @param {string} props.left CSS 'left' value for horizontal placement (e.g., '15%').
 * @param {string} props.width CSS 'width' value for line length (e.g., '20%').
 * @param {string} props.rotation CSS 'transform: rotate' value (e.g., '-30deg').
 */
export default function PathLine({ top, left, width, rotation }) {
  const style = {
    top: top,
    left: left,
    width: width,
    transform: `translateY(32px) rotate(${rotation})`, // translateY(32px) centers it on the 64px button
  };

  return (
    <div
      className="absolute h-[2px] bg-indigo-500 origin-top-left"
      style={style}
    />
  );
}

PathLine.propTypes = {
  top: PropTypes.string.isRequired,
  left: PropTypes.string.isRequired,
  width: PropTypes.string.isRequired,
  rotation: PropTypes.string.isRequired,
};