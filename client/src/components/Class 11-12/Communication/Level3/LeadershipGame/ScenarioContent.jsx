import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';

// --- Data from your reference code (Full list restored) ---
const originalCards = [
    { id: 7, text: "We have signatures from 40 students who support this." },
    { id: 4, text: "I’ve led 2 successful campaigns in the past." },
    { id: 6, text: "It fits well with the school’s goals of inclusivity and leadership." },
];

const zoneNames = ["Introduction", "Main Argument", "Final Appeal"];

// Define the sequence of cards to animate
const animationSequence = [
    { cardId: 7, zoneIndex: 0 },
    { cardId: 4, zoneIndex: 1 },
    { cardId: 6, zoneIndex: 2 },
];

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // A single state to track where each card is located: 'bank' or a zone index (0, 1, 2)
    const [cardLocations, setCardLocations] = useState(() => {
        const locations = {};
        originalCards.forEach(card => {
            locations[card.id] = 'bank';
        });
        return locations;
    });

    useEffect(() => {
        const timeouts = [];
        const startAnimationCycle = () => {
            // 1. Reset all cards to the 'bank'
            setCardLocations(prev => {
                const newLocations = { ...prev };
                Object.keys(newLocations).forEach(key => {
                    newLocations[key] = 'bank';
                });
                return newLocations;
            });

            // 2. Sequence the card movements with delays
            timeouts.push(setTimeout(() => {
                setCardLocations(prev => ({ ...prev, [animationSequence[0].cardId]: animationSequence[0].zoneIndex }));
            }, 1000));

            timeouts.push(setTimeout(() => {
                setCardLocations(prev => ({ ...prev, [animationSequence[1].cardId]: animationSequence[1].zoneIndex }));
            }, 2500));

            timeouts.push(setTimeout(() => {
                setCardLocations(prev => ({ ...prev, [animationSequence[2].cardId]: animationSequence[2].zoneIndex }));
            }, 4000));
        };

        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 6500); // Loop every 6.5 seconds

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    const cardLayoutClasses = "p-3 border-2 rounded-lg text-sm font-medium";

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <LayoutGroup>
                <div className="w-full max-w-5xl flex flex-col items-center gap-6">
                    {/* --- Top Drop Zones --- */}
                    <div className="w-full flex flex-col md:flex-row gap-4">
                        {zoneNames.map((zoneName, zoneIndex) => {
                            const cardInZone = originalCards.find(c => cardLocations[c.id] === zoneIndex);
                            return (
                                // --- SOLUTION: Increased min-height to prevent resizing on drop ---
                                <div key={zoneIndex} className="flex-1 flex flex-col gap-4 p-4 border-2 border-dashed border-[#3F4B48] rounded-xl bg-gray-900/50 min-h-52">
                                    <h2 className="text-center text-md font-bold text-yellow-400">{zoneName}</h2>
                                    <div className="flex-grow flex items-center justify-center p-2 rounded-lg">
                                        {cardInZone ? (
                                            <motion.div layoutId={cardInZone.id} className="w-full text-center">
                                                <div className="p-3 bg-green-800/60 rounded-lg shadow-inner border border-green-500 text-gray-100 text-sm font-medium">
                                                    {cardInZone.text}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <span className="text-slate-100/50 text-sm font-medium">Drop a card here</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* --- Bottom Card Bank (FIXED) --- */}
                    <div className="w-full p-4 bg-gray-800/50 border-2 border-[#3F4B48] rounded-xl">
                        <h3 className="text-lg font-bold text-cyan-300 mb-3 text-center">Your Magical Card Bank</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {originalCards.map(card => {
                                const isCardInBank = cardLocations[card.id] === 'bank';
                                
                                if (isCardInBank) {
                                    return (
                                        <motion.div 
                                            key={card.id} 
                                            layoutId={card.id} 
                                            className={`${cardLayoutClasses} bg-[#2a3b42] border-cyan-700 shadow-md text-gray-200`}
                                        >
                                            {card.text}
                                        </motion.div>
                                    );
                                } else {
                                    return (
                                        <div key={card.id} className={`${cardLayoutClasses} invisible`}>
                                            {card.text}
                                        </div>
                                    );
                                }
                            })}
                        </div>
                    </div>
                </div>
            </LayoutGroup>
        </div>
    );
};

export default ScenarioContent;