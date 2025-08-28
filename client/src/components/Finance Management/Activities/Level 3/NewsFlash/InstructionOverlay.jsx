import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import CancelIcon from "/financeGames6to8/button-cancel.svg"; // adjust path as needed
import { FaChartBar, FaChartLine, FaTrophy } from "react-icons/fa";

const InstructionOverlay = ({ onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const cards = [
    {
      icon: <FaChartLine className="text-pink-500 text-2xl" />,
      title: "Tech stocks crash after regulations",
      desc: "Regulations cause panic in the tech sector.",
    },
    {
      icon: <FaTrophy className="text-yellow-500 text-2xl" />,
      title: "Gold hits all–time high",
      desc: "Investors rush to gold as a safe asset.",
    },
    {
      icon: <FaChartBar className="text-blue-500 text-2xl" />,
      title: "Mutual funds outperform savings accounts",
      desc: "Mutual funds yield better returns.",
    },
  ];

  // cycle highlights automatically
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [cards.length]);

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
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  animate={
                    activeIndex === index ? { scale: 1.08 } : { scale: 1 }
                  }
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className={`border border-gray-600 rounded-xl p-4 flex flex-col items-start gap-2 bg-[#001B0A] text-left shadow-md 
          ${index === 2 ? "md:col-span-2 md:w-1/2 mx-auto" : ""}`}
                >
                  {card.icon}
                  <h3 className="font-bold text-white">{card.title}</h3>
                  <p className="text-gray-300 text-sm">{card.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right side: Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Objective: Learn how{" "}
                <span className=" text-yellow-400">
                  market news impacts investments
                </span>{" "}
                and practice reacting to sudden financial changes.
              </p>
              <p className="mt-2">
                Scenario: Breaking headlines appear —{" "}
                <span className="">
                  Tech stocks crash, Gold soars, Mutual Funds shine
                </span>
                . You must quickly decide{" "}
                <span className=" text-green-400">
                  how your investments should react
                </span>
                .
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>📰 Step 1: Read the fake news headline</li>
                <li>
                  📊 Step 2: Decide how it affects Stocks, Gold, or Mutual Funds
                </li>
                <li>💡 Step 3: Watch your portfolio adjust in real-time</li>
              </ul>
              <p className="mt-2 text-red-400">
                Be alert — not every headline means panic, some are
                opportunities!
              </p>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-sm shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-8 max-w-md text-outline">
              <div className="uppercase text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div>
                Understanding how{" "}
                <span className=" text-yellow-200">
                  news and events drive market behavior
                </span>
                , recognizing investor psychology, and{" "}
                <span className=" text-yellow-200">
                  making smarter decisions under pressure
                </span>{" "}
                when markets shift suddenly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
