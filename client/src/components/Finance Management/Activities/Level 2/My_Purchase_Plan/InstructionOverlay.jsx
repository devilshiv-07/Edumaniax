import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path as needed

const InstructionOverlay = ({ onClose }) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // delay each child
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

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
          {/* Game Content */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#00260E] order-2 lg:order-1">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6"
            >
              {/* Static Input Section with animation */}
              <motion.div variants={itemVariants}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <motion.input
                    variants={itemVariants}
                    type="text"
                    placeholder="Product name"
                    className="border bg-[#202F364D] text-gray-200 p-2 rounded shadow-inner"
                    disabled
                  />
                  <motion.input
                    variants={itemVariants}
                    type="number"
                    placeholder="Estimated price (₹)"
                    className="border bg-[#202F364D] text-gray-200 p-2 rounded shadow-inner"
                    disabled
                  />
                  <motion.input
                    variants={itemVariants}
                    type="number"
                    placeholder="Months"
                    className="border bg-[#202F364D] text-gray-200 p-2 rounded shadow-inner"
                    disabled
                  />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                    disabled
                  />
                  <label className="font-medium text-white">
                    EMI Available (in %)?
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="ml-4 w-24 border rounded p-2 text-white bg-[#202F364D]"
                    disabled
                  />
                  <span className="text-sm">%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-green-600 border-gray-300 rounded"
                    disabled
                  />
                  <label className="font-medium text-gray-100">
                    Discount Available (in %)?
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    className="ml-4 w-24 border rounded p-2 text-white bg-[#202F364D]"
                    disabled
                  />
                  <span className="text-sm">%</span>
                </div>
              </motion.div>

              <motion.button
                variants={itemVariants}
                className="bg-purple-600 lilita-one-regular text-white w-full py-3 rounded-xl font-bold text-lg shadow-lg opacity-50 cursor-not-allowed"
                disabled
              >
                🎯 Generate My Smart Plan
              </motion.button>
            </motion.div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Objective: Learn how to{" "}
                <span className=" text-yellow-400">
                  plan savings and compare different buying options
                </span>{" "}
                before making a purchase.
              </p>
              <p className="mt-2">
                Scenario: You want to buy a{" "}
                <span className="">real product of your choice</span> (like a
                gadget, sneakers, or books). You have{" "}
                <span className=" text-green-400">3 months</span> to plan how to
                afford it.
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>🔍 Step 1: Research the actual price of your product</li>
                <li>💰 Step 2: Generates saving plan</li>
              </ul>
              <p className="mt-2 text-red-400">
                Be smart — the easiest option isn’t always the best one!
              </p>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-8 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Understanding how to save for goals, apply discounts, compare
                EMI vs Lump Sum, and make{" "}
                <span className=" text-yellow-200">
                  smarter financial decisions
                </span>{" "}
                when buying what you want.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
