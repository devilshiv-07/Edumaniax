import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Rocket,
  Target,
  Settings,
  AlertTriangle,
  Puzzle,
  Shield,
  Undo,
} from "lucide-react";

const Poster = ({ data, onBack, handleViewFeedback, handleNextChallenge }) => {
  const posterRef = useRef();

  return (
    <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
      {/* Celebration Area */}
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        {/* Trophy / Celebration GIFs */}
        <div className="relative w-64 h-64 flex items-center justify-center">
          <img
            src="/financeGames6to8/trophy-rotating.gif"
            alt="Rotating Trophy"
            className="absolute w-full h-full object-contain"
          />
          <img
            src="/financeGames6to8/trophy-celebration.gif"
            alt="Celebration Effects"
            className="absolute w-full h-full object-contain"
          />
        </div>

        {/* Success Message */}
        <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
          🎉 Poster Complete!
        </h2>
        <p className="text-[#FFCC00] mt-4 text-center font-semibold">
          Awesome work! Your AI Architect Poster is ready to showcase 🚀
        </p>

        {/* Badge Earned */}
        <div className="mt-3 flex flex-col items-center">
          <p className="text-white text-sm sm:text-base font-bold mb-1">
            🏅 Badge Earned
          </p>
          <span className="text-yellow-400 text-sm sm:text-base font-extrabold lilita-one-regular">
            Future AI Architect
          </span>
        </div>

        {/* Poster Section */}
        <motion.div
          ref={posterRef}
          className="relative text-cyan-300 font-orbitron rounded-[3rem] shadow-2xl w-[80vw] h-[95vh] mx-auto overflow-hidden mt-8"
          style={{
            backgroundImage: "url('./poster.avif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            color: "rgb(0, 240, 255)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Title */}
          <motion.h1
            className="text-center text-4xl md:text-5xl font-black pt-6 flex items-center justify-center gap-2"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Rocket className="w-8 h-8" /> FUTURE AI ARCHITECT
          </motion.h1>

          {/* Design Objective */}
          <div className="absolute top-[15%] left-[5%] w-60">
            <h3 className="text-2xl text-white mb-2 flex items-center gap-2">
              <Target className="w-6 h-6" /> Design Goal
            </h3>
            <p className="text-base text-white lilita-one-regular">
              {data.problem}
            </p>
          </div>

          {/* Technical Workflow */}
          <div className="absolute top-[53%] left-[5%] w-60">
            <h3 className="text-2xl text-white mb-2 flex items-center gap-2">
              <Settings className="w-6 h-6" /> Tech Used
            </h3>
            <p className="text-base text-white lilita-one-regular">
              {data.name}
            </p>
          </div>

          {/* Risk Assessment */}
          <div className="absolute bottom-[13%] left-[5%] w-60">
            <h3 className="text-2xl font-extrabold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Risks
            </h3>
            <p className="text-base font-medium">{data.risks}</p>
          </div>

          {/* System Architecture */}
          <div className="absolute top-[18%] right-[6%] w-60 text-right">
            <h3 className="text-2xl font-extrabold mb-2 flex justify-end items-center gap-2">
              AI Name <Puzzle className="w-6 h-6" />
            </h3>
            <p className="text-base font-medium">{data.how}</p>
          </div>

          {/* Functional Impact */}
          <div className="absolute top-[45%] right-[6%] w-60 text-right">
            <h3 className="text-2xl font-extrabold mb-2 flex justify-end items-center gap-2">
              Impact <Target className="w-6 h-6" />
            </h3>
            <p className="text-base font-medium">{data.benefits}</p>
          </div>

          {/* Mitigation Strategies */}
          <div className="absolute bottom-[10%] right-[6%] w-60 text-right">
            <h3 className="text-2xl font-extrabold mb-2 flex justify-end items-center gap-2">
              Safety <Shield className="w-6 h-6" />
            </h3>
            <p className="text-base font-medium">{data.safety}</p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
        <img
          src="/financeGames6to8/retry.svg"
          alt="Retry"
          onClick={onBack}
          className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
        <img
          src="/financeGames6to8/feedback.svg"
          alt="Feedback"
          onClick={handleViewFeedback}
          className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
        <img
          src="/financeGames6to8/next-challenge.svg"
          alt="Next Challenge"
          onClick={handleNextChallenge}
          className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
      </div>
    </div>
  );
};

export default Poster;
