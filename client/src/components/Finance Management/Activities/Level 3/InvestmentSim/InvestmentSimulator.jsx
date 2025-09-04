import { useEffect, useState } from "react";
import BarChart from "../../../../charts/BarChart";
import PieChart from "../../../../charts/PieChart";
import { useFinance } from "../../../../../contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import InstructionOverlay from "./InstructionOverlay";
import { useNavigate } from "react-router-dom";

function GameCompletionPopup({ isOpen, onConfirm, onCancel, onClose, title, message, confirmText, cancelText, hideConfirmButton = false }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
            <style>{`
                @keyframes scale-in-popup {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in-popup { animation: scale-in-popup 0.3s ease-out forwards; }
            `}</style>
            <div className="relative bg-[#131F24] border-2 border-[#FFCC00] rounded-2xl p-6 md:p-8 text-center shadow-2xl w-11/12 max-w-md mx-auto animate-scale-in-popup">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2 rounded-full"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="lilita-one-regular text-2xl md:text-3xl text-yellow-400 mb-3">
                    {title || "Challenge Complete!"}
                </h2>
                <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
                    {message || "What would you like to do next?"}
                </p>
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-8 py-3 bg-red-600 text-lg text-white lilita-one-regular rounded-md hover:bg-red-700 transition-colors border-b-4 border-red-800 active:border-transparent shadow-lg"
                    >
                        {cancelText || "Exit Game"}
                    </button>
                    {!hideConfirmButton && (
                        <button
                            onClick={onConfirm}
                            className="px-8 py-3 bg-green-600 text-lg text-white lilita-one-regular rounded-md hover:bg-green-700 transition-colors border-b-4 border-green-800 active:border-transparent shadow-lg"
                        >
                            {confirmText || "Continue"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}


const InvestmentSimulator = () => {
  const { completeFinanceChallenge } = useFinance();
  const { updatePerformance } = usePerformance(); // for performance
  const [startTime, setStartTime] = useState(Date.now()); // for performance
  const [allocations, setAllocations] = useState({
    fixedDeposits: 0,
    gold: 0,
    mutualFunds: 0,
    stocks: 0,
    savings: 0,
  });

  const [returnRate, setReturnRate] = useState({
    fixedDeposits: 0,
    gold: 0,
    mutualFunds: 0,
    stocks: 0,
    savings: 0,
  });

  const [randomReturnRate, setRandomReturnRate] = useState({
    fixedDeposits: 0,
    gold: 0,
    mutualFunds: 0,
    stocks: 0,
    savings: 0,
  });

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f7f", "#8dd1e1"];

  const names = ["Fixed Deposits", "Gold", "Mutual Funds", "Stocks", "Savings"];

  const [result, setResult] = useState(null);
  const [total, setTotal] = useState(1000);
  const [years, setYears] = useState(1);
  const [valueAfterInvestmentYears, setValueAfterInvestmentYears] = useState(0);
  const [finalAmount, setFinalAmount] = useState([]);
  const [randomRate, setRandomRate] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showWin, setShowWin] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false); // 👉 new state for feedback modal
  const [showInstructions, setShowInstructions] = useState(true); // 👉 new state for instructions overlay
  const [isPopupVisible, setIsPopupVisible] = useState(false); // --- NEW STATE FOR POPUP ---
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showWin) {
      document.body.style.overflow = "hidden"; // disable window scroll
    } else {
      document.body.style.overflow = "auto"; // restore when closed
    }
  }, [showWin]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const simulate = (returnRate, years) => {
    const getRandom = (max, min) => Math.random() * (max - min) + min;
    const amount = (percent) => (total * percent) / 100;

    const getRandomReturns = {
      fixedDeposits: getRandom(0.05, 0.07),
      gold: getRandom(0.08, 0.1),
      mutualFunds: getRandom(0.1, 0.15),
      stocks: getRandom(0.12, 0.18),
      savings: getRandom(0.03, 0.04),
    };

    const rate = randomRate ? getRandomReturns : returnRate;

    console.log(randomRate);
    console.log(rate);

    setRandomReturnRate(getRandomReturns);

    return [
      {
        name: "Fixed Deposits",
        value: Math.round(
          amount(allocations.fixedDeposits) *
            Math.pow(1 + rate.fixedDeposits, years)
        ),
      },
      {
        name: "Gold",
        value: Math.round(
          amount(allocations.gold) * Math.pow(1 + rate.gold, years)
        ),
      },
      {
        name: "Mutual Funds",
        value: Math.round(
          amount(allocations.mutualFunds) *
            Math.pow(1 + rate.mutualFunds, years)
        ),
      },
      {
        name: "Stocks",
        value: Math.round(
          amount(allocations.stocks) * Math.pow(1 + rate.stocks, years)
        ),
      },
      {
        name: "Savings",
        value: Math.round(
          amount(allocations.savings) * Math.pow(1 + rate.savings, years)
        ),
      },
    ];
  };

  const handleSimulate = () => {
    const res = simulate(returnRate, years);
    console.log("Res", res);
    setResult(res);

    const invested = total;
    const finalAmnt = res.reduce((acc, item) => acc + Number(item.value), 0);
    setValueAfterInvestmentYears(Number(finalAmnt));
    console.log(finalAmnt);
    const returns = finalAmnt - invested;

    setFinalAmount([
      {
        name: "Investment",
        value: invested,
      },
      {
        name: "Returns",
        value: returns,
      },
    ]);
    // ✅ Mark challenge as complete
    completeFinanceChallenge(2, 2);

    // for performance
    const totalTimeSec = (Date.now() - startTime) / 1000;
    updatePerformance({
      moduleName: "Finance",
      topicName: "investorLevel",
      score: 10,
      accuracy: 100,
      avgResponseTimeSec: totalTimeSec, // using full time as it's one-shot
      studyTimeMinutes: Math.ceil(totalTimeSec / 60),
      completed: true,
    });
    setStartTime(Date.now());
    // 👉 show win section
    setShowWin(true);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };
  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  const handleExitGame = () => {
    navigate("/courses"); 
    setIsPopupVisible(false);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  const retryGame = () => {
    setAllocations({
      fixedDeposits: 0,
      gold: 0,
      mutualFunds: 0,
      stocks: 0,
      savings: 0,
    });
    setReturnRate({
      fixedDeposits: 0,
      gold: 0,
      mutualFunds: 0,
      stocks: 0,
      savings: 0,
    });
    setRandomReturnRate({
      fixedDeposits: 0,
      gold: 0,
      mutualFunds: 0,
      stocks: 0,
      savings: 0,
    });
    setResult(null);
    setValueAfterInvestmentYears(0);
    setFinalAmount([]);
    setShowWin(false); // ✅ hide win screen
    setShowFeedback(false); // ✅ hide feedback modal if open
    // ⚠️ don't touch setShowIntro (so intro won’t show again)
  };

  return (
    <>
      <GameNav />
      <div className="pt-20 bg-[#0A160E] md:pt-50 w-[100%] mx-auto p-3">
        <div
          className="w-full bg-[#202F364D] rounded-[30px] p-8 shadow-lg border-4 border-gray-300"
          style={{ fontFamily: "'Comic Neue', cursive" }}
        >
          <div className="flex flex-col lg:flex-row mt-6 gap-4">
            <div className="space-x-3 lilita-one-regular text-xl font-bold p-5 rounded-[20px] bg-yellow-300 shadow-inner hover:bg-yellow-400 transition-all">
              <span>Total Amount</span>
              <input
                type="number"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="border-2 border-pink-400 w-[90%] rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter the amount"
              />
            </div>
            <div className="space-x-3 lilita-one-regular text-xl font-bold p-5 rounded-[20px] bg-blue-300 shadow-inner hover:bg-blue-400 transition-all">
              <span>For Years : </span>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="border-2 border-purple-400 w-[90%] rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter the amount"
              />
            </div>
          </div>

          <div className="mt-6 p-3">
            <h2 className="text-2xl font-extrabold mb-3 text-white lilita-one-regular">
              Distributions :{" "}
            </h2>
            <ul className="mb-4 lilita-one-regular bg-gradient-to-r p-4 rounded-3xl from-pink-100 to-purple-200 text-xl list-disc list-inside space-y-2 shadow-md">
              <li>
                Fixed Deposits: A safe investment option offering fixed interest
                over a set period.
              </li>
              <li>
                Gold: A traditional store of value, often used as a hedge
                against inflation.
              </li>
              <li>
                Mutual Funds: Diversified investments managed by professionals
                to balance risk and return.
              </li>
              <li>
                Stocks: Shares in companies that can yield high returns, but
                carry market risks.
              </li>
              <li>
                Savings: Funds kept in a bank account, offering high liquidity
                with minimal returns.
              </li>
            </ul>

            <div className="flex flex-col md:flex-row">
              <span className="text-lg text-center font-semibold text-white lilita-one-regular">
                Rate of Return :
              </span>
              <label className="text-lg text-center font-semibold">
                <input
                  type="checkbox"
                  checked={randomRate}
                  onChange={(e) => {
                    setRandomRate(e.target.checked);
                    console.log(e.target.checked);
                  }}
                  className="mr-1 scale-125 accent-pink-500 ml-2"
                />
                <span className=" text-white lilita-one-regular">Random</span>
              </label>
            </div>

            <p className="mt-2 text-center md:text-left text-lg font-semibold text-green-700">
              Remaining Allocation:{" "}
              {100 - Object.values(allocations).reduce((a, b) => a + b, 0)}%
            </p>

            <div className="max-w-[450px] mt-4 p-5 bg-gradient-to-br from-pink-200 to-blue-200 rounded-[25px] shadow-xl mx-auto">
              <div className="max-w-[400px] grid grid-cols-2 gap-4 font-semibold text-center">
                <span className="text-lg text-pink-600">Asset</span>
                <span className="text-lg text-blue-600">
                  {randomRate ? "Rate of Return" : "Choose custom rate"}
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {Object.keys(allocations).map((key, index) => {
                  const totalAllocated = Object.values(allocations).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const remaining = 100 - totalAllocated + allocations[key];
                  const safeMax = Math.max(0, Math.min(100, remaining));

                  return (
                    <div
                      key={key}
                      className="max-w-[450px] grid grid-cols-2 gap-10 lg:gap-4 items-center bg-white/70 rounded-xl p-3 hover:scale-[1.01] transition-transform"
                    >
                      <div className="space-y-4">
                        <div className="font-bold text-lg text-purple-700">
                          {names[index]}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <input
                            type="range"
                            min={0}
                            max={safeMax}
                            value={allocations[key]}
                            onChange={(e) =>
                              setAllocations((prev) => ({
                                ...prev,
                                [key]: Number(e.target.value),
                              }))
                            }
                            className="accent-pink-500"
                          />
                          <span className="text-sm text-center font-bold text-blue-600">
                            {allocations[key]}%
                          </span>
                        </div>
                      </div>

                      {randomRate ? (
                        <div className="flex h-full justify-center items-start gap-1 text-xl text-green-600 font-bold">
                          {(randomReturnRate[key] * 100).toFixed(2)}%
                        </div>
                      ) : (
                        <div className="h-full flex justify-center items-start gap-2">
                          <input
                            type="number"
                            value={returnRate[key]}
                            className="border-2 w-[90%] border-blue-400 rounded-lg px-2 py-1  text-center focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter rate"
                            onChange={(e) =>
                              setReturnRate((prev) => ({
                                ...prev,
                                [key]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleSimulate}
              className="bg-gradient-to-r from-pink-400 to-purple-500 text-white lilita-one-regular px-6 py-3 text-xl font-bold rounded-xl shadow-lg hover:scale-110 transition-all duration-300"
            >
              🎲 Simulate Returns
            </button>
          </div>

          {showWin && result && (
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

                {/* Title */}
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                  Challenge Complete!
                </h2>

                {/* Final Amount */}
                <div className="mt-6 text-white lilita-one-regular text-xl">
                  Final amount after {years} {years > 1 ? "years" : "year"} :
                  <strong className="ml-2">₹{valueAfterInvestmentYears}</strong>
                </div>

                {/* Charts Section */}
                <div className="mx-auto mt-8 flex flex-col xl:flex-row justify-center items-center gap-6">
                  <div className="p-5 hover:rotate-1 transition-transform">
                    <BarChart
                      data={result.map((item) => item.value)}
                      colors={COLORS}
                      labels={result.map((item) => item.name)}
                    />
                  </div>
                  <div className="p-5 hover:-rotate-1 transition-transform">
                    <PieChart
                      values={result.map((item) => item.value)}
                      colors={COLORS}
                      labels={result.map((item) => item.name)}
                    />
                  </div>
                  <div className="p-5 hover:rotate-2 transition-transform">
                    <PieChart
                      values={finalAmount.map((item) => item.value)}
                      colors={COLORS}
                      labels={finalAmount.map((item) => item.name)}
                    />
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
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={retryGame}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                {/* --- ADDED NEXT CHALLENGE BUTTON --- */}
                <img
                  src="/financeGames6to8/next-challenge.svg"
                  alt="Next Challenge"
                  onClick={handleNextChallenge}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
          )}

          {/* Instructions overlay */}
          {/* Instructions overlay */}
          {showInstructions && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <InstructionOverlay onClose={() => setShowInstructions(false)} />
            </div>
          )}
        </div>
      </div>

      {/* --- RENDER THE POPUP --- */}
      <GameCompletionPopup
        isOpen={isPopupVisible}
        onCancel={handleExitGame}
        onClose={handleClosePopup}
        title="Challenge Complete!"
        message="Would you like to exit to the main menu?"
        cancelText="Exit Game"
        hideConfirmButton={true} 
      />
    </>
  );
};

export default InvestmentSimulator;
