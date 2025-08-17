import React, { useState, useEffect, useReducer, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

// Import your shared components
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";

// =============================================================================
// Game Data & Config
// =============================================================================
const QUESTIONS = [
  {
    id: "school",
    question: "One Change at School",
    placeholder: "Eg: Organising a tree planting event",
  },
  {
    id: "home",
    question: "One Change at Home",
    placeholder: "Eg: Start composting food waste",
  },
  {
    id: "energy",
    question: "One Energy-Saving Habit",
    placeholder: "Eg: Switch off lights when not in use",
  },
  {
    id: "waste",
    question: "One Waste-Reducing Habit",
    placeholder: "Eg: Carry reusable bags for shopping",
  },
  {
    id: "awareness",
    question: "One Awareness Action",
    placeholder: "Eg: Share climate facts on school bulletin",
  },
];

const PERFECT_SCORE = QUESTIONS.length * 10;
const PASSING_THRESHOLD = 0.7;
const GAME_TIME_LIMIT = 300;

// Mock API call to simulate Gemini verification
const verifyPledgeWithGemini = async (text) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (text.trim().length > 10 && text.trim().split(' ').length > 2) {
        resolve({
          isGood: true,
          message: "Great Going!",
        });
      } else if (text.trim().length > 0) {
        resolve({
          isGood: false,
          message: "Can you be more specific?",
        });
      }
    }, 800);
  });
};

// =============================================================================
// Reusable End-Screen Components (NOW RESPONSIVE)
// =============================================================================
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
                    <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                    <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
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
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 sm:p-6 flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-bold lilita-one-regular my-6 text-yellow-400 flex-shrink-0">Review Your Pledges</h1>
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-grow overflow-y-auto">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isGood ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        <p className="text-gray-300 text-base mb-2 leading-tight font-bold">{ans.question}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Pledge:</p>
                            <p className={`font-mono ${ans.isGood ? 'text-white' : 'text-red-300'}`}>{ans.answer || "Not Answered"}</p>
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
// Reducer Logic (Unchanged)
// =============================================================================
const initialState = {
    gameState: "intro",
    timeLeft: GAME_TIME_LIMIT,
    score: 0,
    answers: [],
    currentQuestionIndex: 0,
    inputValue: "",
    feedback: { message: "", isGood: false, visible: false },
    isChecking: false,
    isVerified: false,
};

function gameReducer(state, action) {
    switch (action.type) {
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing", timeLeft: GAME_TIME_LIMIT };
        case "TICK":
            if (state.timeLeft <= 1) {
                return { ...state, timeLeft: 0, gameState: "finished" };
            }
            return { ...state, timeLeft: state.timeLeft - 1 };
        case "SET_INPUT_VALUE":
            return {
                ...state,
                inputValue: action.payload,
                isVerified: false, 
                feedback: { ...state.feedback, visible: false },
            };
        case "START_VERIFICATION":
            return { ...state, isChecking: true };
        case "SET_VERIFICATION_RESULT":
            return {
                ...state,
                feedback: { ...action.payload, visible: true },
                isChecking: false,
                isVerified: true,
            };
        case "CONTINUE": {
            const currentAnswer = state.inputValue;
            const currentFeedback = state.feedback;
            const isGood = currentAnswer.trim() === "" ? false : currentFeedback.isGood;
            
            const newAnswer = {
                question: QUESTIONS[state.currentQuestionIndex].question,
                answer: currentAnswer,
                isGood: isGood,
            };

            const updatedAnswers = [...state.answers, newAnswer];
            const newScore = state.score + (isGood ? 10 : 0);
            const nextIndex = state.currentQuestionIndex + 1;

            if (nextIndex < QUESTIONS.length) {
                return {
                    ...state,
                    currentQuestionIndex: nextIndex,
                    answers: updatedAnswers,
                    score: newScore,
                    inputValue: "",
                    feedback: { message: "", isGood: false, visible: false },
                    isVerified: false,
                    isChecking: false,
                };
            } else {
                return { ...state, gameState: "finished", answers: updatedAnswers, score: newScore };
            }
        }
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing", timeLeft: GAME_TIME_LIMIT };
        default: return state;
    }
}

