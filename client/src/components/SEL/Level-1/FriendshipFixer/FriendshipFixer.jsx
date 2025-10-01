import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";
const scenarios = [
  {
    id: 1,
    title: "The Lunch Table Drama",
    message: "Why did you ignore me today at lunch?",
    options: [
      { text: "Ugh! You’re overreacting.", isCorrect: false },
      {
        text: "Sorry, I just wanted to sit with everyone. Let’s talk at break?",
        isCorrect: true,
      },
      { text: "Whatever. Sit with someone else.", isCorrect: false },
    ],
  },
  {
    id: 2,
    title: "The Forgotten Invite",
    message: "*Visual: Sad classmate sitting alone, birthday hat on desk*",
    options: [
      { text: "Pretend you didn’t notice.", isCorrect: false },
      {
        text: "I’m really sorry. I forgot, and it wasn’t on purpose. Can I make it up to you?",
        isCorrect: true,
      },
      { text: "You didn’t miss much anyway.", isCorrect: false },
    ],
  },
  {
    id: 3,
    title: "The Drawing Disaster",
    message: "*Visual: Spilled water on artwork*",
    options: [
      { text: "Shout and crumple their paper.", isCorrect: false },
      {
        text: "I worked hard on that... but I know it was a mistake.",
        isCorrect: true,
      },
      { text: "Ignore them all day.", isCorrect: false },
    ],
  },
  {
    id: 4,
    title: "The Tug-of-War Friends",
    message: "*Visual: Two friends arguing, looking at you*",
    options: [
      { text: "Pick one friend just to end the drama.", isCorrect: false },
      {
        text: "I care about both of you. I don’t want to take sides.",
        isCorrect: true,
      },
      {
        text: "Lie to the teacher and say one bullied the other.",
        isCorrect: false,
      },
    ],
  },
];

const FriendshipFixer = () => {
  const { completeSELChallenge } = useSEL();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [feedbackGif, setFeedbackGif] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // New state for instructions overlay

  useEffect(() => {
    if (showResult) {
      const endTime = Date.now();
      const durationSec = Math.round((endTime - startTime) / 1000);
      const accuracy = (score / scenarios.length) * 100;
      const avgResponseTimeSec = durationSec / scenarios.length;

      updatePerformance({
        moduleName: "SEL",
        topicName: "selfAwareness",
        score: Math.round(score * 2.5), // out of 10
        accuracy,
        avgResponseTimeSec,
        studyTimeMinutes: Math.ceil(durationSec / 60),
        completed: score >= 3,
      });
      setStartTime(Date.now());

      if (score >= 3) {
        completeSELChallenge(0, 1);
      }
    }
  }, [showResult]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!(showResult && score < scenarios.length)) return; // only run if user didn't get all correct

    // Collect mistakes
    const mistakes = scenarios
      .map((scenario, index) => {
        // If the selected option for this scenario was correct, skip
        if (
          scenario.options.some(
            (opt) => opt.isCorrect && opt.text === selected?.text
          )
        ) {
          return null;
        }

        // Return a structured mistake object for recommendation
        return {
          text: `Scenario: "${scenario.title}" | Correct: ${scenario.options
            .filter((o) => o.isCorrect)
            .map((o) => o.text)
            .join(", ")} | Your Answer: ${selected?.text || "None"}`,
          placedIn: "Friendship Fixer",
          correctCategory: "Self-Awareness / Empathy",
        };
      })
      .filter(Boolean);

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [showResult, score, selected]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleOptionClick = (option) => {
    if (selected !== null) return;
    setSelected(option);

    if (option.isCorrect) {
      setScore(score + 1);
      setFeedbackGif(
        "https://media.tenor.com/GM3WMvmBN7cAAAAM/terrific-elijah-wood.gif"
      );
      setFeedbackText("Great choice! That was a kind and wise response. 🌟");

      // ✅ Show kid celebration GIF for first 2 questions
      if (current < 2) {
        setShowKidGif(true);
        setTimeout(() => setShowKidGif(false), 2000); // hide after 2s
      }
    } else {
      setFeedbackGif(
        "https://media.tenor.com/pnceOM-fM3MAAAAm/so-bad-breez-kennedy.webp"
      );
      setFeedbackText(
        "Oops! That wasn't the best response. Let’s learn and do better. 🤔"
      );
    }

    setTimeout(() => {
      setFeedbackGif(null);
      setFeedbackText("");
      if (current + 1 < scenarios.length) {
        setCurrent(current + 1);
        setSelected(null);
      } else {
        setShowResult(true);
      }
    }, 3300);
  };

  const restartGame = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
    setFeedbackGif(null);
    setFeedbackText("");
    setStartTime(Date.now());
  };

  const getOptionStyle = (option) => {
    if (!selected) return "bg-white hover:bg-gray-50";
    if (option === selected && option.isCorrect)
      return "bg-green-100 border-green-500";
    if (option === selected && !option.isCorrect)
      return "bg-red-100 border-red-500";
    return "bg-gray-100 opacity-60";
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/kindness-clicks");
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] p-6 flex flex-col items-center justify-center">
        <div className="bg-[#202F364D] p-4 rounded-xl w-full max-w-2xl shadow-xl border border-[#c1b9af]">
          <p className="text-center text-sm text-white lilita-one-regular mb-6">
            Choose your response wisely to handle friend situations like a hero!
          </p>

          {showResult ? (
            score >= 3 ? (
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

                  {/* Accuracy & Insight */}
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
                    onClick={restartGame}
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
              /* LOSE SCREEN JSX */
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
                    onClick={restartGame}
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
            )
          ) : (
            <div className="space-y-6">
              <div className="bg-white text-sm md:text-base rounded-xl p-3 w-fit max-w-[80%] shadow-sm border border-gray-300">
                <h2 className="text-gray-600 font-semibold mb-1">
                  {scenarios[current].title}
                </h2>
                <p className="text-gray-800 whitespace-pre-line">
                  {scenarios[current].message}
                </p>
              </div>
              <div className="flex flex-col gap-3">
                {scenarios[current].options.map((option, idx) => (
                  <motion.div
                    key={idx}
                    whileTap={{ scale: 0.98 }}
                    className={`self-end w-fit max-w-[80%] text-left px-4 py-2 border rounded-2xl text-md font-medium transition shadow-md ${getOptionStyle(
                      option
                    )}`}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option.text}
                  </motion.div>
                ))}
              </div>

              {feedbackGif && (
                <div className="mt-4 text-center">
                  <img
                    src={feedbackGif}
                    alt="Feedback gif"
                    className="mx-auto w-60 rounded-xl"
                  />
                  <p className="text-md font-semibold mt-2 text-white lilita-one-regular">
                    {feedbackText}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
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

export default FriendshipFixer;
