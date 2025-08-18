import React, { useState, useEffect } from 'react';

// --- DATA ---
const scenarioData = {
    id: 1,
    question: "🔍 Sequence Puzzle",
    scenario: "Arrange these steps in natural phosphorus flow",
    options: [
      "Animal excretion",
      "Rock weathering",
      "Plant absorption",
      "Decomposition",
      "Sediment formation",
    ],
};

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    // State to hold the current order of the list items
    const [listItems, setListItems] = useState(scenarioData.options);
    
    // State to track the single item being animated ("lifted")
    const [movingItem, setMovingItem] = useState(null);

    useEffect(() => {
        const animationInterval = setInterval(() => {
            
            // 1. "Lift" ONLY Respiration by setting it as the moving item
            setMovingItem("Animal excretion");

            // 2. After a short delay, perform the swap in the list state
            setTimeout(() => {
                setListItems(currentItems => {
                    const newItems = [...currentItems];
                    const indexRespiration = newItems.indexOf("Animal excretion");
                    const indexCombustion = newItems.indexOf("Rock weathering");
                    
                    if (indexRespiration !== -1 && indexCombustion !== -1) {
                        // Swap the positions of the two items
                        [newItems[indexRespiration], newItems[indexCombustion]] = [newItems[indexCombustion], newItems[indexRespiration]];
                    }
                    return newItems;
                });
            }, 300); // Delay to make the "lift" effect visible before sliding

            // 3. After the slide animation is complete, "drop" Respiration
            setTimeout(() => {
                setMovingItem(null);
            }, 1200); // Timed to be after the lift (300ms) and slide (800ms)

        }, 3000); // The entire animation cycle repeats every 3 seconds

        // Cleanup function to clear the interval
        return () => clearInterval(animationInterval);
    }, []);

    // Each item is ~50px high + 8px gap
    const itemHeight = 58;

    return (
        <div className="w-full h-auto bg-[#00260d] rounded-lg border border-[#f2f4f6] flex flex-col md:flex-row p-4 gap-2">
            <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-6">
                <div className="flex flex-col justify-start items-start gap-2 text-start">
                    <h2 className="text-slate-100 text-xl md:text-xl font-medium leading-snug md:leading-9">
                        {scenarioData.question}
                    </h2>
                    <p className="text-gray-300 text-sm md:text-md leading-relaxed font-regular">
                        {scenarioData.scenario}
                    </p>
                    
                    {/* Container for the animated list */}
                    <div 
                        className="w-full max-w-lg mt-3 relative" 
                        style={{ height: `${listItems.length * itemHeight}px` }}
                    >
                        {listItems.map((item, index) => {
                            // The check is now for a single item
                            const isMoving = item === movingItem;
                            
                            return (
                                <div
                                    key={item}
                                    className="w-full p-4 h-[50px] flex justify-start items-center text-center rounded-lg border bg-gray-900 border-gray-700 text-slate-100 absolute"
                                    style={{
                                        top: `${index * itemHeight}px`,
                                        transition: 'top 0.8s ease-in-out, box-shadow 0.3s ease, transform 0.3s ease',
                                        // The "lifted" styles are now ONLY applied to Respiration when it's moving
                                        boxShadow: isMoving ? '0 10px 20px rgba(0, 0, 0, 0.4)' : '0px 2px 0px 0px rgba(55,70,79,1.00)',
                                        transform: isMoving ? 'scale(1.05)' : 'scale(1)',
                                        zIndex: isMoving ? 10 : 1,
                                    }}
                                >
                                    <span className="font-medium text-xs md:text-base leading-relaxed">
                                        {item}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;