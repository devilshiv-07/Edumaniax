import React, { useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";

// Data and Context (assuming these paths are correct)
import { useEnvirnoment } from "@/contexts/EnvirnomentContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import { notesEnvironment6to8 } from "@/data/notesEnvironment6to8.js";

// Component Imports
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";

// Image Imports
import NaturalBioticImg from "/environmentGameInfo/ClassifyIt/biotic.png";
import NaturalAbioticImg from "/environmentGameInfo/ClassifyIt/abiotic.png";
import HumanMadeImg from "/environmentGameInfo/ClassifyIt/human_made.png";
import SocialImg from "/environmentGameInfo/ClassifyIt/social.png";

// =============================================================================
// Constants and Configuration
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'classifyItGameState';

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
const PASSING_THRESHOLD = 0.7;

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// =============================================================================
// Helper Functions
// =============================================================================
function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
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
// State Management (Reducer)
// =============================================================================
const initialState = {
    gameState: "intro",
    currentIndex: 0,
    selected: null,
    score: 0,
    answers: [],
    timeLeft: TIME_LIMIT,
    timerActive: false,
    answerSubmitted: false,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
};

function reducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE":
            return action.payload;
        case "SHOW_INSTRUCTIONS":
            return { ...state, gameState: "instructions" };
        case "START_GAME":
            return { ...initialState, gameState: "playing", timerActive: true };
        case "SELECT_OPTION":
            if (state.answerSubmitted) return state;
            return { ...state, selected: state.selected === action.payload ? null : action.payload };
        case "SUBMIT_ANSWER": {
            const current = data[state.currentIndex];
            const isCorrect = current.answer === state.selected;
            return {
                ...state,
                answers: [...state.answers, { word: current.word, selected: state.selected, correctAnswer: current.answer, isCorrect }],
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
        case "FINISH_GAME":
            return { ...state, gameState: "finished", timerActive: false };
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
        case "SET_AI_INSIGHT":
            return {
                ...state,
                insight: action.payload.insight,
                recommendedSectionId: action.payload.recommendedSectionId,
                recommendedSectionTitle: action.payload.recommendedSectionTitle,
            };
        default:
            return state;
    }
}


// =============================================================================
// UI Components
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
                    {/* FIXED: Added sm:items-stretch to ensure cards have equal height on larger screens */}
                    <div className="mt-6 flex flex-col sm:flex-row sm:items-stretch gap-4 w-full max-w-md md:max-w-xl">
                        {/* FIXED: Ensured this is a flex column to allow inner content to grow */}
                        <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
                            <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                            {/* FIXED: Replaced h-20 with min-h-[5rem] and flex-grow */}
                            <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center py-3 px-5">
                                <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                                <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
                            </div>
                        </div>
                        {/* FIXED: Ensured this is a flex column to allow inner content to grow */}
                        <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                            <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                             {/* FIXED: Replaced h-20 with min-h-[5rem] and flex-grow */}
                            <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center px-4 text-center">
                                <span className="text-[#FFCC00] text-xs font-normal">{insight}</span>
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

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden text-center">
            <div className="flex-1 flex flex-col items-center justify-center p-4">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close! Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-stretch gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] text-xs font-normal">{insight}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                    {recommendedSectionTitle && (
                        <button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg">
                            Review "{recommendedSectionTitle}" Notes
                        </button>
                    )}
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
                        <p className="text-gray-300 text-base mb-2 font-bold">Word: {ans.word}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Answer:</p>
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>
                                {ans.selected || "Not Answered"}
                            </p>
                            <div className={ans.isCorrect ? 'invisible' : ''}>
                                <p className="font-semibold pt-2">Correct Answer:</p>
                                <p className="font-mono text-green-300">{ans.correctAnswer}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBackToResults}
                className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg"
            >
                Back to Results
            </button>
        </div>
    );
}

