import React, { useState, useEffect } from 'react';
import Checknow from "@/components/icon/GreenBudget/Checknow"; // Assuming path is correct

// --- Animation Configuration (No changes needed) ---
const TEXT_TO_TYPE = "planting";
const FEEDBACK_MESSAGE = "Can you be more specific?";
const TYPING_SPEED_MS = 150;
const PAUSE_AFTER_TYPING_MS = 1000;
const CHECKING_DURATION_MS = 1500;
const FEEDBACK_DURATION_MS = 3000;

const ScenarioContent = () => {
    // State and animation logic remain the same
    const [displayText, setDisplayText] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);

    useEffect(() => {
        let timer;
        const typeAnimation = (index = 0) => {
            if (index < TEXT_TO_TYPE.length) {
                setDisplayText(TEXT_TO_TYPE.substring(0, index + 1));
                timer = setTimeout(() => typeAnimation(index + 1), TYPING_SPEED_MS);
            } else {
                timer = setTimeout(startCheckingAnimation, PAUSE_AFTER_TYPING_MS);
            }
        };
        const startCheckingAnimation = () => {
            setIsChecking(true);
            timer = setTimeout(showFeedbackAnimation, CHECKING_DURATION_MS);
        };
        const showFeedbackAnimation = () => {
            setIsChecking(false);
            setShowFeedback(true);
            timer = setTimeout(resetAnimation, FEEDBACK_DURATION_MS);
        };
        const resetAnimation = () => {
            setShowFeedback(false);
            setDisplayText('');
            timer = setTimeout(typeAnimation, 500);
        };
        typeAnimation();
        return () => clearTimeout(timer);
    }, []);

    return (
        // Responsive container: w-full on mobile, h-96 for stability
        <div className="w-full md:w-[45vw] h-96  bg-[#0A160E] flex flex-col items-center justify-between p-4 rounded-lg overflow-hidden relative">
            
            {/* --- TOP SECTION: Question & Input --- */}
            <div className="flex flex-col items-center w-full">
                <h1 className="text-white text-xl md:text-2xl font-bold font-['Comic_Neue'] mb-3 text-center">
                    One Change at School
                </h1>
                <div className="w-full max-w-lg h-20 md:h-24 bg-gray-800/30 rounded-lg border border-zinc-700 p-2 flex items-center justify-center">
                    <span className="text-center text-neutral-400 text-lg font-bold font-['Comic_Neue']">
                        {displayText}
                        <span className="animate-pulse">|</span>
                    </span>
                </div>
            </div>

            {/* --- MIDDLE SECTION: Feedback (Absolutely Positioned Overlay) --- */}
            {showFeedback && (
                <div className="absolute top-1/2 md:top-2/3 lg:1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto h-24 md:h-[12vh] flex justify-center items-center">
                    <div className="flex items-center h-full">
                        {/* Responsive image for feedback character */}
                        <img src="/feedbackcharacter.gif" alt="Feedback Character" className="w-20 md:w-[6vw] h-full object-contain" />
                        <div className="relative flex items-center">
                            {/* Responsive speech bubble pointer */}
                            <div
                                className="absolute left-[-8px] md:left-[-0.8vw] top-1/2 -translate-y-1/2 w-4 h-4 md:w-[1vw] md:h-[1.8vh] bg-cover bg-no-repeat"
                                style={{ backgroundImage: "url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-09/cZcfryFaXc.png)" }}
                            />
                            <div className="flex h-auto py-2 justify-center items-center bg-[#131f24] rounded-lg border-solid border-2 px-4 border-[#37464f]">
                                <span className="font-['Inter'] text-sm font-medium text-center text-[#f1f7fb]">
                                    {FEEDBACK_MESSAGE}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- BOTTOM SECTION: Button Bar --- */}
            {/* Stacks vertically on extra-small screens, then horizontally */}
            <div className="w-full h-auto flex flex-col sm:flex-row justify-center items-center gap-4">
                <button disabled className="relative w-36 h-12">
                    <Checknow
                        topGradientColor="#02ad3eff"
                        bottomGradientColor="#026123ff"
                        className={isChecking ? "opacity-70" : ""}
                        width="100%" height="100%"
                    />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita-one-regular text-sm text-white [text-shadow:0_2px_0_#000]">
                        {isChecking ? "Checking..." : "Check Now"}
                    </span>
                </button>
                <button disabled className="relative w-36 h-12">
                    <Checknow
                        topGradientColor="#02ad3eff"
                        bottomGradientColor="#026123ff"
                        className="opacity-70"
                        width="100%" height="100%"
                    />
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita-one-regular text-sm text-white [text-shadow:0_2px_0_#000] opacity-50">
                        Continue
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ScenarioContent;