import React, { useEffect, useReducer, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";
import { notesEnvironment6to8 } from "@/data/notesEnvironment6to8.js";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import ThinkingCloud from "@/components/icon/ThinkingCloud";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";

const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'greenBudgetGameState';
const PASSING_THRESHOLD = 0.8; 
const TIMER_DURATION = 180; 

const questions = [
    { id: 1, scenario: "Your school wants to reduce its environment footprint. Pick 3 items.", items: [
        { name: "Solar lights", cost: 250, imageUrl: "/financeGames6to8/level-1/weekend-movie.svg", sustainable: true },
        { name: "Compost bins", cost: 150, imageUrl: "/financeGames6to8/level-1/ice-cream.svg", sustainable: true },
        { name: "Poster printout", cost: 100, imageUrl: "/financeGames6to8/level-1/data-plan.svg", sustainable: false },
        { name: "Packaged water", cost: 100, imageUrl: "/financeGames6to8/level-1/gift.svg", sustainable: false },
        { name: "Plastic Dustin", cost: 100, imageUrl: "/financeGames6to8/level-1/ice-cream.svg", sustainable: false },
        { name: "Cloth Banner", cost: 100, imageUrl: "/financeGames6to8/level-1/shoes.svg", sustainable: true },
    ]},
    { id: 2, scenario: "Design a 'green corner' for your classroom.", items: [
        { name: "Indoor plant set", cost: 150, imageUrl: "/financeGames6to8/level-1/shoes.svg", sustainable: true },
        { name: "Educational eco-posters", cost: 100, imageUrl: "/financeGames6to8/level-1/lend-to-a-friend.svg", sustainable: true },
        { name: "Plastic plant holders", cost: 100, imageUrl: "/financeGames6to8/level-1/weekend-movie.svg", sustainable: false },
        { name: "LED study lamp", cost: 250, imageUrl: "/financeGames6to8/level-1/data-plan.svg", sustainable: true },
        { name: "Disposable cups", cost: 100, imageUrl: "/financeGames6to8/level-1/ice-cream.svg", sustainable: false },
    ]},
    { id: 3, scenario: "Reduce waste at your school canteen.", items: [
        { name: "Steel utensils", cost: 200, imageUrl: "/financeGames6to8/level-1/ice-cream.svg", sustainable: true },
        { name: "Paper straws", cost: 100, imageUrl: "/financeGames6to8/level-1/data-plan.svg", sustainable: true },
        { name: "Plastic cutlery", cost: 100, imageUrl: "/financeGames6to8/level-1/weekend-movie.svg", sustainable: false },
        { name: "Compost bin", cost: 150, imageUrl: "/financeGames6to8/level-1/lend-to-a-friend.svg", sustainable: true },
        { name: "Promotional balloons", cost: 100, imageUrl: "/financeGames6to8/level-1/gift.svg", sustainable: false },
    ]},
];

const INITIAL_BUDGET = 500;
const ITEMS_TO_SELECT = 3;
const MAX_SCORE_PER_ROUND = 5;
const PERFECT_SCORE = questions.length * MAX_SCORE_PER_ROUND;

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

const initialState = {
    gameState: "intro",
    currentQuestionIndex: 0,
    selectedItems: [],
    remainingBalance: INITIAL_BUDGET,
    score: 0,
    answers: [],
    feedback: { visible: false, message: "" },
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
    timeLeft: TIMER_DURATION,
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing", timeLeft: TIMER_DURATION };
        case "RESET_GAME": return { ...initialState, gameState: "playing", timeLeft: TIMER_DURATION };
        case "TOGGLE_ITEM": {
            if (state.feedback.visible) return state;
            const item = action.payload;
            const isSelected = state.selectedItems.some(i => i.name === item.name);
            if (isSelected) {
                return {
                    ...state,
                    selectedItems: state.selectedItems.filter(i => i.name !== item.name),
                    remainingBalance: state.remainingBalance + item.cost,
                };
            } else {
                if (state.selectedItems.length >= ITEMS_TO_SELECT) return state;
                if (state.remainingBalance < item.cost) {
                    return { ...state, feedback: { visible: true, message: "Not enough balance!" } };
                }
                return {
                    ...state,
                    selectedItems: [...state.selectedItems, item],
                    remainingBalance: state.remainingBalance - item.cost,
                };
            }
        }
        case "HIDE_FEEDBACK": return { ...state, feedback: { visible: false, message: "" } };
        case "SUBMIT_ANSWER": {
            if (state.selectedItems.length !== ITEMS_TO_SELECT) {
                return { ...state, feedback: { visible: true, message: "Please select exactly 3 items." } };
            }
            const sustainableCount = state.selectedItems.filter(i => i.sustainable).length;
            let scoreAwarded = 0, message = "";
            if (sustainableCount === 3) { scoreAwarded = 5; message = "Excellent! All sustainable choices."; }
            else if (sustainableCount === 2) { scoreAwarded = 3; message = "Good attempt, but one choice wasn't eco-friendly."; }
            else if (sustainableCount === 1) { scoreAwarded = 1; message = "Try picking more green items!"; }
            else { message = "Oh no! None of these were sustainable choices."; }
            
            return {
                ...state,
                score: state.score + scoreAwarded,
                feedback: { visible: true, message },
                answers: [...state.answers, {
                    scenario: questions[state.currentQuestionIndex].scenario,
                    selectedItems: state.selectedItems,
                    scoreAwarded,
                    feedbackMessage: message,
                }],
            };
        }
        case "NEXT_QUESTION": {
            if (state.currentQuestionIndex < questions.length - 1) {
                return {
                    ...state,
                    currentQuestionIndex: state.currentQuestionIndex + 1,
                    selectedItems: [],
                    remainingBalance: INITIAL_BUDGET,
                    feedback: { visible: false, message: "" },
                    timeLeft: TIMER_DURATION,
                };
            }
            return { ...state, gameState: "finished" };
        }
        case "TICK": {
            if (state.gameState !== 'playing') return state;
            return { ...state, timeLeft: state.timeLeft - 1 };
        }
        case "TIME_UP": {
            const sustainableCount = state.selectedItems.filter(i => i.sustainable).length;
            let scoreAwarded = 0;
            if (sustainableCount === 3) { scoreAwarded = 5; }
            else if (sustainableCount === 2) { scoreAwarded = 3; }
            else if (sustainableCount === 1) { scoreAwarded = 1; }

            const forcedAnswer = {
                scenario: questions[state.currentQuestionIndex].scenario,
                selectedItems: state.selectedItems,
                scoreAwarded,
                feedbackMessage: "Time ran out for this question!",
            };

            const newTotalScore = state.score + scoreAwarded;
            const newAnswers = [...state.answers, forcedAnswer];

            const isLastQuestion = state.currentQuestionIndex >= questions.length - 1;

            if (isLastQuestion) {
                return {
                    ...state,
                    gameState: "finished",
                    score: newTotalScore,
                    answers: newAnswers,
                };
            } else {
                return {
                    ...state,
                    currentQuestionIndex: state.currentQuestionIndex + 1,
                    selectedItems: [],
                    remainingBalance: INITIAL_BUDGET,
                    feedback: { visible: false, message: "" },
                    timeLeft: TIMER_DURATION, 
                    score: newTotalScore,
                    answers: newAnswers,
                };
            }
        }
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "SET_AI_INSIGHT": return { ...state, ...action.payload };
        default: return state;
    }
}

