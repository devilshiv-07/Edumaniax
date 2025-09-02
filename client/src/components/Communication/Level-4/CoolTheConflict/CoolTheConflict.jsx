import React, { useState, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow'; 


import { notesCommunication6to8 } from "@/data/notesCommunication6to8.js";

// --- Helper for hiding scrollbar ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Game Data ---
const dialogues = [
  {
    speaker: "Friend 1",
    text: [
      { word: "You", type: "normal" },
      { word: "ALWAYS", type: "swap", replacement: "Sometimes" },
      { word: "don't", type: "normal" },
      { word: "listen", type: "normal" },
      { word: "to", type: "normal" },
      { word: "me.", type: "normal" },
      { word: "You", type: "normal" },
      { word: "ruined", type: "normal" },
      { word: "everything!", type: "normal" },
    ],
  },
  {
    speaker: "Friend 2",
    text: [
      { word: "Why", type: "normal" },
      { word: "do", type: "normal" },
      { word: "you", type: "normal" },
      { word: "ALWAYS", type: "swap", replacement: "Often" },
      { word: "say", type: "normal" },
      { word: "that?", type: "normal" },
      { word: "I'm", type: "normal" },
      { word: "trying", type: "normal" },
      { word: "my", type: "normal" },
      { word: "best!", type: "normal" },
    ],
  },
  {
    speaker: "Friend 1",
    text: [
      { word: "I", type: "normal" },
      { word: "feel like you", type: "swap", replacement: "I feel upset when" },
      { word: "don't", type: "normal" },
      { word: "care.", type: "normal" },
      { word: "This", type: "normal" },
      { word: "is", type: "normal" },
      { word: "so", type: "normal" },
      { word: "unfair.", type: "normal" },
    ],
  },
];

const resolutionEndings = [
  { text: "I’m sorry if I hurt you. Let’s figure this out together.", isCorrect: true },
  { text: "I care about our friendship and want to make things better.", isCorrect: true },
  { text: "Whatever. I’m done talking.", isCorrect: false },
  { text: "You're always the problem here.", isCorrect: false },
];

// --- Constants ---
const PERFECT_SCORE = 10;
const PASSING_THRESHOLD = 0.9; // 90% for victory
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'coolTheConflictState';

// --- Helper function for AI response parsing ---
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

// --- End Game Screen Components ---
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
                            className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg"
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

function ReviewScreen({ userSelections, onBackToResults }) {
    const getBorderStyle = (ending, index) => {
        const isSelected = userSelections.includes(index);
        const isCorrect = ending.isCorrect;

        if (isSelected && isCorrect) return 'bg-green-900/70 border-green-500'; // Correctly chosen
        if (isSelected && !isCorrect) return 'bg-red-900/70 border-red-500'; // Incorrectly chosen
        if (!isSelected && isCorrect) return 'bg-red-900/70 border-red-500'; // Missed correct answer
        return 'bg-red-900/70 border-red-500'; // Correctly ignored
    };
    
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-3xl space-y-3 overflow-y-auto p-2 no-scrollbar">
                {resolutionEndings.map((ending, index) => (
                    <div key={index} className={`p-4 rounded-xl border-2 ${getBorderStyle(ending, index)}`}>
                        <p className="font-semibold text-lg">{ending.text}</p>
                        {userSelections.includes(index) && <p className="text-sm mt-2 font-bold text-gray-300">(Your Selection)</p>}
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
const initialState = {
    gameState: "intro", // intro, instructions, playing_dialogue, playing_resolution, finished, review
    swaps: {},
    sliderValue: 0,
    selectedEndings: [],
    score: 0,
    finalAnswer: null,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing_dialogue" };
        case "TOGGLE_SWAP": {
             const { i, j } = action.payload;
             const key = `${i}-${j}`;
             return {
                 ...state,
                 swaps: {
                     ...state.swaps,
                     [key]: state.swaps[key] === "swapped" ? null : "swapped",
                 },
             };
        }
        case "SET_SLIDER": return { ...state, sliderValue: action.payload };
        case "ADVANCE_TO_RESOLUTION": return { ...state, gameState: "playing_resolution"};
        case "TOGGLE_RESOLUTION": {
            const index = action.payload;
            const newSelections = state.selectedEndings.includes(index)
                ? state.selectedEndings.filter(i => i !== index)
                : [...state.selectedEndings, index];

            if (newSelections.length > 2) {
                return state; 
            }
            return { ...state, selectedEndings: newSelections };
        }
        case "SUBMIT_RESOLUTION": {
            const correctCount = state.selectedEndings.filter(i => resolutionEndings[i].isCorrect).length;
            const isFullyCorrect = correctCount === 2 && state.selectedEndings.length === 2;
            const score = isFullyCorrect ? 10 : 5;
            
            return {
                ...state,
                gameState: "finished",
                finalAnswer: { userSelections: state.selectedEndings, isCorrect: isFullyCorrect },
                score: score,
            };
        }
        case "SET_AI_INSIGHT": return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing_dialogue" };
        default: return state;
    }
}


// --- Main Game Component ---
const CoolTheConflict = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const [startTime, setStartTime] = useState(null);

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
        if((state.gameState === 'playing_dialogue' || state.gameState === 'playing_resolution') && !startTime) {
            setStartTime(Date.now());
        }
    }, [state.gameState, startTime]);

    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const endTime = Date.now();
            const durationSec = startTime ? (endTime - startTime) / 1000 : 0;
            updatePerformance({
                moduleName: "Communication",
                topicName: "situationalAwareness",
                score: state.score,
                accuracy: (state.score / PERFECT_SCORE) * 100,
                studyTimeMinutes: durationSec / 60,
                avgResponseTimeSec: durationSec,
                completed: true,
            });

            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                
                if (state.finalAnswer.isCorrect) {
                     dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Excellent! You chose empathetic and constructive responses to cool the conflict.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                     return;
                }

                const userChoicesText = state.finalAnswer.userSelections.map(i => resolutionEndings[i].text);
                const prompt = `You are an expert AI tutor. A student chose conflict resolution responses and made mistakes. ### CONTEXT ### 1. **Student's Choices:** ${JSON.stringify(userChoicesText)} 2. **All Available Options:** ${JSON.stringify(resolutionEndings.map(o => ({text: o.text, isCorrect: o.isCorrect})))} 3. **All Available Note Sections:** ${JSON.stringify(notesCommunication6to8.map(n => ({topicId: n.topicId, title: n.title})))} ### YOUR TWO-STEP TASK ### 1. **Step 1: DETECT.** Analyze the student's choices. Did they pick aggressive, passive, or blame-focused responses? Identify the ONE note section that best addresses their error (e.g., 'Using "I" Statements' if they chose blaming language). 2. **Step 2: GENERATE.** Provide a short, encouraging insight (25-30 words) on their choices. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the section you identified", "insight": "Your personalized and encouraging feedback message here." }`;

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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good attempt! Focusing on empathy and collaboration is key in conflict.", recommendedSectionId: "de-escalation-techniques", recommendedSectionTitle: "De-escalation Techniques" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.insight, state.finalAnswer, state.score, startTime, updatePerformance]);
    
    const handleSwap = (i, j) => dispatch({ type: 'TOGGLE_SWAP', payload: { i, j } });
    const handleResolutionClick = (index) => dispatch({ type: 'TOGGLE_RESOLUTION', payload: index });

    const allSwapped = () => dialogues.every((line, i) =>
        line.text.every((item, j) => item.type !== "swap" || state.swaps[`${i}-${j}`])
    );
    
    const isDialogueStepComplete = allSwapped() && state.sliderValue > 80;
    const isResolutionStepComplete = state.selectedEndings.length === 2;

    const handleSubmit = () => {
        if (state.gameState === 'playing_dialogue' && isDialogueStepComplete) {
            dispatch({type: 'ADVANCE_TO_RESOLUTION'});
        } else if (state.gameState === 'playing_resolution' && isResolutionStepComplete) {
            dispatch({ type: 'SUBMIT_RESOLUTION' });
        }
    };
    
    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=6-8&section=${state.recommendedSectionId}`);
        }
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setStartTime(null);
        dispatch({ type: 'RESET_GAME' });
    };
    
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        completeCommunicationChallenge();
        navigate('/communications/games'); 
    };


    const renderGameContent = () => {
        if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
        
        if (state.gameState === "finished") {
            const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
            const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
        }

        if (state.gameState === "review") return <ReviewScreen userSelections={state.finalAnswer.userSelections} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
        
        return (
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col font-['Inter'] relative">
                <style>{scrollbarHideStyle}</style>
                
                {state.gameState === "instructions" && <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />}

                <GameNav />
                
                <main className={`flex-1 w-full flex flex-col items-center p-4 pb-28 no-scrollbar overflow-y-auto ${
                    state.gameState === 'playing_dialogue' ? 'justify-start pt-10' : 'justify-center '
                }`}>
                    {state.gameState === 'playing_dialogue' && (
                        <div className="w-full max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">Step 1: Change the Tone</h2>
                            <p className="text-center text-gray-300 mb-6">Click the harsh words to replace them with calmer options.</p>
                            <div className="space-y-4">
                                {dialogues.map((line, i) => (
                                    <div key={i} className="bg-gray-800/50 p-4 rounded-xl shadow-lg text-lg flex flex-wrap items-center">
                                        <strong className="mr-2 text-purple-300">{line.speaker}:</strong>
                                        {line.text.map((item, j) => {
                                            if (item.type === "swap") {
                                                const swapped = state.swaps[`${i}-${j}`] === "swapped";
                                                return (
                                                    <span
                                                        key={`${i}-${j}`}
                                                        onClick={() => handleSwap(i, j)}
                                                        className={`cursor-pointer px-2 py-1 rounded-md mx-1 font-semibold transition-all duration-300 transform hover:scale-105 ${
                                                        swapped ? "bg-green-500 text-white shadow-md" : "bg-red-500 text-white shadow-md"
                                                        }`}
                                                    >
                                                        {swapped ? item.replacement : item.word}
                                                    </span>
                                                );
                                            }
                                            return <span key={`${i}-${j}`} className="mx-1 text-white">{item.word}</span>;
                                        })}
                                    </div>
                                ))}
                            </div>
                            {allSwapped() && (
                                <div className="text-center mt-10 text-white">
                                    <h2 className="text-xl font-semibold mb-4">Now, slide to show the emotional shift:</h2>
                                    <div className="flex justify-center items-center gap-4">
                                        <span className="text-3xl">😡</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={state.sliderValue}
                                            className="w-64 accent-purple-500"
                                            onChange={(e) => dispatch({type: 'SET_SLIDER', payload: parseInt(e.target.value)})}
                                        />
                                        <span className="text-3xl">🙂</span>
                                    </div>
                                    <p className="mt-2 text-lg text-gray-400">Angry to Understanding</p>
                                </div>
                            )}
                        </div>
                    )}

                    {state.gameState === 'playing_resolution' && (
                        <div className="w-full max-w-2xl mx-auto text-center">
                            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Step 2: Find a Resolution</h2>
                            <p className="text-gray-300 mb-6">Choose two responses that help resolve the conflict.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {resolutionEndings.map((ending, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleResolutionClick(index)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-105 text-left
                                        ${state.selectedEndings.includes(index)
                                            ? "bg-green-800 border-green-500 text-white ring-2 ring-green-400"
                                            : "bg-gray-800 border-gray-600 text-gray-200 hover:border-purple-500"
                                        }`}
                                    >
                                        {ending.text}
                                       </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0 fixed bottom-0 left-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button 
                            className="relative w-full h-full cursor-pointer" 
                            onClick={handleSubmit} 
                            disabled={(state.gameState === 'playing_dialogue' && !isDialogueStepComplete) || (state.gameState === 'playing_resolution' && !isResolutionStepComplete)}
                        >
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] transition-opacity ${(state.gameState === 'playing_dialogue' && !isDialogueStepComplete) || (state.gameState === 'playing_resolution' && !isResolutionStepComplete) ? "opacity-50" : ""}`}>
                                {state.gameState === 'playing_dialogue' ? 'Next Step' : 'Submit'}
                            </span>
                        </button>
                    </div>
                </footer>
            </div>
        );
    };

    return <>{renderGameContent()}</>;
};

export default CoolTheConflict;