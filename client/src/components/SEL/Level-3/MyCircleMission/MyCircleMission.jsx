import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";
const thoughtsData = [
  {
    id: 1,
    text: "My exam score",
    correctCircle: "Concern",
    reason:
      "The score has already been given – you can’t change it now. You can learn from it, but the score itself is out of your hands.",
  },
  {
    id: 2,
    text: "Asking questions in class",
    correctCircle: "Influence",
    reason:
      "You can choose to raise your hand, clarify doubts, and participate. This is fully within your control.",
  },
  {
    id: 3,
    text: "What others think of me",
    correctCircle: "Concern",
    reason:
      "You can’t control people’s thoughts or opinions. You can only control your own actions.",
  },
  {
    id: 4,
    text: "Being kind today",
    correctCircle: "Influence",
    reason:
      "Kindness is a choice you make. You decide how you treat people every day.",
  },
  {
    id: 5,
    text: "Someone spreading gossip",
    correctCircle: "Concern",
    reason:
      "You can’t stop others from gossiping, but you can choose not to take part. Their actions aren’t in your control.",
  },
  {
    id: 6,
    text: "How I treat others",
    correctCircle: "Influence",
    reason:
      "This is 100% up to you. You control your behavior, attitude, and respect toward others.",
  },
  {
    id: 7,
    text: "How I spend my free time",
    correctCircle: "Influence",
    reason:
      "You can plan your day, choose activities, and build good habits – this is your power.",
  },
  {
    id: 8,
    text: "Who wins the school elections",
    correctCircle: "Concern",
    reason:
      "You can vote, but you can’t control who others vote for. The result is not in your hands.",
  },
  {
    id: 9,
    text: "If I try again after failing",
    correctCircle: "Influence",
    reason:
      "You always have the choice to try again, no matter how hard things are. This mindset is in your hands.",
  },
];

