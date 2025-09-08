import React, { useState, useEffect } from 'react';

// --- Data from your reference code ---
const scenario = {
  id: 1,
  sentence: "The teacher gives instructions during a fire drill siren.",
};

const barriers = ["🧱 Noise", "🗣️ Language", "💓 Emotions"];

// --- Words to be highlighted in the animation ---
const wordsToSelect = ["fire", "drill", "siren."];


// --- Reusable Barrier Option Component ---
const BarrierOption = ({ text, isSelected }) => (
    <button
        className={`w-full text-center px-4 py-3 text-white rounded-lg font-medium shadow-md transition-all duration-300 border-2 ${isSelected ? 'bg-green-600 border-green-400' : 'bg-gray-700 border-gray-600'}`}
    >
        {text}
    </button>
);


// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State to manage the selections
    const [selectedWords, setSelectedWords] = useState([]);
    const [selectedBarrier, setSelectedBarrier] = useState(null);

    useEffect(() => {
        let timeouts = [];

        const startAnimationCycle = () => {
            // 1. Reset state for the new loop
            setSelectedWords([]);
            setSelectedBarrier(null);

            // 2. Animate word selection in sequence
            timeouts.push(setTimeout(() => setSelectedWords([wordsToSelect[0]]), 1000));
            timeouts.push(setTimeout(() => setSelectedWords(prev => [...prev, wordsToSelect[1]]), 1750));
            timeouts.push(setTimeout(() => setSelectedWords(prev => [...prev, wordsToSelect[2]]), 2500));

            // 3. Animate barrier selection after words
            timeouts.push(setTimeout(() => setSelectedBarrier(barriers[0]), 3500));
        };

        // Start the first animation cycle
        startAnimationCycle();
        
        // Set the interval for the entire loop to repeat
        const mainLoopInterval = setInterval(startAnimationCycle, 5000); // Loop every 5 seconds

        // Cleanup function to clear all timers when the component unmounts
        return () => {
            clearInterval(mainLoopInterval);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <div className="w-full max-w-2xl bg-[rgba(32,47,54,0.5)] rounded-2xl p-6 md:p-8 space-y-6 border border-gray-700 shadow-lg">
                
                <h2 className="text-center font-semibold text-lg text-yellow-300">Scenario 1 of 3</h2>
                
                <p className="text-left font-medium text-sm text-cyan-400">
                    Tap all the words because of which you think the communication broke:
                </p>
                
                {/* Sentence with selectable words (FIXED FOR RESPONSIVENESS) */}
                <div className="bg-gray-800 p-4 rounded-lg">
                    {/* This div now uses flex-wrap to ensure words wrap on small screens */}
                    <div className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-sm md:text-base text-gray-100 leading-relaxed">
                        {scenario.sentence.split(" ").map((word, i) => {
                            const isSelected = selectedWords.includes(word);
                            return (
                                <span
                                    key={i}
                                    className={`px-1 py-0.5 rounded-md transition-all duration-200 ${isSelected ? 'bg-yellow-400 text-black font-bold' : ''}`}
                                >
                                    {word}
                                </span>
                            );
                        })}
                    </div>
                </div>
                
                {/* Barrier selection area */}
                <div>
                    <p className="text-left font-medium text-sm text-cyan-300 mb-2">
                        🎯 Choose the Communication Barrier:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm md:text-base">
                        {barriers.map(b => (
                            <BarrierOption
                                key={b}
                                text={b}
                                isSelected={selectedBarrier === b}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;