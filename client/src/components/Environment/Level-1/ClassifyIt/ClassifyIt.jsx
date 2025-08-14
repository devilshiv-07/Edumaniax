// src/pages/ClassifyIt.jsx (or wherever this file is located)

import React, { useReducer, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEnvirnoment } from "@/contexts/EnvirnomentContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav"; // Correctly imported
import Checknow from "@/components/icon/GreenBudget/Checknow";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

// Image imports...
import NaturalBioticImg from "/environmentGameInfo/ClassifyIt/biotic.png";
import NaturalAbioticImg from "/environmentGameInfo/ClassifyIt/abiotic.png";
import HumanMadeImg from "/environmentGameInfo/ClassifyIt/human_made.png";
import SocialImg from "/environmentGameInfo/ClassifyIt/social.png";

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

// FIX: Defined the missing scrollbarHideStyle variable
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
`;


// Reducer and initial state...
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


// =============================================================================
// Victory and Losing Screen Components
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


function ReviewScreen({ answers, onBackToResults }) {
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-green-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-6xl bg-white rounded-3xl shadow flex flex-col items-center p-6 sm:p-8 lg:p-10 relative">
        <button onClick={onBackToResults} className="flex justify-center items-center absolute top-4 right-4 z-[139] w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full hover:bg-gray-200 transition">
          <span className="font-['Comfortaa'] text-[36px] sm:text-[40px]  text-[#6f6f6f] rotate-[-45deg] font-semibold select-none">+</span>
        </button>
        <h2 className="text-3xl sm:text-4xl font-bold text-center w-full" style={{ fontFamily: 'Comic Neue, Comic Sans MS, cursive' }}>Check your answers</h2>
        <p className="mb-6 sm:mb-8 text-base sm:text-xl text-gray-700 text-center w-full" style={{ fontFamily: 'Commissioner, Arial, sans-serif' }}>Classify the given word into one of the given categories</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full justify-items-center">
          {answers.map((ans, idx) => {
            const isCorrect = ans.isCorrect;
            return (
              <div
                key={idx}
                className={`main-container flex w-full max-w-[280px] sm:max-w-[256px] h-[120px] sm:h-[117px] p-4 sm:pt-[18px] sm:pr-[24px] sm:pb-[18px] sm:pl-[24px] flex-col gap-[10px] justify-center items-start rounded-[15px] relative ${isCorrect ? "bg-[#c8ff9e]" : "bg-[#ffdfe0]"}`}
              >
                <div className="flex w-full justify-between items-start relative">
                  <div className="flex flex-col gap-[8px] sm:gap-[10px] items-start flex-1">
                    <span className={`font-['Comic_Neue'] text-xl sm:text-[25px] font-bold leading-[24px] relative text-left whitespace-nowrap z-[2] ${isCorrect ? "text-[#09be43]" : "text-[#ea2b2b]"}`}>{ans.word}</span>
                    <div className="flex flex-col gap-[2px] sm:gap-[3px] items-start w-full">
                      <span className={`font-['Commissioner'] text-sm sm:text-[18px] font-light leading-[20px] sm:leading-[24px] relative text-left whitespace-nowrap z-[4] ${isCorrect ? "text-[#09be43]" : "text-[#ea2b2b]"}`}>You : {ans.selected}</span>
                      <span className={`font-['Commissioner'] text-sm sm:text-[18px] font-light leading-[20px] sm:leading-[24px] relative text-left whitespace-nowrap z-[5] ${isCorrect ? "text-[#09be43]" : "text-[#ea2b2b]"}`}>Ans : {ans.correctAnswer}</span>
                    </div>
                  </div>
                  <div className="w-[30px] h-[30px] sm:w-[35px] sm:h-[35px] shrink-0 bg-contain bg-no-repeat ml-2" style={{ backgroundImage: isCorrect ? "url(/check.png)" : "url(/cancel.png)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


const ClassifyIt = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  const { updatePerformance } = usePerformance();
  const { width, height } = useWindowSize();

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
      runPerformanceUpdate();
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
    const isVictory = state.isVictory;

    let insightText = "";
    if (isVictory) {
      insightText = "Perfect score! You're an expert at identifying environmental components.";
    } else if (accuracyScore >= 75) {
      insightText = "Great job! You have a strong understanding of our environment."
    } else {
      insightText = "Good effort! Review the answers to master these concepts.";
    }

    if (isVictory) {
      return (
        <VictoryScreen
          accuracyScore={accuracyScore}
          insight={insightText}
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
          insight={insightText}
          accuracyScore={accuracyScore} // FIX: Added the missing prop
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
    <div className="min-h-screen bg-black flex flex-col items-center">
      <GameNav timeLeft={state.timeLeft} />
      
      <div className="w-full flex flex-col items-center pt-2 pb-28">
        {/* Word Section */}
        <div className="w-full max-w-5xl flex items-center justify-center mt-12 mb-16">
          <div className="flex items-center space-x-4">
            <h2 className=" text-2xl md:text-4xl text-white font-['Lilita_One']">Word:</h2>
            <span className="text-3xl md:text-5xl text-white font-['Lilita_One']">{currentWord}</span>
          </div>
        </div>

        {/* Cards Section */}
        <div className="w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-4 sm:px-6 md:px-8">
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

        {/* Bottom Bar with Button */}
        <div className="w-full h-24 bg-[#28343A] flex justify-center items-center px-4 z-50 fixed bottom-0">
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