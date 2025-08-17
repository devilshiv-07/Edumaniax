import React, { useState, useEffect } from 'react';

// Demo data for the animation
const demoPuzzle = {
    cause: "Cutting down trees",
    effects: ["Loss of tree cover", "Soil erosion", "Crop failure and desertification"],
    image: "/environmentGameInfo/ChainReaction/cutdowntrees.png", // Verify this path
};

// Card component - No changes needed here, it inherits responsive size
const Card = ({ content, isVisible = true, isPlaceholder = false }) => (
    <div className={`flex h-[7vh] w-full items-center self-stretch shrink-0 rounded-[0.83vw] relative transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {isPlaceholder ? (
            <div className="shrink-0 w-full h-full bg-[#131f24] rounded-[0.83vw] border-dashed border-[0.2vh] border-[#37464f]" />
        ) : (
            <>
                <div className="shrink-0 bg-[#131f24] rounded-[0.83vw] border-solid border-[0.1vh] border-[#37464f] absolute inset-[-0.05vh] shadow-[0_0.22vh_0_0_#37464f]" />
                <div className="flex p-2 md:p-[1vw] items-center justify-center grow relative z-[5]">
                    <span className="font-['Inter'] text-base md:text-[1.8vh] font-medium text-[#f1f7fb] text-center">{content}</span>
                </div>
            </>
        )}
    </div>
);

// Slot component - No changes needed here, it inherits responsive size
const Slot = ({ text, content }) => (
    <div className="flex h-[7vh] w-full items-center justify-center self-stretch shrink-0 rounded-[0.83vw] relative">
        {content ? (
             <>
                <div className="shrink-0 bg-[#131f24] rounded-[0.83vw] border-solid border-[0.1vh] border-[#37464f] absolute inset-[-0.05vh] shadow-[0_0.22vh_0_0_#37464f]" />
                <div className="flex p-2 md:p-[1vw] items-center justify-center grow relative z-[5]">
                    <span className="font-['Inter'] text-base md:text-[1.8vh] font-medium text-[#f1f7fb] text-center">{content}</span>
                </div>
            </>
        ) : (
            <>
                <div className="w-full h-full bg-[#131f24] rounded-[0.83vw] border-dashed border-[0.2vh] border-[#37464f]" />
                <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
                    <span className="font-['Inter'] text-base md:text-[1.8vh] font-medium text-[#f1f7fb]">{text}</span>
                </div>
            </>
        )}
    </div>
);


const ScenarioContent = () => {
    const [animationState, setAnimationState] = useState('idle');

    useEffect(() => {
        const animationCycle = () => {
            setAnimationState('animating');
            const endTimeout = setTimeout(() => setAnimationState('finished'), 1000); // Animation duration
            const resetTimeout = setTimeout(() => setAnimationState('idle'), 3000); // Pause before reset
            return () => {
                clearTimeout(endTimeout);
                clearTimeout(resetTimeout);
            };
        };
        const startTimeout = setTimeout(animationCycle, 500);
        const loopInterval = setInterval(animationCycle, 3500);
        return () => {
            clearTimeout(startTimeout);
            clearInterval(loopInterval);
        };
    }, []);

    const animatedCardContent = demoPuzzle.effects[0];

    return (
        // Change: Updated slide-x variable to use percentages and rems for a responsive calculation.
        // It now translates by its own width (100%) plus the gap (1.5rem, which is gap-6).
        <div className="w-full h-full bg-green-950/50 rounded-lg flex flex-col items-center justify-center p-4 
            [--slide-x:0] [--slide-y:13.5rem]
            md:[--slide-x:calc(100%_+_3.2rem)] md:[--slide-y:0]"
        >
            <style>
                {`
                @keyframes slide-responsive {
                    from { transform: translate(0, 0); }
                    to { transform: translate(var(--slide-x), var(--slide-y)); }
                }
                .animate-slide {
                    animation: slide-responsive 1s ease-in-out forwards;
                }
                `}
            </style>

            {/* Change: Added max-w-5xl here to constrain the overall width of the component on large screens. */}
            <div className="flex flex-col items-center gap-6 md:gap-[4.5vh] w-full max-w-5xl">
                
                {/* Main container for panels. Stacks vertically on mobile, horizontally on desktop. */}
                {/* Change: Removed md:max-w-[70.7vw] and changed md:gap-[1.5vw] to md:gap-6 for responsive spacing. */}
                <div className="flex flex-col md:flex-row w-full justify-center items-start gap-4 md:gap-6">
                    
                    {/* Left Panel: full-width on mobile, 50% width on desktop */}
                    {/* Change: Replaced md:w-[21vw] with md:w-1/2 for flexible, container-aware sizing. */}
                    <div className="flex w-full md:w-1/2 h-auto flex-col gap-4 md:gap-[2vh] p-4 md:py-[3vh] md:px-[1vw] justify-center items-center bg-[rgba(32,47,54,0.3)] rounded-lg md:rounded-[0.83vw] border border-[#37464f]">
                        
                        {/* Wrapper for the animation */}
                        <div className="relative h-[7vh] w-full">
                            {animationState === 'animating' && (
                                <div className="absolute top-0 left-0 z-10 animate-slide w-full">
                                    <Card content={animatedCardContent} />
                                </div>
                            )}
                            <div className="absolute top-0 left-0 w-full">
                                <Card 
                                    content={animatedCardContent} 
                                    isPlaceholder={animationState === 'finished'} 
                                    isVisible={animationState === 'idle'}
                                />
                            </div>
                        </div>

                        <Card content={demoPuzzle.effects[1]} isVisible={true} />
                        <Card content={demoPuzzle.effects[2]} isVisible={true} />
                    </div>

                    {/* Right Panel: full-width on mobile, 50% width on desktop */}
                    {/* Change: Replaced md:w-[21vw] with md:w-1/2. */}
                    <div className="flex w-full md:w-1/2 h-auto flex-col gap-4 md:gap-[2vh] p-4 md:py-[3vh] md:px-[1vw] justify-center items-center bg-[rgba(32,47,54,0.3)] rounded-lg md:rounded-[0.83vw] border border-[#37464f]">
                        <Slot 
                            text="1st" 
                            content={animationState === 'finished' ? animatedCardContent : null}
                        />
                        <Slot text="2nd" />
                        <Slot text="3rd" />
                    </div>
                </div>

                {/* Bottom "Cause" section */}
                {/* Change: Removed md:max-w-[43.5vw]. Its width is now properly controlled by the parent's max-width. */}
                <div className="flex flex-col sm:flex-row items-center justify-center w-full h-auto md:h-[10vh] gap-2">
                    <img src={demoPuzzle.image} alt="Cause" className="w-16 h-24 md:w-[7vw] md:h-[10vh] object-contain" />
                    <div className="relative flex items-center">
                        <div className="absolute left-[-0.9vw] top-1/2 -translate-y-1/2 w-[1vw] h-[1.8vh] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-09/cZcfryFaXc.png)] bg-cover bg-no-repeat hidden md:block" />
                        <div className="flex h-auto md:h-[5.5vh] justify-center items-center bg-[#131f24] rounded-lg md:rounded-[0.83vw] border-solid border-[0.1vh] border-[#37464f] p-3 md:px-[1.8vw]">
                            <span className="font-['Inter'] text-lg md:text-[2.1vh] font-medium text-[#f1f7fb] text-center">
                                {demoPuzzle.cause}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;