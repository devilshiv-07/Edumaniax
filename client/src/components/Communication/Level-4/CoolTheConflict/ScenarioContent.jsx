import React, { useState, useEffect } from 'react';

// --- Game Data (from your reference code) ---
const dialogues = [
  {
    speaker: "Friend 1",
    id: 0,
    text: [
      { word: "You", type: "normal" },
      { word: "ALWAYS", type: "swap", id: 1, replacement: "Sometimes" },
      { word: "don't listen to me. You ruined everything!", type: "normal" },
    ],
  },
  {
    speaker: "Friend 2",
    id: 1,
    text: [
      { word: "Why do you", type: "normal" },
      { word: "ALWAYS", type: "swap", id: 3, replacement: "Often" },
      { word: "say that? I'm trying my best!", type: "normal" },
    ],
  },
  {
    speaker: "Friend 1",
    id: 2,
    text: [
      { word: "I", type: "normal" },
      { word: "feel like you", type: "swap", id: 1, replacement: "I feel upset when" },
      { word: "don't care. This is so unfair.", type: "normal" },
    ],
  },
];


// --- Main Scenario Content Component ---

const ScenarioContent = () => {
    const [swappedWords, setSwappedWords] = useState({});
    const [showSlider, setShowSlider] = useState(false);
    const [sliderValue, setSliderValue] = useState(0);

    useEffect(() => {
        let timeouts = [];
        let sliderInterval;

        const startAnimationCycle = () => {
            // 1. Reset state for the new loop
            setSwappedWords({});
            setShowSlider(false);
            setSliderValue(0);
            if (sliderInterval) clearInterval(sliderInterval);

            // 2. Sequence the word swaps
            timeouts.push(setTimeout(() => setSwappedWords(prev => ({ ...prev, '0-1': true })), 1000));
            timeouts.push(setTimeout(() => setSwappedWords(prev => ({ ...prev, '1-1': true })), 2000));
            timeouts.push(setTimeout(() => setSwappedWords(prev => ({ ...prev, '2-1': true })), 3000));

            // 3. Show the slider after all words are swapped
            timeouts.push(setTimeout(() => {
                setShowSlider(true);

                // 4. Animate the slider's movement
                sliderInterval = setInterval(() => {
                    setSliderValue(prev => {
                        if (prev >= 100) {
                            clearInterval(sliderInterval);
                            return 100;
                        }
                        return prev + 2; // Increment value to create motion
                    });
                }, 30); // Adjust speed of slider here (lower is faster)

            }, 4000));
        };

        // Start the first cycle immediately
        startAnimationCycle();
        
        // Set an interval for the entire loop to repeat
        const mainLoopInterval = setInterval(startAnimationCycle, 8000); // Loop every 8 seconds

        // Cleanup function to clear all timers when the component unmounts
        return () => {
            clearInterval(mainLoopInterval);
            if (sliderInterval) clearInterval(sliderInterval);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <div className="w-full max-w-2xl mx-auto">
                <h2 className="text-xl md:text-2xl font-bold text-yellow-400 text-center mb-2">Step 1: Change the Tone</h2>
                <p className="text-center text-gray-300 mb-6 text-sm md:text-base">Click the harsh words to replace them with calmer options.</p>
                
                <div className="space-y-3">
                    {dialogues.map((line, lineIndex) => (
                        <div key={line.id} className="bg-gray-800/50 p-3 rounded-xl shadow-lg text-base md:text-lg flex flex-wrap items-center">
                            <strong className="mr-2 text-purple-300">{line.speaker}:</strong>
                            {line.text.map((item, wordIndex) => {
                                if (item.type === "swap") {
                                    const isSwapped = !!swappedWords[`${lineIndex}-${wordIndex}`];
                                    return (
                                        <span
                                            key={wordIndex}
                                            className={`inline-block px-2 py-0.5 rounded-md mx-1 font-semibold transition-all duration-500 transform ${
                                                isSwapped 
                                                ? "bg-green-500 text-white" 
                                                : "bg-red-500 text-white"
                                            }`}
                                        >
                                            {isSwapped ? item.replacement : item.word}
                                        </span>
                                    );
                                }
                                return <span key={wordIndex} className="mx-0.5 text-white">{item.word}</span>;
                            })}
                        </div>
                    ))}
                </div>

                <div className={`transition-opacity duration-500 ${showSlider ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="text-center mt-8 text-white">
                        <h2 className="text-lg md:text-xl font-semibold mb-3">Now, slide to show the emotional shift:</h2>
                        <div className="flex justify-center items-center gap-4">
                            <span className="text-3xl">😡</span>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderValue}
                                readOnly
                                className="w-52 md:w-64 accent-purple-500 cursor-pointer"
                                style={{
                                    // Custom styling for the track background
                                    background: `linear-gradient(to right, #a855f7 ${sliderValue}%, #4b5563 ${sliderValue}%)`
                                }}
                            />
                            <span className="text-3xl">🙂</span>
                        </div>
                        <p className="mt-2 text-md text-gray-400">Angry to Understanding</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;