import React, { useState, useEffect } from 'react';

// --- Data from your reference code ---
const scenario = { 
    id: 1, 
    title: "Scenario 1: Friend in Need", 
    prompt: "Your friend seems down and says: “I’m so done with school. Nothing makes sense anymore.”", 
    options: [
        { key: "A", text: "Yeah, I know right? LOL sameee." }, 
        { key: "B", text: "That sounds rough. Want to talk about it?" }, 
        { key: "C", text: "Well, school’s important. Maybe don’t complain?" }
    ],
    correctKey: "B" // The key of the option to animate
};

// --- Reusable Option Component ---
const OptionButton = ({ text, isSelected }) => (
    <div 
        className={`w-full max-w-md px-4 py-3 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 shadow-sm text-center ${
            isSelected 
            ? "bg-blue-500 text-white border-blue-400" 
            : "bg-[#131f24] text-gray-300 border border-[#37464f]"
        }`}
    >
        {text}
    </div>
);

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State to manage which option is highlighted
    const [selectedKey, setSelectedKey] = useState(null);

    useEffect(() => {
        // This interval drives the entire animation loop
        const animationInterval = setInterval(() => {
            // Phase 1: Select the correct option
            setSelectedKey(scenario.correctKey);

            // Phase 2: Set a timeout to deselect it after a pause
            const deselectTimeout = setTimeout(() => {
                setSelectedKey(null);
            }, 2000); // The option will stay selected for 2 seconds

            return () => clearTimeout(deselectTimeout);
        }, 3000); // The entire loop repeats every 3 seconds

        // Cleanup the main interval when the component unmounts
        return () => clearInterval(animationInterval);
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <div className="w-full max-w-xl bg-[rgba(32,47,54,0.5)] rounded-xl p-6 md:p-8 space-y-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-2 text-center">
                    {scenario.title}
                </h3>
                <p className="text-center text-gray-300 mb-4">
                    {scenario.prompt}
                </p>
                
                {/* Options Container */}
                <div className="flex flex-col items-center gap-3">
                    {scenario.options.map(({ key, text }) => (
                        <OptionButton
                            key={key}
                            text={text}
                            isSelected={selectedKey === key}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;