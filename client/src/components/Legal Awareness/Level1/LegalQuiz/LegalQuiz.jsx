import React, { useState } from "react";
import { CheckCircle, XCircle, Trophy, Star, Medal } from "lucide-react";
import { useLaw } from "@/contexts/LawContext";
import { useEffect } from "react";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { useNavigate } from "react-router-dom";
import { getLawNotesRecommendation } from "@/utils/getLawNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const LegalQuiz = () => {
  const { completeLawChallenge } = useLaw();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [confirmedAnswer, setConfirmedAnswer] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // New state for instructions overlay

  useEffect(() => {
    if (!gameComplete) return;

    const endTime = Date.now();
    const totalQuestions = questions.length;
    const correctAnswers = score / 10;
    const scaledScore = (correctAnswers / totalQuestions) * 10;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
    const avgResponseTimeSec = Math.round(
      (endTime - startTime) / (1000 * totalQuestions)
    );
    const studyTimeMinutes = Math.round((endTime - startTime) / 60000);

    updatePerformance({
      moduleName: "Law",
      topicName: "beginnerLegalIntellect",
      score: scaledScore,
      accuracy,
      avgResponseTimeSec,
      studyTimeMinutes,
      completed: true, // You can set your own pass criteria here
    });
    setStartTime(Date.now());
  }, [gameComplete]);

  const questions = [
    {
      id: 1,
      question:
        "Your friend is not allowed to attend school because of their religion. Which fundamental right is violated?",
      options: ["Right to Equality", "Right to Freedom", "Right to Education"],
      correct: 0,
      explanation:
        "The Right to Equality ensures no discrimination based on religion!",
    },
    {
      id: 2,
      question: "Someone is riding a bicycle without a helmet. Is this legal?",
      options: ["Yes", "No", "Only if the road is empty"],
      correct: 1,
      explanation:
        "Safety first! Wearing a helmet while cycling is required by law.",
    },
    {
      id: 3,
      question: "You bought a toy that broke the next day. What can you do?",
      options: [
        "Ask for a replacement or refund",
        "Throw it away",
        "Keep it broken",
      ],
      correct: 0,
      explanation:
        "Consumer rights protect you! You can always ask for replacement or refund.",
    },
    {
      id: 4,
      question:
        "A factory is dumping waste into a river near your village. Which law is being broken?",
      options: [
        "Water Pollution Prevention Act",
        "Traffic Rules",
        "Child Labour Act",
      ],
      correct: 0,
      explanation:
        "Environmental laws protect our water! The Water Pollution Prevention Act is being violated.",
    },
    {
      id: 5,
      question:
        "Someone creates a fake social media account pretending to be you. Is this allowed?",
      options: ["Yes", "No", "Only if it's for fun"],
      correct: 1,
      explanation:
        "Identity theft is never okay! Cyber laws protect your digital identity.",
    },
    {
      id: 6,
      question: "Which of these is a fundamental duty?",
      options: [
        "To respect the national flag",
        "To ignore rules",
        "To disturb others",
      ],
      correct: 0,
      explanation:
        "Great job! Respecting our national symbols is indeed a fundamental duty.",
    },
  ];

  const handleAnswerSelect = (index) => {
    if (!showFeedback) {
      setSelectedAnswer(index);
    }
  };

  const handleConfirmAnswer = () => {
    if (selectedAnswer !== null) {
      setConfirmedAnswer(true);
      setShowFeedback(true);
      if (selectedAnswer === questions[currentQuestion].correct) {
        setScore(score + 10);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setConfirmedAnswer(false);
    } else {
      setGameComplete(true);
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setScore(0);
    setGameComplete(false);
    setConfirmedAnswer(false);
    setStartTime(Date.now());
  };

  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  useEffect(() => {
    if (gameComplete) {
      completeLawChallenge(0, 0);
    }
  }, [gameComplete]);

  useEffect(() => {
    if (showFeedback && (currentQuestion === 0 || currentQuestion === 1)) {
      setShowKidGif(true);
      const timer = setTimeout(() => setShowKidGif(false), 1500); // hide after 1.5s
      return () => clearTimeout(timer);
    }
  }, [showFeedback, currentQuestion]);

  useEffect(() => {
    if (!gameComplete || score >= 50) return;

    const mistakes = [];

    questions.forEach((q, index) => {
      // Find the answer the user picked (you already track selected answers)
      const userAnswer = index === currentQuestion ? selectedAnswer : null;

      if (userAnswer !== q.correct) {
        mistakes.push({
          text: q.question,
          selectedOption:
            userAnswer !== null ? q.options[userAnswer] : "Not answered",
          correctAnswer: q.options[q.correct],
        });
      }
    });

    if (mistakes.length > 0) {
      getLawNotesRecommendation(mistakes).then((notes) => {
        setRecommendedNotes(notes);
      });
    }
  }, [gameComplete, score, selectedAnswer, currentQuestion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  if (gameComplete) {
    if (score >= 50) {
      // WIN SCREEN
      return (
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
                  TOTAL ACCURACY
                </p>
                <div className="bg-[#131F24] mt-0 flex-1 rounded-xl flex items-center justify-center py-3 px-5 w-full">
                  <img
                    src="/financeGames6to8/accImg.svg"
                    alt="Target Icon"
                    className="w-8 h-8 mr-2"
                  />
                  <span className="text-[#09BE43] text-3xl font-extrabold">
                    {Math.round((score / 60) * 100)}%
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
                    {score === 60
                      ? "🏆 Perfect! You nailed every answer!"
                      : "🌟 Great job! You're on your way to being a Legal Eagle!"}
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

          {/* ✅ Popup here */}
          <LevelCompletePopup
            isOpen={isPopupVisible}
            onConfirm={() => {
              setIsPopupVisible(false);
              navigate("/puzzle-match"); // your next level
            }}
            onCancel={() => {
              setIsPopupVisible(false);
              navigate("/law/games"); // or exit route
            }}
            onClose={() => setIsPopupVisible(false)}
            title="Challenge Complete!"
            message="Are you ready for the next challenge?"
            confirmText="Next Challenge"
            cancelText="Exit"
          />
        </div>
      );
    } else {
      // LOSE SCREEN
      return (
        <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
          <div className="flex flex-col items-center justify-center flex-1 p-4">
            <img
              src="/financeGames6to8/game-over-game.gif"
              alt="Game Over"
              className="w-48 sm:w-64 h-auto mb-4"
            />
            <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
              Oops! Your score was below 50. Wanna retry?
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
                      navigate(`/law/notes?grade=6-8&section=${note.topicId}`)
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
              onClick={() => console.log("Next challenge clicked")}
              className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
            />
          </div>
        </div>
      );
    }
  }

  const currentQ = questions[currentQuestion];

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-3 sm:p-4 md:p-6">
        <div className="max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 pt-2 sm:pt-4">
            <div className="flex flex-col mt-3 sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 text-white">
              <div className="bg-white text-black bg-opacity-20 px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                <span className="lilita-one-regular text-sm sm:text-base">
                  Question {currentQuestion + 1}/6
                </span>
              </div>
              <div className="bg-white text-black bg-opacity-20 px-3 sm:px-4 py-1 sm:py-2 rounded-full">
                <span className="lilita-one-regular text-sm sm:text-base">
                  Score: {score}/60
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white bg-opacity-30 rounded-full h-2 sm:h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${((currentQuestion + 1) / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-[#202F364D] rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 ">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white lilita-one-regular mb-3 sm:mb-4 leading-tight">
                {currentQ.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
              {currentQ.options.map((option, index) => {
                let buttonClass =
                  "w-full p-3 sm:p-4 text-left rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base md:text-lg transition-all duration-200 transform hover:scale-105 ";

                if (showFeedback) {
                  if (index === currentQ.correct) {
                    buttonClass += "bg-green-500 text-white shadow-lg";
                  } else if (
                    index === selectedAnswer &&
                    index !== currentQ.correct
                  ) {
                    buttonClass += "bg-red-500 text-white shadow-lg";
                  } else {
                    buttonClass += "bg-gray-200 text-gray-600";
                  }
                } else if (selectedAnswer === index) {
                  buttonClass +=
                    "bg-blue-500 text-white shadow-lg ring-2 sm:ring-4 ring-blue-300";
                } else {
                  buttonClass +=
                    "bg-gray-100 text-gray-800 hover:bg-blue-100 hover:shadow-md";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={buttonClass}
                    disabled={showFeedback}
                  >
                    <div className="flex items-center justify-between">
                      <span className="pr-2 leading-tight lilita-one-regular">
                        {String.fromCharCode(65 + index)}) {option}
                      </span>
                      {showFeedback && index === currentQ.correct && (
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce flex-shrink-0" />
                      )}
                      {showFeedback &&
                        index === selectedAnswer &&
                        index !== currentQ.correct && (
                          <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-bounce flex-shrink-0" />
                        )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {showFeedback && (
              <div
                className={`p-3 sm:p-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 animate-fadeIn ${
                  selectedAnswer === currentQ.correct
                    ? "bg-green-100 border-2 border-green-300"
                    : "bg-red-100 border-2 border-red-300"
                }`}
              >
                <div className="flex items-center mb-2">
                  {selectedAnswer === currentQ.correct ? (
                    <>
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 flex-shrink-0" />
                      <span className="font-bold text-green-800 lilita-one-regular text-lg sm:text-xl">
                        🎉 Correct!
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mr-2 flex-shrink-0" />
                      <span className="font-bold text-red-800 lilita-one-regular text-lg sm:text-xl">
                        ❌ Wrong!
                      </span>
                    </>
                  )}
                </div>
                <p className="text-gray-700 lilita-one-regular font-medium text-sm sm:text-base leading-tight">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3 sm:space-x-4">
              {!showFeedback && (
                <button
                  onClick={handleConfirmAnswer}
                  disabled={selectedAnswer === null}
                  className={`px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base md:text-lg transition-all duration-200 transform hover:scale-105 ${
                    selectedAnswer !== null
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white lilita-one-regular shadow-lg hover:from-green-600 hover:to-blue-600"
                      : "bg-[#4c68754d] text-white lilita-one-regular cursor-not-allowed"
                  }`}
                >
                  ✅ Confirm Answer
                </button>
              )}

              {showFeedback && (
                <button
                  onClick={handleNextQuestion}
                  className="bg-[#4c68754d] text-white lilita-one-regular px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold text-sm sm:text-base md:text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  {currentQuestion < questions.length - 1
                    ? "➡️ Next Question"
                    : "🏆 View Results"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 🎉 Celebration Footer (only for Q1 & Q2, auto-hide after 1.5s) */}
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

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
};

export default LegalQuiz;
