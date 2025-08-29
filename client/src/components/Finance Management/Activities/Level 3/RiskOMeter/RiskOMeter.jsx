import React, { useEffect, useState } from "react";
import { GiMoneyStack, GiReceiveMoney, GiChart } from "react-icons/gi";
import { BackgroundBeamsWithCollision } from "../../../../../../StyleComponents/BackGroundWithBeams";
import { useFinance } from "@/contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";

const questions = [
  {
    text: "How would you feel if your money dropped by 20%?",
    icon: <GiMoneyStack className="text-3xl text-yellow-600" />,
    options: [
      { text: "😰 Very anxious", score: 1 },
      { text: "😟 A bit uneasy", score: 2 },
      { text: "😎 Fine, it happens", score: 3 },
    ],
  },
  {
    text: "Would you invest if there's no guarantee but high reward?",
    icon: <GiReceiveMoney className="text-3xl text-green-600" />,
    options: [
      { text: "🙅 No way", score: 1 },
      { text: "🤔 Maybe", score: 2 },
      { text: "🚀 Absolutely", score: 3 },
    ],
  },
  {
    text: "Do you prefer slow, steady growth?",
    icon: <GiChart className="text-3xl text-blue-600" />,
    options: [
      { text: "🐢 Yes", score: 1 },
      { text: "⚖️ Somewhat", score: 2 },
      { text: "🏎️ No, I want faster gains", score: 3 },
    ],
  },
];

function calculateRiskProfile(score) {
  if (score <= 4)
    return {
      label: "🛡️ Cautious",
      color: "text-blue-600",
      img: "./cautions.png",
      description:
        "You prefer safe investments with lower risk and stable returns. You're careful with your money and prioritize financial security.",
    };
  if (score <= 6)
    return {
      label: "⚖️ Balanced",
      color: "text-yellow-600",
      img: "./balanced.jpg",
      description:
        "You like to balance between risk and reward. You’re open to opportunities but also like a safety net in place.",
    };
  return {
    label: "🔥 Aggressive",
    color: "text-red-600",
    img: "./aggressive.jpg",
    description:
      "You’re a bold investor! You seek high rewards and don’t mind market ups and downs as long as the gains are big.",
  };
}

export default function RiskOMeter() {
  const { completeFinanceChallenge } = useFinance();
  const [currentQ, setCurrentQ] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [animate, setAnimate] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState([]);
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleAnswer = (score) => {
    // for performance
    const now = Date.now();
    const responseTime = (now - startTime) / 1000;
    setResponseTimes((prev) => [...prev, responseTime]);

    const newScore = totalScore + score;
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
      setTotalScore(newScore);
    } else {
      setTotalScore(newScore);
      setShowResult(true);
      setAnimate(true);

      //for performance
      const totalTime = [...responseTimes, responseTime].reduce(
        (a, b) => a + b,
        0
      );
      const avgResponseTime = totalTime / questions.length;
      const scaledScore = Math.round((newScore / 9) * 10);
      updatePerformance({
        moduleName: "Finance",
        topicName: "investorLevel",
        score: scaledScore,
        accuracy: scaledScore * 10,
        avgResponseTimeSec: avgResponseTime,
        studyTimeMinutes: Math.ceil(totalTime / 60),
        completed: true,
      });
      setStartTime(Date.now());
      // mark challenge completed
      completeFinanceChallenge(2, 1);

      setTimeout(() => {
        setAnimate(false);
      }, 2500);
    }
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/investment-simulator"); // ensure `useNavigate()` is defined
  };

  // Retry Handler
  const handleRetry = () => {
    // Reset any relevant state if needed
    setCurrentQ(0);
    setTotalScore(0);
    setShowResult(false);
    setAnimate(false);
    setResponseTimes([]);
    setStartTime(Date.now());

    // Navigate back to the main game page (update path as per your routes)
    navigate("/riskometer");
  };

  const progress = ((currentQ + (showResult ? 1 : 0)) / questions.length) * 100;
  const riskProfile = calculateRiskProfile(totalScore);

  return (
    <>
      {!showResult && (
        <div>
          <GameNav />
        </div>
      )}
      <div className="relative bg-[#0A160E] min-h-screen overflow-hidden">
        {/* Foreground content - centered */}
        <div className="relative z-10 flex items-center justify-center min-h-screen p-5">
          <div className="w-full bg-[#202F364D] max-w-2xl rounded-3xl shadow-2xl transition-all duration-500 p-6">
            {/* Progress Bar */}
            <div className="w-full bg-pink-200 h-4 rounded-full mb-6">
              <div
                className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-4 rounded-full transition-all duration-700 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            {/* Result or Questions */}
            {showResult ? (
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
                {/* Center Content */}
                <div className="flex flex-col items-center justify-center flex-1 p-6">
                  {/* Trophy GIF Section */}
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

                  {/* Main Result */}
                  <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                    ✨ Your Risk Profile ✨
                  </h2>

                  <p className="mt-3 text-lg text-pink-300 font-semibold italic bg-gradient-to-r from-pink-100/20 to-yellow-100/20 px-4 py-2 rounded-xl shadow-md inline-block animate-fade-in">
                    🌟 This profile shows how brave you are with your treasures
                    🌟
                  </p>

                  <p
                    className={`text-5xl mt-4 ${riskProfile.color} drop-shadow-lg`}
                  >
                    {riskProfile.label}
                  </p>

                  <img
                    src={riskProfile.img}
                    alt={riskProfile.label}
                    className="w-44 h-44 mx-auto mt-6 rounded-full border-4 border-purple-300 shadow-2xl ring-2 ring-offset-2 ring-purple-400"
                  />

                  {/* Insight / Description Box */}
                  <div className="mt-8 flex flex-col items-center sm:flex-row sm:items-start sm:gap-4">
                    <div className="bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-80">
                      <p className="text-black text-sm font-extrabold mb-1 mt-2">
                        INSIGHT
                      </p>
                      <div className="bg-[#131F24] mt-0 w-full h-auto rounded-xl flex items-center justify-center px-4 py-3 text-center overflow-hidden">
                        <span
                          className="text-[#FFCC00] font-bold leading-tight"
                          style={{
                            fontSize: "clamp(0.75rem, 1.2vw, 1rem)",
                            lineHeight: "1.3",
                            whiteSpace: "normal",
                          }}
                        >
                          ✨ {riskProfile.description} ✨
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
                    className="cursor-pointer w-34 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/next-challenge.svg"
                    alt="Next Challenge"
                    onClick={handleNextChallenge}
                    className="cursor-pointer w-34 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/retry.svg"
                    alt="Retry"
                    onClick={handleRetry}
                    className="cursor-pointer w-34 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-2xl font-semibold text-white lilita-one-regular mb-6">
                  {questions[currentQ].text}
                </p>
                <div className="flex justify-center items-center text-4xl mb-4 mx-auto animate-wiggle">
                  {questions[currentQ].icon}
                </div>
                <div className="grid gap-4">
                  {questions[currentQ].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(opt.score)}
                      className="w-full lilita-one-regular bg-[#144d674d] hover:from-blue-400 hover:to-cyan-500 text-white py-3 px-5 rounded-xl shadow-md hover:scale-105 transition-transform duration-300 ease-out"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
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
}
