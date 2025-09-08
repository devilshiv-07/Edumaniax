import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';

// --- Data based on your reference code ---
const samples = [
  { id: "s1", name: "Voice 1" },
  { id: "s2", name: "Voice 2" },
  { id: "s3", name: "Voice 3" },
  { id: "s4", name: "Voice 4" },
  { id: "s5", name: "Voice 5" },
];
const labels = ["😏 Sarcastic", "😊 Polite", "😴 Bored", "🥳 Excited", "😠 Angry"];

// --- Animation Configuration ---
const animatedSample = samples[0]; // We will animate "Voice 1"
const targetLabel = labels[3]; // It will drop on "🥳 Excited"


// --- Helper Components ---
const VoiceTag = ({ name }) => (
    <div className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-semibold">
        {name}
    </div>
);

const VoiceCard = ({ name, children }) => (
    <div className="bg-[#131F24] p-2 rounded-xl w-24 h-24 shadow-lg text-center relative border border-[#3F4B48] flex flex-col items-center justify-between flex-shrink-0">
        <div className="text-2xl bg-cyan-700 text-white rounded-full w-8 h-8 flex items-center justify-center mt-1">▶️</div>
        <div className="h-5 flex items-center justify-center mb-1">
            {children}
        </div>
    </div>
);

const EmotionZone = ({ label, children }) => (
    <div className="h-[90px] w-28 bg-gray-800/50 border-2 border-dashed border-cyan-700/50 rounded-xl text-center p-2 transition-colors duration-200 flex flex-col items-center justify-center gap-1 flex-shrink-0">
        <div className="font-bold text-sm text-slate-200">{label}</div>
        <div className="h-5 flex items-center justify-center">
            {children}
        </div>
    </div>
);


// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    const [matchedPair, setMatchedPair] = useState(null);
    const [isResetting, setIsResetting] = useState(false);

    useEffect(() => {
        const cycle = () => {
            setIsResetting(false);
            setMatchedPair({ voiceId: animatedSample.id, label: targetLabel });
        };

        const resetAndStart = () => {
            setIsResetting(true);
            setMatchedPair(null);
            setTimeout(cycle, 50);
        };

        resetAndStart();
        const mainLoop = setInterval(resetAndStart, 3500);
        return () => clearInterval(mainLoop);
    }, []);
    
    const animationTransition = { duration: isResetting ? 0 : 0.8, ease: "easeInOut" };

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center py-8 px-4 font-['Inter'] rounded-lg overflow-hidden">
            <LayoutGroup>
                <div className="w-full max-w-4xl space-y-8">
                    <p className="text-center text-slate-300 text-base">🎵 Part 1: Listen and match each voice to the correct emotion.</p>
                    
                    {/* Top row of Voice Cards (Wraps on mobile, rigid on large screens) */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-2 justify-center">
                        {samples.map((sample) => (
                            <VoiceCard key={sample.id} name={sample.name}>
                                {(!matchedPair || matchedPair.voiceId !== sample.id) && (
                                    <motion.div layoutId={sample.id} transition={animationTransition}>
                                        <VoiceTag name={sample.name} />
                                    </motion.div>
                                )}
                            </VoiceCard>
                        ))}
                    </div>
                    
                    {/* Bottom row of Emotion Zones (Wraps on mobile, rigid on large screens) */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-2 justify-center">
                        {labels.map((label) => (
                            <EmotionZone key={label} label={label}>
                                {matchedPair && matchedPair.label === label && (
                                    <motion.div
                                        layoutId={matchedPair.voiceId}
                                        transition={animationTransition}
                                        initial={{ background: '#f59e0b' /* yellow-500 */ }}
                                        animate={{ background: '#22c55e' /* green-500 */ }}
                                        className="text-white rounded-full px-2 py-1 text-xs"
                                    >
                                        {animatedSample.name}
                                    </motion.div>
                                )}
                            </EmotionZone>
                        ))}
                    </div>
                </div>
            </LayoutGroup>
        </div>
    );
};

export default ScenarioContent;