import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFinance } from "../../../../../contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
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

const EmiVsLumpSum = () => {
  const { completeFinanceChallenge } = useFinance();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasselectedA, setasselectedA] = useState(false);
  const [hasselectedB, setasselectedB] = useState(false);
  const [reason, setReason] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const lumpSumTotal = 4000 * 3; // ₹12,000
  const emiTotal = 4500 + 3000 * 3; // ₹13,500

  // for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showGif, setShowGif] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const data = [
    { name: "Lump Sum", cost: lumpSumTotal, extra: 0 },
    { name: "EMI", cost: emiTotal, extra: 1500 },
  ];

  const handleSubmit = async () => {
    if (selectedOption && reason.trim()) {
      setShowResult(true);
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APIKEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `The user had to buy a phone of ₹12000. He had two options : 
                  Option A and B. Option A was the lumpsum option. In A, he had to save 4000 for 3 months and then buy the phone, using lumpsum payment. Option B was the EMI option. In option B, he had to pay 4500 upfront and then pay 3000 per month for three months. Of course this included interest as extra payment. The user chose option "${selectedOption}".
                  His reason was "${reason}". Evaluate his choices. Give feedback regarding the differnce between his choice and the other choice. If his choice is option B, criticize showing the issues of instant gratification, impulsive buying and the extra interest and if it is option A, appreciate accordingly. Your last sentence should give the verdict, like good choice or bad choice. Maximum length 40 words.

### FINAL INSTRUCTION ###
Return ONLY raw JSON (no backticks, no markdown, no explanations).
Example format:
{
feedback : "Your feedback"
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
      setFeedback(parsed.feedback);

      if (hasselectedA && hasselectedB) {
        completeFinanceChallenge(1, 1);

        const totalTimeSec = (Date.now() - startTime) / 1000;
        updatePerformance({
          moduleName: "Finance",
          topicName: "bankingExpert",
          score: 10,
          accuracy: 100,
          completed: true,
          avgResponseTimeSec: totalTimeSec / 2,
          studyTimeMinutes: Math.ceil(totalTimeSec / 60),
        });
        setStartTime(Date.now());
      }
    } catch (err) {
      setError("Error fetching feedback. Try again later");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setSelectedOption(null);
    setReason("");
    setShowResult(false);
    setFeedback("");
    setLoading(false);
    setStartTime(Date.now());
  };

  const notAllowed = () => {
    if (selectedOption && reason.trim()) {
      return false;
    }
    return true;
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
    setShowGif(true);

    // hide gif after 3 sec
    setTimeout(() => {
      setShowGif(false);
    }, 3000);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/challenge3"); // ensure `useNavigate()` is defined
  };

  return (
    <>
      <GameNav />

      {/* Full page container */}
      <div className="min-h-screen pt-20 md:pt-50 pb-28 flex flex-col bg-[#0A160E]">
        {/* Scrollable middle section */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-start justify-center">
          {/* Game Card */}
          <div className="bg-[#202F364D] border border-gray-100 rounded-lg w-full lg:w-1/2 max-w-2xl p-4 sm:p-6">
            <h1 className="text-2xl font-bold text-center text-white lilita-one-regular mb-6">
              📱 EMI vs Lump Sum
            </h1>

            {!showResult && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  {/* Option A */}
                  <button
                    aria-pressed={selectedOption === "A"}
                    className={`p-5 rounded-lg shadow-md transition-all ${
                      selectedOption === "A"
                        ? "bg-green-100 border-2 border-green-600"
                        : "bg-white hover:bg-green-50"
                    }`}
                    onClick={() => handleOptionSelect("A")}
                  >
                    <h2 className="text-lg lilita-one-regular font-semibold text-green-800 mb-2">
                      Option A: Lump Sum
                    </h2>
                    <p className="text-gray-700 lilita-one-regular">
                      Save ₹4,000/month for 3 months. Then buy the phone in one
                      shot.
                    </p>
                    <p className="mt-2 lilita-one-regular font-medium text-green-700">
                      Total: ₹{lumpSumTotal.toLocaleString()}
                    </p>
                  </button>

                  {/* Option B */}
                  <button
                    aria-pressed={selectedOption === "B"}
                    className={`p-5 rounded-lg shadow-md transition-all ${
                      selectedOption === "B"
                        ? "bg-blue-100 border-2 border-blue-600"
                        : "bg-white hover:bg-blue-50"
                    }`}
                    onClick={() => handleOptionSelect("B")}
                  >
                    <h2 className="text-lg lilita-one-regular font-semibold text-blue-800 mb-2">
                      Option B: EMI
                    </h2>
                    <p className="text-gray-700 lilita-one-regular">
                      Pay ₹4,500 upfront + ₹3,000/month for 3 months (includes
                      interest).
                    </p>
                    <p className="mt-2 lilita-one-regular font-medium text-blue-700">
                      Total: ₹{emiTotal.toLocaleString()}
                    </p>
                  </button>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg shadow mb-6">
                  <label
                    htmlFor="reason"
                    className="block font-medium lilita-one-regular text-yellow-800 mb-2"
                  >
                    💬 Why did you choose this option?
                  </label>
                  <textarea
                    id="reason"
                    className="w-full lilita-one-regular h-24 p-3 rounded border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    placeholder="Type your reason here..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
              </>
            )}

            {showResult && (
              <>
                {selectedOption === "A" ? (
                  // ✅ WIN PAGE
                  <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                    {/* Center Content */}
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

                      {/* Challenge Complete Text */}
                      <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                        Challenge Complete!
                      </h2>

                      {/* Insight Box */}
                      <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-start sm:gap-4">
                        <div className="mt-4 sm:mt-0 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-74">
                          <p className="text-black text-sm font-extrabold mb-1 mt-2">
                            INSIGHT
                          </p>
                          <div className="bg-[#131F24] mt-0 w-73 h-16 rounded-xl flex items-center justify-center px-4 py-1 text-center overflow-hidden">
                            <span
                              className="text-[#FFCC00] font-bold leading-tight"
                              style={{
                                fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
                                lineHeight: "1.1",
                                whiteSpace: "normal",
                              }}
                            >
                              {feedback || "Analyzing your results..."}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Buttons */}
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
                  // ❌ GAME OVER PAGE
                  <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                    {/* Game Over Content */}
                    <div className="flex flex-col items-center justify-center flex-1 p-4">
                      <img
                        src="/financeGames6to8/game-over-game.gif"
                        alt="Game Over"
                        className="w-48 sm:w-64 h-auto mb-4"
                      />
                      <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                        Oops! That was close! Wanna Retry?
                      </p>

                      {/* What Went Wrong Box */}
                      <div className="mt-4 sm:mt-8 lg:mt-12 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-74">
                        <p className="text-black text-sm font-extrabold mb-1 mt-2">
                          WHAT WENT WRONG?
                        </p>
                        <div className="bg-[#131F24] mt-0 w-73 h-16 rounded-xl flex items-center justify-center px-4 text-center overflow-hidden">
                          <span
                            className="text-[#FFCC00] lilita-one-regular font-medium italic leading-tight"
                            style={{
                              fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
                              lineHeight: "1.1",
                              whiteSpace: "normal",
                            }}
                          >
                            {feedback || "Analyzing your results..."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
                      <img
                        src="/financeGames6to8/feedback.svg"
                        alt="Feedback"
                        onClick={handleViewFeedback}
                        className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                      />
                      <img
                        src="/financeGames6to8/retry.svg"
                        alt="Retry"
                        onClick={handleRestart}
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
                )}
              </>
            )}
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center gap-4 z-40 px-4 sm:px-0">
          {showGif && (
            <div
              className="absolute -top-24 sm:-top-30 transform -translate-x-1/2 z-50 flex items-start"
              style={{ left: "85%" }}
            >
              <img
                src="/financeGames6to8/kid-gif.gif"
                alt="Kid Celebration"
                className="object-contain"
                style={{ maxHeight: "120px", height: "auto", width: "auto" }}
              />
              <img
                src="/financeGames6to8/kid-saying.svg"
                alt="Kid Saying"
                className="absolute top-2 left-[90px] w-24 hidden md:block"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={notAllowed()}
            className={`p-1 rounded ${
              notAllowed()
                ? "cursor-not-allowed opacity-50"
                : "transition transform active:scale-90 hover:scale-105"
            }`}
          >
            <img
              src="/financeGames6to8/check-now-btn.svg"
              alt="Check Now"
              className="h-12 w-auto"
            />
          </button>
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
};

export default EmiVsLumpSum;
