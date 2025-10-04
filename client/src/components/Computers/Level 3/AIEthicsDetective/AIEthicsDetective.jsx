import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";

const scenarios = [
  { id: 1, title: "🧑‍🏫 AI that recognizes faces for school security" },
  { id: 2, title: "💼 AI that decides who gets a job" },
  { id: 3, title: "🛒 AI that suggests what you should buy" },
  { id: 4, title: "🩺 AI that helps doctors diagnose diseases" },
];

const comicOptions = {
  why: [
    "👁️ It watches carefully, but might make mistakes.",
    "📊 Based on data, but needs checking.",
    "🎯 Can help a lot if used fairly!",
  ],
  improve: [
    "🤖 Make it explain its decisions!",
    "🔍 Add a human reviewer!",
    "🧠 Train it with more examples!",
  ],
};

export default function AIEthicsDetective() {
  const { completeComputersChallenge } = useComputers();
  const [step, setStep] = useState(1);
  const [draggedId, setDraggedId] = useState(null);
  const [judgments, setJudgments] = useState({});
  const [responses, setResponses] = useState({});
  const [deepAnswers, setDeepAnswers] = useState({
    q1: "",
    q2: "",
    q3: "",
  });
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  const handleDrop = (label) => {
    if (draggedId !== null) {
      setJudgments((prev) => ({
        ...prev,
        [draggedId]: label,
      }));
      toast.success(`Dropped into ${label}! 🎯`, {
        style: {
          borderRadius: "10px",
          background: "#f0f9ff",
          color: "#0f172a",
          border: "2px solid #38bdf8",
        },
        icon: "✅",
      });
      setDraggedId(null);
    }
  };

  const handleSelect = (scenarioId, type, value) => {
    setResponses((prev) => ({
      ...prev,
      [scenarioId]: { ...prev[scenarioId], [type]: value },
    }));
  };

  const allJudged = scenarios.every((s) => judgments[s.id]);
  const allComicAnswered = scenarios.every(
    (s) => responses[s.id]?.why && responses[s.id]?.improve
  );
  const allDeepAnswered = deepAnswers.q1 && deepAnswers.q2 && deepAnswers.q3;

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/future-ai-architect");
  };

  // ✅ Play Again Handler (reset state)
  const handlePlayAgain = () => {
    setStep(1);
    setResponses({});
    setDeepAnswers({
      q1: "",
      q2: "",
      q3: "",
    });
    setJudgments({});
    setDraggedId(null);
    setStartTime(Date.now());
    setChallengeCompleted(false);
    setShowFeedback(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-gradient-to-b bg-[#0A160E]">
        <div className="p-6 max-w-6xl mx-auto pt-20 md:pt-50 pb-28 rounded-3xl shadow-2xl text-center font-[Comic Sans MS,cursive]">
          {/* STEP 1: Categorization */}
          {step === 1 && (
            <>
              <p className="text-lg text-white lilita-one-regular mb-4">
                Drag each AI case into a category!
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 justify-center mb-8">
                {scenarios.map((s) =>
                  !judgments[s.id] ? (
                    <motion.div
                      key={s.id}
                      draggable
                      onDragStart={() => setDraggedId(s.id)}
                      className="p-4 bg-[#202F364D] border-4 border-white rounded-2xl shadow-xl cursor-grab text-center"
                      initial={{ rotate: 0 }}
                      animate={{ rotate: [0, 3, -3, 0] }} // Only rotation
                      transition={{
                        repeat: Infinity,
                        repeatType: "loop",
                        duration: 3,
                        ease: "easeInOut",
                      }}
                      whileHover={{
                        scale: 1.08,
                        rotate: 0, // stop rotation and hold steady on hover
                        boxShadow: "0px 12px 30px rgba(59, 130, 246, 0.3)", // strong shadow
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <h2 className="text-xl text-white lilita-one-regular leading-snug">
                        {s.title}{" "}
                        <span className="text-2xl animate-pulse">🎭</span>
                      </h2>
                    </motion.div>
                  ) : null
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-around mb-10">
                {["Helpful", "Harmful", "Both"].map((label) => (
                  <motion.div
                    key={label}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(label)}
                    className="w-full sm:w-1/3 p-4 border-4 border-dashed rounded-xl text-center bg-white shadow-md hover:shadow-lg transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-3xl mb-2 animate-bounce">
                      {label === "Helpful"
                        ? "✅"
                        : label === "Harmful"
                        ? "❌"
                        : "🤔"}
                    </div>
                    <h3 className="font-bold text-lg text-purple-700 lilita-one-regular">
                      {label}
                    </h3>
                  </motion.div>
                ))}
              </div>

              {allJudged && (
                <button
                  onClick={() => setStep(2)}
                  className="bg-[#7d95a14d] hover:bg-[#5f9cb84d] text-white lilita-one-regular px-6 py-3 rounded-full text-lg transition hover:scale-105"
                >
                  ➡️ Explain Your Choices
                </button>
              )}
            </>
          )}

          {/* STEP 2: Comic Bubbles */}
          {step === 2 && (
            <>
              <p className="text-lg text-white lilita-one-regular mb-6">
                Pick answers for each scenario.
              </p>
              {scenarios.map((s) => (
                <motion.div
                  key={s.id}
                  className="bg-[#202F364D] border-2 border-white p-6 rounded-xl mb-6 text-left shadow-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h2 className="text-xl text-white lilita-one-regular mb-2">
                    {s.title}
                  </h2>
                  <p className="lilita-one-regular text-white mb-2">
                    Judgment: {judgments[s.id]}{" "}
                    {judgments[s.id] === "Helpful"
                      ? "✅"
                      : judgments[s.id] === "Harmful"
                      ? "❌"
                      : "🤔"}
                  </p>

                  <div className="mb-4">
                    <h3 className="text-white lilita-one-regular mb-1">
                      💬 Why?
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {comicOptions.why.map((option, i) => (
                        <button
                          key={i}
                          className={`px-3 py-2 lilita-one-regular rounded-xl border ${
                            responses[s.id]?.why === option
                              ? "bg-yellow-300 border-yellow-600"
                              : "bg-gray-100"
                          }`}
                          onClick={() => handleSelect(s.id, "why", option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="lilita-one-regular text-white mb-1">
                      🔧 How to Make it Better?
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {comicOptions.improve.map((option, i) => (
                        <button
                          key={i}
                          className={`px-3 py-2 lilita-one-regular rounded-xl border ${
                            responses[s.id]?.improve === option
                              ? "bg-green-300 border-green-600"
                              : "bg-gray-100"
                          }`}
                          onClick={() => handleSelect(s.id, "improve", option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              {allComicAnswered && (
                <button
                  onClick={() => setStep(3)}
                  className="bg-[#438cad4d] hover:bg-[#728d9a4d] text-white lilita-one-regular px-6 py-3 rounded-full text-lg transition hover:scale-105"
                >
                  ➡️Deep Thinking Time
                </button>
              )}
            </>
          )}

          {/* STEP 3: Deep Thinking Questions */}
          {step === 3 && (
            <>
              <motion.div
                className="mt-8 px-6 py-4 rounded-3xl bg-[#202F364D] border border-white shadow-xl max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl lilita-one-regular text-white text-center mb-6 animate-pulse">
                  🧠 Deep Thinking Questions
                </h2>

                <div className="space-y-6">
                  {[
                    {
                      key: "q1",
                      q: "🤖 Should AI make decisions about people's lives?",
                    },
                    {
                      key: "q2",
                      q: "⚖️ How can we prevent AI bias?",
                    },
                    {
                      key: "q3",
                      q: "📜 What rules should AI follow?",
                    },
                  ].map(({ key, q }) => (
                    <div
                      key={key}
                      className="bg-[#202F364D] border-2 border-white rounded-2xl p-4 shadow-lg"
                    >
                      <p className="lilita-one-regular text-lg text-white mb-2">
                        {q}
                      </p>
                      <textarea
                        className="w-full text-white p-3 rounded-xl border-2 border-purple-200 focus:ring-4 focus:ring-purple-300 transition-all duration-300 resize-none"
                        rows={3}
                        placeholder="💬 Type your thoughtful answer here..."
                        value={deepAnswers[key]}
                        onChange={(e) =>
                          setDeepAnswers({
                            ...deepAnswers,
                            [key]: e.target.value,
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              {allDeepAnswered && (
                <button
                  onClick={() => {
                    if (!challengeCompleted) {
                      completeComputersChallenge(2, 0);
                      setChallengeCompleted(true);
                    }

                    // ✅ Always update performance
                    const endTime = Date.now();
                    const totalPrompts = scenarios.length * 2 + 3; // why + improve + 3 deep answers
                    const avgResponseTimeSec =
                      (endTime - startTime) / 1000 / totalPrompts;
                    const studyTimeMinutes = Math.round(
                      (endTime - startTime) / 60000
                    );

                    updatePerformance({
                      moduleName: "Computers",
                      topicName: "aIFuturesAndPossibilities",
                      score: 10,
                      accuracy: 100,
                      avgResponseTimeSec,
                      studyTimeMinutes,
                      completed: true,
                    });
                    setStartTime(Date.now());
                    setStep(4);
                  }}
                  className="mt-6 bg-[#50869f4d] hover:bg-[#5a676d4d] text-white lilita-one-regular px-6 py-3 rounded-full text-lg transition hover:scale-105"
                >
                  🏁 See Your Badge!
                </button>
              )}
            </>
          )}

          {/* STEP 4: Final Result */}
          {step === 4 && (
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              {/* Celebration Area */}
              <div className="flex flex-col items-center justify-center flex-1 p-6 overflow-y-auto">
                {/* Trophy / Celebration GIFs */}
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

                {/* Success Message */}
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                  🎉 Sorting Complete!
                </h2>
                <p className="text-[#FFCC00] mt-4 text-center font-semibold">
                  Great job! You nailed it with full accuracy!
                </p>

                {/* Badge Earned */}
                <div className="mt-3 flex flex-col items-center">
                  <p className="text-white text-sm sm:text-base font-bold mb-1">
                    🏅 Badge Earned
                  </p>
                  <span className="text-yellow-400 text-sm sm:text-base font-extrabold lilita-one-regular">
                    AI Ethics Expert
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={handlePlayAgain}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
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
          )}
        </div>

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}
      </div>
    </>
  );
}
