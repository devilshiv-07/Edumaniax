import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// --- RE-USED COMPONENTS FROM THE ORIGINAL STRUCTURE ---
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';

// Placeholder imports - ensure paths are correct
import Checknow from '@/components/icon/GreenBudget/Checknow';

// --- CHANGE: Import notes data for grades 11-12 ---
import { notesCommunication11to12 } from "@/data/notesCommunication11to12.js";

// --- GAME DATA & CONSTANTS FOR FEEDBACK LOOP ---
const SCENARIO = {
    title: "Feedback Loop Challenge",
    context: "You're part of a design team. Your teammate’s recent presentation lacked structure and clarity. They've asked you for your honest feedback. Your goal is to provide constructive criticism that helps them improve without discouraging them.",
};

const TONES = ["Constructive", "Harsh/Blunt", "Overly Soft", "Balanced"];
const PERFECT_SCORE = 3; // 1 point for Praise, 1 for Suggestion, 1 for Tone
const PASSING_THRESHOLD = 0.75; // 75% to win (at least 2/3 criteria met)
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'feedbackLoopGameState';

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

// --- SUB-COMPONENTS (SCREENS) ---

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

function ReviewScreen({ response, feedback, onBackToResults }) {
    const rawScore = [feedback.praise, feedback.suggestion, feedback.tone].filter(Boolean).length;
    const scoreText = `${rawScore}/${PERFECT_SCORE}`;
    const isPerfect = rawScore === PERFECT_SCORE;

    const criteria = [
        { label: "Included specific praise", passed: feedback.praise },
        { label: "Offered a clear suggestion", passed: feedback.suggestion },
        { label: "Maintained a constructive tone", passed: feedback.tone },
    ];

    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answer</h1>
            <div className="w-full max-w-4xl space-y-4 overflow-y-auto p-2 no-scrollbar">
                <div className={`p-4 rounded-xl flex flex-col ${isPerfect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-yellow-300">{SCENARIO.title}</h3>
                        <span className={`font-bold text-lg ${isPerfect ? 'text-green-300' : 'text-red-300'}`}>Score: {scoreText}</span>
                    </div>
                    
                    <div className="bg-gray-800/50 p-3 rounded-lg text-gray-200 text-sm space-y-2 mb-4">
                        <p><strong className="text-cyan-400">Your Message:</strong> {response.message}</p>
                        <p><strong className="text-cyan-400">Your Selected Tone:</strong> {response.selectedTone}</p>
                    </div>

                    <div className="bg-gray-900/60 p-3 rounded-lg">
                        <h4 className="font-bold text-cyan-300 mb-2">Feedback Breakdown:</h4>
                        <ul className="space-y-1 text-sm">
                            {criteria.map((item, index) => (
                                <li key={index} className="flex items-center">
                                    <span className={`mr-2 font-bold text-xl ${item.passed ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.passed ? '✓' : '✗'}
                                    </span>
                                    <span className={item.passed ? 'text-gray-300' : 'text-gray-400 line-through'}>
                                        {item.label}
                                    </span>
                                </li>
                            ))}
                        </ul>
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
    gameState: "intro", // "intro", "instructions", "playing", "finished", "review"
    response: { message: "", selectedTone: "" },
    feedback: null,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
    startTime: Date.now(),
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE":
            return action.payload;
        case "SHOW_INSTRUCTIONS":
            return { ...state, gameState: "instructions" };
        case "START_GAME":
            return { ...initialState, gameState: "playing", startTime: Date.now() };
        case "UPDATE_MESSAGE":
            return { ...state, response: { ...state.response, message: action.payload } };
        case "SELECT_TONE":
            return { ...state, response: { ...state.response, selectedTone: action.payload } };
        case "FINISH_GAME_AND_SET_RESULTS":
            return {
                ...state,
                gameState: "finished",
                feedback: action.payload.feedback,
                insight: action.payload.insight,
                recommendedSectionId: action.payload.recommendedSectionId,
                recommendedSectionTitle: action.payload.recommendedSectionTitle,
            };
        case "REVIEW_GAME":
            return { ...state, gameState: "review" };
        case "BACK_TO_FINISH":
            return { ...state, gameState: "finished" };
        case "RESET_GAME":
            return { ...initialState, gameState: "playing", startTime: Date.now() };
        default:
            return state;
    }
}

// --- MAIN GAME COMPONENT - FEEDBACK LOOP CHALLENGE ---

