import React, { useState, useEffect, useMemo, useCallback } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import GameNav from "./GameNav"; 
import Checknow from "@/components/icon/GreenBudget/Checknow"; 
import ThinkingCloud from "@/components/icon/ThinkingCloud"; 
import IntroScreen from "./IntroScreen"; 
import InstructionsScreen from "./InstructionsScreen"; 
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 1. ADDED AXIOS IMPORT

// Placeholder contexts (assuming these are correct)
const useEnvirnoment = () => ({ completeEnvirnomentChallenge: () => {} });
const usePerformance = () => ({ updateEnvirnomentPerformance: () => {} });

// =============================================================================
// Gemini API Integration Helpers (Added from previous requests)
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;

function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) {
        text = text
            .replace(/^```(json)?/, "")
            .replace(/```$/, "")
            .trim();
    }
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

// Game Data (unchanged)
const gameLevels = [
  { id: 1, location: "Maldives", correctImpact: "Sea level rise" },
  { id: 2, location: "Arctic", correctImpact: "Ice caps melting" },
  { id: 3, location: "Uttarakhand", correctImpact: "Flash floods and landslides" },
  { id: 4, location: "Rajasthan", correctImpact: "Drought and desertification" },
  { id: 5, location: "Sundarbans", correctImpact: "Cyclones and habitat loss" },
  { id: 6, location: "Amazon Forest", correctImpact: "Deforestation & carbon loss" },
  { id: 7, location: "Chennai", correctImpact: "Urban flooding" },
  { id: 8, location: "Antarctica", correctImpact: "Melting glaciers" },
];
const allImpactOptions = [
  "Sea level rise", "Cyclones and habitat loss", "Ice caps melting", "Deforestation & carbon loss",
  "Flash floods and landslides", "Urban flooding", "Drought and desertification", "Melting glaciers",
];

