import React from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path as needed

const InstructionOverlay = ({ onClose }) => {
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
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-4 bg-[#00260E] order-2 lg:order-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              {[
                {
                  title: "🏦 Fixed Deposits",
                  desc: "Low risk, steady 2% return",
                  color: "text-blue-300",
                },
                {
                  title: "📊 Mutual Funds",
                  desc: "Balanced, ~6–10% average return",
                  color: "text-green-300",
                },
                {
                  title: "🥇 Gold",
                  desc: "Safe haven, but prices fluctuate",
                  color: "text-yellow-300",
                },
                {
                  title: "📈 Stocks",
                  desc: "High risk, can rise or fall quickly",
                  color: "text-pink-300",
                },
                {
                  title: "💵 Savings",
                  desc: "Safe with 3% return",
                  color: "text-purple-300",
                  center: true, // special case
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: [0.9, 1.15, 1], // 👈 pop out, then settle
                  }}
                  transition={{
                    delay: index * 1, // ⏳ stagger 1s apart
                    duration: 1.2, // total animation time
                    times: [0, 0.6, 1], // control keyframes
                    ease: "easeInOut",
                  }}
                  whileHover={{ scale: 1.15, y: -8 }} // ✅ still hover if user interacts
                  className={`p-4 rounded-xl bg-[#1a3d29] shadow-md border border-gray-600
    ${item.center ? "md:col-span-2 md:w-1/2 mx-auto" : ""}`}
                >
                  <h3
                    className={`text-lg font-bold lilita-one-regular ${item.color}`}
                  >
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-300">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            {/* Objective & Scenario */}
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Objective: See how{" "}
                <span className="text-yellow-400">
                  different investments grow over time
                </span>{" "}
                by splitting money across options and tracking returns.
              </p>
              <p className="mt-2">
                Scenario: Invest in{" "}
                <span className="text-green-400">
                  Fixed Deposits, Mutual Funds, Gold, Stocks, and Savings
                </span>
                . Each carries its own risk and reward.
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>💰 Allocate percentages across options</li>
                <li>📈 Run a 6-month simulation</li>
                <li>🔄 Watch weekly gains/losses</li>
              </ul>
              <p className="mt-2 text-red-400">
                Tip: Safe choices like Deposits and Savings are steady, while
                Stocks and Gold swing more!
              </p>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-8 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Grasp <span className="text-yellow-200">risk vs. reward</span>,
                learn{" "}
                <span className="text-yellow-200">allocation strategies</span>,
                and see{" "}
                <span className="text-yellow-200">
                  how time shapes portfolio growth
                </span>
                .
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
