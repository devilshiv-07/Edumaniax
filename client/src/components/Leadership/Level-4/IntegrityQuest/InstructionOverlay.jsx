import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  const dilemmas = [
    {
      question: "Dilemma 1: You see a friend cheating in a test.",
      options: [
        "A) Join them",
        "B) Ignore it",
        "C) Tell a teacher ✅",
        "D) Laugh",
      ],
    },
    {
      question:
        "Dilemma 2: You are given credit for a group project you didn’t do.",
      options: [
        "A) Accept the praise",
        "B) Stay silent",
        "C) Say it was the whole team’s work ✅",
        "D) Take a reward",
      ],
    },
  ];

  const quiz = {
    question: "Quick Ethics Quiz: Integrity means…",
    options: [
      "A) Winning always",
      "B) Doing the right thing ✅",
      "C) Following your friends",
      "D) Being silent",
    ],
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
            Integrity Quest – Ethics & Integrity
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
              ⚡ Become a Change Maker! Think of one change to improve your
              school or neighborhood.
            </motion.h2>

            {/* Input Fields Preview */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-left bg-[#1a2a2e] rounded-lg p-4 mb-6 space-y-3"
            >
              <p className="font-bold text-green-300">
                ⚖️ Moral Dilemmas Preview:
              </p>
              {dilemmas.map((d, idx) => (
                <div key={idx} className="mb-4">
                  <p className="text-white font-semibold">{d.question}</p>
                  <ul className="list-disc list-inside text-gray-200 ml-4">
                    {d.options.map((opt, i) => (
                      <li key={i}>{opt}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>

            <div className="bg-[#0d1b1e] px-4 py-3 rounded-lg shadow-md text-sm sm:text-base lilita-one-regular">
              <p className="font-bold text-yellow-300 mb-3">
                📝 Quick Ethics Quiz
              </p>
              <p className="text-white mb-2">{quiz.question}</p>
              <ul className="space-y-2 text-gray-200 ml-4 list-disc list-inside">
                {quiz.options.map((opt, i) => (
                  <li key={i}>{opt}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p className="text-lg font-bold text-yellow-400 mb-2">
                Module: Ethics & Integrity
              </p>
              <p>
                <span className="text-green-400">Badge Earned:</span> 🛡️
                Trustworthy Leader Maker
              </p>
              <p className="mt-3">
                <span className="text-green-400">Format:</span> Moral Dilemma
                Simulation + MCQ
              </p>

              <p className="mt-3">
                <span className="text-green-400">Steps to play:</span>
              </p>
              <ul className="list-decimal list-inside ml-3 mt-1">
                <li>Read the dilemmas carefully.</li>
                <li>Choose the most ethical option.</li>
                <li>Answer the quick ethics quiz.</li>
                <li>Check your score.</li>
                <li>Earn your badge!</li>
              </ul>
            </div>

            {/* Activity Idea */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-6 max-w-md"
            >
              <div className="uppercase text-sm sm:text-base mb-1">
                Activity Idea:
              </div>
              <div>
                🤔 Discuss with your classmates: What would YOU do in these
                dilemmas? Can you think of a time you showed integrity in real
                life?
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
