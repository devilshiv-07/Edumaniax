import React, { useState, useEffect, useRef, useCallback } from "react";
import { Heart, Star, Zap, Trophy, RotateCcw, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { useLaw } from "@/contexts/LawContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { useNavigate } from "react-router-dom";
import { getLawNotesRecommendation } from "@/utils/getLawNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const CatchYourRightsGame = () => {
  const { completeLawChallenge } = useLaw();
  const [gameState, setGameState] = useState("menu"); // menu, playing, paused, gameOver, completed
  const [level, setLevel] = useState(2);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [fallingItems, setFallingItems] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(2000);
  const [streak, setStreak] = useState(0);
  const [powerUps, setPowerUps] = useState({ slowTime: 0, autoSort: 0 });
  const [slowTimeActive, setSlowTimeActive] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [levelStatements, setLevelStatements] = useState([]);
  const [usedStatements, setUsedStatements] = useState(new Set());
  const [correctlySorted, setCorrectlySorted] = useState(0);
  const gameAreaRef = useRef(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [isTabVisible, setIsTabVisible] = useState(true);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (gameState === "completed" || gameState === "gameOver") {
      const endTime = Date.now();
      const timeSpentMillis = endTime - startTime;
      const studyTimeMinutes = Math.round(timeSpentMillis / 60000);
      const totalPlayed = 10;
      const avgResponseTimeSec =
        correctlySorted > 0 ? timeSpentMillis / correctlySorted / 1000 : 0;

      const scaledScore = Math.min(
        10,
        parseFloat(((score / (totalPlayed * 3)) * 10).toFixed(2))
      );

      updatePerformance({
        moduleName: "Law",
        topicName: "constitutionalRights",
        score: scaledScore,
        accuracy: scaledScore * 10,
        avgResponseTimeSec: parseFloat(avgResponseTimeSec.toFixed(2)),
        studyTimeMinutes,
        completed: gameState === "completed",
      });
      setStartTime(Date.now());
    }
  }, [gameState]);

  const statements = {
    rights: [
      { id: 1, text: "You can speak your opinion freely", category: "rights" },
      {
        id: 2,
        text: "You have the right to go to school till age 14",
        category: "rights",
      },
      {
        id: 3,
        text: "No one can treat you unfairly for your caste or religion",
        category: "rights",
      },
      {
        id: 4,
        text: "You can follow any religion you choose",
        category: "rights",
      },
      { id: 5, text: "You can move freely across India", category: "rights" },
    ],
    duties: [
      { id: 6, text: "Defend the country if needed", category: "duties" },
      { id: 7, text: "Promote harmony among all citizens", category: "duties" },
      {
        id: 8,
        text: "Treat women with respect and equality",
        category: "duties",
      },
      { id: 9, text: "Protect public property", category: "duties" },
      { id: 10, text: "Develop a scientific temper", category: "duties" },
    ],
    laws: [
      {
        id: 11,
        text: "No child below 14 can work in a factory",
        category: "laws",
      },
      {
        id: 12,
        text: "Polluting rivers and cutting trees is punishable",
        category: "laws",
      },
      {
        id: 13,
        text: "Fake online accounts can lead to legal trouble",
        category: "laws",
      },
      { id: 14, text: "Using pirated apps is illegal", category: "laws" },
      {
        id: 15,
        text: "Misleading ads are against consumer rights",
        category: "laws",
      },
    ],
  };

  const getAllStatements = () => {
    return [...statements.rights, ...statements.duties, ...statements.laws];
  };

  const getRandomStatements = (count) => {
    const all = getAllStatements();
    const shuffled = [...all].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const startGame = () => {
    setLevel(2);
    setGameState("playing");
    setScore(0);
    setLives(3);
    setFallingItems([]);
    setStreak(0);
    setGameSpeed(2000);
    setPowerUps({ slowTime: 0, autoSort: 0 });
    setSlowTimeActive(false);
    setUsedStatements(new Set());
    setCorrectlySorted(0);

    // Set level-specific statements
    const statements = getRandomStatements(10);
    setLevelStatements(statements);
  };

  const spawnItem = useCallback(() => {
    if (gameState !== "playing") return;

    if (usedStatements.size >= levelStatements.length) {
      return;
    }

    const unusedStatements = levelStatements.filter(
      (stmt) => !usedStatements.has(stmt.id)
    );
    if (unusedStatements.length === 0) {
      // No more to spawn; outcome will be decided after remaining items resolve
    }

    const randomStatement =
      unusedStatements[Math.floor(Math.random() * unusedStatements.length)];

    // Get responsive item width for proper positioning
    const screenWidth = window.innerWidth;
    const itemWidth =
      screenWidth < 480
        ? 150
        : screenWidth < 640
        ? 170
        : screenWidth < 768
        ? 200
        : screenWidth < 1024
        ? 240
        : 250;

    const newItem = {
      id: Date.now() + Math.random(),
      ...randomStatement,
      x: Math.random() * (window.innerWidth - itemWidth - 150), // Added extra margin
      y: -100,
      speed: slowTimeActive ? 0.5 : Math.max(1, 3 - score / 500),
    };

    setFallingItems((prev) => [...prev, newItem]);
    setUsedStatements((prev) => new Set([...prev, randomStatement.id]));
  }, [gameState, levelStatements, usedStatements, score, slowTimeActive]);

  const updateItems = useCallback(() => {
    if (gameState !== "playing" || !isTabVisible) return; // Add !isTabVisible check

    setFallingItems((prev) => {
      const updatedItems = prev
        .map((item) => ({
          ...item,
          y: item.y + item.speed,
        }))
        .filter((item) => {
          if (item.y > window.innerHeight) {
            // Item hit the ground
            setLives((prevLives) => {
              const newLives = prevLives - 1;
              if (newLives <= 0) {
                setGameState("gameOver");
              }
              return newLives;
            });
            setScore((prev) => Math.max(0, prev - 2));
            setStreak(0);
            return false;
          }
          return true;
        });

      // Rest of your existing logic remains the same...
      setTimeout(() => {
        if (
          usedStatements.size >= levelStatements.length &&
          updatedItems.length === 0
        ) {
          // End-of-pool evaluation
          if (level === 1) {
            const requiredCorrect = 6;
            if (correctlySorted >= requiredCorrect) {
              setGameState("completed");
            } else if (lives > 0) {
              const remainingStatements =
                levelStatements.length - usedStatements.size;
              const maxPossibleCorrect = correctlySorted + remainingStatements;
              if (maxPossibleCorrect < requiredCorrect) {
                setGameState("gameOver");
              }
            }
          } else if (level === 2) {
            const requiredScore = 18; // 18/30
            if (score >= requiredScore) {
              setGameState("completed");
            } else if (lives > 0) {
              setGameState("gameOver");
            }
          }
        }
      }, 0);

      return updatedItems;
    });
  }, [
    gameState,
    isTabVisible, // Add this to dependencies
    usedStatements,
    levelStatements,
    level,
    correctlySorted,
    lives,
  ]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") return;

    const gameLoop = setInterval(updateItems, 50);
    const spawnLoop = setInterval(spawnItem, gameSpeed);

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawnLoop);
    };
  }, [gameState, gameSpeed, updateItems, spawnItem]);

  // Speed increase
  useEffect(() => {
    const newSpeed = Math.max(800, 2000 - score / 10);
    setGameSpeed(newSpeed);
  }, [score]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Intro screen auto-hide
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (gameState !== "gameOver") return;

    const mistakes = [];

    // Mistakes are items the player sorted wrong
    const wrongOnes = Array.from(usedStatements)
      .map((id) => levelStatements.find((s) => s.id === id))
      .filter(
        (stmt) =>
          stmt && // valid
          // Check if this statement was not correctly sorted
          !fallingItems.find((item) => item.id === stmt.id) &&
          // (optional) low score means it's likely wrong
          score < 18
      );

    wrongOnes.forEach((stmt) => {
      mistakes.push({
        text: stmt.text,
        selectedOption: "Wrong category",
        correctAnswer: stmt.category,
      });
    });

    if (mistakes.length > 0) {
      getLawNotesRecommendation(mistakes).then((notes) => {
        setRecommendedNotes(notes);
      });
    }
  }, [gameState]);

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, category) => {
    e.preventDefault();

    if (!draggedItem) return;

    const isCorrect = draggedItem.category === category;

    if (isCorrect) {
      setScore((prev) => prev + 3);
      setCorrectlySorted((prev) => prev + 1);
      setStreak((prev) => {
        const newStreak = prev + 1;
        // Award power-ups for streaks
        if (newStreak % 5 === 0) {
          setPowerUps((prev) => ({
            ...prev,
            slowTime: prev.slowTime + 1,
            autoSort: prev.autoSort + 1,
          }));
        }
        return newStreak;
      });
    } else {
      setScore((prev) => Math.max(0, prev - 2));
      setStreak(0);
    }

    // Remove the item from falling items
    setFallingItems((prev) =>
      prev.filter((item) => item.id !== draggedItem.id)
    );
    setDraggedItem(null);

    // ✅ Check level completion (only 1 level now, 10 questions)
    const targetCount = 10;

    if (isCorrect && correctlySorted + 1 >= targetCount) {
      setGameState("completed");
      completeLawChallenge(1, 1); // still marks challenge completion
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const usePowerUp = (type) => {
    if (powerUps[type] <= 0) return;

    setPowerUps((prev) => ({ ...prev, [type]: prev[type] - 1 }));

    if (type === "slowTime") {
      setSlowTimeActive(true);
      setTimeout(() => setSlowTimeActive(false), 5000);
    } else if (type === "autoSort") {
      // Auto-sort the next falling item
      if (fallingItems.length > 0) {
        const item = fallingItems[0];
        setScore((prev) => prev + 3);
        setCorrectlySorted((prev) => prev + 1);
        setFallingItems((prev) => prev.filter((i) => i.id !== item.id));
        setStreak((prev) => prev + 1);

        // Check completion after auto-sort
        const targetCount = 10;
        if (correctlySorted + 1 >= targetCount) {
          setGameState("completed");
          completeLawChallenge(1, 1);
        }
      }
    }
  };

  const getTitle = () => {
    if (score >= 100) return "Legal Prodigy 🏆";
    if (score >= 50) return "Duty Master ⭐";
    if (score >= 20) return "Right Defender 🛡️";
    return "Legal Learner 📚";
  };

  const resetGame = () => {
    setGameState("menu");
    setScore(0);
    setLives(3);
    setLevel(1);
    setFallingItems([]);
    setStreak(0);
    setPowerUps({ slowTime: 0, autoSort: 0 });
    setSlowTimeActive(false);
    setLevelStatements([]);
    setUsedStatements(new Set());
    setCorrectlySorted(0);
    setStartTime(Date.now());
  };

  const getResponsiveItemSize = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 480) return { width: "150px", fontSize: "text-xs" };
    if (screenWidth < 640) return { width: "170px", fontSize: "text-xs" }; // Mobile
    if (screenWidth < 768) return { width: "200px", fontSize: "text-lg" }; // Small tablet
    if (screenWidth < 1024) return { width: "240px", fontSize: "text-lg" }; // Tablet
    return { width: "250px", fontSize: "text-lg" }; // Desktop
  };

  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  if (showIntro) {
    return <IntroScreen />;
  }

  return (
    <>
      <GameNav />
      <div
        className="min-h-screen p-5 pt-20 md:pt-50 pb-28 bg-[#0A160E] overflow-hidden rounded-2xl"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        {/* Menu Screen */}
        {gameState === "menu" && (
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-[#202F364D] border border-white backdrop-blur-sm rounded-3xl shadow-2xl p-8 text-center max-w-3xl w-full">
              <div className="text-6xl mb-4">⚖️</div>
              <h1 className="text-lg lg:text-3xl font-bold text-white lilita-one-regular mb-4">
                Catch Your Rights!
              </h1>
              <p className="text-lg lg:text-xl text-white lilita-one-regular mb-6">
                Sort falling legal statements into the correct categories before
                they hit the ground!
              </p>

              <div className="text-left bg-white/80 rounded-xl p-4 shadow-inner text-gray-800 mb-6 space-y-3">
                <h2 className="text-sm lg:text-lg font-bold text-purple-700 lilita-one-regular">
                  ⏱ Scoring + Bonus:
                </h2>
                <ul className="text-sm lg:text-lg lilita-one-regular list-disc list-inside space-y-1">
                  <li>
                    <span className=" text-green-600">+3 points</span> for
                    correct placement.
                  </li>
                  <li>
                    <span className=" text-red-500">-2 points</span> for wrong
                    drop or if it hits the ground.
                  </li>
                  <li>
                    <span className=" text-red-500">Total 3 </span> Lives.
                  </li>
                  <li>
                    <span className=" text-red-500">-1 Life</span> if item hits
                    the ground.
                  </li>
                </ul>

                <h2 className="text-sm lg:text-lg lilita-one-regular text-yellow-600 mt-4">
                  ⚡ Power-ups:
                </h2>
                <p className="text-sm lg:text-lg lilita-one-regular">
                  Earn “<span className="">Slow Time</span>” or “
                  <span className="">Auto-Categorize</span>” by keeping a streak
                  going!
                </p>

                <h2 className="text-sm lg:text-lg  font-bold text-blue-600 mt-4 lilita-one-regular ">
                  🏆 Titles to Earn:
                </h2>
                <p className="text-sm lg:text-lg lilita-one-regular">
                  Unlock fun titles like “
                  <span className="italic font-md">Right Defender</span>”, “
                  <span className="italic font-md">Duty Master</span>”, and “
                  <span className="italic font-md">Legal Prodigy</span>” as you
                  play!
                </p>
                <p className="text-sm lg:text-lg lilita-one-regular">
                  This game is best experienced on a large-screen device.
                </p>
              </div>

              <div className="space-y-4">
                <button
                  onClick={startGame}
                  className="w-full text-sm lg:text-lg lilita-one-regular bg-gradient-to-r from-orange-400 to-red-500 text-white font-bold py-4 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Start Challenge (10 statements)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Screen */}
        {gameState === "playing" && (
          <div ref={gameAreaRef} className="relative h-screen ">
            {/* Header */}
            <div className="bg-[#202F364D] backdrop-blur-sm p-4">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Trophy className="text-yellow-400" size={20} />
                    <span className="lilita-one-regular">{score}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Heart
                        key={i}
                        className={`${
                          i < lives
                            ? "text-red-500 fill-current"
                            : "text-gray-400"
                        }`}
                        size={20}
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm lilita-one-regular lg:text-lg font-bold">
                    Level {level}
                  </div>
                  <div className="text-sm lilita-one-regular lg:text-lg">
                    {getTitle()}
                  </div>
                  <div className="text-xs lg:text-lg lilita-one-regular hidden md:block mt-1">
                    Sorted: {correctlySorted}/10
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full">
                    <Zap className="text-orange-400" size={16} />
                    <span className="text-sm">{streak}</span>
                  </div>
                  <button
                    onClick={() => setGameState("paused")}
                    className="bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <Pause size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Power-ups */}
            <div className="absolute top-20 right-4 space-y-2 z-20">
              <button
                onClick={() => usePowerUp("slowTime")}
                disabled={powerUps.slowTime <= 0}
                className={`flex items-center mt-12 gap-2 px-3 py-2 rounded-full text-sm lg:text-lg font-bold transition-all ${
                  powerUps.slowTime > 0
                    ? "bg-blue-500 text-white hover:bg-blue-600 transform hover:scale-105"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                <Zap size={16} />
                Slow Time ({powerUps.slowTime})
              </button>
              <button
                onClick={() => usePowerUp("autoSort")}
                disabled={powerUps.autoSort <= 0}
                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm lg:text-lg font-bold transition-all ${
                  powerUps.autoSort > 0
                    ? "bg-green-500 text-white hover:bg-green-600 transform hover:scale-105"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                <Star size={16} />
                Auto-Sort ({powerUps.autoSort})
              </button>
            </div>

            {/* Falling Items */}
            {fallingItems.map((item) => {
              const itemSize = getResponsiveItemSize();
              const itemWidth = parseInt(itemSize.width);

              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  className={`absolute bg-white/90 backdrop-blur-sm p-3 md:p-4 rounded-xl shadow-lg cursor-move transform hover:scale-105 transition-all border-4  border-sky-300 ${
                    slowTimeActive ? "animate-pulse" : ""
                  }`}
                  style={{
                    left: `${item.x}px`, // Prevent overflow

                    // left: `${Math.min(
                    //   item.x,
                    //   window.innerWidth - itemWidth - 50
                    // )}px`, // Prevent overflow

                    top: `${item.y}px`,
                    width: itemSize.width,
                    zIndex: 10,
                  }}
                >
                  <p
                    className={`${itemSize.fontSize} font-semibold lilita-one-regular text-gray-800`}
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}

            {/* Drop Zones */}
            <div className="absolute bottom-10 left-0 right-0 grid grid-cols-3 gap-4">
              <div
                onDrop={(e) => handleDrop(e, "rights")}
                onDragOver={handleDragOver}
                className=" bg-blue-500/80 backdrop-blur-sm rounded-xl p-6 text-white font-bold border-2 border-dashed border-blue-300 hover:bg-blue-600/80 transition-colors"
              >
                <div className="text-2xl text-center mb-2">🗽</div>
                <div className="text-sm lg:text-lg lilita-one-regular text-outline text-center wrap-break-word">
                  Fundamental Rights
                </div>
              </div>

              <div
                onDrop={(e) => handleDrop(e, "duties")}
                onDragOver={handleDragOver}
                className="flex-1 bg-green-500/80 backdrop-blur-sm rounded-xl p-6 text-center text-white font-bold border-2 border-dashed border-green-300 hover:bg-green-600/80 transition-colors"
              >
                <div className="text-2xl mb-2">🤝</div>
                <div className="text-sm lilita-one-regular text-outline lg:text-lg wrap-break-word">
                  Fundamental Duties
                </div>
              </div>

              <div
                onDrop={(e) => handleDrop(e, "laws")}
                onDragOver={handleDragOver}
                className="flex-1 bg-orange-500/80 backdrop-blur-sm rounded-xl p-6 text-center text-white font-bold border-2 border-dashed border-orange-300 hover:bg-orange-600/80 transition-colors"
              >
                <div className="text-2xl mb-2">⚖️</div>
                <div className="text-sm lg:text-lg lilita-one-regular text-outline wrap-break-word">
                  Laws
                </div>
              </div>
            </div>

            {slowTimeActive && (
              <div className="absolute lilita-one-regular top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500/90 text-white px-6 py-3 rounded-full font-bold animate-pulse">
                ⏱️ SLOW TIME ACTIVE!
              </div>
            )}
          </div>
        )}

        {/* Paused Screen */}
        {gameState === "paused" && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
            <div className="bg-[#202F364D] border border-white rounded-3xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white lilita-one-regular mb-6">
                Game Paused
              </h2>
              <div className="space-y-4">
                <button
                  onClick={() => setGameState("playing")}
                  className="bg-green-500 lilita-one-regular text-outline hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto"
                >
                  <Play size={20} className="text-outline" />
                  Resume
                </button>
                <button
                  onClick={resetGame}
                  className="bg-gray-500 lilita-one-regular text-outline hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 mx-auto"
                >
                  <RotateCcw size={20} className="text-outline" />
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ WIN / LOSE SCREENS */}
        {gameState === "completed" ? (
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
                  <div className="bg-[#131F24] flex-1 rounded-xl flex items-center justify-center py-3 px-5 w-full">
                    <img
                      src="/financeGames6to8/accImg.svg"
                      alt="Target Icon"
                      className="w-8 h-8 mr-2"
                    />
                    <span className="text-[#09BE43] text-3xl font-extrabold">
                      {Math.round((score / 30) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Insight Box */}
                <div className="mt-4 sm:mt-0 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                  <p className="text-black text-sm font-bold mb-1 mt-2">
                    INSIGHT
                  </p>
                  <div className="bg-[#131F24] flex-1 rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
                    <p
                      className="text-[#FFCC00] font-bold leading-relaxed"
                      style={{
                        fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {score === 60
                        ? "🏆 Perfect! You nailed every answer!"
                        : "🌟 Great job! You're on your way to being a Legal Eagle!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
              <img
                src="/financeGames6to8/retry.svg"
                alt="Retry"
                onClick={resetGame}
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
        ) : gameState === "gameOver" ? (
          // LOSE SCREEN
          <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
            <div className="flex flex-col items-center justify-center flex-1 p-4">
              <img
                src="/financeGames6to8/game-over-game.gif"
                alt="Game Over"
                className="w-48 sm:w-64 h-auto mb-4"
              />
              <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                Oops! Your score was below 18 or you wasted your lives. Wanna
                retry?
              </p>

              {/* Suggested Notes */}
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
                        navigate(`/law/notes?grade=6-8&section=${note.topicId}`)
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
                onClick={handleNextChallenge}
                className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
              />
            </div>
          </div>
        ) : null}

        {/* ✅ Popup */}
        <LevelCompletePopup
          isOpen={isPopupVisible}
          onConfirm={() => {
            setIsPopupVisible(false);
            navigate("/case-hear"); // your next level
          }}
          onCancel={() => {
            setIsPopupVisible(false);
            navigate("/law/games"); // or exit route
          }}
          onClose={() => setIsPopupVisible(false)}
          title="Challenge Complete!"
          message="Are you ready for the next challenge?"
          confirmText="Next Challenge"
          cancelText="Exit"
        />

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}
      </div>
    </>
  );
};

export default CatchYourRightsGame;
