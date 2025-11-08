// src/pages/TestLevelPage.jsx (or similar)

import React from 'react';
import TextBox from '../components/TextBox'; // Adjust path
import OrderableList from '../components/OrderableList'; // Adjust path
import FillInTheBlank from '../components/FillInTheBlank';
import MatchingPairs from '../components/MatchingPairs';
import MultipleChoice from '../components/MultipleChoice';

// Define the steps for this specific test level
const levelSteps = [
    { id: 'c1', text: "a=5" },
    { id: 'c2', text: "else:" },
    { id: 'c3', text: "if true:" },
    { id: 'c4', text: "a=4" },
];

const vocabularyMatch = [
    { key: 'A', left: 'Configuration', right: 'The settings that determine system behavior.' },
    { key: 'B', left: 'Debug', right: 'Identify and remove errors from software.' },
    { key: 'C', left: 'Ping', right: 'A command to test network connection.' },
]

export default function TestLevelPage() {
    // Function to handle the final ordered list (e.g., to send to an API for validation)
    const handleFinalOrder = (orderedItems) => {
        console.log("The user's final ordering is:", orderedItems);
        // Add your logic here (e.g., comparing to the correct sequence)
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-10">
                <h1 className="text-4xl font-extrabold text-gray-900 text-center">
                    Level 1: System Startup Sequence
                </h1>

                {/* 1. Instruction Box Component */}
                <TextBox
                    sentence="The steps below are mixed up. Use the Up (▲) and Down (▼) buttons to arrange them in the correct operational sequence."
                    bgColor="bg-blue-50"
                    borderColor="border-blue-400"
                />

                {/* 2. Orderable Task Component */}
                <OrderableList 
                    initialItems={levelSteps} 
                    onOrderChange={handleFinalOrder}
                />

                <TextBox
                    sentence='Code below is missing the following words: if, else, while, true, false, if'
                    bgColor='bg-purple-50'
                    borderColor='border-blue-400'
                />
                <FillInTheBlank
                    sentence="if [BLANK]:"
                    correctAnswers={['true']}
                />

                <TextBox
                    sentence='Connect the following into pairs:'
                    bgColor='bg-purple-50'
                    borderColor='border-blue-400'
                />

                <MatchingPairs
                    items={vocabularyMatch}
                />

                <MultipleChoice
                    question="Which command is primarily used to check if a remote server is reachable?"
                    options={[
                        "ipconfig", 
                        "traceroute", 
                        "ping", 
                        "netstat"
                    ]}
                    correctAnswer="ping"
                />

                {/* Optional: Navigation Button */}
                {/* <button className="mt-8 text-indigo-600">Go back to options</button> */}
            </div>
        </div>
    );
}