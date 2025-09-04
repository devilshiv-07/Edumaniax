import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { motion } from 'framer-motion';

// --- Import your shared components here ---
import IntroScreen from './IntroScreen'; // Assuming this component exists
import InstructionsScreen from './InstructionsScreen'; // Assuming this component exists
import GameNav from './GameNav'; // Assuming this component exists
import Checknow from '@/components/icon/GreenBudget/Checknow'; // Component for the submit button

// --- Import your notes data ---
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

// --- Helper for hiding scrollbar ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Game Data ---
const scenariosData = [
  {
    id: 1,
    sentence: "The teacher gives instructions during a fire drill siren.",
    correctWord: "fire drill siren.",
    correctBarrier: "🧱 Noise"
  },
  {
    id: 2,
    sentence: "One student speaks in technical terms while the other doesn't understand.",
    correctWord: "technical terms",
    correctBarrier: "🗣️ Language"
  },
  {
    id: 3,
    sentence: "A student tries to present while anxious and sweating.",
    correctWord: "anxious and sweating.",
    correctBarrier: "💓 Emotions"
  }
];

const barriers = ["🧱 Noise", "🗣️ Language", "💓 Emotions"];

// --- Constants ---
const PERFECT_SCORE = scenariosData.length * 10;
const PASSING_THRESHOLD = 0.8; // 70%
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'whatWentWrongGameState';

// --- Helper function ---
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


