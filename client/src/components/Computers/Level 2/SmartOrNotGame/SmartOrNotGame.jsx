import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getComputerNotesRecommendation } from "@/utils/getComputerNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

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
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [dropCount, setDropCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // New state for instructions overlay

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

    // ✅ Count drops and show GIF for first 2 drops
    setDropCount((prev) => {
      const newCount = prev + 1;
      if (newCount <= 2) {
        setShowKidGif(true);
        setTimeout(() => setShowKidGif(false), 2000); // show GIF for 2 seconds
      }
      return newCount;
    });
  };

  const allowDrop = (e) => e.preventDefault();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showSummary) return; // run only after finishing the game

    // collect incorrectly placed books
    const mistakes = [
      ...shelfScience.map((b) => ({ ...b, placed: "Science" })),
      ...shelfLit.map((b) => ({ ...b, placed: "Literature" })),
    ].filter((b) => b.placed !== b.category);

    if (mistakes.length > 0) {
      getComputerNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [showSummary, shelfScience, shelfLit]);

  if (showIntro) {
    return <IntroScreen />;
  }

  // End game
  const finishGame = () => {
    setShowSummary(true);
    setLoading(true);

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

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/ai-problem-solver");
  };

  // Reset the game to initial state
  const handlePlayAgain = () => {
    setShelfScience([]);
    setShelfLit([]);
    setRemainingBooks(books); // reset all books
    setShowSummary(false);
    setDropCount(0);
    setShowKidGif(false);
    setLoading(false);
    setShowFeedback(false);
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E]">
        <div className="p-6 max-w-5xl pt-20 md:pt-50 pb-28 mx-auto text-center rounded-xl shadow-2xl">
          {!showSummary ? (
            <>
              <p className="text-xl text-white lilita-one-regular mb-6">
                Drag and drop the books onto the correct shelves!
              </p>

              {/* Books to sort */}
              <div className="flex flex-wrap gap-4 justify-center mb-8">
                {remainingBooks.map((book) => (
                  <motion.div
                    key={book.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, book)}
                    className="bg-white border-2 border-purple-400 p-4 rounded-xl shadow-md cursor-grab text-lg lilita-one-regular hover:bg-purple-50"
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
                  <h2 className="text-2xl lilita-one-regular text-green-700 mb-4">
                    🔬 Science Shelf
                  </h2>
                  {shelfScience.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white lilita-one-regular p-2 rounded shadow-sm mb-2"
                    >
                      {b.title}
                    </div>
                  ))}
                </div>

                <div
                  onDrop={(e) => onDrop(e, "Literature")}
                  onDragOver={allowDrop}
                  className="bg-yellow-100 p-6 rounded-2xl shadow-inner min-h-[200px]"
                >
                  <h2 className="text-2xl lilita-one-regular text-yellow-700 mb-4">
                    📖 Literature Shelf
                  </h2>
                  {shelfLit.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white lilita-one-regular p-2 rounded shadow-sm mb-2"
                    >
                      {b.title}
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ Sticky Footer Button */}
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
                    onClick={finishGame} // adapted for this game
                    disabled={loading}
                  >
                    <img
                      src="/financeGames6to8/check-now-btn.svg"
                      alt="Check Now"
                      className={`h-12 sm:h-16 w-auto ${
                        loading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    />
                  </motion.button>
                )}
              </div>
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
                  {/* WIN SCREEN */}
                  {accuracy >= 80 && (
                    <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                      <div className="flex flex-col items-center justify-center flex-1 p-6">
                        {/* Trophy / Celebration GIFs */}
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
                          🎉 Sorting Complete!
                        </h2>
                        <p className="text-[#FFCC00] mt-4 text-center font-semibold">
                          Great job! You nailed it!
                        </p>

                        {/* Badge Earned Section */}
                        <div className="mt-3 flex flex-col items-center">
                          <p className="text-white text-sm sm:text-base font-bold mb-1">
                            🏅 Badge Earned
                          </p>
                          <span className="text-yellow-400 text-sm sm:text-base font-extrabold lilita-one-regular">
                            Data Organizer
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
                        <img
                          src="/financeGames6to8/retry.svg"
                          alt="Retry"
                          onClick={handlePlayAgain}
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

                  {/* LOSE SCREEN */}
                  {accuracy < 80 && (
                    <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
                      <div className="flex flex-col items-center justify-center flex-1 p-6">
                        <img
                          src="/financeGames6to8/game-over-game.gif"
                          alt="Game Over"
                          className="w-48 sm:w-64 h-auto mb-4"
                        />
                        <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center mb-6">
                          Oops! Some books are misplaced. Try again!
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
                                {recommendedNotes
                                  .map((n) => n.title)
                                  .join(", ")}
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

                        {/* Single Results List */}
                        <div className="w-full max-w-2xl mt-4 space-y-4 text-left">
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
                      </div>

                      {/* Footer */}
                      <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
                        <img
                          src="/financeGames6to8/retry.svg"
                          alt="Retry"
                          onClick={handlePlayAgain}
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
              );
            })()
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
}
