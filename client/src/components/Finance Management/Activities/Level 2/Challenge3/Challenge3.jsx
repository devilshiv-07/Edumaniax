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

  // Track winner state
  const [parsedWinner, setParsedWinner] = useState(null);
  const [showIntro, setShowIntro] = useState(true);

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

  // Post-game effects
  useEffect(() => {
    if (step >= items.length && expenseLimit) {
      const overspent = getTotalSpent() > Number(expenseLimit);
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
      }
    }
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
      </>
    );
  }

  if (step >= items.length) {
    const overspent = getTotalSpent() > Number(expenseLimit);
    return (
      <motion.div
        className="max-w-full sm:max-w-3xl mx-auto mt-6 px-4 py-6 bg-white rounded-xl shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2
          className={`text-2xl font-bold text-center mb-4 ${
            overspent ? "text-red-600" : "text-green-600"
          }`}
        >
          {overspent ? "❌ You overspent" : "🎉 You Win!"}
        </h2>
        <p className="text-center mb-2">
          🧾 Total Spent: ₹{getTotalSpent()} / ₹{expenseLimit}
        </p>
        <p
          className={`text-center font-bold ${
            overspent ? "text-red-500" : "text-green-500"
          }`}
        >
          {overspent
            ? "Try skipping more next time!"
            : "Great job! You stayed within budget!"}
        </p>

        {/* Feedback Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {["needNow", "wantLater", "skipIt"].map((cat) => (
            <div key={cat} className="bg-gray-100 p-4 rounded shadow">
              <h4 className="text-center font-bold text-blue-700 uppercase">
                {cat.replace(/([A-Z])/g, " $1")}
              </h4>
              {sortedItems[cat].length > 0 ? (
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {sortedItems[cat].map((item, i) => (
                    <li key={i}>
                      {item.name} — ₹{item.price}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-xs text-gray-500 mt-2">
                  No items
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-bold mb-4">💬 Feedback Summary</h3>
          <div className="space-y-4">
            {feedbackLog.map((entry, i) => (
              <div key={i} className="bg-white border rounded-lg p-4 shadow-sm">
                <p className="font-bold text-gray-800">
                  {entry.name} — ₹{entry.price}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Category:</span>{" "}
                  <span className="text-blue-700 uppercase">
                    {entry.category.replace(/([A-Z])/g, " $1")}
                  </span>
                </p>
                <p className="mt-1 text-gray-700">{entry.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
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
