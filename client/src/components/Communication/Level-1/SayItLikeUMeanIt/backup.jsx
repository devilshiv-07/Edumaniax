import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance

const moodEmojis = {
  Happy: "😃",
  Sad: "😢",
  Bored: "😐",
  Angry: "😠",
  Sarcastic: "😆",
};

const sentenceData = [
  { id: 1, audio: "/happy.mp3", correctMood: "Happy" },
  { id: 2, audio: "/angry.mp3", correctMood: "Angry" },
  { id: 3, audio: "/bored.mp3", correctMood: "Bored" },
  { id: 4, audio: "/sarcastic.mp3", correctMood: "Sarcastic" },
  { id: 5, audio: "/sad.mp3", correctMood: "Sad" },
];

const moodGIFs = {
  Happy:
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExamx5aDBydXYwbHUwMzdsNHpiNnFzb2NhNXoybDd5dGhqeTlwZHU3YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/YnBntKOgnUSBkV7bQH/200.webp",
  Angry:
    "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXJ5djZ3ZWRlbDIxZjFpemY3MTN6OHJid3RlbzJvN3liYnUxNW84MiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/11tTNkNy1SdXGg/200.webp",
  Sad: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2lndzh6bW9yNHF2ZmFueGNvMnB2c2k4MTlzNW55cTFpN2Vremx3aCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/OPU6wzx8JrHna/200.webp",
  Sarcastic:
    "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZ3NoYjNqbW40ZGNsZXB4NjhramJra3NoNThzcnhqaDMyZ3drZ2xiZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT77XTpyEzJ4OJO06c/200w.webp",
  Bored:
    "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExNWhjbW1nemVxcHF1dG95bDQ1dWZpNXlrc281OXdpYjk4YWczeGx6bSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l2JhpjWPccQhsAMfu/200.webp",
};

const SayItLikeUMeanItGame = () => {
  const [startTime, setStartTime] = useState(Date.now());
  const { completeCommunicationChallenge } = useCommunication();
  const { updatePerformance } = usePerformance();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedbackGif, setFeedbackGif] = useState(null);
  const [draggedMood, setDraggedMood] = useState(null);
  const audioRef = useRef(null);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.src = sentenceData[currentIndex].audio;
      audioRef.current.play();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const correct = draggedMood === sentenceData[currentIndex].correctMood;

    if (correct) {
      setScore((prev) => prev + 1);
      setFeedbackGif(
        "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExd21scXcydHZlb2ludHN2b21rdHo0bTFvdGZ4dXM1ZXlwZmxhbXdzbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vDWRVg8ZsjNWB583HV/giphy.gif"
      );
    } else {
      setFeedbackGif(
        "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDR1ODZ3aWZwZzh5ZHFqcW54NHU4YXlyaWhrdTE0cXpmZWEyb2pociZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/MFM6KbyfnfgXGwEq6U/giphy.gif"
      );
    }

    // Wait 3 seconds before next question
    setTimeout(() => {
      if (currentIndex === sentenceData.length - 1) {
        setShowResult(true);

        const endTime = Date.now();
        const totalTimeSec = (endTime - startTime) / 1000;
        const avgResponseTimeSec = totalTimeSec / 3; // since there are 3 steps

        const studyTimeMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));
        const accuracy = (score + (correct ? 1 : 0)) / sentenceData.length * 100;
        const scaledScore = Math.round(((score + (correct ? 1 : 0)) / sentenceData.length) * 10 * 10) / 10;

        updatePerformance({
          moduleName: "Communication",
          topicName: "interpersonalSkills",
          completed: true,
          studyTimeMinutes,
          avgResponseTimeSec, // ✅ add this
          score: scaledScore,
          accuracy,

        });

        setStartTime(Date.now());
        if ((score + (correct ? 1 : 0)) >= 3) {
          completeCommunicationChallenge(0, 1); // Mark as complete
        }

      } else {
        setCurrentIndex((prev) => prev + 1);
        setFeedbackGif(null);
      }
    }, 3000); // 3 seconds
  };

  const handleDragStart = (mood) => {
    setDraggedMood(mood);
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setShowResult(false);
    setFeedbackGif(null);
    setDraggedMood(null);
    setStartTime(Date.now());
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-blue-50 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">🎭 Say It Like You Mean It</h1>

      {!showResult ? (
        <>
          <p className="text-center text-lg mb-6 max-w-xl">
            Drag the emoji that matches the mood of the sentence.
          </p>

          <motion.div
            key={sentenceData[currentIndex].id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-md text-center max-w-md w-full"
          >
            <h2 className="text-xl font-semibold mb-2">
              "I can't believe it's Monday again already."
            </h2>
            <audio ref={audioRef} className="w-full mb-4" controls />
            <button
              onClick={handlePlay}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              ▶️ Play Voice
            </button>
          </motion.div>

          {/* Emoji choices */}
          <div className="flex gap-4 mt-6 flex-wrap justify-center">
            {Object.entries(moodEmojis).map(([mood, emoji]) => (
              <div
                key={mood}
                draggable
                onDragStart={() => handleDragStart(mood)}
                className="flex flex-col items-center bg-white p-4 rounded-xl border shadow cursor-grab w-28"
              >
                <div className="text-4xl mb-2">{emoji}</div>
                <img
                  src={moodGIFs[mood]}
                  alt={`${mood} gif`}
                  className="w-20 h-20 rounded-md object-cover"
                />
              </div>
            ))}
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="mt-8 border-dashed border-4 border-gray-400 w-64 h-32 flex items-center justify-center rounded-xl text-gray-500 text-lg"
          >
            Drop Here 🎯
          </div>

          {feedbackGif && (
            <motion.img
              src={feedbackGif}
              alt="Feedback"
              className="w-64 mt-6 rounded-xl shadow-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            />
          )}
        </>
      ) : (
        <div className="text-center mt-10">
          <h2 className="text-3xl font-bold mb-4">🎉 Game Over!</h2>
          <p className="text-lg mb-6">
            You scored {score} out of {sentenceData.length} (
            {Math.round((score / sentenceData.length) * 100)}%)
          </p>

          {score >= 4 ? (
            <>
              <p className="text-xl font-semibold text-green-600 mb-4">
                That's some great job! 🌟 You're really good at this!
              </p>
              <img
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTlkZmpzajIzMzBlcG14OHE4em1qMmQ4ZDFkaXJwdWx3ZGQwNzRpNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/jncb7lHMdHkmdBrUQ2/giphy.gif"
                alt="Excellent Job"
                className="w-64 mx-auto rounded-xl shadow-md"
              />
            </>
          ) : score === 3 ? (
            <>
              <p className="text-xl font-semibold text-yellow-600 mb-4">
                Not bad bud! 😊 You're halfway there!
              </p>
              <img
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbnMzbWR3dzJ4Nm9qOWp4azNvOTl5ODk4NHo1NnJkY3R0cTV3MGJidiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7WICImRolnaldx2o/giphy.gif"
                alt="Not bad"
                className="w-64 mx-auto rounded-xl shadow-md"
              />
            </>
          ) : (
            <>
              <p className="text-xl font-semibold text-red-600 mb-4">
                Oops! 😅 Keep practicing and you'll get better!
              </p>
              <img
                src="https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDR5Y2Y1Y2VreGllcjczYTExbGJya2J1N2Z2eWRscTh2Y2psY21mNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/KCfpWuNnTcLbc3aLvZ/giphy.gif"
                alt="Try Again"
                className="w-64 mx-auto rounded-xl shadow-md"
              />
            </>
          )}

          <button
            onClick={resetGame}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            🔁 Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default SayItLikeUMeanItGame;
