import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  const thoughtsToSort = [
    {
      text: "My exam score",
      circle: "Concern",
      why: "The score has already been given – you can’t change it now. You can learn from it, but the score itself is out of your hands.",
    },
    {
      text: "Asking questions in class",
      circle: "Influence",
      why: "You can choose to raise your hand, clarify doubts, and participate. This is fully within your control.",
    },
    {
      text: "What others think of me",
      circle: "Concern",
      why: "You can’t control people’s thoughts or opinions. You can only control your own actions.",
    },
    {
      text: "Being kind today",
      circle: "Influence",
      why: "Kindness is a choice you make. You decide how you treat people every day.",
    },
  ];

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
            className="text-xl sm:text-2xl md:text-3xl lilita-one-regular font-bold text-white text-center"
          >
            My Circle Mission – What Can YOU Control?
          </motion.h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Thoughts to Sort */}
          <div className="w-full max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1">
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center lilita-one-regular text-green-300"
            >
              🧠 Thoughts to Sort – With Reasons
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {thoughtsToSort.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: [0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.2,
                  }}
                  className="bg-[#0d1b1e] rounded-lg p-4 shadow-md border border-gray-700"
                >
                  <p className="text-yellow-300 font-semibold mb-1">
                    Thought {idx + 1}: {item.text}
                  </p>
                  <p className="text-green-400 text-sm font-bold">
                    ✅ Circle: {item.circle}
                  </p>
                  <p className="text-gray-300 text-xs mt-2">{item.why}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Instructions & Learning Outcome */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Format:{" "}
                <span className="text-yellow-400">
                  Digital journal reflection + click-and-drop zones
                </span>
              </p>
              <p>
                Goal:{" "}
                <span className="text-green-400">
                  Sort your daily thoughts into your Circle of Influence or
                  Circle of Concern, then reflect on what actions you’ll take
                  for the ones in your influence.
                </span>
              </p>
              <p className="mt-2">Instructions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <motion.li
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  👀 Read each thought carefully
                </motion.li>
                <li>🖱️ Drag it to either Influence or Concern</li>
                <li>
                  ✍️ Write in your journal what you’ll do about the ones in your
                  influence
                </li>
                <li>
                  ❌ For concerns, learn to let go and not waste your energy
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
                Strengthen your{" "}
                <span className="text-yellow-200">
                  self-awareness and control
                </span>{" "}
                by recognizing what you can influence and what you must let go
                of. Build resilience by acting where it matters most.
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstructionOverlay;
