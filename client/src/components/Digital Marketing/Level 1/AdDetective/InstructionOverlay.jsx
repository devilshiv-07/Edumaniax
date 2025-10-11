import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showCheckbox, setShowCheckbox] = useState(false);
  const [showText, setShowText] = useState(false);

  // Animation sequence
  useEffect(() => {
    const sequence = [
      () => setShowText(true),
      () => setShowCheckbox(true),
      () => {
        setShowText(false);
        setShowCheckbox(false);
      }
    ];

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = (prev + 1) % sequence.length;
        sequence[nextStep]();
        return nextStep;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const animatedFormField = (
    <motion.div
      key="form-field"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">Platform/App:</span>
          {showText && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-yellow-400 text-sm font-medium"
            >
              YouTube
            </motion.span>
          )}
        </div>
        {showCheckbox && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-4 h-4 bg-green-500 rounded border-2 border-green-400 flex items-center justify-center"
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>
    </motion.div>
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
          className="absolute top-4 right-4 w-8 h-8 rounded-full shadow-md hover:scale-110 transition-transform z-50"
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
              {/* Ad Detective Notebook Demo */}
              <div className="w-full lg:w-96">
                <h2 className="text-lg font-semibold text-center text-white mb-3">
                  Ad Detective Notebook
                </h2>
                <div className="bg-[#202F364D] p-4 rounded-xl shadow-lg w-full min-h-[400px]">
                  {/* Table Headers */}
                  <div className="grid grid-cols-5 gap-2 mb-3 text-xs font-semibold text-yellow-400 border-b border-gray-600 pb-2">
                    <div>Platform/App</div>
                    <div>What you saw (Ad)</div>
                    <div>Type</div>
                    <div>Product/Service</div>
                    <div>Interesting?</div>
                  </div>
                  
                  {/* Animated Form Fields */}
                  <div className="space-y-2">
                    <AnimatePresence>
                      {animatedFormField}
                    </AnimatePresence>
                    
                    {/* Static example rows */}
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="text-gray-400">Instagram</div>
                        <div className="text-gray-400">Fashion Ad</div>
                        <div className="text-gray-400">Post</div>
                        <div className="text-gray-400">Clothing</div>
                        <div className="text-gray-400">Yes</div>
                      </div>
                    </div>
                    
                    <div className="bg-[#131F24] border border-gray-600 rounded-lg p-3 mb-2 opacity-60">
                      <div className="grid grid-cols-5 gap-2 text-xs">
                        <div className="text-gray-400">Website</div>
                        <div className="text-gray-400">Banner Ad</div>
                        <div className="text-gray-400">Banner</div>
                        <div className="text-gray-400">Gaming</div>
                        <div className="text-gray-400">No</div>
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
                      <span>Fill in the notebook with 5 different ads you find</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Select checkboxes for interesting ads</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Record platform, ad type, and product</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 text-lg">•</span>
                      <span>Answer the reflection questions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Instructions — moves to top on mobile */}
          <div className="flex flex-col lg:w-1/3 gap-4 order-1 lg:order-2">
            <div className="space-y-4">
              {/* Problem Statement */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-green-400">*</span>
                  Problem Statement:
                </h3>
                <p className="text-gray-200 text-sm leading-relaxed">
                  You're browsing the internet, watching videos, scrolling through Instagram, and playing a mobile game — and suddenly... ads appear!
                </p>
                <p className="text-gray-200 text-sm leading-relaxed mt-2 flex items-start gap-2">
                  <span className="text-2xl">🕵️</span>
                  <span>Your mission is to become an Ad Detective. Look around your digital life and spot <strong>5 different types of online marketing.</strong></span>
                </p>
              </div>

              <hr className="border-gray-600" />

              {/* Task */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2 flex items-center gap-2">
                  <span className="text-purple-400">📋</span>
                  Task:
                </h3>
                <p className="text-gray-200 text-sm mb-3">
                  Use the "Ad Detective Notebook" (worksheet) to record:
                </p>
                <ul className="text-gray-200 text-sm space-y-1 ml-4">
                  <li>• Platform/App</li>
                  <li>• What you saw (Ad)</li>
                  <li>• Was it a video, post, banner, or pop-up?</li>
                  <li>• What product/service was being sold?</li>
                  <li>• Was it interesting or boring? Why?</li>
                </ul>
              </div>

              <hr className="border-gray-600" />

              {/* Then Answer */}
              <div>
                <h3 className="text-lg font-bold text-yellow-400 mb-2">
                  Then answer:
                </h3>
                <ul className="text-gray-200 text-sm space-y-1 ml-4">
                  <li>• Which ad caught your eye the most and why?</li>
                  <li>• Did any ad make you want to click or buy?</li>
                </ul>
              </div>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-4 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Students learn to identify different types of digital marketing and understand
                how ads work in the online world.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;


