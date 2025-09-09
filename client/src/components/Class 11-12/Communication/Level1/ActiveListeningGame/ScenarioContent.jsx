import React, { useState, useEffect } from 'react';

// --- Animation Configuration ---
const rewriteText = "i am sorry";
const emojiValue = "😊";
const emojiText = "😊 Smile";
const clarificationText = "i was just distracted";
const typingSpeed = 120; // milliseconds per character

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State for each input field
    const [rewrite, setRewrite] = useState("");
    const [emoji, setEmoji] = useState("None");
    const [clarification, setClarification] = useState("");

    // This useEffect hook controls the entire animation loop
    useEffect(() => {
        let timeouts = [];

        const typeWriter = (text, setter, onComplete = () => {}) => {
            for (let i = 0; i <= text.length; i++) {
                const timeout = setTimeout(() => {
                    setter(text.substring(0, i));
                    if (i === text.length) {
                        onComplete();
                    }
                }, i * typingSpeed);
                timeouts.push(timeout);
            }
        };

        const startAnimationCycle = () => {
            // 1. Reset all fields
            setRewrite("");
            setEmoji("None");
            setClarification("");
            
            // 2. Sequence the animation steps with delays
            const timeout1 = setTimeout(() => {
                typeWriter(rewriteText, setRewrite);
            }, 1000); // Start typing after 1s

            const timeout2 = setTimeout(() => {
                setEmoji(emojiValue);
            }, 3000); // Select emoji at 3s

            const timeout3 = setTimeout(() => {
                typeWriter(clarificationText, setClarification);
            }, 4000); // Start typing clarification at 4s

            timeouts = [timeout1, timeout2, timeout3];
        };
        
        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 8000); // Loop the entire animation every 8 seconds

        // Cleanup function to clear all timers
        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            {/* Reduced spacing (space-y-3) */}
            <div className="w-full max-w-xl bg-[rgba(32,47,54,0.3)] rounded-xl p-4 space-y-3">
                
                <p className="text-center text-white text-sm md:text-base">
                    Uh-oh! Your friend felt hurt by your message: 
                    <span className="block font-bold text-red-500 text-xl md:text-2xl my-1">"Whatever."</span>
                    How can you fix it?
                </p>

                {/* Rewrite message */}
                <div>
                    <label className="block mb-1 text-green-400 font-medium text-sm">✍️ Rewrite the message kindly:</label>
                    <textarea 
                        className="w-full p-2 h-16 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-inner focus:outline-none ring-2 ring-transparent focus:ring-green-500 transition-all text-sm" 
                        value={rewrite} 
                        readOnly
                        placeholder="e.g., I'm sorry, I didn't mean..."
                    />
                </div>

                {/* Emoji selection */}
                <div>
                    <label className="block mb-1 text-blue-400 font-medium text-sm">😀 Add an emoji to show your tone:</label>
                    <div className="w-full p-2 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-inner text-sm">
                         {emoji === "None" ? '🚫 None' : emojiText}
                    </div>
                </div>

                {/* Clarification message */}
                <div>
                    <label className="block mb-1 text-yellow-400 font-medium text-sm">💬 Clarify what you really meant:</label>
                    <textarea 
                        className="w-full p-2 h-16 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-inner focus:outline-none ring-2 ring-transparent focus:ring-yellow-500 transition-all text-sm" 
                        value={clarification} 
                        readOnly
                        placeholder="e.g., I was just trying to say..."
                    />
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;