function ItemCard({ item, isSelected, onClick, isDisabled }) {
    const cardClasses = `flex items-center w-full p-1.5 rounded-lg transition-all duration-200 ease-in-out cursor-pointer 
    md:min-h-0 md:p-1.5 lg:w-[27vw] lg:min-h-[9vh] lg:px-[2vw] lg:py-[1.5vh] lg:rounded-[1.2vh] 
    ${isSelected ? "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428] lg:border-[0.2vh]" : "bg-[#131f24] border-2 border-[#37464f] shadow-[0_2px_0_0_#37464f] lg:border-[0.2vh]"} 
    ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "hover:scale-102"}`;
const walletIconUrl = isSelected ? "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-04/tuvaKMgcsm.png" : "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-04/CGOQJaAXZU.png";
    return (
        <div className={cardClasses} onClick={onClick}>
            <div className={`flex w-16 h-8 justify-center items-center rounded-md border-2 md:w-16 md:h-8 lg:w-[7vw] lg:h-[4vh] lg:rounded-[0.8vh] lg:border-[0.2vh] ${isSelected ? "border-[#79b933]" : "border-[#37464f]"}`}>
                <img src={walletIconUrl} alt="wallet" className="w-4 h-4 shrink-0 md:w-4 md:h-4 lg:w-[2.5vh] lg:h-[2.5vh]" />
                <span className="font-['Lilita_One'] text-[#fff] ml-1 text-[11px] md:text-[11px] lg:text-[1.2vw] lg:ml-[0.5vw]">₹{item.cost}</span>
            </div>
            <div className="flex-1 px-2 md:px-3 lg:px-[1vw]"><span className={`font-['Inter'] font-medium text-xs md:text-xs lg:text-[1.4vw] ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}`}>{item.name}</span></div>
            <img src={item.imageUrl} alt={item.name} className="w-7 h-7 shrink-0 object-contain md:w-7 md:h-7 lg:w-[2vw] lg:h-[2vw]" />
        </div>
    );
}

