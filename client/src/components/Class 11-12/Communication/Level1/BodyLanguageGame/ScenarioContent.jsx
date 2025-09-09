import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

// --- Data for the Demo ---
const scenario = { 
    id: 1, 
    text: 'A student whispers something during class. The other person doesn’t respond.' 
};
const labels = ['Sender', 'Message', 'Medium', 'Receiver', 'Feedback', 'Non-verbal cue'];
const animatedLabel = 'Sender';

// --- Helper Components ---
const Label = React.forwardRef(({ label, className = '' }, ref) => (
    <div ref={ref} className={`w-auto bg-cyan-700 rounded-3xl flex items-center justify-center p-2 ${className}`}>
        <span className="text-white text-center text-xs font-medium leading-relaxed px-2">{label}</span>
    </div>
));

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    const [animationState, setAnimationState] = useState('idle');
    const [positions, setPositions] = useState({
        initialTop: 0, initialLeft: 0,
        deltaX: 0, deltaY: 0,
        width: 0, height: 0,
    });

    const startRef = useRef(null);
    const endRef = useRef(null);
    const containerRef = useRef(null);

    // useLayoutEffect runs after the DOM is painted, so we can measure elements accurately.
    useLayoutEffect(() => {
        const calculatePositions = () => {
            if (!startRef.current || !endRef.current || !containerRef.current) return;

            const startRect = startRef.current.getBoundingClientRect();
            const endRect = endRef.current.getBoundingClientRect();
            const containerRect = containerRef.current.getBoundingClientRect();

            // Calculate initial position of the clone relative to the container
            const initialTop = startRect.top - containerRect.top;
            const initialLeft = startRect.left - containerRect.left;
            
            // Calculate the difference between the center of the end zone and the start element
            const deltaX = (endRect.left + endRect.width / 2) - (startRect.left + startRect.width / 2);
            const deltaY = (endRect.top + endRect.height / 2) - (startRect.top + startRect.height / 2);

            setPositions({
                initialTop, initialLeft,
                deltaX, deltaY,
                width: startRect.width,
                height: startRect.height,
            });
        };

        calculatePositions();
        window.addEventListener('resize', calculatePositions);
        return () => window.removeEventListener('resize', calculatePositions);
    }, []);

    useEffect(() => {
        const cycle = () => {
            setAnimationState('animating');
            setTimeout(() => setAnimationState('dropped'), 1000);
        };
        const resetAndStart = () => {
            setAnimationState('idle');
            setTimeout(cycle, 500);
        };
        resetAndStart();
        const mainLoop = setInterval(resetAndStart, 4000);
        return () => clearInterval(mainLoop);
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg relative overflow-hidden">
            <div className="w-full max-w-4xl flex flex-col items-center gap-8">
                
                {/* --- Scenario Box (Width reduced, height maintained) --- */}
                <div className="w-full max-w-lg min-h-[14rem] bg-gray-800/30 border-2 border-[#3F4B48] rounded-xl p-4 flex flex-col justify-end gap-10">
                    <p className="text-center text-slate-100 text-sm sm:text-base font-medium leading-relaxed">
                        SCENARIO {scenario.id}: {scenario.text}
                    </p>
                    <div ref={endRef} className="w-full min-h-[4.5rem] bg-gray-900 rounded-xl border-2 border-dashed border-[#3F4B48] flex justify-center items-center p-2">
                         {animationState !== 'dropped' && (
                            <span className="text-slate-100/50 text-xs sm:text-sm font-medium">
                                Drop the suitable element here
                            </span>
                        )}
                    </div>
                </div>

                {/* --- Labels Container --- */}
                <div className="w-full">
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {labels.map(label => (
                            <div key={label} className={`transition-opacity duration-200 ${animationState !== 'idle' && label === animatedLabel ? 'opacity-0' : 'opacity-100'}`}>
                                <Label ref={label === animatedLabel ? startRef : null} label={label} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- Animated Label (Dynamically Positioned) --- */}
            <div
                style={{
                    position: 'absolute',
                    top: `${positions.initialTop}px`,
                    left: `${positions.initialLeft}px`,
                    width: `${positions.width}px`,
                    height: `${positions.height}px`,
                    transition: 'transform 1s ease-in-out',
                    transform: (animationState === 'animating' || animationState === 'dropped')
                        ? `translate(${positions.deltaX}px, ${positions.deltaY}px)`
                        : 'translate(0, 0)',
                    opacity: animationState === 'idle' ? 0 : 1,
                }}
            >
                {/* We render a label inside so it has the same appearance */}
                <Label label={animatedLabel} className="w-full h-full" />
            </div>
        </div>
    );
};

export default ScenarioContent;