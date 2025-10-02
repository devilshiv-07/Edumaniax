import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
const scenarios = [
  {
    id: 1,
    text: "You’re anxious about a test. Who do you reach out to?",
    options: [
      "Your subject teacher",
      "Your best friend who’s also nervous",
      "Your younger sibling",
      "The school guard",
    ],
    correct: 0,
    reason: "Teachers can guide you with study strategies and clarify doubts.",
  },
  {
    id: 2,
    text: "You had a fight with a friend. Who do you reach out to?",
    options: [
      "Another friend to gossip",
      "Your class teacher or school counselor",
      "A stranger online",
      "Ignore it and bottle it up",
    ],
    correct: 1,
    reason:
      "Trusted adults can help you reflect and resolve conflicts peacefully.",
  },
  {
    id: 3,
    text: "You’re feeling low for many days. Who do you reach out to?",
    options: [
      "School counselor or a trusted adult",
      "Ignore it and pretend to be okay",
      "Share jokes to distract yourself",
      "Post sad messages online",
    ],
    correct: 0,
    reason:
      "Mental health support is important, and counselors are trained to help.",
  },
  {
    id: 4,
    text: "You don’t understand homework. Who do you reach out to?",
    options: [
      "Your teacher or a classmate who understands",
      "Copy someone else’s work",
      "Skip it and make an excuse",
      "Ask your pet",
    ],
    correct: 0,
    reason: "Asking for academic help builds understanding and confidence.",
  },
  {
    id: 5,
    text: "Your cousin is being bullied and confided in you. Who do you reach out to?",
    options: [
      "A trusted adult in your family or a school counselor",
      "Spread the news to others",
      "Stay silent because it’s not your problem",
      "Fight the bully yourself",
    ],
    correct: 0,
    reason: "Trusted adults can intervene appropriately and ensure safety.",
  },
  {
    id: 6,
    text: "You feel pressured to join a challenge online. Who do you reach out to?",
    options: [
      "A trusted adult or digital safety helpline",
      "Join it so others don’t call you boring",
      "Ask the person who sent it if it’s safe",
      "Post about it to get others’ opinions",
    ],
    correct: 0,
    reason:
      "Online challenges can be risky. It's safest to ask a responsible adult.",
  },
];

export default function HelpHub() {
  const { completeSELChallenge } = useSEL();
  const [answers, setAnswers] = useState(Array(scenarios.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = useWindowSize();
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const checkScore = () => {
    return answers.filter((ans, i) => ans === scenarios[i].correct).length;
  };

  const score = checkScore();
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (showResult && score >= 5) {
      completeSELChallenge(2, 1); // You can customize these parameters
    }
  }, [showResult, score]);

  useEffect(() => {
    if (showResult) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);
      const scaledScore = Math.round((score / scenarios.length) * 10);

      updatePerformance({
        moduleName: "SEL",
        topicName: "peerSupportNetworks",
        score: scaledScore,
        accuracy: Math.round((score / scenarios.length) * 100),
        avgResponseTimeSec: totalSeconds / scenarios.length,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: score >= 5,
      });
      setStartTime(Date.now());
    }
  }, [showResult]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // 📝 Notes Recommendation Hook
  useEffect(() => {
    if (!showResult || score >= scenarios.length) return; // only trigger if game ended AND not perfect

    const mistakes = scenarios
      .map((scenario, i) => {
        if (answers[i] !== scenario.correct) {
          return {
            text: `Question: "${scenario.text}" — You chose "${
              scenario.options[answers[i]]
            }", but the better option was "${
              scenario.options[scenario.correct]
            }".`,
            placedIn: "Your Choice",
            correctCategory: "Recommended Support",
          };
        }
        return null;
      })
      .filter(Boolean);

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [showResult, score, answers]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handlePlayAgain = () => {
    setAnswers(Array(scenarios.length).fill(null));
    setShowResult(false);
    setCurrentIndex(0);
    setStartTime(Date.now());
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/my-circle-mission");
  };

  const progress =
    (answers.filter((a) => a !== null).length / scenarios.length) * 100;

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E]">
        <div className="max-w-3xl pt-20 md:pt-50 pb-28 mx-auto p-6">
          {/* Confetti when winning */}
          {showResult && score >= 5 && (
            <Confetti width={width} height={height} />
          )}

          <p className="mb-6 text-white lilita-one-regular">
            “You’re feeling overwhelmed. Who can you ask for help? Let’s explore
            your support system. Choose wisely – find the right person or place
            to turn to in each situation!”
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
            <div
              className="bg-blue-500 h-4 transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {!showResult && (
            <div className="mb-6 border border-gray-300 rounded-lg p-4 shadow-sm">
              <h2 className="text-white lilita-one-regular mb-2">
                🧩 Scenario {currentIndex + 1}
              </h2>
              <p className="mb-3 text-white lilita-one-regular">
                {scenarios[currentIndex].text}
              </p>
              <div className="space-y-2">
                {scenarios[currentIndex].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full lilita-one-regular text-left px-4 py-2 rounded border transition-all duration-300 ${
                      answers[currentIndex] !== null
                        ? idx === scenarios[currentIndex].correct
                          ? "bg-green-100 border-green-400"
                          : idx === answers[currentIndex]
                          ? "bg-red-100 border-red-400"
                          : "bg-white border-gray-300"
                        : "bg-white border-gray-300 hover:bg-blue-50 active:scale-95"
                    }`}
                    disabled={answers[currentIndex] !== null}
                  >
                    {String.fromCharCode(65 + idx)}) {opt}
                  </button>
                ))}
              </div>
              {answers[currentIndex] !== null && (
                <p
                  className={`mt-2 lilita-one-regular transition-opacity duration-500 ${
                    answers[currentIndex] === scenarios[currentIndex].correct
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {answers[currentIndex] === scenarios[currentIndex].correct
                    ? "✅ Correct! "
                    : "❌ Oops! "}
                  {scenarios[currentIndex].reason}
                </p>
              )}
            </div>
          )}

          {/* Navigation buttons */}
          {!showResult && (
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                className="px-4 py-2 lilita-one-regular bg-gray-300 rounded disabled:opacity-50"
                disabled={currentIndex === 0}
              >
                Previous
              </button>
              {currentIndex < scenarios.length - 1 ? (
                <button
                  onClick={() =>
                    setCurrentIndex((prev) =>
                      Math.min(prev + 1, scenarios.length - 1)
                    )
                  }
                  className="px-4 py-2 lilita-one-regular bg-blue-600 text-white rounded"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => setShowResult(true)}
                  className="px-4 py-2 bg-green-600 lilita-one-regular text-white rounded"
                  disabled={answers.includes(null)}
                >
                  Check Result
                </button>
              )}
            </div>
          )}

          {showResult &&
            (score >= 5 ? (
              /* ✅ WIN SCREEN */
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

                  <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                    Challenge Complete!
                  </h2>
                  <p className="text-[#FFCC00] mt-4 text-center font-semibold">
                    🎉 Great job! You nailed it!
                  </p>
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
            ) : (
              /* ❌ LOSE SCREEN */
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

                  {/* Suggested Notes if available */}
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
            ))}

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
}