function FeedbackGIF({ message }) {
    return (
        <div className="relative flex items-end lg:absolute lg:-right-[12vw] lg:-bottom-[6vh] lg:left-auto">
            <img src="/feedbackcharacter.gif" alt="Character talking" className="w-20 -ml-4 md:ml-0 h-auto object-contain md:w-20 lg:w-[10vw] lg:h-[15vh]" />
            <div className="absolute left-4 bottom-7 md:bottom-9 lg:left-[1vw] lg:bottom-[6vh] relative">
                <ThinkingCloud width="120px" className="md:w-[160px] lg:w-[11vw]" />
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10/12 text-white text-center font-['Comic_Neue'] text-[8px] md:text-[10px] lg:text-[0.7vw] leading-tight">
                    {message}
                </p>
            </div>
        </div>
    );
}

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
            <h1 className="text-3xl sm:text-4xl font-bold lilita-one-regular my-6 text-yellow-400 flex-shrink-0">Review Your Choices</h1>
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 flex-grow overflow-y-auto">
                {answers.map((ans, idx) => {
                    const isGoodChoice = ans.scoreAwarded > 0;
                    return (
                        <div key={idx} className={`p-4 rounded-xl flex flex-col ${isGoodChoice ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                            <p className="text-gray-300 text-base mb-2 leading-tight font-bold">{ans.scenario}</p>
                            <div className="text-sm space-y-2 ">
                                <p className="font-semibold">Your Selection:</p>
                                <p className={`font-mono ${isGoodChoice ? 'text-white' : 'text-red-300'}`}>{ans.selectedItems.map(item => item.name).join(", ") || "Not Answered"}</p>
                                <p className="font-semibold pt-2">Feedback:</p>
                                <p className={`font-mono ${isGoodChoice ? 'text-white' : 'text-red-300'}`}>{ans.feedbackMessage}</p>
                            </div>
                        </div>
                    );
                })}
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

export default function GreenBudgetGame() {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const currentQuestion = useMemo(() => questions[state.currentQuestionIndex], [state.currentQuestionIndex]);

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(savedStateJSON) });
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        if (state.feedback.visible && state.feedback.message.includes("Not enough balance")) {
            const timer = setTimeout(() => dispatch({ type: "HIDE_FEEDBACK" }), 2000);
            return () => clearTimeout(timer);
        }
    }, [state.feedback]);

    useEffect(() => {
        if (state.gameState !== 'playing') return;

        if (state.timeLeft <= 0) {
            dispatch({ type: 'TIME_UP' });
            return;
        }
        
        const intervalId = setInterval(() => {
            dispatch({ type: 'TICK' });
        }, 1000);

        return () => clearInterval(intervalId);
    }, [state.timeLeft, state.gameState]);

    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your choices...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectChoices = state.answers.filter(a => a.scoreAwarded < MAX_SCORE_PER_ROUND);
                if (incorrectChoices.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect budgeting! You're a true Green Champion.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }
                const prompt = `
You are an AI tutor for a student who played an environmental budgeting game. Your task is to provide targeted feedback.
### CONTEXT ###
1.  **Student's Incorrect Choices (where they picked non-sustainable items):**
    ${JSON.stringify(incorrectChoices.map(c => ({ scenario: c.scenario, their_choices: c.selectedItems.map(i => `${i.name} (${i.sustainable ? 'Sustainable' : 'Not Sustainable'})`) })), null, 2)}
2.  **All Available Note Sections for this Module:**
    ${JSON.stringify(notesEnvironment6to8, null, 2)}
### YOUR TWO-STEP TASK ###
1.  **Step 1: DETECT.** Analyze the student's mistakes. They are choosing items marked 'Not Sustainable' (like single-use plastics). Find the ONE note section that best explains the importance of reducing waste and choosing reusable or sustainable alternatives.
2.  **Step 2: GENERATE.** Based on their choices and overall score, provide a concise and encouraging insight (20-25 words) about their performance.
                    The tone should be positive and educational, suitable for a student.
                    If they did well, praise their green thinking.
                    If they achieved a perfect score, praise them as an expert. 
                    If they did well (>80%), praise their strong commitment and tell where they can improve.
                    If they did poorly, focus on learning and improvement, see where they went wrong and provide them with some actionable feedback like what should they do or what to focus on and  Recommend they review the detected note section by its 'title' to master the art of green choices and a technique that might help them improve. basically give an actionable insight and feedback .
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the section about sustainable choices and waste reduction.",
  "insight": "Your personalized and encouraging feedback message here."
}`;
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesEnvironment6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" }});
                    } else { throw new Error("Failed to parse AI response."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good start! Reviewing your choices helps you spot more sustainable options next time.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    const handleNavigateToSection = () => { if (state.recommendedSectionId) { sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state)); navigate(`/environmental/notes?grade=6-8&section=${state.recommendedSectionId}`); }};
    const handlePlayAgain = () => { sessionStorage.removeItem(SESSION_STORAGE_KEY); dispatch({ type: 'RESET_GAME' }); };
    const handleContinue = () => { sessionStorage.removeItem(SESSION_STORAGE_KEY); navigate('/match-fallout'); };
    const handleReviewAnswers = () => dispatch({ type: 'REVIEW_GAME' });
    const handleBackToResults = () => dispatch({ type: 'BACK_TO_FINISH' });
    
    const { gameState, selectedItems, remainingBalance, score, feedback, timeLeft } = state;
    const buttonText = feedback.visible ? "Continue" : "Check Now";
    const isButtonEnabled = feedback.visible || selectedItems.length === ITEMS_TO_SELECT;

    if (gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    if (gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
    
    if (gameState === "finished") {
        const accuracyScore = Math.round((score / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={handleReviewAnswers} onContinue={handleContinue} />
            : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={handleReviewAnswers} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle}/>;
    }

    if (gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={handleBackToResults} />;

    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col justify-between ">
            <GameNav timeLeft={timeLeft} />
            <div className="flex-1 flex flex-col relative md:justify-center">
                <div className="flex flex-col items-center w-full p-4 gap-4 md:flex-row md:justify-center md:items-center md:p-6 md:gap-8 lg:flex-row lg:items-center lg:justify-center lg:px-[5vw] lg:py-[2vh] lg:gap-[4vw]">
                    <div className="w-full flex flex-col gap-2 p-3 bg-[rgba(32,47,54,0.3)] rounded-lg h-[370px] md:w-1/2 md:h-[370px] md:gap-2 lg:w-auto lg:h-[68vh] lg:py-[3vh] lg:p-[2vh] lg:rounded-[1.2vh] lg:gap-[1.5vh]">
                        {currentQuestion.items.map((item) => (
                            <ItemCard
                                key={item.name}
                                item={item}
                                isSelected={selectedItems.some((i) => i.name === item.name)}
                                onClick={() => dispatch({ type: "TOGGLE_ITEM", payload: item })}
                                isDisabled={(selectedItems.length >= ITEMS_TO_SELECT || remainingBalance < item.cost) && !selectedItems.some((i) => i.name === item.name)}
                            />
                        ))}
                    </div>
                    <div className="relative flex flex-col w-full p-6 bg-[rgba(32,47,54,0.3)] rounded-lg justify-center items-center text-white text-center md:w-1/2 md:h-[370px] lg:w-[29vw] lg:h-[68vh] lg:p-[4vh] lg:rounded-[1.2vh]">
                        <span className="font-['Inter'] text-lg font-medium md:text-xl lg:text-[1.4vw] lg:leading-[3vh] lg:max-w-[30vw]">
                            {currentQuestion.scenario}
                        </span>
                    </div>
                </div>
                {feedback.visible && (
                    <div className="absolute bottom-0 inset-x-0 flex justify-center items-center lg:hidden pointer-events-none">
                        <div className="pointer-events-auto">
                           <FeedbackGIF message={feedback.message} />
                        </div>
                    </div>
                )}
                {feedback.visible && (
                    <div className="hidden lg:block absolute bottom-10 right-75 pointer-events-none">
                        <FeedbackGIF message={feedback.message} />
                    </div>
                )}
            </div>
            <div className="w-full h-auto bg-[#28343A] flex flex-row items-center justify-between p-2 gap-2 z-10 lg:justify-evenly lg:h-[10vh] lg:px-[5vw]">
                <div className="flex items-center gap-2 lg:gap-[1vw]">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#232e34] border-2 border-white flex justify-center items-center lg:w-[7vh] lg:h-[7vh] lg:border-[0.2vh]">
                        <img src="/Coin_gold.png" alt="wallet" className="w-8 h-8 sm:w-10 sm:h-10 lg:w-[5vh] lg:h-[5vh]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="lilita text-base sm:text-lg text-[#ffcc00] [text-stroke:1px_black] tracking-wider lg:text-[2.5vh] lg:tracking-[0.05vw]">Total Wallet:</span>
                        <span className="lilita text-base sm:text-lg text-white lg:text-[2.5vh]">₹{remainingBalance}</span>
                    </div>
                </div>
                <div className="w-36 h-14 sm:w-48 sm:h-16 lg:w-[12vw] lg:h-[8vh]">
                    <button className="relative w-full h-full cursor-pointer" onClick={() => dispatch({ type: feedback.visible ? 'NEXT_QUESTION' : 'SUBMIT_ANSWER' })} disabled={!isButtonEnabled}>
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-lg sm:text-xl text-white [text-shadow:0_3px_0_#000] lg:text-[2.5vh] ${!isButtonEnabled && "opacity-50"}`}>{buttonText}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}