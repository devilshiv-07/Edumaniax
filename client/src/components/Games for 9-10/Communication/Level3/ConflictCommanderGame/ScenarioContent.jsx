import React, { useState, useEffect } from 'react';

// --- Data from your reference code ---
const scenarioData = {
    id: 1,
    scenario: "Your teammate seems angry and says: “You never submit things on time! I always have to cover for you!”",
    question: "Step 1: How do you first respond?",
    options: [
        { id: "q1a", text: "😤 “You’re just yelling again.”" },
        { id: "q1b", text: "😟 “I get that you’re upset.”" }
    ],
    correctId: "q1b", // The ID of the option to animate
};


// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State to manage which option is currently "selected" in the animation
    const [selectedOptionId, setSelectedOptionId] = useState(null);

    useEffect(() => {
        // This interval drives the entire animation loop
        const animationInterval = setInterval(() => {
            // Phase 1: Select the correct option
            setSelectedOptionId(scenarioData.correctId);

            // Phase 2: Set a timeout to deselect it after a pause
            const deselectTimeout = setTimeout(() => {
                setSelectedOptionId(null);
            }, 2000); // The option will stay selected for 2 seconds

            return () => clearTimeout(deselectTimeout);
        }, 3000); // The entire loop repeats every 3 seconds

        // Cleanup the main interval when the component unmounts
        return () => clearInterval(animationInterval);
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                
                {/* Scenario Box */}
                <div className="w-full bg-gray-800/30 border-2 border-[#3F4B48] rounded-xl p-5 text-center">
                    <p className="text-gray-400 text-sm mb-2">SCENARIO 1 of 2</p>
                    <p className="text-slate-100 text-base md:text-lg font-medium leading-relaxed mb-4">
                        {scenarioData.scenario}
                    </p>
                    <p className="text-yellow-400 text-lg md:text-xl font-bold">
                        {scenarioData.question}
                    </p>
                </div>

                {/* Options Grid */}
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scenarioData.options.map(opt => (
                        <div
                            key={opt.id}
                            className={`p-4 rounded-xl text-left transition-all duration-200 border-4 ${
                                selectedOptionId === opt.id 
                                ? 'border-cyan-500 bg-cyan-900/50 scale-105' 
                                : 'border-transparent bg-[#131F24]'
                            }`}
                        >
                            <span className="text-white text-base md:text-lg">{opt.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;