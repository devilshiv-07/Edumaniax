import React, { useState, useEffect } from 'react';

// --- NEW DATA based on your request ---
const scenarioData = {
    id: 1,
    question: "You must cut water supply by 40%. Which is the least disruptive method?",
    options: [
            "Turn off taps 3 days/week",
            "Uniform rationing (per household)",
            "Tanker supply only to slums",
            "Cut off industries temporarily",
        ],
};

// --- A Reusable, Responsive Component for each Option ---
// NOTE: This component is updated with styling from your inspiration code.
const OptionItem = ({ text, isHighlighted }) => {
    // Base classes for layout and transitions, consistent for all options
    const baseClasses = "w-full p-4 max-h-[50px] flex justify-start items-center text-center rounded-lg border transition-all duration-300";

    // Dynamic classes that change based on the isHighlighted prop
    const highlightClasses = isHighlighted
        ? 'bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]' // Styles for the highlighted state
        : 'bg-gray-900 border-gray-700 shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)]'; // Default styles

    const textClasses = isHighlighted
        ? 'text-[#79b933]' // Text color when highlighted
        : 'text-slate-100'; // Default text color

    return (
        <div className={`${baseClasses} ${highlightClasses}`}>
            <span className={`font-medium text-xs md:text-base leading-relaxed ${textClasses}`}>
                {text}
            </span>
        </div>
    );
};


// --- Main Scenario Content Component ---
// NOTE: This component is completely refactored to match the video's layout and animation logic.
const ScenarioContent = () => {
    // State to track which option index is currently highlighted
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    // useEffect hook to run the animation cycle
    useEffect(() => {
        // Set an interval to change the highlighted option every 2.5 seconds
        const intervalId = setInterval(() => {
            setHighlightedIndex(prevIndex => {
                // Cycle to the next option, or loop back to the first one
                return (prevIndex + 1) % scenarioData.options.length;
            });
        }, 2500); // Animation cycle duration: 2.5 seconds

        // Cleanup function to clear the interval when the component unmounts
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array means this effect runs only once on mount

    return (
        // Main container with a dark background, centered content
        <div className="w-full h-auto bg-[#00260d] rounded-lg border border-[#f2f4f6] flex flex-col md:flex-row p-4 gap-2">
            {/* Inner container for the content, styled like the inspiration code */}
            <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-6">
                <div className="flex flex-col justify-start items-start gap-2 text-start">
                    
                    {/* Question Text */}
                    <h2 className="text-slate-100 text-base font-medium leading-snug md:leading-9">
                        {scenarioData.question}
                    </h2>

                    {/* Options container */}
                    <div className="w-full max-w-lg mt-3 flex flex-col justify-start items-stretch gap-2">
                        {scenarioData.options.map((optionText, index) => (
                            <OptionItem
                                key={index}
                                text={optionText}
                                // The option is highlighted if its index matches the current state
                                isHighlighted={index === highlightedIndex}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;