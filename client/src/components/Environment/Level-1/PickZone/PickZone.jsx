import React, { useReducer, useEffect, useState } from "react"; // MODIFIED: Added useState
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios"; // 1. ADDED AXIOS IMPORT

// MODIFIED: Importing the required components from external files
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";

// =============================================================================
// Gemini API Integration Helpers
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
// Mock Contexts and Hooks (for standalone functionality)
// =============================================================================
const useEnvirnoment = () => ({
  completeEnvirnomentChallenge: () => console.log("Challenge marked complete."),
});
const usePerformance = () => ({
  updatePerformance: (data) => console.log("Performance updated:", data),
});

// =============================================================================
// Reusable Components
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
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        <p className="text-gray-300 text-base mb-2 font-bold">{ans.description}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Answer:</p>
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>
                                {ans.selected || "Not Answered"}
                            </p>
                            {!ans.isCorrect && (
                                <>
                                    <p className="font-semibold pt-2">Correct Answer:</p>
                                    <p className="font-mono text-green-300">{ans.correctAnswer}</p>
                                </>
                            )}
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
// =============================================================================
// Game Data
// =============================================================================
const options = [
    { name: "Lithosphere" },
    { name: "Atmosphere" },
    { name: "Hydrosphere" },
    { name: "Biosphere" },
];

const questions = [
    { description: "The layer that includes soil, rocks, and land where we build houses and grow food.", correctAnswer: "Lithosphere" },
    { description: "All the water on Earth, including oceans, rivers, lakes, and glaciers.", correctAnswer: "Hydrosphere" },
    { description: "The layer of gases surrounding the Earth that we breathe.", correctAnswer: "Atmosphere" },
    { description: "The part of Earth where life exists, including all plants and animals.", correctAnswer: "Biosphere" },
    { description: "This sphere contains clouds and protects us from the sun's harmful radiation.", correctAnswer: "Atmosphere" },
];

const TIME_LIMIT = 120;
const TOTAL_QUESTIONS = questions.length;
const PERFECT_SCORE = TOTAL_QUESTIONS * 2;

// =============================================================================
// Reducer Logic
// =============================================================================
const initialState = {
  gameState: "intro",
  introStep: "first",
  currentIndex: 0,
  selected: null,
  score: 0,
  answers: [],
  timeLeft: TIME_LIMIT,
  timerActive: false,
  answerSubmitted: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SHOW_INSTRUCTIONS": return { ...state, introStep: "instructions" };
    case "START_GAME": return { ...initialState, gameState: "playing", timerActive: true };
    case "SELECT_OPTION": if (state.answerSubmitted) return state; return { ...state, selected: action.payload };
    case "SUBMIT_ANSWER": {
      const current = questions[state.currentIndex];
      const isCorrect = current.correctAnswer === state.selected;
      return {
        ...state,
        answers: [...state.answers, { description: current.description, selected: state.selected, correctAnswer: current.correctAnswer, isCorrect }],
        score: isCorrect ? state.score + 2 : state.score,
        answerSubmitted: true,
      };
    }
    case "NEXT_QUESTION":
      if (state.currentIndex + 1 >= TOTAL_QUESTIONS) {
        return { ...state, gameState: "finished", timerActive: false };
      }
      return { ...state, currentIndex: state.currentIndex + 1, selected: null, answerSubmitted: false };
    case "FINISH_GAME": return { ...state, gameState: "finished", timerActive: false };
    case "REVIEW_GAME": return { ...state, gameState: "review" };
    case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
    case "TICK":
      if (state.timeLeft <= 1) {
        return { ...state, timeLeft: 0, gameState: "finished", timerActive: false };
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    case "RESET_GAME": return { ...initialState, gameState: "playing", timerActive: true };
    default: return state;
  }
}

