// components/InnovationExplorer.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEntrepreneruship } from "@/contexts/EntreprenerushipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getEntrepreneurshipNotesRecommendation } from "@/utils/getEntrepreneurshipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const initialFields = Array.from({ length: 5 }, (_, i) => ({
  problem: "",
  category: "",
  solution: "",
  review: "",
}));

const getGeminiReviewPrompt = (entry) => `
You're a helpful AI teacher for Class 6–8 students 👩‍🏫.

Here's a student idea:

📌 Problem: ${entry.problem}
⚙️ AI Category: ${entry.category}
🌟 Solution: ${entry.solution}

Check quickly:
1️⃣ Is it clear?
2️⃣ Can they do it?
3️⃣ Is it something they can control?

🎯 Your reply should be just 1 or 2 lines, super short and friendly:
- 👍 If it’s good: Start with “Awesome! 🎉” or “Great idea! 🌟”
- 🤔 If not perfect: Start with “Hmm, maybe improve...” and suggest a small change.

Use simple words, emojis, and cheer them on! 🎈
`;

const InnovationExplorer = () => {
  const { completeEntreprenerushipChallenge } = useEntrepreneruship();
  const [step, setStep] = useState("game");
  const [fields, setFields] = useState(initialFields);
  const [loading, setLoading] = useState(false);
  const [allReviewed, setAllReviewed] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [allPerfect, setAllPerfect] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [gameResult, setGameResult] = useState(null); // "win" | "lose" | null
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  // Calculate goodCount for rendering
  const goodCount = fields.filter(
    (f) =>
      f.review.startsWith("Awesome") ||
      f.review.startsWith("Great idea") ||
      f.review.startsWith("Good job")
  ).length;

  useEffect(() => {
    if (allReviewed && badgeEarned) {
      completeEntreprenerushipChallenge(0, 0); // Use actual IDs if different
    }
  }, [allReviewed, badgeEarned]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!allReviewed || gameResult !== "lose") return;

    const mistakes = fields
      .filter(
        (f) =>
          !(
            f.review.startsWith("Awesome") ||
            f.review.startsWith("Great idea") ||
            f.review.startsWith("Good job")
          )
      )
      .map((f) => ({
        text: `${f.problem} → ${f.solution}`,
        placedIn: f.category || "not selected",
        correctCategory: "Needs improvement",
      }));

    if (mistakes.length > 0) {
      getEntrepreneurshipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [allReviewed, gameResult, fields]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleChange = (index, field, value) => {
    const updated = [...fields];
    updated[index][field] = value;
    setFields(updated);
  };

  const resetGame = () => {
    setFields(initialFields);
    setAllReviewed(false);
    setBadgeEarned(false);
    setAllPerfect(false);
    setStep("game");
    setStartTime(Date.now());
  };

  const getReview = async () => {
    const hasEmpty = fields.some(
      (f) => !f.problem.trim() || !f.category.trim() || !f.solution.trim()
    );
    if (hasEmpty) {
      alert("⚠️ Please fill out all fields before submitting.");
      return;
    }

    setLoading(true);
    const updatedFields = await Promise.all(
      fields.map(async (entry) => {
        const prompt = getGeminiReviewPrompt(entry);
        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
              import.meta.env.VITE_API_KEY
            }`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          );
          const data = await res.json();
          return {
            ...entry,
            review:
              data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
              "⚠️ Couldn't get feedback.",
          };
        } catch (err) {
          return { ...entry, review: "❌ Error getting feedback." };
        }
      })
    );

    setFields(updatedFields);
    setAllReviewed(true);

    const goodCount = updatedFields.filter(
      (f) =>
        f.review.startsWith("Awesome") ||
        f.review.startsWith("Great idea") ||
        f.review.startsWith("Good job")
    ).length;

    if (goodCount >= 3) {
      setGameResult("win");
    } else {
      setGameResult("lose");
    }
    setBadgeEarned(goodCount >= 3);
    setAllPerfect(goodCount === 5);
    setLoading(false);

    // ✅ Performance tracking
    const endTime = Date.now();
    const timeTakenSec = (endTime - startTime) / 1000;
    const timeTakenMin = Math.round(timeTakenSec / 60);
    const score = Math.round((goodCount / 5) * 10);
    const accuracy = (goodCount / 5) * 100;

    updatePerformance({
      moduleName: "Entrepreneurship",
      topicName: "ideationIntellect",
      score,
      accuracy,
      avgResponseTimeSec: timeTakenSec,
      studyTimeMinutes: timeTakenMin,
      completed: true,
    });
    setStartTime(Date.now());
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/ai-startup-builder");
  };

  return (
    <>
      <GameNav />
      <div className="bg-[#0A160E] min-h-screen w-full">
        <div className="p-4 pt-20 md:pt-50 pb-28 max-w-4xl mx-auto">
          {step === "game" && (
            <div>
              {fields.map((entry, index) => (
                <div
                  key={index}
                  className="bg-[#202F364D] border border-white p-4 rounded-xl mt-4"
                >
                  <h2 className="text-white lilita-one-regular">
                    Problem #{index + 1}
                  </h2>
                  <input
                    placeholder="Describe your problem..."
                    className="mt-1 w-full text-white border p-2 rounded"
                    value={entry.problem}
                    onChange={(e) =>
                      handleChange(index, "problem", e.target.value)
                    }
                  />
                  <select
                    className="mt-1 w-full border bg-transparent text-white p-2 rounded focus:bg-white focus:text-black"
                    value={entry.category}
                    onChange={(e) =>
                      handleChange(index, "category", e.target.value)
                    }
                  >
                    <option value="" className="text-black bg-white">
                      Select AI Category
                    </option>
                    <option value="Vision" className="text-black bg-white">
                      Vision
                    </option>
                    <option value="Language" className="text-black bg-white">
                      Language
                    </option>
                    <option value="Prediction" className="text-black bg-white">
                      Prediction
                    </option>
                    <option value="Robotics" className="text-black bg-white">
                      Robotics
                    </option>
                    <option
                      value="Recommendation"
                      className="text-black bg-white"
                    >
                      Recommendation
                    </option>
                  </select>

                  <textarea
                    placeholder="Your creative AI solution..."
                    className="mt-1 w-full border text-white p-2 rounded"
                    value={entry.solution}
                    onChange={(e) =>
                      handleChange(index, "solution", e.target.value)
                    }
                  ></textarea>
                  {allReviewed && (
                    <p className="mt-2 bg-white p-2 rounded shadow text-sm">
                      <span className="font-semibold">AI Review:</span>{" "}
                      {entry.review}
                    </p>
                  )}
                </div>
              ))}

              <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
                {loading ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-12 h-12 border-4 border-t-pink-500 border-yellow-300 rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-200 lilita-one-regular text-lg font-semibold">
                      Thinking...
                    </p>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={getReview}
                  >
                    <img
                      src="/financeGames6to8/check-now-btn.svg"
                      alt="Submit & Get Review"
                      className="h-12 sm:h-16 w-auto"
                    />
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {/* WIN / LOSE SCREENS */}
          {allReviewed && gameResult === "win" && (
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
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

                {/* Success Message */}
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                  Challenge Complete!
                </h2>

                <div className="mt-6 flex flex-col items-center justify-center sm:flex-row sm:items-stretch sm:gap-4">
                  {/* Accuracy Box */}
                  <div className="bg-[#09BE43] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                    <p className="text-black text-sm font-bold mb-1 mt-2">
                      TOTAL SCORE
                    </p>
                    <div className="bg-[#131F24] mt-0 flex-1 rounded-xl flex items-center justify-center py-3 px-5 w-full">
                      <img
                        src="/financeGames6to8/accImg.svg"
                        alt="Target Icon"
                        className="w-8 h-8 mr-2"
                      />
                      <span className="text-[#09BE43] text-3xl font-extrabold">
                        {Math.round((goodCount / 5) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Insight Box */}
                  <div className="mt-4 sm:mt-0 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                    <p className="text-black text-sm font-bold mb-1 mt-2">
                      INSIGHT
                    </p>
                    <div className="bg-[#131F24] mt-0 flex-1 rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
                      <p
                        className="text-[#FFCC00] font-bold leading-relaxed"
                        style={{
                          fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {goodCount === 5
                          ? "🏆 Perfect! You nailed every idea!"
                          : "🌟 Great job! You're on your way to being an innovator!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={resetGame}
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

          {allReviewed && gameResult === "lose" && (
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center flex-1 p-4">
                <img
                  src="/financeGames6to8/game-over-game.gif"
                  alt="Game Over"
                  className="w-48 sm:w-64 h-auto mb-4"
                />
                <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                  Oops! You didn’t hit the mark this time. Wanna retry?
                </p>

                {/* Suggested Notes Section */}
                {recommendedNotes.length > 0 && (
                  <div className="mt-6 bg-[#202F364D] p-4 rounded-xl shadow max-w-md text-center">
                    <h3 className="text-white lilita-one-regular text-xl mb-2">
                      📘 Learn & Improve
                    </h3>
                    <p className="text-white mb-3 text-sm leading-relaxed">
                      We recommend revisiting{" "}
                      <span className="text-yellow-300 font-bold">
                        {recommendedNotes.map((n) => n.title).join(", ")}
                      </span>{" "}
                      to strengthen your skills before retrying.
                    </p>
                    {recommendedNotes.map((note) => (
                      <button
                        key={note.topicId}
                        onClick={() =>
                          navigate(
                            `/law/notes?grade=6-8&section=${note.topicId}`
                          )
                        }
                        className="bg-yellow-400 text-black lilita-one-regular px-4 py-2 rounded-lg hover:bg-yellow-500 transition block mx-auto my-2"
                      >
                        Go to {note.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
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
          )}

          {/* Instructions overlay */}
          {showInstructions && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <InstructionOverlay onClose={() => setShowInstructions(false)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InnovationExplorer;
