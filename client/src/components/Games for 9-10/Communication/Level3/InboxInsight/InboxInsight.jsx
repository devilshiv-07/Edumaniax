import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// Assuming these components are in the same folder or correctly pathed
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';

// Placeholder imports - ensure paths are correct for your project
import Checknow from '@/components/icon/GreenBudget/Checknow';
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

// --- GAME DATA & CONSTANTS ---
const EMAILS = [
    {
        id: 1,
        original: "Hey I won’t come. Tell ma’am.",
        context: "You’re going to be absent from class tomorrow. Ask a friend to inform the teacher and be polite."
    },
    {
        id: 2,
        original: "I need my ID proof signed urgently.",
        context: "You need your college ID proof signed by the coordinator urgently. Write a formal, polite request."
    },
    {
        id: 3,
        original: "Send me the homework file asap.",
        context: "You forgot to write down the homework. Request a classmate to share the file politely."
    }
];

const PERFECT_SCORE = EMAILS.length * 8;
const PASSING_THRESHOLD = 0.75; // 75% to win
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'inboxInsightGameState';

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

function LevelCompletePopup({ isOpen, onConfirm, onCancel, onClose, title, message, confirmText, cancelText, hideConfirmButton = false }) {
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
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="lilita-one-regular text-2xl md:text-3xl text-yellow-400 mb-3">
                    Yayy! You completed Level 3.
                </h2>
                <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
                    Would you like to go to other modules?
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
            <div className="flex-1 flex flex-col items-center justify-center text-center overflow-y-auto no-scrollbar">
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

function ReviewScreen({ responses, feedback, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
             <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-4xl space-y-4 overflow-y-auto p-2 no-scrollbar">
                {EMAILS.map((email, idx) => {
                    const score = feedback[`email${idx + 1}`] || "0/8";
                    const isPerfect = score === "8/8";
                    return (
                        <div key={idx} className={`p-4 rounded-xl flex flex-col ${isPerfect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-yellow-300">Scenario {idx + 1}</h3>
                                <span className={`font-bold text-lg ${isPerfect ? 'text-green-300' : 'text-red-300'}`}>Score: {score}</span>
                            </div>
                            <p className="text-gray-400 italic mb-3">Original: “{email.original}”</p>
                            <div className="bg-gray-800/50 p-3 rounded-lg text-gray-200 text-sm">
                                <p><strong className="text-cyan-400">Subject:</strong> {responses[idx].subject}</p>
                                <p><strong className="text-cyan-400">Greeting:</strong> {responses[idx].greeting}</p>
                                <p className="mt-2"><strong className="text-cyan-400">Body:</strong> {responses[idx].body}</p>
                                <p className="mt-2"><strong className="text-cyan-400">Closing:</strong> {responses[idx].closing}</p>
                            </div>
                        </div>
                    );
                })}
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
    currentEmailIndex: 0,
    responses: EMAILS.map(() => ({ subject: "", greeting: "", body: "", closing: "" })),
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
            return { ...initialState, gameState: "playing" };
        case "UPDATE_RESPONSE": {
            const { index, field, value } = action.payload;
            const updatedResponses = [...state.responses];
            updatedResponses[index][field] = value;
            return { ...state, responses: updatedResponses };
        }
        case "NEXT_EMAIL":
            return { ...state, currentEmailIndex: state.currentEmailIndex + 1 };
        case "FINISH_GAME_AND_SET_RESULTS": {
            return {
                ...state,
                gameState: "finished",
                feedback: action.payload.feedback,
                insight: action.payload.insight,
                recommendedSectionId: action.payload.recommendedSectionId,
                recommendedSectionTitle: action.payload.recommendedSectionTitle,
            };
        }
        case "REVIEW_GAME":
            return { ...state, gameState: "review" };
        case "BACK_TO_FINISH":
            return { ...state, gameState: "finished" };
        case "RESET_GAME":
            return { ...initialState, gameState: "playing" };
        default:
            return state;
    }
}

// --- MAIN GAME COMPONENT ---

export default function InboxInsightGame() {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false);

    // Effect to restore state from session storage
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

    const handleResponseChange = (field, value) => {
        dispatch({ type: "UPDATE_RESPONSE", payload: { index: state.currentEmailIndex, field, value } });
    };

    const handleSubmit = async () => {
        const isLastEmail = state.currentEmailIndex === EMAILS.length - 1;

        if (isLastEmail) {
            setIsAnalyzing(true);
            const promptText = state.responses.map((res, i) =>
                `Email ${i + 1} (Context: ${EMAILS[i].context}):\nSubject: ${res.subject}\nGreeting: ${res.greeting}\nBody: ${res.body}\nClosing: ${res.closing}`
            ).join("\n\n");

            const prompt = `You are an AI tutor. A student rewrote 3 informal messages into polite emails. Evaluate them and provide feedback.
### CONTEXT ###
1.  **Student's Rewritten Emails:**
    ${promptText}
2.  **Scoring Criteria (per email, max 8 points):**
    -   Formal/Polite Greeting: +2
    -   Clear & Relevant Subject: +2
    -   Complete & Contextual Body: +2
    -   Polite Tone & Proper Closing: +2
3. **Available Note Sections:** ${JSON.stringify(notesCommunication9to10.map(n => ({ topicId: n.topicId, title: n.title })), null, 2)}
### YOUR TASK ###
1.  **SCORE:** Evaluate each email against the criteria.
2.  **DETECT:** Identify the main area of weakness (e.g., "overly casual tone," "unclear subject lines") and find the ONE best-matching note section from the list.
3.  **GENERATE:** Provide a short, encouraging insight (25-30 words).
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "scores": { "email1": "X/8", "email2": "X/8", "email3": "X/8" },
  "detectedTopicId": "The 'topicId' of the best section",
  "insight": "Your personalized feedback message."
}`;

            try {
                const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                const aiReply = response.data.candidates[0].content.parts[0].text;
                const parsed = parsePossiblyStringifiedJSON(aiReply);

                if (parsed && parsed.scores && parsed.insight) {
                    const recommendedNote = notesCommunication9to10.find(note => note.topicId === parsed.detectedTopicId);
                    
                    // Performance Update Logic
                    const totalScore = Object.values(parsed.scores).reduce((acc, scoreStr) => acc + Number(scoreStr.split('/')[0]), 0);
                    const timeTakenSec = Math.floor((Date.now() - state.startTime) / 1000);
                    const accuracy = (totalScore / PERFECT_SCORE) * 100;
                    const isVictory = accuracy >= PASSING_THRESHOLD * 100;

                    updatePerformance({
                        moduleName: "Communication", topicName: "interpersonalSkills",
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
                        feedback: { email1: "0/8", email2: "0/8", email3: "0/8" },
                        insight: "Couldn't score the emails. Please try again later.",
                        recommendedSectionId: 'email-etiquette',
                        recommendedSectionTitle: "Email Etiquette"
                    }
                });
            } finally {
                setIsAnalyzing(false);
            }
        } else {
            dispatch({ type: "NEXT_EMAIL" });
        }
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=9-10&section=${state.recommendedSectionId}`);
        }
    };

    const handleContinueClick = () => {
        setPopupVisible(true);
    };

    const handleExitGame = () => {
        setPopupVisible(false);
        navigate('/courses'); 
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    // --- RENDER LOGIC ---

    if (state.gameState === "intro") {
        return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    }

    if (state.gameState === "finished") {
        const totalScore = Object.values(state.feedback).reduce((acc, scoreStr) => acc + Number(scoreStr.split('/')[0]), 0);
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
        return <ReviewScreen responses={state.responses} feedback={state.feedback} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    const currentEmail = EMAILS[state.currentEmailIndex];
    const currentResponse = state.responses[state.currentEmailIndex];
    const isLastEmail = state.currentEmailIndex === EMAILS.length - 1;
    const isSubmitDisabled = !currentResponse.subject.trim() || !currentResponse.greeting.trim() || !currentResponse.body.trim() || !currentResponse.closing.trim();

    return (<>
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative">
            <style>{scrollbarHideStyle}</style>
            {state.gameState === "instructions" && <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />}
            <GameNav />
            <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-3xl flex flex-col items-center gap-8">
                    {/* Email Form Box */}
                    <div className="w-full bg-gray-900/50 border-2 border-[#3F4B48] rounded-xl p-6 grid gap-4">
                        <p className="text-sm text-cyan-400 font-semibold">SCENARIO {state.currentEmailIndex + 1} OF {EMAILS.length}</p>
                        <p className="text-sm text-gray-200 -mt-2">📨 <span className="font-semibold">Original Message:</span> <span className="font-semibold text-red-600 text-base">“{currentEmail.original}”</span></p>
                        <p className="text-sm text-purple-700 -mt-2">🧠 <span className="font-medium">Context:</span> {currentEmail.context}</p>

                        <label className="text-sm font-semibold text-cyan-300">
                           ✉️ Subject Line
                            <input
                                placeholder="Enter a clear subject"
                                value={currentResponse.subject}
                                onChange={(e) => handleResponseChange("subject", e.target.value)}
                                className="mt-1 w-full p-2 rounded-lg border-2 border-gray-600 bg-gray-800 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </label>
                        <label className="text-sm font-semibold text-cyan-300">
                           👋 Greeting
                            <input
                                placeholder="Enter a polite greeting"
                                value={currentResponse.greeting}
                                onChange={(e) => handleResponseChange("greeting", e.target.value)}
                                className="mt-1 w-full p-2 rounded-lg border-2 border-gray-600 bg-gray-800 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </label>
                        <label className="text-sm font-semibold text-cyan-300">
                           📩 Message Body
                            <textarea
                                rows={4}
                                placeholder="Write your message here..."
                                value={currentResponse.body}
                                onChange={(e) => handleResponseChange("body", e.target.value)}
                                className="mt-1 w-full p-2 rounded-lg border-2 border-gray-600 bg-gray-800 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </label>
                        <label className="text-sm font-semibold text-cyan-300">
                           🙏 Polite Closing
                            <input
                                placeholder="Enter a kind closing"
                                value={currentResponse.closing}
                                onChange={(e) => handleResponseChange("closing", e.target.value)}
                                className="mt-1 w-full p-2 rounded-lg border-2 border-gray-600 bg-gray-800 text-white shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </label>
                    </div>
                </div>
            </main>
            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={isSubmitDisabled || isAnalyzing}>
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita-one-regular text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${(isSubmitDisabled || isAnalyzing) ? "opacity-50" : ""}`}>
                           {isAnalyzing ? 'Analyzing...' : (isLastEmail ? 'Finish' : 'Submit')}
                        </span>
                    </button>
                </div>
            </footer>
        </div>
        <LevelCompletePopup
                isOpen={isPopupVisible}
                onCancel={handleExitGame}
                onClose={handleClosePopup}
            />
        </>
    );
}