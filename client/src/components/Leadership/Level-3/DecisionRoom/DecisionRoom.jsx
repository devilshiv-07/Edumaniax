import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { useLeadership } from "@/contexts/LeadershipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getLeadershipNotesRecommendation } from "@/utils/getLeadershipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const scenarios = [
  {
    question: "You must choose a class activity, but everyone disagrees.",
    options: [
      { text: "Vote and go with majority", isCorrect: true },
      { text: "Choose yourself", isCorrect: false },
      { text: "Do nothing", isCorrect: false },
      { text: "Pick your best friend’s idea", isCorrect: false },
    ],
  },
  {
    question: "Your group project is failing. What next?",
    options: [
      { text: "Blame the team", isCorrect: false },
      { text: "Try a new plan together", isCorrect: true },
      { text: "Quit the project", isCorrect: false },
      { text: "Let one person do everything", isCorrect: false },
    ],
  },
];

const puzzleSteps = [
  "Identify the problem",
  "Think of options",
  "Pick the best one",
  "Test it out",
];

const DecisionRoom = () => {
  const { completeLeadershipChallenge } = useLeadership();
  const { width, height } = useWindowSize();
  const [screen, setScreen] = useState("scenario");
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [puzzleProgress, setPuzzleProgress] = useState([]);
  const [puzzleSelected, setPuzzleSelected] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [remainingChances, setRemainingChances] = useState(3); // allow 3 mistakes max
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (gameOver) {
      const totalTimeMs = Date.now() - startTime;

      updatePerformance({
        moduleName: "Leadership",
        topicName: "theStrategist",
        score: Math.round((score / 6) * 100),
        accuracy: parseFloat(((score / 6) * 100).toFixed(2)),
        avgResponseTimeSec: parseFloat((totalTimeMs / 6000).toFixed(2)),
        studyTimeMinutes: parseFloat((totalTimeMs / 60000).toFixed(2)),
        completed: score === 6,
      });
      setStartTime(Date.now());
      if (score === 6) {
        completeLeadershipChallenge(2, 0);
      }
    }
  }, [gameOver, score]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (gameOver && score < 6) {
      const mistakes = {
        score,
        totalQuestions: scenarios.length + puzzleSteps.length,
        incorrectSteps: scenarios.map((s, idx) => ({
          question: s.question,
          correct: null, // can extend to track chosen answers
        })),
      };

      getLeadershipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [gameOver, score]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleOptionClick = (isCorrect, i) => {
    setSelected(i);
    setShowFeedback(true);
    if (isCorrect) setScore((prev) => prev + 1);

    // 🎉 Show Kid Gif only for first 2 questions and for 2 seconds
    if (step === 0 || step === 1) {
      setShowKidGif(true);
      setTimeout(() => setShowKidGif(false), 2000);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
      if (step < scenarios.length - 1) {
        setStep((prev) => prev + 1);
      } else {
        setScreen("puzzle");
      }
    }, 1200);
  };

  const handlePuzzleClick = (stepText, index) => {
    setPuzzleSelected(index);

    // ✅ enforce strict order
    if (stepText === puzzleSteps[puzzleProgress.length]) {
      // correct next step
      const newProgress = [...puzzleProgress, stepText];
      setPuzzleProgress(newProgress);
      setScore((prev) => prev + 1);

      // 🎉 Completed all in correct order
      if (newProgress.length === puzzleSteps.length) {
        setGameOver(true);
        setScreen("result");
      }
    } else {
      // ❌ wrong order → lose immediately
      setRemainingChances((prev) => prev - 1);

      if (remainingChances - 1 <= 0) {
        setGameOver(true);
        setScreen("result");
      } else {
        // optional: reset progress if you want strict retry
        setPuzzleProgress([]);
      }
    }

    // reset selection highlight
    setTimeout(() => setPuzzleSelected(null), 500);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/team-architect"); // ensure `useNavigate()` is defined
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 flex flex-col items-center justify-center p-6 bg-[#0A160E] text-center">
        {screen === "scenario" && !gameOver && (
          <div className="max-w-xl border border-white bg-[#202F364D] rounded-2xl shadow p-6 w-full">
            <h2 className="text-xl text-white lilita-one-regular font-semibold mb-4">
              {scenarios[step].question}
            </h2>

            <div className="space-y-3">
              {scenarios[step].options.map((opt, i) => (
                <button
                  key={i}
                  className={`w-full px-4 py-2 rounded-xl lilita-one-regular transition border
                ${
                  selected === i
                    ? opt.isCorrect
                      ? "bg-green-400"
                      : "bg-red-400"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                  onClick={() => handleOptionClick(opt.isCorrect, i)}
                  disabled={selected !== null}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === "puzzle" && !gameOver && (
          <div className="max-w-xl bg-[#202F364D] rounded-2xl shadow p-6 w-full">
            <h2 className="text-xl font-bold mb-4 text-white lilita-one-regular">
              🧩 Solve this 4-Step Puzzle
            </h2>
            <img
              src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWhlZW1zZ2JqcjhheWJqcGZ3NDl1NGFlYjJ5c2Y2Y3JyZmVpeTgwZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1zL7bm3xomm5R5PfRH/200.webp"
              alt="puzzle"
              className="rounded-xl mb-4 mx-auto"
            />
            <p className="mb-4 text-white lilita-one-regular">
              Click the correct next step in problem-solving:
            </p>
            <div className="space-y-3">
              {puzzleSteps.map((stepText, index) => (
                <button
                  key={index}
                  onClick={() => handlePuzzleClick(stepText, index)}
                  className={`w-full py-2 lilita-one-regular px-4 rounded-xl transition
                ${
                  puzzleSelected === index
                    ? "bg-yellow-300"
                    : "bg-blue-100 hover:bg-blue-200"
                }`}
                >
                  {stepText}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-white lilita-one-regular">
              Progress: {puzzleProgress.length}/{puzzleSteps.length} steps
              complete
            </p>
            <p className="mt-2 text-sm text-red-400 lilita-one-regular">
              Chances left: {remainingChances}
            </p>
          </div>
        )}

        {screen === "result" && (
          <>
            {score === 6 ? (
              /* 🎉 WIN VIEW */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
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

                  <div className="mt-6 flex flex-col sm:flex-row sm:gap-4 items-center">
                    {/* Accuracy */}
                    <div className="bg-[#09BE43] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                      <p className="text-black text-sm font-bold mt-2">
                        TOTAL ACCURACY
                      </p>
                      <div className="bg-[#131F24] rounded-xl flex items-center justify-center py-3 px-5 w-full">
                        <img
                          src="/financeGames6to8/accImg.svg"
                          alt="Target Icon"
                          className="w-8 h-8 mr-2"
                        />
                        <span className="text-[#09BE43] text-3xl font-extrabold">
                          {Math.round((score / 6) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Insight */}
                    <div className="bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-64 flex-1 mt-4 sm:mt-0">
                      <p className="text-black text-sm font-bold mt-2">
                        INSIGHT
                      </p>
                      <div className="bg-[#131F24] rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
                        <p className="text-[#FFCC00] font-bold leading-relaxed text-sm">
                          🌟 Great job! You explored the scenarios like a pro.
                        </p>
                      </div>
                    </div>
                  </div>
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
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                <div className="flex flex-col items-center justify-center flex-1 p-6">
                  <img
                    src="/financeGames6to8/game-over-game.gif"
                    alt="Game Over"
                    className="w-48 sm:w-64 h-auto mb-4"
                  />
                  <p className="text-yellow-400 lilita-one-regular text-lg sm:text-2xl text-center">
                    Oops! That was close! Wanna Retry?
                  </p>

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
                    onClick={() => {
                      setStep(0);
                      setScore(0);
                      setSelected(null);
                      setPuzzleProgress([]);
                      setPuzzleSelected(null);
                      setGameOver(false);
                      setScreen("scenario");
                      setStartTime(Date.now());
                    }}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/next-challenge.svg"
                    alt="Next Challenge"
                    onClick={() => alert("Next challenge flow here")}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 🎉 Celebration Footer (always visible) */}
      <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
        {/* Kid Celebration Gif + Speech Bubble (only after answering step 0 & 1) */}
        {showKidGif && (
          <div
            className="absolute -top-24 sm:-top-30 transform -translate-x-1/2 z-50 flex items-start transition-opacity duration-500"
            style={{ left: "85%" }}
          >
            <img
              src="/financeGames6to8/kid-gif.gif"
              alt="Kid Celebration"
              className="object-contain"
              style={{ maxHeight: "120px", height: "auto", width: "auto" }}
            />
            <img
              src="/financeGames6to8/kid-saying.svg"
              alt="Kid Saying"
              className="absolute top-2 left-[90px] w-24 hidden md:block"
            />
          </div>
        )}
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
};

export default DecisionRoom;
