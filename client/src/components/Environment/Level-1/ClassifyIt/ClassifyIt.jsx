// src/pages/ClassifyIt.jsx

import React, { useReducer, useEffect, useState } from "react"; // Added useState
import { useNavigate } from "react-router-dom";
import { useEnvirnoment } from "@/contexts/EnvirnomentContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";

// Image imports...
import NaturalBioticImg from "/environmentGameInfo/ClassifyIt/biotic.png";
import NaturalAbioticImg from "/environmentGameInfo/ClassifyIt/abiotic.png";
import HumanMadeImg from "/environmentGameInfo/ClassifyIt/human_made.png";
import SocialImg from "/environmentGameInfo/ClassifyIt/social.png";

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

// Data and constants...
const data = [
  { word: "Tree", answer: "Natural–Biotic" },
  { word: "River", answer: "Natural–Abiotic" },
  { word: "Cow", answer: "Natural–Biotic" },
  { word: "Law", answer: "Social" },
  { word: "Oxygen", answer: "Natural–Abiotic" },
  { word: "Airplane", answer: "Human-Made" },
  { word: "School", answer: "Social" },
  { word: "Bridge", answer: "Human-Made" },
  { word: "Sunlight", answer: "Natural–Abiotic" },
  { word: "Family", answer: "Social" },
  { word: "Road", answer: "Human-Made" },
  { word: "Fish", answer: "Natural–Biotic" },
];

const categories = [
  { name: "Natural–Biotic", image: NaturalBioticImg },
  { name: "Natural–Abiotic", image: NaturalAbioticImg },
  { name: "Human-Made", image: HumanMadeImg },
  { name: "Social", image: SocialImg },
];

