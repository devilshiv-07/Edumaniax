import React, { useState, useEffect, useRef } from "react";
import { Shuffle, Trophy, Star, Clock, RotateCcw } from "lucide-react";
import { useLaw } from "@/contexts/LawContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getLawNotesRecommendation } from "@/utils/getLawNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";
const SortItOut = () => {
  const { completeLawChallenge } = useLaw();
  const [statements, setStatements] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameActive, setGameActive] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [categories, setCategories] = useState({
    fundamental: [],
    cyber: [],
    consumer: [],
  });
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [dragOverCategory, setDragOverCategory] = useState(null);
  const timerRef = useRef(null);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  const allStatements = [
    {
      id: 1,
      text: "You can express your opinions peacefully.",
      category: "fundamental",
      icon: "🗣️",
    },
    {
      id: 2,
      text: "Free and compulsory education up to Class 8.",
      category: "fundamental",
      icon: "📚",
    },
    {
      id: 3,
      text: "You can't be treated unfairly because of your gender or religion.",
      category: "fundamental",
      icon: "⚖️",
    },
    {
      id: 4,
      text: "Spreading fake news online can lead to legal action.",
      category: "cyber",
      icon: "📱",
    },
    {
      id: 5,
      text: "Never share your OTP or passwords.",
      category: "cyber",
      icon: "🔐",
    },
    {
      id: 6,
      text: "Posting someone's private messages online is cyberbullying.",
      category: "cyber",
      icon: "💻",
    },
    {
      id: 7,
      text: "You can return a faulty product and ask for a refund.",
      category: "consumer",
      icon: "🛒",
    },
    {
      id: 8,
      text: "Factories must not dump waste into rivers.",
      category: "consumer",
      icon: "🌊",
    },
    {
      id: 9,
      text: "You can complain if you're overcharged for something.",
      category: "consumer",
      icon: "💰",
    },
  ];

  const categoryInfo = {
    fundamental: {
      title: "Fundamental Rights",
      color: "bg-green-400",
      borderColor: "border-green-500",
      emoji: "🟩",
    },
    cyber: {
      title: "Cyber Law",
      color: "bg-blue-400",
      borderColor: "border-blue-500",
      emoji: "🟦",
    },
    consumer: {
      title: "Consumer & Environment",
      color: "bg-yellow-400",
      borderColor: "border-yellow-500",
      emoji: "🟨",
    },
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startGame = () => {
    setStatements(shuffleArray(allStatements));
    setScore(0);
    setTimeLeft(120);
    setGameActive(true);
    setGameComplete(false);
    setCategories({ fundamental: [], cyber: [], consumer: [] });
    setFeedback("");
    setShowFeedback(false);
  };

  const resetGame = () => {
    setGameActive(false);
    setGameComplete(false);
    setStatements([]);
    setScore(0);
    setTimeLeft(120);
    setCategories({ fundamental: [], cyber: [], consumer: [] });
    setFeedback("");
    setShowFeedback(false);
    setStartTime(Date.now());
  };

  const shuffleStatements = () => {
    setStatements(shuffleArray(statements));
  };

  useEffect(() => {
    if (!gameComplete) return;

    const endTime = Date.now();
    const totalStatements = 9;
    const correctAnswers = score / 3; // +3 for each correct answer
    const scaledScore = (correctAnswers / totalStatements) * 10;
    const accuracy = Math.round((correctAnswers / totalStatements) * 100);
    const avgResponseTimeSec = Math.round(
      (endTime - startTime) / (1000 * totalStatements)
    );
    const studyTimeMinutes = Math.round((endTime - startTime) / 60000);

    updatePerformance({
      moduleName: "Law",
      topicName: "beginnerLegalIntellect",
      score: scaledScore,
      accuracy,
      avgResponseTimeSec,
      studyTimeMinutes,
      completed: true,
      beginnerLegalIntellectAvgScore: scaledScore,
      beginnerLegalIntellectAccuracy: accuracy,
    });
    setStartTime(Date.now());
  }, [gameComplete]);

  useEffect(() => {
    if (gameActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, gameActive]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!gameComplete) return;

    const mistakes = [];

    // Wrongly placed
    Object.entries(categories).forEach(([categoryKey, placedItems]) => {
      placedItems.forEach((item) => {
        if (item.category !== categoryKey) {
          mistakes.push({
            text: item.text,
            placedIn: categoryKey,
            correctCategory: item.category,
          });
        }
      });
    });

    // Unplaced statements
    statements.forEach((item) => {
      mistakes.push({
        text: item.text,
        placedIn: "not placed",
        correctCategory: item.category,
      });
    });

    if (mistakes.length > 0) {
      getLawNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [gameComplete, categories, statements]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const endGame = () => {
    setGameActive(false);
    setGameComplete(true);

    const completedInTime = timeLeft > 0;

    if (completedInTime && score >= 15) {
      setFeedback("🎉 Amazing! Bonus points for finishing in time!");
      setScore((prev) => prev + 5);
      completeLawChallenge(0, 1);
    } else {
      setFeedback(`⏰ Time's up or low score! Better luck next time!`);
    }
    setShowFeedback(true);
  };

  const handleDragStart = (e, statement) => {
    setDraggedItem(statement);
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDragOverCategory(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e, categoryKey) => {
    e.preventDefault();
    setDragOverCategory(categoryKey);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverCategory(null);
    }
  };

  const handleDrop = (e, categoryKey) => {
    e.preventDefault();
    setDragOverCategory(null);

    if (!draggedItem || !gameActive) return;

    const isCorrect = draggedItem.category === categoryKey;

    if (isCorrect) {
      setCategories((prev) => ({
        ...prev,
        [categoryKey]: [...prev[categoryKey], draggedItem],
      }));
      setStatements((prev) => prev.filter((s) => s.id !== draggedItem.id));
      setScore((prev) => prev + 3);
      setFeedback("✅ Correct! Great job!");
    } else {
      setScore((prev) => Math.max(0, prev - 1));
      setFeedback("❌ Oops! Try again!");
    }

    setShowFeedback(true);
    setTimeout(() => setShowFeedback(false), 1500);
    setDraggedItem(null);

    // Check if game is complete
    const totalPlaced = Object.values({
      ...categories,
      [categoryKey]: isCorrect
        ? [...categories[categoryKey], draggedItem]
        : categories[categoryKey],
    }).reduce((sum, arr) => sum + arr.length, 0);

    if (totalPlaced === 9 && isCorrect) {
      setTimeout(() => endGame(), 500);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/legal-quiz");
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white lilita-one-regular mb-2 drop-shadow-lg">
              🎮 Sort It Out: Law Edition
            </h1>
            <p className="text-white lilita-one-regular text-sm sm:text-base lg:text-lg opacity-90 px-2">
              Drag and drop the statements into the correct categories!
            </p>
          </div>

          {/* Game Controls */}
          <div className="flex justify-center items-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
            {!gameActive && !gameComplete && (
              <button
                onClick={startGame}
                className="bg-green-500 hover:bg-green-600 text-white text-outline lilita-one-regular px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🚀 Start Game
              </button>
            )}

            {gameActive && (
              <>
                <div className="bg-white rounded-full px-3 sm:px-4 py-2 shadow-lg">
                  <Clock className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-600" />
                  <span
                    className={`font-bold lilita-one-regular text-sm sm:text-base ${
                      timeLeft < 30 ? "text-red-600" : "text-blue-600"
                    }`}
                  >
                    {formatTime(timeLeft)}
                  </span>
                </div>

                <div className="bg-white rounded-full px-3 sm:px-4 py-2 shadow-lg">
                  <Star className="inline w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-yellow-600" />
                  <span className="font-bold lilita-one-regular text-yellow-600 text-sm sm:text-base">
                    Score: {score}
                  </span>
                </div>

                <button
                  onClick={shuffleStatements}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-full font-bold text-sm sm:text-base transform hover:scale-105 transition-all duration-200 shadow-lg"
                >
                  <Shuffle className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1 sm:mr-2" />
                  <span className=" text-white lilita-one-regular">
                    Shuffle
                  </span>
                </button>
              </>
            )}

            {gameComplete && (
              <button
                onClick={resetGame}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-lg transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 inline mr-1 sm:mr-2" />
                <span className="lilita-one-regular">Play Again</span>
              </button>
            )}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className="text-center mb-4">
              <div className="bg-white rounded-full px-4 sm:px-6 py-2 inline-block shadow-lg animate-bounce">
                <span className="font-bold text-sm sm:text-base text-gray-800">
                  {feedback}
                </span>
              </div>
            </div>
          )}

          {/* Game Complete Screen */}
          {gameComplete &&
            (score >= 15 && timeLeft > 0 ? (
              // WIN SCREEN
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
                          {Math.round((score / 32) * 100)}%
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
                          {score === 32
                            ? "🏆 Perfect! You sorted everything flawlessly!"
                            : score >= 20
                            ? "🌟 Great job! You understood the categories really well!"
                            : "💡 Keep practicing! The more you play, the sharper you’ll get!"}
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
              // LOSE SCREEN
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                <div className="flex flex-col items-center justify-center flex-1 p-4">
                  <img
                    src="/financeGames6to8/game-over-game.gif"
                    alt="Game Over"
                    className="w-48 sm:w-64 h-auto mb-4"
                  />
                  <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                    Oops! Time’s up or your score was below 15! Wanna retry?
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
                              `/law/notes?grade=6-8&section=${note.topicId}`
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
                    onClick={resetGame}
                    className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/next-challenge.svg"
                    alt="Next Challenge"
                    onClick={() => console.log("Next challenge clicked")}
                    className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
            ))}

          {/* Game Area */}
          {gameActive && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
              {/* Statements to Sort */}
              <div className="lg:col-span-1 order-1 lg:order-1">
                <div className="bg-[#202F364D] rounded-xl p-3 sm:p-4 shadow-lg">
                  <h3 className="text-lg sm:text-xl font-bold text-center mb-3 sm:mb-4 text-white lilita-one-regular">
                    📋 Statements to Sort
                  </h3>
                  <div className="space-y-2 sm:space-y-3">
                    {statements.map((statement) => (
                      <div
                        key={statement.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, statement)}
                        onDragEnd={handleDragEnd}
                        className="bg-[#485a624d] text-white p-3 sm:p-4 rounded-lg cursor-move hover:from-indigo-500 hover:to-purple-500 transform hover:scale-105 transition-all duration-200 shadow-md"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <span className="text-lg sm:text-xl flex-shrink-0">
                            {statement.icon}
                          </span>
                          <span className="text-xs sm:text-sm font-medium leading-relaxed lilita-one-regular">
                            {statement.text}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drop Zones */}
              <div className="lg:col-span-3 order-2 lg:order-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <div
                      key={key}
                      onDragOver={handleDragOver}
                      onDragEnter={(e) => handleDragEnter(e, key)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, key)}
                      className={`
                      ${
                        info.color
                      } rounded-xl p-3 sm:p-4 min-h-[200px] sm:min-h-[300px] transition-all duration-300 shadow-lg
                      ${
                        dragOverCategory === key
                          ? "scale-105 shadow-2xl ring-4 ring-white"
                          : "hover:scale-102"
                      }
                    `}
                    >
                      <div className="text-center mb-3 sm:mb-4">
                        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">
                          {info.emoji}
                        </div>
                        <h3 className="text-sm sm:text-lg font-bold text-white text-outline lilita-one-regular drop-shadow-md">
                          {info.title}
                        </h3>
                      </div>

                      <div className="space-y-2">
                        {categories[key].map((statement) => (
                          <div
                            key={statement.id}
                            className="bg-white bg-opacity-90 p-2 sm:p-3 rounded-lg shadow-md"
                          >
                            <div className="flex items-start gap-2">
                              <span className="text-base sm:text-lg flex-shrink-0">
                                {statement.icon}
                              </span>
                              <span className="text-xs sm:text-sm text-gray-800 lilita-one-regular font-medium leading-relaxed">
                                {statement.text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {categories[key].length === 0 && (
                        <div className="border-2 border-dashed border-white border-opacity-50 rounded-lg h-24 sm:h-32 flex items-center justify-center mt-2 sm:mt-4">
                          <span className="text-white text-opacity-70 text-xs sm:text-sm font-medium text-center px-2">
                            Drop statements here
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!gameActive && !gameComplete && (
            <div className="bg-[#202F364D] border border-white border-opacity-50 rounded-xl p-4 sm:p-6 shadow-lg mx-2 sm:mx-4 mt-4 sm:mt-6">
              <h3 className="text-xl sm:text-2xl font-bold text-center mb-4 text-white lilita-one-regular">
                🎯 How to Play
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2">🟩</div>
                  <h4 className="font-bold text-green-600 lilita-one-regular mb-2 text-sm sm:text-base">
                    Fundamental Rights
                  </h4>
                  <p className="text-xs sm:text-sm text-white lilita-one-regular">
                    Basic rights every citizen has
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2">🟦</div>
                  <h4 className="font-bold text-blue-600 lilita-one-regular mb-2 text-sm sm:text-base">
                    Cyber Law
                  </h4>
                  <p className="text-xs sm:text-sm text-white lilita-one-regular">
                    Rules for online behavior
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl mb-2">🟨</div>
                  <h4 className="font-bold text-yellow-600 lilita-one-regular mb-2 text-sm sm:text-base">
                    Consumer & Environment
                  </h4>
                  <p className="text-xs sm:text-sm text-white lilita-one-regular">
                    Protection for buyers and nature
                  </p>
                </div>
              </div>
              <div className="text-center space-y-2 text-sm sm:text-base text-white lilita-one-regular">
                <p>
                  <strong>📱 Drag</strong> statements to the correct category
                </p>
                <p>
                  <strong>⏱️ Beat the clock</strong> for bonus points!
                </p>
                <p>
                  <strong>🌟 Scoring:</strong> +3 correct, -1 wrong, +5 time
                  bonus
                </p>
              </div>
            </div>
          )}

          {/* Instructions overlay */}
          {showInstructions && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <InstructionOverlay onClose={() => setShowInstructions(false)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SortItOut;
