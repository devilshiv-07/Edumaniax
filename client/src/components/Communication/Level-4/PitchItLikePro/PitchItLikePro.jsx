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
const SESSION_STORAGE_KEY = 'persuasionChallengeState_v5'; // Incremented version

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

function VictoryScreen({ onNextChallenge, onViewFeedback, accuracyScore, insight }) {
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
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onNextChallenge} className="cursor-pointer h-10 md:h-14 hover:scale-105" />
            </div>
        </div>
    );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onNextChallenge, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
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
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onNextChallenge} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    const result = answers[0];
    if (!result) return null;

    const allCorrectAnswers = result.correctAnswerText.split(' & ');

    const userCorrectSelections = result.selectedOptions.filter(opt =>
        allCorrectAnswers.includes(opt.text)
    );
    const userIncorrectSelections = result.selectedOptions.filter(opt =>
        !allCorrectAnswers.includes(opt.text)
    );
    const missedCorrectAnswers = allCorrectAnswers.filter(
        correctTxt => !userCorrectSelections.some(sel => sel.text === correctTxt)
    );

    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400">Review Your Argument</h1>
            <div className="w-full max-w-4xl flex flex-col gap-4 overflow-y-auto p-2 no-scrollbar">

                {userCorrectSelections.length > 0 && (
                    <div className="p-4 rounded-xl bg-green-900/70 border-green-700 border text-white">
                        <p className="font-semibold text-green-300 mb-2 text-lg">Your Strong Arguments:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {userCorrectSelections.map(opt => <li key={opt.text}>{opt.text}</li>)}
                        </ul>
                    </div>
                )}

                {userIncorrectSelections.length > 0 && (
                    <div className="p-4 rounded-xl bg-red-900/70 border-red-700 border text-white">
                        <p className="font-semibold text-red-300 mb-2 text-lg">Arguments to Reconsider:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {userIncorrectSelections.map(opt => <li key={opt.text}>{opt.text}</li>)}
                        </ul>
                    </div>
                )}

                {missedCorrectAnswers.length > 0 && (
                    <div className="p-4 rounded-xl bg-yellow-900/70 border-yellow-700 border text-white">
                        <p className="font-semibold text-yellow-300 mb-2 text-lg">Persuasive Points You Missed:</p>
                        <ul className="list-disc list-inside space-y-1">
                            {missedCorrectAnswers.map(txt => <li key={txt}>{txt}</li>)}
                        </ul>
                    </div>
                )}

            </div>
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700">Back to Results</button>
        </div>
    );
}


function OptionCard({ option, isSelected, onClick, isDisabled }) {
    const cardClasses = `flex items-center justify-center inter-font
        w-full min-h-[60px] px-4 py-3 rounded-xl shadow-md transition-all duration-200 ease-in-out cursor-pointer text-center
        lg:min-h-[7vh] lg:px-[2vw] lg:py-[1.5vh] lg:rounded-[1.2vh] lg:shadow-[0_2px_0_0_#37464f]
        ${isSelected
            ? "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428] lg:border-[0.2vh]"
            : "bg-[#131f24] border-2 border-[#37464f] lg:border-[0.2vh]"
        } ${isDisabled && !isSelected
            ? "opacity-50 cursor-not-allowed"
            : "hover:scale-102"
        }`;
    const textClasses = `font-medium 
        text-sm md:text-base leading-normal 
        lg:text-[1.1vw] lg:leading-[3vh] 
        ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}`;

    return <div className={cardClasses} onClick={onClick}><span className={textClasses}>{option.text}</span></div>;
}

// =============================================================================
// Game Data
// =============================================================================
const correctAnswers = {
    1: {
        text: "Imagine how much less stressful our school would feel if soothing music played between classes.",
        type: "Emotion Hook"
    },
    2: {
        text: "Studies show calming music can reduce anxiety by up to 30%.",
        type: "Real-Life Fact"
    },
    3: {
        text: "Last year, our neighbor school started this, and fights in the hallway dropped.",
        type: "Story"
    },
    4: {
        text: "Let’s ask the principal to start a calming music pilot program this semester!",
        type: "Call to Action"
    },
};

const extraOptions = [
    "Let’s play music only on Fridays when everyone’s tired.",
    "Add loud rock music to energize students before class.",
    "Use music to announce school rules loudly.",
    "Play the principal's favorite song on repeat."
];

const MAX_SCORE = Object.keys(correctAnswers).length;

