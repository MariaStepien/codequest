import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import LevelButton from '../components/LevelButton';

export default function LevelSelectionPage() {
    // Current status of all levels
    const levelStatus = {
        1: true, 2: true, 3: true, 4: true, 
        5: true, 7: true, 8: false,
    };

    // Level positions defined in a normalized 0-100% coordinate system.
    const normalizedPositions = useMemo(() => ({
        1: { x: 10, y: 50 }, 
        2: { x: 30, y: 10 }, 
        3: { x: 30, y: 90 }, 
        4: { x: 50, y: 50 }, 
        5: { x: 70, y: 10 }, 
        7: { x: 70, y: 90 }, 
        8: { x: 90, y: 50 } 
    }), []);

    // Define the connections between levels
    const paths = useMemo(() => [
        [1, 2], [1, 3],
        [2, 4], [3, 4],
        [4, 5], [4, 7],
        [5, 8], [7, 8],
    ], []);

    // Button size information (64px)
    // We need to offset the position by half the button size (32px) to center the button.
    const levelButtonOffset = '32px'; 

    // --- SVG Drawing Logic ---
    const drawPaths = useMemo(() => {
        return paths.map(([startLevel, endLevel]) => {
            const start = normalizedPositions[startLevel];
            const end = normalizedPositions[endLevel];
            
            if (!start || !end) return null;

            // SVG coordinates are based on the container size, so we use 
            // the percentage values directly as the SVG viewbox (0-100) will scale with the container.
            return (
                <line 
                    key={`${startLevel}-${endLevel}`}
                    x1={`${start.x}%`} 
                    y1={`${start.y}%`} 
                    x2={`${end.x}%`} 
                    y2={`${end.y}%`} 
                    stroke="#8DD3F8" // Light pastel blue
                    strokeWidth="0.8" // Responsive stroke width (0.8% of viewbox)
                    strokeLinecap="round"
                />
            );
        }).filter(Boolean);
    }, [paths, normalizedPositions]);


    return (
        // Light background for the pastel theme
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 text-gray-800">
            <div className="mx-auto w-full max-w-7xl"> 
                
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 space-y-4 sm:space-y-0">
                    <h1 className="text-4xl font-extrabold text-blue-400">
                        The journey begins ✨
                    </h1>
                    <Link to="/" className="text-blue-400 hover:text-blue-500 transition duration-150 flex items-center space-x-2 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>Go back</span>
                    </Link>
                </header>

                {/* Level Map Container: Lighter card style */}
                <div className="border-4 border-blue-200 rounded-xl shadow-xl bg-white p-4 sm:p-6 md:p-8"> 
                    
                    {/* Responsive Map Area (50% height of its width) */}
                    <div className="relative w-full h-0 pt-[50%] overflow-hidden bg-gray-100 rounded-lg">
                        
                        {/* --- 1. SVG Path Layer (Drawn first) --- */}
                        <svg 
                            className="absolute inset-0 w-full h-full z-0" 
                            viewBox="0 0 100 100" // 0-100 viewbox matches our percentage positions
                            preserveAspectRatio="none" // Stretch to fit the container's 50% aspect ratio
                        >
                            {drawPaths}
                        </svg>

                        {/* --- 2. Level Buttons Layer (Positioned over the SVG) --- */}
                        
                        {Object.keys(normalizedPositions).map(level => {
                            const pos = normalizedPositions[level];
                            return (
                                <div 
                                    key={level} 
                                    className="absolute z-10"
                                    style={{
                                        // Center the 64px button on the percentage point
                                        left: `calc(${pos.x}% - ${levelButtonOffset})`,
                                        top: `calc(${pos.y}% - ${levelButtonOffset})`,
                                    }}
                                >
                                    <LevelButton 
                                        levelNumber={Number(level)} 
                                        isUnlocked={levelStatus[level]} 
                                    />
                                </div>
                            );
                        })}
                        
                    </div>
                </div>
            </div>
        </div>
    );
}