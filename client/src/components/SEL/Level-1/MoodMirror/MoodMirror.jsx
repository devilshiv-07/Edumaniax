import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const scenarios = [
  {
    text: "You forgot your lunch.",
    emojis: ["😠", "😔", "😋", "🤔"],
    correct: ["😔", "😋"],
    gif: "https://media.tenor.com/B77_DRU-GhgAAAAM/monsters-inc-where-is-my-lunch.gif",
  },
  {
    text: "You got picked last for a team.",
    emojis: ["😊", "😞", "😡", "😶"],
    correct: ["😞"],
    gif: "https://media.tenor.com/Db3yx5C9NzEAAAAM/draft-rob-gronkowski.gif",
  },
  {
    text: "Your friend gives you a kind note.",
    emojis: ["😊", "😠", "😳", "😐"],
    correct: ["😊"],
    gif: "https://media.tenor.com/rvVM6O_04lgAAAAm/good-friend-jared-dines.webp",
  },
  {
    text: "You answer correctly in class.",
    emojis: ["😃", "😬", "😞", "😴"],
    correct: ["😃"],
    gif: "https://media.tenor.com/kL5bKx9lFt8AAAAM/thats-right-martin-scorsese.gif",
  },
  {
    text: "Someone laughs when you trip.",
    emojis: ["😡", "😳", "😂", "😢"],
    correct: ["😳", "😢"],
    gif: "https://media.tenor.com/5cvp497SzakAAAAM/lol-fake-smile.gif",
  },
];

const MoodMirror = () => {
  const { completeSELChallenge } = useSEL();
  const { updatePerformance } = usePerformance();

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [feedbackGif, setFeedbackGif] = useState(null);
  const [showKidGif, setShowKidGif] = useState(false); // ✅ Kid celebration state

  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  // Intro delay
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Performance tracking
  useEffect(() => {
    if (showResult) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);
      const scaledScore = Math.round((score / scenarios.length) * 10);
      const accuracy = (score / scenarios.length) * 100;
      const avgResponseTimeSec = totalSeconds / scenarios.length;

      updatePerformance({
        moduleName: "SEL",
        topicName: "selfAwareness",
        score: scaledScore,
        accuracy,
        avgResponseTimeSec,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: score >= 4,
      });
      setStartTime(Date.now());

      if (score >= 4) completeSELChallenge(0, 0);
    }
  }, [showResult]);

  useEffect(() => {
    if (!(showResult && score < 4)) return; // only run if user failed

    // Collect mistakes (basic example: just store which scenarios went wrong)
    const mistakes = scenarios
      .map((scenario, index) => {
        // if user never selected wrong, skip
        if (selected && scenario.correct.includes(selected)) return null;

        return {
          text: `Scenario: "${
            scenario.text
          }" | Correct: ${scenario.correct.join(
            ", "
          )} | Your Answer: ${selected}`,
          placedIn: "Mood Mirror",
          correctCategory: "Self-Awareness",
        };
      })
      .filter(Boolean);

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [showResult, score, selected]);

  const handleDrop = (emoji) => {
    if (selected) return;

    setSelected(emoji);
    const isCorrect = scenarios[current].correct.includes(emoji);

    if (isCorrect) {
      setScore(score + 1);
      setFeedbackGif(
        "https://media.tenor.com/9CArIutRIUQAAAAm/thats-the-correct-answer-kenny-sebastian.webp"
      );
    } else {
      setFeedbackGif(
        "https://media.tenor.com/2Mrtn8RQfkUAAAAm/that-is-a-wrong-answer-rich-benoit.webp"
      );
    }

    // ✅ Show kid gif only for first 2 questions
    if (current < 2) {
      setShowKidGif(true);
      setTimeout(() => setShowKidGif(false), 2000);
    }

    // Move to next scenario
    setTimeout(() => {
      if (current + 1 < scenarios.length) {
        setCurrent(current + 1);
        setSelected(null);
        setFeedbackGif(null);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const resetGame = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFeedbackGif(null);
    setStartTime(Date.now());
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/friendship-fixer");
  };

  if (showIntro) return <IntroScreen />;

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] flex flex-col items-center justify-center p-6 relative">
        {showResult ? (
          <>
            {/* WIN SCREEN */}
            {score >= 4 ? (
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
                          {Math.round((score / scenarios.length) * 100)}%
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
                          {score === scenarios.length
                            ? "🏆 Perfect! You nailed every answer!"
                            : score >= Math.ceil(scenarios.length * 0.7)
                            ? "🌟 Great job! You're on your way to being a SEL Star!"
                            : "💡 Keep practicing! You're building self-awareness step by step."}
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

                {/* Footer */}
                <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
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
              </div>
            )}
          </>
        ) : (
          <div className="w-full max-w-2xl bg-[#202F364D] border border-white p-6 rounded-xl shadow-xl text-center">
            <h3 className="text-xl md:text-2xl text-white lilita-one-regular mb-4">
              {scenarios[current].text}
            </h3>
            <img
              src={scenarios[current].gif}
              alt="scenario gif"
              className="mx-auto rounded-xl mb-4 w-full max-h-72 object-contain"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scenarios[current].emojis.map((emoji, idx) => (
                <motion.div
                  key={idx}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDrop(emoji)}
                  className={`text-4xl md:text-5xl p-4 rounded-full border-2 transition cursor-pointer ${
                    selected === emoji &&
                    scenarios[current].correct.includes(emoji)
                      ? "border-green-500"
                      : selected === emoji
                      ? "border-red-500"
                      : "border-transparent hover:border-blue-300"
                  }`}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>

            {feedbackGif && (
              <img
                src={feedbackGif}
                alt="feedback gif"
                className="mx-auto mt-6 rounded-xl w-full max-h-64 object-contain"
              />
            )}
          </div>
        )}

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
      </div>
    </>
  );
};

export default MoodMirror;
