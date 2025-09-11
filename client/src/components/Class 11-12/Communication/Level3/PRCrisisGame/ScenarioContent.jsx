import React, { useState, useEffect } from 'react';

// --- Data from your reference code ---
const SCENARIO = {
    context: "A recent post from a school club was perceived as insensitive, causing distress among some students. As the student spokesperson, you need to address the situation publicly. Choose the correct strategic approach, then write a 5-6 line official statement.",
};

const CHOICES = {
    reaction: [
        { id: "ack", text: "Acknowledge the Issue", icon: "🧸" },
        { id: "silent", text: "Delete & Hide", icon: "🗑️" },
        { id: "blame", text: "Blame Others", icon: "💥" },
    ],
    tone: [
        { id: "professional", text: "Professional & Understanding", icon: "🌈" },
        { id: "dismissive", text: "Dismissive", icon: "🥶" },
        { id: "casual", text: "Too Casual", icon: "😎" },
    ],
    closing: [
        { id: "apology", text: "Apologize & Offer Next Steps", icon: "🛠️" },
        { id: "defend", text: "Defend Intentions", icon: "🛡️" },
        { id: "blame_again", text: "Shift Blame", icon: "👎" },
    ],
};

const CORRECT_CHOICES = {
    reaction: 'ack',
    tone: 'professional',
    closing: 'apology'
};

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State to manage the selected option for each category
    const [selections, setSelections] = useState({});

    useEffect(() => {
        let timeouts = [];
        
        const startAnimationCycle = () => {
            // 1. Reset all selections
            timeouts.forEach(clearTimeout);
            setSelections({});

            // 2. Sequence the selections with delays
            timeouts.push(setTimeout(() => {
                setSelections(prev => ({ ...prev, reaction: CORRECT_CHOICES.reaction }));
            }, 1000));

            timeouts.push(setTimeout(() => {
                setSelections(prev => ({ ...prev, tone: CORRECT_CHOICES.tone }));
            }, 2000));

            timeouts.push(setTimeout(() => {
                setSelections(prev => ({ ...prev, closing: CORRECT_CHOICES.closing }));
            }, 3000));
        };

        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 5000); // Loop every 5 seconds

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    // Helper to generate the title for each section
    const getTitle = (category) => {
        if (category === 'reaction') return '1️⃣ First Reaction?';
        if (category === 'tone') return '2️⃣ How Should It Sound?';
        if (category === 'closing') return '3️⃣ Closing Statement';
        return category;
    };

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <div className="w-full max-w-3xl bg-black/30 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl shadow-2xl">
                {/* Reduced padding (p-4) */}
                <div className="w-full bg-gradient-to-br from-[#1a2a32] to-[#111827] rounded-2xl p-4">
                    
                    {/* Context Section (Reduced margin and padding) */}
                    <div className="mb-4">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                            <h2 className="text-sm font-bold text-cyan-400 mb-1 flex items-center gap-2">
                                <span className="text-lg">🧠</span> Context
                            </h2>
                            <p className="text-gray-300 text-xs">{SCENARIO.context}</p>
                        </div>
                    </div>

                    {/* Choices Section (Reduced spacing) */}
                    <div className="space-y-4">
                        {Object.entries(CHOICES).map(([category, options]) => (
                            <div key={category}>
                                <h3 className="text-base font-semibold text-cyan-300 mb-2 flex items-center gap-2 capitalize">
                                    {getTitle(category)}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {options.map(option => (
                                        <button
                                            key={option.id}
                                            // Reduced padding (py-1.5) and text size
                                            className={`px-3 py-1.5 text-xs rounded-full font-bold transition-all duration-200 border-b-4 flex items-center gap-2 ${selections[category] === option.id
                                                ? 'bg-yellow-500 border-yellow-700 text-black scale-105'
                                                : 'bg-gray-700 border-gray-900 text-white'
                                            }`}
                                        >
                                            <span>{option.icon}</span> {option.text}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;