import React from 'react';
import CrossButton from '@/components/icon/GreenBudget/CrossButton';
import ScenarioContent from './ScenarioContext'; 

const InstructionsScreen = ({ onStartGame }) => {
  return (
    // --- FIX APPLIED HERE ---
    // Added `overflow-x-hidden` to prevent horizontal scrolling on mobile
    <div className="main-container bg-[#0A160E] flex flex-col items-center justify-center min-h-screen w-screen p-4 overflow-x-hidden">
      
      <div className="relative w-full max-w-3xl md:w-[75vw] h-auto md:h-[80vh] bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/WxAZj0TxFZ.png)] bg-no-repeat bg-cover flex flex-col items-center py-8 md:pt-[5vh] ">
        
        <div className="absolute w-12 h-12 md:w-[7vw] md:h-[7vh] -top-5 -right-5 md:-top-[3vh] md:-right-[3.5vw] z-[68]">
          <CrossButton onClick={onStartGame} />
        </div> 
        
        <h2 className="lilita text-3xl md:text-[30px] -mt-2 md:-mt-6 text-[#fff] z-[2]">
          How to Play?
        </h2>
        
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center w-full mt-8 md:mt-[15vh] gap-8 md:gap-[1vw] px-4">
          
          {/* Left column: Takes 2/3 of the space on medium screens and up */}
          <div className="flex justify-center w-full md:w-2/3 mt-4 md:mt-0">
            <ScenarioContent />
          </div>
          
          {/* Right column: Takes 1/3 of the space on medium screens and up */}
          <div className="flex flex-col items-center md:items-start w-full md:w-1/3">
            <span className="lilita text-base md:text-[15px] font-normal leading-relaxed md:leading-[28px] text-[#fff] text-center md:text-left">
              Match the description of the environment zone to its correct name:
              <br/>
              • Lithosphere 
              <br/>
              • Hydrosphere 
              <br/>
              • Biosphere 
              <br/>
              • Atmosphere 
            </span>
            
            <div className="flex flex-col justify-start items-start w-full text-white bg-[url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/KoaHzD7HnK.png)] bg-cover bg-no-repeat mt-6 md:mt-[2vh] p-4 md:p-[1vw]">
              <span className="lilita text-lg md:text-[1.2vw] font-normal text-[#fff] tracking-wide md:tracking-[0.04vw]">
                LEARNING OUTCOME:
              </span>
              <span className="w-full font-['Lilita_One'] text-base md:text-[0.9vw] font-normal leading-snug md:leading-[2vh] text-[#fff] tracking-normal md:tracking-[0.01vw] mt-1">
                You will learn to classify your surroundings into layers of earth.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;