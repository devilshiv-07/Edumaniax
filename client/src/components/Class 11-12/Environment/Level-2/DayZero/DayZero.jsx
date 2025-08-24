import React, { useState, useEffect, useMemo } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
// NEW: Question data and transformation logic
// =============================================================================

const firstQuestionOptions = [
    "Water rationing schedules",
    "Rainwater harvesting campaigns",
    "Desalination plant investments",
    "Reuse greywater mandates",
    "Incentivize waterless urinals, low-flow taps",
    "Crack down on illegal groundwater extraction",
    "Build new golf courses",
    "Offer free car washes",
    "Increase swimming pool sizes",
    "Subsidize lawn sprinklers",
];

const firstQuestionCorrect = [
    "Water rationing schedules",
    "Rainwater harvesting campaigns",
    "Desalination plant investments",
    "Reuse greywater mandates",
    "Incentivize waterless urinals, low-flow taps",
    "Crack down on illegal groundwater extraction",
];

const questions = [
    {
        id: 1,
        type: "multiple",
        question:
        "Design an emergency water plan by choosing 4 effective measures below:",
        // Note: Options and correct answers are defined above for this specific question
    },
    {
        id: 2,
        type: "single",
        question:
        "You must cut water supply by 40%. Which is the least disruptive method?",
        options: [
            "Turn off taps 3 days/week",
            "Uniform rationing (per household)",
            "Tanker supply only to slums",
            "Cut off industries temporarily",
        ],
        correct: [1],
    },
    {
        id: 3,
        type: "single",
        question: "Which sector uses the most water in urban settings?",
        options: ["Households", "Car washes", "Industries", "Hotels"],
        correct: [2],
    },
    {
        id: 4,
        type: "single",
        question:
        "A celebrity posts: “How can the govt ask us to save water when hotels waste so much?” What do you do?",
        options: [
            "Ignore it",
            "Launch a hotel-targeted awareness campaign",
            "Send legal notice",
            "Block the post",
        ],
        correct: [1],
    },
    {
        id: 5,
        type: "single",
        question:
        "Which solution gives long-term relief, not just a short-term fix?",
        options: [
            "Water tankers",
            "New borewells",
            "Roof rainwater harvesting",
            "Buying water from another state",
        ],
        correct: [2],
    },
];

const gameData = {};
const gameSteps = [];

questions.forEach((q, index) => {
    const key = `q${index + 1}`;
    gameSteps.push(key);

    let transformedQuestion;

    if (q.id === 1) { // Special handling for the first multiple-choice question
        transformedQuestion = {
            id: q.id,
            title: q.question,
            options: firstQuestionOptions,
            type: 'multi-select',
            correctAnswers: firstQuestionCorrect,
        };
    } else { // Standard handling for other questions
        transformedQuestion = {
            id: q.id,
            title: q.question,
            options: q.options,
            type: 'single',
            correctAnswer: q.options[q.correct[0]],
        };
    }
    
    gameData[key] = transformedQuestion;
});

// =============================================================================
// Child Components (MODIFIED & UNCHANGED)
// =============================================================================