// =============================================================================
// State Management with useReducer
// =============================================================================
const initialState = {
    gameState: "intro",
    selectedOptions: [],
    totalScore: 0,
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
        case 'FINISH_GAME': {
            const { score, resultsForReview } = action.payload;
            return {
                ...state,
                gameState: 'finished',
                totalScore: score,
                dilemmaResults: [resultsForReview]
            };
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

    const { gameState, selectedOptions, totalScore, dilemmaResults, insight, recommendedSectionTitle, recommendedSectionId } = state;

    const allShuffledOptions = useMemo(() => {
        const correct = Object.values(correctAnswers).map(opt => ({ ...opt, isCorrect: true }));
        const incorrect = extraOptions.map(text => ({ text, isCorrect: false }));
        const all = [...correct, ...incorrect];
        for (let i = all.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [all[i], all[j]] = [all[j], all[i]];
        }
        return all;
    }, []); 


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

    useEffect(() => {
        if (gameState === "finished" && !insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your choices...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                
                const results = dilemmaResults[0];
                if (!results) return;

                const allCorrectOptions = allShuffledOptions.filter(o => o.isCorrect);
                const selectedCorrect = results.selectedOptions.filter(o => o.isCorrect);
                const missedCorrect = allCorrectOptions.filter(
                    correctOpt => !selectedCorrect.some(selectedOpt => selectedOpt.text === correctOpt.text)
                );
                const selectedIncorrect = results.selectedOptions.filter(o => !o.isCorrect);

                if (missedCorrect.length === 0 && selectedIncorrect.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "A flawless argument! You've mastered persuasion.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }
                
                const errorSummary = {
                    selectedIncorrect: selectedIncorrect.map(o => o.text),
                    missedCorrect: missedCorrect.map(o => ({text: o.text, type: o.type}))
                };

                const prompt = `A student played a persuasion game. They had to pick 4 key parts of an argument (Emotion Hook, Real-Life Fact, Story, Call to Action). Their errors are: ${JSON.stringify(errorSummary)}. The available communication skills notes are: ${JSON.stringify(notesCommunication6to8)}. TASK: 1. DETECT: Find the most relevant note section for errors related to choosing strong, persuasive arguments. 2. GENERATE: Write a 25-35 word insight recommending that section by its title to help them improve. OUTPUT: JSON with "detectedTopicId" and "insight".`;

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
    }, [gameState, dilemmaResults, insight, allShuffledOptions]);

    const handleSelectOption = (option) => {
        const isSelected = selectedOptions.some(o => o.text === option.text);
        let newSelectedOptions;
        if (isSelected) {
            newSelectedOptions = selectedOptions.filter(o => o.text !== option.text);
        } else {
            newSelectedOptions = [...selectedOptions, option];
        }
        dispatch({ type: 'SELECT_OPTION', payload: newSelectedOptions });
    };

    const handleSubmit = () => {
        if (!selectedOptions.length) return;

        const score = selectedOptions.filter(opt => opt.isCorrect).length;
        
        const resultsForReview = {
            scenario: "The four key parts of your argument were:",
            selectedOptions: selectedOptions,
            scoreAwarded: score,
            maxScore: MAX_SCORE,
            correctAnswerText: allShuffledOptions.filter(o => o.isCorrect).map(o => o.text).join(' & '),
        };

        dispatch({ type: 'FINISH_GAME', payload: { score, resultsForReview } });
    };

    const isButtonEnabled = selectedOptions.length > 0;

    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=6-8&section=${recommendedSectionId}`);
        }
    };

    const handleNextChallenge = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate("/communications/games");
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
            const accuracyScore = MAX_SCORE > 0 ? Math.round((totalScore / MAX_SCORE) * 100) : 0;
            const isVictory = accuracyScore >= 75; 
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNextChallenge={handleNextChallenge} />
                : <LosingScreen accuracyScore={accuracyScore} insight={insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNextChallenge={handleNextChallenge} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={recommendedSectionTitle} />;
        }

        if (gameState === "review") {
            return <ReviewScreen answers={dilemmaResults} onBackToResults={() => dispatch({ type: 'BACK_TO_FINISH' })} />;
        }
        
        return (
            <div className="w-full h-screen bg-[#0A160E] flex flex-col">
                <GameNav />
                {gameState === "instructions" && <InstructionsScreen onStartGame={handleStartGame} />}

                <main className="flex-1 flex flex-col justify-start md:justify-center px-4 py-8  overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-4xl mx-auto bg-gray-800/30 rounded-xl p-6 md:p-8 text-center">
                        <h2 className="text-slate-100 text-xl md:text-2xl font-medium">Convince your principal to play soothing music between classes.</h2>
                        <p className="text-gray-300 text-sm md:text-base mt-2"><span className="font-bold">Challenge:</span> Select the 4 most persuasive arguments.</p>
                        <div className="w-full mx-auto mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {allShuffledOptions.map((option, index) => (
                                <OptionCard
                                    key={index} option={option}
                                    isSelected={selectedOptions.some(o => o.text === option.text)}
                                    onClick={() => handleSelectOption(option)}
                                    isDisabled={false}
                                />
                            ))}
                        </div>
                    </div>
                </main>
                
                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full" onClick={handleSubmit} disabled={!isButtonEnabled}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lilita text-lg text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled ? "opacity-50" : ""}`}>
                                Check Now
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
        </>
    );
}