const TIME_LIMIT = 180;
const TOTAL_QUESTIONS = data.length;
const PERFECT_SCORE = TOTAL_QUESTIONS * 2;

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;

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
  isVictory: false,
};

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
    case "SELECT_OPTION":
      if (state.answerSubmitted) {
        return state;
      }
      return { ...state, selected: state.selected === action.payload ? null : action.payload };
    case "SUBMIT_ANSWER": {
      const current = data[state.currentIndex];
      const isCorrect = current.answer === state.selected;
      return {
        ...state,
        answers: [
          ...state.answers,
          {
            word: current.word,
            selected: state.selected,
            correctAnswer: current.answer,
            isCorrect,
          },
        ],
        score: isCorrect ? state.score + 2 : state.score,
        timerActive: false,
        answerSubmitted: true,
      };
    }
    case "NEXT_QUESTION":
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        selected: null,
        timerActive: true,
        answerSubmitted: false,
      };
    case "FINISH_GAME": {
      const isVictory = state.score === PERFECT_SCORE;
      return { ...state, gameState: "finished", timerActive: false, isVictory };
    }
    case "REVIEW_GAME":
      return { ...state, gameState: "review" };
    case "BACK_TO_FINISH":
      return { ...state, gameState: "finished" };
    case "TICK":
      if (state.timeLeft <= 1) {
          return { ...state, timeLeft: 0, gameState: 'finished', timerActive: false };
      }
      return { ...state, timeLeft: state.timeLeft - 1 };
    case "RESET_GAME":
      return { ...initialState, gameState: "playing", timerActive: true };
    default:
      return state;
  }
}

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
    const itemsPerRow = 3;
    const emptySlots = (itemsPerRow - (answers.length % itemsPerRow)) % itemsPerRow;

    return (
        <div className="w-full h-screen bg-[#0A160E] text-white p-6 flex flex-col items-center justify-center">
            <style>{scrollbarHideStyle}</style>
            
            <h1 className="text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-5 flex-grow overflow-y-auto no-scrollbar">
                {answers.map((ans, idx) => (
                    <div 
                        key={idx} 
                        className={`p-4 rounded-lg flex flex-col justify-center ${ans.isCorrect ? 'bg-green-800' : 'bg-red-800/80'} transition-all duration-300`}
                    >
                        <p className="text-gray-300 text-sm mb-2 leading-tight">Word: {ans.word}</p>
                        <p className="font-semibold text-base">
                            Your Answer: 
                            <span className={ans.isCorrect ? 'text-white' : 'text-red-300'}> {ans.selected || "Not Answered"}</span>
                        </p>
                        {!ans.isCorrect && (
                            <p className="font-semibold text-base">
                                Correct Answer: 
                                <span className="text-green-300"> {ans.correctAnswer}</span>
                            </p>
                        )}
                    </div>
                ))}
                {Array(emptySlots).fill(0).map((_, index) => (
                    <div key={`empty-${index}`} className="opacity-0 pointer-events-none"></div>
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

const ClassifyIt = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  const { updatePerformance } = usePerformance();
  const [insight, setInsight] = useState("");

  useEffect(() => {
    let timer;
    if (state.gameState === "playing" && state.timerActive && state.timeLeft > 0) {
      timer = setTimeout(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    } 
    else if (state.timeLeft === 0 && state.gameState === "playing") {
        dispatch({ type: "FINISH_GAME" });
    }
    return () => clearTimeout(timer);
  }, [state.gameState, state.timerActive, state.timeLeft]);
  
  // *** FIXED: COMBINED USEEFFECT HOOKS ***
  useEffect(() => {
    if (state.gameState === "finished") {
      const runPerformanceUpdate = async () => {
        try {
          const totalAnswered = state.answers.length;
          const correct = state.answers.filter(a => a.isCorrect).length;
          const rawScore = state.score;
          const scaledScore = parseFloat(((rawScore / (TOTAL_QUESTIONS * 2)) * 10).toFixed(2));
          const accuracy = totalAnswered ? (correct / totalAnswered) * 100 : 0;
          const scaledAccuracy = parseFloat(accuracy.toFixed(2));
          const completed = totalAnswered === TOTAL_QUESTIONS;
          const studyTimeMinutes = Math.round((TIME_LIMIT - state.timeLeft) / 60);
          const avgResponseTimeSec = totalAnswered ? Math.round((TIME_LIMIT - state.timeLeft) / totalAnswered) : 0;

          await completeEnvirnomentChallenge(0, 0);

          await updatePerformance({
            moduleName: "Environment",
            topicName: "sustainableLeader",
            score: scaledScore,
            accuracy: scaledAccuracy,
            avgResponseTimeSec,
            studyTimeMinutes,
            completed,
          });
        } catch (error) {
          console.error("Error updating environment performance:", error);
        }
      };

      const generateInsight = async () => {
            setInsight("Fetching personalized insight...");
            const accuracyScore = PERFECT_SCORE > 0 ? Math.round((state.score / PERFECT_SCORE) * 100) : 0;
            const isVictory = state.score === PERFECT_SCORE;

            const answersSummary = state.answers.map(ans => 
              `For "${ans.word}", user chose "${ans.selected || 'No answer'}" which was ${ans.isCorrect ? 'correct' : 'incorrect'}. Correct answer was "${ans.correctAnswer}".`
            ).join('\n');

            const prompt = `
A student played a "Classify It" game about environmental components. Here is their performance:

Overall Accuracy: ${accuracyScore}%
Score: ${state.score} out of ${PERFECT_SCORE}

Detailed Answers:
${answersSummary}

### INSTRUCTION ###
Based on their performance, provide a short, encouraging, and educational insight (about 20-25 words) about their understanding of environmental components. If they got a perfect score, praise them as an expert. If they did well (>=75%), praise their strong understanding. 
If they struggled, see where they went wrong and provide them with some actionable feedback like what should they do or which concepts they should review or focus on or a technique that might help them improve. basically give an actionable insight that they can use to improve their understanding of topics where they lag by analyzing them.

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
                if (isVictory) {
                    fallbackInsight = "Perfect score! You're an expert at identifying environmental components.";
                } else if (accuracyScore >= 75) {
                    fallbackInsight = "Great job! You have a strong understanding of our environment.";
                } else {
                    fallbackInsight = "Good effort! Review the answers to master these concepts.";
                }
                setInsight(fallbackInsight);
            }
        };

        runPerformanceUpdate();
        generateInsight();
    }
  }, [state.gameState, state.score, state.answers, state.timeLeft, completeEnvirnomentChallenge, updatePerformance]);


  const handleSubmit = () => {
    if (state.selected === null) return;
    dispatch({ type: "SUBMIT_ANSWER" });
  };

  const handleNextQuestion = () => {
    if (state.currentIndex < TOTAL_QUESTIONS - 1) {
      dispatch({ type: "NEXT_QUESTION" });
    } else {
      dispatch({ type: "FINISH_GAME" });
    }
  };

  const handlePlayAgain = () => {
    dispatch({ type: "RESET_GAME" });
  };

  const handleViewFeedback = () => {
    dispatch({ type: "REVIEW_GAME" });
  };

  const handleContinue = () => {
    navigate(-1);
  };
  
  const currentWord = data[state.currentIndex]?.word.toUpperCase() || "";
  const buttonText = state.answerSubmitted ? "Continue" : "Submit";
  const isButtonEnabled = state.answerSubmitted || state.selected !== null;
  const showFeedback = state.answerSubmitted;
  
  if (state.gameState === "intro") {
    if (state.introStep === "first") {
      return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    }
    if (state.introStep === "instructions") {
      return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
    }
  }

  if (state.gameState === "finished") {
    const totalScore = state.score;
    const totalPossibleScore = PERFECT_SCORE;
    const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
    const isVictory = state.score === PERFECT_SCORE;

    if (isVictory) {
      return (
        <VictoryScreen
          accuracyScore={accuracyScore}
          insight={insight}
          onViewFeedback={handleViewFeedback}
          onContinue={handleContinue}
        />
      );
    } else {
      return (
        <LosingScreen
          onPlayAgain={handlePlayAgain}
          onViewFeedback={handleViewFeedback}
          onContinue={handleContinue}
          insight={insight}
          accuracyScore={accuracyScore}
        />
      );
    }
  }

  if (state.gameState === "review") {
    return (
      <ReviewScreen
        answers={state.answers}
        onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <GameNav timeLeft={state.timeLeft} />
      
      <div className="w-full flex-1 flex flex-col items-center pt-2">
        <div className="w-full max-w-5xl flex items-center justify-center mt-12 mb-16">
          <div className="flex items-center space-x-4">
            <h2 className=" text-2xl md:text-4xl text-white font-['Lilita_One']">Word:</h2>
            <span className="text-3xl md:text-5xl text-white font-['Lilita_One']">{currentWord}</span>
          </div>
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 sm:px-6 md:px-8 mb-8">
          {categories.map((cat) => {
            const isSelected = state.selected === cat.name;
            const currentQuestion = data[state.currentIndex];
            const correctAnswer = currentQuestion?.answer;

            let borderClass = 'border-gray-500';
            let interactionClass = '';

            if (state.answerSubmitted) {
              interactionClass = 'cursor-not-allowed'; 
              if (cat.name === correctAnswer) {
                borderClass = 'border-green-500';
              } else if (isSelected && cat.name !== correctAnswer) {
                borderClass = 'border-red-500';
              }
            } else {
              interactionClass = 'hover:scale-102';
              if (isSelected) {
                borderClass = 'border-green-500 ';
              }
            }

            return (
              <div
                key={cat.name}
                onClick={() => !state.answerSubmitted && dispatch({ type: "SELECT_OPTION", payload: cat.name })}
                className={`
                  px-6 pb-4 rounded-2xl cursor-pointer transition-all duration-300
                  bg-gray-800/30 flex flex-col justify-between items-center
                  border-2 ${borderClass}
                  ${interactionClass}
                `}
              >
                <img src={cat.image} alt={cat.name} className="md:w-40 md:h-50 lg:w-48 lg:h-60 object-contain" />
                <div className="w-full inline-flex justify-center items-center">
                  <span className="text-center justify-center text-slate-100 md:text-xl lg:text-3xl font-medium font-['Inter'] leading-relaxed">
                    {cat.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-full bg-[#28343A] flex justify-center items-center px-4 mt-auto py-5">
          <div className="w-full max-w-xs h-14">  
            <button
              className="relative w-full h-full cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={showFeedback ? handleNextQuestion : handleSubmit}
              disabled={!isButtonEnabled}
            >
              <Checknow
                topGradientColor={"#09be43"}
                bottomGradientColor={"#068F36"}
                width="100%"
                height="100%"
              />
              <span
                className={`
                  absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                  w-full text-center
                  lilita text-2xl text-white [text-shadow:0_2px_0_#000]
                  z-10
                `}
              >
                {buttonText}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassifyIt;