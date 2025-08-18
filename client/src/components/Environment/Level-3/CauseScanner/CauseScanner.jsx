import React, { useReducer, useEffect, useState } from "react"; // 1. ADDED useState
import { useNavigate } from "react-router-dom";
import { useEnvirnoment } from "@/contexts/EnvirnomentContext"; // Assuming this context exists
import { usePerformance } from "@/contexts/PerformanceContext"; // Assuming this context exists
import IntroScreen from "./IntroScreen"; // Assuming this component exists
import InstructionsScreen from "./InstructionsScreen"; // Assuming this component exists
import GameNav from "./GameNav"; // Assuming this component exists
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import Heart from "@/components/icon/GreenBudget/Heart.jsx";
import axios from "axios"; // 2. ADDED AXIOS IMPORT

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

// Data for the game
const causeData = [
  { action: "Burning waste in open air", answer: "Contributes To" },
  { action: "Cycling instead of driving", answer: "Helps Prevent" },
  { action: "Using plastic water bottles daily", answer: "Contributes To" },
  { action: "Planting trees in your school", answer: "Helps Prevent" },
  { action: "Running AC all day at home", answer: "Contributes To" },
  { action: "Eating locally-grown food", answer: "Helps Prevent" },
  { action: "Driving alone every day", answer: "Contributes To" },
  { action: "Installing solar panels", answer: "Helps Prevent" },
  { action: "Burning coal for electricity", answer: "Contributes To" },
  { action: "Using energy-efficient appliances", answer: "Helps Prevent" },
];

// Options for the cards, with JSX for line breaks
const options = [
  { text: <>Helps prevent<br/>Climate change</>, id: "Helps Prevent" },
  { text: <>Contributes to<br/>Climate change</>, id: "Contributes To" },
];

// Game constants
const QUESTION_TIME_LIMIT = 10;
const TOTAL_QUESTIONS = causeData.length;
const PERFECT_SCORE = TOTAL_QUESTIONS * 2;

// Initial state for the reducer
const initialState = {
  gameState: "intro", // "intro", "playing", "finished", "review"
  introStep: "first", // "first", "instructions"
  currentIndex: 0,
  selected: null,
  score: 0,
  answers: [],
  questionTimeLeft: QUESTION_TIME_LIMIT,
  timerActive: false,
  answerSubmitted: false, // Tracks if the current question has been answered
  isVictory: false,
};

// Reducer to manage game state
function reducer(state, action) {
  switch (action.type) {
    case "SHOW_INSTRUCTIONS":
      return { ...state, introStep: "instructions" };
    case "START_GAME":
      return {
        ...initialState,
        gameState: "playing",
        introStep: "first",
        timerActive: true,
      };
    case "SELECT_ANSWER": {
      if (state.answerSubmitted) return state; // Prevent multiple submissions for one question
      const current = causeData[state.currentIndex];
      const isCorrect = current.answer === action.payload;
      return {
        ...state,
        timerActive: false,
        answerSubmitted: true,
        selected: action.payload,
        score: isCorrect ? state.score + 2 : state.score,
        answers: [
          ...state.answers,
          {
            action: current.action,
            selected: action.payload,
            correctAnswer: current.answer,
            isCorrect,
            timeTaken: QUESTION_TIME_LIMIT - state.questionTimeLeft,
          },
        ],
      };
    }
    case "NEXT_QUESTION":
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        selected: null,
        answerSubmitted: false,
        questionTimeLeft: QUESTION_TIME_LIMIT,
        timerActive: true,
      };
    case "FINISH_GAME": {
      const isVictory = state.score === PERFECT_SCORE;
      return { ...state, gameState: "finished", timerActive: false, isVictory };
    }
    case "TICK":
      return { ...state, questionTimeLeft: state.questionTimeLeft > 0 ? state.questionTimeLeft - 1 : 0 };
    case "REVIEW_GAME":
      return { ...state, gameState: "review" };
    case "BACK_TO_FINISH":
      return { ...state, gameState: "finished" };
    case "RESET_GAME":
      return { ...initialState, gameState: "playing", timerActive: true };
    default:
      return state;
  }
}

