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

// Placeholder for context functions
const useEnvirnoment = () => ({
  completeEnvirnomentChallenge: (challengeId, taskId) => {
    console.log(
      `(Mock) Environment Challenge ${challengeId}, Task ${taskId} completed!`
    );
  },
});

const usePerformance = () => ({
  updateEnvirnomentPerformance: (data) => {
    console.log("(Mock) Performance updated:", data);
  },
});

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
// Game Data (Question-Based)
// =============================================================================
const questions = [
  {
    "id": 1,
    "question": "Which infrastructure project contributes more to long-term sustainability?",
    "scenario": "A city wants to beautify its downtown area. They're considering two options:",
    "options": [
      "Building decorative fountains in the plaza",
      "Installing vertical gardens on building walls"
    ],
    "correct": "Installing vertical gardens on building walls",
    "explanation": "Vertical gardens improve air quality, provide insulation, and create habitats for wildlife!"
  },
  {
    "id": 2,
    "question": "Which option creates a more sustainable urban environment?",
    "scenario": "The city council is planning street improvements. They need to choose between:",
    "options": [
      "Planting trees along all major streets",
      "Installing bright LED billboards for advertising"
    ],
    "correct": "Planting trees along all major streets",
    "explanation": "Tree-lined streets clean the air, provide shade, reduce heat, and create a healthier environment!"
  },
  {
    "id": 3,
    "question": "Which transportation infrastructure is better for sustainability?",
    "scenario": "Traffic is increasing in the city. The mayor must decide between:",
    "options": [
      "Building dedicated bike lanes throughout the city",
      "Making roads wider to accommodate more cars"
    ],
    "correct": "Building dedicated bike lanes throughout the city",
    "explanation": "Bike lanes reduce pollution, promote health, and create safer streets for everyone!"
  },
  {
    "id": 4,
    "question": "Which water management system is more sustainable?",
    "scenario": "The city needs to improve its water infrastructure. They're debating between:",
    "options": [
      "Building new decorative swimming pools in parks",
      "Installing water reuse and recycling systems"
    ],
    "correct": "Installing water reuse and recycling systems",
    "explanation": "Water reuse systems conserve precious water resources and reduce waste!"
  },
  {
    "id": 5,
    "question": "Which energy infrastructure choice is more sustainable?",
    "scenario": "New buildings are being constructed. The architect must choose between:",
    "options": [
      "Designing tall glass skyscrapers with lots of windows",
      "Installing solar panels on all rooftops"
    ],
    "correct": "Installing solar panels on all rooftops",
    "explanation": "Solar rooftops generate clean, renewable energy and reduce dependence on fossil fuels!"
  },
];

// Data Transformation
const dilemmas = questions.map((q) => ({
  id: q.id,
  question: q.question,
  scenario: q.scenario,
  options: q.options.map((optText) => {
    const isCorrect = optText === q.correct;
    return {
      text: optText,
      score: isCorrect ? 3 : 0,
      consequence: q.explanation, // Using the direct explanation
    };
  }),
}));


// =============================================================================
// Child Components (Unchanged)
// =============================================================================

