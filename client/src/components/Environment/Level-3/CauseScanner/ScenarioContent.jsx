import React, { useState, useEffect, useRef } from 'react'; // 1. Import useRef
import { motion } from 'framer-motion';

// --- Data for the single, focused scenario ---
const singleAction = { action: "Cycling instead of driving", answer: "Helps Prevent" };

const options = [
    { text: <>Helps prevent<br />Climate change</>, id: "Helps Prevent" },
    { text: <>Contributes to<br />Climate change</>, id: "Contributes To" },
];

const ScenarioContent = () => {
    const [animationState, setAnimationState] = useState('idle');
    const deselectTimerRef = useRef(null); // 2. Create a ref to hold the timer ID
    
    const correctAnswerId = singleAction.answer;

    useEffect(() => {
        const runAnimationCycle = () => {
            setAnimationState('selected');
            
            // Store the timer ID in the ref's .current property
            deselectTimerRef.current = setTimeout(() => {
                setAnimationState('idle');
            }, 1200);
        };

        const intervalId = setInterval(runAnimationCycle, 2400);

        // Run the cycle once immediately at the start without waiting for the interval
        runAnimationCycle();

        // Cleanup function now has access to the timer ID via the ref
        return () => {
            clearInterval(intervalId);
            // 3. Clear the timeout using the ID stored in the ref
            if (deselectTimerRef.current) {
                clearTimeout(deselectTimerRef.current);
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once

    return (
        <div className="w-full max-w-4xl mx-auto h-auto bg-[#00260d] rounded-lg border border-[#37464f] flex flex-col p-4 sm:p-6 md:p-8 gap-6 font-sans">
            
            <h1 className="text-center text-white text-2xl sm:text-3xl font-bold font-['Comic_Neue'] leading-tight">
                {singleAction.action}
            </h1>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {options.map((option) => {
                    const isTheCorrectChoice = option.id === correctAnswerId;
                    let cardClasses = 'bg-[#131f24] border-[#37464f]'; 
                    
                    if (isTheCorrectChoice && animationState === 'selected') {
                        cardClasses += ' scale-105 border-white';
                    }

                    return (
                        <div
                            key={option.id}
                            className={`
                                h-48 md:h-56 rounded-xl border-2
                                flex justify-center items-center 
                                text-center text-slate-100 sm:text-2xl font-medium font-['Inter'] leading-relaxed p-4
                                transition-all duration-500 ease-in-out
                                ${cardClasses}
                            `}
                        >
                            {option.text}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ScenarioContent;