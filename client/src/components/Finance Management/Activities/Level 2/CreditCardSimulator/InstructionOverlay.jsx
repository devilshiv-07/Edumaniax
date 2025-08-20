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

  const items = [
    { icon: "📱", name: "Smartphone", price: "₹9,000" },
    { icon: "🎮", name: "Gaming Console", price: "₹10,000" },
    { icon: "🎧", name: "Headphones", price: "₹4,000" },
    { icon: "🍕", name: "Dinner Party", price: "₹3,000" },
  ];

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
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-4 bg-[#00260E] order-2 lg:order-1">
            {/* Centered container */}
            <div className="flex justify-center">
              {/* Item Selection Card */}
              <div className="bg-[#0f1c1a] border border-gray-500 rounded-xl p-6 shadow-lg w-full sm:w-[28rem]">
                <h2 className="text-lg sm:text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <span>💳</span> Credit Card Simulator – Game Mode
                </h2>
                <p className="text-gray-300 text-sm mb-6">
                  Choose an item to buy:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg cursor-pointer transition border-2 ${
                        highlightIndex === index
                          ? "border-yellow-400 bg-[#243835] shadow-lg"
                          : "border-gray-600 bg-[#1a2a28] hover:bg-[#243835]"
                      }`}
                    >
                      <p className="font-semibold text-white flex items-center justify-center gap-2">
                        {item.icon} {item.name}
                      </p>
                      <p className="text-gray-300">{item.price}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Instructions — moves to top on mobile */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Objective: Understand{" "}
                <span className="font-bold text-yellow-400">
                  credit, interest, and EMI traps
                </span>
                .
              </p>
              <p className="mt-2">
                Scenario: You get a{" "}
                <span className="font-bold">virtual credit card</span> with a
                ₹5,000 limit. Choose wisely where to spend:
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>🎮 Games</li>
                <li>🎧 Headphones</li>
                <li>🍽️ Dinner</li>
                <li>📱 Phone EMI</li>
              </ul>
              <p className="mt-2">
                Each month: <span className="font-bold">pay minimum due</span>{" "}
                or <span className="font-bold">full amount</span>.
              </p>
              <p className="mt-2 font-bold text-red-400">
                Watch how interest and debt pile up if misused!
              </p>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-8 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Avoiding credit card debt traps by making smart payment choices.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
