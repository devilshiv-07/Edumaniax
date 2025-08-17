import React, { useState, useEffect } from 'react';

// --- Data & Config ---
const demoItems = [
    { id: "1", cause: "Dumping industrial waste", fallout: "Aquatic animal death" },
    { id: "2", cause: "Plastic usage", fallout: "Wildlife choking" },
    { id: "3", cause: "Over-mining", fallout: "Soil infertility" },
];
const animatedItem = demoItems[0];
const otherItems = demoItems.slice(1);

// --- Animation Timings ---
const ANIMATION_DURATION = 1500; // ms for the slide
const PAUSE_DURATION = 2000;     // ms for the pause after dropping

// --- Reusable UI Components ---
const DemoCard = ({ content }) => (
    <div className="flex h-20 md:h-[8vh] w-full items-center justify-center p-2 rounded-lg relative bg-[#131f24] border border-[#37464f] shadow-md">
        <span className="font-['Inter'] text-sm md:text-[1.6vh] font-medium text-white text-center">{content}</span>
    </div>
);

const EmptySlot = ({ text, isHighlighted }) => (
    <div className={`flex h-20 md:h-[8vh] w-full items-center justify-center p-2 rounded-lg relative bg-black/30 border-dashed border-2 transition-colors duration-300 ${isHighlighted ? 'border-yellow-400' : 'border-[#37464f]'}`}>
        <span className="font-['Inter'] text-sm md:text-[1.6vh] font-medium text-gray-400 text-center">{text}</span>
    </div>
);

// --- Main Scenario Component ---
const ScenarioContent = () => {
    const [phase, setPhase] = useState('initial');

    useEffect(() => {
        const totalCycleTime = ANIMATION_DURATION + PAUSE_DURATION;
        const runAnimationCycle = () => {
            setPhase('dragging');
            const dropTimer = setTimeout(() => setPhase('dropped'), ANIMATION_DURATION);
            const resetTimer = setTimeout(() => setPhase('initial'), totalCycleTime);
            return () => { // Cleanup for this specific cycle
                clearTimeout(dropTimer);
                clearTimeout(resetTimer);
            };
        };
        const intervalId = setInterval(runAnimationCycle, totalCycleTime + 500);
        runAnimationCycle(); // Run once immediately
        return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, []);

    const getOverlayStyle = () => {
        return {
            transition: `transform ${ANIMATION_DURATION}ms ease-in-out, opacity 300ms`,
            // Use CSS variables for the transform. They are set responsively on the parent.
            transform: (phase === 'dragging' || phase === 'dropped') ? 'translate(var(--slide-x), var(--slide-y))' : 'translate(0, 0)',
            opacity: phase === 'dragging' ? 1 : 0,
        };
    };

    return (
        <div className="w-full h-full p-2 md:p-4 bg-green-950/50 rounded-lg flex items-center justify-center">
            {/* The Animation Stage: A relative container for positioning.
                Sets CSS variables for the animation direction based on screen size.
                - Mobile: Slides vertically (Y).
                - Desktop (md): Slides horizontally (X).
            */}
            <div className="w-full md:w-[45vw] flex flex-col md:flex-row justify-between items-start gap-4 md:gap-8 relative
                [--slide-x:0] [--slide-y:calc(100%_+_12.65rem)] 
                md:[--slide-x:calc(100%_+_2.1rem)] md:[--slide-y:0]"
            >
                {/* Left Column: Make it relative to contain the animating overlay */}
                <div className="w-full md:w-1/2 flex flex-col gap-3 md:gap-[2vh] p-2 items-center bg-[rgba(32,47,54,0.3)] rounded-lg border border-[#37464f] relative">
                    
                    {/* The Animated Overlay: Absolutely positioned inside the left column */}
                    <div style={getOverlayStyle()} className="absolute top-0 left-0 w-full p-2 z-50">
                        <DemoCard content={animatedItem.fallout} />
                    </div>

                    {/* The static card is hidden when its animated counterpart is active */}
                    {phase === 'initial' ? <DemoCard content={animatedItem.fallout} /> : <EmptySlot />}
                    {otherItems.map(item => <DemoCard key={item.id} content={item.fallout} />)}
                </div>

                {/* Right Column */}
                <div className="w-full md:w-1/2 flex flex-col gap-3 md:gap-[2vh] p-2 items-center bg-[rgba(32,47,54,0.3)] rounded-lg border border-[#37464f]">
                    {phase === 'dropped'
                        ? <DemoCard content={animatedItem.fallout} />
                        // The slot is highlighted during drag
                        : <EmptySlot text={animatedItem.cause} isHighlighted={phase === 'dragging'} />
                    }
                    {otherItems.map(item => <EmptySlot key={item.id} text={item.cause} />)}
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;