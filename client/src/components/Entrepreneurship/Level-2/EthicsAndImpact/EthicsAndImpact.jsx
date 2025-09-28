import React, { useEffect, useState } from "react";
import { useEntrepreneruship } from "@/contexts/EntreprenerushipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getEntrepreneurshipNotesRecommendation } from "@/utils/getEntrepreneurshipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const EthicsAndImpact = () => {
  const { completeEntreprenerushipChallenge } = useEntrepreneruship();
  const [risks, setRisks] = useState(["", "", ""]);
  const [solutions, setSolutions] = useState(["", "", ""]);
  const [reflection, setReflection] = useState("");

  const [pairFeedbacks, setPairFeedbacks] = useState(["", "", ""]);
  const [reflectionFeedback, setReflectionFeedback] = useState("");

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFail, setShowFail] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (showSuccess) {
      completeEntreprenerushipChallenge(1, 0); // Replace with correct challenge ID
    }
  }, [showSuccess]);

  // Recommended Notes for Lose Scenario
  useEffect(() => {
    if (!showFail) return; // only run if user failed

    // collect mistakes
    const mistakes = risks
      .map((risk, idx) => ({
        problem: risk,
        solution: solutions[idx],
        review: pairFeedbacks[idx] || "",
        category: "Risk-Solution Pair",
      }))
      .filter(
        (f) =>
          !(
            f.review.toLowerCase().startsWith("great") ||
            f.review.toLowerCase().startsWith("good")
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
  }, [showFail, risks, solutions, pairFeedbacks]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  // ✅ Gemini check with explicit instruction for positive wording
  const verifyInputsWithGemini = async () => {
    setLoading(true);
    setPairFeedbacks(["", "", ""]);
    setReflectionFeedback("");
    setShowSuccess(false);
    setShowFail(false);

    const apiKey = import.meta.env.VITE_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
      const newPairFeedbacks = [];

      for (let i = 0; i < 3; i++) {
        const prompt = `
You are a supportive teacher for Class 6–8 kids.

Check this pair:
Risk: "${risks[i]}"
Solution: "${solutions[i]}"

✅ If the solution fits the risk well, respond starting with "Great idea! 🎉" or "Good solution! ✅", then explain why in a friendly way.

❌ If it does not match well, start with "Needs improvement:" and say how to fix it in simple words and an example.
`;

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        newPairFeedbacks.push(reply);
      }

      // Reflection check
      const reflectionPrompt = `
You are a supportive teacher for Class 6–8 kids.

Check this reflection:
"${reflection}"

✅ If it clearly says who is responsible for the risks (like developers, users or both), start with "Good reflection! ✅" and say why it's good.

❌ If it is unclear, start with "Needs improvement:" and suggest how to improve it.
`;

      const reflectionResponse = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: reflectionPrompt }] }],
        }),
      });

      const reflectionData = await reflectionResponse.json();
      const reflectionReply =
        reflectionData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      setPairFeedbacks(newPairFeedbacks);
      setReflectionFeedback(reflectionReply);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const isPositive = (text) =>
      text.toLowerCase().startsWith("great") ||
      text.toLowerCase().startsWith("good");

    const isNegative = (text) =>
      text.toLowerCase().startsWith("needs improvement");

    let score = 0;
    let validPairs = 0;

    pairFeedbacks.forEach((feedback) => {
      if (isPositive(feedback)) {
        score += 2;
        validPairs++;
      } else if (isNegative(feedback)) {
        score += 1;
        validPairs++;
      }
    });

    // Reflect feedback scoring
    if (isPositive(reflectionFeedback)) {
      score += 2;
      validPairs++;
    } else if (isNegative(reflectionFeedback)) {
      score += 1;
      validPairs++;
    }

    const accuracy = Math.round((score / 8) * 100);
    const endTime = Date.now();
    const timeTakenSec = (endTime - startTime) / 1000;
    const timeTakenMin = Math.round(timeTakenSec / 60);

    updatePerformance({
      moduleName: "Entrepreneurship",
      topicName: "masteringPitch",
      score,
      accuracy,
      avgResponseTimeSec: timeTakenSec,
      studyTimeMinutes: timeTakenMin,
      completed: true,
    });
    setStartTime(Date.now());
    if (score >= 7) {
      setShowSuccess(true);
      setShowFail(false);
    } else {
      setShowSuccess(false);
      setShowFail(true);
    }
  };

  const handleTryAgain = () => {
    setRisks(["", "", ""]);
    setSolutions(["", "", ""]);
    setReflection("");
    setShowSuccess(false);
    setShowFail(false);
  };

  const handlePlayAgain = () => {
    setRisks(["", "", ""]);
    setSolutions(["", "", ""]);
    setReflection("");
    setPairFeedbacks(["", "", ""]);
    setReflectionFeedback("");
    setShowSuccess(false);
    setShowFail(false);
    setStartTime(Date.now());
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/pitch-champion");
  };

  return (
    <>
      <GameNav />
      <div className=" min-h-screen w-full">
        <div className="bg-[#0A160E] flex flex-col pt-20 md:pt-50 pb-28 items-center justify-center min-h-screen p-6 text-center">
          <div className="w-full max-w-md space-y-6 text-left">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <label className="block">
                  <span className="text-white lilita-one-regular">
                    {index + 1}️⃣ Risk
                  </span>
                  <input
                    type="text"
                    value={risks[index]}
                    onChange={(e) => {
                      const updated = [...risks];
                      updated[index] = e.target.value;
                      setRisks(updated);
                    }}
                    className="w-full mt-1 p-2 border rounded text-white"
                    placeholder="Eg: Might leak private info"
                  />
                </label>
                <label className="block">
                  <span className="text-white lilita-one-regular">
                    🛠️ Solution
                  </span>
                  <input
                    type="text"
                    value={solutions[index]}
                    onChange={(e) => {
                      const updated = [...solutions];
                      updated[index] = e.target.value;
                      setSolutions(updated);
                    }}
                    className="w-full mt-1 p-2 border rounded text-white"
                    placeholder="Eg: Use strong encryption"
                  />
                </label>
                <p className="bg-white border p-2 rounded shadow">
                  {pairFeedbacks[index] || "No feedback yet."}
                </p>
              </div>
            ))}

            <label className="block">
              <span className="text-white lilita-one-regular">
                🪞 Reflection
              </span>
              <input
                type="text"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full mt-1 p-2 border rounded text-white"
                placeholder="Eg: Developers & users should be careful."
              />
            </label>
            <p className="bg-white border lilita-one-regular p-2 rounded shadow">
              {reflectionFeedback || "No feedback yet."}
            </p>
          </div>

          <div className="mt-6 space-x-4">
            <button
              onClick={verifyInputsWithGemini}
              disabled={loading}
              className="px-5 py-2 bg-yellow-500 text-white lilita-one-regular rounded hover:bg-yellow-600"
            >
              {loading ? "Checking..." : "✅ Verify "}
            </button>

            <button
              onClick={handleTryAgain}
              className="px-5 py-2 bg-red-500 text-white lilita-one-regular rounded hover:bg-red-600"
            >
              🔄 Try Again
            </button>
          </div>

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
                onClick={handleSubmit} // 🔥 use handleSubmit here
              >
                <img
                  src="/financeGames6to8/check-now-btn.svg"
                  alt="Submit & Get Review"
                  className="h-12 sm:h-16 w-auto"
                />
              </motion.button>
            )}
          </div>

          {/* WIN SCREEN */}
          {showSuccess && (
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

                <p className="text-[#FFCC00] mt-4 text-center font-semibold">
                  🎉 Great job! You nailed it!
                </p>

                {/* Badge Earned Section */}
                <div className="mt-3 flex flex-col items-center">
                  <p className="text-white text-sm sm:text-base font-bold mb-1">
                    🏅 Badge Earned
                  </p>
                  <span className="text-yellow-400 text-sm sm:text-base font-extrabold lilita-one-regular">
                    Ethics Defender
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

          {/* LOSE SCREEN */}
          {showFail && (
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center flex-1 p-6">
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
                  onClick={handlePlayAgain}
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

export default EthicsAndImpact;