function OptionCard({ option, isSelected, onClick, isDisabled }) {
  const cardClasses = `flex items-center justify-center inter-font
    w-full min-h-[60px] px-4 py-3 rounded-xl shadow-md transition-all duration-200 ease-in-out cursor-pointer text-center
    lg:w-[24vw] lg:min-h-[7vh] lg:px-[2vw] lg:py-[1.5vh] lg:rounded-[1.2vh] lg:shadow-[0_2px_0_0_#37464f]
    ${
      isSelected
        ? "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428] lg:border-[0.2vh]"
        : "bg-[#131f24] border-2 border-[#37464f] lg:border-[0.2vh]"
    } ${
    isDisabled && !isSelected
      ? "opacity-50 cursor-not-allowed"
      : "hover:scale-102"
  }`;
  
  const textClasses = `font-medium 
    text-base leading-normal 
    lg:text-[1.1vw] lg:leading-[3vh] 
    ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <span className={textClasses}>{option.text}</span>
    </div>
  );
}

function FeedbackCharacter({ message }) {
  return (
    <div className="flex items-end justify-center">
      <img
        src="/feedbackcharacter.gif"
        alt="Character talking"
        className="w-[4rem] md:w-[5rem] h-auto object-contain shrink-0"
      />
      <div className="relative  md:ml-[1rem] md:mb-[2rem]">
        <ThinkingCloud className="w-[180px] md:w-[320px] lg:w-[300px]" />
        <p 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] pl-4
                       text-[9px] md:text-sm leading-tight text-white text-center inter-font font-medium"
        >
          {message}
        </p>
      </div>
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
  return (
    <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center inter-font">
      <style>{scrollbarHideStyle}</style>
      <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grow overflow-y-auto p-2 no-scrollbar">
        {answers.map((ans, idx) => {
            const isCorrect = ans.scoreAwarded === 3;
            return (
             <div key={idx} className={`p-4 rounded-xl flex flex-col ${isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
               <p className="text-gray-300 text-base mb-2 font-bold">{ans.scenario}</p>
               <div className="text-sm space-y-1">
                 <p className="font-semibold">Your Answer:</p>
                 <p className={`${isCorrect ? 'text-white' : 'text-red-300'}`}>
                   {ans.selectedOption.text}
                 </p>
                 {!isCorrect && (
                   <>
                     <p className="font-semibold pt-2">Correct Answer:</p>
                     <p className="text-green-300">{ans.correctAnswerText}</p>
                   </>
                 )}
               </div>
             </div>
            );
        })}
      </div>
      <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-b-0 shadow-lg">
        Back to Results
      </button>
    </div>
  );
}


// =============================================================================
// Main Game Component
// =============================================================================