function SingleChoiceQuestion({ question, selectedAnswer, setSelectedAnswer }) {
  return (
    <div className="w-full max-w-3xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
      <div className="flex flex-col justify-center items-start gap-7">
        <div className="px-1 flex flex-col justify-center items-center gap-2">
          <h2 className="text-slate-100 text-xl md:text-[1.4rem] font-medium leading-9 whitespace-pre-wrap">
            {question.title}
          </h2>
        </div>
        <div className="self-stretch flex flex-col justify-start items-start gap-4">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option;
            return (
              <div
                key={option}
                onClick={() => setSelectedAnswer(option)}
                className={`self-stretch lg:min-h-[60px] px-6 py-3 lg:py-0 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border flex items-center cursor-pointer transition-all
                  ${
                    isSelected
                      ? "bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]"
                      : "bg-gray-900 border-gray-700 hover:bg-gray-800"
                  }`}
              >
                <span
                  className={`text-sm lg:text-base font-medium leading-relaxed ${
                    isSelected ? "text-[#79b933]" : "text-slate-100"
                  }`}
                >
                  {option}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// MODIFIED: To handle grid layout and dynamic selection
function MultiSelectQuestion({ question, selectedAnswers, setSelectedAnswers, isGridLayout }) {
    const handleSelect = (option) => {
        let newAnswers;
        if (selectedAnswers.includes(option)) {
            newAnswers = selectedAnswers.filter(item => item !== option);
        } else {
            newAnswers = [...selectedAnswers, option];
        }
        setSelectedAnswers(newAnswers);
    };

    const containerClasses = isGridLayout
        ? "self-stretch grid grid-cols-2 md:grid-cols-2 gap-4"
        : "self-stretch flex flex-col justify-start items-start gap-4";

    return (
        <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
            <div className="flex flex-col justify-center items-start gap-7">
                <div className="px-1 flex flex-col justify-center items-start gap-2">
                    <h2 className="text-slate-100 text-base md:text-2xl font-medium leading-9">
                        {question.title.split('\n').map((line, index) => (
                            <React.Fragment key={index}>
                                {line}
                                {index < question.title.split('\n').length - 1 && <br />}
                            </React.Fragment>
                        ))}
                    </h2>
                </div>
                <div className={containerClasses}>
                    {question.options.map((option) => {
                        const isSelected = selectedAnswers.includes(option);
                        return (
                            <div
                                key={option}
                                onClick={() => handleSelect(option)}
                                className={`h-full lg:min-h-[60px] px-6 py-3 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border flex items-center justify-center text-center cursor-pointer transition-all
                                ${
                                    isSelected
                                        ? "bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]"
                                        : "bg-gray-900 border-gray-700 hover:bg-gray-800"
                                }`}
                            >
                                <span
                                    className={`text-xs lg:text-base font-medium leading-relaxed ${
                                        isSelected ? "text-[#79b933]" : "text-slate-100"
                                    }`}
                                >
                                    {option}
                                </span>
                            </div>
                        );
                    })}
                </div>
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
                            <span className="text-[#FFCC00] inter-font text-xs font-semibold tracking-wide">{insight}</span>
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

function ReviewScreen({ reviewData, onBackToResults }) {
    return (
      <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center inter-font">
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
        <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
        <div className="flex-grow w-full overflow-y-auto no-scrollbar">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-2">
                {gameSteps.map(questionKey => {
                    const question = gameData[questionKey];
                    const result = reviewData[questionKey];
                    const userAnswer = Array.isArray(result.userAnswer) 
                        ? result.userAnswer.join(', ') 
                        : result.userAnswer;
                    const correctAnswer = Array.isArray(question.correctAnswer || question.correctAnswers)
                        ? (question.correctAnswer || question.correctAnswers).join(', ')
                        : question.correctAnswer;

                    return (
                        <div key={question.id} className={`p-4 rounded-xl flex flex-col ${result.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                            <p className="text-gray-200 text-lg mb-1 font-bold">{question.title}</p>
                            
                            <p className="text-gray-400 text-xs mb-4 font-medium whitespace-pre-wrap border-l-2 border-gray-600 pl-2">
                                {question.prompt}
                            </p>
                            
                            <div className="text-sm space-y-1 ">
                                <p className="font-semibold">Your Answer:</p>
                                <p className={`break-words ${result.isCorrect ? 'text-green-300' : 'text-red-300'}`}>{userAnswer || "Not Answered"}</p>
                                    <>
                                        <p className="font-semibold pt-2">Correct Answer:</p>
                                        <p className="text-green-300 break-words">{correctAnswer}</p>
                                    </>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
        <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-b-0 shadow-lg">
          Back to Results
        </button>
      </div>
    );
}

// =============================================================================
// Main Game Component (MODIFIED)
// =============================================================================

export default function UrbanFloodFlashpoint() {
    const { completeEnvirnomentChallenge } = useEnvirnoment();
    const { updateEnvirnomentPerformance } = usePerformance();
    const navigate = useNavigate();

    const [gameState, setGameState] = useState("intro");
    const [introStep, setIntroStep] = useState("first"); 
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [insight, setInsight] = useState("");
    
    // Initial state setup based on the new questions
    const initialAnswers = Object.fromEntries(
        gameSteps.map(key => [key, gameData[key].type === 'single' ? null : []])
    );
    const [answers, setAnswers] = useState(initialAnswers);
    const [finalResults, setFinalResults] = useState(null);

    // Gemini API Call useEffect
    useEffect(() => {
        if (gameState === 'end' && finalResults) {
            const generateInsight = async () => {
                setInsight("Fetching personalized insight...");
                
                const answersSummary = gameSteps.map(key => 
                    `- ${gameData[key].title}: ${finalResults.review[key].isCorrect ? 'Correct' : 'Incorrect'}`
                ).join('\n');

                const prompt = `
A student completed a 5-part quiz on urban water management. Here is their performance:

- Overall Accuracy: ${finalResults.accuracy}%
- Part-by-part results:
${answersSummary}

### INSTRUCTION ###
Provide a short, holistic insight (about 20 words) on their overall understanding of urban water solutions.
If they achieved a perfect score, praise them as "Urban Water Wizard" for mastering the concepts. 
If they did well (>80%), praise their solid understanding and tell where they can improve to reach mastery.
If they struggled, see where they went wrong and provide them with some actionable feedback like what should they do or which concepts they should review or focus on or a technique that might help them improve. 
basically give an actionable insight that they can use to improve their understanding of topics where they lag by analyzing them.

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
                    let fallbackInsight = "";
                    if (finalResults.accuracy === 100) {
                        fallbackInsight = "Perfect score! You're a true Urban Water Wizard!";
                    } else if (finalResults.accuracy >= 75) {
                        fallbackInsight = "Great job! You have a strong grasp of urban water challenges.";
                    } else {
                        fallbackInsight = "Good effort! This is a tricky topic. Review your answers to master the details.";
                    }
                    setInsight(fallbackInsight);
                }
            };
            generateInsight();
        }
    }, [gameState, finalResults]);

    const startGame = () => {
        setGameState("playing");
        setCurrentStepIndex(0);
        setIntroStep("first");
        setAnswers(initialAnswers);
        setFinalResults(null);
        setInsight("");
    };
    
    const calculateResults = () => {
        let score = 0;
        const totalQuestions = gameSteps.length;
        const review = {};

        gameSteps.forEach(key => {
            const question = gameData[key];
            const userAnswer = answers[key];
            let isCorrect = false;

            if (question.type === 'single') {
                isCorrect = userAnswer === question.correctAnswer;
            } else if (question.type === 'multi-select') {
                const sortedUserAnswers = [...userAnswer].sort();
                const sortedCorrectAnswers = [...question.correctAnswers].sort();
                isCorrect = JSON.stringify(sortedUserAnswers) === JSON.stringify(sortedCorrectAnswers);
            }
            
            if(isCorrect) score++;
            review[key] = { isCorrect, userAnswer };
        });

        const accuracy = Math.round((score / totalQuestions) * 100);

        setFinalResults({
            score,
            accuracy,
            review
        });
        setGameState("end");
    };

    const handleNextStep = () => {
        if (currentStepIndex < gameSteps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            calculateResults();
        }
    };
    
    const { isButtonEnabled, buttonText } = useMemo(() => {
        const currentQuestionKey = gameSteps[currentStepIndex];
        const currentQuestion = gameData[currentQuestionKey];
        const currentAnswer = answers[currentQuestionKey];
        const buttonTxt = currentStepIndex === gameSteps.length - 1 ? 'Submit' : 'Continue';

        if (!currentAnswer) {
            return { isButtonEnabled: false, buttonText: buttonTxt };
        }

        if (currentQuestion.type === 'single') {
            return { isButtonEnabled: !!currentAnswer, buttonText: buttonTxt };
        }
        if (currentQuestion.type === 'multi-select') {
            return { isButtonEnabled: currentAnswer.length > 0, buttonText: buttonTxt };
        }
        
        return { isButtonEnabled: false, buttonText: buttonTxt };

    }, [currentStepIndex, answers]);

    const handleShowInstructions = () => setIntroStep("instructions");
    const handlePlayAgain = () => startGame();
    const handleReviewAnswers = () => setGameState("review");
    const handleBackToResults = () => setGameState("end");
    const handleContinue = () => navigate("/environmental/games");

    const renderCurrentQuestion = () => {
        const currentQuestionKey = gameSteps[currentStepIndex];
        const question = gameData[currentQuestionKey];
        
        if (question.type === 'single') {
            return <SingleChoiceQuestion 
                question={question} 
                selectedAnswer={answers[currentQuestionKey]} 
                setSelectedAnswer={(answer) => setAnswers(prev => ({...prev, [currentQuestionKey]: answer}))} 
            />;
        }
        
        if (question.type === 'multi-select') {
            return <MultiSelectQuestion 
                question={question}
                selectedAnswers={answers[currentQuestionKey]}
                setSelectedAnswers={(answer) => setAnswers(prev => ({...prev, [currentQuestionKey]: answer}))}
                isGridLayout={question.id === 1}
            />;
        }
        return null;
    };

    return (
        <div>
            {gameState === "intro" && introStep === "first" && (<IntroScreen onShowInstructions={handleShowInstructions} />)}
            {gameState === "intro" && introStep === "instructions" && (<InstructionsScreen onStartGame={startGame} />)}
            
            {gameState === "playing" && (
                <div className="main-container w-full h-screen bg-[#0A160E] relative overflow-hidden flex flex-col justify-between inter-font">
                    <GameNav />
                    <div className="flex-1 flex flex-col items-center justify-start lg:justify-center overflow-y-auto no-scrollbar p-4 pt-8 md:pt-4">
                        {renderCurrentQuestion()}
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

            {gameState === "end" && finalResults && (() => {
                const isVictory = finalResults.accuracy === 100;
                
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
                <ReviewScreen reviewData={finalResults.review} onBackToResults={handleBackToResults} />
            )}
        </div>
    );
}