import React from 'react';
import CrossButton from '@/components/icon/GreenBudget/CrossButton';
import ScenarioContent from './ScenarioContent.jsx';

const InstructionsScreen = ({ onStartGame }) => {
  return (
    <div className="fixed inset-0 bg-[#0A160E]/80 flex items-start lg:items-center justify-center z-50 p-4 overflow-x-hidden overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-[#0F2D1E] border-2 border-[#053C21] shadow-2xl">
        
        <div className="absolute w-12 h-12 -top-5 -right-5 md:w-16 md:h-16 lg:-top-6 lg:-right-6 z-20">
          <CrossButton onClick={onStartGame} />
        </div> 

        <div className="w-full bg-[#28343A] py-4 px-6 ">
          <h2 className="lilita text-3xl md:text-4xl text-white text-center">
            How to Play?
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-start w-full gap-8 md:gap-12 p-6 md:p-10">
        
          <div className="w-full lg:w-3/5 flex justify-center rounded-xl">
            <ScenarioContent />
          </div>

          <div className="w-full lg:w-2/5 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="lilita text-base md:text-lg leading-relaxed text-white">
    <p className="mb-2">🧩 Step into the role of Student Spokesperson!</p>
    <p className="mb-2">🎯 Your Task:</p>
    <ul className="list-disc list-inside mb-2 pl-4">
      <li>Respond to a PR crisis after a club’s social media post caused offense</li>
      <li>Make 3 key decisions: initial reaction, tone of response, and closing statement</li>
      <li>Write a 4–5 line public message that acknowledges, empathizes, and provides next steps</li>
      <li>Avoid blame-shifting or defensive language</li>
    </ul>
    <p className="mb-2">⏰ You’ll have ~10 minutes to complete the challenge!</p>
            </div>
            
            <div className="w-full max-w-sm mt-8 bg-yellow-500 bg-cover bg-no-repeat p-4 rounded-lg text-white">
              <span className="lilita text-lg md:text-xl font-normal tracking-wide">
                LEARNING OUTCOME:
              </span>
              <span className="block mt-1 font-sans text-sm md:text-base leading-snug">
                Respond appropriately in public-facing, high-stakes moments
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;