import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import { useFinance } from "../../../../../contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// Lottie animations
import superheroAnimation from "../../../../../lotties/superhero.json";
import thinkingAnimation from "../../../../../lotties/thinking.json";
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";
import axios from "axios";
import { notesFinance6to8 } from "@/data/notesFinance6to8";

const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'budgetChallengeGameState';

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
const items = [
  { name: "School bag", price: 1200 },
  { name: "Spotify Premium", price: 119 },
  { name: "New jeans", price: 2000 },
  { name: "Birthday party", price: 3000 },
  { name: "Bus pass", price: 500 },
  { name: "Xbox controller", price: 4000 },
];

const getFeedback = (item, category, totalSpent, limit) => {
  const overspendWarning =
    totalSpent + item.price > limit
      ? `⚠️ Buying this will exceed your ₹${limit} monthly budget!`
      : "";

  switch (category) {
    case "needNow":
      if (["Bus pass", "School bag"].includes(item.name)) {
        return `✅ Smart! ₹${item.price} on ${item.name} is a good investment. ${overspendWarning}`;
      } else {
        return `🤔 Consider if ${item.name} (₹${item.price}) is truly essential. ${overspendWarning}`;
      }
    case "wantLater":
      return `⏳ Waiting for ${item.name} shows patience. ${overspendWarning}`;
    case "skipIt":
      return `🙌 Skipping ${item.name} (₹${item.price}) saved money. Good choice!`;
    default:
      return "";
  }
};

const getLottieAnimation = (category) => {
  switch (category) {
    case "needNow":
      return superheroAnimation;
    case "wantLater":
      return thinkingAnimation;
    default:
      return null;
  }
};

