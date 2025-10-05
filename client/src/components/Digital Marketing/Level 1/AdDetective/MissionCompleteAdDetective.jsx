import confetti from "canvas-confetti";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const MissionCompleteAdDetective = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const myCanvas = canvasRef.current;
    const myConfetti = confetti.create(myCanvas, {
      resize: true,
      useWorker: true,
    });

    const end = Date.now() + 3 * 1000;
    const colors = ["#a786ff", "#fd8bbc", "#eca184", "#f8deb1"];

    const frame = () => {
      if (Date.now() > end) return;

      myConfetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        startVelocity: 60,
        origin: { x: 0, y: 0.5 }, // left of container
        colors,
      });

      myConfetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        startVelocity: 60,
        origin: { x: 1, y: 0.5 }, // right of container
        colors,
      });

      requestAnimationFrame(frame);
    };

    frame();
  }, []);

  const navigate = useNavigate();

  return (
    <div className="w-[100%] lg:w-[90%] p-5 mx-auto h-screen lilita-one-regular">
      <div className="w-full h-full relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex rounded-2xl items-center justify-center p-6">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />
        <div className="bg-black bg-opacity-70 p-10 rounded-3xl shadow-2xl max-w-md text-center text-yellow-400">
          <div className="text-6xl mb-6">🕵️‍♂️🎉</div>
          <h1 className="text-4xl font-extrabold mb-4">Mission Complete!</h1>
          <p className="mb-8 text-lg text-gray-300">
            You’ve successfully spotted 5 different types of online ads.
            <br />
            The digital world can’t hide from the Ad Detective!
          </p>
          <div className="inline-flex items-center gap-2 bg-yellow-500/20 border border-yellow-400 text-yellow-300 px-4 py-2 rounded-full mb-6">
            <span>🏅</span>
            <span className="font-semibold">Badge Earned:</span>
            <span className="italic">Ad Spotter</span>
          </div>
          <button
            onClick={() => navigate("/intro-ad-detective-game")}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
          >
            Start New Mission
          </button>
        </div>
      </div>
    </div>
  );
};

export default MissionCompleteAdDetective;
