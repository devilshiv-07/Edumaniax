import React, { useEffect, useState } from "react";
import { FaChartLine, FaChartBar, FaCoins } from "react-icons/fa";
import PieChart from "../../../../charts/PieChart";
import { useFinance } from "../../../../../contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";

const getRandom = (max, min) => Math.random() * (max - min) + min;

const generateStockEffect = () => {
  // Stocks: Always negative (between -0.01 to -0.15)
  const stockRandom = (-getRandom(0.15, 0.01)).toFixed(2);
  return { stocks: +stockRandom };
};

const generateGoldEffect = () => {
  // Gold: Always positive (between 0.05 to 0.20)
  const goldRandom = getRandom(0.2, 0.05).toFixed(2);
  return { gold: +goldRandom };
};

const generateMutualFundsEffect = () => {
  // Mutual Funds: Always positive (between 0.02 to 0.15)
  const mutualFundsRandom = getRandom(0.15, 0.02).toFixed(2);
  return { mutualFunds: +mutualFundsRandom };
};

const newsItems = [
  {
    title: " Tech stocks crash after regulations",
    explanation: "Regulations cause panic in the tech sector.",
    effectType: "stocks", // Specify which asset this affects
    icon: "📉",
  },
  {
    title: " Gold hits all-time high",
    explanation: "Investors rush to gold as a safe asset.",
    effectType: "gold", // Specify which asset this affects
    icon: "🏆",
  },
  {
    title: " Mutual funds outperform savings accounts",
    explanation: "Mutual funds yield better returns.",
    effectType: "mutualFunds", // Specify which asset this affects
    icon: "📈",
  },
];

