import React, { useState, useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";

import { notesCommunication6to8 } from "@/data/notesCommunication6to8.js";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";

// =============================================================================
// Setup (API, Session Key, Helper Functions)
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'persuasionChallengeState_v4'; // Incremented version to avoid old state conflicts

function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        return null;
    }
}

// =============================================================================
// UI Components
// =============================================================================
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- NEW POPUP COMPONENT (from ChainReaction, made more generic) ---
function LevelCompletePopup({ isOpen, onConfirm, onCancel, onClose, title, message, confirmText, cancelText }) {
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
                    Yayy! You completed Level 1.
                </h2>
                <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
                    Would you like to move to Level Two?
                </p>
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-8 py-3 bg-red-600 text-lg text-white lilita-one-regular rounded-md hover:bg-red-700 transition-colors border-b-4 border-red-800 active:border-transparent shadow-lg"
                    >
                        Exit Game
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

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col ">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 overflow-y-auto no-scrollbar">
                <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="text-yellow-400 font-['Lilita_One'] text-3xl sm:text-4xl mt-6">Argument Won!</h2>
                <p className="text-white text-lg mt-2">You're a master of persuasion!</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase">Persuasion Score</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center p-4">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-[#09BE43] text-2xl ">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center p-4 text-center">
                            <span className="text-[#FFCC00] font-['Lilita_One'] text-sm ">{insight}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center items-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-10 md:h-14 hover:scale-105" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-10 md:h-14 hover:scale-105" />
            </div>
        </div>
    );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl">Oops! The motion was denied.</p>
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl mb-6">Want to try again?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase">Persuasion Score</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center p-4">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center p-4 text-center">
                            <span className="text-[#FFCC00] lilita-one-regular text-xs">{insight}</span>
                        </div>
                    </div>
                </div>
                {recommendedSectionTitle && (
                    <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                        <button
                            onClick={onNavigateToSection}
                            className="bg-[#068F36] text-black font-semibold rounded-lg py-3 px-10 hover:bg-green-700 border-b-4 border-green-800 active:border-transparent"
                        >
                            Review "{recommendedSectionTitle}" Notes
                        </button>
                    </div>
                )}
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 hover:scale-105" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 hover:scale-105" />
                {/* The 'onContinue' here will also trigger the popup */}
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400">Review Your Argument</h1>
            <div className="w-full max-w-4xl flex flex-col gap-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => {
                    const isCorrect = ans.scoreAwarded >= ans.maxScore;
                    return (
                        <div key={idx} className={`p-4 rounded-xl flex flex-col ${isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                            <p className="text-gray-300 font-bold mb-2">{ans.scenario}</p>
                            <div className="text-sm space-y-1">
                                <p className="font-semibold">Your Answer(s):</p>
                                <p className={`${isCorrect ? 'text-white' : 'text-red-300'} whitespace-pre-line`}>{ans.selectedOptions.map(opt => `• ${opt.text}`).join('\n')}</p>
                                {!isCorrect && (
                                    <>
                                        <p className="font-semibold pt-2">Correct Answer(s):</p>
                                        <p className="text-green-300 whitespace-pre-line">{ans.correctAnswerText.split(' & ').map(txt => `• ${txt}`).join('\n')}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700">Back to Results</button>
        </div>
    );
}

function OptionCard({ option, isSelected, onClick, isDisabled }) {
    const cardClasses = `flex items-center justify-center inter-font w-full min-h-[60px] px-4 py-3 rounded-xl shadow-md transition-all cursor-pointer text-center ${isSelected ? "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428]" : "bg-[#131f24] border-2 border-[#37464f]"} ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "hover:scale-102"}`;
    const textClasses = `font-medium text-base ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}`;
    return <div className={cardClasses} onClick={onClick}><span className={textClasses}>{option.text}</span></div>;
}

// =============================================================================
// Game Data
// =============================================================================
const dilemmas = [
    { id: 1, type: 'single-select', question: "Convince your school to allow an extra sports period.", scenario: "Step 1: Choose your opening line.", options: [{ text: "I believe an extra sports period would benefit all students.", score: 3 }, { text: "We should have more fun. Period.", score: 0 }, { text: "If we don't get this, we'll protest!", score: 0 }], correctAnswerTexts: ["I believe an extra sports period would benefit all students."] },
    { id: 2, type: 'multi-select', selectCount: 2, question: "Convince your school to allow an extra sports period.", scenario: "Step 2: Choose exactly 2 strong reasons.", options: [{ text: "It improves focus and fitness.", score: 3 }, { text: "We can burn energy in a healthy way.", score: 3 }, { text: "It’s more fun than math.", score: 0 }], correctAnswerTexts: ["It improves focus and fitness.", "We can burn energy in a healthy way."] },
    { id: 3, type: 'single-select', question: "Convince your school to allow an extra sports period.", scenario: "Step 3: End with a catchy slogan.", options: [{ text: "Sweat Today, Succeed Tomorrow!", score: 3 }, { text: "Brain Boost = Sports Dose", score: 0 }], correctAnswerTexts: ["Sweat Today, Succeed Tomorrow!"] },
];
const totalPossibleScore = dilemmas.reduce((total, d) => total + (d.type === 'multi-select' ? d.options.reduce((sum, o) => sum + (o.score > 0 ? o.score : 0), 0) : Math.max(...d.options.map(o => o.score))), 0);

// =============================================================================
// State Management with useReducer
// =============================================================================
const initialState = {
    gameState: "intro",
    currentDilemmaIndex: 0,
    selectedOptions: [],
    totalScore: 0,
    feedbackMessage: "",
    showFeedback: false,
    dilemmaResults: [],
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: ""
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'RESTORE_STATE':
            return action.payload;
        case 'START_GAME':
            return { ...initialState, gameState: "playing" };
        case 'SHOW_INSTRUCTIONS':
            return { ...state, gameState: 'instructions' };
        case 'SELECT_OPTION':
            return { ...state, selectedOptions: action.payload };
        case 'SUBMIT_ANSWER': {
            const { stepScore, feedback, maxStepScore } = action.payload;
            return {
                ...state,
                totalScore: state.totalScore + stepScore,
                feedbackMessage: feedback,
                showFeedback: true,
                dilemmaResults: [...state.dilemmaResults, {
                    scenario: dilemmas[state.currentDilemmaIndex].scenario,
                    selectedOptions: state.selectedOptions,
                    scoreAwarded: stepScore,
                    maxScore: maxStepScore,
                    correctAnswerText: dilemmas[state.currentDilemmaIndex].correctAnswerTexts.join(' & '),
                }]
            };
        }
        case 'NEXT_DILEMMA': {
            const nextIndex = state.currentDilemmaIndex + 1;
            if (nextIndex >= dilemmas.length) {
                return { ...state, gameState: 'finished' };
            }
            return { ...state, currentDilemmaIndex: nextIndex, selectedOptions: [], showFeedback: false, feedbackMessage: "" };
        }
        case 'SET_AI_INSIGHT':
            return { ...state, ...action.payload };
        case 'REVIEW_GAME':
            return { ...state, gameState: 'review' };
        case 'BACK_TO_FINISH':
            return { ...state, gameState: 'finished' };
        case 'RESET_GAME':
            return { ...initialState, gameState: "playing" };
        default:
            return state;
    }
}

// =============================================================================
// Main Game Component
// =============================================================================
export default function PersuasionChallenge() {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [isPopupVisible, setPopupVisible] = useState(false); // --- NEW STATE FOR POPUP ---

    const { gameState, currentDilemmaIndex, selectedOptions, showFeedback, feedbackMessage, totalScore, dilemmaResults, insight, recommendedSectionTitle, recommendedSectionId } = state;

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                dispatch({ type: 'RESTORE_STATE', payload: savedState });
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) {
                console.error("Failed to parse saved game state:", error);
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
    }, []);

    const currentDilemma = useMemo(() => dilemmas[currentDilemmaIndex], [currentDilemmaIndex]);

    useEffect(() => {
        if (gameState === "finished" && !insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your choices...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectAnswers = dilemmaResults.filter(res => res.scoreAwarded < res.maxScore);

                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "A flawless argument! You've mastered persuasion.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }

                const prompt = `A student played the 'Persuasion Challenge' game. Their incorrect choices are: ${JSON.stringify(incorrectAnswers)}. The available communication skills notes are: ${JSON.stringify(notesCommunication6to8)}. TASK: 1. DETECT: Find the most relevant note section for errors related to persuasive speaking. 2. GENERATE: Write a 25-35 word insight recommending that section by its title to help them improve. OUTPUT: JSON with "detectedTopicId" and "insight".`;

                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const rawText = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(rawText);

                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication6to8.find(note => note.topicId === parsed.detectedTopicId);
                        if (recommendedNote) {
                            dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: recommendedNote.topicId, recommendedSectionTitle: recommendedNote.title } });
                        } else {
                            console.warn(`AI recommended a topicId ("${parsed.detectedTopicId}") that was not found. Using fallback.`);
                            const fallbackNote = notesCommunication6to8.find(note => note.topicId === '3') || notesCommunication6to8[2];
                            dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: fallbackNote.topicId, recommendedSectionTitle: fallbackNote.title } });
                        }
                    } else { throw new Error("Parsed AI response is invalid or missing required keys."); }
                } catch (err) {
                    console.error("Error fetching or parsing AI insight:", err);
                    const fallbackNote = notesCommunication6to8.find(note => note.topicId === '3') || notesCommunication6to8[2];
                    const fallbackPayload = {
                        insight: "Great attempt! To make your arguments stronger, review the 'Speak with Purpose' notes.",
                        recommendedSectionId: fallbackNote.topicId,
                        recommendedSectionTitle: fallbackNote.title
                    };
                    dispatch({ type: "SET_AI_INSIGHT", payload: fallbackPayload });
                }
            };
            generateInsight();
        }
    }, [gameState, dilemmaResults, insight]);

    const handleSelectOption = (option) => {
        if (showFeedback) return;
        let newSelectedOptions;
        if (currentDilemma.type === 'multi-select') {
            const isSelected = selectedOptions.some(o => o.text === option.text);
            if (isSelected) {
                newSelectedOptions = selectedOptions.filter(o => o.text !== option.text);
            } else if (selectedOptions.length < currentDilemma.selectCount) {
                newSelectedOptions = [...selectedOptions, option];
            } else {
                newSelectedOptions = selectedOptions;
            }
        } else {
            newSelectedOptions = [option];
        }
        dispatch({ type: 'SELECT_OPTION', payload: newSelectedOptions });
    };

    const handleSubmit = () => {
        if (!selectedOptions.length) return;
        let stepScore = 0, feedback = "", maxStepScore = 0;
        if (currentDilemma.type === 'multi-select') {
            stepScore = selectedOptions.reduce((sum, opt) => sum + opt.score, 0);
            maxStepScore = currentDilemma.options.filter(o => o.score > 0).reduce((sum, o) => sum + o.score, 0);
            if (stepScore === maxStepScore) feedback = "Perfect! You've chosen the two strongest reasons.";
            else if (stepScore > 0) feedback = "Good start! One of your reasons is strong, but the other could be better.";
            else feedback = "These reasons aren't very persuasive.";
        } else {
            stepScore = selectedOptions[0].score;
            maxStepScore = Math.max(...currentDilemma.options.map(o => o.score));
            if (stepScore === maxStepScore) feedback = "Excellent choice! A very persuasive point.";
            else feedback = "That might not be the most effective approach.";
        }
        dispatch({ type: 'SUBMIT_ANSWER', payload: { stepScore, feedback, maxStepScore } });
    };

    const isButtonEnabled = useMemo(() => {
        if (showFeedback) return true;
        const requiredCount = currentDilemma.type === 'multi-select' ? currentDilemma.selectCount : 1;
        return selectedOptions.length === requiredCount;
    }, [selectedOptions, currentDilemma, showFeedback]);

    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=6-8&section=${recommendedSectionId}`);
        }
    };
    
    // --- UPDATED AND NEW HANDLERS FOR POPUP LOGIC ---
    const handleContinue = () => {
        setPopupVisible(true);
    };

    const handleConfirmNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate("/interrupt-game");
        setPopupVisible(false);
    };

    const handleCancelNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate("/communications/games"); // Navigate to the main games page for this subject
        setPopupVisible(false);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleStartGame = () => {
        dispatch({ type: 'START_GAME' });
    };

    const renderGameContent = () => {
        if (gameState === "intro") {
            return <IntroScreen
                onShowInstructions={() => dispatch({ type: 'SHOW_INSTRUCTIONS' })}
                title="Persuasion Challenge"
            />;
        }

        if (gameState === "finished") {
            const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
            const isVictory = accuracyScore >= 80;
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={recommendedSectionTitle} />;
        }

        if (gameState === "review") {
            return <ReviewScreen answers={dilemmaResults} onBackToResults={() => dispatch({ type: 'BACK_TO_FINISH' })} />;
        }
        
        // This is the main game view which will stay in the background during instructions
        return (
            <div className="w-full h-screen bg-[#0A160E] flex flex-col">
                <GameNav />
                {gameState === "instructions" && <InstructionsScreen onStartGame={handleStartGame} />}

                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-10 text-center">
                        <h2 className="text-slate-100 text-xl md:text-2xl font-medium">{currentDilemma?.question}</h2>
                        <p className="text-gray-300 text-sm md:text-base mt-2"><span className="font-bold">Scenario:</span> {currentDilemma?.scenario}</p>
                        <div className="w-full max-w-lg mx-auto mt-6 flex flex-col gap-4">
                            {currentDilemma?.options.map((option, index) => (
                                <OptionCard
                                    key={index} option={option}
                                    isSelected={selectedOptions.some(o => o.text === option.text)}
                                    onClick={() => handleSelectOption(option)}
                                    isDisabled={showFeedback && !selectedOptions.some(o => o.text === option.text)}
                                />
                            ))}
                        </div>
                    </div>
                </main>
                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full" onClick={showFeedback ? () => dispatch({ type: 'NEXT_DILEMMA' }) : handleSubmit} disabled={!isButtonEnabled}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lilita text-lg text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled ? "opacity-50" : ""}`}>
                                {showFeedback ? "Continue" : "Check Now"}
                            </span>
                        </button>
                    </div>
                </footer>
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
                title="Argument Won!"
                message="Ready for a new challenge?"
                confirmText="Next Challenge"
                cancelText="Exit"
            />
        </>
    );
}