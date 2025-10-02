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
        className="relative bg-[#0e341d] shadow-xl w-[95%] md:w-[1000px] text-white z-10 border border-gray-700 max-h-[90vh] overflow-y-auto md:overflow-visible p-4 sm:p-6"
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
            Help Hub – Who Do You Reach Out To?
          </motion.h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Scenarios Example */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1">
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center lilita-one-regular text-green-300"
            >
              🧩 Sample Scenarios
            </motion.h2>

            <div className="space-y-6 text-sm sm:text-base">
              {/* Scenario 1 */}
              <div>
                <p className="font-bold text-yellow-400 mb-2">
                  Scenario 1: You’re anxious about a test
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-200">
                  <li>A) Your subject teacher ✅</li>
                  <li>B) Your best friend who’s also nervous</li>
                  <li>C) Your younger sibling</li>
                  <li>D) The school guard</li>
                </ul>
                <p className="mt-2 text-green-300 font-medium">
                  📘 Why? Teachers can guide you with study strategies and
                  clarify doubts.
                </p>
              </div>

              {/* Scenario 2 */}
              <div>
                <p className="font-bold text-yellow-400 mb-2">
                  Scenario 2: You had a fight with a friend
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-200">
                  <li>A) Another friend to gossip</li>
                  <li>B) Your class teacher or school counselor ✅</li>
                  <li>C) A stranger online</li>
                  <li>D) Ignore it and bottle it up</li>
                </ul>
                <p className="mt-2 text-green-300 font-medium">
                  📘 Why? Trusted adults can help you reflect and resolve
                  conflicts peacefully.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions & Learning Outcome */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Format:{" "}
                <span className="text-yellow-400">
                  Interactive Decision Path
                </span>
              </p>
              <p className="mt-2">Instructions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <motion.li
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  📌 Read each scenario carefully
                </motion.li>
                <li>🤔 Think about the best person or place to ask for help</li>
                <li>✅ Choose wisely to find the healthiest support system</li>
                <li>❌ Wrong choices will teach you who NOT to rely on</li>
              </ul>
            </div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-6 max-w-md"
            >
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Understand your{" "}
                <span className="text-yellow-200">support network</span> and
                learn to make{" "}
                <span className="text-yellow-200">
                  healthy help-seeking decisions
                </span>{" "}
                in different life situations.
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstructionOverlay;
