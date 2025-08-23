import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path as needed

const InstructionOverlay = ({ onClose }) => {
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % 4); // cycles 0 → 1 → 2 → 3 → 0
    }, 1000); // 1 second per card
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center 
             md:overflow-hidden overflow-y-auto"
    >
      {/* ✅ scroll only on small screens */}
      <div
        className="relative bg-[#0e341d] shadow-xl w-[95%] md:w-[1000px] text-white z-10 
               border border-gray-700 
               max-h-[90vh] overflow-y-auto md:overflow-visible 
               p-4 sm:p-6"
      >
        {/* ✅ only scroll inside on phone */}

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="
            absolute 
            top-2 right-2 
            sm:top-4 sm:right-4 
            md:top-[-20px] md:right-[-20px]
            w-[50px] h-[35px] 
            sm:w-[70px] sm:h-[50px] 
            md:w-[103px] md:h-[68px] 
            rounded-full shadow-md 
            hover:scale-110 
            transition-transform 
            z-50
          "
        >
          {/* Push it out for desktop */}
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
          {/* Game Content — will move below on mobile */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1">
            <div className="grid grid-cols-1 gap-6">
              {["Lump Sum", "EMI"].map((option, index) => (
                <motion.div
                  key={option}
                  className="cursor-pointer bg-[#134E4A] rounded-xl p-6 flex flex-col items-center justify-center text-center text-white shadow-lg"
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{
                    scale: highlightIndex === index ? 1.05 : 1,
                    opacity: 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="text-3xl sm:text-4xl mb-3">
                    {index === 0 ? "📦" : "📆"}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold lilita-one-regular">
                    {index === 0 ? "Pay Full (Lump Sum)" : "Pay in EMIs"}
                  </h3>
                  <p className="mt-2 text-sm text-gray-200">
                    {index === 0
                      ? "One-time payment of ₹30,000"
                      : "12 EMIs of ₹2,750 (Total ₹33,000)"}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side: Instructions — moves to top on mobile */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Objective: Learn the{" "}
                <span className="font-bold text-yellow-400">
                  difference between EMI and Lump Sum payments
                </span>{" "}
                while managing costs.
              </p>
              <p className="mt-2">
                Scenario: You need to buy a{" "}
                <span className="">new phone worth ₹30,000</span>. You have two
                options:
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>📦 Option A: Pay full amount (Lump Sum)</li>
                <li>📆 Option B: Pay in monthly EMIs with interest</li>
              </ul>
              <p className="mt-2">
                Compare: <span className="">Total cost over time</span> vs{" "}
                <span className="">immediate one-time expense</span>.
              </p>
              <p className="mt-2 font-bold text-red-400">
                Be careful — EMI might look easy, but it costs more in the long
                run!
              </p>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-8 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Understanding how EMI payments add up compared to Lump Sum, and
                making smarter financial decisions.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
