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
            Mission Goal Tracker – Set It, Plan It, Do It!
          </motion.h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* SMART Goal Example */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1">
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center lilita-one-regular text-green-300"
            >
              🎯 Example Goal: Get better at football
            </motion.h2>

            <div className="space-y-4 text-sm sm:text-base">
              <p>
                <span className="text-yellow-400 font-bold">S – Specific:</span>{" "}
                I want to improve my football skills, especially in passing,
                dribbling, and stamina.
              </p>
              <p>
                <span className="text-yellow-400 font-bold">
                  M – Measurable:
                </span>{" "}
                I will improve my passing accuracy from 60% to 85%, increase
                dribbling drills completion speed by 30%, and run 5 km without
                stopping.
              </p>
              <p>
                <span className="text-yellow-400 font-bold">
                  A – Achievable:
                </span>{" "}
                I will train 4 times a week with my school coach and practice
                drills at home twice a week.
              </p>
              <p>
                <span className="text-yellow-400 font-bold">R – Relevant:</span>{" "}
                This will help me perform better in my school team and prepare
                for upcoming inter-school tournaments.
              </p>
              <p>
                <span className="text-yellow-400 font-bold">
                  T – Time-bound:
                </span>{" "}
                I will achieve these improvements in the next 8 weeks.
              </p>

              <div className="bg-[#1d3b2a] border border-green-500 rounded-lg p-4 mt-4">
                <p className="text-green-300 font-bold mb-2">✅ Action Plan:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-200">
                  <li>
                    Join football practice every Monday, Wednesday, Friday, and
                    Sunday.
                  </li>
                  <li>
                    Do 30-minute dribbling drills every Tuesday and Saturday at
                    home.
                  </li>
                  <li>Track passing accuracy weekly during team scrimmage.</li>
                  <li>
                    Increase daily jogging from 2 km to 5 km over 2 months.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions & Learning Outcome */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Format:{" "}
                <span className="text-yellow-400">
                  Drag-and-drop Goal Planner
                </span>
              </p>
              <p className="mt-2">Instructions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <motion.li
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  📌 Drag each step into the correct SMART bucket (S, M, A, R,
                  T)
                </motion.li>
                <li>🖊️ Arrange all steps of your goal into the framework</li>
                <li>
                  ✨ Correct placement = Strong, clear, and realistic plan
                </li>
                <li>
                  ❌ Wrong placement = Retry or reveal the right structure
                </li>
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
                Build your{" "}
                <span className="text-yellow-200">goal-setting skills</span> by
                mastering the{" "}
                <span className="text-yellow-200">SMART framework</span> to turn
                dreams into actionable steps.
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstructionOverlay;
