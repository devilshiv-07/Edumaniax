import React, { useEffect, useState } from "react";
import { useLeadership } from "@/contexts/LeadershipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getLeadershipNotesRecommendation } from "@/utils/getLeadershipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

// Dilemmas with GIFs
const dilemmas = [
  {
    question: "You see a friend cheating in a test.",
    options: ["Join them", "Ignore it", "Tell a teacher", "Laugh"],
    correct: 2,
  },
  {
    question: "You are given credit for a group project you didn’t do.",
    options: [
      "Accept the praise",
      "Stay silent",
      "Say it was the whole team’s work",
      "Take a reward",
    ],
    correct: 2,
  },
  {
    question: "You find a lost wallet on the school playground.",
    options: [
      "Keep the money",
      "Throw it away",
      "Give it to a teacher",
      "Hide it",
    ],
    correct: 2,
  },
];

// Quizzes with GIFs
const quizzes = [
  {
    question: "Integrity means…",
    options: [
      "Winning always",
      "Doing the right thing",
      "Following your friends",
      "Being silent",
    ],
    correct: 1,
  },
  {
    question: "Which is an example of honesty?",
    options: [
      "Lying to get out of trouble",
      "Blaming others for mistakes",
      "Admitting when you did something wrong",
      "Hiding your report card",
    ],
    correct: 2,
  },
  {
    question: "What would a trustworthy person do?",
    options: [
      "Break promises",
      "Keep secrets that shouldn’t be kept",
      "Spread rumors",
      "Keep their word",
    ],
    correct: 3,
  },
];

