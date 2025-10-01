import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  const scenarios = [
    {
      text: "You forgot your lunch.",
      emojis: "😠 (Angry), 😔 (Sad), 😋 (Hungry), 🤔 (Confused)",
      correct: "😔 (Sad) or 😋 (Hungry)",
    },
    {
      text: "You got picked last for a team.",
      emojis: "😊 (Happy), 😞 (Left out), 😡 (Angry), 😶 (Blank)",
      correct: "😞 (Left out)",
    },
    {
      text: "Your friend gives you a kind note.",
      emojis: "😊 (Happy), 😠 (Angry), 😳 (Embarrassed), 😐 (Neutral)",
      correct: "😊 (Happy)",
    },
    {
      text: "You answer correctly in class.",
      emojis: "😃 (Proud), 😬 (Nervous), 😞 (Sad), 😴 (Sleepy)",
      correct: "😃 (Proud)",
    },
    {
      text: "Someone laughs when you trip.",
      emojis: "😡 (Angry), 😳 (Embarrassed), 😂 (Funny), 😢 (Hurt)",
      correct: "😳 (Embarrassed) or 😢 (Hurt)",
    },
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
            Mood Mirror – Spot That Feeling!
          </motion.h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Game Preview (animated cards) */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1">
            <motion.h2
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center lilita-one-regular text-green-300"
            >
              🎭 Drag the Emoji that Matches the Feeling
            </motion.h2>

            {/* Animated scenario cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scenarios.map((s, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: [0, -5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: idx * 0.3,
                  }}
                  className="bg-[#0d1b1e] rounded-lg p-4 shadow-md border border-gray-700"
                >
                  <p className="text-yellow-300 font-semibold mb-1">{s.text}</p>
                  <p className="text-gray-300 text-sm">Options: {s.emojis}</p>
                  <p className="text-green-400 text-xs mt-1">
                    ✅ Correct: {s.correct}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Format:{" "}
                <span className="text-yellow-400">Drag & Drop Simulation</span>
              </p>
              <p>
                Goal:{" "}
                <span className="text-green-400">
                  Match 4 out of 5 feelings correctly
                </span>
              </p>
              <p className="mt-2">Steps:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <motion.li
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  🎯 Look at each school scenario
                </motion.li>
                <li>😀 Drag the emoji that best shows the feeling</li>
                <li>✨ Correct choice = Sparkles + Chime sound</li>
                <li>❌ Wrong choice = Soft “oops” sound</li>
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
                Build your{" "}
                <span className="text-yellow-200">self-awareness</span>
                by recognizing emotions in everyday situations.
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstructionOverlay;
