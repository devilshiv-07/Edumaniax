import React, { useEffect, useReducer, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";

// Data Imports
import { notesEnvironment6to8 } from "@/data/notesEnvironment6to8.js";

// Shared Components
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import ThinkingCloud from "@/components/icon/ThinkingCloud";

// =============================================================================
// Constants and Configuration
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'climatePledgeGameState';

const QUESTIONS = [
    { id: "school", question: "One Change at School", placeholder: "Eg: Organising a tree planting event" },
    { id: "home", question: "One Change at Home", placeholder: "Eg: Start composting food waste" },
    { id: "energy", question: "One Energy-Saving Habit", placeholder: "Eg: Switch off lights when not in use" },
    { id: "waste", question: "One Waste-Reducing Habit", placeholder: "Eg: Carry reusable bags for shopping" },
    { id: "awareness", question: "One Awareness Action", placeholder: "Eg: Share climate facts on school bulletin" },
];

const PERFECT_SCORE = QUESTIONS.length * 10;
const PASSING_THRESHOLD = 0.8;
const GAME_TIME_LIMIT = 300;

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

const verifyPledgeWithGemini = async (pledgeText, question) => {
    if (!pledgeText || pledgeText.trim() === "") {
        return { isGood: false, message: "Please write a pledge first!" };
    }
    const prompt = `
You are an encouraging judge in a climate pledge game for students. Your task is to evaluate a student's pledge based on the specific question they were asked.
### CONTEXT ###
- The Question: "${question}"
- The Student's Pledge: "${pledgeText}"
### YOUR INSTRUCTIONS ###
1.  **Analyze the pledge**: Is it specific, actionable, and relevant to the question?
2.  **Provide Feedback**: Write a short, encouraging feedback message (max 15 words).
3.  **Classify the Pledge**: Determine if it's a "good" pledge (specific, actionable) or a "weak" one (vague, irrelevant, gibberish).
### RESPONSE GUIDELINES ###
-   **If the pledge is GOOD and specific** (e.g., "I will organize a plastic bottle recycling drive"): Praise them.
-   **If the pledge is AVERAGE or vague** (e.g., "Help the environment"): Tell them it's a good start and ask for more specific actions.
-   **If the pledge is WEAK, irrelevant, or gibberish** (e.g., "eat more pizza", "asdfghjkl"): Gently guide them to write a relevant environmental pledge.
### OUTPUT FORMAT ###
You MUST return ONLY a raw JSON object. Do not use markdown backticks. The format must be:
{
  "isGood": boolean,
  "message": "Your feedback message here, within the 15-word limit."
}`;
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`,
            { contents: [{ parts: [{ text: prompt }] }] }
        );
        const aiReply = response.data.candidates[0].content.parts[0].text;
        const parsed = parsePossiblyStringifiedJSON(aiReply);
        if (parsed && typeof parsed.isGood === 'boolean' && parsed.message) {
            return parsed;
        } else {
            throw new Error("Failed to parse a valid response from AI.");
        }
    } catch (error) {
        console.error("Error verifying pledge with Gemini:", error);
        return { isGood: false, message: "Couldn't verify right now. Please try again!" };
    }
};

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
                className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg"
            >
                Back to Results
            </button>
        </div>
    );
}

// --- NEW POPUP COMPONENT ---
function LevelCompletePopup({ isOpen, onConfirm, onCancel, onClose }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
            <style>{`
                @keyframes scale-in-popup {
                    0% { transform: scale(0.9); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in-popup { animation: scale-in-popup 0.3s ease-out forwards; }
            `}</style>
            <div className="relative bg-[#131F24] border-2 border-[#FFCC00] rounded-2xl p-6 md:p-8 text-center shadow-2xl w-11/12 max-w-md mx-auto animate-scale-in-popup">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2 rounded-full"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="lilita-one-regular text-2xl md:text-3xl text-yellow-400 mb-3">
                    Yayy! You completed Level 2.
                </h2>
                <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
                    Would you like to move to Level Three?
                </p>
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-8 py-3 bg-red-600 text-lg text-white lilita-one-regular rounded-md hover:bg-red-700 transition-colors border-b-4 border-red-800 active:border-transparent shadow-lg"
                    >
                        Exit game
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-8 py-3 bg-green-600 text-lg text-white lilita-one-regular rounded-md hover:bg-green-700 transition-colors border-b-4 border-green-800 active:border-transparent shadow-lg"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// Reducer Logic
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
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing", timeLeft: GAME_TIME_LIMIT };
        case "TICK":
            if (state.timeLeft <= 1) return { ...state, timeLeft: 0, gameState: "finished" };
            return { ...state, timeLeft: state.timeLeft - 1 };
        case "SET_INPUT_VALUE":
            return { ...state, inputValue: action.payload, isVerified: false, feedback: { ...state.feedback, visible: false } };
        case "START_VERIFICATION": return { ...state, isChecking: true };
        case "SET_VERIFICATION_RESULT":
            return { ...state, feedback: { ...action.payload, visible: true }, isChecking: false, isVerified: true };
        case "CONTINUE": {
            const currentAnswer = state.inputValue;
            const isGood = currentAnswer.trim() === "" ? false : state.feedback.isGood;
            const newAnswer = {
                question: QUESTIONS[state.currentQuestionIndex].question,
                answer: currentAnswer,
                isGood: isGood,
            };
            const updatedAnswers = [...state.answers, newAnswer];
            const newScore = state.score + (isGood ? 10 : 0);
            const nextIndex = state.currentQuestionIndex + 1;
            if (nextIndex < QUESTIONS.length) {
                return { ...initialState, gameState: 'playing', currentQuestionIndex: nextIndex, answers: updatedAnswers, score: newScore, timeLeft: state.timeLeft };
            } else {
                return { ...state, gameState: "finished", answers: updatedAnswers, score: newScore };
            }
        }
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing", timeLeft: GAME_TIME_LIMIT };
        case "SET_AI_INSIGHT":
            return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        default: return state;
    }
}

// =============================================================================
// Main Game Component
// =============================================================================
const ClimatePledge = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [isPopupVisible, setPopupVisible] = useState(false); // --- NEW STATE FOR POPUP ---

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(savedStateJSON) });
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        if (state.gameState !== "playing") return;
        const timerId = setInterval(() => dispatch({ type: "TICK" }), 1000);
        return () => clearInterval(timerId);
    }, [state.gameState]);
    
    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your pledges...", recommendedSectionId: null, recommendedSectionTitle: "" } });

                const weakPledges = state.answers.filter(ans => !ans.isGood);
                if (weakPledges.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Fantastic! All your pledges are specific and actionable. You're a true climate champion!", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }

                const prompt = `
You are an expert AI tutor. A student has written climate pledges, some of which were weak. Your task is to provide targeted feedback.
### CONTEXT ###
1.  **Student's Weak Pledges (Vague or Not Actionable):**
    ${JSON.stringify(weakPledges.map(p => ({ for_question: p.question, their_pledge: p.answer })), null, 2)}
2.  **All Available Note Sections for this Module:**
    ${JSON.stringify(notesEnvironment6to8, null, 2)}
### YOUR TWO-STEP TASK ###
1.  **Step 1: DETECT.** Analyze the weak pledges. The key problem is likely a lack of specificity (e.g., "save the planet"). Identify the ONE note section that best teaches how to take small, concrete, and actionable steps for environmental protection.
2.  **Step 2: GENERATE.** Provide a short, encouraging insight (25-30 words). Explain that good pledges are specific, like recipes. Recommend they review the detected note section by its 'title' to get ideas for more powerful, concrete actions.
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the most relevant section for learning to be specific.",
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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Great start! Try to make your pledges more specific for a bigger impact.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    const handleCheck = useCallback(async () => {
        if (!state.inputValue.trim() || state.isChecking) return;
        dispatch({ type: "START_VERIFICATION" });
        const currentQuestionText = QUESTIONS[state.currentQuestionIndex].question;
        const result = await verifyPledgeWithGemini(state.inputValue, currentQuestionText);
        dispatch({ type: "SET_VERIFICATION_RESULT", payload: result });
    }, [state.inputValue, state.isChecking, state.currentQuestionIndex]);

    const handleContinueClick = useCallback(() => {
        dispatch({ type: "CONTINUE" });
    }, []);

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

    // --- MODIFIED & NEW HANDLERS FOR POPUP ---
    const handleContinue = () => {
        setPopupVisible(true);
    };

    const handleConfirmNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/cause-scanner');
        setPopupVisible(false);
    };

    const handleCancelNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/environmental/games');
        setPopupVisible(false);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };
    // --- END MODIFIED & NEW HANDLERS ---

    const renderGameContent = () => {
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
                    onContinue={handleContinue} />
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
        
        if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;

        const currentQuestion = QUESTIONS[state.currentQuestionIndex];
        const isCheckNowDisabled = state.inputValue.trim() === "" || state.isChecking;
        const isContinueDisabled = !state.isVerified;

        return (
            <div className="w-full h-screen bg-[#0A160E] flex flex-col items-center overflow-hidden pt-4 px-4 pb-[160px] sm:pb-[104px]">
                <GameNav timeLeft={state.timeLeft} />
                
                <div className="relative flex-grow flex flex-col justify-center items-center text-center w-full max-w-4xl space-y-6 md:space-y-8">
                    <h1 className="text-white text-2xl md:text-4xl font-bold font-['Comic_Neue'] leading-normal">{currentQuestion.question}</h1>
                    <div className="w-full max-w-sm md:max-w-md h-36 md:h-44 bg-gray-800/30 rounded-xl border border-zinc-700 p-2">
                        <textarea
                            value={state.inputValue}
                            onChange={(e) => dispatch({ type: "SET_INPUT_VALUE", payload: e.target.value })}
                            placeholder={currentQuestion.placeholder}
                            className="w-full h-full bg-transparent text-center text-neutral-400 placeholder:text-neutral-500 text-lg md:text-xl font-bold font-['Comic_Neue'] outline-none resize-none flex items-center justify-center p-2"
                        />
                    </div>
                    
                    <div className="absolute -bottom-20 md:-bottom-7 left-0 w-full min-h-[90px] md:min-h-[110px] flex justify-center items-end pointer-events-none">
                        {state.feedback.visible && (
                            <div className="flex items-end justify-center">
                            <img
                                src="/feedbackcharacter.gif"
                                alt="Character talking"
                                className="w-[4rem] md:w-[5rem] h-auto object-contain shrink-0"
                            />
                            <div className="relative  md:ml-[1rem] mb-[1rem] md:mb-[3rem] lg:mb-[2rem]">
                                <ThinkingCloud className="w-[180px] md:w-[320px] lg:w-[300px]" />
                                <p 
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] pl-4
                                               text-[9px] md:text-sm leading-tight text-white text-center inter-font font-medium"
                                >
                                    {state.feedback.message}
                                </p>
                            </div>
                        </div>
                        )}
                    </div>
                        
                </div>

                <div className="w-full bg-[#28343A] flex flex-row justify-center items-center p-4 gap-4 fixed bottom-0 left-0 z-50 ">
                    <div className="w-full sm:w-auto flex-1 max-w-xs">
                        <button
                            onClick={handleCheck}
                            disabled={isCheckNowDisabled}
                            className="relative w-full h-14"
                        >
                            <Checknow topGradientColor="#02ad3eff" bottomGradientColor="#026123ff" className={isCheckNowDisabled ? "opacity-70" : ""} width="100%" height="100%" />
                            <span className={`absolute inset-0 flex items-center justify-center lilita-one-regular text-xl text-white [text-shadow:0_2px_0_#000] transition-opacity ${isCheckNowDisabled ? "opacity-50" : ""}`}>
                                {state.isChecking ? "Checking..." : "Check Now"}
                            </span>
                        </button>
                    </div>
                    <div className="w-full sm:w-auto flex-1 max-w-xs">
                        <button
                            onClick={handleContinueClick}
                            disabled={isContinueDisabled}
                            className="relative w-full h-14"
                        >
                            <Checknow topGradientColor="#02ad3eff" bottomGradientColor="#026123ff" className={isContinueDisabled ? "opacity-70" : ""} width="100%" height="100%" />
                            <span className={`absolute inset-0 flex items-center justify-center lilita-one-regular text-xl text-white [text-shadow:0_2px_0_#000] transition-opacity ${isContinueDisabled ? "opacity-50" : ""}`}>
                                Continue
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {renderGameContent()}
            <LevelCompletePopup
                isOpen={isPopupVisible}
                onConfirm={handleConfirmNavigation}
                onCancel={handleCancelNavigation}
                onClose={handleClosePopup}
            />
        </>
    );
};

export default ClimatePledge;