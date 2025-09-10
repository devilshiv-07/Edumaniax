import React, { useState, useEffect } from 'react';
import { motion, LayoutGroup } from 'framer-motion';

const cardData = {
    intro: [
        { id: 3, text: "We’ve surveyed 120 students, and 90% showed interest.", type: "Logos", source: "intro" },
       
    ],
    body: [
        { id: 7, text: "This club can serve as a platform for creative expression.", type: "Pathos", source: "body" },
        
    ],
    conclusion: [
        { id: 12, text: "Together, we can build something meaningful.", type: "Pathos", source: "conclusion" },
    ],
};

const allCards = [
    { id: 3, text: "We’ve surveyed 120 students, and 90% showed interest.", type: "Logos", source: "intro" },
    { id: 7, text: "This club can serve as a platform for creative expression.", type: "Pathos", source: "body" },
    { id: 12, text: "Together, we can build something meaningful.", type: "Pathos", source: "conclusion" },
];

const zoneConfig = {
    intro: { name: "Introduction", limit: 3 },
    body: { name: "Main Argument", limit: 3 },
    conclusion: { name: "Final Appeal", limit: 2 },
};

// --- Animation Sequence ---
const animationSequence = [
    { cardId: 3, zoneId: 'intro' },
    { cardId: 7, zoneId: 'body' },
    { cardId: 12, zoneId: 'conclusion' },
];

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State tracks which cards are in which zone
    const [zoneCards, setZoneCards] = useState({ intro: [], body: [], conclusion: [] });

    useEffect(() => {
        const timeouts = [];
        const startAnimationCycle = () => {
            // 1. Reset all zones to be empty
            setZoneCards({ intro: [], body: [], conclusion: [] });

            // 2. Sequence the card movements with delays
            timeouts.push(setTimeout(() => {
                const card = allCards.find(c => c.id === animationSequence[0].cardId);
                setZoneCards(prev => ({ ...prev, [animationSequence[0].zoneId]: [card] }));
            }, 1000));

            timeouts.push(setTimeout(() => {
                const card = allCards.find(c => c.id === animationSequence[1].cardId);
                setZoneCards(prev => ({ ...prev, [animationSequence[1].zoneId]: [card] }));
            }, 2500));

            timeouts.push(setTimeout(() => {
                const card = allCards.find(c => c.id === animationSequence[2].cardId);
                setZoneCards(prev => ({ ...prev, [animationSequence[2].zoneId]: [card] }));
            }, 4000));
        };

        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 6500);

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    const droppedCardIds = [...zoneCards.intro, ...zoneCards.body, ...zoneCards.conclusion].map(c => c.id);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            <LayoutGroup>
                <div className="w-full max-w-5xl flex flex-col items-center gap-6">
                    {/* --- Top Drop Zones --- */}
                    <div className="w-full flex flex-col md:flex-row gap-4">
                        {Object.keys(zoneConfig).map(zoneId => {
                            const cards = zoneCards[zoneId];
                            return (
                                <div key={zoneId} className="flex-1 flex flex-col gap-4 pt-4 border-2 border-dashed border-[#3F4B48] rounded-xl bg-gray-900/50 min-h-[200px]">
                                    <h2 className="text-center text-md font-bold text-yellow-400">{zoneConfig[zoneId].name} ({cards.length}/{zoneConfig[zoneId].limit})</h2>
                                    <div className="flex-grow flex flex-col gap-2 p-2 rounded-lg">
                                        {cards.length > 0 ? (
                                            cards.map(card => (
                                                <motion.div layoutId={card.id} key={card.id} className="w-full text-center">
                                                    <div className="p-3 bg-green-800/60 rounded-lg shadow-inner border border-green-500 text-gray-100 text-sm font-medium">
                                                        {card.text}
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <span className="text-slate-100/50 text-sm font-medium">Drop cards here</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    
                    {/* --- Bottom Card Bank --- */}
                    <div className="w-full p-4 bg-gray-800/50 border-2 border-[#3F4B48] rounded-xl">
                        <h3 className="text-lg font-bold text-cyan-300 mb-3 text-center">Your Magical Card Bank</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {allCards.map(card => {
                                const isCardInBank = !droppedCardIds.includes(card.id);
                                if (isCardInBank) {
                                    return (
                                        <motion.div key={card.id} layoutId={card.id} className="p-3 bg-[#2a3b42] border-2 border-cyan-700 rounded-lg shadow-md text-sm font-medium text-gray-200">
                                            {card.text}
                                        </motion.div>
                                    );
                                } else {
                                    return (
                                        <div key={card.id} className="p-3 rounded-lg opacity-0">
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