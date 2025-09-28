import React, { useEffect, useState } from "react";
import { useEntrepreneruship } from "@/contexts/EntreprenerushipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { getEntrepreneurshipNotesRecommendation } from "@/utils/getEntrepreneurshipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const PitchChampion = () => {
  const { completeEntreprenerushipChallenge } = useEntrepreneruship();

  // ✅ Add a page state: "intro" or "pitch"
  const [page, setPage] = useState("intro");

  // Game states
  const [pitch, setPitch] = useState("");
  const [aiFeedback, setAiFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true); // Show instructions overlay initially

  useEffect(() => {
    if (submitted && verified) {
      completeEntreprenerushipChallenge(1, 1); // 🎯 Challenge 3, Task 4
    }
  }, [submitted, verified]);

  useEffect(() => {
    if (submitted && !verified) {
      // Collect mistakes summary for this game
      const mistakes = {
        pitch, // main input text
      };

      getEntrepreneurshipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [submitted, verified, pitch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const verifyPitchWithGemini = async () => {
    if (!pitch.trim()) {
      alert("Please write your pitch first.");
      return;
    }

    setLoading(true);
    const apiKey = import.meta.env.VITE_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a kind and encouraging startup mentor for students in Class 6–8.
  
  A student wrote this pitch: "${pitch}"
  
  ✅ Please check carefully:
  1️⃣ Is the problem clear?
  2️⃣ Is the AI solution clear?
  3️⃣ Are benefits for users listed?
  4️⃣ Is the AI type mentioned?
  5️⃣ Is it about 150 words?
  
  If the pitch is GOOD:
  - Reply like: "✅ Great work! 🎉 Your pitch is clear and strong. The problem is well explained, the AI solution is realistic, benefits are clear, and you mentioned the AI type. Keep it up! 💪✨"
  
  If the pitch NEEDS IMPROVEMENT:
  - Reply like: "❌ Needs improvement: 🤔 Please make the problem clearer, describe exactly how AI will solve it, add clear user benefits, and say what AI type you use. Try to write it in about 150 words. You can do it! 🚀"
  
  ✅ Always use simple words.
  ✅ Use some emojis to encourage the student.
  ✅ Keep your reply short: maximum 1 short paragraph.
  ✅ Do not add extra comments or disclaimers.`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        setAiFeedback(
          "⚠️ Gemini could not verify right now. Please try again."
        );
        setLoading(false);
        return;
      }

      const data = await response.json();
      const geminiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      setAiFeedback(geminiReply);
      setVerified(geminiReply.toLowerCase().includes("great work"));
    } catch (error) {
      console.error("Error:", error);
      setAiFeedback("⚠️ Oops! Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (verified === null) {
      alert("Please get AI verification first.");
      return;
    }

    setSubmitted(true);

    const endTime = Date.now();
    const timeTakenSec = (endTime - startTime) / 1000;
    const timeTakenMin = Math.round(timeTakenSec / 60);

    updatePerformance({
      moduleName: "Entrepreneurship",
      topicName: "masteringPitch",
      score: 10,
      accuracy: 100,
      avgResponseTimeSec: timeTakenSec,
      studyTimeMinutes: timeTakenMin,
      completed: true,
    });
    setStartTime(Date.now());
  };

  const handleTryAgain = () => {
    setPitch("");
    setVerified(null);
    setAiFeedback("");
    setSubmitted(false);
  };

  const handlePlayAgain = () => {
    // ✅ Reset everything and return to intro page
    setPitch("");
    setVerified(null);
    setAiFeedback("");
    setSubmitted(false);
    setPage("intro");
    setStartTime(Date.now());
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  // ✅ Otherwise, show the pitch game content
  return (
    <>
      <GameNav />
      <div className="bg-[#0A160E] pt-20 md:pt-50 pb-28 min-h-screen w-full">
        <div className="max-w-2xl border border-white mx-auto p-6 bg-[#202F364D] shadow-lg rounded-xl">
          <h1 className="text-3xl text-white lilita-one-regular mb-4">
            🎙️ Pitch Champion
          </h1>

          <div className="mb-4 p-4 bg-[#202F364D] border-l-4 border-blue-400 rounded">
            <p className="text-white lilita-one-regular mb-2">
              📝 <strong>How to write your pitch:</strong>
            </p>
            <ul className="list-disc ml-6 space-y-1 text-white lilita-one-regular">
              <li>✅ State the problem clearly.</li>
              <li>✅ Explain your AI-powered solution.</li>
              <li>✅ List main benefits for users.</li>
              <li>✅ Mention the type of AI used.</li>
              <li>✅ Keep it around 1 minute (~150 words).</li>
            </ul>
          </div>

          {!submitted ? (
            <>
              <textarea
                className="w-full border p-3 rounded mb-4 text-white"
                rows={8}
                placeholder="Write your pitch here (~150 words)"
                value={pitch}
                onChange={(e) => {
                  setPitch(e.target.value);
                  // 🎉 Show kid gif for 2 seconds when typing
                  setShowKidGif(true);
                  setTimeout(() => setShowKidGif(false), 2000);
                }}
                disabled={loading}
              />

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={verifyPitchWithGemini}
                  disabled={loading}
                  className="bg-purple-600 lilita-one-regular text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  ✅ {loading ? "Verifying..." : "Get AI Verification"}
                </button>

                <button
                  onClick={handlePlayAgain}
                  className="bg-orange-500 text-white lilita-one-regular px-4 py-2 rounded hover:bg-orange-600"
                >
                  🔁 Play Again
                </button>
              </div>

              {/* ✅ Sticky Footer Submit Button */}
              <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
                {/* 🎉 Kid Celebration Gif + Speech Bubble */}
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
                    disabled={verified === null}
                  >
                    <img
                      src="/financeGames6to8/check-now-btn.svg"
                      alt="Check Now"
                      className={`h-12 sm:h-16 w-auto ${
                        verified === null ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </motion.button>
                )}
              </div>

              {aiFeedback && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="lilita-one-regular mb-2">🤖 AI Feedback:</h3>
                  <p className="lilita-one-regular">{aiFeedback}</p>
                </div>
              )}
            </>
          ) : (
            <div className="text-center">
              {verified ? (
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
                      onClick={handleTryAgain}
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
            </div>
          )}

          {/* ✅ Popup here */}
          <LevelCompletePopup
            isOpen={isPopupVisible}
            onConfirm={() => {
              setIsPopupVisible(false);
              navigate("/user-persona-detective"); // your next level
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

export default PitchChampion;
