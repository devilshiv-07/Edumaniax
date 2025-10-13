import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const [showMatch1, setShowMatch1] = useState(false);
  const [showMatch2, setShowMatch2] = useState(false);
  const [showMatch3, setShowMatch3] = useState(false);

  // Animation sequence for matching examples
  useEffect(() => {
    const sequence = [
      () => setShowMatch1(true),
      () => setShowMatch2(true),
      () => setShowMatch3(true),
      () => {
        setShowMatch1(false);
        setShowMatch2(false);
        setShowMatch3(false);
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      sequence[currentStep]();
      currentStep = (currentStep + 1) % sequence.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const animatedMatchExample = (
    <div
      key="match-example"
      className="bg-[#131F24] border border-gray-600 rounded-lg p-4 mb-2"
    >
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="text-white mb-2">Brand</div>
          {showMatch1 && (
            <div className="bg-blue-500 text-white p-2 rounded">
              Sports Shoes
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="text-white mb-2">Content Type</div>
          {showMatch1 && (
            <div className="bg-green-500 text-white p-2 rounded">
              Behind-the-scenes video
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
             overflow-y-auto bg-black/50"
    >
      <div
        className="relative bg-[#0e341d] shadow-xl w-[95%] max-w-6xl text-white z-10 
               border border-gray-700 rounded-2xl
               max-h-[90vh] overflow-y-auto
               p-4 sm:p-6 m-4"
      >
        {/* Cancel button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 w-24 h-24 rounded-full shadow-md hover:scale-110 transition-transform z-50"
        >
          <img
            src={CancelIcon}
            alt="Close"
            className="w-full h-full object-contain"
          />
        </button>

        {/* Top nav */}
        <div className="flex justify-center items-center bg-[#28343A] px-5 py-3 border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl md:text-3xl lilita-one-regular font-bold text-white">
            How to Play?
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-4 gap-4">
          {/* Game Content — will move below on mobile */}
          <div className="w-full lg:w-2/3 border border-green-800 rounded-xl p-4 bg-[#00260E] order-2 lg:order-1">
            <div className="flex flex-col lg:flex-row gap-4 w-full justify-center">
              {/* Matching Game Demo */}
              <div className="w-full lg:w-96">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  Matching Game Example
                </h2>
                <div className="bg-[#202F364D] p-4 rounded-xl shadow-lg w-full min-h-[400px]">
                  {/* Game Headers */}
                  <div className="grid grid-cols-2 gap-4 mb-3 text-xs font-semibold text-yellow-400 border-b border-gray-600 pb-2">
                    <div>Brand</div>
                    <div>Content Type</div>
                  </div>
                  
                  {/* Animated Match Examples */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {animatedMatchExample}
                    </AnimatePresence>
                    
                    {/* Static example matches */}
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                        <div>Ice Cream</div>
                        <div>Poll: 'Pick your fave flavour 👋'</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                        <div>Bookstore</div>
                        <div>Reel: '3 books to read before you turn 13'</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                        <div>Toy Company</div>
                        <div>Meme: 'When your toy breaks on Day 1 🤯'</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="w-full lg:w-64">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  How to Play
                </h2>
                <div className="bg-[#0A160E] p-4 rounded-xl shadow-lg w-full min-h-[400px] border border-gray-600">
                  <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Click on a brand from the left column</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Click on the matching content type</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>See your matches in the results column</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Match all brands to complete the game</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Instructions — moves to top on mobile */}
          <div className="flex flex-col lg:w-1/3 gap-4 order-1 lg:order-2">
            <div className="space-y-4">
              {/* Challenge Title */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-purple-400">🎮</span>
                  CHALLENGE 3: Post Match
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Mission: Match the Right Content to the Right Brand
                </p>
              </div>

              <hr className="border-gray-600" />

              {/* Problem Statement */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-green-400">✨</span>
                  Problem Statement:
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Every brand uses different content. Some post funny memes, some post how-to videos, and some post deals. Your job is to match the correct content to the brand.
                </p>
              </div>

              <hr className="border-gray-600" />

              {/* Task */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-blue-400">👤</span>
                  Task (Matching Game):
                </h3>
                <div className="text-gray-200 text-sm mb-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="font-semibold">Brand</div>
                    <div className="font-semibold">Options for Best Content Type (Match 1)</div>
                    <div>Sports Shoes</div>
                    <div>a) Behind-the-scenes video of shoe making</div>
                    <div>Ice Cream</div>
                    <div>b) Poll: 'Pick your fave flavour 👋'</div>
                    <div>Bookstore</div>
                    <div>c) Reel: '3 books to read before you turn 13'</div>
                    <div>Toy Company</div>
                    <div>d) Meme: 'When your toy breaks on Day 1 🤯'</div>
                    <div>Mobile Game App</div>
                    <div>e) Highlight video of cool gameplay moments 🎮</div>
                  </div>
                </div>
              </div>

              {/* Learning Outcome */}
              <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-4 max-w-md text-outline">
                <div className="uppercase text-sm sm:text-base mb-1">
                  Learning Outcome:
                </div>
                <div>
                  Students learn to match brands with the most effective post types by considering audience, brand voice, and platform fit, building practical content strategy skills.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;