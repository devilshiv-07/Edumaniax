import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import AdCampaignMatchGame from "./AdCampaignMatchGame";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import GameNav from "./GameNav";
import IntroScreen from "./IntroPage";
import InstructionOverlay from "./InstructionOverlay";

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

const APIKEY = import.meta.env.VITE_API_KEY;

export default function AdCampaignerGame() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const previewRef = useRef(null);
  const [completed, setCompleted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showWinView, setShowWinView] = useState(false);

  const [formData, setFormData] = useState({
    adType: "",
    targetAudience: "",
    slogan: "",
    platforms: [],
    campaignName: "",
  });

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime,setStartTime] = useState(Date.now());

  // Handle intro screen timing
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Show instructions automatically when game loads (after intro)
  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        setShowInstructions(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  const updateFormData = (field, value) => {
    if (field === "platforms") {
      const prevArr = formData[field];
      if (prevArr.includes(value)) {
        // Deselect
        const newArray = prevArr.filter((item) => item !== value);
        setFormData((prev) => ({ ...prev, [field]: newArray }));
      } else {
        // Select
        if (prevArr.length >= 3) {
          toast.info("Max 3 platforms allowed");
          return;
        }
        const newArray = [...prevArr, value];
        setFormData((prev) => ({ ...prev, [field]: newArray }));
      }
    } else {
      // Toggle for other fields
      if (formData[field] === value) {
        setFormData((prev) => ({ ...prev, [field]: "" }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    }
  };

  const validClick = () => {
    if (Object.values(formData).every((val) => val)) {
      return true;
    }
    return false;
  };

  const canvasRef = useRef(null);

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
                  text: `Evaluate the user's decisions to run an ad Campaign for a brand that sells caps. The user is a school student.

          This is the data of his ad-campaign startegy : ${JSON.stringify(
                    formData,
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
    pros : #If the ad campaign is exceptionally bad, Keep this as "No pros" 
    cons : #If the ad campaign is exceptionally good, Keep this as "No cons"
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

      // Time taken for the task
      const timeTakenSec = (Date.now() - startTime) / 1000;

      // === Simple scoring logic ===
      // Score = 10 if there are pros and no cons, 8 if both present, 5 if only cons, etc.
      let scaledScore = 0;
      if (parsed.pros && parsed.pros !== "No pros") {
        scaledScore += 5;
      }
      if (parsed.cons && parsed.cons !== "No cons") {
        scaledScore += 3;
      }
      if (parsed.tip && parsed.tip.length > 10) {
        scaledScore += 2;
      }

      // Cap score at 10
      scaledScore = Math.min(scaledScore, 10);
      // Accuracy can just be score * 10 (out of 100)
      const accuracy = scaledScore * 10;

      // ✅ Send to performance context
      updatePerformance({
        moduleName: "DigitalMarketing",
        topicName: "marketer",
        score: scaledScore,
        accuracy,
        avgResponseTimeSec: timeTakenSec,
        studyTimeMinutes: Math.ceil(timeTakenSec / 60),
        completed: true,
         
      });
       setStartTime(Date.now());

      // Show win screen after a short delay
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

  const handleRetryChallenge = () => {
    // Reset form data and win screen
    setFormData({
      adType: "",
      targetAudience: "",
      slogan: "",
      platforms: [],
      campaignName: "",
    });
    setResult(null);
    setShowWinView(false);
    setStartTime(Date.now());
  };

  const handleNextChallenge = () => {
    navigate("/intro-budget-battle");
  };

  const handleViewFeedback = () => {
    console.log("Open feedback modal or page");
  };

  useEffect(() => {
    if (!result || !previewRef || !previewRef?.current) {
      return;
    }

    setTimeout(() => {
      previewRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  }, [result]);

  // Show intro screen first - after all hooks
  if (showIntro) {
    return <IntroScreen />;
  }

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
            🏅 Badge Earned: 🧢 Captain Campaign
          </h2>
          <p className="text-xl text-white mt-2">🎉 Great job! You created an amazing campaign!</p>
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
    <div className="w-full min-h-screen pt-20 md:pt-45 pb-20 bg-[#0A160E] mx-auto px-4 md:px-6">
      <GameNav />
      
      {/* Instruction Overlay */}
      {showInstructions && (
        <InstructionOverlay onClose={() => setShowInstructions(false)} />
      )}
      <div
        className=" w-full h-full  overflow-auto rounded-2xl bg-gradient-to-br from-blue-100 via-cyan-100 to-violet-100
 py-10 px-4 flex flex-col items-center font-bold space-y-10"
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
          className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-700 drop-shadow-md"
        >
          🧢 Cool Caps Campaign
        </motion.h1>

        <div>
          <AdCampaignMatchGame
            completed={completed}
            setCompleted={setCompleted}
          />
        </div>

        <div
          className={`${!completed
            ? "opacity-50  pointer-events-none w-full h-full flex flex-col items-center space-y-10"
            : "w-full h-full flex flex-col items-center space-y-10"
            }`}
        >
          <div
            className={`text-lg sm:text-xl md:text-2xl lg:text-3xl mt-10  p-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 text-white`}
          >
            Who’s gonna rock these caps?
          </div>
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
            {[
              "🧢 Little Legends (Ages 5–9)",
              "🎈 Cool Kids Club (Ages 10–15)",
              "⚡ Teen Titans (Ages 16–19)",
              "🌟 Young Trailblazers (Ages 20–25)",
              "🏆 Future Icons (Ages 26 and up)",
            ].map((label, idx) => {
              const floatClass = `float${(idx % 4) + 1}`;
              return (
                <div
                  key={idx}
                  onClick={() => updateFormData("targetAudience", label)}
                  className={`${formData.targetAudience === label
                    ? "border-green-500"
                    : "border-purple-300"
                    } floating-card ${floatClass} border-4 cursor-pointer bg-white rounded-3xl p-6 shadow-xl `}
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-600 mb-2">
                    {label}
                  </h2>
                </div>
              );
            })}
          </div>

          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl p-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 text-white">
            What’s your winning catchphrase?
          </div>
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
            {[
              "🔥 Caps that make you the coolest kid on the block!",
              "🧵 Custom style, just like YOU!",
              "✨ Stand out and shine with every wear",
              "💫 Comfort + swag = perfect cap combo!",
              "🎯 Wear your mood, rock your vibe!",
            ].map((label, idx) => {
              const floatClass = `float${(idx % 4) + 1}`;
              return (
                <div
                  key={idx}
                  onClick={() => updateFormData("slogan", label)}
                  className={`${formData.slogan === label
                    ? "border-green-500"
                    : "border-purple-300"
                    } floating-card ${floatClass} bg-white cursor-pointer rounded-3xl p-6 shadow-xl border-4`}
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-600 mb-2">
                    {label}
                  </h2>
                </div>
              );
            })}
            <div
              key={4}
              className={`bg-white floating-card ${0} rounded-3xl p-6 shadow-xl border-4 border-purple-300`}
            >
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-center text-purple-600 mb-2">
                <input
                  type="text"
                  placeholder="Custom catchphrase"
                  value={formData.slogan}
                  onChange={(e) => updateFormData("slogan", e.target.value)}
                  className="w-full border-2 border-purple-300 rounded-xl p-3"
                />
              </h2>
            </div>
          </div>

          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl p-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 text-white">
            Where will your hype train stop? (Choose 3)
          </div>
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
            {[
              "📸 Instagram",
              "🐦 X (Twitter)",
              "👻 Snapchat",
              "📹 YouTube",
            ].map((label, idx) => {
              const floatClass = `float${(idx % 4) + 1}`;
              return (
                <div
                  key={idx}
                  onClick={() => updateFormData("platforms", label)}
                  className={`bg-white cursor-pointer floating-card ${floatClass} rounded-3xl p-6 shadow-xl border-4 ${formData.platforms.includes(label)
                    ? "border-green-500"
                    : "border-purple-300"
                    }`}
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-center text-purple-600 mb-2">
                    {label}
                  </h2>
                </div>
              );
            })}
          </div>

          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl p-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 text-white">
            What’s your campaign’s stage name?
          </div>
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
            {[
              "🧢 CapTivate",
              "🔝 Top That",
              "🙌 HeadTurners",
              "🎤 CapItAll",
            ].map((label, idx) => {
              const floatClass = `float${(idx % 4) + 1}`;
              return (
                <div
                  key={idx}
                  onClick={() => updateFormData("campaignName", label)}
                  className={`bg-white cursor-pointer floating-card ${floatClass} rounded-3xl p-6 shadow-xl border-4 ${formData.campaignName === label
                    ? "border-green-500"
                    : "border-purple-300"
                    }`}
                >
                  <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-center text-purple-600 mb-2">
                    {label}
                  </h2>
                </div>
              );
            })}
            <div
              key={4}
              className={`bg-white floating-card ${0} rounded-3xl p-6 shadow-xl border-4 border-purple-300`}
            >
              <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-center text-purple-600 mb-2">
                <input
                  type="text"
                  placeholder="Custom campaign name"
                  value={formData.campaignName}
                  onChange={(e) =>
                    updateFormData("campaignName", e.target.value)
                  }
                  className="w-full border-2 border-purple-300 rounded-xl p-3"
                />
              </h2>
            </div>
          </div>

          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl p-3 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 text-white">
            What type of ad will you launch?
          </div>
          <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl">
            {["🎭 Meme", "🌟 Glowing Image", "😂 Animated Emoji"].map(
              (label, idx) => {
                const floatClass = `float${(idx % 4) + 1}`;
                return (
                  <div
                    key={idx}
                    onClick={() => updateFormData("adType", label)}
                    className={`cursor-pointer ${formData.adType === label
                      ? "border-green-500"
                      : "border-purple-300"
                      } bg-white cursor-pointer floating-card ${floatClass} rounded-3xl p-6 shadow-xl border-4`}
                  >
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-center text-purple-600 mb-2">
                      {label}
                    </h2>
                  </div>
                );
              }
            )}
          </div>

          <div className="pt-4">
            <button
              disabled={!validClick()}
              onClick={() => handleSubmit()}
              className={`bg-gradient-to-r ${validClick() ? "cursor-pointer" : "cursor-not-allowed"
                } from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-lg sm:text-xl md:text-2xl lg:text-3xl hover:scale-105 transition duration-300 shadow-lg`}
            >
              💡 Get AI Feedback
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center my-6">
              <div className="w-12 h-12 border-4 border-t-pink-500 border-yellow-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-pink-600 text-2xl font-semibold">
                Thinking...
              </p>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-center mt-4 font-bold">{error}</p>
          )}

          {result && (
            <div
              className="mt-12 w-full sm:w-5/6 md:w-2/3 mx-auto"
              ref={previewRef}
            >
              <div className="text-center">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-purple-600 font-bold">
                  📣 Feedback
                </h2>
              </div>
              <div className="p-6 mt-4 flex justify-center">
                <div className="bg-white border-4 p-4 md:p-6 border-fuchsia-400 rounded-3xl shadow-md whitespace-pre-wrap">
                  <div className="text-gray-800 text-lg sm:text-xl md:text-2xl lg:text-3xl space-y-4 break-words">
                    <p>
                      <strong className="text-green-400">🎯 Pros:</strong>{" "}
                      {result?.pros}
                    </p>
                    <p>
                      <strong className="text-red-400">🎯 Cons:</strong>{" "}
                      {result?.cons}
                    </p>
                    <p>
                      <strong className="text-blue-400">💡 Tip:</strong>{" "}
                      {result?.tip}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => navigate("/ad-campaigner-game-complete")}
                  className="px-7 py-5 text-lg sm:text-xl md:text-2xl lg:text-3xl cursor-pointer rounded-2xl bg-purple-400 text-yellow-200"
                >
                  Finish Game
                </button>
              </div>
            </div>
          )}
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}
