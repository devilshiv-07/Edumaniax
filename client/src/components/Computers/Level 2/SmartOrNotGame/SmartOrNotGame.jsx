import React, { useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// Sample book tasks
const books = [
  { id: 1, title: "Algebra Basics", category: "Science" },
  { id: 2, title: "The Jungle Book", category: "Literature" },
  { id: 3, title: "Physics Fundamentals", category: "Science" },
  { id: 4, title: "Fairy Tales", category: "Literature" },
  { id: 5, title: "Science Story", category: "Science" }, // tricky mixed label
  { id: 6, title: "Math Adventures", category: "Science" },
  { id: 7, title: "Poetry Time", category: "Literature" },
];

export default function SmartOrNotGame() {
  const { completeComputersChallenge } = useComputers();
  const { updatePerformance } = usePerformance();

  const [shelfScience, setShelfScience] = useState([]);
  const [shelfLit, setShelfLit] = useState([]);
  const [remainingBooks, setRemainingBooks] = useState(books);
  const [showSummary, setShowSummary] = useState(false);
  const [startTime] = useState(Date.now());

  // Drag & Drop handlers
  const onDragStart = (e, book) => {
    e.dataTransfer.setData("bookId", book.id);
  };

  const onDrop = (e, shelfType) => {
    const bookId = parseInt(e.dataTransfer.getData("bookId"));
    const book = remainingBooks.find((b) => b.id === bookId);
    if (!book) return;

    if (shelfType === "Science") {
      setShelfScience([...shelfScience, book]);
    } else {
      setShelfLit([...shelfLit, book]);
    }

    setRemainingBooks(remainingBooks.filter((b) => b.id !== bookId));
  };

  const allowDrop = (e) => e.preventDefault();

  // End game
  const finishGame = () => {
    setShowSummary(true);

    const allResponses = [
      ...shelfScience.map((b) => ({ ...b, placed: "Science" })),
      ...shelfLit.map((b) => ({ ...b, placed: "Literature" })),
    ];

    const score = allResponses.filter((r) => r.category === r.placed).length;
    const accuracy = (score / books.length) * 100;
    const endTime = Date.now();
    const totalSeconds = Math.floor((endTime - startTime) / 1000);

    // Scale score out of 10
    const scaledScore = Math.round((score / books.length) * 10);

    updatePerformance({
      moduleName: "Computers",
      topicName: "foundationsOfAIClassification",
      score: scaledScore,
      accuracy,
      avgResponseTimeSec: totalSeconds / books.length,
      studyTimeMinutes: totalSeconds / 60,
      completed: true,
    });

    completeComputersChallenge(1, 2); // mark challenge
  };

  return (
    <div className="p-6 max-w-5xl mx-auto text-center bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 min-h-screen rounded-xl shadow-2xl">
      <motion.h1
        className="text-6xl font-black text-purple-700 mb-10 drop-shadow-lg"
        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
      >
        🤖 Robot Librarian
      </motion.h1>

      {!showSummary ? (
        <>
          <p className="text-xl text-gray-700 mb-6">
            Drag and drop the books onto the correct shelves!
          </p>

          {/* Books to sort */}
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {remainingBooks.map((book) => (
              <motion.div
                key={book.id}
                draggable
                onDragStart={(e) => onDragStart(e, book)}
                className="bg-white border-2 border-purple-400 p-4 rounded-xl shadow-md cursor-grab text-lg font-semibold hover:bg-purple-50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                📘 {book.title}
              </motion.div>
            ))}
          </div>

          {/* Shelves */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              onDrop={(e) => onDrop(e, "Science")}
              onDragOver={allowDrop}
              className="bg-green-100 p-6 rounded-2xl shadow-inner min-h-[200px]"
            >
              <h2 className="text-2xl font-bold text-green-700 mb-4">
                🔬 Science Shelf
              </h2>
              {shelfScience.map((b) => (
                <div key={b.id} className="bg-white p-2 rounded shadow-sm mb-2">
                  {b.title}
                </div>
              ))}
            </div>

            <div
              onDrop={(e) => onDrop(e, "Literature")}
              onDragOver={allowDrop}
              className="bg-yellow-100 p-6 rounded-2xl shadow-inner min-h-[200px]"
            >
              <h2 className="text-2xl font-bold text-yellow-700 mb-4">
                📖 Literature Shelf
              </h2>
              {shelfLit.map((b) => (
                <div key={b.id} className="bg-white p-2 rounded shadow-sm mb-2">
                  {b.title}
                </div>
              ))}
            </div>
          </div>

          {/* Finish Button */}
          {remainingBooks.length === 0 && (
            <button
              onClick={finishGame}
              className="mt-8 bg-purple-600 text-white px-6 py-3 text-xl rounded-full shadow-lg hover:bg-purple-700 transition"
            >
              ✅ Finish Sorting
            </button>
          )}
        </>
      ) : (
        (() => {
          const allResponses = [
            ...shelfScience.map((b) => ({ ...b, placed: "Science" })),
            ...shelfLit.map((b) => ({ ...b, placed: "Literature" })),
          ];
          const score = allResponses.filter(
            (r) => r.category === r.placed
          ).length;
          const accuracy = (score / books.length) * 100;

          return (
            <>
              {accuracy >= 80 ? (
                <>
                  <Confetti />
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white border-4 border-purple-300 p-10 rounded-3xl shadow-2xl mt-10"
                  >
                    <h2 className="text-4xl text-green-600 font-extrabold mb-6">
                      🎉 Sorting Complete!
                    </h2>
                    <p className="text-2xl text-purple-700 font-semibold mb-6">
                      Accuracy: {accuracy.toFixed(1)}%
                    </p>
                    <p className="text-xl text-green-700 font-bold mb-6">
                      🏆 Badge Earned: Data Organizer
                    </p>
                  </motion.div>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white border-4 border-red-300 p-10 rounded-3xl shadow-2xl mt-10"
                >
                  <h2 className="text-3xl text-red-600 font-extrabold mb-4">
                    ❌ Try Again!
                  </h2>
                  <p className="text-xl text-gray-700 mb-6">
                    Accuracy: {accuracy.toFixed(1)}% — You need at least 80% to
                    earn the badge.
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full text-lg"
                  >
                    🔄 Retry
                  </button>
                </motion.div>
              )}

              {/* Single Results List */}
              <div className="mt-8 space-y-4 text-left">
                {allResponses.map((r, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-xl shadow-md ${
                      r.placed === r.category
                        ? "bg-green-100 border-l-8 border-green-500"
                        : "bg-red-100 border-l-8 border-red-500"
                    }`}
                  >
                    📘 <strong>{r.title}</strong> <br />
                    Placed: {r.placed} <br />
                    Correct: {r.category}
                  </div>
                ))}
              </div>
            </>
          );
        })()
      )}
    </div>
  );
}
