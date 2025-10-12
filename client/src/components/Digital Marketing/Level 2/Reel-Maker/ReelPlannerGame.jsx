import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useDM } from "@/contexts/DMContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import GameNav from "./GameNav";
import IntroScreen from "./IntroScreen";
import InstructionOverlay from "./InstructionOverlay";
import { useNavigate } from "react-router-dom";

const musicOptions = [
  "🎆 Festive",
  "💥 Boom",
  "🎶 Sweet Melody",
  "🔥 Drum Beat",
];
const emotionOptions = ["🥳 Excitement", "😍 Love", "😂 Fun", "😲 Surprise"];

export default function ReelPlannerGame() {
  // All hooks must be called at the top level, before any conditional returns
  const { completeDMChallenge } = useDM();
  const { updatePerformance } = usePerformance(); //for performance
  const navigate = useNavigate();
  
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [story, setStory] = useState(["", "", ""]);
  const [showExamples, setShowExamples] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState("");
  const [screenText, setScreenText] = useState("");
  const [selectedEmotion, setSelectedEmotion] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showInstructionOverlay, setShowInstructionOverlay] = useState(false);
  const [showWinView, setShowWinView] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  
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

  // Scroll to preview when shown
  useEffect(() => {
    if (!showPreview || !previewRef || !previewRef?.current) {
      return;
    }

    previewRef?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [showPreview, previewRef]);

  // Early return after all hooks have been called
  if (showIntro) {
    return <IntroScreen />;
  }
  const validClick = () => {
    if (
      story.every((part) => part) &&
      selectedMusic &&
      screenText &&
      selectedEmotion
    ) {
      return true;
    }
    return false;
  };

  const handleConfetti = () => {
    const myCanvas = canvasRef.current;
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
      myConfetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      myConfetti({
        ...defaults,
        particleCount: 30,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 300);
    setTimeout(shoot, 500);
    setTimeout(shoot, 700);
  };

  const handleClick = () => {
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    setLoading(true);

    // ✅ Mark challenge complete once
    if (!challengeCompleted) {
      completeDMChallenge(1, 1);
      setChallengeCompleted(true);

      const timeTakenSec = Math.floor((Date.now() - startTime) / 1000);
      updatePerformance({
        moduleName: "DigitalMarketing",
        topicName: "contentStrategist",
        score: 10,
        accuracy: 100,
        avgResponseTimeSec: timeTakenSec,
        studyTimeMinutes: Math.ceil(timeTakenSec / 60),
        completed: true,
      });
      setStartTime(Date.now());
    }

    setTimeout(() => {
      setLoading(false);
      setShowPreview(true);
      handleConfetti();
      
      // Show win view after a short delay
      setTimeout(() => {
        setShowWinView(true);
      }, 3000);
    }, 2000);
  };

  const exampleStorylines = [
    [
      "Kids run to the door as fireworks light up the sky.",
      "They open a magical box of ChocoBoom.",
      "Chocolates burst out with sparkle and joy!",
    ],
    [
      "A grandmother gives a gift to her grandson.",
      "He opens it and finds ChocoBoom treats inside.",
      "They both dance as the screen flashes 'Sweetest Diwali!'",
    ],
  ];

  const handleRetryChallenge = () => {
    // reset to initial state (no navigation reload)
    setStory(["", "", ""]);
    setSelectedMusic("");
    setScreenText("");
    setSelectedEmotion("");
    setShowPreview(false);
    setLoading(false);
    setShowWinView(false);
    setStartTime(Date.now());
  };

  const handleNextChallenge = () => {
    navigate("/matching-game");
  };

  const handleViewFeedback = () => {
    // stub: open your feedback modal or navigate to feedback page
    console.log("Open feedback modal or page");
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
            🏅 Badge Earned: 🪅 Reel Master
          </h2>
          <p className="text-xl text-white mt-2">🎉 Great job! Your reel plan is amazing!</p>
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
      </div>
    );
  }


  return (
    <div className="w-[100%] min-h-screen pt-20 md:pt-40 pb-28 bg-[#0A160E] p-4 md:p-8">
      <GameNav />
      
      {/* Instruction Overlay */}
      {showInstructionOverlay && (
        <InstructionOverlay onClose={() => setShowInstructionOverlay(false)} />
      )}
      
      <div
        className="w-full h-full overflow-auto rounded-2xl bg-gradient-to-br from-[#b8ffcb] via-[#beffde] to-green-200 py-10 px-4 flex flex-col items-center font-bold space-y-10 relative"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        <motion.h1
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="text-2xl sm:text-xl md:text-5xl text-purple-700 drop-shadow-md"
        >
          🎬 Reel Planner Game
        </motion.h1>

        {/* Storyline Inputs */}
        <div className="text-3xl p-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 text-white">
          Write your own storyline of the reel
        </div>
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
          {["Part 1", "Part 2", "Part 3"].map((label, idx) => {
            const floatClass = `float${(idx % 4) + 1}`;
            return (
              <div
                key={idx}
                className={`bg-white floating-card ${floatClass} rounded-3xl p-6 shadow-xl border-4 border-purple-300`}
              >
                <h2 className="text-xl text-purple-600 mb-2">🎥 {label}</h2>
                <textarea
                  className="w-full h-32 p-3 rounded-xl border focus:outline-none focus:ring-4 focus:ring-purple-300 text-purple-800"
                  placeholder={`Describe ${label.toLowerCase()} of the reel...`}
                  value={story[idx]}
                  onChange={(e) => {
                    const updated = [...story];
                    updated[idx] = e.target.value;
                    setStory(updated);
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Example and Instructions Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setShowExamples(!showExamples)}
          className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-8 py-3 rounded-full text-lg hover:scale-105 transition duration-300 shadow-lg"
        >
          {showExamples ? "Hide" : "See"} Example Storylines ✨
        </button>
          
          <button
            onClick={() => setShowInstructionOverlay(true)}
            className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-8 py-3 rounded-full text-lg hover:scale-105 transition duration-300 shadow-lg"
          >
            📖 How to Play
          </button>
        </div>

        {/* Example Storylines */}
        {showExamples && (
          <div className="grid gap-4 max-w-4xl w-full">
            {exampleStorylines.map((lines, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl border-l-8 border-purple-300 shadow-md"
              >
                <div className="text-xl">Example {i + 1}</div>
                {lines.map((line, idx) => (
                  <p key={idx} className="text-purple-700 text-xl mb-1">
                    👉 {line}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Music Selection */}
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl text-purple-700 mb-4">
            🎶 Choose a Music Vibe
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {musicOptions.map((music, index) => {
              const floatClass = `float${(index % 4) + 1}`;
              return (
                <button
                  key={music}
                  onClick={() => setSelectedMusic(music)}
                  className={`p-4 floating-card ${floatClass} rounded-2xl text-xl font-semibold transition-all duration-300 shadow-md ${selectedMusic === music
                    ? "bg-purple-500 text-white scale-105"
                    : "bg-white text-purple-700 hover:bg-yellow-100"
                    }`}
                >
                  {music}
                </button>
              );
            })}
          </div>
        </div>

        {/* Screen Text Input */}
        <div className="w-full max-w-xl text-center">
          <h2 className="text-2xl text-purple-700 mb-2">📢 Text on Screen</h2>
          <input
            type="text"
            value={screenText}
            onChange={(e) => setScreenText(e.target.value)}
            placeholder="E.g. 🎉 Celebrate with ChocoBoom!"
            className="w-full p-4 rounded-xl text-center border-2 border-purple-300 text-lg focus:ring-4 focus:ring-pink-200"
          />
        </div>

        {/* Emotion Selection */}
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl text-purple-700 mb-4 ">
            🤩 What Emotion Will It Create?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {emotionOptions.map((emo, index) => {
              const floatClass = `float${(index % 4) + 1}`;
              return (
                <button
                  key={emo}
                  onClick={() => setSelectedEmotion(emo)}
                  className={`p-4 wiggleEmoji rounded-2xl   text-xl font-semibold transition-all duration-300 shadow-md ${selectedEmotion === emo
                    ? "bg-green-400 text-white scale-105"
                    : "bg-white text-purple-700 hover:bg-green-100"
                    }`}
                >
                  {emo}
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-5">
          <button
            disabled={!validClick()}
            onClick={handleClick}
            className={`${validClick() ? "cursor-pointer" : "cursor-not-allowed"
              } p-4 bg-purple-500 hover:rotate-2 transition-all duration-150 rounded-2xl text-white text-xl `}
          >
            {` ${showPreview ? "Close Preview" : "Preview Your Reel Plan"}`}
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center mt-6 text-base md:text-lg font-bold text-purple-800">
            <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-t-pink-300 border-yellow-300 rounded-full animate-spin"></div>
            <div className="mt-4">Loading...</div>
          </div>
        )}

        {showPreview && (
          <div
            ref={previewRef}
            className="mt-12 w-full max-w-4xl relative bg-yellow-50 rounded-3xl shadow-2xl p-8 border-4 border-yellow-400 space-y-6 text-center"
          >
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />

            <h2 className="text-md md:text-xl lg:text-3xl text-purple-700 mb-6 font-extrabold tracking-wide">
              🎉 Preview Your Reel Plan
            </h2>

            <div className="space-y-4 text-purple-800 text-lg">
              <div className="text-2xl font-extrabold text-purple-600">
                🎬 Storyline:
              </div>
              <div className="text-left space-y-2">
                {story.map((line, i) => (
                  <p
                    key={i}
                    className="break-words whitespace-pre-wrap bg-white rounded-xl px-4 py-2 shadow-md border-l-4 border-purple-400"
                  >
                    Part {i + 1}: {line}
                  </p>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="p-4 bg-white rounded-xl shadow-md border-l-4 border-pink-300">
                  <div className="text-xl font-bold">🎵 Music:</div>
                  <div className="font-semibold animate-pulse">
                    {selectedMusic}
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl shadow-md border-l-4 border-green-300">
                  <div className="text-xl font-bold">📢 Screen Text:</div>
                  <p className="break-words whitespace-pre-wrap font-semibold animate-pulse">
                    {screenText}
                  </p>
                </div>

                <div className="p-4 bg-white rounded-xl shadow-md border-l-4 border-blue-300">
                  <div className="text-xl font-bold">🤩 Emotion:</div>
                  <div className="font-semibold animate-bounce text-xl">
                    <span>{selectedEmotion}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
