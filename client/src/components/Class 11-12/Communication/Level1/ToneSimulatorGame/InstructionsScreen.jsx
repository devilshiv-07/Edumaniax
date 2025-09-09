import React from 'react';
import CrossButton from '@/components/icon/GreenBudget/CrossButton';
import ScenarioContent from './ScenarioContent.jsx'; // Make sure this component is adapted for the new text if needed.

const InstructionsScreen = ({ onStartGame }) => {
  return (
    // CHANGED: This is now a full-screen overlay with a semi-transparent background
    <div className="fixed inset-0 bg-[#0A160E]/80 flex flex-col items-center justify-center z-50 p-4">
      
      {/* Pop-up box with a relative position context for the absolute title */}
      <div className="relative w-full max-w-6xl lg:w-[90vw] h-auto bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/WxAZj0TxFZ.png)] bg-cover bg-no-repeat flex flex-col items-center py-16 px-4 md:px-10 ">
        
        {/* Close button remains the same */}
        <div className="absolute w-12 h-12 -top-5 -right-5 md:w-16 md:h-16 lg:-top-6 lg:-right-8 z-20">
          <CrossButton onClick={onStartGame} />
        </div> 
        
        {/* Title is now absolutely positioned for precise placement */}
        <h2 className="lilita text-3xl md:text-4xl text-white mb-6 text-center z-10 
                       absolute top-[4vh] md:top-[2.5vh] lg:top-[1vh] lg:left-1/2 lg:-translate-x-1/2 lg:transform lg:mb-0">
          How to Play?
        </h2>
        
        {/* Added top margin to make space for the absolute title */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start w-full gap-11 mt-4 lg:mt-[7vh]">
          
          {/* Left Column (DEMO): ScenarioContent component from your original code */}
          <div className="w-full lg:w-3/5 flex justify-center order-1 lg:order-1 mt-11 lg:mt-0">
            <ScenarioContent />
          </div>

          {/* Right Column (TEXT): Instructions & Learning Outcome */}
          <div className="w-full lg:w-2/5 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-2 mt-2">
            <div className="lilita text-base md:text-lg leading-relaxed text-white">
              <ul className="list-disc list-inside mb-2 pl-4">
                <li>You’ll face 3 real-life scenarios: with a friend, a principal, and a peer in conflict.</li>
                <li>Select or write a response that matches the right tone (casual, formal, assertive). </li>
                <li>You must choose the correct tone to move to the next step. </li>
                <li>You have 7 minutes to complete the challenge! </li>
              </ul>
            </div>
            
            <div className="w-full max-w-sm mt-6 text-white bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/KoaHzD7HnK.png)] bg-cover bg-no-repeat p-4 rounded-lg">
              <span className="lilita text-lg md:text-xl font-normal text-white tracking-wide">
                LEARNING OUTCOME:
              </span>
              <span className="block mt-1 font-sans text-sm md:text-base leading-snug">
                Learn how to adapt your tone based on who you’re speaking to.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;