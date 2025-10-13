import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { useDM } from "@/contexts/DMContext";

const AdCampaignComplete = () => {
  const { completeDMChallenge } = useDM();

  useEffect(() => {
    completeDMChallenge(2,0);
  }, []);

  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const handlePlayAgain = () => {
    setTimeout(() => {
      navigate("/ad-campaigner-game")
    }, 500)
  }

  useEffect(() => {
    const myCanvas = canvasRef.current;
    const myConfetti = confetti.create(myCanvas, {
      resize: true,
      useWorker: true,
    });

    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      myConfetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      myConfetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);
  }, []);

  return (
    <div
      className="w-[90%] mx-auto p-5 h-screen "
      style={{ fontFamily: "'Comic Neue', cursive" }}
    >
      <div className="w-full h-full rounded-2xl relative shadow-2xl flex flex-col justify-center items-center bg-gradient-to-br from-pink-200 to-yellow-100 text-center p-6">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        <h1 className="text-xl md:text-5xl font-extrabold text-purple-700 mb-4 animate-bounce">
          🎉 Game Complete! 🎉
        </h1>
        <motion.p
          initial={{ opacity: 0.1, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="mt-5 text-sm md:text-2xl text-gray-800 mb-6"
        >
          <span className="font-semibold text-purple-800">
            Congratulations!
          </span>{" "}
          You’ve earned the 🏅
          <span className="font-bold text-yellow-600">
            Campaign Architect
          </span>{" "}
          badge!
        </motion.p>

        <button
          onClick={() => handlePlayAgain()}
          className="bg-purple-600 hover:bg-purple-800 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg"
        >
          Play Again 🔁
        </button>
      </div>
    </div>
  );
};

export default AdCampaignComplete;
