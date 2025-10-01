import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
const tools = [
  { label: "Deep breaths", helpful: true },
  { label: "Listen to music", helpful: true },
  { label: "Talk to a friend", helpful: true },
  { label: "Scroll Instagram", helpful: false },
  { label: "Eat junk food", helpful: false },
  { label: "Take a walk", helpful: true },
  { label: "Scream into your pillow", helpful: false },
  { label: "Watch a comedy video", helpful: true },
];

const StressBusterLab = () => {
  const { completeSELChallenge } = useSEL();
  const [dropItems, setDropItems] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [score, setScore] = useState(null);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [gifCount, setGifCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleDrop = (e) => {
    const index = e.dataTransfer.getData("toolIndex");
    const tool = tools[index];

    if (dropItems.includes(index) || dropItems.length >= 5) return;

    const audio = new Audio(
      tool.helpful
        ? "/sonido-correcto-331225.mp3"
        : "https://www.myinstants.com/media/sounds/windows-error.mp3"
    );
    audio.play();

    setDropItems([...dropItems, index]);
    setFeedback((prev) => ({
      ...prev,
      [index]: tool.helpful ? "green" : "red",
    }));
    if (gifCount < 2) {
      setShowKidGif(true);
      setGifCount((c) => c + 1);

      setTimeout(() => setShowKidGif(false), 2000); // hide after 2s
    }
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("toolIndex", index);
  };

  const handlePlayAgain = () => {
    setDropItems([]);
    setFeedback({});
    setScore(null);
    setStartTime(Date.now());
  };

  const calculateScore = () => {
    let correct = 0;
    dropItems.forEach((i) => {
      if (tools[i].helpful) correct++;
    });
    setScore(correct);
  };

  useEffect(() => {
    if (dropItems.length === 5 && score === null) {
      calculateScore();
    }
  }, [dropItems]);

  useEffect(() => {
    if (score !== null) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);
      const scaledScore = Math.round((score / 5) * 10);

      updatePerformance({
        moduleName: "SEL",
        topicName: "emotionalAwareness",
        score: scaledScore,
        accuracy: (score / 5) * 100,
        avgResponseTimeSec: totalSeconds / 5,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: score >= 4,
      });
      setStartTime(Date.now());

      if (score >= 4) {
        completeSELChallenge(1, 0);
      }
    }
  }, [score]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // 📝 Notes Recommendation Hook
  useEffect(() => {
    if (score === null || score >= 5) return; // only if not perfect

    // Collect mistakes: items dropped that were wrong
    const mistakes = dropItems
      .filter((i) => !tools[i].helpful)
      .map((i) => ({
        text: `Tool: "${tools[i].label}" was not helpful.`,
        placedIn: "Stress Buster Lab",
        correctCategory: "Healthy Stress Coping",
      }));

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [score, dropItems]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/conflict-quest");
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] flex flex-col items-center justify-center p-6">
        <p className="text-center text-lg mb-6 text-white lilita-one-regular max-w-xl">
          You’re feeling super stressed. Can you choose the tools that will
          really help? <br />
          <strong>Drag 5 items</strong> into your stress toolkit.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {tools.map((tool, index) => (
            <div
              key={index}
              draggable={
                !dropItems.includes(index) &&
                score === null &&
                dropItems.length < 5
              }
              onDragStart={(e) => handleDragStart(e, index)}
              className={cn(
                "border rounded-lg p-4 text-center lilita-one-regular transition duration-300 cursor-pointer",
                {
                  "bg-green-200 border-green-600 scale-105":
                    feedback[index] === "green",
                  "bg-red-200 border-red-600 animate-shake":
                    feedback[index] === "red",
                  "opacity-50 cursor-not-allowed":
                    dropItems.includes(index) || dropItems.length >= 5,
                  "bg-white hover:bg-gray-100": !dropItems.includes(index),
                }
              )}
            >
              {tool.label}
            </div>
          ))}
        </div>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="w-full max-w-md min-h-[200px] border-4 border-dashed border-gray-400 rounded-xl flex flex-wrap justify-center items-center gap-4 p-6 bg-white shadow-md"
        >
          {dropItems.length === 0 ? (
            <p className="text-gray-500 lilita-one-regular text-center">
              Drop your stress busters here
            </p>
          ) : (
            dropItems.map((index) => (
              <div
                key={index}
                className={cn(
                  "px-4 py-2 rounded-lg text-white font-semibold",
                  tools[index].helpful ? "bg-green-500" : "bg-red-500"
                )}
              >
                {tools[index].label}
              </div>
            ))
          )}
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

        {score !== null &&
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
    </>
  );
};

export default StressBusterLab;
