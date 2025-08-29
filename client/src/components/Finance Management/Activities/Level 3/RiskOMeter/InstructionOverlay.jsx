import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path as needed

const InstructionOverlay = ({ onClose }) => {
  const sampleOptions = [
    { text: "😟 Very anxious" },
    { text: "😐 A bit uneasy" },
    { text: "😎 Fine, it happens" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:overflow-hidden overflow-y-auto">
      <div className="relative bg-[#0e341d] shadow-xl w-[95%] md:w-[1000px] text-white z-10 border border-gray-700 max-h-[90vh] overflow-y-auto md:overflow-visible p-4 sm:p-6">
        {/* Cancel button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-[-20px] md:right-[-20px]
          w-[50px] h-[35px] sm:w-[70px] sm:h-[50px] md:w-[103px] md:h-[68px]
          rounded-full shadow-md hover:scale-110 transition-transform z-50"
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
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Game Content */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1 text-center">
            {/* Question */}
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white lilita-one-regular"
            >
              How would you feel if your money dropped by 20%?
            </motion.h2>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-3xl mb-6"
            >
              💰
            </motion.div>

            {/* Options */}
            <div className="flex flex-col gap-4 w-[90%] max-w-md mx-auto">
              {sampleOptions.map((option, index) => (
                <motion.div
                  key={index}
                  className="bg-[#0d1b1e] px-6 py-3 rounded-lg shadow-md text-white lilita-one-regular cursor-pointer hover:scale-105 transition-transform"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 1 + index * 1, // 1s stagger
                  }}
                >
                  {option.text}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Objective: Discover your{" "}
                <span className="text-yellow-400">risk tolerance</span> and how
                it shapes your investment style.
              </p>
              <p className="mt-2">
                Scenario: Answer quick questions like —
                <span>
                  “How would you feel if money dropped 20%?” or “Do you prefer
                  slow steady growth?”
                </span>
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>📝 Answer simple risk questions</li>
                <li>🤔 See how you balance safety vs. reward</li>
                <li>
                  🎯 Unlock your{" "}
                  <span className="text-green-400">Risk Profile</span>
                </li>
              </ul>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-6 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Know if you are{" "}
                <span className="text-yellow-200">
                  Cautious, Balanced, or Aggressive
                </span>
                , and how that guides smarter money choices.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
