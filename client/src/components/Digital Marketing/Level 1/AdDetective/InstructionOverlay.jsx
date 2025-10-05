import React from "react";
import { motion } from "framer-motion";

const InstructionOverlay = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center lilita-one-regular">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0b1220] text-white w-[95%] max-w-3xl rounded-2xl border border-yellow-500 overflow-hidden"
      >
        <div className="bg-[#1f2937] px-5 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold text-yellow-400">Ad Detective</h2>
          <button onClick={onClose} className="text-yellow-400">✖</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="font-bold">Mission:</p>
            <p>Spot the Digital Marketing! Find 5 different types of online ads.</p>
          </div>

          <div>
            <p className="font-bold">Problem Statement:</p>
            <p>
              You’re browsing the internet, watching videos, scrolling through social media, or
              playing a game — and suddenly… ads appear! Become an Ad Detective.
            </p>
          </div>

          <div>
            <p className="font-bold">Task – Use your Ad Detective Notebook to record:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Platform/App</li>
              <li>What you saw (Ad)</li>
              <li>Was it a video, post, banner, or pop-up?</li>
              <li>What product/service was being sold?</li>
              <li>Was it interesting or boring? Why?</li>
            </ul>
          </div>

          <div>
            <p className="font-bold">Then answer:</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Which ad caught your eye the most and why?</li>
              <li>Did any ad make you want to click or buy?</li>
            </ul>
          </div>

          <div className="pt-2">
            <p className="font-bold">Badge Earned: <span className="text-yellow-300">Ad Spotter</span></p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InstructionOverlay;


