import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getComputerNotesRecommendation } from "@/utils/getComputerNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const aiTypes = [
  { id: "rule", label: "📏Rule-based AI" },
  { id: "learning", label: "📚Learning AI" },
  { id: "smart", label: "🧠Smart AI" },
];

const examples = [
  { id: "calc", label: "Calculator", correctType: "rule" },
  { id: "alarm", label: "Alarm Clock", correctType: "rule" },
  { id: "trafficlight", label: "Traffic Light Timer", correctType: "rule" },
  { id: "yt", label: "YouTube Recommendations", correctType: "learning" },
  { id: "netflix", label: "Netflix Suggestions", correctType: "learning" },
  {
    id: "shopping",
    label: "Amazon Product Suggestions",
    correctType: "learning",
  },
  {
    id: "duolingo",
    label: "Duolingo Language Practice",
    correctType: "learning",
  },
  { id: "chess", label: "Chess-playing Computer", correctType: "smart" },
  { id: "siri", label: "Alexa", correctType: "smart" },
  { id: "tesla", label: "Self-Driving Car (Tesla)", correctType: "smart" },
  {
    id: "drone",
    label: "Smart Drone with Obstacle Avoidance",
    correctType: "smart",
  },
];

export default function MeetAITypeGame() {
  const { completeComputersChallenge } = useComputers();
  const [assignments, setAssignments] = useState({});
  const [reflections, setReflections] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // 🎉 Kid Gif + Loading state
  const [showKidGif, setShowKidGif] = useState(false);
  const [loading, setLoading] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!submitted) return; // run only after submission

    // collect mistakes where user placed in wrong AI type
    const mistakes = examples
      .filter((ex) => assignments[ex.id] !== ex.correctType)
      .map((ex) => ({
        text: ex.label,
        placedIn: assignments[ex.id] || "not selected",
        correctCategory: ex.correctType,
      }));

    if (mistakes.length > 0) {
      getComputerNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [submitted, assignments]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleDrop = (e, typeId) => {
    e.preventDefault();
    const exampleId = e.dataTransfer.getData("text/plain");
    setAssignments((prev) => {
      const newAssignments = { ...prev, [exampleId]: typeId };

      // 🎉 Show gif only when exactly 3 items have been dropped
      if (Object.keys(newAssignments).length === 3) {
        setShowKidGif(true);
        setTimeout(() => setShowKidGif(false), 2000); // hide after 2 sec
      }

      return newAssignments;
    });
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const isFormComplete = () =>
    Object.keys(assignments).length === examples.length &&
    reflections.q2?.trim();

  const handleSubmit = () => {
    setLoading(true);

    let correct = 0;
    examples.forEach((example) => {
      if (assignments[example.id] === example.correctType) correct++;
    });

    setTimeout(() => {
      setScore(correct);
      setSubmitted(true);
      setLoading(false);

      toast.success(`🎯 You got ${correct} out of ${examples.length} correct!`);

      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);
      const accuracy = (correct / examples.length) * 100;
      const avgResponseTimeSec = totalSeconds / examples.length;
      const studyTimeMinutes = Math.ceil(totalSeconds / 60);

      updatePerformance({
        moduleName: "Computers",
        topicName: "introductionToAI",
        score: (correct / examples.length) * 10,
        accuracy,
        avgResponseTimeSec,
        studyTimeMinutes,
        completed: correct === examples.length,
      });
      setStartTime(Date.now());
      if (correct === examples.length) {
        completeComputersChallenge(0, 1); // Challenge 1, Task 2 complete
      }
    }, 1500); // fake delay for loading spinner
  };

  const handleReset = () => {
    setAssignments({});
    setReflections({});
    setSubmitted(false);
    setScore(0);
    setStartTime(Date.now());
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/build-a-bot");
  };

  return (
    <>
      <GameNav />
      <div className="p-6 pt-20 md:pt-50 pb-28 mx-auto min-h-screen bg-[#0A160E]">
        <p className="mb-4 text-center text-lg text-white lilita-one-regular">
          🕹️ Drag each example to the correct AI type box below. Learn the
          difference!
        </p>

        {/* AI Type Drop Zones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {aiTypes.map((type) => (
            <div
              key={type.id}
              onDrop={(e) => handleDrop(e, type.id)}
              onDragOver={(e) => e.preventDefault()}
              className="min-h-[200px] bg-[#7d8f974d] border-4 border-dashed border-white rounded-lg p-4 shadow-lg"
            >
              <h2 className="text-xl text-white lilita-one-regular text-center mb-2">
                {type.label}
              </h2>
              <ul>
                {Object.entries(assignments)
                  .filter(([_, val]) => val === type.id)
                  .map(([exampleId]) => {
                    const label = examples.find(
                      (ex) => ex.id === exampleId
                    )?.label;
                    return (
                      <li
                        key={exampleId}
                        className="text-center lilita-one-regular text-green-700"
                      >
                        {label}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>

        {/* Draggable Examples */}
        {!submitted && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {examples.map((example) => {
              const isAssigned = assignments.hasOwnProperty(example.id);
              return (
                <motion.div
                  key={example.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, example.id)}
                  className={`p-3 rounded-lg cursor-grab lilita-one-regular text-center shadow-md border-2 hover:scale-105 transition-transform
                  ${
                    isAssigned
                      ? "bg-green-200 text-green-900 border-green-400"
                      : "bg-yellow-200 text-yellow-900 border-yellow-400"
                  }
                `}
                  whileHover={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  {example.label}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Reflection Questions */}
        {!submitted && (
          <div className="bg-[#202F364D] border border-white p-6 rounded-xl shadow-md mb-6">
            <h2 className="text-xl font-bold mb-3 text-white lilita-one-regular">
              🧠 Reflection Questions
            </h2>
            <div className="space-y-4 text-white lilita-one-regular">
              {[
                {
                  q: `Design an AI friend: What would it do? What would it learn?`,
                  name: "q2",
                },
              ].map(({ q, name }) => (
                <div key={name}>
                  <label className="block mb-1">{q}</label>
                  <textarea
                    className="w-full border border-gray-300 rounded p-2"
                    rows={2}
                    onChange={(e) =>
                      setReflections((prev) => ({
                        ...prev,
                        [name]: e.target.value,
                      }))
                    }
                    value={reflections[name] || ""}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ✅ Sticky Footer Submit Button */}
        <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
          {/* 🎉 Kid Celebration Gif + Speech Bubble */}
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

          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-t-pink-500 border-yellow-300 rounded-full animate-spin"></div>
              <p className="mt-2 text-gray-200 lilita-one-regular text-lg font-semibold">
                Submitting...
              </p>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={!isFormComplete() || submitted}
            >
              <img
                src="/financeGames6to8/check-now-btn.svg"
                alt="Check Now"
                className={`h-12 sm:h-16 w-auto ${
                  !isFormComplete() || submitted
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              />
            </motion.button>
          )}
        </div>

        {/* ✅ Win / Lose Screen After Submission */}
        {submitted &&
          (score === examples.length ? (
            /* WIN VIEW */
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              {/* Center Content */}
              <div className="flex flex-col items-center justify-center flex-1 p-6">
                {/* 🎉 Celebration GIF */}
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

                {/* 🌟 Score + Insight Section */}
                <div className="mt-6 flex flex-col items-center justify-center sm:flex-row sm:items-stretch sm:gap-4">
                  {/* Accuracy Box */}
                  <div className="bg-[#09BE43] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                    <p className="text-black text-sm font-bold mb-1 mt-2">
                      TOTAL SCORE
                    </p>
                    <div className="bg-[#131F24] mt-0 flex-1 rounded-xl flex items-center justify-center py-3 px-5 w-full">
                      <img
                        src="/financeGames6to8/accImg.svg"
                        alt="Target Icon"
                        className="w-8 h-8 mr-2"
                      />
                      <span className="text-[#09BE43] text-3xl font-extrabold">
                        {Math.round((score / examples.length) * 100)}%
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
                        {score === examples.length
                          ? "🏆 Perfect! You matched everything correctly!"
                          : "🌟 Great job! You're on your way to being an AI pro!"}
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
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={handleReset}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
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
                  ❌ Some answers were incorrect. Wanna Retry?
                </p>

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
                  src="/financeGames6to8/feedback.svg"
                  alt="Feedback"
                  onClick={handleViewFeedback}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={handleReset}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
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
}
