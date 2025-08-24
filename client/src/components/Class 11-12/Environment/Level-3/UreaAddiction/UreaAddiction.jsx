import React, { useState, useEffect, useMemo } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Mock Hooks (as in original code)
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

// Utility Function (as in original code)
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
// Game Data and Transformation Logic
// =============================================================================

const cards = [
    {
        question: "Why is urea overused in Indian agriculture?",
        options: [
            {
                front: "Urea gives a quick crop boost – every farmer swears by it!",
                back: "✅ Correct! 💥 It’s heavily subsidized and gives quick results.",
                isCorrect: true,
            },
            {
                front: "Long-term soil health? Urea is a magic fix!",
                back: "❌ Nope! 🧪 Urea actually degrades soil over time.",
                isCorrect: false,
            },
            {
                front: "It’s the only fertilizer accessible in rural markets.",
                back: "❌ Not quite! 📦 It’s common but not the only one available.",
                isCorrect: false,
            },
            {
                front: "Urea is eco-friendly and natural, right?",
                back: "❌ Incorrect. 🌿 It’s synthetic and overuse harms the environment.",
                isCorrect: false,
            },
        ],
    },
    {
        question: "What environmental issue is directly linked to excess urea?",
        options: [
            {
                front: "More urea = fewer trees. It causes deforestation!",
                back: "❌ Incorrect! 🌳 Deforestation isn’t directly caused by urea.",
                isCorrect: false,
            },
            {
                front: "It seeps into water and weakens the soil?",
                back: "✅ Yes! 💧 It causes nitrate pollution and soil fatigue.",
                isCorrect: true,
            },
            {
                front: "It blocks drains and causes urban flooding!",
                back: "❌ Nope! 🌧️ Urban flooding isn’t linked to urea use.",
                isCorrect: false,
            },
            {
                front: "It speeds up melting glaciers due to emissions!",
                back: "❌ Incorrect! ❄️ That’s more about fossil fuels, not urea.",
                isCorrect: false,
            },
        ],
    },
    {
        question: "What’s a smarter policy move than banning urea?",
        options: [
            {
                front: "Let’s promote compost and biofertilizers instead!",
                back: "✅ Spot on! 🌿 Subsidizing eco-alternatives is smart policy.",
                isCorrect: true,
            },
            {
                front: "Farmers should be fined for overusing it!",
                back: "❌ Not effective. 🚫 Penalties may increase resistance.",
                isCorrect: false,
            },
            {
                front: "Let’s build more urea factories to meet demand!",
                back: "❌ Nope! 🏭 That encourages more use, not less.",
                isCorrect: false,
            },
            {
                front: "Import more urea — problem solved!",
                back: "❌ Incorrect! 🌍 Importing just shifts the issue.",
                isCorrect: false,
            },
        ],
    },
    {
        question: "What message can shift farmer behaviour?",
        options: [
            {
                front: "Let’s go hard — 'Urea is poison!'",
                back: "❌ Fear doesn’t work. ☠️ People shut down with such messaging.",
                isCorrect: false,
            },
            {
                front: "A farmer’s wealth starts with healthy soil!",
                back: "✅ Exactly! 💚 'Healthy Soil, Wealthy Farmer' motivates positive change.",
                isCorrect: true,
            },
            {
                front: "Strict rule: 'Stop using urea or get fined!'",
                back: "❌ Not ideal. 📢 It’s too threatening and could backfire.",
                isCorrect: false,
            },
            {
                front: "All or nothing: 'Chemical-free or nothing!'",
                back: "❌ Too extreme. 🧪 Real change needs balance, not ultimatums.",
                isCorrect: false,
            },
        ],
    },
];

const gameData = {};
const gameSteps = [];

cards.forEach((card, index) => {
    const key = `q${index + 1}`;
    gameSteps.push(key);

    const correctOption = card.options.find(opt => opt.isCorrect);

    gameData[key] = {
        id: index + 1,
        title: card.question,
        options: card.options,
        type: 'single', 
        correctAnswer: correctOption ? correctOption.front : null,
    };
});

