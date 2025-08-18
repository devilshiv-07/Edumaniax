import React, { useState, useEffect, useMemo, useCallback } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useEnvirnoment } from "@/contexts/EnvirnomentContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import { Star } from "lucide-react";
import GameNav from "./GameNav";
import axios from "axios"; // 1. ADDED AXIOS IMPORT

// ======================= CHANGE 1: Import new screens =======================
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import { useNavigate } from "react-router-dom";
// ============================================================================

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

// =============================================================================
// Reusable End-Screen Components (No Changes Here)
// =============================================================================

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
    return (
      <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center inter-font">
        <style>{scrollbarHideStyle}</style>
        <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
        <div className="flex-grow w-full flex items-center justify-center lg:items-stretch">
          <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6 p-2 lg:h-full">
            
            {/* Review for Sequence */}
            <div className={`p-4 rounded-xl flex flex-col ${answers.sequence.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
              <p className="text-gray-300 text-lg mb-2 font-bold">{gameData.sequence.title}</p>
              <div className="text-sm space-y-1">
                <p className="font-semibold">Your Sequence:</p>
                <ol className="list-decimal list-inside pl-2">
                  {answers.sequence.userAnswer.map(item => <li key={item}>{item}</li>)}
                </ol>
                {!answers.sequence.isCorrect && (
                  <>
                    <p className="font-semibold pt-2">Correct Sequence:</p>
                    <ol className="list-decimal list-inside text-green-300 pl-2">
                        {gameData.sequence.correctOrder.map(item => <li key={item}>{item}</li>)}
                    </ol>
                  </>
                )}
              </div>
            </div>
            
            {/* Review for MCQ */}
            <div className={`p-4 rounded-xl flex flex-col ${answers.mcq.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
              <p className="text-gray-300 text-lg mb-2 font-bold">{gameData.mcq.title}</p>
              <div className="text-sm space-y-1">
                <p className="font-semibold">Your Answer:</p>
                <p className={`${answers.mcq.isCorrect ? 'text-white' : 'text-red-300'}`}>{answers.mcq.userAnswer || "Not Answered"}</p>
                {!answers.mcq.isCorrect && (
                  <>
                    <p className="font-semibold pt-2">Correct Answer:</p>
                    <p className="text-green-300">{gameData.mcq.correctAnswer}</p>
                  </>
                )}
              </div>
            </div>

            {/* Review for Matching */}
            <div className={`p-4 rounded-xl flex flex-col ${answers.matching.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
              <p className="text-gray-300 text-lg mb-2 font-bold">{gameData.matching.title}</p>
              <div className="text-sm space-y-2">
                {Object.entries(gameData.matching.correctAnswers).map(([category, correctAnswer]) => {
                    const userAnswer = answers.matching.userAnswer[category];
                    const isItemCorrect = userAnswer === correctAnswer;
                    return (
                        <div key={category}>
                            <p className="font-semibold">{category}:</p>
                            <p className={isItemCorrect ? 'text-white' : 'text-red-300'}>{userAnswer || "Not Answered"}</p>
                            {!isItemCorrect && <p className="text-green-300">Correct: {correctAnswer}</p>}
                        </div>
                    )
                })}
              </div>
            </div>

          </div>
        </div>
        
        <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-b-0 shadow-lg">
          Back to Results
        </button>
      </div>
    );
}

// =============================================================================
// Game Data
// =============================================================================
const gameData = {
  sequence: { id: 1, title: "🔍 Fix the sequence", prompt: "Rearrange the scrambled steps of the carbon cycle into the correct order.", initialOrder: [ "Respiration", "Combustion", "Photosynthesis", "Decomposition", "Ocean uptake", ], correctOrder: [ "Photosynthesis", "Respiration", "Decomposition", "Ocean uptake", "Combustion", ], },
  mcq: { id: 2, title: "🧪 Disruption Diagnosis", prompt: "A sudden spike in atmospheric CO₂ is detected. Forest cover is down 40%, and fossil fuel use is up 60%. Which of these human activities is the primary driver?", options: [ "Mining", "Deforestation", "Industrial farming", "Fossil fuel combustion", ], correctAnswer: "Fossil fuel combustion", },
  matching: { id: 3, title: "🔧 System Repair", prompt: "Match the component to its correct role in the carbon cycle", categories: ["FOREST", "FOSSIL FUELS", "OCEANS"], options: [ "Carbon Sink", "Carbon Source", "Carbon sink & Temporary Reservoir", ], correctAnswers: { "FOREST": "Carbon Sink", "FOSSIL FUELS": "Carbon Source", "OCEANS": "Carbon sink & Temporary Reservoir", }, },
};

// =============================================================================
// Child Components (Game Questions)
// =============================================================================

function SequenceQuestion({ sequence, setSequence }) {
  const handleDragStart = (e, idx) => e.dataTransfer.setData("text/plain", idx);
  const handleDrop = (e, idx) => {
    const draggedIdx = e.dataTransfer.getData("text/plain");
    if (draggedIdx === idx) return;
    const newSequence = [...sequence];
    const [draggedItem] = newSequence.splice(draggedIdx, 1);
    newSequence.splice(idx, 0, draggedItem);
    setSequence(newSequence);
  };

  return (
    <div className="w-full max-w-3xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
      <div className="flex flex-col justify-center items-start gap-5 lg:gap-6">
        <div className="px-1 flex flex-col justify-center items-start lg:gap-1">
          <h2 className="text-slate-100 text-xl md:text-2xl font-medium leading-9">{gameData.sequence.title}</h2>
          <p className="text-slate-100 text-xs md:text-base font-semibold leading-relaxed">{gameData.sequence.prompt}</p>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          {sequence.map((step, idx) => (
            <div key={step} draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, idx)} className="self-stretch lg:min-h-[60px] px-6 py-3 lg:py-0 bg-gray-900 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border border-gray-700 flex items-center cursor-move transition-all hover:bg-gray-700">
              <span className="text-slate-100 text-sm lg:text-base font-medium leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function McqQuestion({ selectedAnswer, setSelectedAnswer }) {
  return (
    <div className="w-full max-w-3xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
      <div className="flex flex-col justify-center items-start gap-10">
        <div className="px-1 flex flex-col justify-center items-start gap-2">
          <h2 className="text-slate-100 text-xl md:text-2xl font-medium leading-9">{gameData.mcq.title}</h2>
          <p className="text-slate-100 text-xs md:text-base font-semibold leading-relaxed">{gameData.mcq.prompt}</p>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          {gameData.mcq.options.map((option) => {
            const isSelected = selectedAnswer === option;
            return (
              <div key={option} onClick={() => setSelectedAnswer(option)} className={`self-stretch lg:min-h-[60px] px-6 py-3 lg:py-0 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border flex items-center cursor-pointer transition-all ${ isSelected ? "bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]" : "bg-gray-900 border-gray-700 hover:bg-gray-800"}`}>
                <span className={`text-sm lg:text-base font-medium leading-relaxed ${isSelected ? "text-[#79b933]" : "text-slate-100"}`}>{option}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MatchingQuestion({ answers, setAnswers }) {
  const handleSelect = (category, option) => setAnswers(prev => ({...prev, [category]: option}));
  return (
    <div className="w-full max-w-3xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
      <div className="flex flex-col justify-center items-start gap-8">
        <div className="px-1 flex flex-col justify-center items-start gap-1.5 md:gap-1">
          <h2 className="text-slate-100 text-xl md:text-2xl font-medium leading-9">{gameData.matching.title}</h2>
          <p className="text-slate-100 text-sm md:text-base font-semibold leading-relaxed">{gameData.matching.prompt}</p>
        </div>
        <div className="flex flex-col gap-5">
        {gameData.matching.categories.map(category => (
            <div key={category} className="w-full">
                <p className="text-slate-100 text-sm lg:text-base font-bold leading-relaxed mb-1 ml-1">{category}</p>
                <div className="flex flex-col md:flex-row flex-wrap md:flex-nowrap justify-start items-stretch md:items-start gap-4 ">
                    {gameData.matching.options.map(option => {
                        const isSelected = answers[category] === option;
                        return (
                             <div key={option} onClick={() => handleSelect(category, option)} className={`px-6 py-4 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border flex items-center cursor-pointer transition-all ${isSelected ? "bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]" : "bg-gray-900 border-gray-700 hover:bg-gray-800"}`}>
                                <span className={`text-center text-xs md:text-sm lg:text-base font-medium leading-relaxed ${isSelected ? "text-[#79b933]" : "text-slate-100"}`}>{option}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        ))}</div>
      </div>
    </div>
  );
}
// =============================================================================
// Main Game Component
// =============================================================================

export default function CarbonCycleGame() {
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  const { updateEnvirnomentPerformance } = usePerformance();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState("intro");
  const [introStep, setIntroStep] = useState("first"); 
  const [gameStep, setGameStep] = useState("sequence");
  const [insight, setInsight] = useState(""); // 2. ADDED INSIGHT STATE
  
  const [sequenceAnswer, setSequenceAnswer] = useState(gameData.sequence.initialOrder);
  const [mcqAnswer, setMcqAnswer] = useState(null);
  const [matchingAnswers, setMatchingAnswers] = useState({});
  const [finalResults, setFinalResults] = useState(null);

  // 3. ADDED USEEFFECT FOR GEMINI API CALL
  useEffect(() => {
      if (gameState === 'end' && finalResults) {
          const generateInsight = async () => {
              setInsight("Fetching personalized insight...");
              
              const answersSummary = `
- Sequence Correct: ${finalResults.review.sequence.isCorrect}
- MCQ Correct: ${finalResults.review.mcq.isCorrect}
- Matching Correct: ${finalResults.review.matching.isCorrect}`;

              const prompt = `
A student completed a 3-part quiz on the Carbon Cycle. Here is their performance:

- Overall Accuracy: ${finalResults.accuracy}%
- Part-by-part results:
${answersSummary}

### INSTRUCTION ###
Provide a short, holistic insight (about 20 words) on their overall understanding of the Carbon Cycle.
- If they scored 100%, praise them as a "Carbon Cycle expert".
- If they scored well (>=70%), acknowledge their solid knowledge.
- If they struggled, encourage them, noting the topic's complexity, and suggest reviewing the answers to connect the concepts.

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
                  if (finalResults.accuracy === 100) {
                      fallbackInsight = "Perfect score! You're a true Carbon Cycle expert, understanding its every part!";
                  } else if (finalResults.accuracy >= 70) {
                      fallbackInsight = "Excellent work! You have a strong grasp of the Carbon Cycle's key processes.";
                  } else {
                      fallbackInsight = "Good effort! The Carbon Cycle is complex. Reviewing your answers will help connect all the dots.";
                  }
                  setInsight(fallbackInsight);
              }
          };
          generateInsight();
      }
  }, [gameState, finalResults]);

  const startGame = () => {
    setGameState("playing");
    setGameStep("sequence");
    setIntroStep("first");
    setSequenceAnswer(gameData.sequence.initialOrder);
    setMcqAnswer(null);
    setMatchingAnswers({});
    setFinalResults(null);
  };

  const handleNextStep = () => {
    if (gameStep === "sequence") {
      setGameStep("mcq");
    } else if (gameStep === "mcq") {
      setGameStep("matching");
    } else if (gameStep === "matching") {
      let score = 0;
      const totalQuestions = 3;

      const isSequenceCorrect = JSON.stringify(sequenceAnswer) === JSON.stringify(gameData.sequence.correctOrder);
      if (isSequenceCorrect) score++;

      const isMcqCorrect = mcqAnswer === gameData.mcq.correctAnswer;
      if (isMcqCorrect) score++;

      const isMatchingCorrect = gameData.matching.categories.every(cat => matchingAnswers[cat] === gameData.matching.correctAnswers[cat]);
      if (isMatchingCorrect) score++;
      
      const accuracy = Math.round((score / totalQuestions) * 100);

      setFinalResults({
        score,
        accuracy,
        review: {
            sequence: { isCorrect: isSequenceCorrect, userAnswer: sequenceAnswer },
            mcq: { isCorrect: isMcqCorrect, userAnswer: mcqAnswer },
            matching: { isCorrect: isMatchingCorrect, userAnswer: matchingAnswers },
        }
      });
      setGameState("end");
    }
  };
  
  const { isButtonEnabled, buttonText } = useMemo(() => {
    switch (gameStep) {
      case "sequence": return { isButtonEnabled: true, buttonText: "Continue" };
      case "mcq": return { isButtonEnabled: !!mcqAnswer, buttonText: "Continue" };
      case "matching":
        const allMatched = gameData.matching.categories.every(cat => !!matchingAnswers[cat]);
        return { isButtonEnabled: allMatched, buttonText: "Submit" };
      default: return { isButtonEnabled: false, buttonText: "Continue" };
    }
  }, [gameStep, mcqAnswer, matchingAnswers]);

  const handleShowInstructions = () => setIntroStep("instructions");
  const handlePlayAgain = () => startGame();
  const handleReviewAnswers = () => setGameState("review");
  const handleBackToResults = () => setGameState("end");
  const handleContinue = () => navigate("/environmental/games");


  return (
    <div>
      {gameState === "intro" && introStep === "first" && (<IntroScreen onShowInstructions={handleShowInstructions} />)}
      {gameState === "intro" && introStep === "instructions" && (<InstructionsScreen onStartGame={startGame} />)}
      
      {gameState === "playing" && (
        <div className="main-container w-full h-screen bg-[#0A160E] relative overflow-hidden flex flex-col justify-between inter-font">
          <GameNav />
          <div className="flex-1 flex flex-col items-center justify-start md:justify-center overflow-y-auto no-scrollbar p-4">
            {gameStep === "sequence" && <SequenceQuestion sequence={sequenceAnswer} setSequence={setSequenceAnswer} />}
            {gameStep === "mcq" && <McqQuestion selectedAnswer={mcqAnswer} setSelectedAnswer={setMcqAnswer} />}
            {gameStep === "matching" && <MatchingQuestion answers={matchingAnswers} setAnswers={setMatchingAnswers} />}
          </div>
          <div className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 z-10 shrink-0">
            <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
              <button className="relative w-full h-full cursor-pointer" onClick={handleNextStep} disabled={!isButtonEnabled}>
                <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>
                  {buttonText}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. UPDATED RENDER LOGIC FOR 'END' STATE */}
      {gameState === "end" && finalResults && (() => {
        // The 'insightText' is removed. We now use the 'insight' state variable from the useEffect hook.
        const isVictory = finalResults.accuracy >= 70;
        
        if (isVictory) {
          return (
            <VictoryScreen
              accuracyScore={finalResults.accuracy}
              insight={insight}
              onViewFeedback={handleReviewAnswers}
              onContinue={handleContinue}
            />
          );
        } else {
          return (
            <LosingScreen
              accuracyScore={finalResults.accuracy}
              insight={insight}
              onPlayAgain={handlePlayAgain}
              onViewFeedback={handleReviewAnswers}
              onContinue={handleContinue}
            />
          );
        }
      })()}

      {gameState === "review" && finalResults && (
        <ReviewScreen answers={finalResults.review} onBackToResults={handleBackToResults} />
      )}
    </div>
  );
}