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
// Game Data (Question-Based)
// =============================================================================
const questions = [
  {
    id: 1,
    question:
      "A country with high literacy, long life expectancy, but huge deforestation – sustainable or not?",
    options: [
      "Sustainable",
      "Partially sustainable",
      "Not sustainable",
      "Need more data",
    ],
    correct: "Not sustainable",
    explanation:
      "Despite good social indicators, huge deforestation makes it environmentally unsustainable!",
  },
  {
    id: 2,
    question:
      "Country X uses solar power widely but lacks clean water access. HDI or Ecological Footprint?",
    options: [
      "Ecological Footprint is better",
      "HDI is better",
      "Both are equal",
      "Neither is good",
    ],
    correct: "Ecological Footprint is better",
    explanation:
      "Good environmental practices but poor human development - Ecological Footprint is better, HDI is low!",
  },
  {
    id: 3,
    question: "A country reduces its emissions but GDP drops. What improves?",
    options: [
      "Economic growth",
      "Population growth",
      "Nothing improves",
      "Ecological sustainability",
    ],
    correct: "Ecological sustainability",
    explanation:
      "Lower emissions mean better environmental health - ecological sustainability improves!",
  },
  {
    id: 4,
    question:
      "Country Y imports all its goods, keeping domestic emissions low. Is that fully sustainable?",
    options: [
      "No, emissions are outsourced",
      "Yes, very sustainable",
      "Partially sustainable",
      "Depends on imports",
    ],
    correct: "No, emissions are outsourced",
    explanation:
      "Just moving pollution elsewhere isn't truly sustainable - emissions are outsourced!",
  },
  {
    id: 5,
    question:
      "Country A has low emissions but high infant mortality. HDI status?",
    options: ["High HDI", "Medium HDI", "Low HDI", "HDI not affected"],
    correct: "Low HDI",
    explanation:
      "High infant mortality indicates poor healthcare and living conditions - Low HDI!",
  },
  {
    id: 6,
    question:
      "Country B has high GDP and life expectancy but produces massive plastic waste. Is it sustainable?",
    options: [
      "Yes, it's sustainable",
      "No, environmental harm offsets gains",
      "Depends on recycling",
      "Only economically sustainable",
    ],
    correct: "No, environmental harm offsets gains",
    explanation:
      "Plastic pollution undermines environmental health, offsetting economic and social gains.",
  },
  {
    id: 7,
    question:
      "A nation’s HDI rises due to education reforms, but its air quality drops. What's happening?",
    options: [
      "Balanced growth",
      "Ecological gain",
      "Sustainability conflict",
      "HDI is unaffected",
    ],
    correct: "Sustainability conflict",
    explanation:
      "Improving HDI at the cost of the environment shows conflicting sustainability priorities.",
  },
  {
    id: 8,
    question:
      "Country C generates power from coal but builds more hospitals. What improves?",
    options: [
      "Environmental index",
      "Ecological Footprint",
      "HDI (Health dimension)",
      "Carbon neutrality",
    ],
    correct: "HDI (Health dimension)",
    explanation:
      "More hospitals improve health outcomes, raising HDI's health component, despite coal usage.",
  },
  {
    id: 9,
    question:
      "A country enforces strict conservation laws but limits press freedom. What does this impact?",
    options: [
      "HDI (Freedom dimension)",
      "Ecological sustainability only",
      "Both positively",
      "None negatively",
    ],
    correct: "HDI (Freedom dimension)",
    explanation:
      "Limited press freedom can reduce perceived quality of life and democratic freedom, impacting HDI.",
  },
  {
    id: 10,
    question:
      "A rich country exports its waste to poorer nations. Sustainable behavior?",
    options: [
      "Yes, efficient outsourcing",
      "No, unethical and unsustainable",
      "Depends on consent",
      "HDI improves",
    ],
    correct: "No, unethical and unsustainable",
    explanation:
      "Exporting waste shifts the burden and violates sustainability ethics and equity principles.",
  },
];

// Transform the data into the format the game component expects
const dilemmas = questions.map((q) => ({
  id: q.id,
  scenario: q.question,
  options: q.options.map((optText) => {
    const isCorrect = optText === q.correct;
    return {
      text: optText,
      score: isCorrect ? 3 : 0,
      consequence: isCorrect
        ? `Amazing Fact: ${q.explanation}`
        : `Learning Moment: ${q.explanation}`,
    };
  }),
}));