// Re-styled Components (ImpactOptionCard, VictoryScreen, LosingScreen, ReviewScreen - unchanged)
function ImpactOptionCard({ impactText, isSelected, onClick, isDisabled }) {
  const cardClasses = `
    relative flex items-center justify-center p-4 h-[85px] 
    rounded-xl cursor-pointer transition-all duration-200 ease-in-out
    ${isSelected
      ? "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_4px_0_0_#5f8428]"
      : "bg-[#131f24] border-2 border-[#37464f] shadow-[0_4px_0_0_#37464f]"
    }
    ${isDisabled && !isSelected
      ? "opacity-50 cursor-not-allowed"
      : "hover:scale-105"
    }
  `;
  const textClasses = `
    font-['Inter'] text-center text-base font-medium 
    ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      <span className={textClasses}>{impactText}</span>
    </div>
  );
}

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">Challenge Complete!</h2>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] lilita-one-regular text-xs font-normal">{insight}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p>
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center mb-6">Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] lilita-one-regular text-xs font-normal">{insight}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}



function ReviewScreen({ answers, onBackToResults }) {
    // Assuming scrollbarHideStyle is defined elsewhere in your project

    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        {/* Replaced 'ans.description' with the level and location info */}
                        <p className="text-gray-300 text-base mb-2 font-bold">{`Level ${idx + 1}: ${ans.location}`}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Answer:</p>
                            {/* Replaced 'ans.selected' with 'ans.selectedImpact' */}
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>
                                {ans.selectedImpact || "Not Answered"}
                            </p>
                            {!ans.isCorrect && (
                                <>
                                    <p className="font-semibold pt-2">Correct Answer:</p>
                                    {/* Replaced 'ans.correctAnswer' with 'ans.correctImpact' */}
                                    <p className="font-mono text-green-300">{ans.correctImpact}</p>
                                </>
                            )}
                             {/* Added the new feedback message */}
                            <p className="mt-2 italic text-gray-400">{ans.feedbackMessage}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBackToResults}
                className="
                    mt-6 px-8 py-3 
                    bg-yellow-600 
                    text-lg text-white
                    lilita-one-regular
                    rounded-md
                    hover:bg-yellow-700 
                    transition-colors 
                    flex-shrink-0
                    border-b-4 border-yellow-800 active:border-b-0
                    shadow-lg
                "
            >
                Back to Results
            </button>
        </div>
    );
}

export default function MeltdownTracker() {
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  const { updateEnvirnomentPerformance } = usePerformance();
  const navigate = useNavigate();

  const [step, setStep] = useState("intro");
  const [introStep, setIntroStep] = useState("first");
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [selectedImpact, setSelectedImpact] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [levelResults, setLevelResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(180);
  const [insight, setInsight] = useState(""); // 2. ADDED INSIGHT STATE

  const currentLevel = useMemo(() => gameLevels[currentLevelIndex], [currentLevelIndex]);
  
  // 3. ADDED USEEFFECT FOR GEMINI API CALL
  useEffect(() => {
    if (step === 'end') {
      const generateInsight = async () => {
        setInsight("Fetching personalized insight...");
        const totalPossibleScore = gameLevels.length * 5;
        const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
        const gameTimedOut = timeLeft <= 0;

        const answersSummary = levelResults.map(res => 
            `- For "${res.location}", user chose "${res.selectedImpact}", which was ${res.isCorrect ? 'correct' : `incorrect. Correct was "${res.correctImpact}"`}.`
        ).join('\n');

        const prompt = `
A student played a game called 'Meltdown Tracker', matching climate impacts to locations. Here is their performance:

Overall Score: ${totalScore} out of ${totalPossibleScore} (${accuracyScore}%)
Game Timed Out: ${gameTimedOut}
Their Answers:
${answersSummary}

### INSTRUCTION ###
Based on their performance, provide a short, encouraging, and holistic insight (20-30 words).
- If the game timed out, the insight MUST focus on the time aspect first.
- If the score is perfect (100%), congratulate them as a "climate expert".
- If the score is high (>=80%), praise their strong geographical knowledge of climate change.
- If they struggled, encourage them to review the answers to better understand these critical connections.

Return ONLY a raw JSON object in the following format (no backticks, no markdown):
{
  "insight": "Your insightful and encouraging feedback here."
}`;

        try {
          const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`,
              { contents: [{ parts: [{ text: prompt }] }] }
          );
          const aiReply = response.data.candidates[0].content.parts[0].text;
          const parsed = parsePossiblyStringifiedJSON(aiReply);
          if (parsed && parsed.insight) {
              setInsight(parsed.insight);
          } else {
              throw new Error("Failed to parse insight from AI response.");
          }
        } catch (err) {
            console.error("Error fetching AI insight:", err);
            // Fallback to original hardcoded insights
            let fallbackInsight = "";
            if (gameTimedOut) {
              fallbackInsight = "Time's up! Review your answers and try to be quicker next time.";
            } else if (accuracyScore === 100) {
              fallbackInsight = "Perfect score! You're a true climate expert!";
            } else if (accuracyScore >= 80) {
              fallbackInsight = "Great work! You have a strong understanding of climate impacts.";
            } else {
              fallbackInsight = "Good effort! Review your answers to become a climate champion.";
            }
            setInsight(fallbackInsight);
        }
      };
      generateInsight();
    }
  }, [step, totalScore, levelResults, timeLeft]);

  useEffect(() => {
    if (step !== "playing") return;
    if (timeLeft <= 0) {
      setStep("end");
      return;
    }
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, step]);

  const handleShowInstructions = () => setIntroStep("instructions");

  const handleNextLevel = useCallback(() => {
    setShowFeedback(false);
    if (currentLevelIndex < gameLevels.length - 1) {
      setCurrentLevelIndex((prevIndex) => prevIndex + 1);
      setSelectedImpact(null);
      setFeedbackMessage("");
    } else {
      setStep("end");
    }
  }, [currentLevelIndex]);

  const handleSubmit = useCallback(() => {
    if (!selectedImpact) return;
    const isCorrect = selectedImpact === currentLevel.correctImpact;
    let message = "";
    let score = 0;

    if (isCorrect) {
      score = 5;
      message = "That's correct! Great job!";
    } else {
      score = 0;
      message = `Not quite. The right match for ${currentLevel.location} is ${currentLevel.correctImpact}.`;
    }

    setTotalScore((prevScore) => prevScore + score);
    setFeedbackMessage(message);
    setShowFeedback(true);

    setLevelResults((prevResults) => [
      ...prevResults,
      {
        location: currentLevel.location,
        selectedImpact: selectedImpact,
        correctImpact: currentLevel.correctImpact,
        isCorrect: isCorrect,
        feedbackMessage: isCorrect ? "You nailed it!" : "A learning moment!",
      },
    ]);
  }, [selectedImpact, currentLevel]);

  const startGame = () => {
    setStep("playing");
    setIntroStep("first");
    setCurrentLevelIndex(0);
    setSelectedImpact(null);
    setTotalScore(0);
    setLevelResults([]);
    setShowFeedback(false);
    setFeedbackMessage("");
    setTimeLeft(180);
  };

  const handleSelectImpact = (impact) => {
    if (showFeedback) return;
    setSelectedImpact(impact);
  };

  const handlePlayAgain = () => startGame();
  const handleReviewAnswers = () => setStep("review");
  const handleBackToResults = () => setStep("end");
  const handleContinue = () => navigate("/environmental/games");

  const buttonText = showFeedback ? "Continue" : "Check Now";
  const isButtonEnabled = !!selectedImpact;

  return (
    <div>
      {step === "intro" && introStep === "first" && (<IntroScreen onShowInstructions={handleShowInstructions} gameTitle="Meltdown Tracker" />)}
      {step === "intro" && introStep === "instructions" && (<InstructionsScreen onStartGame={startGame} gameTitle="Meltdown Tracker" />)}
      {step !== "intro" && (
        <div className="main-container w-full h-[100vh] bg-[#0A160E] relative overflow-hidden flex flex-col justify-between">
          {step === "playing" && currentLevel && (
            <>
              <GameNav timeLeft={timeLeft} />

              <div className="flex-1 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-4xl bg-[#202f36]/30 rounded-xl p-8">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    {allImpactOptions.map((impact) => (
                      <ImpactOptionCard
                        key={impact}
                        impactText={impact}
                        isSelected={selectedImpact === impact}
                        onClick={() => handleSelectImpact(impact)}
                        isDisabled={showFeedback && selectedImpact !== impact}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full h-[10vh] bg-[#28343A] flex justify-evenly items-center px-[5vw] z-10">
                <span className="lilita text-[3.8vh] [-webkit-text-stroke:0.7px_black] text-white">Location: {currentLevel.location}</span>
                <div className="w-[12vw] h-[8vh]">
                  <button className="relative w-full h-full cursor-pointer" onClick={showFeedback ? handleNextLevel : handleSubmit} disabled={!isButtonEnabled}>
                    <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                    <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-[2.5vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>{buttonText}</span>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* 4. UPDATED RENDER LOGIC FOR 'END' STATE */}
          {step === "end" && (() => {
            const totalPossibleScore = gameLevels.length * 5;
            const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
            const gameTimedOut = timeLeft <= 0;
            const isVictory = accuracyScore >= 80 && !gameTimedOut;

            // The 'insightText' is removed, now we use the 'insight' state.
            if (isVictory) {
              return (
                <VictoryScreen
                  accuracyScore={accuracyScore}
                  insight={insight}
                  onViewFeedback={handleReviewAnswers}
                  onContinue={handleContinue}
                />
              );
            } else {
              return (
                <LosingScreen
                  accuracyScore={accuracyScore}
                  insight={insight}
                  onPlayAgain={handlePlayAgain}
                  onViewFeedback={handleReviewAnswers}
                  onContinue={handleContinue}
                />
              );
            }
          })()}

          {step === "review" && (
            <ReviewScreen answers={levelResults} onBackToResults={handleBackToResults} />
          )}
        </div>
      )}
    </div>
  );
}