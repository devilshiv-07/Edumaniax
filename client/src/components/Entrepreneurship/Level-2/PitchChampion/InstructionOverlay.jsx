import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  const tools = [
    "🗣️ Pitch Builder",
    "📷 Prototype Upload",
    "📹 Optional Video Recorder",
  ];

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
            How to Play?
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
              Present your startup idea in a powerful{" "}
              <span className="text-yellow-300">60-second pitch!</span>
            </motion.h2>

            {/* Mission Highlight */}
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 bg-[#1a2a2e] rounded-lg p-4"
            >
              <p className="font-bold mb-2 text-white">🎯 Mission</p>
              <p className="text-gray-300 text-sm">
                You’re ready to share your idea with the world! Craft a quick
                pitch that explains{" "}
                <span className="text-yellow-300 font-semibold">
                  the problem you’re solving, how your AI solution works, and
                  why it’s valuable.
                </span>{" "}
                Add a prototype if you have one!
              </p>
            </motion.div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Module:{" "}
                <span className="text-yellow-400">Entrepreneurship</span>
              </p>
              <p>
                Badge Earned:{" "}
                <span className="text-green-400">🏅 Pitch Pro</span>
              </p>
              <p className="mt-2">Tasks:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <motion.li
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  📝 Clearly state the problem
                </motion.li>
                <li>🤖 Explain your AI-powered solution</li>
                <li>✨ List the main benefits for users</li>
                <li>🔎 Mention the type of AI being used</li>
                <li>📷 Share your prototype (image, slide, or link)</li>
                <li>
                  🎥 (Optional) Record or upload a 60-second video/audio pitch
                </li>
              </ul>
            </div>

            {/* Tools Provided */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="bg-[#FCB813] text-outline lilita-one-regular text-white font-semibold p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-6 max-w-md"
            >
              <div className="uppercase text-sm sm:text-base mb-1">
                Tools Provided:
              </div>
              <div className="space-y-1">
                {tools.map((tool, idx) => (
                  <div key={idx}>{tool}</div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstructionOverlay;
