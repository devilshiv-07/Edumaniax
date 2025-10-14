import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import GameNav from "./GameNav";
import InstructionOverlay from "./InstructionOverlay";
import IntroScreen from "./IntroPage";

const platforms = [
  {
    name: "Instagram Stories",
    maxBudget: 100,
    maxReach: 1000,
    bgColor: "bg-pink-100", // soft pink
  },
  {
    name: "YouTube Ads",
    maxBudget: 150,
    maxReach: 800,
    bgColor: "bg-red-100", // light red
  },
  {
    name: "Google Search",
    maxBudget: 200,
    maxReach: 300,
    bgColor: "bg-blue-100", // light blue
  },
  {
    name: "WhatsApp Broadcast",
    maxBudget: 50,
    maxReach: 200,
    bgColor: "bg-green-100", // light green
  },
  {
    name: "Influencer Shoutout",
    maxBudget: 250,
    maxReach: 1200,
    bgColor: "bg-yellow-100", // light yellow
  },
  {
    name: "School App Banner",
    maxBudget: 75,
    maxReach: 400,
    bgColor: "bg-purple-100", // soft purple
  },
];

const APIKEY = import.meta.env.VITE_API_KEY;

function parsePossiblyStringifiedJSON(text) {
  if (typeof text !== "string") return null;

  // Remove triple backticks and optional "json" after them
  text = text.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(json)?/, "")
      .replace(/```$/, "")
      .trim();
  }

  // Remove single backticks
  if (text.startsWith("`") && text.endsWith("`")) {
    text = text.slice(1, -1).trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return null;
  }
}

export default function IntroBudgetBattle() {
  const [showIntro, setShowIntro] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const totalBudget = 500;
  const [allocations, setAllocations] = useState(platforms.map(() => 0));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const canvasRef = useRef(null);
  const [showWinView, setShowWinView] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime,setStartTime] = useState(Date.now());

  useEffect(() => {
    if (!result) return;

    const endTime = Date.now();
    const timeTakenSec = Math.floor((endTime - startTime) / 1000);
    const studyTimeMinutes = Math.ceil(timeTakenSec / 60);

    const prosScore = result.pros && result.pros !== "No pros" ? 1 : 0;
    const consScore = result.cons && result.cons !== "No cons" ? 1 : 0;
    const hasTip = result.tip && result.tip.length > 0 ? 1 : 0;

    const score = (prosScore + consScore + hasTip) * 3; // max 9


    updatePerformance({
      moduleName: "DigitalMarketing",
      topicName: "marketer",
      score,
      accuracy: score * 10,
      avgResponseTimeSec: timeTakenSec,
      studyTimeMinutes,
      completed: true,
 
    });
     setStartTime(Date.now());
  }, [result]);

  const handleAllocationChange = (index, value) => {
    const newAllocations = [...allocations];
    newAllocations[index] = parseInt(value) || 0;
    const sum = newAllocations.reduce((a, b) => a + b, 0);
    if (sum <= totalBudget && value <= platforms[index].maxBudget) {
      setAllocations(newAllocations);
    }
  };

  const allocatedTotal = allocations.reduce((a, b) => a + b, 0);
  const remaining = totalBudget - allocatedTotal;

  const handleConfetti = () => {
    const myCanvas = canvasRef.current;
    if (!myCanvas) return;
    const myConfetti = confetti.create(myCanvas, { resize: true, useWorker: true });
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
    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 300);
    setTimeout(shoot, 500);
    setTimeout(shoot, 700);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    console.log(" Hi");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APIKEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `Evaluate the user's decisions to allocate a budget across different platforms for ads. The user is a school student.

         Original Budget : 500
         Allocations across differnet platforms for ads : ${JSON.stringify(
                    allocations,
                    null,
                    2
                  )}
         Details about specific platforms : ${JSON.stringify(
                    platforms,
                    null,
                    2
                  )}        


### FINAL INSTRUCTION ###
Return ONLY raw JSON (no backticks, no markdown, no explanations).
Value of each field must be a string.
Value of pros and cons field must be 20 words max.
Value of tip must be 50 words max.
Example format:
{
    pros : #If the allocation is exceptionally bad, Keep this as "No pros" 
    cons : #If the allocation is exceptionally good, Keep this as "No cons"
    tip : #Always give an actionable activity for improvement as a tip.
}
`,
                },
              ],
            },
          ],
        }
      );

      const aiReply = response.data.candidates[0].content.parts[0].text;
      console.log(aiReply);
      const parsed = parsePossiblyStringifiedJSON(aiReply);
      console.log(parsed);
      setResult(parsed);
      // small celebration, then show win screen
      setTimeout(() => {
        setShowWinView(true);
        handleConfetti();
      }, 1500);
    } catch (err) {
      setError("Error fetching AI response");
      console.log(err);
    }

    setLoading(false);
  };

  const validClick = () => {
    if (remaining === 0) {
      return true;
    }
    return false;
  };

  // Show intro first, then reveal game after loader (4s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Open instructions shortly after intro is hidden
  useEffect(() => {
    if (showIntro) return;
    const t = setTimeout(() => setShowInstructions(true), 500);
    return () => clearTimeout(t);
  }, [showIntro]);

  if (showIntro) {
    return <IntroScreen />;
  }

  // Handlers for win screen actions
  const handleRetryChallenge = () => {
    setShowWinView(false);
    setResult(null);
    setAllocations(platforms.map(() => 0));
  };

  const handleNextChallenge = () => {
    navigate("/analytics-adventure");
  };

  const handleViewFeedback = () => {
    // Placeholder for feedback modal
    console.log("Open feedback modal or page");
  };

  // WIN VIEW
  if (showWinView) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="relative w-64 h-64 flex items-center justify-center">
            <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
            <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
          </div>
          <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
            🏅 Badge Earned: 💰 Smart Spender
          </h2>
          <p className="text-xl text-white mt-2">🎉 Great job! You allocated your budget wisely!</p>
        </div>

        <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
          <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={handleViewFeedback} className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200" />
          <img src="/financeGames6to8/retry.svg" alt="Retry Challenge" onClick={handleRetryChallenge} className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200" />
          <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={handleNextChallenge} className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-25 sm:pt-45 pb-20 bg-[#0A160E] px-4 mx-auto min-h-screen lilita-one-regular">
      <GameNav />
      {/* Instruction Overlay appears once after intro */}
      {showInstructions && (
        <InstructionOverlay onClose={() => setShowInstructions(false)} />
      )}
      <div
        className="w-full p-4 sm:p-5 h-full bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 rounded-3xl mx-auto shadow-2xl border-4 border-white"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        <motion.h1
          initial={{ opacity: 0.1, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="text-xl sm:text-2xl md:text-4xl lg:text-5xl mb-6 text-center text-purple-700 drop-shadow-lg font-bold"
        >
          💰 Budget Battle Arena! 🎮
        </motion.h1>

        <div className="mb-6">
          <h1 className="text-lg sm:text-xl md:text-2xl inline-block p-3 rounded-2xl shadow-xl bg-gradient-to-r from-orange-300 to-yellow-300 font-bold mb-4 border-4 border-orange-400 text-purple-800">
            🎯 Budget Allocation Dashboard
          </h1>
        </div>

        <div className="mb-6">
          <div className="rounded-2xl shadow-xl text-base sm:text-lg md:text-xl mb-6 p-4 sm:p-6 bg-gradient-to-r from-green-300 to-blue-300 border-4 border-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-green-400">
                <div className="text-2xl">💰</div>
                <p className="font-bold text-green-600">
                  Total Budget: ₹{totalBudget}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-blue-400">
                <div className="text-2xl">💸</div>
                <p className="font-bold text-blue-600">
                  Allocated: ₹{allocatedTotal}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-purple-400">
                <div className="text-2xl">{remaining >= 0 ? "🎉" : "😱"}</div>
                <p
                  className={`font-bold ${remaining >= 0 ? "text-purple-600" : "text-red-600"
                    }`}
                >
                  Remaining: ₹{remaining}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl inline-block rounded-2xl shadow-xl p-3 bg-gradient-to-r from-red-300 to-pink-300 font-bold mb-3 border-4 border-red-400 text-white">
            🚀 Platform Budget Allocation
          </h2>
        </div>

        <div className="mt-5 space-y-4 sm:space-y-6">
          {platforms.map((platform, index) => {
            const allocated = allocations[index];
            const estReach = Math.round(
              (allocated / platform.maxBudget) * platform.maxReach
            );
            const costPerReach =
              estReach > 0 ? (allocated / estReach).toFixed(2) : "";

            return (
              <div
                key={index}
                className={`p-4 sm:p-6 ${platform.bgColor} rounded-3xl shadow-xl text-base sm:text-lg md:text-xl border-4 border-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h3 className="font-bold text-gray-800 text-lg sm:text-xl mb-2 sm:mb-0">
                    {platform.emoji || "🎯"} {platform.name}
                  </h3>
                  <span className="text-sm sm:text-base text-gray-700 bg-white px-3 py-1 rounded-xl shadow-lg border-2 border-gray-300">
                    Max: ₹{platform.maxBudget} • Reach: {platform.maxReach}
                  </span>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Budget Slider:
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={platform.maxBudget}
                    value={allocations[index]}
                    onChange={(e) =>
                      handleAllocationChange(index, e.target.value)
                    }
                    className="w-full mb-2 h-3 bg-white rounded-lg appearance-none cursor-pointer shadow-lg"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    💸 Exact Amount:
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={platform.maxBudget}
                    value={allocations[index]}
                    onChange={(e) =>
                      handleAllocationChange(index, e.target.value)
                    }
                    className="border-3 border-gray-300 rounded-xl p-2 sm:p-3 w-20 sm:w-24 mb-2 text-center font-bold shadow-lg focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-green-400">
                    <div className="text-center">
                      <div className="text-lg">👥</div>
                      <p className="text-sm text-gray-600 font-medium">
                        Cost per Reach: ₹{costPerReach}
                      </p>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 shadow-lg border-2 border-blue-400">
                    <div className="text-center">
                      <div className="text-lg">🎯</div>
                      <p className="text-sm text-gray-600 font-medium">
                        Estimated Reach: {estReach} users
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pt-6">
          <button
            disabled={!validClick()}
            onClick={() => handleSubmit()}
            className={`transform transition-all duration-300 ${validClick()
              ? "bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 hover:scale-110 cursor-pointer animate-pulse"
              : "bg-gray-400 cursor-not-allowed"
              } text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-lg sm:text-xl font-bold shadow-xl border-4 border-white`}
          >
            🎯 Get AI Feedback ✨
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center my-6">
            <div className="w-12 h-12 border-4 border-t-pink-500 border-r-blue-500 border-b-green-500 border-l-purple-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-pink-600 text-xl sm:text-2xl font-bold animate-bounce">
              🤔 Thinking...
            </p>
          </div>
        )}

        {error && (
          <p className="text-red-600 text-center mt-4 font-bold text-lg bg-red-100 p-4 rounded-2xl border-4 border-red-300">
            😱 {error}
          </p>
        )}

        {result && (
          <div
            className="mt-8 sm:mt-12 w-full sm:w-5/6 md:w-2/3 mx-auto"
            ref={previewRef}
          >
            <div className="text-center mb-4">
              <h2 className="text-2xl sm:text-3xl text-purple-600 font-bold">
                🎉 Feedback 📊
              </h2>
            </div>
            <div className="p-4 sm:p-6 mt-4 flex justify-center">
              <div className="bg-white border-4 p-4 md:p-6 border-fuchsia-400 rounded-3xl shadow-2xl whitespace-pre-wrap">
                <div className="text-gray-800 text-base sm:text-lg md:text-xl space-y-4 break-words">
                  <div className="bg-green-100 rounded-xl p-3 border-2 border-green-300">
                    <p>
                      <strong className="text-green-600">🌟 Pros:</strong>{" "}
                      {result?.pros}
                    </p>
                  </div>
                  <div className="bg-red-100 rounded-xl p-3 border-2 border-red-300">
                    <p>
                      <strong className="text-red-600">🎯 Cons:</strong>{" "}
                      {result?.cons}
                    </p>
                  </div>
                  <div className="bg-blue-100 rounded-xl p-3 border-2 border-blue-300">
                    <p>
                      <strong className="text-blue-600">💡 Tip:</strong>{" "}
                      {result?.tip}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full flex justify-center mt-4">
              <button
                onClick={() => navigate("/budget-battle-game-complete")}
                className="px-6 sm:px-7 py-4 sm:py-5 cursor-pointer rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 text-yellow-200 font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl border-4 border-white"
              >
                🏆 Finish Game 🎮
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
