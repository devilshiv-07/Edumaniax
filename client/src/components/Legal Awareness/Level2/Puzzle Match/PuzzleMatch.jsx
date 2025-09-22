import React, { useState, useEffect } from "react";
import { Trophy, Clock, Star, RotateCcw, Info } from "lucide-react";
import { useLaw } from "@/contexts/LawContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getLawNotesRecommendation } from "@/utils/getLawNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const givenTerms = [
  { id: 1, term: "Fundamental Rights", matched: false },
  { id: 2, term: "Child Labour Act", matched: false },
  { id: 3, term: "Cyber Law", matched: false },
  { id: 4, term: "Consumer Rights", matched: false },
  { id: 5, term: "Environment Laws", matched: false },
  { id: 6, term: "Juvenile Justice Act", matched: false },
  { id: 7, term: "POCSO Act", matched: false },
  { id: 8, term: "Right to Equality", matched: false },
  { id: 9, term: "FIR", matched: false },
  { id: 10, term: "RTI Act", matched: false },
  { id: 11, term: "Fundamental Duties", matched: false },
];

const givenDescriptions = [
  {
    id: 1,
    desc: "Everyone can study free till a certain age.",
    hint: "Think about education!",
  },
  {
    id: 2,
    desc: "Protects children from hazardous work.",
    hint: "About kids and work safety!",
  },
  {
    id: 3,
    desc: "Rules about online safety and cyberbullying.",
    hint: "Internet and computers!",
  },
  {
    id: 4,
    desc: "Protects buyers from faulty products.",
    hint: "When you buy something!",
  },
  {
    id: 5,
    desc: "Laws against pollution and protecting nature.",
    hint: "Trees, air, and water!",
  },
  {
    id: 6,
    desc: "Special laws for kids who break the law, focusing on reform.",
    hint: "Helping kids learn from mistakes!",
  },
  {
    id: 7,
    desc: "Law that protects children from sexual abuse.",
    hint: "Keeping children safe!",
  },
  {
    id: 8,
    desc: "Ensures no one is treated unfairly based on religion, caste, or gender.",
    hint: "Everyone is equal!",
  },
  {
    id: 9,
    desc: "A written complaint you file at a police station to start a legal case.",
    hint: "First step at police station!",
  },
  {
    id: 10,
    desc: "Lets you ask the government for official information.",
    hint: "Right to know information!",
  },
  {
    id: 11,
    desc: "Includes respecting the national flag and protecting nature.",
    hint: "Our responsibilities!",
  },
];

