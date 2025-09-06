import React, { useEffect, useState } from "react";
import { useLeadership } from "@/contexts/LeadershipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";
import { getLeadershipNotesRecommendation } from "@/utils/getLeadershipNotesRecommendation";

const pairs = [
  {
    leader: "Authoritative Leader",
    trait: "Makes bold decisions quickly",
    gif: "https://media.tenor.com/93WAVC-PpK8AAAAM/autocratic-elon-musk.gif",
  },
  {
    leader: "Democratic Leader",
    trait: "Asks team before deciding",
    gif: "https://media.tenor.com/n32bnOH0x0IAAAAM/pete-buttigieg-mayor.gif",
  },
  {
    leader: "Servant Leader",
    trait: "Cares for everyone’s needs",
    gif: "https://media.tenor.com/IQuIbqPRrXQAAAAM/chee-soon.gif",
  },
  {
    leader: "Transformational Leader",
    trait: "Brings big changes",
    gif: "https://media.tenor.com/Zy2vUte41PQAAAA1/obama-uspresident.webp",
  },
];

const mcqs = [
  {
    question: "Which leader asks for everyone’s opinion?",
    options: ["Authoritative", "Servant", "Democratic", "Passive"],
    answer: "Democratic",
  },
  {
    question: "Which trait is best for a leader?",
    options: ["Bossy", "Honest", "Selfish", "Quiet"],
    answer: "Honest",
  },
];

export default function LeaderTypeMatch() {
  const { completeLeadershipChallenge } = useLeadership();
  const [stage, setStage] = useState("drag");
  const [dragData, setDragData] = useState([]);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [score, setScore] = useState(0);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showGif, setShowGif] = useState(false);
  const [gifCount, setGifCount] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const totalTimeMs = Date.now() - startTime;

    if (stage === "result") {
      updatePerformance({
        moduleName: "Leadership",
        topicName: "foresight",
        score: Math.round((score / 6) * 10),
        accuracy: parseFloat(((score / 6) * 100).toFixed(2)),
        avgResponseTimeSec: parseFloat((totalTimeMs / 6 / 1000).toFixed(2)),
        studyTimeMinutes: parseFloat((totalTimeMs / 60000).toFixed(2)),
        completed: score >= 5,
      });
      setStartTime(Date.now());
      if (score >= 5) {
        completeLeadershipChallenge(0, 0); // Use your real IDs
      }
    }
  }, [stage, score]);

  const [recommendedNotes, setRecommendedNotes] = useState([]);

  useEffect(() => {
    if (stage === "result" && score < 5) {
      // Collect mistakes summary
      const mistakes = {
        dragData,
        mcqAnswers,
        score,
      };

      getLeadershipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [stage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleDrop = (i, trait) => {
    const data = [...dragData];
    data[i] = trait;
    setDragData(data);
  };

  const checkDrag = () => {
    let points = 0;
    dragData.forEach((ans, i) => {
      if (ans === pairs[i].trait) points++;
    });
    setScore(points);
    setStage("mcq");
  };

  const handleMCQ = (i, val) => {
    const answers = { ...mcqAnswers, [i]: val };
    setMcqAnswers(answers);
  };

  const checkMCQ = () => {
    let total = score;
    mcqs.forEach((q, i) => {
      if (mcqAnswers[i] === q.answer) total++;
    });
    setScore(total);
    setStage("result");
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/vision-builder"); // ensure `useNavigate()` is defined
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] flex flex-col items-center justify-center p-6">
        {stage === "drag" && (
          <div className="w-full max-w-3xl relative">
            <h2 className="text-2xl text-white lilita-one-regular font-bold mb-4">
              Match leadership styles to traits
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pairs.map((p, i) => (
                <div
                  key={i}
                  className="bg-[#202F364D] p-4 rounded shadow flex flex-col"
                >
                  <strong className="text-white lilita-one-regular">
                    {p.leader}
                  </strong>
                  <img src={p.gif} alt={p.leader} className="my-2 rounded" />
                  <select
                    value={dragData[i] || ""}
                    onChange={(e) => {
                      handleDrop(i, e.target.value);

                      // trigger kid gif only 2 times
                      if (gifCount < 2) {
                        setShowGif(true);
                        setGifCount((prev) => prev + 1);

                        setTimeout(() => {
                          setShowGif(false);
                        }, 2000); // hide after 2 seconds
                      }
                    }}
                    className="border p-2 rounded text-white"
                  >
                    <option value="" className="text-black lilita-one-regular">
                      Select trait
                    </option>
                    {pairs.map((opt, idx) => (
                      <option
                        className="text-black lilita-one-regular"
                        key={idx}
                        value={opt.trait}
                      >
                        {opt.trait}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
              {/* Kid Celebration Gif + Speech Bubble */}
              {showGif && (
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

              <button
                onClick={checkDrag}
                disabled={dragData.filter(Boolean).length < pairs.length}
                className={`${
                  dragData.filter(Boolean).length < pairs.length
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <img
                  src="/financeGames6to8/check-now-btn.svg"
                  alt="Check Now"
                  className="h-12 sm:h-16 w-auto"
                />
              </button>
            </div>
          </div>
        )}

        {stage === "mcq" && (
          <div className="w-full max-w-2xl ">
            <h2 className="text-2xl font-bold mb-4 text-white lilita-one-regular">
              Answer the MCQs
            </h2>
            {mcqs.map((q, i) => (
              <div key={i} className="mb-6 p-4 bg-[#202F364D] rounded shadow">
                <p className="mb-2 font-medium text-white lilita-one-regular">
                  {q.question}
                </p>
                {q.options.map((opt, idx) => (
                  <label
                    key={idx}
                    className="flex items-center gap-2 text-white lilita-one-regular"
                  >
                    <input
                      type="radio"
                      name={`mcq-${i}`}
                      checked={mcqAnswers[i] === opt}
                      onChange={() => handleMCQ(i, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ))}
            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
              <button
                onClick={checkMCQ}
                disabled={
                  Object.keys(mcqAnswers).length < mcqs.length // disable until all answered
                }
                className={`${
                  Object.keys(mcqAnswers).length < mcqs.length
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                <img
                  src="/financeGames6to8/check-now-btn.svg"
                  alt="Check Now"
                  className="h-12 sm:h-16 w-auto"
                />
              </button>
            </div>
          </div>
        )}

        {stage === "result" && (
          <>
            {/* WIN VIEW */}
            {score >= 5 ? (
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                {/* Center Content */}
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

                  {/* Challenge Complete Text */}
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
                          {Math.round((score / 6) * 100)}%
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
                          🌟 Great job! You explored the carbon cycle like a
                          pro. Keep practicing to master it even more! 🌍✨
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
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
              /* LOSE VIEW */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                {/* Game Over */}
                <div className="flex flex-col items-center justify-center flex-1 p-4">
                  <img
                    src="/financeGames6to8/game-over-game.gif"
                    alt="Game Over"
                    className="w-48 sm:w-64 h-auto mb-4"
                  />
                  <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                    Oops! That was close! Wanna Retry?
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
                <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
                  <img
                    src="/financeGames6to8/feedback.svg"
                    alt="Feedback"
                    onClick={handleViewFeedback}
                    className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/retry.svg"
                    alt="Retry"
                    onClick={() => {
                      setStage("drag");
                      setStartTime(Date.now());
                      setDragData([]);
                      setMcqAnswers({});
                      setScore(0);
                      setShowGif(false);
                      setGifCount(0);
                    }}
                    className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/next-challenge.svg"
                    alt="Next Challenge"
                    onClick={handleNextChallenge}
                    className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}
      </div>
    </>
  );
}
