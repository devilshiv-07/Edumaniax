import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

// NOTE: All necessary data and components are included in this single file for convenience.

// =============================================================================
// Game Data (Only Scenario 1 will be used)
// =============================================================================
const scenarios = [
    {
        id: 1, label: "Scenario 1", color: "bg-red-500",
        situation: "A lake turns toxic green from fertilizer runoff. What's the best action?",
        options: [
            { text: "Add more chlorine to the water", isCorrect: false },
            { text: "Control phosphorus in fertilizers and restore wetlands", isCorrect: true },
            { text: "Drain the lake completely", isCorrect: false },
            { text: "Blame local fishers for the problem", isCorrect: false },
        ],
    },
    // Other scenarios are just for the visual display of the wheel
    { id: 2, label: "Scenario 2", color: "bg-blue-500" },
    { id: 3, label: "Scenario 3", color: "bg-green-500" },
    { id: 4, label: "Scenario 4", color: "bg-yellow-500" },
];

const gameData = {};
const gameSteps = [];
scenarios.forEach((scenario, index) => {
    const key = `q${index + 1}`;
    gameSteps.push(key);
    const correctOption = scenario.options ? scenario.options.find(opt => opt.isCorrect) : null;
    gameData[key] = {
        id: scenario.id,
        title: scenario.situation,
        label: scenario.label,
        color: scenario.color,
        options: scenario.options,
        correctAnswer: correctOption ? correctOption.text : null,
    };
});

// =============================================================================
// Reusable Visual Child Components (with reduced sizes)
// =============================================================================

function SpinWheelScreen({ isSpinning, rotation }) {
    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4">
            {/* CHANGE: Reduced max-width and margin */}
            <p className="text-slate-300 max-w-md mb-4 text-xs sm:text-sm">
                Spin the wheel to tackle the next challenge. Your goal is to choose the most sustainable policy for each scenario!
            </p>
            {/* CHANGE: Reduced wheel size and margin */}
            <div className="relative w-56 h-56 sm:w-60 sm:h-60 mb-4">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
                    <div style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} className="w-4 h-4 bg-yellow-400 border-b-2 border-yellow-600"></div>
                </div>
                <motion.div
                    className="rounded-full border-2 border-gray-600 w-full h-full grid grid-cols-2 grid-rows-2 text-white font-bold text-sm overflow-hidden shadow-2xl"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                >
                    {gameSteps.map(key => (
                        <div key={gameData[key].id} className={`flex items-center justify-center text-center p-1 ${gameData[key].color}`}>
                            {gameData[key].label}
                        </div>
                    ))}
                </motion.div>
            </div>
            {/* CHANGE: Reduced container height and button size */}
            <div className="h-12 flex items-center justify-center">
                <button
                    disabled={isSpinning}
                    className={`px-6 py-2 bg-yellow-600 text-base text-white lilita-one-regular rounded-md shrink-0 border-b-4 border-yellow-800 shadow-lg 
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-yellow-500 disabled:border-yellow-700`}
                >
                    {isSpinning ? 'Spinning...' : `Spin for ${gameData['q1'].label}`}
                </button>
            </div>
        </div>
    );
}

function QuestionScreen({ question, selectedAnswer, isRevealed }) {
    if (!question || !question.options) {
        return null;
    }
    return (
        // CHANGE: Reduced max-width and padding
        <div className="w-full max-w-xl bg-gray-800/30 rounded-xl p-5">
            <div className="flex flex-col justify-center items-start gap-4">
                {/* CHANGE: Reduced text size */}
                <h2 className="text-slate-100 text-base md:text-lg font-medium leading-snug text-center w-full">
                    {question.title}
                </h2>
                {/* CHANGE: Reduced gap */}
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    {question.options.map((option, index) => {
                        const isSelected = selectedAnswer === option.text;
                        let stateCardClasses = "";
                        let textClasses = "text-xs md:text-sm font-medium leading-relaxed";

                        if (isRevealed) {
                            if (option.isCorrect) {
                                stateCardClasses = " bg-green-900/40 border-green-500 shadow-[0_2px_0_0_#22c55e]";
                                textClasses += " text-green-300";
                            } else {
                                stateCardClasses = " bg-gray-900/50 border-gray-800 opacity-60";
                                textClasses += " text-slate-100";
                            }
                        } else {
                            if (isSelected) {
                                stateCardClasses = " bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]";
                                textClasses += " text-[#79b933]";
                            } else {
                                stateCardClasses = " bg-gray-900 border-gray-700";
                                textClasses += " text-slate-100";
                            }
                        }
                        
                        return (
                            // CHANGE: Reduced min-height and padding
                            <div key={index} className={`self-stretch min-h-[48px] px-4 py-2 rounded-lg border flex items-center transition-all ${stateCardClasses}`}>
                                <span className={textClasses}>{option.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN SELF-PLAYING ANIMATION COMPONENT
// =============================================================================
const ScenarioContent = () => {
    const [animationPhase, setAnimationPhase] = useState('showingSpin');
    const [rotation, setRotation] = useState(0);
    const [autoSelectedAnswer, setAutoSelectedAnswer] = useState(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const currentStepIndex = 0;

    useEffect(() => {
        let timer;
        const currentQuestionData = gameData[gameSteps[currentStepIndex]];

        switch (animationPhase) {
            case 'showingSpin':
                timer = setTimeout(() => setAnimationPhase('spinning'), 1000);
                break;
            case 'spinning':
                timer = setTimeout(() => setAnimationPhase('showingQuestion'), 2800);
                break;
            case 'showingQuestion':
                timer = setTimeout(() => {
                    setAutoSelectedAnswer(currentQuestionData.correctAnswer);
                    setAnimationPhase('selectingAnswer');
                }, 2000);
                break;
            case 'selectingAnswer':
                timer = setTimeout(() => {
                    setIsRevealed(true);
                    setAnimationPhase('revealingAnswer');
                }, 1500);
                break;
            case 'revealingAnswer':
                timer = setTimeout(() => {
                    setAutoSelectedAnswer(null);
                    setIsRevealed(false);
                    setAnimationPhase('showingSpin');
                }, 3000);
                break;
            default:
                break;
        }
        return () => clearTimeout(timer);
    }, [animationPhase]);

    useEffect(() => {
        if (animationPhase === 'spinning') {
            setRotation(prevRotation => {
                const targetAngle = 45;
                const currentFullRotations = Math.floor(prevRotation / 360);
                return (currentFullRotations + 4) * 360 + targetAngle;
            });
        }
    }, [animationPhase]);

    const isSpinScreenVisible = animationPhase === 'showingSpin' || animationPhase === 'spinning';
    const currentQuestion = gameData[gameSteps[currentStepIndex]];

    return (
        <div className="w-full min-h-[428px] border-2 border-gray-400 rounded-lg bg-[#0A160E] relative overflow-hidden flex flex-col justify-center items-center p-2 sm:p-4">
            <div className="w-full h-full flex items-center justify-center" style={{ display: isSpinScreenVisible ? 'flex' : 'none' }}>
                <SpinWheelScreen 
                    isSpinning={animationPhase === 'spinning'}
                    rotation={rotation}
                />
            </div>
            <div className="w-full h-full flex items-center justify-center" style={{ display: !isSpinScreenVisible ? 'flex' : 'none' }}>
                <QuestionScreen
                    question={currentQuestion}
                    selectedAnswer={autoSelectedAnswer}
                    isRevealed={isRevealed}
                />
            </div>
        </div>
    );
};

export default ScenarioContent;