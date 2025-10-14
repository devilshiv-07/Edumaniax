import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const [showStep1, setShowStep1] = useState(false);
  const [showStep2, setShowStep2] = useState(false);
  const [showStep3, setShowStep3] = useState(false);

  // Tiny animated ticker showing example analytics highlights
  useEffect(() => {
    const sequence = [
      () => setShowStep1(true), // High CTR
      () => setShowStep2(true), // Most Conversions
      () => setShowStep3(true), // Low Performance
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

  const animatedInsights = (
    <div
      key="insights-step"
      className="bg-[#131F24] border border-gray-600 rounded-lg p-4 mb-2"
    >
      <div className="text-sm">
        <div className="text-white mb-2">Key Analytics Highlights</div>
        {showStep1 && (
          <div className="bg-blue-500 text-white p-2 rounded">
            📈 Highest CTR spotted!
          </div>
        )}
        {showStep2 && (
          <div className="bg-green-500 text-white p-2 rounded">
            🛒 Platform with most conversions
          </div>
        )}
        {showStep3 && (
          <div className="bg-purple-500 text-white p-2 rounded">
            💤 Underperformer – needs work
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
            LEVEL 3 – CHALLENGE 3: ANALYTICS ADVENTURE
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-4 gap-4">
          {/* Left: Mock Dashboard / Hints */}
          <div className="w-full lg:w-2/3 border border-green-800 rounded-xl p-4 bg-[#00260E] order-2 lg:order-1">
            <div className="flex flex-col lg:flex-row gap-4 w-full justify-center">
              {/* Animated Hints */}
              <div className="w-full lg:w-96">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  Mock Analytics Dashboard
                </h2>
                <div className="bg-[#202F364D] p-4 rounded-xl shadow-lg w-full min-h-[400px]">
                  {/* Headers */}
                  <div className="mb-3 text-xs font-semibold text-yellow-400 border-b border-gray-600 pb-2">
                    <div>Platform • Views • Clicks • CTR • Conversions</div>
                  </div>
                  
                  {/* Animated highlights */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {animatedInsights}
                    </AnimatePresence>
                    
                    {/* Static mock table rows matching the image */}
                    {[
                      ["Instagram Stories", "1,000", "120", "12%", "10"],
                      ["YouTube Skippable Ads", "500", "75", "15%", "8"],
                      ["Google Search Ads", "150", "45", "30%", "20"],
                      ["WhatsApp Broadcast", "50 messages", "—", "40% (opened)", "4"],
                    ].map((row, idx) => (
                      <div key={idx} className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2">
                        <div className="text-xs text-gray-300 flex justify-between gap-2">
                          <div className="font-semibold w-2/5">{row[0]}</div>
                          <div className="w-1/5 text-right">{row[1]}</div>
                          <div className="w-1/5 text-right">{row[2]}</div>
                          <div className="w-1/5 text-right">{row[3]}</div>
                          <div className="w-1/5 text-right">{row[4]}</div>
                        </div>
                      </div>
                    ))}
                    <div className="text-right text-xs text-yellow-300 mt-2">Review what worked best!</div>
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
                      <span>Study the mock analytics dashboard.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Check Views, Clicks, CTR and Conversions.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Drag flags to label platforms: Great / Okay / Needs Work.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Use the What‑If simulator to test improvements.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Answer the reflection questions to finish.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Problem, Definitions, Tasks, Outcome */}
          <div className="flex flex-col lg:w-1/3 gap-4 order-1 lg:order-2">
            <div className="space-y-4">
              {/* Challenge Title */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-purple-400">🎮</span>
                  CHALLENGE 3: Analytics Adventure – Be the Marketing Analyst!
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Mission: Results are in from your ₹500 campaign. Check what worked, what didn’t, and suggest improvements for the next campaign.
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

              {/* Definitions (for students) */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-blue-400">📘</span>
                  Definitions:
                </h3>
                <div className="text-gray-200 text-sm space-y-1">
                  <div><strong>Impressions/Views</strong>: How many times your ad was seen.</div>
                  <div><strong>Clicks</strong>: How many people clicked on your ad.</div>
                  <div><strong>CTR</strong> (Click‑Through Rate): % of viewers who clicked. (Clicks ÷ Impressions × 100)</div>
                  <div><strong>Conversions</strong>: How many people bought a cap after clicking.</div>
                </div>
              </div>

              <hr className="border-gray-600" />

              {/* Student Task */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-pink-400">📋</span>
                  Student Task:
                </h3>
                <div className="text-gray-200 text-sm space-y-2">
                  <div>Fill the <strong>Analytics Summary Table</strong> and answer the reflection questions:</div>
                  <div className="ml-4 space-y-1">
                    <div>1. Which platform gave the most conversions?</div>
                    <div>2. Which had the highest CTR? What does it mean?</div>
                    <div>3. If you had ₹200 more, where would you spend it and why?</div>
                    <div>4. Which platform didn’t perform well? What could improve it?</div>
                    <div>5. What would you do differently in your next campaign?</div>
                  </div>
                </div>
              </div>

              {/* Learning Outcome */}
              <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-4 max-w-md text-outline">
                <div className="uppercase text-sm sm:text-base mb-1">
                  Learning Outcome:
                </div>
                <div>
                  Students learn to read campaign metrics (views, clicks, CTR, conversions), derive insights, and recommend data‑driven improvements.
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
