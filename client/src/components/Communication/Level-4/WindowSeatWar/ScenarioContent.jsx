import React, { useState, useEffect } from 'react';

// --- Data for the Demo ---
const demoStatements = [
    { id: "1", text: "How about I sit by the window in the morning, and you get it after lunch?" },
    { id: "4", text: "Fine, I’ll just sit alone then. Don’t talk to me!" },
    { id: "5", text: "Why do you always have to ruin things?" },
];

const animatedStatement = demoStatements[0];

// --- Helper Components for UI ---
const StatementCard = ({ text, className = '' }) => (
    <div 
  className={`
    p-3 bg-gray-800 border border-gray-700 text-white rounded-lg
    w-60 shrink-0
    ${className}
  `}
>
  {text}
</div>
);

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDropped, setIsDropped] = useState(false);

    useEffect(() => {
        const animationLoop = setInterval(() => {
            setIsAnimating(true);
            setIsDropped(false);

            const moveTimeout = setTimeout(() => {
                setIsDropped(true);
            }, 100);

            const resetTimeout = setTimeout(() => {
                setIsAnimating(false);
                setIsDropped(false);
            }, 2500);

            return () => {
                clearTimeout(moveTimeout);
                clearTimeout(resetTimeout);
            };
        }, 3500);

        return () => clearInterval(animationLoop);
    }, []);

    // Define consistent width for columns and the animated card to prevent shrinking
    const columnWidthClass = "w-full md:w-[calc(50%-0.75rem)]"; // 0.75rem is half of md:gap-6 (1.5rem)

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg overflow-hidden no-scrollbar">
            
            <p className="text-sm md:text-md mb-4 text-gray-300 text-center">
                Drag the best resolution options into the box. Find all three correct solutions!
            </p>

            <div className="w-full max-w-4xl h-[350px] relative">
                
                {/* --- The UI Layout --- */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 w-full h-full absolute inset-0">
                    
                    {/* Left Box: Available Statements */}
                    <div className={`${columnWidthClass} h-auto bg-[rgba(32,47,54,0.5)] rounded-xl p-4 shadow-md no-scrollbar`}>
                        <h2 className="font-semibold text-md mb-4 text-gray-200">🧩 Available Statements</h2>
                        <div className="space-y-3">
                            {demoStatements.map((statement, index) => (
                                <StatementCard
                                    key={statement.id}
                                    text={statement.text}
                                    className={index === 0 && isAnimating ? 'opacity-0' : 'opacity-100 transition-opacity'}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Box: Resolution Box */}
                    <div className={`${columnWidthClass} h-full bg-green-900/30 rounded-xl p-4 shadow-md border-2 border-dashed border-green-400`}>
                        <h2 className="font-semibold text-md mb-4 text-gray-200">📥 Resolution Box</h2>
                        
                        <div className={isDropped ? 'opacity-100 transition-opacity delay-1000' : 'opacity-0'}>
                           <StatementCard text={animatedStatement.text} />
                        </div>

                        {!isDropped && (
                             <p className="text-gray-500 italic text-center mt-10">
                                Drop resolution statements here...
                            </p>
                        )}
                    </div>
                </div>

                {/* --- The Absolutely Positioned Animated Card (FIXED) --- */}
                <div
                    className={`
                        absolute top-[57px] left-[18px]
                        ${columnWidthClass} 
                        transition-transform duration-1000 ease-in-out
                        pointer-events-none
                        ${isAnimating ? 'opacity-100' : 'opacity-0'}
                        ${isDropped 
                            // Precise transform for desktop (card width + gap) and mobile (vertical stack)
                            ? 'md:translate-x-[calc(100%+1.5rem)] translate-y-[216px] md:translate-y-0' 
                            : 'translate-x-0 translate-y-0'
                        }
                    `}
                >
                    <StatementCard text={animatedStatement.text} />
                </div>

            </div>
        </div>
    );
};

export default ScenarioContent;