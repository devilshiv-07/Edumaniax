import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

// --- A fixed, non-shuffled layout for the cards ---
// The uniqueId corresponds to the card's position in the grid (0 to 5)
const fixedCardsLayout = [
    { id: 1, type: 'scenario', content: "🏖️ Tourist Resort Motorboats", uniqueId: 0 },
    { id: 2, type: 'externality', content: "💧 Water Pollution & Algae", uniqueId: 1 },
    { id: 3, type: 'externality', content: "🗑️ Textile Waste & Poor Labor", uniqueId: 2 },
    { id: 3, type: 'scenario', content: "👕 Fast Fashion Store", uniqueId: 3 },
    { id: 2, type: 'scenario', content: "🌾 Agricultural Fertilizers", uniqueId: 4 },
    { id: 1, type: 'externality', content: "🐠 Coral Damage & Noise", uniqueId: 5 },
];

// --- CSS for 3D flip animation ---
const flipAnimationStyles = `
  .transform-style-3d { transform-style: preserve-3d; }
  .rotate-y-180 { transform: rotateY(180deg); }
  .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
`;

const ScenarioContent = () => {
    // State to manage the card positions and their visual status
    const [cards, setCards] = useState([]);
    const [flippedUniqueIds, setFlippedUniqueIds] = useState([]);
    const [matchedPairIds, setMatchedPairIds] = useState([]);

    // --- Set the fixed card layout on the first render ---
    useEffect(() => {
        setCards(fixedCardsLayout);
    }, []);

    // --- Main Animation Loop Controller ---
    useEffect(() => {
        // Don't start the animation until the cards have been initialized
        if (cards.length === 0) return;

        const allTimeouts = [];

        const animationCycle = () => {
            // --- Define the timed sequence of state updates ---
            
            // 1. Mismatch Demo: Flip Coral (5), then Water Pollution (1)
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([5]), 1500));
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([5, 1]), 2500));
            // They don't match, so they flip back
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([]), 4000));

            // 2. Start Correctly Matching Pairs
            // Match Pair 1: Coral (5) and Tourist (0)
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([5]), 5000));
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([5, 0]), 6000));
            allTimeouts.push(setTimeout(() => {
                setMatchedPairIds([1]); // Mark pair 1 as matched
                setFlippedUniqueIds([]); // Clear the temporary flip state
            }, 6500));

            // Match Pair 2: Water Pollution (1) and Agricultural Fertilizer (4)
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([1]), 7500));
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([1, 4]), 8500));
            allTimeouts.push(setTimeout(() => {
                setMatchedPairIds(prev => [...prev, 2]); // Add pair 2 to matched
                setFlippedUniqueIds([]);
            }, 9000));

            // Match Pair 3: Textile Waste (2) and Fast Fashion (3)
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([2]), 10000));
            allTimeouts.push(setTimeout(() => setFlippedUniqueIds([2, 3]), 11000));
            allTimeouts.push(setTimeout(() => {
                setMatchedPairIds(prev => [...prev, 3]); // Add pair 3 to matched
                setFlippedUniqueIds([]);
            }, 11500));
            
            // 3. Reset: After all pairs are matched, flip all cards down
            allTimeouts.push(setTimeout(() => setMatchedPairIds([]), 13000));
        };

        // Start the first cycle
        animationCycle();
        
        // Create an interval to loop the animation
        const loop = setInterval(animationCycle, 13500); // Loop duration

        // Cleanup function to clear timeouts and interval on unmount
        return () => {
            clearInterval(loop);
            allTimeouts.forEach(clearTimeout);
        };
    }, [cards.length]); // This effect runs only once when cards are first populated

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 sm:p-6 font-['Inter'] text-white">
            <style>{flipAnimationStyles}</style>

            <div className="w-full max-w-2xl">
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                    {cards.map((card) => {
                        const isFlipped = flippedUniqueIds.includes(card.uniqueId) || matchedPairIds.includes(card.id);
                        const isMatched = matchedPairIds.includes(card.id);

                        let cardStyle, textColor;

                        if (isMatched) {
                            cardStyle = "border-green-500 bg-green-500/20 shadow-[0_2px_0_0_#16a34a]";
                            textColor = "text-green-400";
                        } else if (isFlipped) {
                            cardStyle = "border-cyan-500 bg-cyan-500/20 shadow-[0_2px_0_0_#0891b2]";
                            textColor = "text-cyan-300";
                        } else {
                            cardStyle = "border-[#37464F] bg-[#131F24] shadow-[0_2px_0_0_#37464F]";
                        }

                        return (
                            <div
                                key={card.uniqueId}
                                className="aspect-square perspective-[1000px]"
                            >
                                <div className={`relative w-full h-full transform-style-3d transition-transform duration-500 ${isFlipped ? 'rotate-y-180' : ''}`}>
                                    {/* Back of the Card */}
                                    <div className={`absolute w-full h-full flex items-center justify-center rounded-lg backface-hidden ${cardStyle}`}>
                                        <div className="text-4xl sm:text-5xl">🔍</div>
                                    </div>

                                    {/* Front of the Card */}
                                    <div className={`absolute w-full h-full flex flex-col justify-center items-center text-center p-2 sm:p-3 rounded-lg backface-hidden rotate-y-180 ${cardStyle}`}>
                                        <div className="text-xl sm:text-2xl md:text-3xl mb-1">
                                            {card.content.split(" ")[0]}
                                        </div>
                                        <div className={`text-[0.6rem] sm:text-xs md:text-sm font-bold break-words ${textColor}`}>
                                            {card.content.substring(card.content.indexOf(" ") + 1)}
                                        </div>
                                        {isMatched && (
                                            <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-green-500">
                                                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;