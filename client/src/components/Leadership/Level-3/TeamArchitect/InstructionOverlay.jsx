import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path if needed

const InstructionOverlay = ({ onClose }) => {
  const sampleScenario = {
    question:
      "Your team has to prepare a class project. How will you organize the work?",
    options: [
      "Give everyone a role ✅",
      "Do everything yourself",
      "Let one person handle all tasks",
      "Avoid deciding roles",
    ],
  };

  const teamworkTips = [
    "Know each team member’s strength",
    "Give everyone a role",
    "Trust your teammates",
    "Celebrate team success, not just individual",
  ];

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
              Build strong teams & share work in a smart way!
            </motion.h2>

            {/* Sample Scenario (MCQ) */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-left bg-[#1a2a2e] rounded-lg p-4 mb-6"
            >
              <p className="font-bold mb-2 text-white">
                {sampleScenario.question}
              </p>
              <ul className="space-y-2">
                {sampleScenario.options.map((opt, i) => {
                  const isCorrect = opt.includes("✅");
                  return (
                    <motion.li
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      animate={isCorrect ? { scale: [1, 1.1, 1] } : {}}
                      transition={
                        isCorrect
                          ? {
                              duration: 1.2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }
                          : {}
                      }
                      className={`px-3 py-2 rounded-md cursor-pointer text-white ${
                        isCorrect ? "bg-green-600 font-bold" : "bg-[#0d1b1e]"
                      }`}
                    >
                      {opt}
                    </motion.li>
                  );
                })}
              </ul>
            </motion.div>

            {/* Tips Preview */}
            <div className="bg-[#0d1b1e] px-4 py-3 rounded-lg shadow-md text-sm sm:text-base lilita-one-regular">
              <p className="font-bold text-yellow-300 mb-3">🤝 Teamwork Tips</p>
              <ul className="space-y-2">
                {teamworkTips.map((tip, index) => (
                  <li key={index} className="text-green-300">
                    {index + 1}. {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p className="text-lg font-bold text-yellow-400 mb-2">
                Teamwork & Delegation
              </p>
              <p>
                <span className="text-green-400">What you will learn:</span>
              </p>
              <ul className="list-disc list-inside ml-3 mt-1">
                <li>How to build a strong team.</li>
                <li>How to share work in a smart way.</li>
              </ul>

              <p className="mt-3">
                <span className="text-green-400">Explanation:</span> Leaders
                don’t do everything alone. They build teams and share tasks.
                This is called delegation — giving people different jobs based
                on what they are good at.
              </p>

              <p className="mt-3">
                <span className="text-green-400">Tips for teamwork:</span>
              </p>
              <ul className="list-decimal list-inside ml-3 mt-1">
                <li>Know each team member’s strength.</li>
                <li>Give everyone a role.</li>
                <li>Trust your teammates.</li>
                <li>Celebrate team success, not just individual.</li>
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
                In a group, assign roles like <b>“note-taker”</b>,{" "}
                <b>“speaker”</b>, and <b>“time-keeper”</b> to complete a mini
                project.
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