export default function FeedbackLoopGame() {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const [state, dispatch] = useReducer(gameReducer, initialState);
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
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
    }, []);

    const handleSubmit = async () => {
        setIsAnalyzing(true);

        const prompt = `You are a communication coach evaluating a student's feedback message.
### CONTEXT ###
1.  **Student's Message:** "${state.response.message}"
2.  **Student's Self-Identified Tone:** "${state.response.selectedTone}"
3.  **Evaluation Criteria:**
    -   **Praise:** Does the message contain at least one specific positive observation?
    -   **Suggestion:** Does the message offer at least one respectful, actionable improvement point?
    -   **Tone:** Is the overall tone constructive and balanced (not overly harsh or too soft)?
4.  **Available Note Sections:** ${JSON.stringify(notesCommunication11to12.map(n => ({ topicId: n.topicId, title: n.title, content: n.content.substring(0, 150) + '...' })), null, 2)}
### YOUR TASK ###
1.  **SCORE:** Evaluate the message against the 3 criteria.
2.  **DETECT:** Identify the main weakness (e.g., "lacked praise," "suggestion was unclear", "tone was too blunt"). Find the ONE best-matching note section from the list to help them. If perfect, default to 'constructive-criticism'.
3.  **GENERATE:** Provide a short, encouraging insight (25-30 words).
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "scores": { "praise": true/false, "suggestion": true/false, "tone": true/false },
  "detectedTopicId": "The 'topicId' of the best section",
  "insight": "Your personalized feedback message."
}`;

        try {
            const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
            const aiReply = response.data.candidates[0].content.parts[0].text;
            const parsed = parsePossiblyStringifiedJSON(aiReply);

            if (parsed && parsed.scores && parsed.insight) {
                const recommendedNote = notesCommunication11to12.find(note => note.topicId === parsed.detectedTopicId);
                
                const totalScore = [parsed.scores.praise, parsed.scores.suggestion, parsed.scores.tone].filter(Boolean).length;
                const timeTakenSec = Math.floor((Date.now() - state.startTime) / 1000);
                const accuracy = (totalScore / PERFECT_SCORE) * 100;
                const isVictory = accuracy >= PASSING_THRESHOLD * 100;

                updatePerformance({
                    moduleName: "Communication", topicName: "emotionalIntelligence",
                    score: Math.round((totalScore / PERFECT_SCORE) * 10),
                    accuracy: accuracy, avgResponseTimeSec: timeTakenSec,
                    studyTimeMinutes: Math.ceil(timeTakenSec / 60),
                    completed: isVictory,
                });
                
                if (isVictory) {
                    completeCommunicationChallenge(2, 2);
                }

                dispatch({
                    type: "FINISH_GAME_AND_SET_RESULTS",
                    payload: {
                        feedback: parsed.scores,
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
                    feedback: { praise: false, suggestion: false, tone: false },
                    insight: "Couldn't score the message. Please try again later.",
                    recommendedSectionId: 'constructive-criticism',
                    recommendedSectionTitle: "Giving Constructive Criticism"
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
                feedback: { praise: false, suggestion: false, tone: false },
                insight: "Time ran out! Clear communication often requires quick, thoughtful responses. Let's try again.",
                recommendedSectionId: 'effective-communication',
                recommendedSectionTitle: "Effective Communication"
            }
        });
    };

    const handleContinueClick = () => setPopupVisible(true);
    const handleExitGame = () => navigate('/courses');
    const handleClosePopup = () => setPopupVisible(false);

    // --- RENDER LOGIC ---

    if (state.gameState === "intro") {
        return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    }

    if (state.gameState === "instructions") {
        return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
    }

    if (state.gameState === "finished") {
        const totalScore = Object.values(state.feedback).filter(Boolean).length;
        const accuracyScore = Math.round((totalScore / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;

        return (
            <>
                {isVictory
                    ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinueClick} />
                    : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />
                }
                <LevelCompletePopup
                    isOpen={isPopupVisible}
                    onCancel={handleExitGame}
                    onClose={handleClosePopup}
                />
            </>
        );
    }
    
    if (state.gameState === "review") {
        return <ReviewScreen response={state.response} feedback={state.feedback} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    const { response } = state;
    const isSubmitDisabled = response.message.trim().length < 20 || !response.selectedTone;

    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            
            <GameNav key={gameKey} onTimeUp={handleTimeUp} durationInSeconds={8 * 60}/>
            
            <main className="flex-1 w-full flex flex-col items-center justify-center p-4 z-10">
                <div className="w-full max-w-4xl bg-black/30 backdrop-blur-sm border-2 border-yellow-500/30 rounded-2xl shadow-2xl shadow-yellow-500/10 transition-all duration-300">
                    <div className="w-full bg-gradient-to-br from-[#1a2a32] to-[#111827] rounded-2xl p-6 md:p-8">
                        
                        {/* Scenario Details Section */}
                        <div className="mb-6 text-white">
                            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                                <h2 className="text-base font-bold text-cyan-400 mb-2 flex items-center gap-2">
                                    <span className="text-xl">🧠</span> Context
                                </h2>
                                <p className="text-gray-300 text-sm">{SCENARIO.context}</p>
                            </div>
                        </div>

                        {/* Input Section */}
                        <div className="space-y-6">
                            {/* Textarea for message */}
                             <div>
                                <label className="block text-lg font-semibold text-cyan-300 mb-2 flex items-center gap-2">
                                    <span className="text-xl">✍️</span> Compose Your Feedback
                                </label>
                                <textarea
                                    rows={5}
                                    placeholder="E.g., Your visuals were great! To make it stronger, maybe structure the key points more clearly..."
                                    value={response.message}
                                    onChange={(e) => dispatch({ type: 'UPDATE_MESSAGE', payload: e.target.value })}
                                    className="w-full p-3 rounded-lg border-2 border-gray-600 bg-[#131F24] text-white text-base shadow-inner transition-all focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-2">Min 20 characters. Remember to include praise and a suggestion.</p>
                            </div>
                            
                            {/* Tone selection */}
                            <div>
                                <p className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                                    <span className="text-xl">🎭</span> Select The Tone You Used
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {TONES.map(tone => (
                                        <button
                                            key={tone}
                                            onClick={() => dispatch({ type: 'SELECT_TONE', payload: tone })}
                                            className={`px-5 py-2 text-sm rounded-full font-bold transition-all duration-200 border-b-4 active:border-b-0 active:translate-y-1 transform ${response.selectedTone === tone
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
                    </div>
                </div>
            </main>
            
            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0 z-10">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={isSubmitDisabled || isAnalyzing}>
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita-one-regular text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${(isSubmitDisabled || isAnalyzing) ? "opacity-50" : ""}`}>
                            {isAnalyzing ? 'Analyzing...' : 'Finish'}
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}