import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const [showStep1, setShowStep1] = useState(false);
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);

  // Tiny animated ticker showing example allocation focus areas
  useEffect(() => {
    const sequence = [
      () => setShowStep1(true), // Budget
      () => setShowStep2(true), // Reach
      () => setShowStep3(true), // Cost per Unit
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

  const animatedBudgetHint = (
    <div
      key="budget-step"
      className="bg-[#131F24] border border-gray-600 rounded-lg p-4 mb-2"
    >
      <div className="text-sm">
        <div className="text-white mb-2">Budget Planning Focus</div>
        {showStep1 && (
          <div className="bg-blue-500 text-white p-2 rounded">
            💰 Keep total spend ≤ ₹500
          </div>
        )}
        {showStep2 && (
          <div className="bg-green-500 text-white p-2 rounded">
            👥 Maximize estimated reach for your mix
          </div>
        )}
        {showStep3 && (
          <div className="bg-purple-500 text-white p-2 rounded">
            🧮 Track cost per unit on each platform
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
            LEVEL 3 – CHALLENGE 2: BUDGET BATTLE
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-4 gap-4">
          {/* Left: Sample Allocation / Hints */}
          <div className="w-full lg:w-2/3 border border-green-800 rounded-xl p-4 bg-[#00260E] order-2 lg:order-1">
            <div className="flex flex-col lg:flex-row gap-4 w-full justify-center">
              {/* Animated Hints */}
              <div className="w-full lg:w-96">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  Budget Planning Example
                </h2>
                <div className="bg-[#202F364D] p-4 rounded-xl shadow-lg w-full min-h-[400px]">
                  {/* Headers */}
                  <div className="mb-3 text-xs font-semibold text-yellow-400 border-b border-gray-600 pb-2">
                    <div>Sample Budget Allocation Table</div>
                  </div>
                  
                  {/* Animated planning focus */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {animatedBudgetHint}
                    </AnimatePresence>
                    
                    {/* Static sample rows */}
                    {[
                      ["Instagram Stories", "100 views", "₹1", "₹100"],
                      ["YouTube Skippable Ads", "50 views", "₹2", "₹100"],
                      ["Google Search Ads", "50 clicks", "₹3", "₹150"],
                      ["WhatsApp Broadcast", "50 messages", "₹1.5", "₹75"],
                      ["Influencer Shoutout", "1 post", "₹100", "₹100"],
                      ["School App Banner", "1 day", "₹50", "₹50"],
                    ].map((row, idx) => (
                      <div key={idx} className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2">
                        <div className="text-xs text-gray-300 flex justify-between gap-2">
                          <div className="font-semibold w-2/5">{row[0]}</div>
                          <div className="w-1/5 text-right">{row[1]}</div>
                          <div className="w-1/5 text-right">{row[2]}</div>
                          <div className="w-1/5 text-right">{row[3]}</div>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-xs text-yellow-300 mt-2">TOTAL: ₹500</div>
                  </div>
                </div>
              </div>

              {/* How to Play Panel */}
              <div className="w-full lg:w-64">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  How to Play
                </h2>
                <div className="bg-[#0A160E] p-4 rounded-xl shadow-lg w-full min-h-[400px] border border-gray-600">
                  <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Distribute a total of ₹500 across platforms.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Use sliders or inputs to set each platform's spend.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Stay within each platform's max budget limit.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Aim for higher estimated reach and efficient cost per reach.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Click "Get AI Feedback" when remaining = ₹0.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Problem, Platforms, Outcome */}
          <div className="flex flex-col lg:w-1/3 gap-4 order-1 lg:order-2">
            <div className="space-y-4">
              {/* Challenge Title */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-purple-400">🎮</span>
                  CHALLENGE 2: Budget Battle – Become the Ad Boss!
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Mission: Allocate ₹500 across platforms to promote Cool Caps and drive visits from kids aged 10–15.
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
                  You are the Marketing Manager for <strong>"Cool Caps"</strong>, selling fun, customizable caps with cartoons, slogans and glow designs. Your goal: run a <strong>1‑week online ad campaign</strong> and get as many kids aged 10–15 to visit your website as possible, using a budget of <strong>₹500</strong>.
                </p>
              </div>

              <hr className="border-gray-600" />

              {/* Available Ad Platforms (summary) */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-blue-400">📊</span>
                  Available Ad Platforms:
                </h3>
                <div className="text-gray-200 text-sm space-y-1">
                  <div>Instagram Stories – ₹1/view, Best for quick attention, Kids & teens (10–18), High visual appeal</div>
                  <div>YouTube Skippable Ads – ₹2/view, Short videos, Gamers & creatives (11–17), Higher recall</div>
                  <div>Google Search Ads – ₹3/click, Search intent, Shoppers & parents, Visible when they search</div>
                  <div>WhatsApp Broadcast – ₹1.5/message, Personalized reach, Parents/friends, Feels personal</div>
                  <div>Influencer Shoutout – ₹100/post, Wide instant reach, Teen influencer followers, Quick burst</div>
                  <div>School App Banner – ₹50/day, Trusted platform, Students + parents (10–15), Local targeting</div>
                </div>
              </div>

              <hr className="border-gray-600" />

              {/* Tasks for Students */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-pink-400">📋</span>
                  Tasks for Students:
                </h3>
                <div className="text-gray-200 text-sm space-y-2">
                  <div>1) Plan your spend (use any combination, stick to ₹500).</div>
                  <div className="ml-4 space-y-1">
                    <div>• Explain your strategy: why those platforms?</div>
                    <div>• What content will you run on each?</div>
                    <div>• How will you measure success?</div>
                  </div>
                </div>
              </div>

              {/* Learning Outcome */}
              <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-4 max-w-md text-outline">
                <div className="uppercase text-sm sm:text-base mb-1">
                  Learning Outcome:
                </div>
                <div>
                  Students learn to allocate budgets wisely across platforms, compare costs and reach, and justify an efficient campaign mix within constraints.
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