// --- Barrier Option Component ---
const BarrierOption = ({ text, isSelected, onClick }) => (
    <motion.button
        onClick={onClick}
        className={`w-full text-center px-4 py-3 text-white rounded-lg font-medium shadow-md transition-all duration-300 border-2 ${isSelected ? 'bg-green-600 border-green-400 ' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
        whileHover={{ scale: 1.02 }}
    >
        {text}
    </motion.button>
);


// --- End Game Screens (Identical to previous version) ---
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

function LosingScreen({ onPlayAgain, onViewFeedback, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
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
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] inter-font text-[11px] font-normal">{insight}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                    {recommendedSectionTitle && (
                        <button
                            onClick={onNavigateToSection}
                            className="bg-[#068F36] text-black text-sm font-semibold  rounded-lg py-3 px-10 md:px-6  text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg"
                        >
                            Review "{recommendedSectionTitle}" Notes
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex flex-wrap justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                        <h3 className="text-lg font-bold text-yellow-300">Scenario {idx + 1}</h3>
                        <p className="text-gray-200 italic">"{scenariosData[idx].sentence}"</p>
                        <div>
                            <p className="font-semibold text-gray-300">Barrier Phrase:</p>
                            <p className={ans.userAnswers.phrase === ans.correctAnswers.phrase ? 'text-green-300' : 'text-red-300'}>Your Answer: "{ans.userAnswers.phrase}"</p>
                            {!ans.isCorrect && <p className="text-green-400">Correct: "{ans.correctAnswers.phrase}"</p>}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-300">Barrier Type:</p>
                            <p className={ans.userAnswers.barrier === ans.correctAnswers.barrier ? 'text-green-300' : 'text-red-300'}>Your Answer: {ans.userAnswers.barrier}</p>
                            {!ans.isCorrect && <p className="text-green-400">Correct: {ans.correctAnswers.barrier}</p>}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBackToResults}
                className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg"
            >
                Back to Results
            </button>
        </div>
    );
}

// --- Game State Management ---
const initialState = { gameState: "intro", currentScenarioIndex: 0, score: 0, answers: [], insight: "", recommendedSectionId: null, recommendedSectionTitle: "" };

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SET_AI_INSIGHT": return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing" };
        case "SUBMIT_ANSWER": {
            const { userAnswers } = action.payload;
            const scenario = scenariosData[state.currentScenarioIndex];
            const correctAnswers = { phrase: scenario.correctWord, barrier: scenario.correctBarrier };
            const isCorrect = userAnswers.phrase === correctAnswers.phrase && userAnswers.barrier === correctAnswers.barrier;
            const nextState = { ...state, score: isCorrect ? state.score + 10 : state.score, answers: [...state.answers, { userAnswers, correctAnswers, isCorrect }], currentScenarioIndex: state.currentScenarioIndex + 1 };
            if (nextState.currentScenarioIndex >= scenariosData.length) return { ...nextState, gameState: "finished" };
            return nextState;
        }
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing" };
        default: return state;
    }
}


// --- Main Game Component ---
const WhatWentWrongGame = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [selections, setSelections] = useState({ selectedWords: [], selectedBarrier: null });

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
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectAnswers = state.answers.map((ans, index) => ({...ans, scenario: scenariosData[index].sentence})).filter(ans => !ans.isCorrect);
                
                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You're an expert at identifying communication barriers!", recommendedSectionId: null, recommendedSectionTitle: "" } }); return;
                }
                
                const prompt = `You are an expert AI tutor. A student has just finished a game on identifying communication barriers and made some mistakes. Your task is to provide targeted feedback. ### CONTEXT ### 1. **Student's Incorrect Answers:** ${JSON.stringify(incorrectAnswers, null, 2)} 2. **All Available Note Sections for this Module:** ${JSON.stringify(notesCommunication9to10.map(n => ({topicId: n.topicId, title: n.title, content: n.content.substring(0, 200) + '...'})), null, 2)} 
                ### YOUR TWO-STEP TASK ### 1. **Step 1: DETECT.** Analyze the student's mistakes. Do they consistently misidentify a specific type of barrier (e.g., confusing Emotional barriers with Language barriers)? Identify the ONE note section from the list that best addresses their pattern of errors. 2. **Step 2: GENERATE.** Based on their performance, provide a short, encouraging, and educational insight (about 25-30 words) into their understanding of communication blockers. Identify the main area of weakness (e.g., "spotting environmental noise," "recognizing emotional interference") and suggest reviewing the note section you detected by its 'title'. 
                ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the section you identified", "insight": "Your personalized and encouraging feedback message here." }`;
                
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" } });
                    } else { throw new Error("Failed to parse response from AI."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    const handleWordClick = (word) => {
        setSelections(prev => {
            const newSelection = prev.selectedWords.includes(word)
                ? prev.selectedWords.filter(w => w !== word)
                : [...prev.selectedWords, word];
            return { ...prev, selectedWords: newSelection };
        });
    };

    const handleBarrierClick = (barrier) => {
        setSelections(prev => ({ ...prev, selectedBarrier: barrier }));
    };

    const handleSubmit = () => {
        const selectedPhrase = selections.selectedWords.join(" ");
        dispatch({ type: "SUBMIT_ANSWER", payload: { userAnswers: { phrase: selectedPhrase, barrier: selections.selectedBarrier } } });
        setSelections({ selectedWords: [], selectedBarrier: null });
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=6-8&section=${state.recommendedSectionId}`);
        }
    };

    const handleStartGame = () => dispatch({ type: "START_GAME" });
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
    };
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/next-game-path'); //TODO: Update this path
    };

    const isSubmitEnabled = selections.selectedWords.length > 0 && selections.selectedBarrier !== null;
    
    // --- Render Logic ---
    const renderGameContent = () => {
        if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;

        if (state.gameState === "finished") {
            const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
            const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
        }

        if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
        
        const currentScenario = scenariosData[state.currentScenarioIndex];
        if (!currentScenario) return <div className="text-white">Loading...</div>;

        const buttonText = state.currentScenarioIndex === scenariosData.length - 1 ? "Finish" : "Submit";

        return (
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative text-white">
                <style>{scrollbarHideStyle}</style>
                
                {state.gameState === "instructions" && <InstructionsScreen onStartGame={handleStartGame} />}

                <GameNav />
                
                <main className="flex-1 w-full flex flex-col items-center justify-center px-4 pb-24">
                    <motion.div 
                      key={currentScenario.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="w-full max-w-3xl bg-[rgba(32,47,54,0.5)] rounded-2xl p-6 md:p-8 space-y-2 border border-gray-700 shadow-lg"
                    > 
                        <h2 className="text-center font-semibold text-xl text-yellow-300 mb-6 ">Scenario {state.currentScenarioIndex + 1} of {scenariosData.length}</h2>
                        <p className="text-start font-medium text-base  font-medium text-cyan-400 ">Tap all the words because of which you think the communication broke:</p>
                        
                        
                        <div className="bg-gray-800 p-4 rounded-lg mb-7">
                           <p className="text-sm md:text-base text-gray-100 leading-relaxed text-center">
                                {currentScenario.sentence.split(" ").map((word, i) => {
                                    const cleanWord = word.trim();
                                    const isSelected = selections.selectedWords.includes(cleanWord);
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleWordClick(cleanWord)}
                                            className={`px-1 py-0.5 rounded-md transition-all duration-200 mx-0.5 ${isSelected ? 'bg-yellow-400 text-black font-bold scale-102' : 'hover:bg-gray-700'}`}
                                        >
                                            {word}
                                        </button>
                                    );
                                })}
                            </p>
                        </div>
                        
                        <div>
                            <p className="text-start font-medium text-base text-cyan-300 mb-2">🎯 Choose the Communication Barrier:</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm md:text-base">
                                {barriers.map(b => <BarrierOption key={b} text={b} isSelected={selections.selectedBarrier === b} onClick={() => handleBarrierClick(b)} />)}
                            </div>
                        </div>
                    </motion.div>
                </main>

                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0 fixed bottom-0 left-0 border-t border-gray-700">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={!isSubmitEnabled}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] transition-opacity duration-300 ${!isSubmitEnabled ? "opacity-50" : "opacity-100"}`}>
                                {buttonText}
                            </span>
                        </button>
                    </div>
                </footer>
            </div>
        );
    };

    return <>{renderGameContent()}</>;
};

export default WhatWentWrongGame;