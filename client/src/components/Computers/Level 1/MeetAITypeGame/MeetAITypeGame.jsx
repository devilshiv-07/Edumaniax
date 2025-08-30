import React, { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
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

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());

  const handleDrop = (e, typeId) => {
    e.preventDefault();
    const exampleId = e.dataTransfer.getData("text/plain");
    setAssignments((prev) => ({ ...prev, [exampleId]: typeId }));
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const isFormComplete = () =>
    Object.keys(assignments).length === examples.length &&
    reflections.q1?.trim() &&
    reflections.q2?.trim();

  const handleSubmit = () => {
    let correct = 0;
    examples.forEach((example) => {
      if (assignments[example.id] === example.correctType) correct++;
    });
    setScore(correct);
    setSubmitted(true);
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
  };

  const handleReset = () => {
    setAssignments({});
    setReflections({});
    setSubmitted(false);
    setScore(0);
    setStartTime(Date.now());
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gradient-to-br from-pink-100 via-blue-100 to-yellow-100 min-h-screen rounded-xl">
      <motion.h1
        initial={{ scale: 0.9 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-3xl font-bold text-center text-blue-800 mb-6"
      >
        💡Meet the AI Types
      </motion.h1>

      <p className="mb-4 text-center text-lg text-gray-700">
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
            className="min-h-[200px] bg-white border-4 border-dashed border-blue-400 rounded-lg p-4 shadow-lg"
          >
            <h2 className="text-xl font-semibold text-center text-blue-700 mb-2">
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
                    <li key={exampleId} className="text-center text-green-700">
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
                className={`p-3 rounded-lg cursor-grab font-semibold text-center shadow-md border-2 hover:scale-105 transition-transform
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
        <div className="bg-white p-6 rounded-xl shadow-md mb-6">
          <h2 className="text-xl font-bold mb-3 text-blue-700">
            🧠 Reflection Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: `Design an AI friend: What would it do? What would it learn?`,
                name: "q2",
              },
            ].map(({ q, name }) => (
              <div key={name}>
                <label className="block font-medium text-gray-700 mb-1">
                  {q}
                </label>
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

      {/* Submit Button */}
      {!submitted && (
        <motion.button
          disabled={!isFormComplete()}
          onClick={handleSubmit}
          className={`block mx-auto px-6 py-2 rounded-full font-bold transition ${
            isFormComplete()
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isFormComplete() ? [0, 1, -1, 0] : 0 }}
          transition={{ duration: 0.4 }}
        >
          ✅ Submit
        </motion.button>
      )}

      {/* Result and Try Again (after submission) */}
      {submitted && (
        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.h2
            className="text-2xl font-bold text-blue-700 mb-4"
            animate={{ rotate: [0, -3, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            🎯 Your Results
          </motion.h2>
          <p className="text-lg text-gray-800 mb-4">
            You got <strong>{score}</strong> out of{" "}
            <strong>{examples.length}</strong> correct!
          </p>
          {score === examples.length ? (
            <motion.div
              className="text-green-600 text-xl font-bold mb-4"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              🏆 Perfect! You earned the AI Learner Badge!
            </motion.div>
          ) : (
            <div className="text-red-600 text-xl font-bold mb-4">
              ❌ Some answers were incorrect. Try again!
            </div>
          )}

          <div className="bg-white p-6 rounded-xl shadow-md text-left max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold mb-2 text-blue-700">
              🧠 Your Reflection Answers:
            </h3>
            <p className="mb-2">
              <strong>Coolest AI Type:</strong> {reflections.q1}
            </p>
            <p>
              <strong>AI Friend:</strong> {reflections.q2}
            </p>
          </div>

          <motion.button
            onClick={handleReset}
            className="mt-6 bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 font-bold"
            whileHover={{ scale: 1.05, rotate: [0, 3, -3, 0] }}
            transition={{ duration: 0.4 }}
          >
            🔁 Try Again
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
