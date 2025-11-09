import React from 'react';
import { Link } from 'react-router-dom';
import LevelButton from '../components/LevelButton';
import PathLine from '../components/PathLine';

export default function LevelSelectionPage() {
    // Current status of all levels (used for the LevelButton component)
    const levelStatus = {
        1: true, 2: true, 3: true, 4: true, 
        5: true, 7: true, 8: false,
    };

    // Fixed pixel positions for the centers of the buttons
    // 200px spacing between columns, 200px spacing between rows
    const positions = {
        1: { top: '250px', left: '100px' }, // Column 1
        
        2: { top: '50px', left: '300px' }, // Column 2 Top
        3: { top: '450px', left: '300px' }, // Column 2 Bottom
        
        4: { top: '250px', left: '500px' }, // Column 3 (Center)
        
        5: { top: '50px', left: '700px' }, // Column 4 Top
        7: { top: '450px', left: '700px' }, // Column 4 Bottom
        
        8: { top: '250px', left: '900px' } // Column 5 (End)
    };

    // The fixed width of the content area. If this is wider than the screen, a scrollbar appears.
    const levelMapWidth = '1100px'; 

    return (
        <div className="min-h-screen bg-teal-300 p-8 text-white">
            <div className="mx-auto w-full"> 
                
                <header className="flex justify-start items-center mb-10 space-x-6 pl-4 md:pl-10">
                    <Link to="/" className="text-indigo-400 hover:text-indigo-300 transition duration-150 flex items-center">
                        ← Go back
                    </Link>
                    <h1 className="text-4xl font-extrabold text-indigo-300">
                        The journey begins
                    </h1>
                </header>

                {/* Scrolling Wrapper: This div controls the horizontal scrollbar */}
                <div className="overflow-x-auto border-2 border-white-700 rounded-lg"> 
                    
                    {/* Fixed Map Container: All children are positioned relative to this fixed width */}
                    <div 
                        className="relative bg-lime-200 min-h-[600px] p-4"
                        style={{ width: levelMapWidth }}
                    >
                        
                        {/* --- LEVEL PATH LINES (Fixed pixel widths and rotation) --- */}
                        
                        {/* Width of 245px is calculated to bridge a 200px gap plus half a button size on each side */}
                        
                        {/* 1 -> 2 (Up-Right) */}
                        <PathLine top="200px" left="150px" width="195px" rotation="-45deg" />
                        
                        {/* 1 -> 3 (Down-Right) */}
                        <PathLine top="300px" left="150px" width="195px" rotation="45deg" />

                        {/* 2 -> 4 (Down-Right) */}
                        <PathLine top="60px" left="375px" width="195px" rotation="45deg" />

                        {/* 3 -> 4 (Up-Right) */}
                        <PathLine top="450px" left="375px" width="195px" rotation="-45deg" />

                        {/* 4 -> 5 (Up-Right) */}
                        <PathLine top="200px" left="550px" width="195px" rotation="-45deg" />
                        
                        {/* 4 -> 7 (Down-Right) */}
                        <PathLine top="300px" left="550px" width="195px" rotation="45deg" />

                        {/* 5 -> 8 (Down-Right) */}
                        <PathLine top="50px" left="775px" width="195px" rotation="45deg" />
                        
                        {/* 7 -> 8 (Up-Right) */}
                        <PathLine top="450px" left="775px" width="195px" rotation="-45deg" />

                        {/* --- LEVEL BUTTONS (Use fixed pixel positions) --- */}
                        
                        {Object.keys(positions).map(level => (
                            <div key={level} className="absolute" style={positions[level]}>
                                <LevelButton levelNumber={Number(level)} isUnlocked={levelStatus[level]} />
                            </div>
                        ))}
                        
                    </div>
                </div>
            </div>
        </div>
    );
}