// =============================================================================
// Main Game Component (NOW RESPONSIVE)
// =============================================================================
const ClimatePledge = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);

    useEffect(() => {
        if (state.gameState !== "playing") return;
        const timerId = setInterval(() => dispatch({ type: "TICK" }), 1000);
        return () => clearInterval(timerId);
    }, [state.gameState]);

    const handleCheck = useCallback(async () => {
        if (!state.inputValue.trim() || state.isChecking) return;
        dispatch({ type: "START_VERIFICATION" });
        const result = await verifyPledgeWithGemini(state.inputValue);
        dispatch({ type: "SET_VERIFICATION_RESULT", payload: result });
    }, [state.inputValue, state.isChecking]);

    const handleContinue = useCallback(() => {
        dispatch({ type: "CONTINUE" });
    }, []);

    if (state.gameState === "intro") {
        return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    }
    if (state.gameState === "instructions") {
        return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
    }
    if (state.gameState === "finished") {
        const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        const insightText = accuracyScore >= 80 ? "Excellent! Your pledges are strong." : "Good try! Review your pledges to make them stronger.";
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={insightText} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={() => navigate('/environmental/games')} />
            : <LosingScreen accuracyScore={accuracyScore} insight={insightText} onPlayAgain={() => dispatch({ type: 'RESET_GAME' })} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={() => navigate('/environmental/games')} />;
    }
    if (state.gameState === "review") {
        return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    const currentQuestion = QUESTIONS[state.currentQuestionIndex];
    const isCheckNowDisabled = state.inputValue.trim() === "" || state.isChecking;
    const isContinueDisabled = !state.isVerified;

    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col items-center overflow-hidden pt-4 px-4 pb-[160px] sm:pb-[104px]">
            <GameNav timeLeft={state.timeLeft} />
            
            {/* UPDATE: Added `relative` to make this a positioning context for the absolute-positioned GIF */}
            <div className="relative flex-grow flex flex-col justify-center items-center text-center w-full max-w-4xl space-y-6 md:space-y-8">
                
                {/* Question and Input will now stay centered and will not move. */}
                <h1 className="text-white text-2xl md:text-4xl font-bold font-['Comic_Neue'] leading-normal">{currentQuestion.question}</h1>

                <div className="w-full max-w-sm md:max-w-md h-36 md:h-44 bg-gray-800/30 rounded-xl border border-zinc-700 p-2">
                    <textarea
                        value={state.inputValue}
                        onChange={(e) => dispatch({ type: "SET_INPUT_VALUE", payload: e.target.value })}
                        placeholder={currentQuestion.placeholder}
                        className="w-full h-full bg-transparent text-center text-neutral-400 placeholder:text-neutral-500 text-lg md:text-xl font-bold font-['Comic_Neue'] outline-none resize-none flex items-center justify-center p-2"
                    />
                </div>
                
                {/* UPDATE: This feedback area is now absolutely positioned to the bottom of the parent container */}
                <div className="absolute -bottom-1 md:-bottom-7 left-0 w-full min-h-[90px] md:min-h-[110px] flex justify-center items-end pointer-events-none">
                    {state.feedback.visible && (
                        <div className="flex items-center justify-center max-w-sm md:max-w-md">
                            <img src="/feedbackcharacter.gif" alt="Feedback Character" className="w-16 h-32 md:w-20 md:h-40 object-contain flex-shrink-0" />
                            <div className="relative flex items-center mb-8 ml-[-40px]">
                                <div className="absolute left-[62px] top-1/2 -translate-y-1/2 w-3 h-4 bg-contain bg-no-repeat"
                                    style={{ backgroundImage: "url(https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-09/cZcfryFaXc.png)" }}
                                />
                                <div className={`flex items-center bg-[#131f24] rounded-lg border-2 px-4 py-2 border-[#37464f]`}>
                                    <span className={`font-['Inter'] text-base md:text-lg font-medium text-center text-[#f1f7fb]`}>
                                        {state.feedback.message}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Button Bar (Unchanged) */}
            <div className="w-full bg-[#28343A] flex flex-col sm:flex-row justify-center items-center p-4 gap-4 fixed bottom-0 left-0 z-50">
                <div className="w-full sm:w-auto flex-1 max-w-xs">
                    <button
                        onClick={handleCheck}
                        disabled={isCheckNowDisabled}
                        className="relative w-full h-14"
                    >
                        <Checknow
                            topGradientColor="#02ad3eff"
                            bottomGradientColor="#026123ff"
                            className={isCheckNowDisabled ? "opacity-70" : ""}
                            width="100%"
                            height="100%"
                        />
                        <span className={`absolute inset-0 flex items-center justify-center lilita-one-regular text-xl text-white [text-shadow:0_2px_0_#000] transition-opacity ${isCheckNowDisabled ? "opacity-50" : ""}`}>
                            {state.isChecking ? "Checking..." : "Check Now"}
                        </span>
                    </button>
                </div>
                <div className="w-full sm:w-auto flex-1 max-w-xs">
                    <button
                        onClick={handleContinue}
                        disabled={isContinueDisabled}
                        className="relative w-full h-14"
                    >
                        <Checknow
          _                 topGradientColor="#02ad3eff"
                            bottomGradientColor="#026123ff"
                            className={isContinueDisabled ? "opacity-70" : ""}
                            width="100%"
                            height="100%"
                        />
                        <span className={`absolute inset-0 flex items-center justify-center lilita-one-regular text-xl text-white [text-shadow:0_2px_0_#000] transition-opacity ${isContinueDisabled ? "opacity-50" : ""}`}>
                            Continue
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClimatePledge;