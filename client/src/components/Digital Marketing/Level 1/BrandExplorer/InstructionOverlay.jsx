import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const [showText, setShowText] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [showMood, setShowMood] = useState(false);

  // Animation sequence
  useEffect(() => {
    const sequence = [
      () => setShowText(true),
      () => setShowColors(true),
      () => setShowMood(true),
      () => {
        setShowText(false);
        setShowColors(false);
        setShowMood(false);
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      sequence[currentStep]();
      currentStep = (currentStep + 1) % sequence.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const animatedBrandField = (
    <div
      key="brand-field"
      className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Brand Name:</span>
          {showText && (
            <span className="text-yellow-400 text-sm font-medium">
              Nike
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Ads Look:</span>
          {showColors && (
            <span className="text-yellow-400 text-sm font-medium">
              Bold colors, empowering language
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Mood:</span>
          {showMood && (
            <span className="text-yellow-400 text-sm font-medium">
              Inspirational, athletic
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
               max-h-[90vh] overflow-hidden
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
              {/* Brand Explorer Notebook Demo */}
              <div className="w-full lg:w-96">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  Brand Explorer Notebook
                </h2>
                <div className="bg-[#202F364D] p-4 rounded-xl shadow-lg w-full min-h-[350px]">
                  {/* Table Headers */}
                  <div className="grid grid-cols-1 gap-2 mb-3 text-xs font-semibold text-yellow-400 border-b border-gray-600 pb-2">
                    <div>Brand Analysis</div>
                  </div>
                  
                  {/* Animated Brand Fields */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {animatedBrandField}
                    </AnimatePresence>
                    
                    {/* Static example fields */}
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="text-xs text-gray-400">
                        <span className="font-semibold">What they sell:</span> Athletic shoes & apparel
                      </div>
                    </div>
                    
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="text-xs text-gray-400">
                        <span className="font-semibold">Colors & Language:</span> Black, white, red - "Just Do It"
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
                <div className="bg-[#0A160E] p-4 rounded-xl shadow-lg w-full min-h-[350px] border border-gray-600">
                  <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Choose 3 brands you like</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Visit their websites or social media</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Analyze their ads and posts</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Record their personality and mood</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Instructions — moves to top on mobile */}
          <div className="flex flex-col lg:w-1/3 gap-4 order-1 lg:order-2">
            <div className="space-y-4 text-left">
              {/* Mission */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-pink-400">🧠</span>
                  Mission: How Do Brands Speak to You?
                </h3>
              </div>

              {/* Problem Statement */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-green-400">*</span>
                  Problem Statement:
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed text-left">
                  Every brand has a <strong>personality</strong> — some are funny, some are cool, some are trustworthy. But how do they show it online?
                </p>
                <p className="text-gray-200 text-sm leading-relaxed mt-2 flex items-start gap-2 text-left">
                  <span className="text-pink-400">💬</span>
                  <span>Choose 3 brands you like (e.g., Nike, Kinder Joy, Lays). Visit their website or social media and answer:</span>
                </p>
              </div>

              <hr className="border-gray-600" />

              {/* Task */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-purple-400">📋</span>
                  Task:
                </h3>
                <div className="bg-[#131F24] p-3 rounded-lg border border-gray-600">
                  <div className="grid grid-cols-1 gap-2 text-xs font-semibold text-yellow-400 text-left">
                    <div>Brand Name</div>
                    <div>What do they sell?</div>
                    <div>What do their ads or posts look like? (colors, language, emojis)</div>
                    <div>What mood or personality do they give?</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-4 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Students learn to analyze brand personalities and understand how brands communicate their values online.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
