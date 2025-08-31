import React, { useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useComputers } from "@/contexts/ComputersContext";
import { Link } from "react-router-dom";
import { usePerformance } from "@/contexts/PerformanceContext";

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

  const handleSelect = (challengeId, choice) => {
    setAnswers((prev) => ({ ...prev, [challengeId]: choice }));
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

  return (
    <div className="p-6 max-w-5xl mx-auto text-center bg-gradient-to-br from-green-100 via-yellow-100 to-pink-100 min-h-screen rounded-xl shadow-2xl">
      {submitted && score >= 80 && <Confetti />}

      <motion.h1
        className="text-5xl font-black text-indigo-800 mb-6 drop-shadow-lg"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        🤖 Logic Coder – Teach Your House Robot!
      </motion.h1>

      <p className="text-xl text-gray-700 mb-8">
        Build <strong>IF → THEN</strong> rules and debug the robot’s mistakes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {challenges.map((c) => (
          <motion.div
            key={c.id}
            className="bg-white p-6 rounded-3xl border-4 border-gray-300 shadow-xl text-left"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-2xl font-bold text-blue-700 mb-2">
              ⚡ Scenario: {c.description}
            </h2>
            <p className="mb-4 text-lg italic">
              Robot’s wrong routine: {c.wrongRule}
            </p>

            <div className="flex flex-col gap-3">
              {[c.correctRule, c.wrongRule].map((rule, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(c.id, rule)}
                  className={`px-4 py-3 rounded-xl border-2 transition font-semibold text-left ${
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

      {!submitted && (
        <button
          onClick={handleSubmit}
          className="mt-10 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-full text-2xl shadow-lg transition transform hover:scale-105"
        >
          🚀 Submit My Rules
        </button>
      )}

      {submitted && (
        <motion.div
          className="mt-10 bg-yellow-50 p-8 rounded-3xl border-4 border-indigo-400 shadow-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {score >= 80 ? (
            <>
              <h2 className="text-4xl font-black text-green-700 mb-4">
                🏆 Congrats! You are a Logic Coder!
              </h2>
              <p className="text-xl mb-6">
                Your robot now follows the correct rules with {score}% accuracy.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-black text-red-600 mb-4">
                ⚠️ Oops! The robot still makes mistakes.
              </h2>
              <p className="text-lg mb-6">
                Your accuracy was {score}%. Try fixing more rules!
              </p>
            </>
          )}

          {/* ✅ Buttons Section */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/ai-ethics-detective">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-600 hover:to-blue-500 text-white px-6 py-3 text-xl rounded-full shadow-md transition transform hover:scale-105">
                👉 Next Game
              </button>
            </Link>

            <button
              onClick={() => window.location.reload()} // reloads the page to retry
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-pink-600 hover:to-red-500 text-white px-6 py-3 text-xl rounded-full shadow-md transition transform hover:scale-105"
            >
              🔄 Retry
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