// =============================================================================
// Main Game Component
// =============================================================================
const ClassifyIt = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(reducer, initialState);
    const { completeEnvirnomentChallenge } = useEnvirnoment();
    const { updatePerformance } = usePerformance();

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            dispatch({ type: 'RESTORE_STATE', payload: savedState });
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);

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
        if (state.gameState === "finished" && !state.insight) {
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
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });

                const incorrectAnswers = state.answers.filter(ans => !ans.isCorrect);
                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You have an excellent understanding of this module.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }
                
                const noteSectionsForModule = notesEnvironment6to8;
                const prompt = `
You are an expert AI tutor. A student has just finished a game and made mistakes. Your task is to provide targeted feedback.
### CONTEXT ###
1.  **Student's Incorrect Answers:**
    ${JSON.stringify(incorrectAnswers.map(a => ({ for_word: a.word, their_incorrect_choice: a.selected, correct_answer_was: a.correctAnswer })), null, 2)}
2.  **All Available Note Sections for this Module:**
    ${JSON.stringify(noteSectionsForModule, null, 2)}
### YOUR TWO-STEP TASK ###
1.  **Step 1: DETECT.** Analyze the student's mistakes and compare them to the 'content' of each note section. Identify the ONE section that is the best match for their errors. The mistakes are about classifying environmental components into categories like Natural-Biotic, Natural-Abiotic, Human-Made, and Social.
2.  **Step 2: GENERATE.** Based on their performance, provide a short, encouraging, and educational insight (about 25-30 words). If they struggled, identify the types of categories they confused and recommend they review the detected note section by its 'title'. Suggest a simple technique like thinking if an item is living/non-living or man-made to help them classify better.
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the section you identified (e.g., '1', '3', etc.)",
  "insight": "Your personalized and encouraging feedback message here."
}`;

                try {
                    const response = await axios.post(
                        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`,
                        { contents: [{ parts: [{ text: prompt }] }] }
                    );
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);

                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesEnvironment6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({
                            type: "SET_AI_INSIGHT",
                            payload: {
                                insight: parsed.insight,
                                recommendedSectionId: parsed.detectedTopicId,
                                recommendedSectionTitle: recommendedNote ? recommendedNote.title : ""
                            }
                        });
                    } else { throw new Error("Failed to parse response from AI."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };

            runPerformanceUpdate();
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

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

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/environmental/notes?grade=6-8&section=${state.recommendedSectionId}`);
        }
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/pick-zone'); // Or navigate(-1)
    };

    if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    if (state.gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;

    if (state.gameState === "finished") {
        const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;

        return isVictory
            ? <VictoryScreen
                accuracyScore={accuracyScore}
                insight={state.insight}
                onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })}
                onContinue={handleContinue}
            />
            : <LosingScreen
                accuracyScore={accuracyScore}
                insight={state.insight}
                onPlayAgain={handlePlayAgain}
                onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })}
                onContinue={handleContinue}
                onNavigateToSection={handleNavigateToSection}
                recommendedSectionTitle={state.recommendedSectionTitle}
            />;
    }

    if (state.gameState === "review") {
        return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    const currentWord = data[state.currentIndex]?.word.toUpperCase() || "";
    const buttonText = state.answerSubmitted ? "Continue" : "Submit";
    const isButtonEnabled = state.answerSubmitted || state.selected !== null;
    const showFeedback = state.answerSubmitted;

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
                        const correctAnswer = data[state.currentIndex]?.answer;
                        let borderClass = 'border-gray-500';
                        let interactionClass = 'hover:scale-102';

                        if (state.answerSubmitted) {
                            interactionClass = 'cursor-not-allowed';
                            if (cat.name === correctAnswer) {
                                borderClass = 'border-green-500';
                            } else if (isSelected && cat.name !== correctAnswer) {
                                borderClass = 'border-red-500';
                            }
                        } else if (isSelected) {
                            borderClass = 'border-green-500';
                        }

                        return (
                            <div
                                key={cat.name}
                                onClick={() => !state.answerSubmitted && dispatch({ type: "SELECT_OPTION", payload: cat.name })}
                                className={`px-6 pb-4 rounded-2xl cursor-pointer transition-all duration-300 bg-gray-800/30 flex flex-col justify-between items-center border-2 ${borderClass} ${interactionClass}`}
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
                            <Checknow topGradientColor={"#09be43"} bottomGradientColor={"#068F36"} width="100%" height="100%" />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full text-center lilita text-2xl text-white [text-shadow:0_2px_0_#000] z-10">
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