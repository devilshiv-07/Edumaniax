import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useComputers } from "@/contexts/ComputersContext";
import { Link, useNavigate } from "react-router-dom";
import { usePerformance } from "@/contexts/PerformanceContext";
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { getComputerNotesRecommendation } from "@/utils/getComputerNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const challenges = [
  {
    id: 1,
    description: "Traffic light is Red",
    wrongRule: "IF Red → THEN Go 🚗",
    correctRule: "IF Red → THEN Stop 🚦",
  },
  {
    id: 2,
    description: "Plate is Dirty",
    wrongRule: "IF Dirty → THEN Put Away 🍽️",
    correctRule: "IF Dirty → THEN Wash 🍽️",
  },
  {
    id: 3,
    description: "Floor is Wet",
    wrongRule: "IF Wet → THEN Vacuum 🧹",
    correctRule: "IF Wet → THEN Mop 🧽",
  },
];

export default function AIProblemSolverGame() {
  const { completeComputersChallenge } = useComputers();
  const { updatePerformance } = usePerformance();

  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  // kid gif state
  const [showKidGif, setShowKidGif] = useState(false);
  const [gifTriggers, setGifTriggers] = useState(0);

  const handleSelect = (challengeId, choice) => {
    setAnswers((prev) => ({ ...prev, [challengeId]: choice }));

    // show gif only for max 2 selections
    if (gifTriggers < 2) {
      setShowKidGif(true);
      setGifTriggers((prev) => prev + 1);
      setTimeout(() => setShowKidGif(false), 2000); // hide after 2 sec
    }
  };

  const handleSubmit = () => {
    let correct = 0;
    challenges.forEach((c) => {
      if (answers[c.id] === c.correctRule) correct++;
    });
    const accuracy = Math.round((correct / challenges.length) * 100);
    setScore(accuracy);
    setSubmitted(true);

    if (accuracy >= 80) {
      completeComputersChallenge(1, 3);

      const endTime = Date.now();
      const totalSeconds = Math.floor((endTime - startTime) / 1000);
      updatePerformance({
        moduleName: "Computers",
        topicName: "foundationsOfAIIntelligence",
        score: accuracy,
        accuracy,
        avgResponseTimeSec: totalSeconds / challenges.length,
        studyTimeMinutes: totalSeconds / 60,
        completed: true,
      });
      setStartTime(Date.now());
    }
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  const handlePlayAgain = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowFeedback(false);
    setGifTriggers(0);
    setShowKidGif(false);
    setStartTime(Date.now()); // reset timer
    setIsPopupVisible(false); // hide popup if it was open
  };

  useEffect(() => {
    if (!submitted) return; // run only after the game is submitted

    // collect mistakes = wrong answers
    const mistakes = challenges
      .filter((c) => answers[c.id] !== c.correctRule)
      .map((c) => ({
        ...c,
        chosen: answers[c.id] || "No Answer",
      }));

    if (mistakes.length > 0) {
      getComputerNotesRecommendation(mistakes).then((notes) => {
        setRecommendedNotes(notes);
      });
    }
  }, [submitted, answers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] pb-28">
        <div className="p-6 max-w-5xl pt-20 md:pt-50 mx-auto text-center rounded-xl shadow-2xl">
          {submitted && score >= 80 && <Confetti />}

          <p className="text-xl text-white lilita-one-regular mb-8">
            Build <strong>IF → THEN</strong> rules and debug the robot’s
            mistakes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {challenges.map((c) => (
              <motion.div
                key={c.id}
                className="bg-[#202F364D] p-6 rounded-3xl border-4 border-gray-300 shadow-xl text-left"
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-2xl font-bold text-white lilita-one-regular mb-2">
                  ⚡ Scenario: {c.description}
                </h2>
                <p className="mb-4 text-lg italic text-white lilita-one-regular">
                  Robot’s wrong routine: {c.wrongRule}
                </p>

                <div className="flex flex-col gap-3">
                  {[c.correctRule, c.wrongRule].map((rule, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(c.id, rule)}
                      className={`px-4 py-3 rounded-xl border-2 transition lilita-one-regular text-left ${
                        answers[c.id] === rule
                          ? rule === c.correctRule
                            ? "bg-green-200 border-green-600"
                            : "bg-red-200 border-red-600"
                          : "bg-gray-50 border-gray-300 hover:bg-yellow-100"
                      }`}
                    >
                      {rule}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {submitted && (
            <>
              {/* ✅ WIN SCREEN */}
              {score >= 80 && (
                <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                  <div className="flex flex-col items-center justify-center flex-1 p-6">
                    {/* Trophy / Celebration GIFs */}
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
                      🎉 Sorting Complete!
                    </h2>
                    <p className="text-[#FFCC00] mt-4 text-center font-semibold">
                      Great job! You nailed it with {score}% accuracy!
                    </p>

                    {/* Badge Earned Section */}
                    <div className="mt-3 flex flex-col items-center">
                      <p className="text-white text-sm sm:text-base font-bold mb-1">
                        🏅 Badge Earned
                      </p>
                      <span className="text-yellow-400 text-sm sm:text-base font-extrabold lilita-one-regular">
                        Logic Coder
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

              {/* ❌ LOSE SCREEN */}
              {score < 80 && (
                <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
                  <div className="flex flex-col items-center justify-center flex-1 p-6">
                    <img
                      src="/financeGames6to8/game-over-game.gif"
                      alt="Game Over"
                      className="w-48 sm:w-64 h-auto mb-4"
                    />
                    <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-6">
                      Oops! The robot still makes mistakes. Try again!
                    </p>

                    {/* Results list for transparency */}
                    <div className="w-full max-w-2xl mt-4 space-y-4 text-left">
                      {Object.entries(answers).map(([id, response]) => {
                        const challenge = challenges.find(
                          (c) => c.id === Number(id)
                        );
                        const isCorrect = response === challenge.correctRule;
                        return (
                          <div
                            key={id}
                            className={`p-4 rounded-xl shadow-md ${
                              isCorrect
                                ? "bg-green-100 border-l-8 border-green-500"
                                : "bg-red-100 border-l-8 border-red-500"
                            }`}
                          >
                            ⚡ <strong>{challenge.description}</strong> <br />
                            Your Answer: {response} <br />
                            Correct: {challenge.correctRule}
                          </div>
                        );
                      })}
                    </div>

                    {/* Notes Recommendation if user mistakes exist */}
                    {recommendedNotes?.length > 0 && (
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
                                `/computer/notes?grade=6-8&section=${note.topicId}`
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

              {/* ✅ Popup here */}
              <LevelCompletePopup
                isOpen={isPopupVisible}
                onConfirm={() => {
                  setIsPopupVisible(false);
                  navigate("/ai-ethics-detective"); // your next level
                }}
                onCancel={() => {
                  setIsPopupVisible(false);
                  navigate("/computer/games"); // or exit route
                }}
                onClose={() => setIsPopupVisible(false)}
                title="Challenge Complete!"
                message="Are you ready for the next challenge?"
                confirmText="Next Challenge"
                cancelText="Exit"
              />
            </>
          )}
        </div>
      </div>

      {/* ✅ Sticky Footer */}
      {!submitted && (
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

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
          >
            <img
              src="/financeGames6to8/check-now-btn.svg"
              alt="Check Now"
              className="h-12 sm:h-16 w-auto"
            />
          </motion.button>
        </div>
      )}

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
}
