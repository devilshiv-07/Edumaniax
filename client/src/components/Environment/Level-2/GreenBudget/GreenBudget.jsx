import React, { useState, useEffect, useMemo, useCallback } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import ThinkingCloud from "@/components/icon/ThinkingCloud";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import { useNavigate } from "react-router-dom";

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
// Game Data (Centralized) with Icons
// =============================================================================
const questions = [
  {
    id: 1,
    scenario:
      "Your school wants to reduce its environment footprint. Pick 3 items.",
    items: [
      { name: "Solar lights", cost: 250, imageUrl: "/financeGames6to8/level-1/weekend-movie.svg", sustainable: true },
      { name: "Compost bins", cost: 150, imageUrl: "/financeGames6to8/level-1/ice-cream.svg", sustainable: true },
      { name: "Poster printout", cost: 100, imageUrl: "/financeGames6to8/level-1/data-plan.svg", sustainable: false },
      { name: "Packaged water", cost: 100, imageUrl: "/financeGames6to8/level-1/gift.svg", sustainable: false },
      { name: "Plastic Dustin", cost: 100, imageUrl: "/financeGames6to8/level-1/ice-cream.svg", sustainable: false },
      { name: "Cloth Banner", cost: 100, imageUrl: "/financeGames6to8/level-1/shoes.svg", sustainable: true },
    ],
  },
  {
    id: 2,
    scenario: "Design a 'green corner' for your classroom.",
    items: [
      { name: "Indoor plant set", cost: 150, imageUrl: "/financeGames6to8/level-1/shoes.svg", sustainable: true },
      { name: "Educational eco-posters", cost: 100, imageUrl: "/financeGames6to8/level-1/lend-to-a-friend.svg", sustainable: true },
      { name: "Plastic plant holders", cost: 100, imageUrl: "/financeGames6to8/level-1/weekend-movie.svg", sustainable: false },
      { name: "LED study lamp", cost: 250, imageUrl: "/financeGames6to8/level-1/data-plan.svg", sustainable: true },
      { name: "Disposable cups", cost: 100, imageUrl: "/financeGames6to8/level-1/ice-cream.svg", sustainable: false },
    ],
  },
  {
    id: 3,
    scenario: "Reduce waste at your school canteen.",
    items: [
      { name: "Steel utensils", cost: 200, imageUrl: "/financeGames6to8/level-1/ice-cream.svg", sustainable: true },
      { name: "Paper straws", cost: 100, imageUrl: "/financeGames6to8/level-1/data-plan.svg", sustainable: true },
      { name: "Plastic cutlery", cost: 100, imageUrl: "/financeGames6to8/level-1/weekend-movie.svg", sustainable: false },
      { name: "Compost bin", cost: 150, imageUrl: "/financeGames6to8/level-1/lend-to-a-friend.svg", sustainable: true },
      { name: "Promotional balloons", cost: 100, imageUrl: "/financeGames6to8/level-1/gift.svg", sustainable: false },
    ],
  },
];

const initialBudget = 500;
const itemsToSelect = 3;

// =============================================================================
// Components (Nested within the main file)
// =============================================================================