// =============================================================================
// Child Components
// =============================================================================

// MODIFIED: Flippable Card Component with your requested CSS
function FlippableCardQuestion({ question, selectedAnswer, setSelectedAnswer, isRevealed }) {
    
    return (
        <div className="w-full max-w-3xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
            <div className="flex flex-col justify-center items-start gap-7">
                <div className="px-1 flex flex-col justify-center items-center gap-2 w-full">
                    <h2 className="text-slate-100 text-xl md:text-[1.4rem] font-medium leading-9 text-center">
                        {question.title}
                    </h2>
                </div>
                {/* This container now matches your requested flex-col layout */}
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswer === option.front;
                        
                        // Base styles from your snippet
                        let baseCardClasses = "self-stretch lg:min-h-[60px] px-6 py-3 lg:py-0 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border flex items-center transition-all";
                        let stateCardClasses = "";
                        let textClasses = "text-sm lg:text-base font-medium leading-relaxed";

                        if (isRevealed) {
                            baseCardClasses += " cursor-default";
                            if (isSelected) {
                                if (option.isCorrect) {
                                    stateCardClasses = " bg-green-900/40 border-2 border-green-500";
                                    textClasses += " text-green-300";
                                } else {
                                    stateCardClasses = " bg-red-900/40 border-2 border-red-500 ";
                                    textClasses += " text-red-300";
                                }
                            } else if (option.isCorrect) {
                                // Style for the correct answer when the user chose wrong
                                stateCardClasses = " bg-green-900/40 border-2 border-green-500 ";
                                textClasses += " text-green-400";
                            } else {
                                // Style for other unselected options
                                stateCardClasses = " bg-gray-900/50 border-2 border-gray-800 opacity-60";
                                textClasses += " text-slate-100";
                            }
                        } else {
                            baseCardClasses += " cursor-pointer";
                            if (isSelected) {
                                // Your selected style
                                stateCardClasses = " bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428]";
                                textClasses += " text-[#79b933]";
                            } else {
                                // Your default style
                                stateCardClasses = " bg-gray-900 border-2 border-gray-700 hover:bg-gray-800";
                                textClasses += " text-slate-100";
                            }
                        }

                        return (
                            <div
                                key={option.front}
                                onClick={() => !isRevealed && setSelectedAnswer(option.front)}
                                className={`${baseCardClasses} ${stateCardClasses}`}
                            >
                                <span className={textClasses}>
                                    {isRevealed && isSelected ? option.back : option.front}
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
                            <span className="text-[#FFCC00] inter-font text-xs font-semibold ">{insight}</span>
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
                            <span className="text-[#FFCC00] inter-font text-xs font-semibold ">{insight}</span>
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
        <style>{scrollbarHideStyle}</style>
        <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
        <div className="flex-grow w-full overflow-y-auto no-scrollbar">
            <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
                {gameSteps.map(questionKey => {
                    const question = gameData[questionKey];
                    const result = reviewData[questionKey];
                    
                    const userOption = question.options.find(opt => opt.front === result.userAnswer);

                    return (
                        <div key={question.id} className={`p-4 rounded-xl flex flex-col ${result.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                            <p className="text-gray-200 text-lg mb-2 font-bold">{question.title}</p>
                            
                            <div className="text-sm space-y-2 mt-2">
                                <p className="font-semibold">Your Answer:</p>
                                <p className={`break-words p-2 rounded ${result.isCorrect ? ' text-green-300' : ' text-red-300'}`}>
                                    {result.userAnswer || "Not Answered"}
                                </p>
                                    <>
                                        <p className="font-semibold pt-2">Correct Answer:</p>
                                        <p className="text-green-300 break-words p-2 rounded">{question.correctAnswer}</p>
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
// Main Game Component
// =============================================================================

export default function UreaPolicyGame() {
    const { completeEnvirnomentChallenge } = useEnvirnoment();
    const { updateEnvirnomentPerformance } = usePerformance();
    const navigate = useNavigate();

    const [gameState, setGameState] = useState("intro");
    const [introStep, setIntroStep] = useState("first"); 
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [insight, setInsight] = useState("");
    const [isRevealed, setIsRevealed] = useState(false);
    
    const initialAnswers = Object.fromEntries(gameSteps.map(key => [key, null]));
    const [answers, setAnswers] = useState(initialAnswers);
    const [finalResults, setFinalResults] = useState(null);

    useEffect(() => {
        if (gameState === 'end' && finalResults) {
            const generateInsight = async () => {
                setInsight("Fetching personalized insight...");
                
                const answersSummary = gameSteps.map(key => 
                    `- ${gameData[key].title}: ${finalResults.review[key].isCorrect ? 'Correct' : 'Incorrect'}`
                ).join('\n');

                const prompt = `
A student completed a quiz on Indian agricultural policy regarding urea usage. Here is their performance:

- Overall Accuracy: ${finalResults.accuracy}%
- Part-by-part results:
${answersSummary}

### INSTRUCTION ###
Provide a short, holistic insight (about 20 words) on their understanding of urea overuse and sustainable farming policies.
If they got a perfect score, praise them as an "Agri-Policy Pro" for mastering the concepts. 
If they did well (>80%), praise their solid understanding of the issues.
If they struggled, gently point out where they went wrong (e.g., confusing policy with penalties) and suggest focusing on the balance between farmer needs and environmental health.

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
                        fallbackInsight = "Perfect score! You're a true Agri-Policy Pro!";
                    } else if (finalResults.accuracy >= 75) {
                        fallbackInsight = "Great job! You have a strong grasp of these complex issues.";
                    } else {
                        fallbackInsight = "Good effort! Review your answers to see the link between policy and farmer behavior.";
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
        setIsRevealed(false);
    };
    
    const calculateResults = () => {
        let score = 0;
        const totalQuestions = gameSteps.length;
        const review = {};

        gameSteps.forEach(key => {
            const question = gameData[key];
            const userAnswer = answers[key];
            const isCorrect = userAnswer === question.correctAnswer;
            
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

    const handleFooterButtonClick = () => {
        if (isRevealed) {
            if (currentStepIndex < gameSteps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
                setIsRevealed(false);
            } else {
                calculateResults();
            }
        } else {
            setIsRevealed(true);
        }
    };
    
    const { isButtonEnabled, buttonText } = useMemo(() => {
        const currentQuestionKey = gameSteps[currentStepIndex];
        const currentAnswer = answers[currentQuestionKey];

        if (isRevealed) {
            const isLastQuestion = currentStepIndex === gameSteps.length - 1;
            return { isButtonEnabled: true, buttonText: isLastQuestion ? 'Finish' : 'Continue' };
        } else {
            return { isButtonEnabled: !!currentAnswer, buttonText: 'Submit' };
        }
    }, [currentStepIndex, answers, isRevealed]);

    const handleShowInstructions = () => setIntroStep("instructions");
    const handlePlayAgain = () => startGame();
    const handleReviewAnswers = () => setGameState("review");
    const handleBackToResults = () => setGameState("end");
    const handleContinue = () => navigate("/environmental/games");

    const renderCurrentQuestion = () => {
        const currentQuestionKey = gameSteps[currentStepIndex];
        const question = gameData[currentQuestionKey];
        
        return <FlippableCardQuestion 
            question={question} 
            selectedAnswer={answers[currentQuestionKey]} 
            setSelectedAnswer={(answer) => setAnswers(prev => ({...prev, [currentQuestionKey]: answer}))}
            isRevealed={isRevealed}
        />;
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
                            <button className="relative w-full h-full cursor-pointer" onClick={handleFooterButtonClick} disabled={!isButtonEnabled}>
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