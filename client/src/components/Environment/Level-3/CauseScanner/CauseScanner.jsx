import React, { useReducer, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";

// Data and Component Imports
import { notesEnvironment6to8 } from "@/data/notesEnvironment6to8.js";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Heart from "@/components/icon/GreenBudget/Heart.jsx";

// =============================================================================
// Constants and Configuration
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'causeScannerGameState';
const PASSING_THRESHOLD = 0.7; // 70% to win

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

const options = [
    { text: <>Helps prevent<br/>Climate change</>, id: "Helps Prevent" },
    { text: <>Contributes to<br/>Climate change</>, id: "Contributes To" },
];

const QUESTION_TIME_LIMIT = 10;
const TOTAL_QUESTIONS = causeData.length;
const PERFECT_SCORE = TOTAL_QUESTIONS * 2;
const scrollbarHideStyle = `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;

// =============================================================================
// Helper Functions
// =============================================================================
function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    if (text.startsWith("`") && text.endsWith("`")) text = text.slice(1, -1).trim();
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
    questionTimeLeft: QUESTION_TIME_LIMIT,
    timerActive: false,
    answerSubmitted: false,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
};

function reducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing", timerActive: true };
        case "SELECT_ANSWER": {
            if (state.answerSubmitted) return state;
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
        case "FINISH_GAME":
            return { ...state, gameState: "finished", timerActive: false };
        case "TICK":
            return { ...state, questionTimeLeft: state.questionTimeLeft > 0 ? state.questionTimeLeft - 1 : 0 };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing", timerActive: true };
        case "SET_AI_INSIGHT": return { ...state, ...action.payload };
        default: return state;
    }
}


// =============================================================================
// UI Components
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
                <div className="mt-6 flex flex-col sm:flex-row sm:items-stretch gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
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
    );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p>
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center mb-6">Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row sm:items-stretch gap-4 w-full max-w-md md:max-w-2xl">
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

function ReviewScreen({ answers, onBackToResults }) { return (<div className="min-h-screen flex flex-col items-center justify-center bg-[#111813] py-8 px-4 sm:px-6 lg:px-8 text-white"><div className="w-full max-w-6xl bg-[#1A241D] rounded-3xl shadow-lg flex flex-col items-center p-6 sm:p-8 relative"><button onClick={onBackToResults} className="flex justify-center items-center absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-gray-700 hover:bg-gray-600 transition"><span className="font-sans text-3xl text-white select-none">&times;</span></button><h2 className="text-3xl sm:text-4xl font-bold text-center w-full font-['Comic_Neue'] text-yellow-400">Check your answers</h2><p className="mb-6 sm:mb-8 text-base sm:text-lg text-gray-300 text-center w-full">See which actions help prevent or contribute to climate change.</p><div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 w-full">{answers.map((ans, idx) => (<div key={idx} className={`flex flex-col p-4 rounded-xl ${ans.isCorrect ? "bg-green-900/50" : "bg-red-900/50"}`}><p className={`font-['Comic_Neue'] text-xl font-bold mb-2 ${ans.isCorrect ? "text-green-300" : "text-red-300"}`}>{idx + 1}. {ans.action}</p><p className="text-base text-gray-200">You chose: <span className="font-semibold">{ans.selected}</span></p>{!ans.isCorrect && (<p className="text-base text-gray-200">Correct answer: <span className="font-semibold">{ans.correctAnswer}</span></p>)}</div>))}</div></div></div>); }

// =============================================================================
// Main Game Component
// =============================================================================
const CauseScanner = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(reducer, initialState);

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
            }, 1200);
            return () => clearTimeout(timeoutId);
        }
    }, [state.answerSubmitted, state.currentIndex]);

    // Session persistence logic
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(savedStateJSON) });
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);

    // Effect for AI Insight Generation
    useEffect(() => {
        if (state.gameState === 'finished' && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectAnswers = state.answers.filter(a => !a.isCorrect);
                if (incorrectAnswers.length === 0 && state.answers.length > 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You're a true climate champion!", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }
                const prompt = `
You are an AI tutor for a student who played a rapid-fire game about climate change actions.
### CONTEXT ###
1.  **Student's Incorrect Answers:**
    ${JSON.stringify(incorrectAnswers.map(a => ({ action: a.action, their_choice: a.selected, correct_choice: a.correctAnswer })), null, 2)}
2.  **All Available Note Sections for this Module:**
    ${JSON.stringify(notesEnvironment6to8, null, 2)}
### YOUR TWO-STEP TASK ###
1.  **Step 1: DETECT.** The student is confusing actions that 'Help Prevent' climate change with those that 'Contribute To' it. Analyze their mistakes to see if there's a pattern (e.g., misunderstanding energy consumption, waste, etc.). Find the ONE note section that best clarifies these distinctions.
2.  **Step 2: GENERATE.** Based on their performance, provide a short, encouraging, and holistic insight (about 25-30 words).
If the score is perfect, congratulate them as a "climate champion".
If they did well (>80%), praise their solid understanding. 
If they did poorly, focus on learning and improvement, see where they went wrong and provide them with some actionable feedback like what should they do or what to focus on and  Recommend they review the detected note section by its 'title' to master the concepts and a technique that might help them improve. 
basically give an actionable insight and feedback .
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the most relevant section.",
  "insight": "Your personalized and encouraging feedback message here."
}`;
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesEnvironment6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" } });
                    } else { throw new Error("Failed to parse AI response."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Review the answers to become a climate expert.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    const handleSelectAnswer = (answerId) => {
        if (!state.answerSubmitted) {
            dispatch({ type: "SELECT_ANSWER", payload: answerId });
        }
    };
    
    // New navigation handlers
    const handleNavigateToSection = () => { if (state.recommendedSectionId) { sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state)); navigate(`/environmental/notes?grade=6-8&section=${state.recommendedSectionId}`); }};
    const handlePlayAgain = () => { sessionStorage.removeItem(SESSION_STORAGE_KEY); dispatch({ type: 'RESET_GAME' }); };
    const handleContinue = () => { sessionStorage.removeItem(SESSION_STORAGE_KEY); navigate('/melt-down-tracker'); }; 
    const handleViewFeedback = () => dispatch({ type: "REVIEW_GAME" });
    const handleBackToResults = () => dispatch({ type: "BACK_TO_FINISH" });

    // Render logic
    if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    if (state.gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;

    if (state.gameState === "finished") {
        const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        return isVictory ? (
            <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={handleViewFeedback} onContinue={handleContinue} />
        ) : (
            <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={handleViewFeedback} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />
        );
    }
    
    if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={handleBackToResults} />;

    return (
        <div className="min-h-screen bg-[#111813] flex flex-col items-center overflow-hidden">
            <GameNav />
            <main className="w-full flex-grow flex flex-col items-center justify-center text-white px-4 mb-27">
                <div className="w-full max-w-4xl flex flex-col items-center">
                    <h1 className="text-center text-white text-2xl sm:text-3xl font-bold font-['Comic_Neue'] leading-normal sm:mb-11">
                        {causeData[state.currentIndex].action}
                    </h1>
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                        {options.map((option) => {
                            const isSelected = state.selected === option.id;
                            const isCorrectAnswer = causeData[state.currentIndex].answer === option.id;
                            let borderClass = 'border-gray-700';
                            if (state.answerSubmitted) {
                                if (isSelected) {
                                    borderClass = isCorrectAnswer ? 'border-green-500 ' : 'border-red-500 ';
                                } else if (isCorrectAnswer) {
                                    borderClass = 'border-green-500';
                                }
                            }
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => handleSelectAnswer(option.id)}
                                    className={`h-46 md:h-[40vh] rounded-xl border-2 flex justify-center items-center cursor-pointer bg-[#202F36]/30 backdrop-blur-sm transition-all duration-300 ${borderClass} ${!state.answerSubmitted ? 'hover:scale-102 hover:border-gray-200' : 'cursor-not-allowed'}`}
                                >
                                    <p className="text-center text-slate-100 sm:text-2xl font-medium font-['Inter'] leading-relaxed">
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
                    <Heart className="w-[20vw] lg:w-[8.5vw]"/>
                    <span className="absolute text-white font-bold text-xs md:text-base lg:text-[3vh] lilita tracking-[0.05vw] top-[49%] left-[57%] -translate-x-1/2 -translate-y-1/2">
                        {state.questionTimeLeft} sec
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CauseScanner;