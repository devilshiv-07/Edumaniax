import React, { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import { useDM } from "@/contexts/DMContext";
import GameNav from "./GameNav";
import IntroScreen from "./IntroScreen";
import InstructionOverlay from "./InstructionOverlay";
import LevelCompletePopup from "@/components/LevelCompletePopup";

const brands = [
  { id: "b1", name: "Sports Shoes" },
  { id: "b2", name: "Ice Cream" },
  { id: "b3", name: "Bookstore" },
  { id: "b4", name: "Toy Company" },
  { id: "b5", name: "Mobile Game App" },
];

const options = [
  { id: "o1", label: "Behind-the-scenes video of shoe making" },
  { id: "o2", label: "Poll: 'Pick your fave flavour 👋'" },
  { id: "o3", label: "Reel: '3 books to read before you turn 13'" },
  { id: "o4", label: "Meme: 'When your toy breaks on Day 1 🤯'" },
  { id: "o5", label: "Highlight video of cool gameplay moments 🎮" },
];

const correctMatches = {
  b1: "o1", // Sports Shoes -> Behind-the-scenes video
  b2: "o2", // Ice Cream -> Poll
  b3: "o3", // Bookstore -> Reel
  b4: "o4", // Toy Company -> Meme
  b5: "o5", // Mobile Game App -> Highlight video
};

function getRandomIndices(n, max) {
  const indices = Array.from({ length: max }, (_, i) => i);
  const shuffled = indices.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

const listOfIndices = getRandomIndices(4, brands.length); // use 3 or 4 or 5 as needed

const availBrands = listOfIndices.map((i) => brands[i]);

const availOptions = options.filter((option) =>
  availBrands.some((brand) => correctMatches[brand.id] === option.id)
);

export default function MatchingGame() {
  // All hooks must be called at the top level, before any conditional returns
  const { completeDMChallenge } = useDM();
  const { updatePerformance } = usePerformance(); //for performance
  const navigate = useNavigate();
  
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingGame, setLoadingGame] = useState(false);
  const [remainingBrands, setRemainingBrands] = useState(availBrands);
  const [remainingOptions, setRemainingOptions] = useState(availOptions);
  const [matches, setMatches] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  const [showInstructionOverlay, setShowInstructionOverlay] = useState(false);
  const [showWinView, setShowWinView] = useState(false);
  const [showLoseView, setShowLoseView] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [showLevelCompletePopup, setShowLevelCompletePopup] = useState(false);
  
  const canvasRef = useRef(null);
  
  const initGame = () => {
    try {
      const indices = getRandomIndices(4, brands.length);
      const newAvailBrands = indices.map((i) => brands[i]);
      const newAvailOptions = options.filter((option) =>
        newAvailBrands.some((brand) => correctMatches[brand.id] === option.id)
      );
      setSelectedBrand(null);
      setMatches([]);
      setRemainingBrands(newAvailBrands);
      setRemainingOptions(newAvailOptions);
      setShowWinView(false);
      setShowLoseView(false);
      setChallengeCompleted(false);
      setStartTime(Date.now());
    } catch (e) {
      console.log("Error initializing game", e);
    }
  };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Show instruction overlay automatically when game loads (after intro)
  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        setShowInstructionOverlay(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Initialize game data
  useEffect(() => {
    setLoadingGame(true);
    try {
      initGame();
    } catch (e) {
      console.log("Error loading Game", e);
    } finally {
      setLoadingGame(false);
    }
  }, []);

  // Check for game completion
  useEffect(() => {
    if (remainingBrands?.length > 0) return;

    setLoading(true);
    const timer = setTimeout(() => {
      const total = matches.length;
      const correct = matches.filter((m) => m.isCorrect).length;
      const scaledScore = Math.round((correct / Math.max(total, 1)) * 10); // scale out of 10
      const accuracy = Math.round((correct / Math.max(total, 1)) * 100);
      const timeTakenSec = Math.floor((Date.now() - startTime) / 1000);

      // Mark challenge complete once
      if (!challengeCompleted) {
        completeDMChallenge(1, 2);
        setChallengeCompleted(true);
      }

      updatePerformance({
        moduleName: "DigitalMarketing",
        topicName: "contentStrategist",
        score: scaledScore,
        accuracy,
        avgResponseTimeSec: timeTakenSec,
        studyTimeMinutes: Math.ceil(timeTakenSec / 60),
      });

      setLoading(false);
      if (total > 0 && correct === total) {
        setShowWinView(true);
        handleConfetti();
      } else {
        setShowLoseView(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [remainingBrands, matches, challengeCompleted, completeDMChallenge, updatePerformance, startTime]);

  // Early return after all hooks have been called
  if (showIntro) {
    return <IntroScreen />;
  }

  const handleOptionSelect = (option) => {
    if (!selectedBrand) return;

    const isCorrect = correctMatches[selectedBrand.id] === option.id;

    setMatches((prev) => [
      ...prev,
      {
        brand: selectedBrand,
        option,
        isCorrect,
      },
    ]);

    setRemainingBrands((prev) => prev.filter((b) => b.id !== selectedBrand.id));
    setRemainingOptions((prev) => prev.filter((o) => o.id !== option.id));
    setSelectedBrand(null);
  };

  const handleConfetti = () => {
    const myCanvas = canvasRef.current;
    if (myCanvas) {
      const myConfetti = confetti.create(myCanvas, {
        resize: true,
        useWorker: true,
      });

      const defaults = {
        spread: 360,
        ticks: 50,
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
      };

      const shoot = () => {
        myConfetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ["star"] });
        myConfetti({ ...defaults, particleCount: 30, scalar: 0.75, shapes: ["circle"] });
      };

      // Confetti bursts
      setTimeout(shoot, 0);
      setTimeout(shoot, 100);
      setTimeout(shoot, 300);
      setTimeout(shoot, 500);
      setTimeout(shoot, 700);
    }
  };

  const handleRetryChallenge = () => {
    // reset to initial state and reinitialize a fresh board
    setShowLevelCompletePopup(false);
    initGame();
  };

  const handleNextChallenge = () => {
    setShowLevelCompletePopup(true);
  };

  const handleViewFeedback = () => {
    console.log("Open feedback modal or page");
  };

  const handleLevelCompleteConfirm = () => {
    setShowLevelCompletePopup(false);
    navigate("/ad-campaigner-intro");
  };

  const handleLevelCompleteCancel = () => {
    setShowLevelCompletePopup(false);
  };

  const handleLevelCompleteClose = () => {
    setShowLevelCompletePopup(false);
  };

  // WIN VIEW
  if (showWinView) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        <div className="flex flex-col items-center justify-center flex-1 p-6">
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
          <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
            🏅 Badge Earned: ✨ Content Matcher
          </h2>
          <p className="text-xl text-white mt-2">🎉 Great job! You matched all the content perfectly!</p>
        </div>

        <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
          <img
            src="/financeGames6to8/feedback.svg"
            alt="Feedback"
            onClick={handleViewFeedback}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/retry.svg"
            alt="Retry Challenge"
            onClick={handleRetryChallenge}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/next-challenge.svg"
            alt="Next Challenge"
            onClick={handleNextChallenge}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Level Complete Popup visible on win screen */}
        <LevelCompletePopup
          isOpen={showLevelCompletePopup}
          onConfirm={handleLevelCompleteConfirm}
          onCancel={handleLevelCompleteCancel}
          onClose={handleLevelCompleteClose}
          title="🎉 Congratulations! You completed Level 2!"
          message="You've mastered all the Digital Marketing challenges! Ready for the next one?"
          confirmText="Next Challenge"
          cancelText="Stay Here"
        />
      </div>
    );
  }

  // LOSE VIEW
  if (showLoseView) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <img
              src="/financeGames6to8/game-over-game.gif"
              alt="Game Over"
              className="w-48 sm:w-64 h-auto mb-4"
            />
          </div>
          <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-2 text-center">
            Oops! Not all matches were correct.
          </h2>
          <p className="text-white mt-2 text-center text-base sm:text-lg">
            Try again to match each brand with the best content type.
          </p>
        </div>

        <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
          <img
            src="/financeGames6to8/retry.svg"
            alt="Retry Challenge"
            onClick={handleRetryChallenge}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/feedback.svg"
            alt="Feedback"
            onClick={handleViewFeedback}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/next-challenge.svg"
            alt="Next Challenge"
            onClick={handleNextChallenge}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Level Complete Popup visible on lose screen as well */}
        <LevelCompletePopup
          isOpen={showLevelCompletePopup}
          onConfirm={handleLevelCompleteConfirm}
          onCancel={handleLevelCompleteCancel}
          onClose={handleLevelCompleteClose}
          title="Proceed to Next Challenge?"
          message="You can retry now or continue to the next challenge."
          confirmText="Next Challenge"
          cancelText="Stay Here"
        />
      </div>
    );
  }


  if (loadingGame) {
    return (
      <div className="w-full h-full flex justify-center">
        <div className="flex flex-col items-center justify-center mt-6 text-base md:text-lg font-bold text-purple-800">
          <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-t-pink-300 border-yellow-300 rounded-full animate-spin"></div>
          <div className="mt-4">Loading Game</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full min-h-screen pt-20 md:pt-45 pb-20 bg-[#0A160E] mx-auto px-4 md:px-6"
      style={{ fontFamily: "'Comic Neue', cursive" }}
    >
      <GameNav />
      
      {/* Instruction Overlay */}
      {showInstructionOverlay && (
        <InstructionOverlay onClose={() => setShowInstructionOverlay(false)} />
      )}
      
      <div className="p-4 md:p-6 min-h-[80vh] rounded-2xl shadow-2xl bg-gradient-to-br from-[#6f8775] to-[#85a997] relative">
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        <div className="flex flex-col items-center gap-4 mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-purple-800 animate-pulse">
            🎯 Match the Brands!
          </h1>
          
          <button
            onClick={() => setShowInstructionOverlay(true)}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-2 rounded-full text-sm hover:scale-105 transition duration-300 shadow-lg"
          >
            📖 How to Play
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Brands */}
          <div>
            <h2 className="text-base lg:text-xl text-center font-semibold mb-3 text-blue-600">
              Brand
            </h2>
            {remainingBrands.map((brand, index) => {
              const floatClass = `float${(index % 4) + 1}`;
              return (
                <div
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand)}
                  className={`floating-card ${floatClass} cursor-pointer p-3 md:p-4 rounded-xl mb-4 shadow-md text-center text-sm md:text-base font-medium
                ${selectedBrand?.id === brand.id
                      ? "bg-blue-300 text-white"
                      : "bg-blue-100 hover:bg-blue-200"
                    }`}
                >
                  {brand.name}
                </div>
              );
            })}
          </div>

          {/* Options */}
          <div>
            <h2 className="text-base lg:text-xl text-center font-semibold mb-3 text-pink-600">
              Options for Best Content Type (Match 1)
            </h2>
            {remainingOptions.map((option, index) => {
              const floatClass = `float${(index % 4) + 1}`;
              return (
                <div
                  key={option.id}
                  onClick={() => handleOptionSelect(option)}
                  className={`floating-card ${floatClass} cursor-pointer p-3 md:p-4 rounded-xl mb-4 bg-pink-100 hover:bg-pink-200 text-sm md:text-base shadow-md text-center font-medium`}
                >
                  {option.label}
                </div>
              );
            })}
          </div>

          {/* Results */}
          <div>
            <h2 className="text-base lg:text-xl text-center font-semibold mb-3 text-green-700">
              Your Matches
            </h2>
            {matches.map((pair, index) => {
              const floatClass = `float${(index % 4) + 1}`;
              return (
                <div
                  key={index}
                  className={`floating-card ${floatClass} p-3 md:p-4 mb-4 text-sm md:text-base rounded-xl shadow text-white text-center font-medium
                ${pair.isCorrect ? "bg-green-500" : "bg-red-500"}`}
                >
                  {pair.brand.name} ➡️ {pair.option.label}
                </div>
              );
            })}
          </div>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center mt-6 text-base md:text-lg font-bold text-purple-800">
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-t-pink-300 border-yellow-300 rounded-full animate-spin"></div>
            <div className="mt-4">Fetching results</div>
          </div>
        )}
      </div>

      {/* Level Complete Popup */}
      <LevelCompletePopup
        isOpen={showLevelCompletePopup}
        onConfirm={handleLevelCompleteConfirm}
        onCancel={handleLevelCompleteCancel}
        onClose={handleLevelCompleteClose}
        title="🎉 Congratulations! You completed Level 2!"
        message="You've mastered all the Digital Marketing challenges! Ready to explore more exciting topics?"
        confirmText="Continue Learning"
        cancelText="Stay Here"
      />
    </div>
  );
}
