import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// --- RE-USED COMPONENTS ---
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';

// --- Import notes for grades 11-12 ---
import { notesCommunication11to12 } from "@/data/notesCommunication11to12.js";


// --- GAME DATA & CONSTANTS ---
const SCENARIO = {
    title: "Conflict Resolution: The Project Dispute",
    context: "You and a classmate are in conflict over project credit. You feel they haven't contributed enough, but they think you’re being controlling.",
    task: "First, build two sentences. Then, select the tones and write a final 3-4 line message to resolve the conflict thoughtfully.",
};

const SENTENCE_STARTERS = [
    { text: "I feel like…", isCorrect: true },
    { text: "You always…", isCorrect: false },
    { text: "Let’s find a way…", isCorrect: true },
    { text: "I can’t believe…", isCorrect: false }
];
const SENTENCE_ENDINGS = [
    { text: "…this project means a lot to both of us.", isCorrect: true },
    { text: "…you’ve barely done anything.", isCorrect: false },
    { text: "…we can talk this through calmly.", isCorrect: true }
];
const TONES = ["Calm", "Assertive", "Sarcastic", "Passive-aggressive"];
const CORRECT_TONES = ["Calm", "Assertive"];
const EXAMPLE_CORRECT_SENTENCES = [
    "I feel like… we can talk this through calmly.",
    "Let’s find a way… this project means a lot to both of us."
];

const PERFECT_SCORE = 8;
const PASSING_THRESHOLD = 0.75;
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'resolveItRightGameState';


// --- HELPER FUNCTIONS & STYLES ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

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

function isPairCorrect(pair) {
    if (!pair || !pair.starter || !pair.ending) return false;
    return pair.starter.isCorrect && pair.ending.isCorrect;
}


// --- RE-USED POPUP AND END SCREEN COMPONENTS ---

function LevelCompletePopup({ onCancel, onClose, isOpen }) {
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
                    Awesome! Challenge Complete.
                </h2>
                <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
                    Would you like to explore other modules?
                </p>
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-8 py-3 bg-red-600 text-lg text-white lilita-one-regular rounded-md hover:bg-red-700 transition-colors border-b-4 border-red-800 active:border-transparent shadow-lg"
                    >
                        Exit Game
                    </button>
                </div>
            </div>
        </div>
    );
}

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto no-scrollbar p-4">
                <div className="relative w-48 h-48 md:w-52 md:h-52 shrink-0">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold">Challenge Complete!</h2>
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
                            <span className="text-[#FFCC00] inter-font text-xs font-normal">{insight}</span>
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
                {recommendedSectionTitle && (
                    <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                        <button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg">
                            Review "{recommendedSectionTitle}" Notes
                        </button>
                    </div>
                )}
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex flex-wrap justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

