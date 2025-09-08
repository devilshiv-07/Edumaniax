import React, { useState, useEffect } from 'react';
import ThinkingCloud from "@/components/icon/ThinkingCloud";
// --- Helper Data & Components (for a self-contained demo) ---

const demoData = {
    sentence: "I still can't believe its monday again",
    moodOptions: ["Sad", "Happy", "Bored", "Angry", "Sarcastic"],
    moodEmojis: {
        Sad: "😢",
        Happy: "😃",
        Bored: "😐",
        Angry: "😠",
        Sarcastic: "😏",
    },
    animationTarget: "Sad",
};


const EmotionCard = ({ mood, emoji, isSelected }) => (
    <div
        className={`flex flex-col items-center justify-center 
          w-20 h-20 md:w-24 md:h-24 
          bg-[#131f24] rounded-lg border-2 
          transition-all duration-300 transform
          ${isSelected
            ? 'border-[#6DFF00] shadow-[0_3px_0_0_#6DFF00] scale-105'
            : 'border-[#37464f] shadow-[0_3px_0_0_#37464f]'}`
        }
    >
        <span className="text-3xl md:text-4xl mb-1">{emoji}</span>
        <span className="text-[#f1f7fb] font-medium text-xs md:text-sm">{mood}</span>
    </div>
);


const AudioPlayerCharacter = () => (
    <div className="flex items-end justify-center">
        <img src="/feedbackcharacter.gif" alt="Character" className="w-[2.5rem] md:w-[3.5rem] h-auto object-contain shrink-0" />
        <div className="relative mb-2 md:mb-4 md:ml-1">
            <ThinkingCloud className="w-[110px] h-auto md:w-[130px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center gap-2 px-3">
                <img src="/communicationGames6to8/play.svg" alt="Play audio" className="w-4 h-4 md:w-5 md:h-5" />
                <img src="/communicationGames6to8/audio.svg" alt="Audio waveform" className="h-4 md:h-5" />
            </div>
        </div>
    </div>
);


// --- Main Scenario Content Component ---

const ScenarioContent = () => {
    const [selectedEmotion, setSelectedEmotion] = useState(null);

    // This useEffect hook creates the self-playing, looping animation.
    useEffect(() => {
        const animationInterval = setInterval(() => {
            // 1. Select the target card
            setSelectedEmotion(demoData.animationTarget);

            // 2. Set a timeout to deselect the card after a short duration
            const deselectTimeout = setTimeout(() => {
                setSelectedEmotion(null);
            }, 1800); 
           
            return () => clearTimeout(deselectTimeout);

        }, 3000); // The entire loop (select -> deselect -> pause) repeats every 3 seconds

       
        return () => clearInterval(animationInterval);
    }, []); 

    return (
        <div className="w-full h-full bg-[#00260e] rounded-lg flex flex-col items-center justify-center px-4 pt-4 font-['Inter']">
            
            <p className="text-white text-base md:text-lg text-center mb-4">
                {demoData.sentence}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-6">
                {demoData.moodOptions.map(mood => (
                    <EmotionCard
                        key={mood}
                        mood={mood}
                        emoji={demoData.moodEmojis[mood]}
                        isSelected={selectedEmotion === mood}
                    />
                ))}
            </div>

            <div className="w-full flex justify-center ">
                <AudioPlayerCharacter />
            </div>

        </div>
    );
};

export default ScenarioContent;