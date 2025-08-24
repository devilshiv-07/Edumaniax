import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path as needed

const InstructionOverlay = ({ onClose }) => {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    const sequence = ["\u20B90", "\u20B95000"]; // always works
    // values to cycle through
    let index = 0;

    const interval = setInterval(() => {
      setDisplayText(sequence[index]); // set 0 or 5000
      index = (index + 1) % sequence.length; // move to next value
    }, 2000); // every 2 seconds switch

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
             md:overflow-hidden overflow-y-auto"
    >
      {/* ✅ scroll only on small screens */}
      <div
        className="relative bg-[#0e341d] shadow-xl w-[95%] md:w-[1000px] text-white z-10 
               border border-gray-700 
               max-h-[90vh] overflow-y-auto md:overflow-visible 
               p-4 sm:p-6"
      >
        {/* ✅ only scroll inside on phone */}

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="
            absolute 
            top-2 right-2 
            sm:top-4 sm:right-4 
            md:top-[-20px] md:right-[-20px]
            w-[50px] h-[35px] 
            sm:w-[70px] sm:h-[50px] 
            md:w-[103px] md:h-[68px] 
            rounded-full shadow-md 
            hover:scale-110 
            transition-transform 
            z-50
          "
        >
          {/* Push it out for desktop */}
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
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Game Content — will move below on mobile */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-4 bg-[#00260E] order-2 lg:order-1">
            <div className="max-w-md mt-0 md:mt-22 border border-gray-100 mx-auto px-4 py-6 bg-[#202F364D] rounded-xl shadow-xl sm:max-w-lg">
              <h2 className="text-2xl lilita-one-regular font-bold text-center text-white mb-2">
                🎮 Budget Challenge
              </h2>
              <p className="text-center text-sm text-white mb-4">
                Enter your monthly budget to begin:
              </p>
              {/* Animated "input" */}
              <div className="w-full border-2 p-2 text-white rounded text-center mb-4 min-h-[2.5rem]">
                {displayText}
                <span className="animate-pulse">|</span>
              </div>
              <div className="w-full bg-blue-600 text-white lilita-one-regular flex justify-center items-center py-2 rounded">
                🚀 Start Game
              </div>
            </div>
          </div>

          {/* Right side: Instructions — moves to top on mobile */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Objective: Learn{" "}
                <span className=" text-yellow-400">
                  smart budgeting and money management
                </span>
                .
              </p>
              <p className="mt-2">
                Scenario: You have a <span className="">monthly budget</span>.
                Different expenses like school items, parties, and subscriptions
                appear. <span>Sort them wisely</span> into:
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>✅ Need Now (essential spending)</li>
                <li>⏳ Want Later (can wait)</li>
                <li>❌ Skip It (not necessary)</li>
              </ul>
              <p className="mt-2">
                Your goal: <span className="">stay within budget</span> while
                making the best choices.
              </p>
              <p className="mt-2 text-green-400">
                Balance spending and savings to win the challenge!
              </p>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-8 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Developing budgeting skills by identifying needs vs. wants and
                making smarter spending decisions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
