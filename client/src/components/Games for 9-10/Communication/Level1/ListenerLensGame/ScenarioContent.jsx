import React, { useState, useEffect } from 'react';

// --- Data from your reference code ---
const sampleReplies = [
  "That must be frustrating. I hear you.",
  "Want to talk more about it?",
  "Maybe you’re just bad at exams.",
];

// --- Reusable Option Component (with reduced vertical padding) ---
const Option = ({ text, isSelected }) => (
    <div
        className={`w-full text-left px-5 py-2 rounded-lg border bg-[#131f24] border-[#37464f] shadow-[0_2px_0_0_#37464f] transition-all duration-300 transform ${isSelected ? 'border-[#6DFF00] ring-1 ring-[#6DFF00] scale-[1.02]' : ''}`}
    >
        <span className="text-[#f1f7fb] font-semibold text-sm md:text-base">
            💌 {text}
        </span>
    </div>
);


// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State to manage which option is selected and the textarea content
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [textAreaValue, setTextAreaValue] = useState("");

    useEffect(() => {
        // This interval drives the entire looping animation
        const animationInterval = setInterval(() => {
            // --- Phase 1: Select the first option ---
            setSelectedIndex(0);
            setTextAreaValue(sampleReplies[0]);

            // --- Phase 2: Set a timeout to deselect and reset ---
            const deselectTimeout = setTimeout(() => {
                setSelectedIndex(null);
                setTextAreaValue("");
            }, 2000); // The selection will be visible for 2 seconds

            // Cleanup the timeout in case of a fast re-render (good practice)
            return () => clearTimeout(deselectTimeout);
        }, 3000); // The entire loop repeats every 3 seconds

        // Cleanup the main interval when the component unmounts
        return () => clearInterval(animationInterval);
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            {/* The space-y-3 and p-4 classes are reduced for a shorter layout */}
            <div className="w-full max-w-lg bg-[rgba(32,47,54,0.3)] rounded-xl p-4 space-y-3">
                
                <p className="text-[#f1f7fb] font-bold text-lg text-center">
                    🌟 Pick or Write a Kind Reply!
                </p>
                
                {/* Options Container with smaller gap */}
                <div className="flex flex-col gap-2">
                    {sampleReplies.map((reply, index) => (
                        <Option
                            key={index}
                            text={reply}
                            isSelected={selectedIndex === index}
                        />
                    ))}
                </div>
                
                {/* "OR" Separator with reduced margin */}
                <div>
                    <p className="text-[#f1f7fb] font-medium text-center my-1">OR</p>
                </div>

                {/* Text Area with rows reduced to 3 */}
                <textarea
                    rows="3"
                    readOnly
                    value={textAreaValue}
                    placeholder="🖊️ Type your own sweet reply..."
                    className="w-full p-3 rounded-xl border-2 border-[#37464f] bg-[#131f24] text-[#f1f7fb] focus:outline-none placeholder-gray-400 transition-all duration-300"
                />
            </div>
        </div>
    );
};

export default ScenarioContent;