import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";

const BrandExplorerGameComplete = () => {
  const navigate = useNavigate();

  const handleRetryChallenge = () => {
    navigate("/brand-explorer-game");
  };

  const handleViewFeedback = () => {
    // stub: open feedback modal or page
    console.log("Open feedback modal or page");
  };

  const handleNextChallenge = () => {
    navigate("/brand-creator-game");
  };

  const canvasRef = useRef(null);

  useEffect(() => {
    const myCanvas = canvasRef.current;
    const myConfetti = confetti.create(myCanvas, { resize: true, useWorker: true });
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = window.setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      myConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      myConfetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
      <div className="flex flex-col items-center justify-center flex-1 p-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
          <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
        </div>
        <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">🏅 Badge Earned: 🧠 Brand Decoder</h2>
        <p className="text-xl text-white mt-2">🎉 Great job! You nailed it!</p>
      </div>

      <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
        <img
          src="/financeGames6to8/feedback.svg"
          alt="Feedback"
          onClick={handleViewFeedback}
          className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
        <img
          src="/financeGames6to8/retry.svg"
          alt="Retry Challenge"
          onClick={handleRetryChallenge}
          className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
        <img
          src="/financeGames6to8/next-challenge.svg"
          alt="Next Challenge"
          onClick={handleNextChallenge}
          className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
      </div>
    </div>
  );
};

export default BrandExplorerGameComplete;
