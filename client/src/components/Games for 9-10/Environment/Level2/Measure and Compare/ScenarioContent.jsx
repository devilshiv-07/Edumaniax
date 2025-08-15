import React, { useState, useEffect } from 'react';

// --- Data for the Options ---
const options = [
    { id: 1, text: "Protest with a placard and ask for a meeting with the principal" },
    { id: 2, text: "Say nothing — not your problem" },
    { id: 3, text: "Suggest vertical parking or carpooling and saving the trees" },
];
const scenarioDescription = "Your school is planning to cut down 5 trees to expand parking for teachers’ cars.";

// --- A Reusable, Responsive Component for each Option ---
const OptionItem = ({ text, isHighlighted }) => {
    // Dynamically set classes for the animation highlight
    const baseClasses = "flex items-center w-full p-3 rounded-lg border shadow-md relative transition-colors duration-300 min-h-[70px]";
    const highlightClasses = isHighlighted ? 'border-green-500 bg-[#202f36]' : 'border-[#37464f] bg-[#131f24]';
    const textClasses = isHighlighted ? 'text-green-300' : 'text-gray-100';

    return (
        <div className={`${baseClasses} ${highlightClasses}`}>
            <div className="flex flex-col items-center justify-center grow relative">
                <span className={`w-full font-['Inter'] font-medium text-sm md:text-base text-center whitespace-normal relative ${textClasses}`}>
                    {text}
                </span>
            </div>
        </div>
    );
};

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    const [isHighlighted, setIsHighlighted] = useState(false);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setIsHighlighted(prev => !prev);
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    return (
        // Responsive container: stacks vertically, becomes a row on medium screens
        <div className="w-full h-auto bg-[#00260d] rounded-lg border border-[#f2f4f6] flex flex-col md:flex-row p-4 gap-4">
            
            {/* Left Panel: Options */}
            <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-lg p-3 flex flex-col gap-3 justify-center">
                {options.map((opt, index) => (
                    <OptionItem
                        key={opt.id}
                        text={opt.text}
                        // Animate the first item (index 0)
                        isHighlighted={index === 0 && isHighlighted}
                    />
                ))}
            </div>

            {/* Right Panel: Scenario Description */}
            <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                <p className="font-['Inter'] text-center text-gray-200 text-base lg:text-lg font-medium leading-relaxed">
                    {scenarioDescription}
                </p>
            </div>
        </div>
    );
};

export default ScenarioContent;