import React from 'react';
import CrossButton from '@/components/icon/GreenBudget/CrossButton';
import ScenarioContent from './ScenarioContent'; // Corrected import name

const InstructionsScreen = ({ onStartGame }) => {
  return (
    // Main container to center the pop-up
    <div className="main-container bg-[#0A160E] flex flex-col items-center justify-center min-h-screen w-screen p-4 overflow-x-hidden">
      
      {/* Pop-up box with responsive width and height */}
      <div className="relative w-full max-w-[90vw] md:w-[75vw] h-auto md:h-[80vh] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/WxAZj0TxFZ.png)] bg-no-repeat bg-cover flex flex-col items-center py-8 md:pt-[5vh] ">
        
        {/* Cross button with responsive size and position */}
        <div className="absolute w-12 h-12 md:w-[7vw] md:h-[7vh] -top-5 -right-5 md:-top-[3vh] md:-right-[3.5vw] z-[68]">
          <CrossButton onClick={onStartGame} />
        </div> 
        
        {/* "How to Play?" title with responsive font size and margin */}
        <h2 className="lilita text-3xl md:text-[30px] -mt-2 md:-mt-6 text-[#fff] z-[2]">
          How to Play?
        </h2>
        
        {/* Container for the main content. Stacks vertically on mobile, row on desktop. */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full mt-8 md:mt-[15vh] gap-8 md:gap-[1vw] px-4">
          
          {/* Left column: ScenarioContent. Takes full width on mobile. */}
          <div className="flex justify-center w-full md:w-auto mt-15 md:-mt-15">
            <ScenarioContent />
          </div>
          
          {/* Right column: Text and learning outcome. Takes full width on mobile. */}
          <div className="flex flex-col items-center w-full md:w-[25vw] text-center md:text-left mt-0 md:-mt-7 lg:mt-0">
            <span className="lilita text-base lg:text-[15px] font-normal leading-relaxed md:leading-tight lg:leading-[28px] text-[#fff]">
              Connect human activities to their effects on Earth's systems!
              <br/>
              Read the Cause Card (human activity)
              <br/>
              Select the correct Effect
              <br/>
              Choose which Earth System is affected
              <br/>
              Learn amazing facts or face a System Shock!
            </span>
            
            {/* Learning Outcome box with responsive text sizes */}
            <div className="flex flex-col justify-start items-start w-full md:w-[25vw] text-white bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/KoaHzD7HnK.png)] bg-cover bg-no-repeat mt-6 md:mt-[2vh] p-4 md:p-[1vw]">
              <span className="lilita text-lg md:text-[1.2vw] font-normal text-[#fff] tracking-wide md:tracking-[0.04vw]">
                LEARNING OUTCOME:
              </span>
              <span className="w-full font-['Lilita_One'] text-base text-base md:text-[14px] font-normal leading-snug md:leading-[2vh] text-[#fff] tracking-normal md:tracking-[0.01vw] mt-1">
                Discover how human activities create ripple effects across our
          planet's systems! Connect causes to effects and learn about Earth's
          amazing interconnected world!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;