export default function NewsFlash() {
  const { completeFinanceChallenge } = useFinance();
  const initialBase = {
    stocks: 1000,
    gold: 1000,
    mutualFunds: 1000,
  };

  const [base, setBase] = useState(initialBase);

  const [investments, setInvestments] = useState(base);
  const [input, setInput] = useState({
    stocks: 1000,
    gold: 1000,
    mutualFunds: 1000,
  });

  const [highlighted, setHighlighted] = useState("");
  const [message, setMessage] = useState("");
  const [appliedEffects, setAppliedEffects] = useState(new Set());
  const [showIntro, setShowIntro] = useState(true);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showWinPage, setShowWinPage] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const applyEffect = (item) => {
    // Generate effect dynamically based on the item's effectType
    let effect;
    if (item.effectType === "stocks") {
      effect = generateStockEffect();
    } else if (item.effectType === "gold") {
      effect = generateGoldEffect();
    } else if (item.effectType === "mutualFunds") {
      effect = generateMutualFundsEffect();
    }

    const updated = { ...investments };
    for (const key in effect) {
      updated[key] = Math.round(
        (investments[key] * (1 + effect[key]) * 100) / 100
      );
    }
    setInvestments(updated);
    setHighlighted(Object.keys(effect)[0]);

    // Get the rate percentage for the message
    const effectKey = Object.keys(effect)[0];
    const ratePercentage = (effect[effectKey] * 100).toFixed(2);
    const sign = ratePercentage >= 0 ? "+" : "";

    setMessage(`News Applied: ${item.title} - Rate: ${sign}${ratePercentage}%`);

    // Update the applied effects
    setAppliedEffects((prev) => {
      const updatedSet = new Set(prev);
      updatedSet.add(effectKey);

      if (
        updatedSet.has("stocks") &&
        updatedSet.has("gold") &&
        updatedSet.has("mutualFunds")
      ) {
        completeFinanceChallenge(2, 0); //mark challenge completed
        //for performance
        const totalTimeSec = (Date.now() - startTime) / 1000;
        updatePerformance({
          moduleName: "Finance",
          topicName: "investorLevel",
          score: 10,
          accuracy: 100,
          avgResponseTimeSec: totalTimeSec / 3,
          studyTimeMinutes: Math.ceil(totalTimeSec / 60),
          completed: true,
        });
        setStartTime(Date.now());
      }

      return updatedSet; // ✅ this is essential
    });

    setTimeout(() => {
      setHighlighted("");
      setMessage("");
    }, 1500);
  };

  const resetInvestments = () => {
    setInvestments(initialBase); // always reset to original values
    setAppliedEffects(new Set());
    setMessage("Portfolio reset.");
    setTimeout(() => setMessage(""), 1500);
    setStartTime(Date.now());
    setShowWinPage(false); // ✅ go back to main game
  };

  const updateBase = () => {
    setBase(input);
    setInvestments(input);
    setMessage("Portfolio updated.");
    setTimeout(() => setMessage(""), 1500);
    // 🎯 Show Win Page immediately after updating portfolio
    setShowWinPage(true);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/riskometer"); // ensure `useNavigate()` is defined
  };

  let colors3 = ["bg-sky-200", "bg-yellow-200", "bg-orange-100"];

  return (
    <>
      <GameNav />
      {showWinPage ? (
        <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
          {/* Center Content */}
          <div className="flex flex-col items-center justify-center flex-1 p-6">
            {/* Trophy GIFs */}
            <div className="relative w-64 h-64 flex items-center justify-center">
              <img
                src="/financeGames6to8/trophy-rotating.gif"
                alt="Rotating Trophy"
                className="absolute w-full h-full object-contain"
              />
              <img
                src="/financeGames6to8/trophy-celebration.gif"
                alt="Celebration Effects"
                className="absolute w-full h-full object-contain"
              />
            </div>

            {/* Challenge Complete Text */}
            <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
              Challenge Complete!
            </h2>

            {/* Investment Display Section */}
            <div className="mt-8 w-full max-w-3xl bg-[#1c2b29] rounded-xl p-6">
              {/* Reset & Message */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-5 mb-6">
                <button
                  onClick={resetInvestments}
                  className="px-4 sm:px-6 lilita-one-regular py-2 text-lg sm:text-xl text-white bg-red-500 rounded-lg hover:bg-red-800 transition w-full sm:w-auto"
                >
                  Reset Portfolio
                </button>
                {message && (
                  <span className="text-sm sm:text-lg lg:text-xl text-green-400 font-medium break-words">
                    {message}
                  </span>
                )}
              </div>

              {/* Portfolio */}
              <h3 className="text-xl sm:text-2xl font-semibold mb-4 text-yellow-300">
                📊 Your Investment Portfolio
              </h3>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                {Object.entries(investments).map(([type, value], idx) => (
                  <div
                    key={type}
                    className={`flex items-center justify-between sm:justify-start ${
                      colors3[idx]
                    } space-x-3 px-3 sm:px-5 py-3 rounded-lg border ${
                      highlighted === type
                        ? "bg-green-100 border-green-300"
                        : "border-gray-200"
                    } transition w-full sm:w-auto`}
                  >
                    <span className="capitalize font-medium text-lg sm:text-xl text-gray-700">
                      {type === "mutualFunds" ? "Mutual Funds" : type}
                    </span>
                    <span className="text-gray-800 text-lg sm:text-xl font-semibold">
                      ₹ {Math.round(value).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Pie Charts */}
              <div className="mt-6 sm:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Asset Distribution Chart */}
                <div className="bg-orange-200 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
                  <h4 className="text-lg sm:text-xl text-center font-semibold mb-3 text-gray-800">
                    Asset Distribution
                  </h4>
                  <div className="flex justify-center">
                    <div className="w-full max-w-xs -ml-3 lg:-ml-11">
                      <PieChart
                        values={Object.values(investments)}
                        labels={["Stocks", "Gold", "Mutual Funds"]}
                        colors={["#3b82f6", "#facc15", "#10b981"]}
                      />
                    </div>
                  </div>
                </div>

                {/* Investment vs Return Chart */}
                <div className="bg-orange-200 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-lg border border-gray-200">
                  <h4 className="text-lg sm:text-xl text-center font-semibold mb-3 text-gray-800">
                    Investment vs Returns
                  </h4>
                  <div className="flex justify-center">
                    <div className="w-full -ml-3 lg:-ml-11 max-w-xs">
                      <PieChart
                        values={[
                          Object.values(base).reduce((a, b) => a + b, 0),
                          Object.values(investments).reduce((a, b) => a + b, 0),
                        ]}
                        labels={["Invested ₹", "Current Value ₹"]}
                        colors={["#4e7fe1", "#4ade80"]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
            <img
              src="/financeGames6to8/feedback.svg"
              alt="Feedback"
              onClick={handleViewFeedback}
              className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
            />
            <img
              src="/financeGames6to8/next-challenge.svg"
              alt="Next Challenge"
              onClick={handleNextChallenge}
              className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-[#0A160E] pt-20 md:pt-50 pb-28">
          <div className="w-full max-w-7xl mx-auto p-2 sm:p-4">
            <div
              className="p-4 sm:p-6 lg:p-8 bg-[#202F364D] border border-gray-200 rounded-2xl sm:rounded-3xl shadow-2xl mx-auto"
              style={{ fontFamily: "'Comic Neue', cursive" }}
            >
              {/* Header */}
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-sm sm:text-lg lg:text-xl text-white lilita-one-regular font-bold px-2">
                  See how the market turns your fortunes upside down.
                </p>
              </div>

              {/* News Cards - Mobile: Stack vertically, Desktop: Horizontal */}
              <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                {newsItems.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => applyEffect(item)}
                    className={`cursor-pointer bg-[#202F364D] hover:bg-[#2950624d] hover:shadow-lg hover:rotate-1 hover:scale-105 transition-all border border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-5 flex flex-col items-start gap-2 w-full sm:w-auto`}
                  >
                    <div className="flex items-center text-lg sm:text-xl gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl">{item.icon}</span>
                      <p className="font-semibold text-white lilita-one-regular text-sm sm:text-base lg:text-lg leading-tight">
                        {item.title}
                      </p>
                    </div>
                    <p className="text-sm sm:text-base lg:text-lg font-semibold text-white lilita-one-regular">
                      {item.explanation}
                    </p>
                  </div>
                ))}
              </div>

              {/* Investment Inputs */}
              <div className="bg-[#202F364D] rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
                <h3 className="font-semibold text-lg sm:text-xl text-white lilita-one-regular mb-3">
                  💼 Set Your Portfolio
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                  {["stocks", "gold", "mutualFunds"].map((key, idx) => (
                    <div
                      key={key}
                      className={`flex flex-col p-3 sm:p-4 rounded-lg shadow-xl bg-[#202F364D] gap-1`}
                    >
                      <label className="capitalize text-lg sm:text-xl text-white lilita-one-regular font-medium">
                        {key === "mutualFunds" ? "Mutual Funds" : key}
                      </label>
                      <input
                        type="number"
                        value={input[key]}
                        onChange={(e) =>
                          setInput((prev) => ({
                            ...prev,
                            [key]: +e.target.value,
                          }))
                        }
                        className="p-2 text-white sm:p-3 rounded-lg border text-lg sm:text-xl border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 w-full"
                        min="0"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={updateBase}
                  className="mt-4 lilita-one-regular sm:mt-5 text-lg sm:text-xl bg-blue-600 text-white px-4 sm:px-5 py-2 rounded-full hover:bg-blue-700 transition w-full sm:w-auto"
                >
                  Update Portfolio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      :(
      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
      )
    </>
  );
}
