import React, { useState, useEffect } from 'react';

// Card data remains the same
const categories = [
  { name: "Natural–Biotic", image: "/environmentGameInfo/ClassifyIt/biotic.png" },
  { name: "Natural–Abiotic", image: "/environmentGameInfo/ClassifyIt/abiotic.png" },
  { name: "Human-Made", image: "/environmentGameInfo/ClassifyIt/human_made.png" },
  { name: "Social", image: "/environmentGameInfo/ClassifyIt/social.png" },
];

const SELECTED_DURATION_MS = 1000; // 1 second
const PAUSE_BETWEEN_CYCLES_MS = 1500; // 1.5 seconds

const ANIMATED_CARD_INDEX = 0;

const ScenarioContent = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  // The animation logic does not need to change, as it's not tied to layout geometry.
  useEffect(() => {
    let timer;

    const animateOneCard = () => {
      setSelectedIndex(ANIMATED_CARD_INDEX);

      timer = setTimeout(() => {
        setSelectedIndex(null);
        timer = setTimeout(animateOneCard, PAUSE_BETWEEN_CYCLES_MS);
      }, SELECTED_DURATION_MS);
    };

    animateOneCard();

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    // Responsive container: full-width on mobile, vw-based on desktop.
    <div
      className="w-full md:w-[46.354vw] h-auto md:h-[35vh] p-4 md:py-[7vh] md:px-[1vw] bg-green-950 rounded-lg md:rounded-[0.521vw] outline outline-1 outline-offset-[-1px] outline-gray-100 flex justify-center items-center"
    >
      {/* Responsive layout for cards:
        - Mobile: A 2x2 grid for optimal space usage.
        - Desktop (md): The original horizontal flex layout.
      */}
      <div className="grid grid-cols-2 gap-4 md:flex md:justify-start md:items-center md:gap-[0.729vw]">
        {categories.map((cat, index) => {
          const isSelected = selectedIndex === index;

          return (
            <div
              key={cat.name}
              className={`
                w-full md:w-[10.5vw] h-48 md:h-[22vh] p-2 md:py-[1.5vh] bg-gray-800/30 rounded-lg md:rounded-[0.521vw] 
                inline-flex flex-col justify-start items-center gap-2 md:gap-[1.563vh]
                transition-all duration-300 ease-in-out
                border-2
                ${isSelected ? 'scale-105 border-green-500' : 'border-transparent'}
              `}
            >
              {/* Responsive image size */}
              <img 
                className="w-16 h-24 md:w-[6vw] md:h-[14vh] object-contain" 
                src={cat.image} 
                alt={cat.name} 
              />
              {/* Responsive text container and font size */}
              <div className="w-full md:w-[13.542vw] inline-flex justify-center items-center">
                <div className="text-center justify-center text-slate-100 text-sm md:text-[1vw] leading-tight md:leading-[1.042vw]">
                  {cat.name.replace('–', '- ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScenarioContent;