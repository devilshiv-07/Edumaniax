import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:overflow-hidden overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-[#0e341d] shadow-xl w-[95%] md:w-[1000px] text-white z-10 border border-gray-700 max-h-[90vh] overflow-y-auto md:overflow-visible p-4 sm:p-6 rounded-xl"
      >
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
          <motion.h2
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="text-xl sm:text-2xl md:text-3xl lilita-one-regular font-bold text-white"
          >
            ⚖️ Maze of Choices – How to Play
          </motion.h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Game Preview */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1 text-center">
            {/* Demo Prompt */}
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white lilita-one-regular"
            >
              🌀 Your Mission: Escape the Maze!
            </motion.h2>

            {/* Step-by-step preview */}
            <div className="bg-[#0d1b1e] rounded-lg p-4 shadow-md text-left space-y-3">
              <p className="text-green-300 font-semibold">🎯 Gameplay Flow:</p>
              <ul className="list-disc list-inside text-gray-200 space-y-2 text-sm">
                <li>
                  The maze has <span className="text-yellow-400">3 Levels</span>
                  , each with{" "}
                  <span className="text-green-400">5 checkpoints</span>.
                </li>
                <li>
                  At each checkpoint, answer{" "}
                  <span className="text-blue-400">MCQ questions</span> on
                  rights, duties & laws.
                </li>
                <li>
                  Correct answers unlock the{" "}
                  <span className="text-yellow-400">path forward</span>.
                </li>
                <li>
                  Earn <span className="text-green-400">points & accuracy</span>{" "}
                  as you progress.
                </li>
                <li>
                  Clear all levels to face the{" "}
                  <span className="text-red-400">Bonus Final Challenge</span>!
                </li>
              </ul>
            </div>

            {/* Scoring Demo */}
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 bg-[#1a2a2e] rounded-lg p-4"
            >
              <p className="font-bold mb-2 text-white">🏆 Scoring</p>
              <p className="text-gray-300 text-sm">
                +5 points for correct answers • 0 for wrong answers.
              </p>
              <p className="text-yellow-400 text-xs mt-2">
                Accuracy decides your Maze Escape Score!
              </p>
            </motion.div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Module: <span className="text-yellow-400">Law Awareness</span>
              </p>
              <p>
                Badge Earned:{" "}
                <span className="text-green-400">🏅 Maze Master</span>
              </p>
              <p className="mt-2">Steps to Escape:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🚪 Enter the maze at Level 1</li>
                <li>🧭 Answer MCQs at each checkpoint</li>
                <li>🔑 Unlock all 3 levels</li>
                <li>🔥 Conquer the Final Bonus Challenge</li>
                <li>🎉 Escape with maximum score & accuracy!</li>
              </ul>
            </div>

            {/* Learning Outcome */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-6 max-w-md"
            >
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Test your{" "}
                <span className="text-yellow-200">
                  legal awareness, rights, and civic duties
                </span>{" "}
                by navigating through challenges in a fun maze adventure!
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstructionOverlay;
