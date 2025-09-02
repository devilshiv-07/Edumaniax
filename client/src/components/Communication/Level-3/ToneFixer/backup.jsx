// src/ToneFixer.jsx
import React, { useState } from "react";
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance

const rudeMessages = [
  {
    message: "Why didn’t you invite me 😡??",
    options: [
      "Hey! I saw the party pics. Looked fun—wish I was there too 😊",
      "Why would you not invite me? That’s rude! 😠",
      "Guess I wasn’t cool enough for the party huh 😤",
    ],
    correctIndex: 0,
  },
  {
    message: "Are you ignoring me on purpose?",
    options: [
      "Hey, I hope everything’s okay—haven’t heard from you in a bit 😊",
      "You better have a good reason for not replying 😒",
      "You’re ignoring me. Cool. Got it. 🙄",
    ],
    correctIndex: 0,
  },
  {
    message: "You never reply to my messages 👿",
    options: [
      "I miss our chats! Hope we can catch up soon 🫶",
      "So I guess I don’t matter to you anymore? 😠",
      "I’m done texting if you don’t care. 😡",
    ],
    correctIndex: 0,
  },
];

const toneTags = ["friendly", "playful", "curious"];

const ToneFixer = () => {
  const { completeCommunicationChallenge } = useCommunication();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [selectedTag, setSelectedTag] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState(null);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [selectedTone, setSelectedTone] = useState(null);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());

  const currentQuestion = rudeMessages[questionIndex];

  const handleSubmit = () => {
    const correct = selectedOption === currentQuestion.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setScore((prev) => prev + 1);
    }
    setFeedback(
      correct
        ? "✅ Great choice! That message feels warm and friendly."
        : "❌ Oops! That response might sound a bit harsh."
    );
  };

  const handleGameFinish = () => {
    const finalScore = score + (isCorrect ? 1 : 0);
    setScore(finalScore);
    setGameFinished(true);
    completeCommunicationChallenge(2, 3); // module 2, game 3

    // ⏱️ Performance metrics
    const endTime = Date.now();
    const durationSec = (endTime - startTime) / 1000;
    const accuracy = finalScore / rudeMessages.length;
    const avgResponseTimeSec = durationSec / rudeMessages.length;

    updatePerformance({
      moduleName: "Communication",
      topicName: "communicationSkills",
      score: Math.round(accuracy * 10),       // score out of 10
      accuracy: Math.round(accuracy * 100),   // percentage
      studyTimeMinutes: durationSec / 60,
      avgResponseTimeSec,
      completed: true,

    });
    setStartTime(Date.now());
  };


  const nextQuestion = () => {
    if (questionIndex === rudeMessages.length - 1) {
      handleGameFinish();
    } else {
      setQuestionIndex((prev) => prev + 1);
      setFeedback("");
      setSelectedOption(null);
      setSelectedEmoji(null);
      setSelectedTag("");
      setIsCorrect(null);
    }
  };

  const resetGame = () => {
    setQuestionIndex(0);
    setSelectedOption(null);
    setSelectedEmoji(null);
    setSelectedTag("");
    setFeedback("");
    setIsCorrect(null);
    setScore(0);
    setGameFinished(false);
    setStartTime(Date.now());
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">🎮 Tone Fixer – Text Edition</h1>

      {/* 🔍 Static Tone Example Section */}
      <div className="bg-yellow-50 p-4 rounded-md border mb-6">
        <h2 className="font-semibold mb-2">
          🔍 Before trying the game, look at this example
        </h2>
        <p className="text-sm mb-3 text-gray-600">
          Try clicking different buttons to understand the tone transformation
          of this rude sentence:
        </p>

        <p className="mb-3 text-red-700 font-semibold">
          "You're such an idiot."
        </p>

        <div className="flex gap-2 mb-4">
          {toneTags.map((tone) => (
            <button
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`px-3 py-1 rounded ${selectedTone === tone
                ? "bg-blue-700 text-white"
                : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                }`}
            >
              {tone}
            </button>
          ))}
        </div>

        {selectedTone && (
          <div className="bg-white p-3 border rounded text-sm text-gray-800">
            <strong>
              {selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)}{" "}
              tone:
            </strong>{" "}
            {selectedTone === "friendly" &&
              "Hey, that wasn’t nice! Let’s talk calmly."}
            {selectedTone === "playful" &&
              "Whoa, someone woke up spicy today 😜"}
            {selectedTone === "curious" &&
              "Hmm, did I do something to upset you?"}
          </div>
        )}
      </div>

      {!gameFinished && (
        <div className="bg-white shadow-md rounded p-4">
          <p className="font-semibold mb-2">💬 {currentQuestion.message}</p>

          <div className="mb-4">
            <p className="mb-1">😊 Pick an emoji:</p>
            {["😊", "🤗", "🫶"].map((emoji) => (
              <button
                key={emoji}
                onClick={() => setSelectedEmoji(emoji)}
                className={`text-2xl mr-2 ${selectedEmoji === emoji
                  ? "ring-2 ring-yellow-400 rounded-full"
                  : ""
                  }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block mb-1">🏷️ Select tone tag:</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select --</option>
              {toneTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="mb-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="option"
                    value={index}
                    checked={selectedOption === index}
                    onChange={() => setSelectedOption(index)}
                    className="mr-2"
                  />
                  {option}
                </label>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedOption === null}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            ✅ Submit
          </button>

          {feedback && (
            <div
              className={`mt-4 p-4 rounded text-white ${isCorrect ? "bg-green-500" : "bg-red-500"
                }`}
            >
              <p>{feedback}</p>
              <img
                src={
                  isCorrect
                    ? "https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExOWp6Zm13cno0djN6YjJyOHpoMzBiazg4dXB1ZDFhbm9ka2FiamNzbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UmTPmPdrIr8Ok6qEFu/giphy.gif"
                    : "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbjQ4cG40eDh1cDducWhtdDlvMHByZ3NueDlnank5YnZkaGlybngyZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/kyHUOat3LQkXS/giphy.gif"
                }
                alt="feedback"
                className="mt-2 w-48 mx-auto"
              />
              <button
                onClick={nextQuestion}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {gameFinished && (
        <div className="text-center mt-8">
          <h2 className="text-xl font-semibold text-green-600">
            🎯 Your Scorecard: {score}/6 ({Math.round((score / 6) * 100)}%)
          </h2>
          <img
            src="https://media0.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3cGpiNWdnenB1N2p3aXdpZHdncjR3OWdzOGxjNXdrdDJyd2lneHVuOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT1R9K1z6TM1NRUcBG/200.webp"
            alt="final score"
            className="mx-auto mt-4 w-48"
          />
          <button
            onClick={resetGame}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            🔁 Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ToneFixer;
