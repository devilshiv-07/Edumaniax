import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  const scenarios = [
    { text: "Helping pick up books", tag: "Kind" },
    { text: "Eye rolling during a presentation", tag: "Unkind" },
    { text: "Sharing your snack", tag: "Kind" },
    { text: "Talking behind someone's back", tag: "Unkind" },
    { text: "Saying “Thank you” to the teacher", tag: "Kind" },
    { text: "Laughing when someone makes a mistake", tag: "Unkind" },
    { text: "Including someone new in a game", tag: "Kind" },
    { text: "Taking someone’s seat on purpose", tag: "Unkind" },
    { text: "Cheering for a classmate", tag: "Kind" },
    { text: "Making fun of someone’s clothes", tag: "Unkind" },
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
            className="text-xl sm:text-2xl md:text-3xl lilita-one-regular font-bold text-white"
          >
            Kindness Clicks: Spot the Good!
          </motion.h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Classroom animation scenarios */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1">
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center lilita-one-regular text-green-300"
            >
              🎯 Tap and Tag Each Action as Kind or Unkind!
            </motion.h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scenarios.map((s, idx) => (
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
                    Action {idx + 1}
                  </p>
                  <p className="text-gray-300 text-sm">{s.text}</p>
                  <p className="text-green-400 text-xs mt-2">
                    ✅ Correct Tag: {s.tag}
                  </p>
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
                  Interactive Classroom Animation
                </span>
              </p>
              <p>
                Goal:{" "}
                <span className="text-green-400">
                  Spot at least 8 out of 10 kind vs unkind actions correctly
                </span>
              </p>
              <p className="mt-2">Instructions:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <motion.li
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  👀 Look carefully at each classroom action
                </motion.li>
                <li>🖱️ Tap and tag it as either “Kind” or “Unkind”</li>
                <li>✨ Earn points for spotting kindness correctly</li>
                <li>❌ Wrong tags = gentle hints to improve observation</li>
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
                <span className="text-yellow-200">empathy and awareness</span>{" "}
                by noticing kind and unkind actions in everyday school life.
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstructionOverlay;
