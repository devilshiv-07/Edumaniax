import React, { useState, useEffect } from 'react';

// --- Data from your reference code ---
const SCENARIO = {
    context: "You're part of a design team. Your teammate’s recent presentation lacked structure and clarity. They've asked you for your honest feedback. Your goal is to provide constructive criticism that helps them improve without discouraging them.",
};
const TONES = ["Constructive", "Harsh/Blunt", "Overly Soft", "Balanced"];

// --- Animation Configuration ---
const animationText = "Your visuals had a great impact! To make it even stronger, maybe we could clarify the main takeaways a bit more?";
const toneToSelect = "Constructive";
const typingSpeed = 50; // milliseconds per character

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State for the textarea message and the selected tone
    const [message, setMessage] = useState("");
    const [selectedTone, setSelectedTone] = useState(null);

    useEffect(() => {
        let timeouts = [];
        const typeWriter = (text, setter) => {
            for (let i = 0; i <= text.length; i++) {
                const timeout = setTimeout(() => {
                    setter(text.substring(0, i));
                }, i * typingSpeed);
                timeouts.push(timeout);
            }
        };

        const startAnimationCycle = () => {
            // 1. Reset everything
            timeouts.forEach(clearTimeout);
            setMessage("");
            setSelectedTone(null);

            // 2. Start typing the message
            const startTypingTimeout = setTimeout(() => {
                typeWriter(animationText, setMessage);
            }, 1000);

            // 3. Select the tone after typing is complete
            const selectToneTimeout = setTimeout(() => {
                setSelectedTone(toneToSelect);
            }, 1000 + animationText.length * typingSpeed + 500); // 500ms after typing finishes

            timeouts = [startTypingTimeout, selectToneTimeout];
        };
        
        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 10000); // Loop every 10 seconds

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <div className="w-full max-w-3xl bg-black/30 backdrop-blur-sm border border-yellow-500/20 rounded-2xl shadow-lg">
                <div className="w-full bg-gradient-to-br from-[#1a2a32] to-[#111827] rounded-2xl p-4">
                    
                    {/* Context Section */}
                    <div className="mb-4">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                            <h2 className="text-sm font-bold text-cyan-400 mb-1 flex items-center gap-2">
                                <span className="text-lg">🧠</span> Context
                            </h2>
                            <p className="text-gray-300 text-xs">{SCENARIO.context}</p>
                        </div>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-4">
                        {/* Textarea for message */}
                         <div>
                            <label className="block text-base font-semibold text-cyan-300 mb-1.5 flex items-center gap-2">
                                <span className="text-lg">✍️</span> Compose Your Feedback
                            </label>
                            <textarea
                                rows={3}
                                placeholder="E.g., Your visuals were great! To make it stronger, maybe structure the key points more clearly..."
                                value={message}
                                readOnly
                                className="w-full p-2 rounded-lg border-2 border-gray-600 bg-[#131F24] text-white text-sm shadow-inner outline-none"
                            />
                            <p className="text-xs text-gray-400 mt-1">Min 20 characters. Remember to include praise and a suggestion.</p>
                        </div>
                        
                        {/* Tone selection */}
                        <div>
                            <p className="text-base font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                                <span className="text-lg">🎭</span> Select The Tone You Used
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {TONES.map(tone => (
                                    <button
                                        key={tone}
                                        className={`px-3 py-1 text-xs rounded-full font-bold transition-all duration-200 border-b-4 ${selectedTone === tone
                                            ? 'bg-yellow-500 border-yellow-700 text-black scale-105'
                                            : 'bg-gray-700 border-gray-900 text-white'
                                        }`}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ScenarioContent;