// =============================================================================
// Child Components
// =============================================================================

function OptionCard({ option, isSelected, onClick, isDisabled }) {
  const cardClasses = `flex items-center justify-center 
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
  
  const textClasses = `font-['Inter'] font-medium 
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
    // Parent Flex Container
    <div className="flex items-end justify-center">
      {/* Flex Item 1: The Character GIF */}
      <img
        src="/feedbackcharacter.gif"
        alt="Character talking"
        className="w-[4rem] md:w-[5rem] h-auto object-contain shrink-0"
      />
      {/* Flex Item 2: The Cloud and Text (with a negative margin to tuck it in) */}
      <div className="relative  md:ml-[1rem] md:mb-[2rem]">
        <ThinkingCloud className="w-[180px] md:w-[320px] lg:w-[300px]" />
        <p 
          className="absolute top-1/2 left-24 md:left-41 -translate-x-1/2 -translate-y-1/2 w-full px-4
                     text-[9px] md:text-sm leading-tight text-white text-center font-['Comic_Neue']"
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
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// NEW VictoryScreen
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
  );
}

// NEW LosingScreen
function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore }) {
  return (
    <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
      <style>{scrollbarHideStyle}</style>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
        <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
        <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p>
        <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center mb-6">Wanna Retry?</p>
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

// NEW ReviewScreen (Adapted for this game's data structure)
function ReviewScreen({ answers, onBackToResults }) {
  return (
    <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
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
                <p className={`font-inter ${isCorrect ? 'text-white' : 'text-red-300'}`}>
                  {ans.selectedOption.text}
                </p>
                {!isCorrect && (
                  <>
                    <p className="font-semibold pt-2">Correct Answer:</p>
                    <p className="font-inter text-green-300">{ans.correctAnswerText}</p>
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

export default function MeasureCompareQuiz() {
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

  const currentDilemma = useMemo(() => dilemmas[currentDilemmaIndex], [currentDilemmaIndex]);

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
      scenario: currentDilemma.scenario,
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
        <div className="main-container w-full h-screen bg-[#0A160E] relative overflow-hidden flex flex-col justify-between">
          {step === "playing" && currentDilemma && (
            <>
              <GameNav />

              <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
                
                <div className="flex-grow flex flex-col lg:flex-row items-center justify-start lg:justify-center w-full p-4 lg:px-[5vw] lg:py-[2vh] gap-6 lg:gap-[2vw]">
                  <div className="flex flex-col w-full lg:w-auto p-4 lg:py-[4.6vh] lg:px-[2.4vh] bg-[rgba(32,47,54,0.3)] rounded-xl lg:rounded-[1.2vh] gap-4 lg:gap-[2.8vh]">
                    {currentDilemma.options.map((option) => (
                      <OptionCard
                        key={option.text}
                        option={option}
                        isSelected={selectedOption?.text === option.text}
                        onClick={() => handleSelectOption(option)}
                        isDisabled={showFeedback && selectedOption?.text !== option.text}
                      />
                    ))}
                  </div>

                  <div className="relative flex flex-col w-full lg:w-[26vw] h-auto min-h-[150px] lg:h-[46vh] p-4 lg:p-[2vh] bg-[rgba(32,47,54,0.3)] rounded-xl lg:rounded-[1.2vh] justify-center items-center text-white">
                    <span className="font-['Inter'] text-lg lg:text-[1.1vw] font-medium leading-relaxed lg:leading-[4vh] text-center">
                      {currentDilemma.scenario}
                    </span>
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
                    <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-2xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>
                      {buttonText}
                    </span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === "end" && (() => {
            const totalPossibleScore = dilemmas.length * 3;
            const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
            const isVictory = accuracyScore === 100;

            let insightText = "";
            if (accuracyScore === 100) {
              insightText = "Perfect score! You're a true sustainability champion with a deep understanding of its interconnected pillars!";
            } else if (accuracyScore >= 70) {
              insightText = "Excellent! You grasp the key concepts of sustainability well. Keep exploring how social, economic, and environmental factors influence each other.";
            } else {
              insightText = "Good effort! Sustainability can be complex. Reviewing your answers will help clarify the balance between development and ecological health.";
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
                  accuracyScore={accuracyScore}
                  insight={insightText}
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