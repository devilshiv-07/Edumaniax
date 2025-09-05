import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path as needed

const InstructionOverlay = ({ onClose }) => {
  const samplePairs = [
    { left: "Authoritative Leader", right: "⚡ Makes bold decisions quickly" },
    { left: "Democratic Leader", right: "🗳️ Asks team before deciding" },
  ];

  const sampleMCQ = {
    question: "Which leader asks for everyone’s opinion?",
    options: ["Authoritative", "Servant", "Democratic ✅", "Passive"],
  };

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
          {/* Game Preview */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1 text-center">
            {/* Demo Prompt */}
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white lilita-one-regular"
            >
              Match leadership styles to their traits!
            </motion.h2>

            {/* Drag-and-drop demo */}
            <div className="flex flex-col gap-4 mb-6">
              {samplePairs.map((pair, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.5 }}
                  className="bg-[#0d1b1e] px-4 py-3 rounded-lg shadow-md flex justify-between items-center text-sm sm:text-base lilita-one-regular"
                >
                  <span className="text-green-300">{pair.left}</span>
                  <span className="text-yellow-300">{pair.right}</span>
                </motion.div>
              ))}
            </div>

            {/* Sample MCQ */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-left bg-[#1a2a2e] rounded-lg p-4"
            >
              <p className="font-bold mb-2 text-white">{sampleMCQ.question}</p>
              <ul className="space-y-2">
                {sampleMCQ.options.map((opt, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    className="bg-[#0d1b1e] px-3 py-2 rounded-md cursor-pointer text-white"
                  >
                    {opt}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Objective: Learn how{" "}
                <span className="text-yellow-400">
                  different leadership styles
                </span>{" "}
                match with traits and decision-making.
              </p>
              <p className="mt-2">Steps:</p>
              <ul className="list-disc list-inside mt-1">
                <li>🔗 Drag leadership types to their correct traits</li>
                <li>📝 Answer quick MCQs about leader behaviors</li>
                <li>
                  🏅 Earn your badge:{" "}
                  <span className="text-green-400">Style Sensei</span>
                </li>
              </ul>
            </div>

            {/* Learning Outcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-6 max-w-md"
            >
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Recognize{" "}
                <span className="text-yellow-200">different leader styles</span>
                and understand when to apply them in real-life teamwork.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
