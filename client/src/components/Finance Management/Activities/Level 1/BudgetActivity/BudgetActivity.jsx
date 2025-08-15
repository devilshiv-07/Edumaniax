import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useFinance } from "../../../../../contexts/FinanceContext.jsx";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay.jsx";

function parsePossiblyStringifiedJSON(text) {
  if (typeof text !== "string") return null;

  text = text.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(json)?/, "")
      .replace(/```$/, "")
      .trim();
  }

  if (text.startsWith("`") && text.endsWith("`")) {
    text = text.slice(1, -1).trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return null;
  }
}

const APIKEY = import.meta.env.VITE_API_KEY;

const BudgetActivity = () => {
  const { completeFinanceChallenge } = useFinance();
  const [income, setIncome] = useState("");
  const [selectedExpenses, setSelectedExpenses] = useState([]);
  const [expenseDetails, setExpenseDetails] = useState([]);
  const [customExpense, setCustomExpense] = useState("");
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [customStrategy, setCustomStrategy] = useState("");
  const [feedback, setFeedback] = useState("");
  const feedbackRef = useRef(null);
  const [remark, setRemark] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbackAvatarType, setFeedbackAvatarType] = useState("disappointing");

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [heartCount, setHeartCount] = useState(3); // ✅ Lives state
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate(); // ensure `useNavigate()` is defined
  const [showKidGif, setShowKidGif] = useState(false);
  const [expenseGifShown, setExpenseGifShown] = useState(false);
  const [strategyGifShown, setStrategyGifShown] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [insightFeedback, setInsightFeedback] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (feedback) {
      setInsightFeedback(feedback);
    }
  }, [feedback]);

  useEffect(() => {
    if (feedback) {
      setTimeout(() => {
        if (feedbackRef.current) {
          feedbackRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [feedback]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const feedbackMap = {
    Sad: "💸 Save some! Don't be a Spendthrift",
    Happy: "🌟 Good savings!",
    Miser: "C'mon, loosen your wallet!",
  };

  const expenseOptions = ["Food", "Travel", "Lunch", "Movie", "Books", "Other"];
  const strategyOptions = [
    "Use piggy bank",
    "Avoid impulse buys",
    "Track spending",
    "Limit outings",
    "Buy second-hand items",
    "Other",
  ];

  const allExpenses = [
    ...selectedExpenses.filter((e) => e !== "Other"),
    customExpense.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  const allStrategies = [
    ...selectedStrategies.filter((s) => s !== "Other"),
    customStrategy.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  const prompt = () => {
    const totalSpent = expenseDetails.reduce(
      (acc, item) => acc + Number(item.cost),
      0
    );
    const percentageSpent = Number(((totalSpent / income) * 100).toFixed(0));
    console.log(typeof percentageSpent);

    return `
You are a critical financial advisor.
A student created this one-month budget:

Income: ₹${income}
Expense Details: ${expenseDetails}
Percentage spent : ${percentageSpent}
Saving Strategies: ${allStrategies}

Please give helpful feedback focusing on whether the student is making smart choices and if the saving strategies are strong. Also comment on whether it shows discipline and planning. If the choices are bad, give criticism and a poor remark. If the choices are good, give helpful suggestions for improvemnt and encouraging remark. 

Constraints:
- The larger the percentageSpent, the poorer the remark and the feedback

- The 'remark' must match these rules:
  - If percentageSpent > 90 and <= 100, remark must be "Spendthrift"
  - If percentageSpent > 70 and <= 90, remark must be "Poor budgeting"
  - If percentageSpent > 60 and <= 70, remark must be "Not bad"
  - If percentageSpent > 50 and <=60, remark must be "Impressive" or "Smart"
  - If percentageSpent > 40 and <=50, remark must be "Great"
  - If percentageSpent <40, remark must be "Excellent"
  - If percentageSpent <10, remark must be "Miser"


- The 'feedback' must match these rules:
  - If percentageSpent > 60, feedback must include some strong criticism and an actionable advice to improve budgeting. Also give review about the saving strategies.
  - If percentageSpent <= 10, , feedback must encourage to spend a little more and not to save like a miser. Do not praise for this kind of saving attitude where percentageSpent <= 10.
  - If percentageSpent < 60 and >10, feedback must include some praise. Also give review about the saving strategies.
  - Maximum length of ffedbacvk is 60 words.


### FINAL INSTRUCTION ###
Return ONLY raw JSON (no backticks, no markdown, no explanations).
Example format:
{
  feedback : "Your feedback",
  remark : ""
}

Remark can have one of these values : "Excellent", "Great", "Smart", "Impressive", "Not bad", "Poor budgeting", "Spendthrift" 
`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setShowConfetti(false);
    setFeedback("");
    setRemark("");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APIKEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt() }],
            },
          ],
        }
      );

      const aiReply = response.data.candidates[0].content.parts[0].text;
      const parsed = parsePossiblyStringifiedJSON(aiReply);
      setFeedback(parsed.feedback);
      // auto-hide feedback panel after 15s
      setTimeout(() => {
        setFeedback("");
        setRemark("");
      }, 15000);
      setTimeout(() => {
        if (feedbackRef.current) {
          feedbackRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 300); // small delay so it renders first
      setRemark(parsed.remark);

      // For performance
      const scoreMap = {
        Spendthrift: 2,
        "Poor budgeting": 4,
        "Not bad": 6,
        Impressive: 7,
        Smart: 8,
        Great: 9,
        Excellent: 10,
        Miser: 3,
      };
      const score = scoreMap[parsed.remark] ?? 5;
      const totalTime = (Date.now() - startTime) / 1000; // seconds
      const studyTimeMinutes = Math.ceil(totalTime / 60);
      updatePerformance({
        moduleName: "Finance",
        topicName: "budgetExpert",
        score, // out of 10
        accuracy: score * 10,
        avgResponseTimeSec: totalTime,
        studyTimeMinutes,
        completed: true,
      });
      setStartTime(Date.now());

      if (/Excellent|Great|Smart/i.test(parsed.remark)) {
        setShowConfetti(true);
        setHasWon(true);
        setFeedbackAvatarType("Happy");
        setTimeout(() => setShowConfetti(false), 5000);
        completeFinanceChallenge(0, 3);
      } else if (parsed.remark === "Miser") {
        setFeedbackAvatarType("Miser");
      } else {
        setFeedbackAvatarType("Sad");
        setHeartCount((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) {
            // navigate("/finance/game-over"); // ✅ redirect to game over
            return 0;
          }
          return newCount;
        });
      }
    } catch (err) {
      console.error("Error:", err);
      setFeedback("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseChange = (expense, checked) => {
    // 🔔 Show GIF once for the expenses section
    if (checked && !expenseGifShown) {
      setShowKidGif(true);
      setExpenseGifShown(true);
      setTimeout(() => setShowKidGif(false), 2000);
    }

    setSelectedExpenses((prev) =>
      checked ? [...prev, expense] : prev.filter((item) => item !== expense)
    );

    setExpenseDetails((prev) =>
      checked
        ? [...prev, { name: expense, cost: 0 }]
        : prev.filter((item) => item.name !== expense)
    );
  };

  const handleStrategyChange = (option, checked) => {
    // 🔔 Show GIF once for the strategies section
    if (checked && !strategyGifShown) {
      setShowKidGif(true);
      setStrategyGifShown(true);
      setTimeout(() => setShowKidGif(false), 2000);
    }

    if (checked) {
      setSelectedStrategies((prev) => [...prev, option]);
    } else {
      setSelectedStrategies((prev) => prev.filter((item) => item !== option));
    }
  };

  const handleCostChange = (expense, value) => {
    const updated = expenseDetails.map((item) =>
      item.name === expense ? { ...item, cost: Number(value) } : item
    );
    setExpenseDetails(updated);

    const total = updated.reduce(
      (sum, item) => sum + (parseFloat(item.cost) || 0),
      0
    );
    if (income && total > parseFloat(income)) {
      toast.error("Expenses exceed income!", { duration: 3000 });
    }
  };

  // View Feedback Handler
  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/credit-card-simulator"); // ensure `useNavigate()` is defined
  };

  console.log(feedbackAvatarType);

  // Map options to their icons
  const expenseIcons = {
    Food: "/financeGames6to8/level-3/food.svg",
    Travel: "/financeGames6to8/level-3/travel.svg",
    Lunch: "/financeGames6to8/level-3/lunch.svg",
    Movie: "/financeGames6to8/level-3/movie.svg",
    Books: "/financeGames6to8/level-3/books.svg",
    Other: "/financeGames6to8/level-3/others.svg",
  };

  const strategyIcons = {
    "Use piggy bank": "/financeGames6to8/level-3/piggyBank.svg",
    "Avoid impulse buys": "/financeGames6to8/level-3/impulseBuying.svg",
    "Track spending": "/financeGames6to8/level-3/trackSpending.svg",
    "Limit outings": "/financeGames6to8/level-3/limitOutings.svg",
    "Buy second-hand items": "/financeGames6to8/level-3/secondHanditems.svg", // ✅ Exact match
    Other: "/financeGames6to8/level-3/otherSavings.svg",
  };

  return (
    <>
      {hasWon ? (
        // ✅ Win Celebration Screen
        <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
          {/* Center Content */}
          <div className="flex flex-col items-center justify-center flex-1 p-6">
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

            <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
              Challenge Complete!
            </h2>

            <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-start sm:gap-4">
              {/* Insight Box */}
              <div className="mt-6 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-74">
                <p className="text-black text-sm font-extrabold mb-1 mt-2">
                  INSIGHT
                </p>
                <div className="bg-[#131F24] w-73 rounded-xl flex items-center justify-center px-4 py-3 text-center">
                  <span
                    className="text-[#FFCC00] lilita-one-regular font-medium italic leading-tight"
                    style={{
                      fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
                      lineHeight: "1.1",
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                    }}
                  >
                    {insightFeedback || "Analyzing your results..."}
                  </span>
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
      ) : heartCount > 0 ? (
        // Normal budget activity
        <>
          <GameNav heartCount={heartCount} />
          <div
            className="pt-20 pb-32 md:pt-50 px-4 py-6 bg-[#0A160E] sm:px-6 md:px-8"
            style={{ fontFamily: "'Comic Neue', cursive" }}
          >
            {feedback && (
              <motion.div
                ref={feedbackRef}
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-3xl mx-auto mb-6 p-5 rounded-xl bg-[#594500CC] border border-[#FFCC00] shadow-lg z-50"
              >
                <h3 className="font-bold text-outline lilita-one-regular text-xl mb-3 text-white">
                  ✨ Feedback
                </h3>
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-lg text-outline lilita-one-regular font-semibold whitespace-nowrap text-white">
                    {feedbackMap[feedbackAvatarType]}
                  </span>
                </div>
                <p className="text-white text-outline lilita-one-regular mb-1">
                  Remark: {remark}
                </p>
                <p className="text-white text-outline lilita-one-regular">
                  Description: {feedback}
                </p>
              </motion.div>
            )}

            <div className="flex flex-col md:flex-row items-start justify-center gap-8 max-w-6xl mx-auto">
              {/* Form Section */}
              <div className="p-6 w-full md:w-1/2 bg-[#202F364D] shadow-2xl rounded-3xl border border-gray-300">
                {showConfetti && (
                  <>
                    <Confetti />
                    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-green-400 via-lime-400 to-emerald-500 text-white py-5 px-6 text-center font-extrabold shadow-xl z-50 text-lg sm:text-xl tracking-wide animate-pulse rounded-b-3xl">
                      🎉🎉{" "}
                      <span className="text-2xl sm:text-3xl">
                        Congratulations!
                      </span>{" "}
                      You've earned the{" "}
                      <span className="underline">Smart Budgeter</span> badge!
                      🏅
                    </div>
                  </>
                )}

                <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-white lilita-one-regular drop-shadow-sm">
                  💰 Monthly Budget Activity
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="number"
                    placeholder="Monthly income (₹)"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-base text-white sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#1936434d] shadow-sm"
                    required
                  />

                  {/* Expenses Section */}
                  <div>
                    <p className="font-semibold mb-2 text-white lilita-one-regular text-lg">
                      🛍️ Select Expenses:
                    </p>
                    {expenseOptions.map((option) => (
                      <div key={option} className="mb-3">
                        <label className="inline-flex items-center">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            value={option}
                            checked={selectedExpenses.includes(option)}
                            onChange={(e) =>
                              handleExpenseChange(option, e.target.checked)
                            }
                            className="mr-3 h-5 w-5 text-white"
                          />
                          {/* Icon */}
                          <img
                            src={expenseIcons[option]}
                            alt={option}
                            className="w-9 h-9 mr-2"
                          />
                          {/* Text */}
                          <span className="text-base text-white lilita-one-regular font-medium">
                            {option}
                          </span>
                        </label>

                        {selectedExpenses.includes(option) && (
                          <input
                            type="number"
                            placeholder="Enter cost"
                            value={
                              expenseDetails.find(
                                (item) => item.name === option
                              )?.cost || ""
                            }
                            onChange={(e) =>
                              handleCostChange(option, Number(e.target.value))
                            }
                            className="ml-4 mt-2 sm:mt-0 text-white p-2 border-2 border-white rounded-lg w-full sm:w-44 text-base"
                          />
                        )}
                      </div>
                    ))}

                    {selectedExpenses.includes("Other") && (
                      <textarea
                        placeholder="Enter other expense"
                        value={customExpense}
                        onChange={(e) => setCustomExpense(e.target.value)}
                        className="w-full p-3 mt-2 border-2 border-blue-300 rounded-xl text-base"
                      />
                    )}
                  </div>

                  {/* Saving Strategies Section */}
                  <div>
                    <p className="font-semibold mb-2 text-white lilita-one-regular text-lg">
                      💡 Select Saving Strategies:
                    </p>
                    {strategyOptions.map((option) => (
                      <div key={option} className="mb-3">
                        <label className="inline-flex items-center">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            value={option}
                            checked={selectedStrategies.includes(option)}
                            onChange={(e) =>
                              handleStrategyChange(option, e.target.checked)
                            }
                            className="mr-3 h-5 w-5 text-white"
                          />
                          {/* Icon */}
                          <img
                            src={strategyIcons[option]}
                            alt={option}
                            className="w-9 h-9 mr-2"
                          />
                          {/* Text */}
                          <span className="text-base text-white lilita-one-regular font-medium">
                            {option}
                          </span>
                        </label>
                      </div>
                    ))}

                    {selectedStrategies.includes("Other") && (
                      <textarea
                        placeholder="Enter custom strategy"
                        value={customStrategy}
                        onChange={(e) => setCustomStrategy(e.target.value)}
                        className="w-full text-white p-3 mt-2 border-2 border-white rounded-xl text-base"
                      />
                    )}
                  </div>

                  {/* Footer */}
                  <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
                    {showKidGif && (
                      <div
                        className="
              absolute
              -top-24 sm:-top-30
              transform -translate-x-1/2
              z-50 flex items-start
            "
                        style={{ left: "85%" }}
                      >
                        <img
                          src="/financeGames6to8/kid-gif.gif"
                          alt="Kid Celebration"
                          className="object-contain"
                          style={{
                            maxHeight: "120px",
                            height: "auto",
                            width: "auto",
                          }}
                        />
                        <img
                          src="/financeGames6to8/kid-saying.svg"
                          alt="Kid Saying"
                          className="absolute top-2 left-[90px] w-24 hidden md:block"
                        />
                      </div>
                    )}

                    {loading ? (
                      <div className="flex flex-col items-center justify-center my-2">
                        <div className="w-12 h-12 border-4 border-t-pink-500 border-yellow-300 rounded-full animate-spin"></div>
                        <p className="mt-2 text-gray-200 lilita-one-regular text-lg font-semibold">
                          Thinking...
                        </p>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSubmit}
                        disabled={!income || selectedExpenses.length === 0}
                        className={`${
                          !income || selectedExpenses.length === 0
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <img
                          src="/financeGames6to8/check-now-btn.svg"
                          alt="Check Now"
                          className="h-12 sm:h-16 w-auto"
                        />
                      </motion.button>
                    )}
                  </div>
                </form>
              </div>
            </div>
            <ToastContainer />
          </div>
        </>
      ) : (
        // ❌ Game Over Screen
        <div className="flex flex-col justify-between h-screen bg-[#0A160E] text-center overflow-hidden">
          <div className="flex flex-col items-center justify-center flex-1 p-4">
            <img
              src="/financeGames6to8/game-over-game.gif"
              alt="Game Over"
              className="w-48 sm:w-64 h-auto mb-4"
            />
            <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
              Oops! That was close! Wanna Retry?
            </p>
          </div>
          <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-3 overflow-x-auto">
            <img
              src="/financeGames6to8/feedback.svg"
              alt="Feedback"
              onClick={handleViewFeedback}
              className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
            />
            <img
              src="/financeGames6to8/retry.svg"
              alt="Retry"
              onClick={() => {
                setHeartCount(3);
                setShowIntro(false);
              }}
              className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
            />
            <img
              src="/financeGames6to8/next-challenge.svg"
              alt="Next Challenge"
              onClick={handleNextChallenge}
              className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>
      )}
      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
};

export default BudgetActivity;
