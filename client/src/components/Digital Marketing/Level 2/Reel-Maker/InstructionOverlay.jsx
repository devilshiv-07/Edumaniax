import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const [showText, setShowText] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [showEmotion, setShowEmotion] = useState(false);

  // Animation sequence for reel planning example
  useEffect(() => {
    const sequence = [
      () => setShowText(true),
      () => setShowMusic(true),
      () => setShowEmotion(true),
      () => {
        setShowText(false);
        setShowMusic(false);
        setShowEmotion(false);
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      sequence[currentStep]();
      currentStep = (currentStep + 1) % sequence.length;
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const animatedReelPlan = (
    <div
      key="reel-plan-example"
      className="bg-[#131F24] border border-gray-600 rounded-lg p-4 mb-2"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Storyline:</span>
          {showText && (
            <span className="text-yellow-400 text-sm font-medium">
              Kids run to the door as fireworks light up the sky
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Music:</span>
          {showMusic && (
            <span className="text-blue-400 text-sm font-medium">
              🎆 Festive
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Emotion:</span>
          {showEmotion && (
            <span className="text-green-400 text-sm font-medium">
              🥳 Excitement
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
             overflow-y-auto bg-black/50"
    >
      <div
        className="relative bg-[#0e341d] shadow-xl w-[95%] max-w-6xl text-white z-10 
               border border-gray-700 rounded-2xl
               max-h-[90vh] overflow-y-auto
               p-4 sm:p-6 m-4"
      >
        {/* Cancel button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-4 w-24 h-24 rounded-full shadow-md hover:scale-110 transition-transform z-50"
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
        <div className="flex flex-col lg:flex-row p-4 gap-4">
          {/* Game Content — will move below on mobile */}
          <div className="w-full lg:w-2/3 border border-green-800 rounded-xl p-4 bg-[#00260E] order-2 lg:order-1">
            <div className="flex flex-col lg:flex-row gap-4 w-full justify-center">
              {/* Reel Plan Example Demo */}
              <div className="w-full lg:w-96">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  Reel Plan Example
                </h2>
                <div className="bg-[#202F364D] p-4 rounded-xl shadow-lg w-full min-h-[400px]">
                  {/* Example Reel Plan */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {animatedReelPlan}
                    </AnimatePresence>
                    
                    {/* Static example plans */}
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="text-sm text-gray-400">
                        <div className="font-semibold mb-1">Example 2:</div>
                        <div>Story: Grandmother gives gift to grandson</div>
                        <div>Music: 🎶 Sweet Melody</div>
                        <div>Emotion: 😍 Love</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="text-sm text-gray-400">
                        <div className="font-semibold mb-1">Example 3:</div>
                        <div>Story: Magical box opens with sparkles</div>
                        <div>Music: 💥 Boom</div>
                        <div>Emotion: 😲 Surprise</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions Panel */}
              <div className="w-full lg:w-64">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  How to Play
                </h2>
                <div className="bg-[#0A160E] p-4 rounded-xl shadow-lg w-full min-h-[400px] border border-gray-600">
                  <div className="space-y-4 text-sm text-gray-300">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Write a 3-part storyline for your reel</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Choose music that matches your vibe</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Add engaging screen text</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Select the emotion you want to create</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Preview your complete reel plan</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Instructions — moves to top on mobile */}
          <div className="flex flex-col lg:w-1/3 gap-4 order-1 lg:order-2">
            <div className="space-y-4">
              {/* Mission */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-pink-400">📹</span>
                  Mission: Plan a Short Ad Video (Reel)
                </h3>
              </div>

              <hr className="border-gray-600" />

              {/* Problem Statement */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-green-400">✨</span>
                  Problem Statement:
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  Reels are everywhere! Your new job is to help a chocolate brand called <span className="font-bold text-yellow-300">"ChocoBoom"</span> plan a 15-second reel for their Diwali special pack.
                </p>
              </div>

              <hr className="border-gray-600" />

              {/* Task */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-blue-400">📋</span>
                  Task:
                </h3>
                <p className="text-gray-200 text-sm mb-3">
                  Fill out the <span className="font-bold text-yellow-300">Reel Planner Sheet</span>:
                </p>
                <ol className="text-gray-200 text-sm space-y-2 ml-4">
                  <li className="flex items-center gap-2">
                    <span className="bg-purple-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">1</span>
                    <span>What will happen in the reel? (storyline in 3 parts)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-blue-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">2</span>
                    <span>What sound/music will you use?</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-pink-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">3</span>
                    <span>What text will appear on screen?</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-yellow-500 text-white w-6 h-6 rounded flex items-center justify-center text-xs font-bold">4</span>
                    <span>What emotion will the reel create?</span>
                  </li>
                </ol>
                <p className="text-gray-200 text-sm mt-3 ml-4">
                  <strong>Bonus:</strong> Draw a storyboard or write a short scene.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
