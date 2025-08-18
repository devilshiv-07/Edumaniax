import React, { useState, useEffect } from 'react';

// --- Data and Styling Reference from MeltdownTracker.js ---

// Data: The 8 options to be displayed in the grid
const allImpactOptions = [
  "Sea level rise", "Cyclones and habitat loss", "Ice caps melting", "Deforestation & carbon loss",
  "Flash floods and landslides", "Urban flooding", "Drought and desertification", "Melting glaciers",
];

// A reusable component for the cards, styled exactly like the reference code
function ImpactOptionCard({ impactText, isSelected }) {
  const cardClasses = `
    relative flex items-center justify-center p-3 h-[65px] sm:h-[70px] 
    rounded-xl border-2 transition-all duration-300 ease-in-out
    ${isSelected
      ? "bg-[#202f36] border-[#5f8428] shadow-[0_4px_0_0_#5f8428]"
      : "bg-[#131f24] border-[#37464f] shadow-[0_4px_0_0_#37464f]"
    }
  `;
  const textClasses = `
    font-['Inter'] text-center text-sm sm:text-base font-medium 
    ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}
  `;

  return (
    <div className={cardClasses}>
      <span className={textClasses}>{impactText}</span>
    </div>
  );
}


// --- The Main ScenarioContent Component ---

const ScenarioContent = () => {
    // This state holds the index of the card that is currently "selected"
    const [currentlySelectedIndex, setCurrentlySelectedIndex] = useState(0);

    useEffect(() => {
        // This effect creates the animation loop.
        const animationTimer = setInterval(() => {
            // It increments the index, looping back to 0 at the end.
            setCurrentlySelectedIndex(prevIndex => 
                (prevIndex + 1) % allImpactOptions.length
            );
        }, 1500); // The selection changes every 1.5 seconds.

        // Cleanup the interval when the component is removed.
        return () => clearInterval(animationTimer);
    }, []); // The empty array ensures this effect runs only once.

    return (
        // Main container with consistent styling from previous versions.
        <div className="w-full max-w-4xl mx-auto h-auto bg-[#00260d] rounded-lg border border-[#37464f] flex flex-col p-4 sm:p-6 md:p-8 gap-6 font-sans">
            
            {/* Grid container for the 8 option cards */}
            <div className="w-full grid grid-cols-2 gap-4 sm:gap-6">
                
                {allImpactOptions.map((impact, index) => (
                    <ImpactOptionCard
                        key={impact}
                        impactText={impact}
                        // The card is "selected" only if its index matches the current state.
                        isSelected={index === currentlySelectedIndex}
                    />
                ))}

            </div>
        </div>
    );
};

export default ScenarioContent;