// --- REVAMPED REVIEW SCREEN ---
function ReviewScreen({ response, feedback, insight, onBackToResults }) {
    const score = feedback.task1 || "0/8";
    const isPerfect = score === "8/8";

    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <div className="w-full max-w-4xl flex justify-between items-center mb-6 shrink-0">
                <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular text-yellow-400">Review Your Answer</h1>
                <span className={`font-bold text-2xl px-4 py-1 rounded-lg ${isPerfect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>Score: {score}</span>
            </div>
            
            <div className="w-full max-w-4xl space-y-4 overflow-y-auto p-2 no-scrollbar">
                {/* Sentences Review */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-cyan-400 mb-3">Sentences</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-white mb-1">Your Sentences:</h3>
                            <ul className="list-disc list-inside pl-2 space-y-1 text-gray-300">
                                {response.pairs.map((p, i) => (
                                    <li key={i} className={isPairCorrect(p) ? 'text-green-400' : 'text-red-400'}>
                                        {`${p.starter.text} ${p.ending.text}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">Example Correct Sentences:</h3>
                            <ul className="list-disc list-inside pl-2 space-y-1 text-green-400">
                                {EXAMPLE_CORRECT_SENTENCES.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Tones Review */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-purple-400 mb-3">Tones</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <h3 className="font-semibold text-white mb-1">Your Tones:</h3>
                            <p className="text-gray-300">{response.selectedTones.join(', ') || 'None selected'}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">Correct Tones:</h3>
                            <p className="text-green-400">{CORRECT_TONES.join(', ')}</p>
                        </div>
                    </div>
                </div>

                {/* Final Message Review */}
                 <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <h2 className="text-xl font-bold text-yellow-400 mb-3">Final Message</h2>
                     <div>
                        <h3 className="font-semibold text-white mb-1">Your Message:</h3>
                        <p className="text-gray-300 italic p-2 bg-black/20 rounded">"{response.finalMessage || 'No message written.'}"</p>
                    </div>
                     <div className="mt-3">
                        <h3 className="font-semibold text-white mb-1">AI Feedback:</h3>
                        <p className="text-yellow-300 p-2">{insight}</p>
                    </div>
                </div>
            </div>

            <button onClick={onBackToResults} className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

// --- STATE MANAGEMENT (useReducer) ---
const initialState = {
    gameState: "intro", gameStep: 1,
    response: { pairs: [], selectedTones: [], finalMessage: "" },
    feedback: null, insight: "", recommendedSectionId: null, recommendedSectionTitle: "",
    startTime: Date.now(),
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing", startTime: Date.now() };
        case "ADD_PAIR": {
            if (state.response.pairs.length >= 2) return state;
            const newPairs = [...state.response.pairs, action.payload];
            return { ...state, response: { ...state.response, pairs: newPairs } };
        }
        case "ADVANCE_STEP": return { ...state, gameStep: 2 };
        case "UPDATE_FINAL_MESSAGE": return { ...state, response: { ...state.response, finalMessage: action.payload } };
        case "TOGGLE_TONE": {
            const newTones = state.response.selectedTones.includes(action.payload)
                ? state.response.selectedTones.filter(t => t !== action.payload)
                : [...state.response.selectedTones, action.payload];
            return { ...state, response: { ...state.response, selectedTones: newTones } };
        }
        case "FINISH_GAME_AND_SET_RESULTS": return { ...state, gameState: "finished", ...action.payload };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing", startTime: Date.now() };
        default: return state;
    }
}

// --- MAIN GAME COMPONENT ---
export default function ResolveItRightChallenge() {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const [selectedStarter, setSelectedStarter] = useState(null);
    const [selectedEnding, setSelectedEnding] = useState(null);
    const [pairFeedback, setPairFeedback] = useState("");

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [gameKey, setGameKey] = useState(Date.now());


    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                dispatch({ type: 'RESTORE_STATE', payload: savedState });
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) {
                console.error("Failed to parse saved game state:", error);
            }
        }
    }, []);
    
    const handleAddPair = () => {
        if (!selectedStarter || !selectedEnding) return;
        if (state.response.pairs.length >= 2) return;

        const newPair = { starter: selectedStarter, ending: selectedEnding };
        dispatch({ type: "ADD_PAIR", payload: newPair });
        
        const feedbackNum = state.response.pairs.length + 1;
        setPairFeedback(`Sentence ${feedbackNum} added.`);

        setSelectedStarter(null);
        setSelectedEnding(null);

        setTimeout(() => setPairFeedback(""), 2000);
    };

    const handleSubmit = async () => {
        setIsAnalyzing(true);
        let scoreFromParts = 0;
        
        // Score sentences: 1 point per correct pair
        state.response.pairs.forEach(pair => {
            if (isPairCorrect(pair)) {
                scoreFromParts += 1;
            }
        });
        
        // Score tones
        const correctTonesCount = state.response.selectedTones.filter(t => CORRECT_TONES.includes(t)).length;
        const incorrectTonesCount = state.response.selectedTones.filter(t => !CORRECT_TONES.includes(t)).length;
        if (correctTonesCount === 2 && incorrectTonesCount === 0) {
            scoreFromParts += 2;
        } else if (correctTonesCount === 1 && incorrectTonesCount === 0) {
            scoreFromParts += 1;
        }

        const prompt = `You are an AI tutor evaluating a student's conflict resolution message.
### CONTEXT ###
1.  **Student's Final Message:** "${state.response.finalMessage}"
2.  **Scoring Criteria for Message (Max 4 points):**
    -   Uses "I" statements and avoids blaming language: +1 point
    -   Acknowledges feelings or a shared goal: +1 point
    -   Suggests a constructive path forward: +1 point
    -   Maintains an overall positive, empathetic, and assertive tone: +1 point
3.  **Available Note Sections:** ${JSON.stringify(notesCommunication11to12.map(n => ({ topicId: n.topicId, title: n.title, content: n.content.substring(0, 150) + '...' })), null, 2)}
### YOUR TASK ###
1.  **SCORE:** Evaluate ONLY the final message based on the criteria and return a score from 0 to 4.
2.  **DETECT:** Identify the main area of weakness and find the ONE best-matching note section. If perfect, default to 'assertive-communication'.
3.  **GENERATE:** Provide a short, encouraging insight (25-30 words).
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "messageScore": X,
  "detectedTopicId": "The 'topicId' of the best section",
  "insight": "Your personalized feedback message."
}`;

        try {
            const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
            const aiReply = response.data.candidates[0].content.parts[0].text;
            const parsed = parsePossiblyStringifiedJSON(aiReply);

            if (parsed && typeof parsed.messageScore === 'number' && parsed.insight) {
                const totalScore = scoreFromParts + parsed.messageScore;
                const finalFeedback = { task1: `${totalScore}/${PERFECT_SCORE}` };
                
                const recommendedNote = notesCommunication11to12.find(note => note.topicId === parsed.detectedTopicId);
                const timeTakenSec = Math.floor((Date.now() - state.startTime) / 1000);
                const accuracy = (totalScore / PERFECT_SCORE) * 100;
                const isVictory = accuracy >= PASSING_THRESHOLD * 100;

                updatePerformance({
                    moduleName: "Communication", topicName: "interpersonalSkills",
                    score: Math.round((totalScore / PERFECT_SCORE) * 10),
                    accuracy: Math.round(accuracy), avgResponseTimeSec: timeTakenSec,
                    studyTimeMinutes: Math.ceil(timeTakenSec / 60),
                    completed: isVictory,
                });
                
                if (isVictory) {
                    completeCommunicationChallenge(1, 2);
                }

                dispatch({
                    type: "FINISH_GAME_AND_SET_RESULTS",
                    payload: {
                        feedback: finalFeedback,
                        insight: parsed.insight,
                        recommendedSectionId: parsed.detectedTopicId,
                        recommendedSectionTitle: recommendedNote ? recommendedNote.title : ""
                    }
                });
            } else { throw new Error("Failed to parse response from AI."); }
        } catch (err) {
            console.error("Error fetching AI insight:", err);
            dispatch({
                type: "FINISH_GAME_AND_SET_RESULTS",
                payload: {
                    feedback: { task1: `${scoreFromParts}/${PERFECT_SCORE}` },
                    insight: "Couldn't evaluate the final message. Please try again.",
                    recommendedSectionId: 'assertive-communication',
                    recommendedSectionTitle: "Assertive Communication"
                }
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
        setGameKey(Date.now());
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=11-12&section=${state.recommendedSectionId}`);
        }
    };
    
    const handleTimeUp = () => {
        dispatch({
            type: "FINISH_GAME_AND_SET_RESULTS",
            payload: {
                feedback: { task1: "0/8" },
                insight: "Time ran out! Clear communication under pressure is key. Let's try that again.",
                recommendedSectionId: 'active-listening',
                recommendedSectionTitle: "Active Listening"
            }
        });
    };

    const handleContinueClick = () => setPopupVisible(true);
    const handleExitGame = () => navigate('/courses');
    const handleClosePopup = () => setPopupVisible(false);
    
    const handleFooterButtonClick = () => {
        if (state.gameStep === 1) {
            dispatch({ type: 'ADVANCE_STEP' });
        } else {
            handleSubmit();
        }
    };

    if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    if (state.gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;

    if (state.gameState === "finished") {
        const totalScore = Number((state.feedback.task1 || "0/8").split('/')[0]);
        const accuracyScore = Math.round((totalScore / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;

        return (
            <>
                {isVictory
                    ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinueClick} />
                    : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />
                }
                <LevelCompletePopup isOpen={isPopupVisible} onCancel={handleExitGame} onClose={handleClosePopup} />
            </>
        );
    }
    
    if (state.gameState === "review") {
        return <ReviewScreen response={state.response} feedback={state.feedback} insight={state.insight} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    const { response, gameStep } = state;

    let isSubmitDisabled;
    if (gameStep === 1) {
        isSubmitDisabled = response.pairs.length !== 2;
    } else {
        isSubmitDisabled = !response.finalMessage.trim() || response.selectedTones.length < 2 || isAnalyzing;
    }

    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <GameNav key={gameKey} onTimeUp={handleTimeUp} durationInSeconds={8 * 60}/>
            <main className="flex-1 w-full flex flex-col items-center justify-center p-4 z-10">
                <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl shadow-2xl shadow-yellow-500/10">
                    <div className="w-full bg-gradient-to-br from-[#1a2a32] to-[#111827] rounded-2xl p-6 md:p-8">
                        <div className="grid md:grid-cols-2 gap-4 mb-4 text-white">
                            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                <h2 className="text-base font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                    <span className="text-xl">🧠</span> Context
                                </h2>
                                <p className="text-gray-300 text-sm">{SCENARIO.context}</p>
                            </div>
                            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                <h2 className="text-base font-bold text-purple-400 mb-2 flex items-center gap-2">
                                    <span className="text-xl">🎯</span> Your Task
                                </h2>
                                <p className="text-gray-300 text-sm">{SCENARIO.task}</p>
                            </div>
                        </div>

                        {gameStep === 1 && (
                            <div className="space-y-3">
                               <p className="text-lg font-semibold text-cyan-300 text-center">
                                   Step 1: Build 2 Sentences ({response.pairs.length}/2)
                               </p>
                               <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                       <h3 className="font-bold text-white mb-2 text-center">Sentence Starters</h3>
                                       <div className="space-y-2">
                                        {SENTENCE_STARTERS.map((s) => (
                                            <button key={s.text} onClick={() => setSelectedStarter(s)} className={`w-full p-2 text-sm rounded-lg transition-all border-2 ${selectedStarter === s ? 'bg-cyan-500 border-cyan-300 text-black font-bold' : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'}`}>
                                                {s.text}
                                            </button>
                                        ))}
                                       </div>
                                    </div>
                                     <div>
                                       <h3 className="font-bold text-white mb-2 text-center">Sentence Endings</h3>
                                       <div className="space-y-2">
                                        {SENTENCE_ENDINGS.map((e) => (
                                            <button key={e.text} onClick={() => setSelectedEnding(e)} className={`w-full p-2 text-sm rounded-lg transition-all border-2 ${selectedEnding === e ? 'bg-cyan-500 border-cyan-300 text-black font-bold' : 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600'}`}>
                                                {e.text}
                                            </button>
                                        ))}
                                       </div>
                                    </div>
                               </div>
                               <div className="flex justify-center">
                                    <button 
                                        onClick={handleAddPair} 
                                        disabled={!selectedStarter || !selectedEnding || response.pairs.length >= 2} 
                                        className="px-6 py-2 bg-yellow-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors border-b-4 border-yellow-800 active:bg-yellow-700 active:border-yellow-900"
                                    >
                                       Add Sentence
                                    </button>
                               </div>
                            </div>
                        )}

                        {gameStep === 2 && (
                             <div className="space-y-6">
                                <div>
                                    <label className="block text-lg font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                                        <span className="text-xl">📩</span> Step 2: Compose Your Final Message
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Type your final 3-4 line message here..."
                                        value={response.finalMessage}
                                        onChange={(e) => dispatch({ type: 'UPDATE_FINAL_MESSAGE', payload: e.target.value })}
                                        className="w-full p-3 rounded-lg border-2 border-gray-600 bg-[#131F24] text-white text-base shadow-inner transition-all"
                                    />
                                </div>
                                <div>
                                     <p className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                                         <span className="text-xl">🎭</span> Select Tones (min. 2)
                                     </p>
                                     <div className="flex flex-wrap gap-3">
                                          {TONES.map(tone => (
                                              <button
                                                  key={tone}
                                                  onClick={() => dispatch({ type: 'TOGGLE_TONE', payload: tone })}
                                                  className={`px-5 py-2 text-sm rounded-full font-bold transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1 transform ${response.selectedTones.includes(tone)
                                                      ? 'bg-yellow-500 border-yellow-700 text-black scale-105 shadow-lg shadow-yellow-500/20'
                                                      : 'bg-gray-700 hover:bg-gray-600 border-gray-900 text-white'
                                                  }`}
                                              >
                                                  {tone}
                                              </button>
                                          ))}
                                     </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            
            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0 z-10">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button className="relative w-full h-full cursor-pointer" onClick={handleFooterButtonClick} disabled={isSubmitDisabled}>
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita-one-regular text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${isSubmitDisabled ? "opacity-50" : ""}`}>
                           {gameStep === 1 ? 'Next' : (isAnalyzing ? 'Analyzing...' : 'Finish')}
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}