function GameCompletionPopup({
  isOpen,
  onConfirm,
  onCancel,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
  hideConfirmButton = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
      <style>{`
                @keyframes scale-in-popup {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in-popup { animation: scale-in-popup 0.3s ease-out forwards; }
            `}</style>
      <div className="relative bg-[#131F24] border-2 border-[#FFCC00] rounded-2xl p-6 md:p-8 text-center shadow-2xl w-11/12 max-w-md mx-auto animate-scale-in-popup">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2 rounded-full"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        <div className="relative w-24 h-24 mx-auto mb-4">
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
        <h2 className="lilita-one-regular text-2xl md:text-3xl text-yellow-400 mb-3">
          {title || "Challenge Complete!"}
        </h2>
        <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
          {message || "What would you like to do next?"}
        </p>
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={onCancel}
            className="px-8 py-3 bg-red-600 text-lg text-white lilita-one-regular rounded-md hover:bg-red-700 transition-colors border-b-4 border-red-800 active:border-transparent shadow-lg"
          >
            {cancelText || "Exit Game"}
          </button>
          {!hideConfirmButton && (
            <button
              onClick={onConfirm}
              className="px-8 py-3 bg-green-600 text-lg text-white lilita-one-regular rounded-md hover:bg-green-700 transition-colors border-b-4 border-green-800 active:border-transparent shadow-lg"
            >
              {confirmText || "Continue"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const IntegrityQuest = () => {
  const { completeLeadershipChallenge } = useLeadership();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [incorrectSteps, setIncorrectSteps] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (finished && score >= 5) {
      completeLeadershipChallenge(3, 1);
    }

    if (finished) {
      const totalTimeMs = Date.now() - startTime;

      updatePerformance({
        moduleName: "Leadership",
        topicName: "innovativeLeader",
        score: Math.round((score / 6) * 100),
        accuracy: parseFloat(((score / 6) * 100).toFixed(2)),
        avgResponseTimeSec: parseFloat((totalTimeMs / 6000).toFixed(2)), // 6 questions
        studyTimeMinutes: parseFloat((totalTimeMs / 60000).toFixed(2)),
        completed: score >= 5,
      });
      setStartTime(Date.now());
    }
  }, [finished, score]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (finished && score < 5) {
      const mistakes = {
        score,
        totalQuestions: dilemmas.length + quizzes.length,
        incorrectSteps,
      };

      getLeadershipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [finished, score, incorrectSteps]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const totalSteps = dilemmas.length + quizzes.length;

  const handleAnswer = (index) => {
    let isCorrect = false;
    let questionText, options;

    if (step < dilemmas.length) {
      questionText = dilemmas[step].question;
      options = dilemmas[step].options;
      isCorrect = index === dilemmas[step].correct;
    } else {
      const quizIndex = step - dilemmas.length;
      questionText = quizzes[quizIndex].question;
      options = quizzes[quizIndex].options;
      isCorrect = index === quizzes[quizIndex].correct;
    }

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setIncorrectSteps((prev) => [
        ...prev,
        {
          question: questionText,
          chosen: options[index],
          correct:
            options[
              step < dilemmas.length
                ? dilemmas[step].correct
                : quizzes[step - dilemmas.length].correct
            ],
        },
      ]);
    }

    // 👇 Show kid gif only for step 0 and 1
    if (step < 2) {
      setShowKidGif(true);
      setTimeout(() => setShowKidGif(false), 2000); // hide after 2 sec
    }

    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setScore(0);
    setFinished(false);
    setStartTime(Date.now());
  };

  const getResultText = () => {
    if (score >= 5)
      return "🎉 Awesome! You earned the 🛡️ Trustworthy Leader badge!";
    if (score === 4) return "👏 Good job! Almost perfect — keep it up!";
    if (score === 3) return "🙌 Not bad, but you can do better next time!";
    return "😅 Oops! Let's try again and aim for better choices!";
  };

  const renderQuestion = () => {
    let q, opts;

    if (step < dilemmas.length) {
      q = dilemmas[step].question;
      opts = dilemmas[step].options;
    } else {
      const quizIndex = step - dilemmas.length;
      q = quizzes[quizIndex].question;
      opts = quizzes[quizIndex].options;
    }

    return (
      <div className="bg-[#202F364D] border border-white p-8 rounded-xl shadow-md max-w-xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4 text-white lilita-one-regular">
          {q}
        </h2>
        <div className="space-y-2">
          {opts.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className="w-full border border-white bg-[#1e4d664d] hover:bg-[#53666f4d] text-white lilita-one-regular py-2 px-4 rounded-xl transition"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  const handleExitGame = () => {
    navigate("/courses");
    setIsPopupVisible(false);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };
  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] pt-20 md:pt-50 pb-28 flex items-center justify-center p-4">
        {!finished ? (
          renderQuestion()
        ) : (
          <>
            {/* 🎯 Results Overlay */}
            {score >= 5 ? (
              /* ✅ WIN SCREEN */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
                <div className="flex flex-col items-center justify-center flex-1 p-6">
                  {/* Trophy Celebration */}
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
                    Integrity Quest Completed! 🎉
                  </h2>

                  {/* Score */}
                  <p className="text-lg text-white lilita-one-regular mt-3">
                    Your Score: {score} / 6
                  </p>

                  {/* Feedback */}
                  <div className="bg-[#202F364D] border border-white rounded-xl p-4 mt-6 max-w-md text-center">
                    <h3 className="text-white lilita-one-regular text-xl mb-2">
                      ✨ Result Summary
                    </h3>
                    <p className="text-gray-200 lilita-one-regular text-sm whitespace-pre-wrap leading-relaxed">
                      {getResultText()}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-[#2f3e46] border-t border-gray-700 py-4 flex justify-center gap-6">
                  <img
                    src="/financeGames6to8/feedback.svg"
                    alt="Feedback"
                    onClick={handleViewFeedback}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/next-challenge.svg"
                    alt="Next Challenge"
                    onClick={handleNextChallenge}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
            ) : (
              /* ❌ LOSE SCREEN */
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

                {/* Footer */}
                <div className="bg-[#2f3e46] border-t border-gray-700 py-4 flex justify-center gap-6">
                  <img
                    src="/financeGames6to8/retry.svg"
                    alt="Retry"
                    onClick={handleRestart}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/next-challenge.svg"
                    alt="Next Challenge"
                    onClick={handleNextChallenge}
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

      {/* --- RENDER THE POPUP --- */}
      <GameCompletionPopup
        isOpen={isPopupVisible}
        onCancel={handleExitGame}
        onClose={handleClosePopup}
        title="Challenge Complete!"
        message="Would you like to exit to the main menu?"
        cancelText="Exit Game"
        hideConfirmButton={true}
      />

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
};

export default IntegrityQuest;
