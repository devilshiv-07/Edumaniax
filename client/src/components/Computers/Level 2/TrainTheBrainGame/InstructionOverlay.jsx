import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  const tools = ["📥 Training Table"];

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
            Train the Brain 🧠
          </motion.h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Game Preview */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1 text-center">
            {/* Mission */}
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white lilita-one-regular"
            >
              Mission: Understand How AI Learns 🎯
            </motion.h2>

            {/* Problem Statement */}
            <p className="text-gray-200 text-sm sm:text-base mb-4">
              <span className="font-bold text-yellow-300">
                Problem Statement:
              </span>{" "}
              AI gets smarter by practicing with data, just like we get better
              by studying.
            </p>

            {/* Task Highlight */}
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 bg-[#1a2a2e] rounded-lg p-4"
            >
              <p className="font-bold mb-2 text-white">📥 Task</p>
              <p className="text-gray-300 text-sm">
                Help train an AI to recognize animals. Fill this training table:
              </p>
              <div className="mt-3 text-left text-sm text-gray-300 overflow-x-auto">
                <table className="w-full border border-gray-600 rounded-lg text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#0d1b1e] text-yellow-300">
                      <th className="px-2 py-1 border border-gray-600">
                        Image Type
                      </th>
                      <th className="px-2 py-1 border border-gray-600">
                        Features to Notice
                      </th>
                      <th className="px-2 py-1 border border-gray-600">
                        Why Important
                      </th>
                      <th className="px-2 py-1 border border-gray-600">
                        Training Examples Needed
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-2 py-1 border border-gray-600">Cat</td>
                      <td className="px-2 py-1 border border-gray-600">
                        Whiskers, pointed ears
                      </td>
                      <td className="px-2 py-1 border border-gray-600"></td>
                      <td className="px-2 py-1 border border-gray-600"></td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1 border border-gray-600">Dog</td>
                      <td className="px-2 py-1 border border-gray-600">
                        Tail wagging, barking
                      </td>
                      <td className="px-2 py-1 border border-gray-600"></td>
                      <td className="px-2 py-1 border border-gray-600"></td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1 border border-gray-600">Bird</td>
                      <td className="px-2 py-1 border border-gray-600">
                        Wings, beak, feathers
                      </td>
                      <td className="px-2 py-1 border border-gray-600"></td>
                      <td className="px-2 py-1 border border-gray-600"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Advanced Questions */}
            <div className="mt-6 text-left bg-[#0d1b1e] p-4 rounded-lg">
              <p className="text-green-300 font-bold">🧠 Advanced Questions</p>
              <ul className="list-disc list-inside text-gray-300 text-sm mt-2 space-y-1">
                <li>How many animal images should an AI see to learn well?</li>
                <li>What happens if you show it wrong images?</li>
                <li>How would you test if the AI learned correctly?</li>
              </ul>
            </div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Module: <span className="text-yellow-400">Train the Brain</span>
              </p>
              <p>
                Badge Earned:{" "}
                <span className="text-green-400">🏆 AI Trainer</span>
              </p>
              <p className="mt-2">Steps:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <motion.li
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🧩 Drag & drop features into the correct animal type
                </motion.li>
                <li>📥 Explain why each feature matters</li>
                <li>💡 Answer advanced AI questions</li>
                <li>🏅 Earn your AI Trainer badge!</li>
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
