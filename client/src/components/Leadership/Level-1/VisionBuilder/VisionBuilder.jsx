import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useLeadership } from "@/contexts/LeadershipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getLeadershipNotesRecommendation } from "@/utils/getLeadershipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const VisionBuilderGame = () => {
  const { completeLeadershipChallenge } = useLeadership();
  const [screen, setScreen] = useState("intro");
  const [vision, setVision] = useState("");
  const [goal1, setGoal1] = useState("");
  const [goal2, setGoal2] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [verifyMessage, setVerifyMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [warning, setWarning] = useState("");
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const resetAll = () => {
    setScreen("intro");
    setVision("");
    setGoal1("");
    setGoal2("");
    setSelectedOption("");
    setVerifyMessage("");
    setSubmitted(false);
    setIsCorrect(false);
    setWarning("");
    setStartTime(Date.now());
  };
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [hasShownGif, setHasShownGif] = useState(false); // guard
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // New state for instructions overlay

  useEffect(() => {
    if (screen === "result" && isCorrect) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  }, [screen, isCorrect]);

  useEffect(() => {
    if (screen === "result") {
      const totalTimeMs = Date.now() - startTime;

      updatePerformance({
        moduleName: "Leadership",
        topicName: "foresight",
        score: isCorrect ? 10 : 4, // or adjust as per scale
        accuracy: isCorrect ? 100 : 40,
        avgResponseTimeSec: parseFloat((totalTimeMs / 1000).toFixed(2)),
        studyTimeMinutes: parseFloat((totalTimeMs / 60000).toFixed(2)),
        completed: isCorrect,
      });
      setStartTime(Date.now());
      if (isCorrect) {
        completeLeadershipChallenge(0, 1); // correct challenge/task IDs
      }
    }
  }, [screen, isCorrect]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (screen === "result" && !isCorrect) {
      // Collect mistakes summary for this game
      const mistakes = {
        vision,
        goal1,
        goal2,
        selectedOption,
        verifyMessage,
      };

      getLeadershipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [screen, isCorrect, vision, goal1, goal2, selectedOption, verifyMessage]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const verifyActionWithGemini = async (text) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You're a helpful and encouraging teacher for students in Class 6–8.

A student shared their vision and two SMART goals:

🌟 Vision: "${vision}"  
🎯 Goal 1: "${goal1}"  
🎯 Goal 2: "${goal2}"

Please check:

1. Is the vision clear and positive?  
2. Are both goals SMART (Specific, Measurable, Achievable, Relevant, Time-bound)?  
3. Can the student actually do these goals themselves?

🎓 Your reply must be short and in this style:

- If everything is good:  
"Awesome job! 🎉 Your vision and goals are SMART and inspiring. Keep going! 💪"

- If something needs improvement:  
Start with: "Try again! 🤔"  
Then give a short hint for what to fix. For example:  
• "Make your vision more specific and positive."  
• "Goal 1 needs a number or time frame."  
• "Goal 2 feels too broad — try something realistic and doable."

Give at most **2 hints**, in short sentences. Use emojis and keep it encouraging! Never write more than 2 lines.`,
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
        return;
      }

      const data = await response.json();
      const geminiReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      setVerifyMessage(geminiReply.trim());
    } catch (error) {
      setVerifyMessage("⚠️ Oops! Something went wrong. Try again later.");
    }
  };

  const handleSubmit = () => {
    if (!vision || !goal1 || !goal2 || !selectedOption || !verifyMessage) {
      setWarning(
        "⚠️ Please fill in all fields and verify with Gemini before submitting."
      );
      return;
    }
    setWarning("");
    const correctMCQ = selectedOption === "B";
    const isPositive =
      verifyMessage.toLowerCase().includes("awesome job") ||
      verifyMessage.toLowerCase().includes("great job") ||
      verifyMessage.toLowerCase().includes("good job");

    setIsCorrect(correctMCQ && isPositive);
    setSubmitted(true);
    setScreen("result");
  };

  const handleTryAgain = () => {
    setVision("");
    setGoal1("");
    setGoal2("");
    setSelectedOption("");
    setSubmitted(false);
    setWarning("");
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/leadership-poster"); // ensure `useNavigate()` is defined
  };

  // Trigger GIF when typing Vision or Goal1
  const triggerKidGif = () => {
    if (hasShownGif) return; // ❌ do nothing if already shown once
    setHasShownGif(true);
    setShowKidGif(true);
    setTimeout(() => setShowKidGif(false), 2000); // hide after 2s
  };

  if (screen === "result") {
    return (
      <>
        {isCorrect ? (
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
                🏅 Badge Earned: Visionary Thinker!
              </h2>
              <p className="text-xl text-white mt-2">
                🎉 Great job! You nailed it!
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
                onClick={resetAll}
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
    );
  }

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] pt-20 md:pt-50 pb-28">
        <div className="max-w-2xl mx-auto p-6 bg-[#202F364D] shadow-lg rounded-2xl space-y-6">
          <h2 className="text-2xl font-bold text-center text-white lilita-one-regular">
            Build Your Vision & Goals
          </h2>
          <input
            type="text"
            placeholder="My Vision"
            className="w-full p-3 text-white border rounded-lg"
            value={vision}
            onChange={(e) => {
              setVision(e.target.value);
              triggerKidGif(); // 🎯 trigger GIF when typing
            }}
          />
          <input
            type="text"
            placeholder="SMART Goal 1"
            className="w-full p-3 border rounded-lg text-white"
            value={goal1}
            onChange={(e) => {
              setGoal1(e.target.value);
              triggerKidGif(); // 🎯 trigger GIF when typing
            }}
          />
          <input
            type="text"
            placeholder="SMART Goal 2"
            className="w-full p-3 border rounded-lg text-white"
            value={goal2}
            onChange={(e) => setGoal2(e.target.value)}
          />

          <div className="flex items-center gap-4">
            <button
              onClick={() =>
                verifyActionWithGemini(`${vision}. ${goal1}. ${goal2}`)
              }
              className="bg-yellow-500 text-white lilita-one-regular text-outline px-6 py-2 rounded hover:bg-yellow-600"
            >
              Verify ✨
            </button>
            {verifyMessage &&
              !verifyMessage.toLowerCase().includes("good job") && (
                <button
                  onClick={handleTryAgain}
                  className="bg-red-500 text-white lilita-one-regular text-outline px-4 py-2 rounded hover:bg-red-600"
                >
                  Try Again 🔄
                </button>
              )}
          </div>

          {verifyMessage && (
            <div className="bg-gray-100 lilita-one-regular p-4 rounded text-sm border border-gray-300 whitespace-pre-wrap">
              {verifyMessage}
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg text-white lilita-one-regular">
              Quiz Time 🧠
            </h3>
            <p className="mb-2 text-white lilita-one-regular">
              Which goal is SMART?
            </p>
            {["A", "B", "C", "D"].map((opt) => {
              const options = {
                A: "Become famous",
                B: "Score better in maths next year",
                C: "Be best student ever",
                D: "Do good things",
              };
              return (
                <label
                  key={opt}
                  className="block text-white lilita-one-regular border p-3 rounded-lg cursor-pointer mt-1"
                >
                  <input
                    type="radio"
                    name="smartGoal"
                    value={opt}
                    className="mr-2"
                    checked={selectedOption === opt}
                    onChange={(e) => setSelectedOption(e.target.value)}
                  />
                  {options[opt]}
                </label>
              );
            })}
          </div>

          {warning && (
            <p className="text-red-600 text-sm font-semibold">{warning}</p>
          )}

          {/* Footer with Check Now button */}
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

            <button
              onClick={handleSubmit}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!vision || !goal1 || !goal2 || !selectedOption}
            >
              <img
                src="/financeGames6to8/check-now-btn.svg"
                alt="Check Now"
                className="h-12 sm:h-16 w-auto"
              />
            </button>
          </div>

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

export default VisionBuilderGame;
