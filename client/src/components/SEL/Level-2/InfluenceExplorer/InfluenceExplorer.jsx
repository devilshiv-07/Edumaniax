import React, { useState, useEffect } from "react";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import InstructionOverlay from "./InstructionOverlay";
const statements = [
  { text: "My friend's bad mood", type: "Concern" },
  { text: "How much I study", type: "Influence" },
  { text: "What others post online", type: "Concern" },
  { text: "My reaction to being left out", type: "Influence" },
  { text: "School exam schedule", type: "Concern" },
  { text: "How I talk to others", type: "Influence" },
  { text: "The weather", type: "Concern" },
  { text: "Whether I ask for help when sad", type: "Influence" },
  { text: "My friend's opinion about my clothes", type: "Concern" },
  { text: "Choosing to get enough sleep", type: "Influence" },
];

const InfluenceExplorer = () => {
  const { completeSELChallenge } = useSEL();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [finished, setFinished] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  // Performance tracking and challenge completion

  useEffect(() => {
    if (finished) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);

      updatePerformance({
        moduleName: "SEL",
        topicName: "emotionalAwareness",
        score: score, // Already out of 10
        accuracy: (score / 10) * 100,
        avgResponseTimeSec: totalSeconds / 10,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: score >= 8,
      });
      setStartTime(Date.now());

      if (score >= 8) {
        completeSELChallenge(1, 3);
      }
    }
  }, [finished]);

  useEffect(() => {
    if (!finished || score === statements.length) return; // only if user didn’t get all correct

    // Collect mistakes
    const mistakes = statements
      .map((s, index) => {
        // We don’t store user answers yet, so add an array for them
        const userAnswer = userAnswers?.[index];
        if (s.type === userAnswer) return null;

        return {
          text: `Statement: "${s.text}" | Correct: ${s.type} | Your Answer: ${
            userAnswer || "None"
          }`,
          placedIn: "Influence Explorer",
          correctCategory: "Self-Awareness / Control",
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
  }, [finished, score, userAnswers]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleChoice = (choice) => {
    setUserAnswers((prev) => {
      const copy = [...prev];
      copy[current] = choice;
      return copy;
    });

    const correct = statements[current].type === choice;
    const audio = new Audio(
      correct
        ? "/children-saying-yay-praise-and-worship-jesus-299607.mp3"
        : "https://www.myinstants.com/media/sounds/windows-error.mp3"
    );
    audio.play();

    if (correct) setScore((prev) => prev + 1);
    setFeedback(correct ? "correct" : "wrong");

    setTimeout(() => {
      setFeedback(null);
      if (current + 1 < statements.length) {
        setCurrent((prev) => prev + 1);
      } else {
        setFinished(true);
      }
    }, 1000);
  };

  const handleRestart = () => {
    setCurrent(0);
    setScore(0);
    setFeedback(null);
    setFinished(false);
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0A160E]">
        <p className="text-lg text-white lilita-one-regular text-center mb-6 max-w-xl">
          Let’s figure out what you can do something about, and what you should
          let go of. Sort each thought into the right circle!
        </p>

        <div className="bg-[#202F364D] border border-white shadow-md p-6 rounded-xl w-full max-w-2xl mb-8">
          <h2 className="text-2xl text-white lilita-one-regular mb-4 text-center">
            🎯 Objective:
          </h2>
          <p className="text-lg text-white lilita-one-regular mb-2">
            Sort 10 different thoughts or situations into two categories:
          </p>
          <ul className="list-disc lilita-one-regular text-white list-inside space-y-2">
            <li>
              <span className=" text-green-700">✅ Influence:</span> Things you
              can control or take action on.
            </li>
            <li>
              <span className="font-bold text-red-700">❌ Concern:</span> Things
              you cannot control and should learn to let go of.
            </li>
          </ul>
        </div>

        {!finished ? (
          /* GAME IN PROGRESS */
          <div className="w-full max-w-xl bg-[#202F364D] border border-white p-6 rounded-xl shadow-md text-center">
            <p className="text-xl text-white lilita-one-regular mb-6">
              {statements[current].text}
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleChoice("Influence")}
                className={`px-6 py-3 rounded-xl font-bold text-white transition duration-300 ${
                  feedback === "correct" &&
                  statements[current].type === "Influence"
                    ? "bg-green-500"
                    : feedback === "wrong" &&
                      statements[current].type !== "Influence"
                    ? "bg-red-400"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Influence
              </button>
              <button
                onClick={() => handleChoice("Concern")}
                className={`px-6 py-3 rounded-xl font-bold text-white transition duration-300 ${
                  feedback === "correct" &&
                  statements[current].type === "Concern"
                    ? "bg-green-500"
                    : feedback === "wrong" &&
                      statements[current].type !== "Concern"
                    ? "bg-red-400"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Concern
              </button>
            </div>
          </div>
        ) : score >= 8 ? (
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
                      {Math.round((score / 10) * 100)}%
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
                      {score === 10
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
                onClick={handleRestart}
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
                onClick={handleRestart}
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
      </div>

      {/* ✅ Popup here */}
      <LevelCompletePopup
        isOpen={isPopupVisible}
        onConfirm={() => {
          setIsPopupVisible(false);
          navigate("/mission-goal-tracker"); // your next level
        }}
        onCancel={() => {
          setIsPopupVisible(false);
          navigate("/social-learning/games"); // or exit route
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
    </>
  );
};

export default InfluenceExplorer;