const MyCircleMission = () => {
  const { completeSELChallenge } = useSEL();
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [actionText, setActionText] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  // Instead of useWindowSize, use:
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: document.body.scrollHeight, // key point
  });
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: document.body.scrollHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const correctCount = thoughtsData.filter(
    (t) => answers[t.id] === t.correctCircle
  ).length;

  const isWin = correctCount >= 7 && actionText.trim().length > 10;

  useEffect(() => {
    if (showResult && isWin) {
      completeSELChallenge(2, 2); // Adjust challenge ID and task ID as needed
    }
  }, [showResult, isWin, completeSELChallenge]);

  useEffect(() => {
    if (showResult) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);
      const accuracy = Math.round((correctCount / thoughtsData.length) * 100);
      const score = isWin ? 10 : accuracy >= 50 ? 5 : 2;

      updatePerformance({
        moduleName: "SEL",
        topicName: "peerSupportNetworks",
        score,
        accuracy,
        avgResponseTimeSec: totalSeconds / thoughtsData.length,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: isWin,
      });
      setStartTime(Date.now());
    }
  }, [showResult]);

  useEffect(() => {
    if (!showResult || isWin) return; // only if result shown AND user didn’t win

    // Collect mistakes (wrong answers)
    const mistakes = thoughtsData
      .map((t) => {
        const userAnswer = answers[t.id];
        if (userAnswer === t.correctCircle) return null;

        return {
          text: `Statement: "${t.text}" | Correct: ${
            t.correctCircle
          } | Your Answer: ${userAnswer || "None"}`,
          placedIn: "My Circle Mission",
          correctCategory: t.correctCircle,
        };
      })
      .filter(Boolean);

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) => {
        // ensure unique topics
        const seen = new Set();
        const uniqueNotes = notes.filter((n) => {
          if (seen.has(n.topic)) return false;
          seen.add(n.topic);
          return true;
        });
        setRecommendedNotes(uniqueNotes);
      });
    }
  }, [showResult, isWin, answers]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleReset = () => {
    setAnswers({});
    setShowResult(false);
    setActionText("");
    setVerifyMessage("");
    setStartTime(Date.now());
  };

  const verifyActionWithGemini = async (text) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a friendly teacher for students in Class 6–8. 
    
    A student wrote this action plan: "${text}"
    
    ✅ Please check if it meets all these:
    1️⃣ Is the action clear and specific?  
    2️⃣ Is it realistic and achievable today?  
    3️⃣ Does it show they are focusing on something they can control (Circle of Influence)?
    
    🎓 Then give simple feedback in **1-2 sentences**, using easy words a middle schooler understands:
    - If it's good, say: "Good job! ..." and explain why it's good.
    - If it needs changes, say: "Needs improvement: ..." and explain how to make it clearer or more realistic.
    
    Keep your answer short and supportive!`,
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
        console.error("API error:", response.status, response.statusText);
        setVerifyMessage(
          "⚠️ Gemini could not verify right now. Please try again."
        );
        return;
      }

      const data = await response.json();
      const geminiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setVerifyMessage(geminiReply);
    } catch (error) {
      console.error("Error:", error);
      setVerifyMessage("⚠️ Oops! Something went wrong. Try again later.");
    }
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
      <div className="min-h-screen bg-[#0A160E]">
        <div className="p-6 pt-20 md:pt-50 pb-28 max-w-4xl mx-auto">
          <p className="mb-4 text-white lilita-one-regular">
            🧠 <strong>Instructions:</strong> Every day brings new worries and
            new powers. For each thought, choose whether it belongs in your
            Circle of Influence or Circle of Concern. Then write an action
            you’ll take using something in your influence.
          </p>

          {thoughtsData.map((thought) => (
            <div
              key={thought.id}
              className="mb-4 p-4 border rounded bg-[#202F364D]"
            >
              <p className="text-white lilita-one-regular">{thought.text}</p>
              <div className="mt-2">
                <label className="mr-4 text-white lilita-one-regular">
                  <input
                    type="radio"
                    name={`q-${thought.id}`}
                    checked={answers[thought.id] === "Influence"}
                    onChange={() =>
                      setAnswers({ ...answers, [thought.id]: "Influence" })
                    }
                  />{" "}
                  Influence
                </label>
                <label className="text-white lilita-one-regular">
                  <input
                    type="radio"
                    name={`q-${thought.id}`}
                    checked={answers[thought.id] === "Concern"}
                    onChange={() =>
                      setAnswers({ ...answers, [thought.id]: "Concern" })
                    }
                  />{" "}
                  Concern
                </label>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <h2 className="text-xl text-white lilita-one-regular mb-2">
              ✍️ Your Action Plan
            </h2>
            <p className="mb-2 text-white lilita-one-regular">
              Write 1 action you’ll take today using something in your
              influence. Be specific!
            </p>
            <p className="mb-4 italic lilita-one-regular text-white">
              Example: “I will spend 30 minutes this evening practicing math
              problems instead of watching videos, because I want to improve for
              the next test. That’s something I can fully control.”
            </p>
            <textarea
              className="w-full border p-2 text-white lilita-one-regular bg-[#202F364D] rounded"
              rows="4"
              value={actionText}
              onChange={(e) => setActionText(e.target.value)}
              placeholder="Write your action here..."
            ></textarea>

            <button
              onClick={() => verifyActionWithGemini(actionText)}
              className="mt-2 lilita-one-regular px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              ✅ Verify
            </button>

            {verifyMessage && (
              <div className="mt-4 lilita-one-regular p-4 border border-green-400 rounded bg-green-50 text-green-700">
                {verifyMessage}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowResult(true)}
            className="mt-4 px-6 py-2 bg-blue-600 lilita-one-regular text-white rounded hover:bg-blue-700"
          >
            🎉 Submit & Check Result
          </button>

          {showResult && (
            <>
              {isWin ? (
                /* WIN SCREEN */
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

                    {/* Accuracy + Insight */}
                    <div className="mt-6 flex flex-col items-center justify-center sm:flex-row sm:items-stretch sm:gap-4">
                      {/* Accuracy Box */}
                      <div className="bg-[#09BE43] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                        <p className="text-black text-sm font-bold mb-1 mt-2">
                          TOTAL ACCURACY
                        </p>
                        <div className="bg-[#131F24] flex-1 rounded-xl flex items-center justify-center py-3 px-5 w-full">
                          <img
                            src="/financeGames6to8/accImg.svg"
                            alt="Target Icon"
                            className="w-8 h-8 mr-2"
                          />
                          <span className="text-[#09BE43] text-3xl font-extrabold">
                            {Math.round((correctCount / 9) * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Insight Box */}
                      <div className="mt-4 sm:mt-0 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                        <p className="text-black text-sm font-bold mb-1 mt-2">
                          INSIGHT
                        </p>
                        <div className="bg-[#131F24] flex-1 rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
                          <p
                            className="text-[#FFCC00] font-bold leading-relaxed"
                            style={{
                              fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                            }}
                          >
                            {correctCount === 9
                              ? "🏆 Perfect! You nailed every answer!"
                              : "🌟 Great job! You're on your way to being a SEL Star!"}
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
                      onClick={handleReset}
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
              ) : (
                /* LOSE SCREEN */
                <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                  <div className="flex flex-col items-center justify-center flex-1 p-6">
                    <img
                      src="/financeGames6to8/game-over-game.gif"
                      alt="Game Over"
                      className="w-48 sm:w-64 h-auto mb-4"
                    />
                    <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl font-semibold text-center">
                      Oops! You didn’t hit the mark this time. Wanna retry?
                    </p>

                    {/* Notes Recommendation */}
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
                                `/social-learning/notes?grade=6-8&section=${note.topicId}`
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
                      onClick={handleReset}
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
            </>
          )}

          {/* ✅ Popup here */}
          <LevelCompletePopup
            isOpen={isPopupVisible}
            onConfirm={() => {
              setIsPopupVisible(false);
              navigate("/mission-goal-tracker"); // your next level
            }}
            onCancel={() => {
              setIsPopupVisible(false);
              navigate("/courses"); // or exit route
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

export default MyCircleMission;