// =============================================================================
// Main Game Component
// =============================================================================
const PickTheZone = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(reducer, initialState);
    const [insight, setInsight] = useState(""); // 2. ADDED INSIGHT STATE
    
    useEffect(() => {
        if (state.gameState === "playing" && state.timerActive) {
            const timer = setInterval(() => dispatch({ type: "TICK" }), 1000);
            return () => clearInterval(timer);
        }
    }, [state.gameState, state.timerActive]);
    
    // 3. ADDED USEEFFECT FOR GEMINI API CALL
    useEffect(() => {
        if (state.gameState === "finished") {
            const generateInsight = async () => {
                setInsight("Fetching personalized insight...");
                const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
                const isVictory = state.score === PERFECT_SCORE;

                const answersSummary = state.answers.map(ans => 
                    `For the question "${ans.description}", the user answered "${ans.selected || 'No answer'}" and was ${ans.isCorrect ? 'correct' : 'incorrect'}.`
                ).join('\n');

                const prompt = `
A student played a quiz game called "Pick The Zone" about Earth's spheres (Lithosphere, Biosphere, etc.). Here is their performance:

Overall Accuracy: ${accuracyScore}%
Score: ${state.score} out of ${PERFECT_SCORE}

Detailed Answers:
${answersSummary}

### INSTRUCTION ###
Based on their performance, provide a short, encouraging, and educational insight (about 20 words) about their knowledge of Earth's spheres. 
If they achieved a perfect score, praise them as a master. If they did well (>=70%), praise their solid understanding. 
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
                    // Fallback to original hard-coded logic
                    let fallbackInsight = "";
                    if (isVictory) {
                        fallbackInsight = "Perfect score! You're a master of the Earth's spheres!";
                    } else if (accuracyScore >= 70) {
                        fallbackInsight = "Great job! You have a solid understanding of our planet's systems.";
                    } else {
                        fallbackInsight = "Good effort! Reviewing the answers will help you learn even more.";
                    }
                    setInsight(fallbackInsight);
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.score, state.answers]);

    const handleSubmit = () => {
        if (state.selected === null) return;
        dispatch({ type: "SUBMIT_ANSWER" });
    };

    const handleNextQuestion = () => {
        dispatch({ type: "NEXT_QUESTION" });
    };
    
    const handlePlayAgain = () => dispatch({ type: "RESET_GAME" });
    const handleViewFeedback = () => dispatch({ type: "REVIEW_GAME" });
    const handleContinue = () => navigate("/environmental/games");

    const currentQuestion = questions[state.currentIndex];
    const buttonText = state.answerSubmitted ? "Continue" : "Check Now";
    const isButtonEnabled = state.answerSubmitted || state.selected !== null;

    if (state.gameState === "intro") {
        return state.introStep === "first"
            ? <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />
            : <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
    }

    // 4. UPDATED RENDER LOGIC FOR 'FINISHED' STATE
    if (state.gameState === "finished") {
        const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
        const isVictory = state.score === PERFECT_SCORE;
        
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={insight} onViewFeedback={handleViewFeedback} onContinue={handleContinue} />
            : <LosingScreen accuracyScore={accuracyScore} insight={insight} onPlayAgain={handlePlayAgain} onViewFeedback={handleViewFeedback} onContinue={handleContinue} />;
    }

    if (state.gameState === "review") {
        return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    return (
        // MODIFIED: Main container is now a simple flex column and no longer has bottom padding.
        <div className="min-h-screen bg-black text-white flex flex-col">
            <GameNav />
            
            {/* MODIFIED: This main content area now has `flex-1` to make it grow and fill available space. */}
            <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col md:flex-row gap-8 px-4 py-10 md:py-14  lg:py-24">
                <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-xl p-6 space-y-4">
                    {options.map((opt) => {
                        const isSelected = state.selected === opt.name;
                        let ringColor = 'ring-gray-600';
                        if (state.answerSubmitted) {
                            if (currentQuestion.correctAnswer === opt.name) {
                                ringColor = 'ring-green-500';
                            } else if (isSelected) {
                                ringColor = 'ring-red-500';
                            }
                        } else if (isSelected) {
                            ringColor = 'ring-green-500';
                        }

                        return (
                            <div 
                                key={opt.name}
                                onClick={() => dispatch({ type: 'SELECT_OPTION', payload: opt.name })}
                                className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all bg-[#131f24] ring-2 ${ringColor} shadow-[0_2px_0_0_#000]`}
                            >
                                <div className={`w-8 h-8 rounded-md border-2 ${isSelected ? 'bg-green-600 border-green-400' : 'border-gray-500'} flex items-center justify-center`}>
                                   {isSelected && <span className="text-white text-xl">✓</span>}
                                </div>
                                <span className="flex-1 text-xl font-medium">{opt.name}</span>
                            </div>
                        );
                    })}
                </div>

                <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-xl p-6 flex items-center justify-center">
                    <p className="text-xl text-center font-medium leading-relaxed">
                        {currentQuestion.description}
                    </p>
                </div>
            </div>

            {/* MODIFIED: Bottom bar is no longer fixed and uses `mt-auto` to stick to the bottom. Height is now controlled by padding. */}
            <div className="w-full bg-[#28343A] flex justify-center items-center px-4 sm:px-6 md:px-8 mt-auto py-5">
                <div className="w-full max-w-xs md:w-56 lg:w-64 h-14 md:h-16 ">
                    <button
                        className="relative w-full h-full cursor-pointer"
                        onClick={state.answerSubmitted ? handleNextQuestion : handleSubmit}
                        disabled={!isButtonEnabled}
                    >
                        <Checknow topGradientColor={"#09be43"} bottomGradientColor={"#068F36"} width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-xl md:text-2xl text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>
                            {buttonText}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PickTheZone;