function ItemCard({ item, isSelected, onClick, isDisabled }) {
  // Mobile-first compact styles, md for tablet, lg for original desktop vw/vh styles
  const cardClasses = `flex items-center w-full p-1.5 rounded-lg transition-all duration-200 ease-in-out cursor-pointer 
    md:min-h-[70px] md:p-2 
    lg:w-[27vw] lg:min-h-[9vh] lg:px-[2vw] lg:py-[1.5vh] lg:rounded-[1.2vh] 
    ${isSelected 
      ? "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428] lg:border-[0.2vh]" 
      : "bg-[#131f24] border-2 border-[#37464f] shadow-[0_2px_0_0_#37464f] lg:border-[0.2vh]"} 
    ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "hover:scale-102"}`;

  const walletIconUrl = isSelected ? "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-04/tuvaKMgcsm.png" : "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-04/CGOQJaAXZU.png";
  
  const nameClasses = `font-['Inter'] font-medium text-xs 
    md:text-sm 
    lg:text-[1.4vw] lg:leading-[2.5vh] 
    ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}`;
    
  const costClasses = `font-['Lilita_One'] font-normal text-[#fff] ml-1 text-[11px] 
    md:text-xs 
    lg:text-[1.2vw] lg:leading-[2.5vh] lg:ml-[0.5vw]`;

  const iconClasses = `w-7 h-7 shrink-0 object-contain ml-auto 
    md:w-8 md:h-8 
    lg:w-[2vw] lg:h-[2vw]`;

  const priceContainerClasses = `flex w-16 h-8 justify-center items-center rounded-md border-2 
    md:w-20 md:h-9 
    lg:w-[7vw] lg:h-[4vh] lg:rounded-[0.8vh] lg:border-[0.2vh] 
    ${isSelected ? "border-[#79b933]" : "border-[#37464f]"}`;

  const priceIconClasses = `w-4 h-4 shrink-0 object-contain 
    md:w-5 md:h-5 
    lg:w-[2.5vh] lg:h-[2.5vh]`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className={priceContainerClasses}>
        <img src={walletIconUrl} alt="wallet icon" className={priceIconClasses} />
        <span className={costClasses}>₹{item.cost}</span>
      </div>
      <div className="flex-1 px-2 md:px-3 lg:px-[1vw]"><span className={nameClasses}>{item.name}</span></div>
      <img src={item.imageUrl} alt={item.name} className={iconClasses} />
    </div>
  );
}

function FeedbackGIF({ message }) {
  // This entire component will be hidden on mobile screens using className on the parent div in GreenBudgetGame
  return (
    <div className="absolute flex items-end 
      md:left-18 md:-bottom-8 
      lg:-right-[9vw] lg:-bottom-[6vh] lg:left-auto">
      <img src="/feedbackcharacter.gif" alt="Character talking" className="w-28 h-auto object-contain md:w-28 lg:w-[10vw] lg:h-[15vh]" />
      <div className="absolute  
        md:left-28 md:bottom-16
        lg:left-[8vw] lg:bottom-[6vh]">
          <ThinkingCloud width="110px" className="md:w-[21vw] lg:w-[11vw]" />
      </div>
      <p className="absolute w-full text-xs text-white text-center font-['Comic_Neue']
        md:bottom-[88px] md:left-[140px]
        lg:bottom-[11vh] lg:left-[8.8vw] lg:text-[0.7vw]">
          {message}
      </p>
    </div>
  );
}

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden text-center">
                <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
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
                                <span className="text-[#FFCC00] lilita-one-regular text-sm font-medium italic">{insight}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                    <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                    <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                </div>
            </div>
        </>
    );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden text-center">
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close! Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
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
                            <span className="text-[#FFCC00] lilita-one-regular text-sm font-medium italic">{insight}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}