export default function InfrastructureShowdown() { // Renamed for clarity based on prompt
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  const { updateEnvirnomentPerformance } = usePerformance();
  const navigate = useNavigate();

  const [step, setStep] = useState("intro");
  const [introStep, setIntroStep] = useState("first");
  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [dilemmaResults, setDilemmaResults] = useState([]);
  const [insight, setInsight] = useState(""); // 2. ADDED INSIGHT STATE

  const currentDilemma = useMemo(() => dilemmas[currentDilemmaIndex], [currentDilemmaIndex]);

  // 3. ADDED USEEFFECT FOR GEMINI API CALL
  useEffect(() => {
    if (step === 'end') {
      const generateInsight = async () => {
        setInsight("Fetching personalized insight...");
        const totalPossibleScore = dilemmas.length * 3;
        const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
        
        const answersSummary = dilemmaResults.map(res =>
            `- For "${res.scenario}", user chose "${res.selectedOption.text}", which was ${res.scoreAwarded === 3 ? 'correct' : 'incorrect'}.`
        ).join('\n');

        const prompt = `
A student played a quiz, 'Infrastructure Showdown', choosing the more sustainable infrastructure project from two options. Here's their performance:

- Accuracy: ${accuracyScore}%
- Their Answers:
${answersSummary}

### INSTRUCTION ###
Provide a short, holistic insight (20-30 words) on their ability to identify sustainable infrastructure.
- If score is 100%, praise them as a "master urban planner" with a clear vision for green cities.
- If score is >= 70%, acknowledge their strong decision-making for sustainable development.
- If they struggled, encourage them, noting that choosing the best long-term solution is key, and suggest reviewing their answers.

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
            if (accuracyScore === 100) {
              fallbackInsight = "Perfect score! You're a true urban planner with a vision for green cities!";
            } else if (accuracyScore >= 70) {
              fallbackInsight = "Great choices! You have a solid understanding of sustainable infrastructure.";
            } else {
              fallbackInsight = "Good start! Choosing long-term sustainability is key. Review your answers to become an expert.";
            }
            setInsight(fallbackInsight);
        }
      };
      generateInsight();
    }
  }, [step, totalScore, dilemmaResults]);

  const handleShowInstructions = () => setIntroStep("instructions");

  const handleNextDilemma = useCallback(() => {
    setShowFeedback(false);
    if (currentDilemmaIndex < dilemmas.length - 1) {
      setCurrentDilemmaIndex((prevIndex) => prevIndex + 1);
      setSelectedOption(null);
      setFeedbackMessage("");
    } else {
      setStep("end");
    }
  }, [currentDilemmaIndex]);

  const handleSubmit = useCallback(() => {
    if (!selectedOption) {
      setFeedbackMessage("Please select an option.");
      setShowFeedback(true);
      return;
    }

    const { score, consequence } = selectedOption;
    
    setTotalScore((prevScore) => prevScore + score);
    setFeedbackMessage(consequence);
    setShowFeedback(true);

    const correctAnswer = currentDilemma.options.find(opt => opt.score === 3);

    setDilemmaResults((prevResults) => [...prevResults, {
      scenario: currentDilemma.question,
      selectedOption: selectedOption,
      scoreAwarded: score,
      correctAnswerText: correctAnswer ? correctAnswer.text : "N/A",
    }]);

  }, [selectedOption, currentDilemma]);

  const startGame = () => {
    setStep("playing");
    setIntroStep("first");
    setCurrentDilemmaIndex(0);
    setSelectedOption(null);
    setTotalScore(0);
    setDilemmaResults([]);
    setShowFeedback(false);
    setFeedbackMessage("");
  };

  const handleSelectOption = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
  };
  
  const handlePlayAgain = () => startGame();
  const handleReviewAnswers = () => setStep("review");
  const handleBackToResults = () => setStep("end");
  const handleContinue = () => navigate("/environmental/games");

  const buttonText = showFeedback ? "Continue" : "Check Now";
  const isButtonEnabled = showFeedback || selectedOption !== null;

  return (
    <div>
      {step === "intro" && introStep === "first" && (<IntroScreen onShowInstructions={handleShowInstructions} />)}
      {step === "intro" && introStep === "instructions" && (<InstructionsScreen onStartGame={startGame} />)}
      
      {step !== "intro" && (
        <div className="main-container w-full h-screen bg-[#0A160E] relative overflow-hidden flex flex-col justify-between inter-font">
          {step === "playing" && currentDilemma && (
            <>
              <GameNav />

              <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
                
                <div className="flex-grow flex items-center justify-center p-4">
                  <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-10">
                    <div className="flex flex-col justify-center items-center gap-5 text-center">
                        <h2 className="text-slate-100 text-xl md:text-2xl font-medium leading-snug md:leading-9">
                            {currentDilemma.question}
                        </h2>
                        <p className="text-gray-300 text-sm md:text-base leading-relaxed font-regular">
                            <span className="font-bold">Scenario:</span> {currentDilemma.scenario}
                        </p>

                        <div className="w-full max-w-lg mt-4 flex flex-col justify-start items-stretch gap-4">
                            {currentDilemma.options.map((option, index) => {
                                const isSelected = selectedOption?.text === option.text;
                                const isDisabled = showFeedback && !isSelected;

                                return (
                                    <div
                                        key={index}
                                        onClick={() => handleSelectOption(option)}
                                        className={`
                                            w-full p-4 min-h-[60px] flex justify-center items-center text-center
                                            rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] 
                                            border transition-all duration-200
                                            ${isSelected
                                                ? 'bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]'
                                                : 'bg-gray-900 border-gray-700'
                                            }
                                            ${isDisabled
                                                ? 'opacity-50 cursor-not-allowed'
                                                : 'cursor-pointer hover:bg-gray-800'
                                            }
                                        `}
                                    >
                                        <span className={`
                                            font-medium 
                                            text-sm md:text-base leading-relaxed
                                            ${isSelected ? 'text-[#79b933]' : 'text-slate-100'}
                                        `}>
                                            {option.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                  </div>
                </div>
                
                <div className="w-full h-28 md:h-32 flex justify-center items-end shrink-0">
                  <div className={`transition-opacity duration-300 ${showFeedback ? 'opacity-100' : 'opacity-0'}`}>
                    <FeedbackCharacter message={feedbackMessage} />
                  </div>
                </div>

              </div>

              <div className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 z-10 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                  <button className="relative w-full h-full cursor-pointer" onClick={showFeedback ? handleNextDilemma : handleSubmit} disabled={!isButtonEnabled}>
                    <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                    <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>
                      {buttonText}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* 4. UPDATED RENDER LOGIC FOR 'END' STATE WITH CORRECTION */}
          {step === "end" && (() => {
            const totalPossibleScore = dilemmas.length * 3;
            const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
            
            // Corrected: Victory is ONLY when the score is 100%.
            const isVictory = accuracyScore === 100;
            
            // The hardcoded 'insightText' is removed. We now use the 'insight' state variable from the useEffect hook.
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
            <ReviewScreen answers={dilemmaResults} onBackToResults={handleBackToResults} />
          )}
        </div>
      )}
    </div>
  );
}