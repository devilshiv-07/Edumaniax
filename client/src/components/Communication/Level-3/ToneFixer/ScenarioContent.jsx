import React, { useState, useEffect, useRef } from 'react';
import ThinkingCloud from "@/components/icon/ThinkingCloud";

// Demo data, structured similarly to the game data
const demoPuzzle = {
    audioSrc: "/audio1.mp3",
    emotions: ["😊", "🤔", "😢", "😠"],
    correctEmotion: "😊",
    behaviors: ["friendly", "playful", "curious"],
    correctBehavior: "friendly",
    mcq: {
        question: "What did the speaker mean?",
        options: [
            "Hey! I saw the party pics. Looked fun—wish I was there too 😊",
            "Why would you not invite me? That’s rude! 😠",
            "Guess I wasn’t cool enough for the party huh 😤",
        ],
        correct: "Hey! I saw the party pics. Looked fun—wish I was there too 😊",
    },
};

const ScenarioContent = () => {
    const [animationState, setAnimationState] = useState('idle');
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [selectedBehavior, setSelectedBehavior] = useState(null);
    const [selectedMcq, setSelectedMcq] = useState(null);

    // This useEffect hook controls the self-playing animation
    useEffect(() => {
        const animationSteps = [
            () => {
                setSelectedEmotion(demoPuzzle.correctEmotion);
                setSelectedBehavior(null);
                setSelectedMcq(null);
                setAnimationState('selecting-emotion');
            },
            () => {
                setSelectedBehavior(demoPuzzle.correctBehavior);
                setSelectedMcq(null);
                setAnimationState('selecting-behavior');
            },
            () => {
                setSelectedMcq(demoPuzzle.mcq.correct);
                setAnimationState('selecting-mcq');
            },
            () => {
                setAnimationState('finished');
            },
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < animationSteps.length) {
                animationSteps[currentStep]();
                currentStep++;
            } else {
                setAnimationState('idle');
                setSelectedEmotion(null);
                setSelectedBehavior(null);
                setSelectedMcq(null);
                currentStep = 0;
            }
        }, 1200); // Wait time between each selection

        return () => clearInterval(interval);
    }, []);

    // Component for a single selectable option
    const Option = ({ text, isSelected, isEmoji = false }) => (
        <div
            className={`flex items-center gap-1.5 p-1.5 bg-[#131f24] rounded-md border border-[#37464f] shadow-[0_1px_0_0_#37464f] transition-all duration-300 transform ${isSelected ? 'border-[#6DFF00] ring-1 ring-[#6DFF00] scale-105' : 'hover:border-gray-500'}`}
        >
            <div className={`w-3.5 h-3.5 flex-shrink-0 flex justify-center items-center rounded-sm border border-[#37464f] transition-colors ${isSelected ? 'bg-[#6DFF00] border-[#6DFF00]' : 'bg-[#0A160E]'}`}>
                {isSelected && <span className="text-black text-xs font-bold">✓</span>}
            </div>
            <span className={`text-[#f1f7fb] font-normal text-left text-xs ${isEmoji ? 'text-xl py-0.5' : 'py-1.5'}`}>
                {text}
            </span>
        </div>
    );

    return (
        <div className="w-full h-full bg-[#00260e]  rounded-lg flex flex-col items-center justify-center px-2 pt-2">
            <div className="w-full h-full flex flex-col font-['Inter'] relative overflow-hidden">
                <main className="flex-1 w-full flex flex-col items-center justify-center p-1 md:p-2">
                    <div className="w-full max-w-xl bg-[rgba(32,47,54,0.3)] rounded-lg p-2 md:p-3 space-y-1.5">
                        {/* Question 1: Emotion */}
                        <div>
                            <p className="text-[#f1f7fb] font-medium text-xs mb-1">What is the emotion of the speaker?</p>
                            <div className="flex gap-1.5 md:gap-2">
                                {demoPuzzle.emotions.map(emo => (
                                    <Option
                                        key={emo}
                                        text={emo}
                                        isEmoji
                                        isSelected={selectedEmotion === emo}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Question 2: Behavior */}
                        <div>
                            <p className="text-[#f1f7fb] font-medium text-xs mb-1">What is the listener's behavior?</p>
                            <div className="flex flex-col md:flex-row gap-1.5 md:gap-2">
                                {demoPuzzle.behaviors.map(b => (
                                    <Option
                                        key={b}
                                        text={b}
                                        isSelected={selectedBehavior === b}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Question 3: MCQ */}
                        <div>
                            <p className="text-[#f1f7fb] font-medium text-xs mb-1">{demoPuzzle.mcq.question}</p>
                            <div className="flex flex-col items-start gap-1.5 md:gap-2">
                                {demoPuzzle.mcq.options.map(opt => (
                                    <Option
                                        key={opt}
                                        text={opt}
                                        isSelected={selectedMcq === opt}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ScenarioContent;