import React, { useState, useEffect } from 'react';

// --- Data from your reference code ---
const SCENARIO = {
    context: "You and a classmate are in conflict over project credit. You feel they haven't contributed enough, but they think you’re being controlling.",
    task: "First, build two sentences. Then, select the tones and write a final 3-4 line message to resolve the conflict thoughtfully.",
};
const SENTENCE_STARTERS = [
    { text: "I feel like…", isCorrect: true },
    { text: "You always…", isCorrect: false },
    { text: "Let’s find a way…", isCorrect: true },
    { text: "I can’t believe…", isCorrect: false }
];
const SENTENCE_ENDINGS = [
    { text: "…this project means a lot to both of us.", isCorrect: true },
    { text: "…you’ve barely done anything.", isCorrect: false },
    { text: "…we can talk this through calmly.", isCorrect: true }
];

// --- Animation Sequence Configuration ---
const animationSequence = [
    { starter: SENTENCE_STARTERS[0], ending: SENTENCE_ENDINGS[2] }, // "I feel like..." + "...we can talk..."
    { starter: SENTENCE_STARTERS[2], ending: SENTENCE_ENDINGS[0] }, // "Let's find a way..." + "...this project means..."
];

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    const [selectedStarter, setSelectedStarter] = useState(null);
    const [selectedEnding, setSelectedEnding] = useState(null);
    const [addedSentences, setAddedSentences] = useState([]);

    useEffect(() => {
        let timeouts = [];

        const startAnimationCycle = () => {
            timeouts.forEach(clearTimeout);
            setSelectedStarter(null);
            setSelectedEnding(null);
            setAddedSentences([]);

            // Animate first sentence creation
            timeouts.push(setTimeout(() => setSelectedStarter(animationSequence[0].starter), 1000));
            timeouts.push(setTimeout(() => setSelectedEnding(animationSequence[0].ending), 2000));
            timeouts.push(setTimeout(() => {
                setAddedSentences(prev => [...prev, animationSequence[0]]);
                setSelectedStarter(null);
                setSelectedEnding(null);
            }, 3000));

            // Animate second sentence creation
            timeouts.push(setTimeout(() => setSelectedStarter(animationSequence[1].starter), 4000));
            timeouts.push(setTimeout(() => setSelectedEnding(animationSequence[1].ending), 5000));
            timeouts.push(setTimeout(() => {
                setAddedSentences(prev => [...prev, animationSequence[1]]);
                setSelectedStarter(null);
                setSelectedEnding(null);
            }, 6000));
        };

        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 8000); // Loop every 8 seconds

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl p-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4 text-white">
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <h2 className="text-sm font-bold text-cyan-400 mb-2">🧠 Context</h2>
                        <p className="text-gray-300 text-xs">{SCENARIO.context}</p>
                    </div>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3">
                        <h2 className="text-sm font-bold text-purple-400 mb-2">🎯 Your Task</h2>
                        <p className="text-gray-300 text-xs">{SCENARIO.task}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-md font-semibold text-cyan-300 text-center">
                        Step 1: Build 2 Sentences ({addedSentences.length}/2)
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-bold text-white mb-2 text-center text-sm">Sentence Starters</h3>
                            <div className="space-y-2">
                                {SENTENCE_STARTERS.map((s) => (
                                    <button key={s.text} className={`w-full p-2 text-xs rounded-lg transition-all border-2 ${selectedStarter === s ? 'bg-cyan-500 border-cyan-300 text-black font-bold' : 'bg-gray-700 border-gray-600 text-white'}`}>
                                        {s.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-2 text-center text-sm">Sentence Endings</h3>
                            <div className="space-y-2">
                                {SENTENCE_ENDINGS.map((e) => (
                                    <button key={e.text} className={`w-full p-2 text-xs rounded-lg transition-all border-2 ${selectedEnding === e ? 'bg-cyan-500 border-cyan-300 text-black font-bold' : 'bg-gray-700 border-gray-600 text-white'}`}>
                                        {e.text}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center pt-2">
                        <button className="px-5 py-2 bg-yellow-600 text-white font-bold rounded-lg border-b-4 border-yellow-800 text-sm">
                            Add Sentence
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;