import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const [showStep1, setShowStep1] = useState(false);
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);

  // Animation sequence for campaign planning steps
  useEffect(() => {
    const sequence = [
      () => setShowStep1(true),
      () => setShowStep2(true),
      () => setShowStep3(true),
      () => {
        setShowStep1(false);
        setShowStep2(false);
        setShowStep3(false);
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      sequence[currentStep]();
      currentStep = (currentStep + 1) % sequence.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const animatedCampaignStep = (
    <div
      key="campaign-step"
      className="bg-[#131F24] border border-gray-600 rounded-lg p-4 mb-2"
    >
      <div className="text-sm">
        <div className="text-white mb-2">Campaign Planning Step</div>
        {showStep1 && (
          <div className="bg-blue-500 text-white p-2 rounded">
            🎯 Target Audience: Cool Kids Club (Ages 10-15)
          </div>
        )}
        {showStep2 && (
          <div className="bg-green-500 text-white p-2 rounded">
            💬 Slogan: "Caps that make you the coolest kid on the block!"
          </div>
        )}
        {showStep3 && (
          <div className="bg-purple-500 text-white p-2 rounded">
            📱 Platform: Instagram + YouTube + Snapchat
          </div>
        )}
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
              {/* Campaign Planning Demo */}
              <div className="w-full lg:w-96">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  Campaign Planning Example
                </h2>
                <div className="bg-[#202F364D] p-4 rounded-xl shadow-lg w-full min-h-[400px]">
                  {/* Planning Headers */}
                  <div className="mb-3 text-xs font-semibold text-yellow-400 border-b border-gray-600 pb-2">
                    <div>Campaign Elements</div>
                  </div>
                  
                  {/* Animated Planning Steps */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {animatedCampaignStep}
                    </AnimatePresence>
                    
                    {/* Static example steps */}
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="text-xs text-gray-400">
                        <div className="font-semibold">Campaign Name:</div>
                        <div>CapTivate</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="text-xs text-gray-400">
                        <div className="font-semibold">Ad Type:</div>
                        <div>🌟 Glowing Image</div>
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
                      <span>Complete the matching game first</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Choose your target audience</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Pick a catchy slogan</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Select 3 platforms</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Name your campaign</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Choose ad type and get AI feedback</span>
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
                  CHALLENGE 1: Campaign Captain
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Mission: Plan Your "Cool Caps" Digital Ad Campaign
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
                  You've just been hired as the <strong>Digital Director</strong> at <strong>Cool Caps</strong>, a fun, new brand that sells customizable caps for kids and teens. You're launching your <strong>first online ad campaign</strong> and have one big goal: Get as many students aged 10–15 to visit your website and order a cap!
                </p>
              </div>

              <hr className="border-gray-600" />

              {/* Campaign Features */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-blue-400">🧢</span>
                  Cool Caps Features:
                </h3>
                <div className="text-gray-200 text-sm space-y-1">
                  <div>✨ Glow-in-the-dark designs</div>
                  <div>🧙‍♂️ Popular cartoon characters</div>
                  <div>😎 Funny slogans like "Too Cool for School"</div>
                  <div>👋🥰 Option to print your name or favorite emoji</div>
                </div>
              </div>

              <hr className="border-gray-600" />

              {/* Your Mission */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-pink-400">📋</span>
                  Your Mission:
                </h3>
                <div className="text-gray-200 text-sm space-y-2">
                  <div>Complete the <strong>Campaign Planner Sheet</strong> by answering:</div>
                  <div className="ml-4 space-y-1">
                    <div>1. Who are you targeting? (Describe your audience)</div>
                    <div>2. What's your core message? (Slogan + benefits)</div>
                    <div>3. What will your ad look/sound like? (Caption, visuals)</div>
                    <div>4. Which 3 platforms will you use and why?</div>
                    <div>5. What's your campaign name? (Make it catchy!)</div>
                  </div>
                </div>
              </div>

              {/* Learning Outcome */}
              <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-4 max-w-md text-outline">
                <div className="uppercase text-sm sm:text-base mb-1">
                  Learning Outcome:
                </div>
                <div>
                  Students learn to create comprehensive digital marketing campaigns by understanding target audience, messaging, platform selection, and campaign branding.
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
