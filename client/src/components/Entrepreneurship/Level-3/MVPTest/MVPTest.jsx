import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useEntrepreneruship } from "@/contexts/EntreprenerushipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { getEntrepreneurshipNotesRecommendation } from "@/utils/getEntrepreneurshipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const MVPTest = () => {
  const { completeEntreprenerushipChallenge } = useEntrepreneruship();

  const [step, setStep] = useState("form");
  const [mockup, setMockup] = useState("");
  const [testPlan, setTestPlan] = useState("");
  const [simulatedFeedback, setSimulatedFeedback] = useState("");
  const [improvements, setImprovements] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const navigate = useNavigate();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (step === "result" && badgeEarned) {
      completeEntreprenerushipChallenge(2, 1); // Challenge 3, Task 5
    }
  }, [step, badgeEarned]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === "result" && badgeEarned) {
      setShowConfetti(true);
    }
  }, [step, badgeEarned]);

  useEffect(() => {
    if (step === "result" && !badgeEarned) {
      // Collect mistakes summary for this game
      const mistakes = {
        mockup,
        testPlan,
        improvements,
        feedback,
      };

      getEntrepreneurshipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [step, badgeEarned, mockup, testPlan, improvements, feedback]);

  if (showIntro) {
    return <IntroScreen />;
  }
  const verifyWithGemini = async () => {
    if (!mockup.trim() || !testPlan.trim() || !improvements.trim()) {
      alert("Please fill in all fields before verifying!");
      return;
    }

    setLoading(true);
    setFeedback("");

    const apiKey = import.meta.env.VITE_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `
  You're helping a middle school student (grade 6–8) who just finished an MVP Test Lab for their startup idea.
  
  Your job is to see if their work shows real thought, effort, and clear understanding. Focus **mainly** on the "Improvements" they suggested — are they meaningful, useful, and show they're learning from feedback?
  
  Also check:
  - Is the **Test Plan** realistic and makes sense?
  - Is the **Mockup** creative and thoughtful (even if simple)?
  
  Speak to the student in a friendly way using fun emojis! 🎉👍
  
  Examples:
  ✅ If their improvements are meaningful and realistic, say something like: 
  "Great job! These improvements show you're thinking like a real innovator! 🚀"
  
  ❌ If the improvements are vague or missing, say:
  "You're getting there! Try making your improvements more specific so we can see your genius at work! 🧠💡"
  
  Give short, friendly advice — this is a learning moment!
  
  Here's the student's MVP Test Lab:
  
  Mockup:
  ${mockup}
  
  Test Plan:
  ${testPlan}
  
  Improvements:
  ${improvements}
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

  const simulateFeedback = async () => {
    if (!mockup.trim() || !testPlan.trim()) {
      alert(
        "👀 First write your mockup and test plan before checking feedback!"
      );
      return;
    }

    setLoadingFeedback(true);
    setSimulatedFeedback("");

    const apiKey = import.meta.env.VITE_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const prompt = `
    You're a friendly kid product tester 🎮🧠
  
    A student has created a fun new idea and wants to test it.
    Here's what they made:
  
    ✏️ Mockup:
    ${mockup}
  
    🧪 Test Plan:
    ${testPlan}
  
    👉 Pretend you are a kid trying this out. 
    Write 2–3 short, real-sounding things a kid might say after trying it. 
    Use emojis and simple words (like "cool", "boring", "fun").
  
    Then, gently give a hint for how the idea could be even better 💡.
    Example: "Maybe add pictures?" or "Can I pick different pets?"
  
    Keep it fun, short, and helpful ✨🎉
    `;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const data = await response.json();
      const feedbackText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      setSimulatedFeedback(feedbackText || "No feedback received. Try again!");
    } catch (error) {
      console.error(error);
      setSimulatedFeedback(
        "⚠️ Oops! Something went wrong while getting feedback."
      );
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleTryAgain = () => {
    setMockup("");
    setTestPlan("");
    setSimulatedFeedback("");
    setImprovements("");
  };

  const handlePlayAgain = () => {
    setStep("form");
    setMockup("");
    setTestPlan("");
    setSimulatedFeedback("");
    setImprovements("");
    setFeedback("");
    setBadgeEarned(false);
    setStartTime(Date.now());
  };

  const handleSubmit = () => {
    const lower = feedback.toLowerCase();
    if (
      lower.includes("good") ||
      lower.includes("great") ||
      lower.includes("well done") ||
      lower.includes("acceptable") ||
      lower.includes("realistic")
    ) {
      setBadgeEarned(true);
    }
    setStep("result");

    // ⬇️ Performance update logic
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

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] flex flex-col items-center justify-center p-6">
        {step === "form" && (
          <div className="w-full max-w-xl bg-[#202F364D] p-6 rounded-xl shadow-md">
            <h2 className="text-2xl text-white lilita-one-regular mb-4">
              ✏️ Fill in your MVP Test Lab
            </h2>

            <label className="block mb-2 text-white lilita-one-regular">
              Mockup Description:
            </label>
            <textarea
              className="w-full p-3 border text-white rounded mb-4"
              rows="3"
              value={mockup}
              onChange={(e) => {
                setMockup(e.target.value);
                // 🎉 Show kid gif for 2 seconds when typing
                setShowKidGif(true);
                setTimeout(() => setShowKidGif(false), 2000);
              }}
              placeholder="E.g. A simple sketch showing the main screen and buttons..."
            />

            <label className="block mb-2 text-white lilita-one-regular">
              Test Plan:
            </label>
            <textarea
              className="w-full p-3 border text-white rounded mb-4"
              rows="2"
              value={testPlan}
              onChange={(e) => setTestPlan(e.target.value)}
              placeholder="E.g. Ask 5 users if they understand how to use it..."
            />

            <div className="flex flex-col gap-2 mb-4">
              <button
                onClick={simulateFeedback}
                className="bg-orange-500 text-white lilita-one-regular px-4 py-2 rounded-full hover:bg-orange-600 transition w-fit"
                disabled={loadingFeedback}
              >
                {loadingFeedback
                  ? "Simulating..."
                  : "Generate Simulated Feedback"}
              </button>

              {simulatedFeedback && (
                <div className="mt-2 p-3 bg-gray-100 border rounded">
                  <p className="whitespace-pre-wrap lilita-one-regular">
                    {simulatedFeedback}
                  </p>
                </div>
              )}
            </div>

            <label className="block mb-2 text-white lilita-one-regular">
              3 Improvements:
            </label>
            <textarea
              className="w-full p-3 border rounded mb-4 text-white"
              rows="2"
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              placeholder="E.g. 1) Simplify homepage, 2) Add clear CTA, 3) Improve colors..."
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
                  onClick={handleSubmit}
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
            {badgeEarned ? (
              /* WIN VIEW */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
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

                  {/* Badge Earned */}
                  <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                    🏅 Badge Earned: Pitch Pro!
                  </h2>
                  <p className="text-xl text-white mt-2">
                    🎉 Fantastic pitch! You nailed it!
                  </p>
                </div>

                {/* Footer */}
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
                    onClick={handlePlayAgain}
                    className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
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
              /* LOSE VIEW */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                {/* Game Over */}
                <div className="flex flex-col items-center justify-center flex-1 p-4">
                  <img
                    src="/financeGames6to8/game-over-game.gif"
                    alt="Game Over"
                    className="w-48 sm:w-64 h-auto mb-4"
                  />
                  <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                    ❌ Some parts need improvement. Wanna Retry?
                  </p>

                  {/* Notes Recommendation if user mistakes exist */}
                  {recommendedNotes.length > 0 && (
                    <div className="mt-6 bg-[#202F364D] p-4 rounded-xl shadow max-w-md text-center">
                      <h3 className="text-white lilita-one-regular text-xl mb-2">
                        📘 Learn & Improve
                      </h3>
                      <p className="text-white mb-3 text-sm leading-relaxed">
                        Based on your mistakes, we recommend revisiting{" "}
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
                              `/leadership/notes?grade=6-8&section=${note.topicId}`
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
                    src="/financeGames6to8/feedback.svg"
                    alt="Feedback"
                    onClick={handleViewFeedback}
                    className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
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
                    className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
            )}

            {/* ✅ Popup here */}
            <LevelCompletePopup
              isOpen={isPopupVisible}
              onConfirm={() => {
                setIsPopupVisible(false);
                navigate("/courses"); // your next level
              }}
              onCancel={() => {
                setIsPopupVisible(false);
                navigate("/entrepreneurship/games"); // or exit route
              }}
              onClose={() => setIsPopupVisible(false)}
              title="Challenge Complete!"
              message="Are you ready for the next challenge?"
              confirmText="Next Challenge"
              cancelText="Exit"
            />
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

export default MVPTest;
