import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import Avatar from "./Avatar";
import { useFinance } from "../../../../../contexts/FinanceContext.jsx";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";

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
    setSelectedExpenses((prev) =>
      checked ? [...prev, expense] : prev.filter((item) => item !== expense)
    );

    setExpenseDetails((prev) =>
      checked
        ? [...prev, { name: expense, cost: 0 }]
        : prev.filter((item) => item.name !== expense)
    );
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

  return (
    <>
      {heartCount > 0 ? (
        // Normal budget activity
        <>
          <GameNav heartCount={heartCount} />
          <div
            className="pt-20 md:pt-50 px-4 py-6 sm:px-6 md:px-8"
            style={{ fontFamily: "'Comic Neue', cursive" }}
          >
            <div className="flex flex-col md:flex-row items-start justify-center gap-8 max-w-6xl mx-auto">
              {/* Form Section */}
              <div className="p-6 w-full md:w-1/2 bg-blue-100 shadow-2xl rounded-3xl border border-green-200">
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

                <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-green-700 drop-shadow-sm">
                  💰 Monthly Budget Activity
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="number"
                    placeholder="Monthly income (₹)"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full p-4 border-2 border-green-300 rounded-xl text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
                    required
                  />

                  {/* Expenses Section */}
                  <div>
                    <p className="font-semibold mb-2 text-blue-600 text-lg">
                      🛍️ Select Expenses:
                    </p>
                    {expenseOptions.map((option) => (
                      <div key={option} className="mb-3">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            value={option}
                            checked={selectedExpenses.includes(option)}
                            onChange={(e) =>
                              handleExpenseChange(option, e.target.checked)
                            }
                            className="mr-3 h-5 w-5 text-green-600"
                          />
                          <span className="text-base font-medium">
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
                            className="ml-4 mt-2 sm:mt-0 p-2 border-2 border-blue-300 rounded-lg w-full sm:w-44 text-base"
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
                    <p className="font-semibold mb-2 text-purple-600 text-lg">
                      💡 Select Saving Strategies:
                    </p>
                    {strategyOptions.map((option) => (
                      <label key={option} className="block mb-2">
                        <input
                          type="checkbox"
                          value={option}
                          checked={selectedStrategies.includes(option)}
                          onChange={(e) =>
                            e.target.checked
                              ? setSelectedStrategies((prev) => [
                                  ...prev,
                                  option,
                                ])
                              : setSelectedStrategies((prev) =>
                                  prev.filter((item) => item !== option)
                                )
                          }
                          className="mr-3 h-5 w-5 text-purple-500"
                        />
                        <span className="text-base font-medium">{option}</span>
                      </label>
                    ))}
                    {selectedStrategies.includes("Other") && (
                      <textarea
                        placeholder="Enter custom strategy"
                        value={customStrategy}
                        onChange={(e) => setCustomStrategy(e.target.value)}
                        className="w-full p-3 mt-2 border-2 border-purple-300 rounded-xl text-base"
                      />
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 rounded-2xl text-lg transition-all duration-300 ease-in-out shadow-md disabled:opacity-50"
                  >
                    {loading ? "Submitting..." : "🚀 Submit for feedback"}
                  </button>
                </form>

                {/* Feedback Section */}
                {feedback && (
                  <motion.div
                    ref={feedbackRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="mt-10 p-5 border-2 border-gray-300 rounded-xl bg-gradient-to-br from-yellow-50 to-pink-50 shadow-inner"
                  >
                    <h3 className="font-bold text-xl mb-3 text-indigo-600">
                      ✨ Feedback
                    </h3>
                    <div className="flex items-center gap-4 mb-2">
                      <Avatar type={feedbackAvatarType} />
                      <span className="text-lg font-semibold whitespace-nowrap">
                        {feedbackMap[feedbackAvatarType]}
                      </span>
                    </div>
                    <p className="text-gray-800 mb-1">
                      <strong>Remark:</strong> {remark}
                    </p>
                    <p className="text-gray-800">
                      <strong>Description:</strong> {feedback}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
            <ToastContainer />
          </div>
        </>
      ) : (
        <div className="flex flex-col justify-between h-screen bg-[#0A160E] text-center overflow-hidden">
          {/* Game Over Content */}
          <div className="flex flex-col items-center justify-center flex-1 p-4">
            {/* Game Over GIF */}
            <img
              src="/financeGames6to8/game-over-game.gif"
              alt="Game Over"
              className="w-48 sm:w-64 h-auto mb-4"
            />

            {/* Text */}
            <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
              Oops! That was close! Wanna Retry?
            </p>
          </div>

          {/* Footer Buttons */}
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
                setHeartCount(3); // reset lives
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
    </>
  );
};

export default BudgetActivity;
