import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const [showText, setShowText] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showHashtags, setShowHashtags] = useState(false);

  // Animation sequence for caption example
  useEffect(() => {
    const sequence = [
      () => setShowText(true),
      () => setShowEmojis(true),
      () => setShowHashtags(true),
      () => {
        setShowText(false);
        setShowEmojis(false);
        setShowHashtags(false);
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      sequence[currentStep]();
      currentStep = (currentStep + 1) % sequence.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const animatedCaption = (
    <div
      key="caption-example"
      className="bg-[#131F24] border border-gray-600 rounded-lg p-4 mb-2"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Caption:</span>
          {showText && (
            <span className="text-yellow-400 text-sm font-medium">
              Charge your day with Mango Madness!
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Emojis:</span>
          {showEmojis && (
            <div className="flex gap-1">
              <span className="text-2xl">🥤</span>
              <span className="text-2xl">⚡</span>
              <span className="text-2xl">🥭</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Hashtags:</span>
          {showHashtags && (
            <span className="text-blue-400 text-sm font-medium">
              #JuicyGoals #MangoMania
            </span>
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
              {/* Caption Example Demo */}
              <div className="w-full lg:w-96">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  Caption Example
                </h2>
                <div className="bg-[#202F364D] p-4 rounded-xl shadow-lg w-full min-h-[400px]">
                  {/* Example Caption */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {animatedCaption}
                    </AnimatePresence>
                    
                    {/* Static example captions */}
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="text-sm text-gray-400">
                        <div className="font-semibold mb-1">Strawberry Zoom:</div>
                        <div>🍓 Whoosh! Strawberry Zoom is in the room 💨</div>
                        <div className="text-blue-400">#BerrySpeed #YumFuel</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="text-sm text-gray-400">
                        <div className="font-semibold mb-1">Green Power:</div>
                        <div>💪 Go green, feel strong! Green Power rocks! 🌿⚡</div>
                        <div className="text-blue-400">#SuperSips #GoGreen</div>
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
                      <span>Create 3 Instagram-style captions for the smoothies</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Use fun language and emojis</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Add relevant hashtags</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Keep it short and punchy</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Pick the best one and explain why</span>
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
                  CHALLENGE 1: Caption Craze
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Mission: Write Attention-Grabbing Captions!
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
                  A good caption can make someone stop scrolling and start shopping! You work for a smoothie brand called 'FruityFuel' that wants to attract kids and teens.
                </p>
              </div>

              <hr className="border-gray-600" />

              {/* Task */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-blue-400">👤</span>
                  Task:
                </h3>
                <p className="text-gray-200 text-sm mb-3">
                  Create 3 Instagram-style captions for these smoothies:
                </p>
                <ul className="text-gray-200 text-sm space-y-1 ml-4">
                  <li>• 1. Mango Madness</li>
                  <li>• 2. Strawberry Zoom</li>
                  <li>• 3. Green Power</li>
                </ul>
              </div>

              <hr className="border-gray-600" />

              {/* Caption Requirements */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">
                  Use:
                </h3>
                <ul className="text-gray-200 text-sm space-y-1 ml-4">
                  <li>• Fun language</li>
                  <li>• Emojis</li>
                  <li>• Hashtags</li>
                  <li>• A short, punchy line</li>
                </ul>
              </div>

              <hr className="border-gray-600" />

              {/* Example */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">
                  Example:
                </h3>
                <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🥤</span>
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div className="text-gray-200 mb-1">
                    Charge your day with Mango Madness! <span className="text-2xl">🥭</span>
                  </div>
                  <div className="text-blue-400">
                    #JuicyGoals #MangoMania
                  </div>
                </div>
              </div>

              <hr className="border-gray-600" />

              {/* Then Answer */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">
                  Then:
                </h3>
                <p className="text-gray-200 text-sm">
                  Pick the best one and explain why it works.
                </p>
              </div>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-4 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Students learn to create engaging social media content and understand
                how captions can influence consumer behavior and engagement.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
