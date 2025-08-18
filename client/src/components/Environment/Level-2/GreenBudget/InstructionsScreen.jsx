import React from 'react';
import CrossButton from '@/components/icon/GreenBudget/CrossButton';
import ScenarioContent from './ScenarioContent.jsx';

const InstructionsScreen = ({ onStartGame }) => {
  return (
    <div className="main-container bg-[#0A160E] flex flex-col items-center justify-center min-h-screen w-full p-4 md:p-8 overflow-x-hidden">
      
      {/* MODIFIED: Added `overflow-hidden` to this container.
        This is the most direct way to "cut" any content (like the close button)
        that flows outside of the pop-up's boundaries, guaranteeing no horizontal scroll.
      */}
      <div className="relative w-full max-w-6xl lg:w-[90vw] h-auto bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/WxAZj0TxFZ.png)] bg-cover bg-no-repeat flex flex-col items-center py-8 px-4 md:px-10 lg:pt-0 ">
        
        {/* Close button with responsive size and position */}
        <div className="absolute w-12 h-12 -top-5 -right-5 md:w-16 md:h-16 lg:-top-6 lg:-right-8 z-20">
          <CrossButton onClick={onStartGame} />
        </div> 
        
        <h2 className="lilita text-3xl md:text-4xl text-white mb-11 md:mb-0 text-center z-10 
                       lg:absolute lg:top-[1vh] lg:left-1/2 lg:-translate-x-1/2 lg:transform lg:mb-0">
          How to Play?
        </h2>
        
        <div className="flex flex-col lg:flex-row items-center lg:items-start w-full gap-8 mt-4 md:mt-[7vh] lg:mt-[11vh]">
          
          {/* Left Column: Instructions & Learning Outcome */}
          

          {/* Right Column: ScenarioContent Demo */}
          <div className="w-full lg:w-3/5 flex justify-center order-1 ">
            <ScenarioContent />
          </div>
          <div className="w-full lg:w-2/5 flex flex-col items-center lg:items-start text-center lg:text-left order-2 ">
            <div className="lilita text-base md:text-lg leading-relaxed text-white">
              <p className="mb-2">You have ₹500 and 3 minutes for each scenario!</p>
              <p className="mb-4">Select 3 items that best support sustainability .</p>
              <p>Scoring:</p>
              <ul className="list-none ml-0">
                <li>+5 = All 3 eco-wise</li>
                <li>+2 = 2 sustainable</li>
                <li>0 = Mostly unsustainable</li>
              </ul>
              <p className="mt-2">Time Limit: 3 minutes per scenario</p>
            </div>
            
            <div className="w-full max-w-sm mt-6 text-white bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/KoaHzD7HnK.png)] bg-cover bg-no-repeat p-4 rounded-lg">
              <span className="lilita text-lg md:text-xl font-normal text-white tracking-wide">
                LEARNING OUTCOME:
              </span>
              <span className="block mt-1 font-sans text-sm md:text-base leading-snug">
                Students experience the trade-offs and unexpected costs of real life.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;