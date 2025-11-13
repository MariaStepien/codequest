// src/pages/LevelOneTheAmuletOfCode.jsx
import React from 'react';
import LevelTemplate from '../components/LevelTemplate'; // Assuming path
import TextBox from '../components/TextBox';
import MultipleChoice from '../components/MultipleChoice';
import FillInTheBlank from '../components/FillInTheBlank';
import MatchingPairs from '../components/MatchingPairs';
import OrderableList from '../components/OrderableList';

// Data for OrderableList (Correct sequence)
const procedureSteps = [
    { id: 's1', text: "1. Gather the Mana (Allocate Memory)." },
    { id: 's2', text: "2. Define the Spell's Power (Initialize Variable)." },
    { id: 's3', text: "3. Cast the Incantation (Function Call)." },
    { id: 's4', text: "4. Observe the Result (Return Value)." },
];

export default function LevelOneTheAmuletOfCode() {
    return (
        <LevelTemplate 
            levelTitle="Level 1: The Amulet of Code" 
            nextLevelPath="/level/2" // Replace with your actual next level path
        >
            {/* TASK 1: INTRODUCTION - TEXTBOX */}
            <TextBox 
                sentence="Welcome, young Mage! To activate the powerful Amulet of Code, you must prove your understanding of the foundational Arcane Runes (data types and variables). The first step is simple observation."
                bgColor="bg-blue-100" 
                borderColor="border-blue-400"
            />

            {/* TASK 2: MULTIPLE CHOICE - DATA TYPES */}
            <MultipleChoice
                question="Which ancient Rune (data type) should be used to store a creature's name, like 'Gargoyle'?"
                options={['Number Rune', 'Text Rune', 'Boolean Rune', 'Empty Rune']}
                correctAnswer="Text Rune"
            />

            {/* TASK 3: FILL IN THE BLANK - VARIABLES */}
            <FillInTheBlank
                sentence="A [BLANK] is a named container, much like a treasure chest, used to hold different types of magical essence, such as a [BLANK] or a spell's [BLANK]."
                correctAnswers={["Variable", "Number", "Text"]}
            />

            {/* TASK 4: MATCHING PAIRS - CORE CONCEPTS */}
            <MatchingPairs
                items={[
                    { key: 'k1', left: 'Boolean Rune', right: 'Can only be TRUE or FALSE (Yes/No).' },
                    { key: 'k2', left: 'Text Rune', right: 'A sequence of characters (a word or sentence).' },
                    { key: 'k3', left: 'Number Rune', right: 'A value used for counting or mathematics.' },
                ]}
            />

            {/* TASK 5: ORDERABLE LIST - PROGRAM EXECUTION */}
            <OrderableList
                initialItems={[
                    procedureSteps[2], // Cast the Incantation
                    procedureSteps[0], // Gather the Mana
                    procedureSteps[3], // Observe the Result
                    procedureSteps[1], // Define the Spell's Power
                ]}
                correctOrder={procedureSteps} // The correct, sequential array
            />

            {/* TASK 6: CONCLUSION - TEXTBOX (Final Check) */}
             <TextBox 
                sentence="Excellent work! You have mastered the basics of summoning and storing magical essence. Once you click 'Next Task', the Amulet of Code will be fully activated, and you can proceed to the next realm."
                bgColor="bg-green-100" 
                borderColor="border-green-400"
            />
        </LevelTemplate>
    );
}