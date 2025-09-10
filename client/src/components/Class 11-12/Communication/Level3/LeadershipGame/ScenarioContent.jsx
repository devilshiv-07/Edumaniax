import React, { useState, useEffect } from 'react';

// --- Data from your reference code ---
const SCENARIO = {
    context: "You're the newly elected School Council Vice-Captain. Your team is behind on preparations for the Annual Fest, and morale is low.",
    task: "Write a 5-6 line message to your team that acknowledges their hard work, gives clear direction, and boosts morale. Then, select the tones you used.",
};
const TONES = ["Assertive", "Aggressive", "Passive", "Motivating"];

// --- Animation Configuration ---
const animationText = "Hey team, I know we're behind schedule, but I truly appreciate the hard work everyone is putting in. Let's regroup tomorrow at 10 AM to set clear daily goals. We can definitely get this done together!";
const tonesToSelect = ["Assertive", "Motivating"];
const typingSpeed = 40; // milliseconds per character

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State for the textarea message and the selected tones
    const [message, setMessage] = useState("");
    const [selectedTones, setSelectedTones] = useState([]);

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
            timeouts.forEach(clearTimeout);
            setMessage("");
            setSelectedTones([]);

            const startTypingTimeout = setTimeout(() => {
                typeWriter(animationText, setMessage);
            }, 1000);

            const selectTone1Timeout = setTimeout(() => {
                setSelectedTones(prev => [...prev, tonesToSelect[0]]);
            }, 1000 + animationText.length * typingSpeed + 500);

            const selectTone2Timeout = setTimeout(() => {
                setSelectedTones(prev => [...prev, tonesToSelect[1]]);
            }, 1000 + animationText.length * typingSpeed + 1000);

            timeouts = [startTypingTimeout, selectTone1Timeout, selectTone2Timeout];
        };
        
        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 15000); // Loop every 15 seconds

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl shadow-2xl">
                {/* Reduced padding (p-4) */}
                <div className="w-full bg-gradient-to-br from-[#1a2a32] to-[#111827] rounded-2xl p-4">
                    
                    {/* Context & Task Section (Reduced margin and padding) */}
                    <div className="grid md:grid-cols-2 gap-3 mb-4 text-white">
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                            <h2 className="text-sm font-bold text-cyan-400 mb-1 flex items-center gap-2">
                                <span className="text-lg">🧠</span> Context
                            </h2>
                            <p className="text-gray-300 text-xs">{SCENARIO.context}</p>
                        </div>
                        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                            <h2 className="text-sm font-bold text-purple-400 mb-1 flex items-center gap-2">
                                <span className="text-lg">🎯</span> Your Task
                            </h2>
                            <p className="text-gray-300 text-xs">{SCENARIO.task}</p>
                        </div>
                    </div>

                    {/* Input Section (Reduced spacing) */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-base font-semibold text-cyan-300 mb-1.5 flex items-center gap-2">
                                <span className="text-lg">📩</span> Compose Your Message
                            </label>
                            <textarea
                                rows={4} // Reduced from 5
                                placeholder="Type your inspiring message to the team here..."
                                value={message}
                                readOnly
                                className="w-full p-2 rounded-lg border-2 border-gray-600 bg-[#131F24] text-white text-sm shadow-inner outline-none"
                            />
                        </div>
                        
                        <div>
                            <p className="text-base font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                                <span className="text-lg">🎭</span> Select Tones (min. 2)
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {TONES.map(tone => (
                                    <button
                                        key={tone}
                                        className={`px-4 py-1 text-xs rounded-full font-bold transition-all duration-200 border-b-4 ${selectedTones.includes(tone)
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