const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const PuzzleMatch = () => {
  const { completeLawChallenge } = useLaw();
  const [terms, setTerms] = useState([]);
  const [descriptions, setDescriptions] = useState([]);
  const [spin, setSpin] = useState(false);
  const [gameState, setGameState] = useState("playing"); // playing, completed
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [score, setScore] = useState(0);
  const [draggedItem, setDraggedItem] = useState(null);
  const [matches, setMatches] = useState({});
  const [shakeItem, setShakeItem] = useState(null);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [result, setResult] = useState(null); // "win" | "lose" | null
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    setTerms(shuffleArray(givenTerms));
    setDescriptions(shuffleArray(givenDescriptions));
  }, []);

  useEffect(() => {
    if (gameState === "completed") {
      setSpin(true);
      setTimeout(() => {
        setSpin(false);
      }, 2500);
    }
  }, [gameState]);

  // Track performance after game ends
  useEffect(() => {
    if (gameState === "completed") {
      const endTime = Date.now();
      const timeSpentMillis = endTime - startTime;
      const studyTimeMinutes = Math.round(timeSpentMillis / 60000);

      const totalPlayed = 11; // 11 terms total
      const accuracy = (Object.keys(matches).length / totalPlayed) * 100;
      const avgResponseTimeSec =
        Object.keys(matches).length > 0
          ? timeSpentMillis / Object.keys(matches).length / 1000
          : 0;

      const maxRawScore = totalPlayed * 100 + 180 * 10; // 100 per correct + bonus max
      const scaledScore = Math.min(
        10,
        parseFloat(((score / maxRawScore) * 10).toFixed(2))
      );

      updatePerformance({
        moduleName: "Law",
        topicName: "constitutionalRights",
        score: scaledScore,
        accuracy: parseFloat(accuracy.toFixed(2)),
        avgResponseTimeSec: parseFloat(avgResponseTimeSec.toFixed(2)),
        studyTimeMinutes,
        completed: true,
      });
      setStartTime(Date.now());
    }
  }, [gameState]);

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameState("completed");
    }
  }, [timeLeft, gameState]);

  // Win condition
  useEffect(() => {
    if (Object.keys(matches).length === 11) {
      const bonusPoints = timeLeft * 10;
      setScore((prev) => prev + bonusPoints);
      setResult("win");
      setGameState("completed");
      completeLawChallenge(1, 0);
    }
  }, [matches, timeLeft]);

  // Lose condition (timer ends without full score)
  useEffect(() => {
    if (timeLeft === 0 && Object.keys(matches).length < 11) {
      setResult("lose");
      setGameState("completed");
    }
  }, [timeLeft, matches]);

  useEffect(() => {
    if (gameState !== "completed") return;

    const mistakes = [];

    // Loop through all matches made by player
    Object.entries(matches).forEach(([term, matchedDefinition]) => {
      if (term !== matchedDefinition) {
        mistakes.push({
          text: term,
          placedWith: matchedDefinition,
          correctDefinition: term, // since term === correct definition
        });
      }
    });

    // Find terms the player never matched
    terms.forEach((term) => {
      if (!matches[term]) {
        mistakes.push({
          text: term,
          placedWith: "not matched",
          correctDefinition: term,
        });
      }
    });

    if (mistakes.length > 0) {
      getLawNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [gameState, matches, terms]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleDragStart = (e, term) => {
    setDraggedItem(term);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, description) => {
    e.preventDefault();

    if (!draggedItem || matches[draggedItem.id]) return;

    // Check if correct match
    if (draggedItem.id === description.id) {
      setMatches((prev) => ({ ...prev, [draggedItem.id]: description.id }));
      setScore((prev) => prev + 100);

      // Success animation could be added here
    } else {
      // Wrong match - shake animation
      setShakeItem(description.id);
      setTimeout(() => setShakeItem(null), 1000);
    }

    setDraggedItem(null);
  };

  const resetGame = () => {
    setGameState("playing");
    setTimeLeft(180);
    setScore(0);
    setMatches({});
    setShakeItem(null);
    setStartTime(Date.now());
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
    navigate("/catch-your-rights");
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-4">
        {/* Header */}
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#202F364D] backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white lilita-one-regular flex items-center gap-2">
                <Star className="text-yellow-500" />
                Legal Terms Matching Game
                <Star className="text-yellow-500" />
              </h1>

              <div className="flex items-center gap-4 text-lg font-semibold">
                <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                  <Clock className="text-blue-600" size={20} />
                  <span className="text-blue-800 lilita-one-regular">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                  <Trophy className="text-green-600" size={20} />
                  <span className="text-green-800 lilita-one-regular">
                    {score}
                  </span>
                </div>
                <button
                  onClick={resetGame}
                  className="flex items-center gap-2 bg-orange-100 hover:bg-orange-200 px-4 py-2 rounded-full transition-colors"
                >
                  <RotateCcw className="text-orange-600" size={20} />
                  <span className="text-orange-800 lilita-one-regular">
                    Reset
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Game completed screen */}
          {gameState === "completed" && result === "win" && (
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
                        100%
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
                        🏆 Perfect! You matched all the legal terms correctly!
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
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
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

          {gameState === "completed" && result === "lose" && (
            // LOSE SCREEN
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center flex-1 p-4">
                <img
                  src="/financeGames6to8/game-over-game.gif"
                  alt="Game Over"
                  className="w-48 sm:w-64 h-auto mb-4"
                />
                <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                  Oops! Time’s up! You couldn’t match all terms. Wanna retry?
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
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
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

          {/* Game Board */}
          {gameState === "playing" && (
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Left side - Terms */}
              <div className="bg-[#202F364D] backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-white lilita-one-regular mb-6 text-center">
                  Legal Terms
                </h2>
                <div className="space-y-3">
                  {terms.map((term) => (
                    <div
                      key={term.id}
                      draggable={!matches[term.id]}
                      onDragStart={(e) => handleDragStart(e, term)}
                      className={`p-4 rounded-xl font-semibold text-center cursor-move transition-all duration-300 ${
                        matches[term.id]
                          ? "bg-green-200 text-green-800 lilita-one-regular opacity-50 cursor-not-allowed"
                          : "bg-[#3673904d] text-white lilita-one-regular hover:shadow-lg hover:scale-105"
                      }`}
                    >
                      {term.term}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side - Descriptions */}
              <div className="bg-[#202F364D] backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-white lilita-one-regular mb-6 text-center">
                  Descriptions
                </h2>
                <div className="space-y-3">
                  {descriptions.map((desc) => (
                    <div
                      key={desc.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, desc)}
                      className={`p-4 rounded-xl border-2 border-dashed transition-all duration-300 ${
                        Object.values(matches).includes(desc.id)
                          ? "bg-[#1e607e4d] border-green-300 text-white lilita-one-regular"
                          : shakeItem === desc.id
                          ? "bg-[#a3b6be4d] border-red-300 text-white lilita-one-regular animate-pulse"
                          : "bg-[#1e607e4d] border-blue-300 text-white lilita-one-regular hover:bg-[#289cd24d]"
                      } ${shakeItem === desc.id ? "animate-shake" : ""}`}
                    >
                      <p className="text-center font-medium lilita-one-regular">
                        {desc.desc}
                      </p>
                      {shakeItem === desc.id && (
                        <p className="text-center text-sm text-white mt-2 lilita-one-regular italic">
                          💡 Hint: {desc.hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}

        <style jsx>{`
          @keyframes shake {
            0%,
            100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-5px);
            }
            75% {
              transform: translateX(5px);
            }
          }
          .animate-shake {
            animation: shake 0.6s ease-in-out;
          }
        `}</style>
      </div>
    </>
  );
};

export default PuzzleMatch;
