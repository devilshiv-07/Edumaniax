import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  const tools = ["📊 Future AI Vision Sheet", "📝 Innovation Checklist"];

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
            Future AI Architect 🚀
          </motion.h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Left: Game Preview */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1 text-center">
            {/* Mission */}
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-white lilita-one-regular"
            >
              Mission: Design AI for Tomorrow's World 🌍
            </motion.h2>

            {/* Problem Statement */}
            <p className="text-gray-200 text-sm sm:text-base mb-4">
              <span className="font-bold text-yellow-300">
                Problem Statement:
              </span>{" "}
              Imagine AI in 2030. What problems will it solve? What new
              challenges might it create?
            </p>

            {/* Task Table */}
            <motion.div
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 bg-[#1a2a2e] rounded-lg p-4 overflow-x-auto"
            >
              <p className="font-bold mb-2 text-white">📥 Task:</p>
              <p className="text-gray-300 text-sm mb-4">
                Create your Future AI Vision:
              </p>
              <table className="w-full border border-gray-600 rounded-lg text-left text-xs sm:text-sm">
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600 font-bold">
                      Problem to Solve:
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      ___________
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600 font-bold">
                      AI Solution Name:
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      ___________
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600 font-bold">
                      How it works:
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      ___________
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600 font-bold">
                      Benefits:
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      ___________
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600 font-bold">
                      Potential Risks:
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      ___________
                    </td>
                  </tr>
                  <tr>
                    <td className="px-2 py-1 border border-gray-600 font-bold">
                      Safety Measures:
                    </td>
                    <td className="px-2 py-1 border border-gray-600">
                      ___________
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Innovation Challenge */}
              <div className="mt-4 text-gray-300 text-sm">
                <p className="font-bold mb-1">💡 Innovation Challenge:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Present your AI solution to the class</li>
                  <li>Make a poster or digital presentation</li>
                  <li>Explain how it’s better than current solutions</li>
                  <li>Discuss ethical considerations and fairness</li>
                </ul>
              </div>
            </motion.div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Module:{" "}
                <span className="text-yellow-400">Future AI Architect</span>
              </p>
              <p>
                Badge Earned:{" "}
                <span className="text-green-400">🚀 AI Innovator</span>
              </p>
              <p className="mt-2">Steps:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <motion.li
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🧠 Imagine an AI world in 2030
                </motion.li>
                <li>📝 Describe the problem and your AI solution</li>
                <li>💡 Explain how it works and its benefits</li>
                <li>⚠️ Identify risks and safety measures</li>
                <li>🏆 Present it and earn your AI Innovator badge!</li>
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
