import React, { useState, useEffect } from 'react';

// --- NEW DATA for the Scenario ---
const scenarioData = {
    id: 1,
    question: "A country with high literacy, long life expectancy, but huge deforestation – sustainable or not?",
    options: [
        "Sustainable",
        "Partially sustainable",
        "Not sustainable",
        "Need more data",
    ],
};


// --- A Reusable, Responsive Component for each Option ---
// NOTE: This component remains unchanged as it is designed to be reusable.
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
            
            {/* Left Panel: Options (Now mapping over the new 4 options) */}
            <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-lg p-3 flex flex-col gap-3 justify-center">
                {scenarioData.options.map((optionText, index) => (
                    <OptionItem
                        key={index} // Using index as key is fine for a static list
                        text={optionText}
                        // Animate the first item (index 0)
                        isHighlighted={index === 0 && isHighlighted}
                    />
                ))}
            </div>

            {/* Right Panel: Scenario Description (Now displays the new question) */}
            <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-lg p-4 flex items-center justify-center min-h-[120px]">
                <p className="font-['Inter'] text-center text-gray-200 text-base lg:text-lg font-medium leading-relaxed">
                    {scenarioData.question}
                </p>
            </div>
        </div>
    );
};

export default ScenarioContent;