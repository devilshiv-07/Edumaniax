import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useLeadership } from "@/contexts/LeadershipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getLeadershipNotesRecommendation } from "@/utils/getLeadershipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const InnovationSprint = () => {
  const { completeLeadershipChallenge } = useLeadership();
  const [step, setStep] = useState(0); // 0: form, 1: result
  const [what, setWhat] = useState("");
  const [why, setWhy] = useState("");
  const [idea, setIdea] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // New state for instructions overlay

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (step === 1 && !isApproved) {
      const mistakes = {
        score: 0,
        totalQuestions: 1,
        incorrectSteps: [
          {
            question: `🏫 What: ${what}\n❓ Why: ${why}\n💡 Idea: ${idea}`,
            correct: null,
          },
        ],
      };

      getLeadershipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [step, isApproved, what, why, idea]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const resetForm = () => {
    setWhat("");
    setWhy("");
    setIdea("");
    setVerifyMessage("");
    setIsApproved(false);
    setStep(0);
  };

  const resetGame = () => {
    setWhat("");
    setWhy("");
    setIdea("");
    setVerifyMessage("");
    setIsApproved(false);
    setLoading(false);
    setStep(0);
    setStartTime(Date.now());
  };

  const verifyWithGemini = async () => {
    if (!what.trim() || !why.trim() || !idea.trim()) {
      alert("Please fill out all fields.");
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
              text: `Hey Gemini 👋! You are a friendly teacher for kids in Class 6–8.
    
    A student wants to improve their school or neighborhood:
    🏫 What needs to change: "${what}"
    ❓ Why it's important: "${why}"
    💡 Their new idea: "${idea}"
    
    Please check:
    ✅ Is the idea simple and clear for their age?
    ✅ Can they test or try it soon?
    ✅ Will it help other people too?
    
    👉 Use easy words and short sentences. Give supportive feedback in 1-2 lines:
    - If it's good, say: "✨ Awesome! ..." and tell why it's a great idea.
    - If it needs work, say: "🧐 Needs a little tweak: ..." and explain what to fix.
    
    Use friendly emojis to make them feel proud! 🎉
    `,
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
        setVerifyMessage(
          "⚠️ Gemini could not verify right now. Please try again."
        );
        setLoading(false);
        return;
      }

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      setVerifyMessage(reply);
      setIsApproved(
        reply.toLowerCase().includes("good job") ||
          reply.toLowerCase().includes("awesome")
      );
      setStep(1);

      if (
        reply.toLowerCase().includes("good job") ||
        reply.toLowerCase().includes("awesome")
      ) {
        setIsApproved(true);

        const totalTimeMs = Date.now() - startTime;

        updatePerformance({
          moduleName: "Leadership",
          topicName: "innovativeLeader",
          score: 10,
          accuracy: 100,
          avgResponseTimeSec: parseFloat((totalTimeMs / 1000).toFixed(2)),
          studyTimeMinutes: parseFloat((totalTimeMs / 60000).toFixed(2)),
          completed: true,
        });
        setStartTime(Date.now());

        completeLeadershipChallenge(3, 0); // Replace with your actual challenge and task ID
        // ✅ Trigger confetti immediately:
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          emojis: ["🎉", "✨", "🌟"],
        });
      }
    } catch (error) {
      console.error(error);
      setVerifyMessage("⚠️ Oops! Something went wrong. Try again later.");
    }

    setLoading(false);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/integrity-quest"); // ensure `useNavigate()` is defined
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] flex items-center justify-center p-4">
        {step === 0 && (
          <div className="bg-[#202F364D] border border-white p-8 rounded-xl shadow-md w-full max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-white lilita-one-regular">
              💡 Your Change Idea
            </h2>
            <div className="mb-2 text-left">
              <label className="block font-semibold text-white lilita-one-regular">
                What needs to change?
              </label>
              <input
                type="text"
                value={what}
                onChange={(e) => {
                  setWhat(e.target.value);

                  // Show gif only when user types here
                  setShowKidGif(true);
                  setTimeout(() => {
                    setShowKidGif(false);
                  }, 3000); // hide after 3 sec
                }}
                className="w-full text-white border border-gray-300 rounded px-4 py-3 mb-2"
              />
            </div>
            <div className="mb-2 text-left">
              <label className="block font-semibold text-white lilita-one-regular">
                Why is it important?
              </label>
              <input
                type="text"
                value={why}
                onChange={(e) => setWhy(e.target.value)}
                className="w-full border border-gray-300 text-white rounded px-4 py-3 mb-2"
              />
            </div>
            <div className="mb-4 text-left">
              <label className="block font-semibold text-white lilita-one-regular">
                What is your new idea?
              </label>
              <input
                type="text"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                className="w-full border border-gray-300 text-white rounded px-4 py-3 mb-2"
              />
            </div>

            <div className="bg-yellow-100 p-4 rounded mb-4 text-left">
              <h3 className="font-bold mb-2 lilita-one-regular">
                ✅ Innovation Checklist:
              </h3>
              <ul className="list-disc list-inside lilita-one-regular">
                <li>Is it simple?</li>
                <li>Can you test it?</li>
                <li>Will it help others?</li>
              </ul>
            </div>

            {/* Footer with Kid Gif + Check Now image button */}
            <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
              {/* Kid Celebration Gif + Speech Bubble */}
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

              {/* Check Now image button (triggers verifyWithGemini) */}
              <button
                onClick={verifyWithGemini}
                disabled={loading}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <img
                  src="/financeGames6to8/check-now-btn.svg"
                  alt="Check Now"
                  className="h-12 sm:h-16 w-auto"
                />
              </button>
            </div>
          </div>
        )}

        {step === 1 && (
          <>
            {isApproved ? (
              /* 🎉 WIN VIEW */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
                {/* Center Celebration */}
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

                  {/* Gemini Feedback */}
                  <div className="bg-[#202F364D] border border-white rounded-xl p-4 mt-6 max-w-md text-center">
                    <h3 className="text-white lilita-one-regular text-xl mb-2">
                      ✨ Gemini Feedback
                    </h3>
                    <p className="text-gray-200 lilita-one-regular text-sm whitespace-pre-wrap leading-relaxed">
                      {verifyMessage}
                    </p>
                  </div>

                  <p className="text-xl text-white mt-6 lilita-one-regular">
                    Congrats! You earned the ⚡ Change Maker badge!
                  </p>
                </div>

                {/* Footer */}
                <div className="bg-[#2f3e46] border-t border-gray-700 py-4 flex justify-center gap-6">
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
              /* ❌ LOSE VIEW */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
                <div className="flex flex-col items-center justify-center flex-1 p-6">
                  <img
                    src="/financeGames6to8/game-over-game.gif"
                    alt="Game Over"
                    className="w-48 sm:w-64 h-auto mb-4"
                  />
                  <p className="text-yellow-400 lilita-one-regular text-lg sm:text-2xl text-center mb-4">
                    Oops! That was close! Wanna Retry?
                  </p>

                  {/* Gemini Feedback */}
                  <div className="bg-[#202F364D] border border-white rounded-xl p-4 max-w-md text-center">
                    <h3 className="text-white lilita-one-regular text-xl mb-2">
                      🧐 Gemini Feedback
                    </h3>
                    <p className="text-gray-200 lilita-one-regular text-sm whitespace-pre-wrap leading-relaxed">
                      {verifyMessage}
                    </p>
                  </div>

                  {/* Example: Suggested Notes (if integrated) */}
                  {recommendedNotes.length > 0 && (
                    <div className="mt-6 bg-[#202F364D] p-4 rounded-xl shadow max-w-md text-center">
                      <h3 className="text-white lilita-one-regular text-xl mb-2">
                        📘 Learn & Improve
                      </h3>
                      <p className="text-white mb-3 text-sm leading-relaxed">
                        Revisit{" "}
                        <span className="text-yellow-300 font-bold">
                          {recommendedNotes.map((n) => n.title).join(", ")}
                        </span>{" "}
                        to strengthen your skills.
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

                <div className="bg-[#2f3e46] border-t border-gray-700 py-4 flex justify-center gap-6">
                  <img
                    src="/financeGames6to8/retry.svg"
                    alt="Retry"
                    onClick={resetForm}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/next-challenge.svg"
                    alt="Next Challenge"
                    onClick={resetGame}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
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

export default InnovationSprint;
