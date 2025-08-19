import React from 'react';
import CrossButton from '@/components/icon/GreenBudget/CrossButton';
import ScenarioContent from './ScenarioContent.jsx';

const InstructionsScreen = ({ onStartGame }) => {
  return (
    // Main container to center the pop-up
    <div className="main-container bg-[#0A160E] flex flex-col items-center justify-center min-h-screen w-screen p-4 overflow-x-hidden">
      
      {/* Pop-up box with a relative position context for the absolute title */}
      <div className="relative w-full max-w-6xl lg:w-[90vw] h-auto bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/WxAZj0TxFZ.png)] bg-cover bg-no-repeat flex flex-col items-center py-16 px-4 md:px-10 ">
        
        {/* Close button remains the same */}
        <div className="absolute w-12 h-12 -top-5 -right-5 md:w-16 md:h-16 lg:-top-6 lg:-right-8 z-20">
          <CrossButton onClick={onStartGame} />
        </div> 
        
        {/* MODIFIED: Title is now absolutely positioned on large screens for precise placement */}
        <h2 className="lilita text-3xl md:text-4xl text-white mb-6 text-center z-10 
                   absolute top-[4vh] md:top-[2.5vh] lg:top-[1vh] lg:left-1/2 lg:-translate-x-1/2 lg:transform lg:mb-0">
          How to Play?
        </h2>
        
        {/* MODIFIED: Added top margin on large screens to make space for the absolute title */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start w-full gap-11 mt-4 lg:mt-[7vh]">
          
          {/* Left Column: Instructions & Learning Outcome */}
          

          {/* Right Column: ScenarioContent Demo */}
          <div className="w-full lg:w-3/5 flex justify-center order-1  mt-11 lg:mt-0">
            <ScenarioContent />
          </div>
          <div className="w-auto flex flex-col items-center lg:items-start text-center lg:text-left order-2  mt-2">
            <div className="lilita text-base md:text-lg leading-relaxed text-white">
<p className="mb-2">You will be given descriptions of environment zones</p>
<p className="mb-2">Match each description with the correct zone among :</p>
<p className="mb-2">Lithosphere, Atmosphere, Hydrosphere, and Biosphere</p>
<p className="mb-2">Score +1 point for every correct match within 2 minutes</p>
            </div>
            
            <div className="w-full max-w-sm mt-6 text-white bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/KoaHzD7HnK.png)] bg-cover bg-no-repeat p-4 rounded-lg">
              <span className="lilita text-lg md:text-xl font-normal text-white tracking-wide">
                LEARNING OUTCOME:
              </span>
              <span className="block mt-1 font-sans text-sm md:text-base leading-snug">
                 Identify and classify Earth's major environmental zones and their roles
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;