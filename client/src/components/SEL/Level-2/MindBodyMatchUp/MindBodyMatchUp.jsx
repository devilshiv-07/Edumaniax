import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";
const questions = [
  {
    clue: "Sweaty palms",
    correct: "Nervous",
    gif: "https://media.tenor.com/YpzTzz5H3igAAAAM/nakanohito-genome-jikkyouchuu-the-ones-within.gif",
    options: ["Excited", "Nervous", "Anxious", "Tired"],
  },
  {
    clue: "Dry mouth",
    correct: "Anxious",
    gif: "https://media.tenor.com/5J2A7MTVr-IAAAAM/summer-water-spongebob-squarepants.gif",
    options: ["Anxious", "Tired", "Dehydrated", "Scared"],
  },
  {
    clue: "Yawning in class",
    correct: "Tired",
    gif: "https://media.tenor.com/huQzXxrjr8MAAAAM/yawn-stretch.gif",
    options: ["Excited", "Tired", "Scared", "Nervous"],
  },
  {
    clue: "Headache",
    correct: "Dehydrated",
    gif: "https://media.tenor.com/jSAUYAzWe1sAAAAM/headache-jordan.gif",
    options: ["Nervous", "Tired", "Dehydrated", "Anxious"],
  },
  {
    clue: "Butterflies in stomach",
    correct: "Excited",
    gif: "https://media.tenor.com/bUw9MvHlREoAAAAm/tkthao219-peach.webp",
    options: ["Excited", "Scared", "Nervous", "Anxious"],
  },
  {
    clue: "Fast heartbeat",
    correct: "Scared",
    gif: "https://media.tenor.com/GJWKT4dho1YAAAAM/squidward-spongebob.gif",
    options: ["Nervous", "Scared", "Tired", "Excited"],
  },
];

const MindBodyMatchUp = () => {
  const { completeSELChallenge } = useSEL();
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [mistakes, setMistakes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (showResult) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);

      // Scale score out of 10
      const scaledScore = Math.round((score / questions.length) * 10);

      updatePerformance({
        moduleName: "SEL",
        topicName: "emotionalAwareness",
        score: scaledScore,
        accuracy: (score / questions.length) * 100,
        avgResponseTimeSec: totalSeconds / questions.length,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: score >= 3,
      });
      setStartTime(Date.now());

      if (score >= 4) {
        completeSELChallenge(1, 2);
      }
    }
  }, [showResult]);

  useEffect(() => {
    if (!started || showResult) return;
    if (timeLeft === 0) {
      setShowResult(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [started, timeLeft, showResult]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showResult || score >= 5) return; // only if game ended & not perfect

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [showResult, mistakes, score]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleStart = () => {
    setStarted(true);
  };

  const handleSelect = (option) => {
    if (selected) return;
    setSelected(option);
    const correct = questions[current].correct === option;

    const audio = new Audio(
      correct
        ? "/children-saying-yay-praise-and-worship-jesus-299607.mp3"
        : "https://www.myinstants.com/media/sounds/wrong-answer-sound-effect.mp3"
    );
    audio.play();

    if (correct) setScore((s) => s + 1);

    if (!correct) {
      setMistakes((prev) => [
        ...prev,
        {
          text: `Clue: "${questions[current].clue}" was answered incorrectly.`,
          placedIn: "Mind-Body Match-Up",
          correctCategory: questions[current].correct,
        },
      ]);
    }

    // 🎉 Show kid gif only for Q1 & Q2
    if (current < 2) {
      setShowKidGif(true);
      setTimeout(() => setShowKidGif(false), 2000);
    }

    setTimeout(() => {
      if (current === questions.length - 1) {
        setShowResult(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 1500);
  };

  const handlePlayAgain = () => {
    setStarted(false);
    setTimeLeft(90);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setStartTime(Date.now());
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/influence-explorer");
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] flex flex-col items-center justify-center p-6">
        <h1 className="text-3xl text-white lilita-one-regular mb-4">
          Mind-Body Match-Up – What’s Your Body Telling You?
        </h1>

        {!started && !showResult && (
          <button
            onClick={handleStart}
            className="mb-6 bg-green-600 text-white lilita-one-regular px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
          >
            Start the Game
          </button>
        )}

        {started && !showResult && (
          <>
            <div className="text-xl text-white lilita-one-regular mb-2">
              Time Left: {timeLeft}s
            </div>
            <img
              src="https://media.tenor.com/jxFkNgpJEdcAAAAM/heart-beating-out-of-chest-cartoon.gif"
              alt="Heart Pulse"
              className="w-32 h-auto mb-4"
            />

            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
              <h2 className="text-xl lilita-one-regular mb-4">
                {questions[current].clue}
              </h2>
              <img
                src={questions[current].gif}
                alt="Clue Gif"
                className="w-48 h-auto mx-auto rounded-lg mb-4"
              />
              <div className="grid grid-cols-2 gap-4">
                {questions[current].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "px-4 py-2 rounded-lg lilita-one-regular border",
                      selected === opt &&
                        opt === questions[current].correct &&
                        "bg-green-200 border-green-600",
                      selected === opt &&
                        opt !== questions[current].correct &&
                        "bg-red-200 border-red-600",
                      !selected && "bg-gray-100 hover:bg-gray-200"
                    )}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {showResult &&
          (score >= 4 ? (
            /* ✅ WIN SCREEN JSX */
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
            /* ❌ LOSE SCREEN JSX */
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

                {/* Suggested Notes Section */}
                {recommendedNotes?.length > 0 && (
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
          ))}
      </div>

      {/* ✅ Sticky Footer Celebration */}
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

export default MindBodyMatchUp;