function ReviewScreen({ answers, onBackToResults }) {
    // FIX: This component is updated to use the actual data structure from the game (`scenario`, `selectedItems`, etc.)
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 sm:p-6 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-bold lilita-one-regular my-6 text-yellow-400 flex-shrink-0">Review Your Choices</h1>
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-grow overflow-y-auto">
                {answers.map((ans, idx) => {
                    const isGoodChoice = ans.scoreAwarded > 0;
                    return (
                        <div key={idx} className={`p-4 rounded-xl flex flex-col ${isGoodChoice ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                            <p className="text-gray-300 text-base mb-2 leading-tight font-bold">{ans.scenario}</p>
                            <div className="text-sm space-y-2 ">
                                <p className="font-semibold">Your Selection:</p>
                                <p className={`font-mono ${isGoodChoice ? 'text-white' : 'text-red-300'}`}>{ans.selectedItems.map(item => item.name).join(", ") || "Not Answered"}</p>
                                <p className="font-semibold pt-2">Feedback:</p>
                                <p className={`font-mono ${isGoodChoice ? 'text-white' : 'text-red-300'}`}>{ans.feedbackMessage}</p>
                            </div>
                        </div>
                    );
                })}
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

// =============================================================================
// Main Game Component: GreenBudgetGame
// =============================================================================

export default function GreenBudgetGame() {
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  const { updateEnvirnomentPerformance } = usePerformance();
  const navigate = useNavigate();

  const [step, setStep] = useState("intro");
  const [introStep, setIntroStep] = useState("first");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);
  const [remainingBalance, setRemainingBalance] = useState(initialBudget);
  const [totalScore, setTotalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [scoreAwarded, setScoreAwarded] = useState(0);
  const [scenarioResults, setScenarioResults] = useState([]);

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [currentQuestionIndex]);

  const handleShowInstructions = () => setIntroStep("instructions");

  const handleNextQuestion = useCallback(() => {
    setShowFeedback(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedItems([]);
      setRemainingBalance(initialBudget);
      setFeedbackMessage("");
    } else {
      setStep("end");
    }
  }, [currentQuestionIndex]);

  const handleSubmit = useCallback(() => {
    if (selectedItems.length !== itemsToSelect) {
      setFeedbackMessage("Please select exactly 3 items.");
      setScoreAwarded(0);
      setShowFeedback(true);
      return;
    }

    const sustainableCount = selectedItems.filter((item) => item.sustainable).length;
    let newScore = 0;
    let message = "";

    if (sustainableCount === itemsToSelect) {
      newScore = 5; message = "Good going";
    } else if (sustainableCount === 2) {
      newScore = 2; message = "Good attempt, can do better";
    } else {
      newScore = 0; message = "try harder next time";
    }

    setTotalScore((prevScore) => prevScore + newScore);
    setScoreAwarded(newScore);
    setFeedbackMessage(message);
    setShowFeedback(true);

    setScenarioResults((prevResults) => [...prevResults, { scenario: currentQuestion.scenario, selectedItems: selectedItems, scoreAwarded: newScore, feedbackMessage: message }]);
  }, [selectedItems, currentQuestion]);

  const startGame = () => {
    setStep("playing");
    setIntroStep("first");
    setCurrentQuestionIndex(0);
    setSelectedItems([]);
    setRemainingBalance(initialBudget);
    setTotalScore(0);
    setScenarioResults([]);
    setShowFeedback(false);
    setFeedbackMessage("");
    setScoreAwarded(0);
  };

  const toggleItem = (item) => {
    if (showFeedback) return;
    const isSelected = selectedItems.some((selected) => selected.name === item.name);
    let newSelectedItems;
    if (isSelected) {
      newSelectedItems = selectedItems.filter((selected) => selected.name !== item.name);
      setRemainingBalance((prevBalance) => prevBalance + item.cost);
    } else {
      if (selectedItems.length >= itemsToSelect) return;
      if (remainingBalance < item.cost) {
        setFeedbackMessage("Not enough balance for this item!");
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000);
        return;
      }
      newSelectedItems = [...selectedItems, item];
      setRemainingBalance((prevBalance) => prevBalance - item.cost);
    }
    setSelectedItems(newSelectedItems);
    setShowFeedback(false);
  };

  const handlePlayAgain = () => startGame();
  const handleReviewAnswers = () => setStep("review");
  const handleBackToResults = () => setStep("end");
  const handleContinue = () => navigate("/environmental/games");

  const buttonText = showFeedback ? "Continue" : "Check Now";
  const isButtonEnabled = showFeedback || selectedItems.length === itemsToSelect;
    
  return (
    <div>
      {step === "intro" && introStep === "first" && (<IntroScreen onShowInstructions={handleShowInstructions} />)}
      {step === "intro" && introStep === "instructions" && (<InstructionsScreen onStartGame={startGame} />)}
      {step !== "intro" && (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col justify-between">
          {step === "playing" && currentQuestion && (
            <>
              <GameNav />
              {/* Main content area: Stacks on mobile, row on medium+, original vw/vh on large+ */}
              <div className="flex flex-col flex-1 items-center w-full p-4 gap-4 
                md:flex-row md:justify-center md:items-start md:p-6 md:gap-8 
                lg:flex-row lg:items-center lg:justify-center lg:px-[5vw] lg:py-[2vh] lg:gap-[4vw]">
                
                {/* Item List: Fixed height on mobile, scroll on medium+, original on large+ */}
                <div className="w-full flex flex-col gap-2 p-3 bg-[rgba(32,47,54,0.3)] rounded-lg h-[370px]
                    md:w-1/2 md:h-[75vh] md:overflow-y-auto md:gap-3 
                    lg:w-auto lg:h-[68vh] lg:py-[3vh] lg:p-[2vh] lg:rounded-[1.2vh] lg:gap-[1.5vh]">
                  {currentQuestion.items.map((item) => (
                    <ItemCard
                      key={item.name}
                      item={item}
                      isSelected={selectedItems.some((selected) => selected.name === item.name)}
                      onClick={() => toggleItem(item)}
                      isDisabled={
                        (selectedItems.length >= itemsToSelect && !selectedItems.some((selected) => selected.name === item.name)) ||
                        (remainingBalance < item.cost && !selectedItems.some((selected) => selected.name === item.name))
                      }
                    />
                  ))}
                </div>

                {/* Scenario Box: Responsive sizing and original vw/vh on large */}
                <div className="relative flex flex-col w-full p-6 bg-[rgba(32,47,54,0.3)] rounded-lg justify-center items-center text-white text-center 
                  md:w-1/2 md:h-[75vh] 
                  lg:w-[29vw] lg:h-[68vh] lg:p-[4vh] lg:rounded-[1.2vh]">
                    <span className="font-['Inter'] text-lg font-medium 
                      md:text-xl 
                      lg:text-[1.4vw] lg:leading-[3vh] lg:max-w-[30vw]">
                        {currentQuestion.scenario}
                    </span>
                    {/* Feedback GIF is hidden on mobile, appears on medium+ */}
                    <div className="hidden md:block">
                        {showFeedback && <FeedbackGIF message={feedbackMessage} />}
                    </div>
                </div>

              </div>
              
              {/* Bottom Navigation */}
              <div className="w-full h-auto bg-[#28343A] flex flex-col items-center p-3 gap-4 z-10 
                sm:flex-row sm:justify-between 
                lg:flex-row lg:justify-evenly lg:h-[10vh] lg:px-[5vw]">
                <div className="flex items-center gap-3 lg:gap-[1vw]">
                  <div className="w-14 h-14 rounded-full bg-[#232e34] border-2 border-white flex justify-center items-center lg:w-[7vh] lg:h-[7vh] lg:border-[0.2vh]">
                    <img src="/Coin_gold.png" alt="wallet" className="w-10 h-10 lg:w-[5vh] lg:h-[5vh]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="lilita text-lg text-[#ffcc00] [text-stroke:1px_black] tracking-wider lg:text-[2.5vh] lg:tracking-[0.05vw]">Total Wallet:</span>
                    <span className="lilita text-lg text-white lg:text-[2.5vh]">₹{remainingBalance}</span>
                  </div>
                </div>
                <div className="w-48 h-16 lg:w-[12vw] lg:h-[8vh]">
                  <button className="relative w-full h-full cursor-pointer" onClick={showFeedback ? handleNextQuestion : handleSubmit} disabled={!isButtonEnabled}>
                    <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                    <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-xl text-white [text-shadow:0_3px_0_#000] lg:text-[2.5vh] ${!isButtonEnabled && "opacity-50"}`}>{buttonText}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "end" && (() => {
            const totalPossibleScore = questions.length * 5;
            const accuracyScore = Math.round((totalScore / totalPossibleScore) * 100);
            const isVictory = accuracyScore === 100;
            let insightText = "";

            if (isVictory) {
              insightText = "Perfect budgeting! You're a true Green Champion.";
            } else if (accuracyScore >= 70) {
              insightText = "Great choices! You're making a real difference for the environment.";
            } else {
              insightText = "Good start! Review your choices to learn how to make an even bigger impact.";
            }

            if (isVictory) {
              return (
                <VictoryScreen
                  accuracyScore={accuracyScore}
                  insight={insightText}
                  onViewFeedback={handleReviewAnswers}
                  onContinue={handleContinue}
                />
              );
            } else {
              return (
                <LosingScreen
                  accuracyScore={accuracyScore} // FIX: Added missing accuracyScore prop
                  insight={insightText}
                  onPlayAgain={handlePlayAgain}
                  onViewFeedback={handleReviewAnswers}
                  onContinue={handleContinue}
                />
              );
            }
          })()}

          {step === "review" && (
            <ReviewScreen answers={scenarioResults} onBackToResults={handleBackToResults} />
          )}
        </div>
      )}
    </div>
  );
}