const Challenge3 = () => {
  const { completeFinanceChallenge } = useFinance();
  const { updatePerformance } = usePerformance();

  const [step, setStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [expenseLimit, setExpenseLimit] = useState("");
  const [sortedItems, setSortedItems] = useState({
    needNow: [],
    wantLater: [],
    skipIt: [],
  });
  const [feedbackLog, setFeedbackLog] = useState([]);
  const [lastFeedback, setLastFeedback] = useState("");
  const [currentAction, setCurrentAction] = useState("");
  const [startTime, setStartTime] = useState(Date.now());
    const [aiInsight, setAiInsight] = useState({
    tip: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
  });

  // Track winner state
  const [parsedWinner, setParsedWinner] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  const getTotalSpent = () =>
    [...sortedItems.needNow].reduce((sum, item) => sum + item.price, 0);

  const handleStartGame = () => {
    if (Number(inputValue) > 0) setExpenseLimit(inputValue);
  };

  const handleSort = (category) => {
    const item = items[step];
    if (!item) return;

    const total = getTotalSpent();
    const feedback = getFeedback(item, category, total, Number(expenseLimit));

    setCurrentAction(category);
    setSortedItems((prev) => ({
      ...prev,
      [category]: [...prev[category], item],
    }));
    setFeedbackLog((prev) => [...prev, { ...item, category, feedback }]);
    setLastFeedback(feedback);

    setTimeout(() => {
      setLastFeedback("");
      setCurrentAction("");
      setStep((prev) => prev + 1);
    }, 2000);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/my_purchase_plan"); // ensure `useNavigate()` is defined
  };
  
  const handleNavigateToSection = () => {
    if (aiInsight.recommendedSectionId) {
      const stateToSave = {
        parsedWinner,
        expenseLimit,
        sortedItems,
        feedbackLog,
        aiInsight,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
      navigate(
        `/finance/notes?grade=6-8&section=${aiInsight.recommendedSectionId}`
      );
    }
  };

  const resetGame = () => {
    setStep(0);
    setInputValue("");
    setExpenseLimit("");
    setSortedItems({
      needNow: [],
      wantLater: [],
      skipIt: [],
    });
    setFeedbackLog([]);
    setLastFeedback("");
    setCurrentAction("");
    setParsedWinner(null);
    setShowIntro(false); // skip intro
    setShowFeedback(false);
    setStartTime(Date.now()); // reset timer
  };

  useEffect(() => {
    const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);

        // Restore the state to the end-game screen
        setStep(items.length);
        setParsedWinner(savedState.parsedWinner);
        setExpenseLimit(savedState.expenseLimit);
        setSortedItems(savedState.sortedItems);
        setFeedbackLog(savedState.feedbackLog);
        setAiInsight(savedState.aiInsight);

        // Skip intro screens
        setShowIntro(false);
        setShowInstructions(false);

        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to parse saved game state:", error);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }
  }, []);

  // After
  // Post-game effects
  useEffect(() => {
    const runEndGameLogic = async () => {
      if (step >= items.length && expenseLimit) {
        const totalSpent = getTotalSpent();
        const overspent = totalSpent > Number(expenseLimit);
        setParsedWinner(!overspent);

        if (!overspent) {
          completeFinanceChallenge(1, 2);
          const totalTimeSec = (Date.now() - startTime) / 1000;
          updatePerformance({
            moduleName: "Finance",
            topicName: "bankingExpert",
            score: 10,
            accuracy: 100,
            avgResponseTimeSec: totalTimeSec / items.length,
            studyTimeMinutes: Math.ceil(totalTimeSec / 60),
            completed: true,
          });
          setStartTime(Date.now());
        } else {
          // LOSE CASE: Call AI for a recommendation
          const prompt = `
            You are an expert AI tutor for a student in grades 6-8 who failed a budgeting challenge.

            ### CONTEXT ###
            1.  **Student's Budget:** ₹${expenseLimit}
            2.  **Their Spending:** They chose to buy items totaling ₹${totalSpent}.
            3.  **The Mistake:** They overspent their budget.
            4.  **Items they chose to buy ('Need Now'):**
                ${JSON.stringify(sortedItems.needNow, null, 2)}
            5.  **All Available Note Sections for this Finance Module:**
                ${JSON.stringify(notesFinance6to8, null, 2)}

            ### YOUR TASK ###
            Based on the student overspending and the items they chose to buy, DETECT the SINGLE most relevant note section from the provided list to help them improve. For example, if they bought many 'wants', 'Needs vs. Wants' is a great topic. If they simply miscalculated, 'Budgeting 101' is better.

            ### OUTPUT FORMAT ###
            Return ONLY a raw JSON object with the detected topic ID. Do not add markdown backticks.
            {"detectedTopicId": "The 'topicId' of the most relevant note section (e.g., '1', '2', etc.)"}
          `;

          try {
            const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APIKEY}`,
              { contents: [{ parts: [{ text: prompt }] }] }
            );
            const aiReply = response.data.candidates[0].content.parts[0].text;
            const parsed = parsePossiblyStringifiedJSON(aiReply);
            const recommendedNote = notesFinance6to8.find(
              (note) => note.topicId === parsed.detectedTopicId
            );
            setAiInsight({
              tip: `You set a budget of ₹${expenseLimit} but spent ₹${totalSpent}. Let's review some topics to help with planning next time!`,
              recommendedSectionId: parsed.detectedTopicId,
              recommendedSectionTitle: recommendedNote ? recommendedNote.title : "",
            });
          } catch (err) {
            console.error("AI recommendation failed:", err);
            setAiInsight({
              tip: `You set a budget of ₹${expenseLimit} but spent ₹${totalSpent}. Budgeting is a key skill to practice!`,
            }); // Fallback
          }
        }
      }
    };
    runEndGameLogic();
  }, [step, expenseLimit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  if (!expenseLimit) {
    return (
      <>
        <GameNav />
        <div className="min-h-screen bg-[#0A160E] flex items-center justify-center">
          <motion.div
            className="max-w-md border border-gray-100 mx-auto px-4 py-6 bg-[#202F364D] rounded-xl shadow-xl sm:max-w-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {" "}
            <h2 className="text-2xl lilita-one-regular font-bold text-center text-white mb-2">
              {" "}
              🎮 Budget Challenge{" "}
            </h2>{" "}
            <p className="text-center text-sm text-white mb-4">
              {" "}
              Enter your monthly budget to begin:{" "}
            </p>{" "}
            <input
              type="number"
              placeholder="e.g. 5000"
              className="w-full border-2 p-2 text-white rounded text-center mb-4 
             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />{" "}
            <button
              onClick={handleStartGame}
              className="w-full bg-blue-600 text-white lilita-one-regular py-2 rounded hover:bg-blue-700"
            >
              {" "}
              🚀 Start Game{" "}
            </button>{" "}
          </motion.div>
        </div>
        {/* Instructions overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}
      </>
    );
  }

  if (step >= items.length) {
    const overspent = getTotalSpent() > Number(expenseLimit);

    // ✅ WIN CASE
    if (!overspent) {
      return (
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

            {/* INSIGHT BOX */}
            <div className="mt-6 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-74">
              <p className="text-black text-sm font-extrabold mb-1 mt-2">
                INSIGHT
              </p>
              <div className="bg-[#131F24] w-73 rounded-xl flex items-center justify-center px-4 py-2 text-center">
                <span
                  className="text-[#FFCC00] font-bold leading-tight"
                  style={{
                    fontSize: "clamp(0.75rem, 1.2vw, 1rem)",
                    lineHeight: "1.2",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                  }}
                >
                  🧾 Total Spent: ₹{getTotalSpent()} / ₹{expenseLimit} <br />
                  🎉 Great job! You stayed within budget!
                </span>
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
      );
    }

    // ❌ LOSE CASE
    return (
      <div className="flex flex-col justify-between h-screen bg-[#0A160E] text-center overflow-hidden">
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/financeGames6to8/game-over-game.gif"
              alt="Game Over"
              className="w-48 sm:w-64 h-auto mb-4"
            />
            <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl font-semibold text-center">
              Oops! That was close! Wanna Retry?
            </p>

            {/* AI Insight and Recommendation Box */}
            {aiInsight.tip && (
              <div className="mt-6 flex flex-col gap-4 w-full max-w-md">
                <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                  <p className="text-black text-sm font-bold my-2 uppercase">
                    Insight
                  </p>
                  <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center px-4 text-center">
                    <span className="text-[#FFCC00] text-sm">{aiInsight.tip}</span>
                  </div>
                </div>
                {aiInsight.recommendedSectionTitle && (
                  <button
                    onClick={handleNavigateToSection}
                    className="bg-[#068F36] text-white rounded-lg py-3 px-6 text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg"
                  >
                    Review "{aiInsight.recommendedSectionTitle}" Notes
                  </button>
                )}
              </div>
            )}


            {/* Feedback Log (Scrollable) */}
            <div className="mt-6 space-y-4">
              {feedbackLog.map((entry, i) => (
                <div
                  key={i}
                  className="bg-[#202F364D] border rounded-lg p-4 shadow-sm text-left"
                >
                  <p className="font-bold text-white lilita-one-regular">
                    {entry.name} — ₹{entry.price}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold text-white lilita-one-regular">
                      Category:
                    </span>{" "}
                    <span className="text-blue-700 lilita-one-regular uppercase">
                      {" "}
                      {entry.category.replace(/([A-Z])/g, " $1")}
                    </span>
                  </p>
                  <p className="mt-1 text-white lilita-one-regular">
                    {entry.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
            onClick={resetGame}
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
    );
  }

  const currentItem = items[step];
  const currentLottie = getLottieAnimation(currentAction);

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 bg-[#0A160E]">
        <motion.div
          className="max-w-lg border border-gray-100 md:max-w-2xl mx-auto mt-6 px-4 sm:px-6 py-6 bg-[#202F364D] rounded-xl shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-col items-center">
            <div className="w-full max-w-sm md:max-w-md">
              <h2 className="text-2xl font-bold text-center text-white lilita-one-regular mb-4">
                🛍️ Budget Choice
              </h2>
              <p className="text-center text-sm mb-2 text-white">
                Budget: ₹{expenseLimit}
              </p>

              <div className="flex justify-center mb-4 h-40">
                {currentLottie && (
                  <Lottie animationData={currentLottie} loop={true} />
                )}
              </div>

              <div className="mb-4 bg-gray-100 p-4 rounded shadow text-center">
                <p className="text-lg lilita-one-regular">
                  🛒 Item: {currentItem.name}
                </p>
                <p className="text-sm text-gray-700 lilita-one-regular">
                  💰 Price: ₹{currentItem.price}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <button
                  onClick={() => handleSort("needNow")}
                  className="bg-green-600 lilita-one-regular text-outline text-white py-2 rounded hover:bg-green-700 flex-1"
                >
                  ✅ Need Now
                </button>
                <button
                  onClick={() => handleSort("wantLater")}
                  className="bg-blue-600 lilita-one-regular text-outline text-white py-2 rounded hover:bg-blue-700 flex-1"
                >
                  ⏳ Want Later
                </button>
                <button
                  onClick={() => handleSort("skipIt")}
                  className="bg-gray-600 lilita-one-regular text-outline text-white py-2 rounded hover:bg-gray-700 flex-1"
                >
                  ❌ Skip It
                </button>
              </div>

              <AnimatePresence>
                {lastFeedback && (
                  <motion.div
                    className="bg-yellow-100 lilita-one-regular text-yellow-800 p-3 rounded shadow text-sm text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {lastFeedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Challenge3;