// =============================================================================
// SVG Component for the Timer (Unchanged)
// =============================================================================
const HeartIcon = () => (
    <svg className="w-full h-full" viewBox="0 0 100 90" fill="#202124" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
        <path d="M85.4187 14.1354C79.404 -1.37812 65.485 -3.83125 54.0737 7.03906L50.0001 11.5813L45.9264 7.03906C34.515 -3.83125 20.596 -1.37812 14.5814 14.1354C8.41163 29.9839 21.0116 48.3323 46.3329 68.8042L50.0001 71.875L53.6672 68.8042C78.9885 48.3323 91.5885 29.9839 85.4187 14.1354Z" />
    </svg>
);

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;
// =============================================================================
// Victory and Losing Screen Components (Unchanged)
// =============================================================================
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#111813] py-8 px-4 sm:px-6 lg:px-8 text-white">
            <div className="w-full max-w-6xl bg-[#1A241D] rounded-3xl shadow-lg flex flex-col items-center p-6 sm:p-8 relative">
                <button onClick={onBackToResults} className="flex justify-center items-center absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-gray-700 hover:bg-gray-600 transition">
                    <span className="font-sans text-3xl text-white select-none">&times;</span>
                </button>
                <h2 className="text-3xl sm:text-4xl font-bold text-center w-full font-['Comic_Neue'] text-yellow-400">Check your answers</h2>
                <p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-300 text-center w-full">See which actions help prevent or contribute to climate change.</p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 w-full">
                    {answers.map((ans, idx) => (
                        <div key={idx} className={`flex flex-col p-4 rounded-xl ${ans.isCorrect ? "bg-green-900/50" : "bg-red-900/50"}`}>
                            <p className={`font-['Comic_Neue'] text-xl font-bold mb-2 ${ans.isCorrect ? "text-green-300" : "text-red-300"}`}>
                                {idx + 1}. {ans.action}
                            </p>
                            <p className="text-base text-gray-200">You chose: <span className="font-semibold">{ans.selected}</span></p>
                            {!ans.isCorrect && (
                                <p className="text-base text-gray-200">Correct answer: <span className="font-semibold">{ans.correctAnswer}</span></p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// Main Game Component
// =============================================================================
const CauseScanner = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  const { updatePerformance } = usePerformance();
  const [insight, setInsight] = useState(""); // 3. ADDED INSIGHT STATE

  // Effect for the per-question timer
  useEffect(() => {
    if (state.gameState === 'playing' && state.timerActive) {
      if (state.questionTimeLeft === 0) {
        dispatch({ type: 'SELECT_ANSWER', payload: 'Timeout' });
      } else {
        const timerId = setTimeout(() => dispatch({ type: 'TICK' }), 1000);
        return () => clearTimeout(timerId);
      }
    }
  }, [state.gameState, state.timerActive, state.questionTimeLeft]);

  // Effect to automatically advance to the next question
  useEffect(() => {
    if (state.answerSubmitted) {
      const timeoutId = setTimeout(() => {
        if (state.currentIndex < TOTAL_QUESTIONS - 1) {
          dispatch({ type: 'NEXT_QUESTION' });
        } else {
          dispatch({ type: 'FINISH_GAME' });
        }
      }, 1200); // 1.2-second delay to show feedback
      return () => clearTimeout(timeoutId);
    }
  }, [state.answerSubmitted, state.currentIndex]);

  // Effect to update performance stats when the game finishes
  useEffect(() => {
    if (state.gameState === "finished") {
      const runPerformanceUpdate = async () => {
        try {
          const totalAnswered = state.answers.length;
          const correct = state.answers.filter(a => a.isCorrect).length;
          const rawScore = state.score;
          const scaledScore = parseFloat(((rawScore / PERFECT_SCORE) * 10).toFixed(2));
          const accuracy = totalAnswered ? (correct / totalAnswered) * 100 : 0;
          const scaledAccuracy = parseFloat(accuracy.toFixed(2));
          const completed = totalAnswered === TOTAL_QUESTIONS;
          const totalTimeTakenSec = state.answers.reduce((sum, ans) => sum + ans.timeTaken, 0);
          const studyTimeMinutes = Math.round(totalTimeTakenSec / 60);
          const avgResponseTimeSec = totalAnswered ? Math.round(totalTimeTakenSec / totalAnswered) : 0;

          await completeEnvirnomentChallenge(0, 0);
          await updatePerformance({
            moduleName: "Environment",
            topicName: "CauseScanner",
            score: scaledScore,
            accuracy: scaledAccuracy,
            avgResponseTimeSec,
            studyTimeMinutes,
            completed,
          });
        } catch (error) {
          console.error("Error updating performance:", error);
        }
      };
      runPerformanceUpdate();
    }
  }, [state.gameState, state.score, state.answers, completeEnvirnomentChallenge, updatePerformance]);
  
  // 4. ADDED USEEFFECT FOR GEMINI API CALL
  useEffect(() => {
    if (state.gameState === 'finished') {
        const generateInsight = async () => {
            setInsight("Fetching personalized insight...");
            const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);

            const answersSummary = state.answers.map(ans =>
                `- For the action "${ans.action}", the user chose "${ans.selected}", which was ${ans.isCorrect ? 'correct' : 'incorrect'}.`
            ).join('\n');

            const prompt = `
A student played a game identifying if actions 'Help Prevent' or 'Contribute To' climate change. Here is their performance summary:

Overall Score: ${state.score} out of ${PERFECT_SCORE} (${accuracyScore}%)

Their Answers:
${answersSummary}

### INSTRUCTION ###
Based on their performance, provide a short, encouraging, and holistic insight (about 20 words).
If the score is perfect, congratulate them as a "climate champion".
If they did well (>80%), praise their solid understanding. 
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
                // Fallback to original hardcoded insights
                let fallbackInsight = "";
                if (state.isVictory) {
                    fallbackInsight = "Perfect score! You're a true climate champion!";
                } else if (accuracyScore >= 75) {
                    fallbackInsight = "Great job! You have a strong grasp of climate actions.";
                } else {
                    fallbackInsight = "Good effort! Review the answers to become a climate expert.";
                }
                setInsight(fallbackInsight);
            }
        };
        generateInsight();
    }
}, [state.gameState, state.answers, state.score, state.isVictory]);


  const handleSelectAnswer = (answerId) => {
    if (!state.answerSubmitted) {
      dispatch({ type: "SELECT_ANSWER", payload: answerId });
    }
  };
  
  const handlePlayAgain = () => dispatch({ type: "RESET_GAME" });
  const handleViewFeedback = () => dispatch({ type: "REVIEW_GAME" });
  const handleContinue = () => navigate(-1);

  // Render Intro/Instructions
  if (state.gameState === "intro") {
    if (state.introStep === "first") {
      return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    }
    if (state.introStep === "instructions") {
      return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
    }
  }

  // 5. UPDATED RENDER LOGIC FOR 'FINISHED' STATE
  if (state.gameState === "finished") {
    const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
    // The hardcoded 'insightText' is removed. We now use the 'insight' state variable from the useEffect hook.
    return state.isVictory ? (
      <VictoryScreen accuracyScore={accuracyScore} insight={insight} onViewFeedback={handleViewFeedback} onContinue={handleContinue} />
    ) : (
      <LosingScreen onPlayAgain={handlePlayAgain} onViewFeedback={handleViewFeedback} onContinue={handleContinue} insight={insight} />
    );
  }
  
  // Render Review Screen
  if (state.gameState === "review") {
    return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
  }

  // Render Main Game Screen
  return (
    <div className="min-h-screen bg-[#111813] flex flex-col items-center overflow-hidden">
      <GameNav /> {/* Includes the "Cause Scanner" Title */}

      <main className="w-full flex-grow flex flex-col items-center justify-center text-white px-4 mb-27">
        <div className="w-full max-w-4xl flex flex-col items-center">
            {/* Action Text */}
            <h1 className="text-center text-white text-2xl sm:text-3xl font-bold font-['Comic_Neue'] leading-normal sm:mb-11">
                {causeData[state.currentIndex].action}
            </h1>
    
            {/* Answer Cards */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {options.map((option) => {
                    const isSelected = state.selected === option.id;
                    const isCorrectAnswer = causeData[state.currentIndex].answer === option.id;
                    let borderClass = 'border-gray-700';
    
                    if (state.answerSubmitted) {
                        if (isSelected) {
                            borderClass = isCorrectAnswer ? 'border-green-500 ' : 'border-red-500 ';
                        } else if (isCorrectAnswer) {
                            // Highlight the correct answer if user chose wrong
                            borderClass = 'border-green-500';
                        }
                    }
    
                    return (
                        <div
                            key={option.id}
                            onClick={() => handleSelectAnswer(option.id)}
                            className={`
                                h-46 md:h-[40vh] rounded-xl border-2
                                flex justify-center items-center cursor-pointer 
                                bg-[#202F36]/30 backdrop-blur-sm
                                transition-all duration-300
                                ${borderClass}
                                ${!state.answerSubmitted ? 'hover:scale-102 hover:border-gray-200' : 'cursor-not-allowed'}
                            `}
                        >
                            <p className="text-center text-slate-100  sm:text-2xl font-medium font-['Inter'] leading-relaxed">
                                {option.text}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
      </main>
      <div className="w-full h-[12vh] bg-[#28343A] flex justify-center items-center px-[5vw] z-50 fixed bottom-0">
          <div className="w-auto md:w-[15vw] h-[8vh] relative flex items-center justify-center">
              <Heart width="8.5vw"/>
              <span className="absolute text-white font-bold text-[3vh] lilita tracking-[0.05vw] top-[49%] left-[57%] -translate-x-1/2 -translate-y-1/2">
                {state.questionTimeLeft} sec
              </span>
          </div>
      </div>
      {/* Timer at the bottom */}
    </div>
  );
};

export default CauseScanner;