import React, { useEffect, useState } from "react";
import { useEntrepreneruship } from "@/contexts/EntreprenerushipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { getEntrepreneurshipNotesRecommendation } from "@/utils/getEntrepreneurshipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const UserPersonaDetective = () => {
  const { completeEntreprenerushipChallenge } = useEntrepreneruship();

  const [step, setStep] = useState("form");
  const [persona, setPersona] = useState("");
  const [problem, setProblem] = useState("");
  const [journey, setJourney] = useState("");
  const [benefit, setBenefit] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [uplift, setUplift] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (step === "result" && badgeEarned) {
      completeEntreprenerushipChallenge(2, 0); // Challenge 1, Task 5
    }
  }, [step, badgeEarned]);

  // Recommended Notes for Lose Scenario
  useEffect(() => {
    if (!(step === "result" && !badgeEarned)) return; // only run if user failed

    // collect mistakes (based on Gemini feedback)
    const mistakes = [];

    if (feedback.toLowerCase().includes("needs improvement")) {
      mistakes.push({
        text: `Persona: ${persona}, Problem: ${problem}, Journey: ${journey}, Benefit: ${benefit}`,
        placedIn: "User Persona Detective",
        correctCategory: "Needs improvement",
      });
    }

    if (mistakes.length > 0) {
      getEntrepreneurshipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [step, badgeEarned, feedback, persona, problem, journey, benefit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const verifyWithGemini = async () => {
    if (
      !persona.trim() ||
      !problem.trim() ||
      !journey.trim() ||
      !benefit.trim()
    ) {
      alert("Please fill in all fields before submitting!");
      return;
    }

    setLoading(true);
    setFeedback("");

    const apiKey = import.meta.env.VITE_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `
You are a kind UX mentor for a student creating a user persona for an AI startup.

✅ Check:
1) Is the Persona realistic and clear?
2) Is the Problem clearly described?
3) Is the User Journey logical?
4) Is the Benefit meaningful?

✅ If GOOD:
Reply: "✅ Well done! 🎉 Everything is clear and realistic. Great work!"

✅ If NEEDS IMPROVEMENT:
Reply: "❌ Needs improvement: Make the persona more specific, clarify the problem, add journey details, and explain the benefit better. You got this! 💪"

✅ Keep it short (max 1 paragraph). Use simple words and emojis.

Persona: ${persona}
Problem: ${problem}
Journey: ${journey}
Benefit: ${benefit}
`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = await response.json();
      const geminiFeedback = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setFeedback(geminiFeedback || "No feedback received.");
    } catch (error) {
      console.error(error);
      setFeedback("An error occurred while verifying.");
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setPersona("");
    setProblem("");
    setJourney("");
    setBenefit("");
    // Keep feedback so they can see what to fix
  };

  const handlePlayAgain = () => {
    setStep("form");
    setPersona("");
    setProblem("");
    setJourney("");
    setBenefit("");
    setFeedback("");
    setBadgeEarned(false);
    setUplift(false);
    setStartTime(Date.now());
  };

  const handleSubmit = () => {
    if (!feedback) {
      alert("Please verify with Gemini before submitting!");
      return;
    }

    const lower = feedback.toLowerCase();
    if (
      lower.includes("well done") ||
      lower.includes("good") ||
      lower.includes("great work") ||
      lower.includes("clear and realistic")
    ) {
      setBadgeEarned(true);
    } else {
      setUplift(true);
    }

    setStep("result");

    const endTime = Date.now();
    const timeTakenSec = (endTime - startTime) / 1000;
    const timeTakenMin = Math.round(timeTakenSec / 60);

    updatePerformance({
      moduleName: "Entrepreneurship",
      topicName: "strategist",
      score: 10,
      accuracy: 100,
      avgResponseTimeSec: timeTakenSec,
      studyTimeMinutes: timeTakenMin,
      completed: true,
    });
    setStartTime(Date.now());
  };

  // handle persona input with gif trigger
  const handlePersonaChange = (e) => {
    setPersona(e.target.value);

    // show gif when typing starts
    setShowKidGif(true);

    // hide after 2 seconds
    setTimeout(() => {
      setShowKidGif(false);
    }, 2000);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/mvp-test");
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] flex flex-col items-center justify-center p-6">
        {step === "form" && (
          <div className="w-full max-w-xl bg-[#202F364D] p-6 rounded-xl shadow-md">
            <h2 className="text-2xl text-white lilita-one-regular mb-4">
              📝 Fill in your User Persona
            </h2>

            <label className="block mb-2 text-white lilita-one-regular">
              Primary User Persona:
            </label>
            <textarea
              className="w-full p-3 border rounded mb-4 text-white"
              rows="3"
              value={persona}
              onChange={handlePersonaChange}
              placeholder="E.g. 28-year-old marketing manager who struggles to find time for data analysis..."
            />

            <label className="block mb-2 text-white lilita-one-regular">
              Key Problem:
            </label>
            <textarea
              className="w-full p-3 border rounded mb-4 text-white"
              rows="2"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="E.g. Spends hours compiling reports manually..."
            />

            <label className="block mb-2 text-white lilita-one-regular">
              User Journey:
            </label>
            <textarea
              className="w-full p-3 border rounded mb-4 text-white"
              rows="3"
              value={journey}
              onChange={(e) => setJourney(e.target.value)}
              placeholder="E.g. Logs in, uploads data, AI generates insights, exports a report..."
            />

            <label className="block mb-2 text-white lilita-one-regular">
              How Product Helps:
            </label>
            <textarea
              className="w-full p-3 border rounded mb-4 text-white"
              rows="2"
              value={benefit}
              onChange={(e) => setBenefit(e.target.value)}
              placeholder="E.g. Saves hours each week, more time for creative work..."
            />

            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={verifyWithGemini}
                className="bg-green-600 text-white lilita-one-regular px-4 py-2 rounded-full hover:bg-green-700 transition"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
              <button
                onClick={handleTryAgain}
                className="bg-yellow-500 text-white lilita-one-regular px-4 py-2 rounded-full hover:bg-yellow-600 transition"
              >
                Try Again
              </button>
              <button
                onClick={handlePlayAgain}
                className="bg-purple-600 text-white lilita-one-regular px-4 py-2 rounded-full hover:bg-purple-700 transition"
              >
                Play Again
              </button>
            </div>

            {/* ✅ Sticky Footer with Kid Celebration */}
            <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
              {showKidGif && (
                <div
                  className="absolute -top-24 sm:-top-30 transform -translate-x-1/2 z-50 flex items-start"
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
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-t-pink-500 border-yellow-300 rounded-full animate-spin"></div>
                  <p className="mt-2 text-gray-200 lilita-one-regular text-lg font-semibold">
                    Submitting...
                  </p>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={feedback ? handleSubmit : verifyWithGemini}
                  disabled={loading}
                >
                  <img
                    src="/financeGames6to8/check-now-btn.svg"
                    alt="Check Now"
                    className={`h-12 sm:h-16 w-auto ${
                      loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  />
                </motion.button>
              )}
            </div>

            {feedback && (
              <div className="mt-6 p-4 bg-gray-100 rounded border border-gray-300">
                <h3 className="lilita-one-regular mb-2">✅ AI Feedback:</h3>
                <p className="whitespace-pre-wrap lilita-one-regular">
                  {feedback}
                </p>
              </div>
            )}
          </div>
        )}

        {step === "result" && (
          <>
            {/* WIN SCREEN */}
            {badgeEarned && (
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
                      User Champion
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
            {!badgeEarned && (
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

                  {/* Gemini feedback or tips (optional) */}
                  {feedback && (
                    <div className="mt-6 bg-[#202F364D] p-4 rounded-xl shadow max-w-md text-center">
                      <h3 className="text-white lilita-one-regular text-xl mb-2">
                        📘 Learn & Improve
                      </h3>
                      <p className="text-white mb-3 text-sm leading-relaxed">
                        {feedback}
                      </p>
                    </div>
                  )}

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
          </>
        )}

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}
      </div>
    </>
  );
};

export default UserPersonaDetective;
