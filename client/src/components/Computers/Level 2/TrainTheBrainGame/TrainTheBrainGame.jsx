import { useState } from "react";
import { motion } from "framer-motion";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
// Sample animal data (use your real ones)

const animals = [
  {
    id: "cat",
    label: "Cat",
    img: "data:image/jpeg;base64,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",
    features: "Whiskers, pointed ears",
  },
  {
    id: "dog",
    label: "Dog",
    img: "https://placedog.net/100/100",
    features: "Tail wagging, barking",
  },
  {
    id: "bird",
    label: "Bird",
    img: "data:image/jpeg;base64,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",
    features: "Wings, beak, feathers",
  },
];

export default function TrainTheBrainGame() {
  const { completeComputersChallenge } = useComputers();
  const [droppedAnimals, setDroppedAnimals] = useState([]);
  const [formData, setFormData] = useState({});
  const [showTable, setShowTable] = useState(false);
  const [questionsVisible, setQuestionsVisible] = useState(false);
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());

  const correctAnswers = {
    q1: "Lots of diverse examples! More variety helps AI generalize better.",
    q2: "It may learn wrong patterns and make incorrect predictions.",
    q3: "Test it with new, unseen data and see if it gives correct answers!",
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const animalId = e.dataTransfer.getData("text/plain");
    const animal = animals.find((a) => a.id === animalId);
    if (!droppedAnimals.some((a) => a.id === animalId)) {
      setDroppedAnimals((prev) => [...prev, animal]);
    }
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
  };

  const handleChange = (e, animalId, field) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      [animalId]: {
        ...prev[animalId],
        [field]: value,
      },
    }));
  };

  const isComplete = () => {
    return droppedAnimals.every(
      (a) => formData[a.id]?.why && formData[a.id]?.examples
    );
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setAnswers((prev) => ({ ...prev, [name]: value }));
  };

  const allQuestionsAnswered = Object.values(answers).every(
    (v) => v.trim() !== ""
  );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 min-h-screen rounded-lg">
      <motion.h1
        className="text-4xl sm:text-5xl font-extrabold text-center mb-6"
        initial={{ y: -100, opacity: 0, scale: 0.5 }}
        animate={{
          y: [0, -10, 0],
          opacity: 1,
          scale: 1,
        }}
        transition={{
          y: {
            duration: 2,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          },
          opacity: { duration: 0.8 },
          scale: { type: "spring", stiffness: 200, damping: 10, delay: 0.2 },
        }}
      >
        🎮{" "}
        <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
          Train the Brain
        </span>
      </motion.h1>
      <p className="text-lg text-center text-gray-700 mb-6">
        🧠 Help train an AI to recognize animals by dragging them into the
        training area!
      </p>

      {/* Drag Zone */}
      <div className="flex justify-center gap-6 mb-8 flex-wrap">
        {animals.map((animal) => (
          <div
            key={animal.id}
            draggable
            onDragStart={(e) => handleDragStart(e, animal.id)}
            className="w-36 h-48 bg-white border-4 border-yellow-400 rounded-3xl shadow-2xl p-3 cursor-grab hover:scale-105 transition-all duration-300 ease-in-out flex flex-col items-center justify-start text-center relative"
          >
            <div className="mb-1 text-xs text-purple-800 font-semibold">
              🎈 Drag me!
            </div>
            <div className="w-28 h-36 bg-pink-100 border-4 border-pink-300 rounded-full overflow-hidden shadow-md flex items-center justify-center">
              <img
                src={animal.img}
                alt={animal.label}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="mt-2 text-base font-bold text-blue-700">
              <div className="text-2xl">
                {animal.label === "Cat"
                  ? "🐱"
                  : animal.label === "Dog"
                  ? "🐶"
                  : "🐦"}
              </div>
              <div>{animal.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Drop Area */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="min-h-[200px] bg-white border-dashed border-4 border-purple-400 rounded-xl p-6 shadow-xl text-center text-lg text-purple-700 font-semibold mb-8"
      >
        🧪 Drop the animal images here to begin training the AI!
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {droppedAnimals.map((animal) => (
            <div
              key={animal.id}
              className="bg-blue-50 rounded-lg p-4 shadow-md"
            >
              <img
                src={animal.img}
                alt={animal.label}
                className="w-16 h-16 rounded-full mx-auto mb-2"
              />
              <h3 className="text-xl font-bold text-blue-800">
                {animal.label}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                ⭐ Features: {animal.features}
              </p>
              <textarea
                placeholder="💡 Why is this feature important?"
                className="w-full rounded-lg border-2 border-yellow-300 bg-yellow-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 transition placeholder:text-yellow-600 mb-3 shadow-sm"
                onChange={(e) => handleChange(e, animal.id, "why")}
                value={formData[animal.id]?.why || ""}
              />
              <input
                type="text"
                placeholder="📸 How many examples needed?"
                className="w-full rounded-lg border-2 border-blue-300 bg-blue-50 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder:text-blue-600 shadow-sm"
                onChange={(e) => handleChange(e, animal.id, "examples")}
                value={formData[animal.id]?.examples || ""}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Show Table Button */}
      {droppedAnimals.length > 0 && !showTable && (
        <button
          disabled={!isComplete()}
          onClick={() => setShowTable(true)}
          className={`block mx-auto mt-4 px-6 py-2 rounded-full font-bold text-white transition ${
            isComplete()
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          📊 Show Training Summary
        </button>
      )}

      {/* Training Summary Table */}
      {showTable && (
        <div className="mt-10 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-purple-800 mb-4">
            📋 AI Training Table
          </h2>
          <table className="w-full table-auto border border-gray-300">
            <thead className="bg-blue-100">
              <tr>
                <th className="border p-2">Animal</th>
                <th className="border p-2">Features</th>
                <th className="border p-2">Why Important</th>
                <th className="border p-2">Examples Needed</th>
              </tr>
            </thead>
            <tbody>
              {droppedAnimals.map((animal) => (
                <tr key={animal.id} className="text-center">
                  <td className="border p-2">{animal.label}</td>
                  <td className="border p-2">{animal.features}</td>
                  <td className="border p-2">{formData[animal.id]?.why}</td>
                  <td className="border p-2">
                    {formData[animal.id]?.examples}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Advanced Questions Section */}
          {!questionsVisible && (
            <div className="text-center mt-6">
              <button
                onClick={() => setQuestionsVisible(true)}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold"
              >
                🔍 Answer Advanced Questions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Reflection Questions */}
      {questionsVisible && (
        <div className="mt-10 bg-yellow-50 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-purple-800 mb-4">
            🧠 Advanced Thinking
          </h3>
          <div className="space-y-4">
            <div>
              <label className="font-semibold">
                1. How many animal images should an AI see to learn well?
              </label>
              <textarea
                name="q1"
                value={answers.q1}
                onChange={handleQuestionChange}
                className="w-full mt-1 p-2 rounded border-2 border-yellow-300 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold">
                2. What happens if you show it wrong images?
              </label>
              <textarea
                name="q2"
                value={answers.q2}
                onChange={handleQuestionChange}
                className="w-full mt-1 p-2 rounded border-2 border-yellow-300 bg-white"
              />
            </div>
            <div>
              <label className="font-semibold">
                3. How would you test if the AI learned correctly?
              </label>
              <textarea
                name="q3"
                value={answers.q3}
                onChange={handleQuestionChange}
                className="w-full mt-1 p-2 rounded border-2 border-yellow-300 bg-white"
              />
            </div>
          </div>
          <button
            disabled={!allQuestionsAnswered}
            onClick={() => {
              setShowCorrectAnswers(true);
              if (!challengeCompleted) {
                completeComputersChallenge(1, 0);
                setChallengeCompleted(true);

                // ⏱️ Performance Tracking
                const endTime = Date.now();
                const studyTimeMinutes = Math.round(
                  (endTime - startTime) / 60000
                );
                const avgResponseTimeSec = (endTime - startTime) / 1000 / 3;

                updatePerformance({
                  moduleName: "Computers",
                  topicName: "foundationsOfAIIntelligence",
                  score: 10,
                  accuracy: 100,
                  avgResponseTimeSec,
                  studyTimeMinutes,
                  completed: true,
                });
                setStartTime(Date.now());
              }
            }}
            className={`mt-6 px-6 py-2 font-bold rounded-full text-white transition ${
              allQuestionsAnswered && !challengeCompleted
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            ✅ Submit Answers
          </button>
        </div>
      )}

      {/* Correct Answers */}
      {showCorrectAnswers && (
        <div className="mt-10 bg-green-50 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-green-800 mb-4">
            ✅ Expert Insights
          </h3>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              <strong>Ans1:</strong> {correctAnswers.q1}
            </li>
            <li>
              <strong>Ans2:</strong> {correctAnswers.q2}
            </li>
            <li>
              <strong>Ans3:</strong> {correctAnswers.q3}
            </li>
          </ul>
          <div className="text-center mt-6 text-lg font-semibold text-green-700">
            🏅 You’ve completed the challenge!
            <div className="text-yellow-600 text-2xl mt-2">
              📊 Data Trainer Badge
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
