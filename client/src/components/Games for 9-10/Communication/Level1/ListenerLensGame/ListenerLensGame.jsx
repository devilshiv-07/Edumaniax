import React, { useState, useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { motion } from 'framer-motion';

// --- Contexts ---
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// --- Shared Components ---
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';

// --- Notes Data (for AI recommendations) ---
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

// --- Helper for hiding scrollbar ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Game Data ---
const sampleReplies = [
  "That must be frustrating. I hear you.",
  "Want to talk more about it?",
  "Maybe you’re just bad at exams.",
];

// --- Constants ---
const PERFECT_SCORE = 10;
const PASSING_THRESHOLD = 0.7;
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'listenerLensGameState';

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

// --- Re-styled Option Component ---
const Option = ({ text, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`w-full text-center px-5 py-3 rounded-lg border bg-[#131f24] border-[#37464f] shadow-[0_2px_0_0_#37464f] cursor-pointer transition-all duration-200 transform hover:scale-101 ${isSelected ? 'border-[#6DFF00] ring-1 ring-[#6DFF00]' : 'hover:border-gray-500'}`}
    >
        <span className="text-[#f1f7fb] font-semibold text-md">
            {text}
        </span>
    </div>
);


// --- End Game Screens ---
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
function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
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
                        <button
                            onClick={onNavigateToSection}
                            className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg"
                        >
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
function ReviewScreen({ answers, onBackToResults }) {
    const answer = answers[0];
    if (!answer) return null;

    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answer</h1>
            <div className="w-full max-w-2xl p-2 no-scrollbar">
                <div className={`p-6 rounded-xl ${answer.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-4`}>
                    <h3 className="text-lg font-bold text-yellow-300">Scenario</h3>
                    <p className="text-gray-200">A friend tells you they are upset because they failed an important exam.</p>
                    <div>
                        <p className="font-semibold text-gray-300">Your Reply:</p>
                        <p className={`text-lg italic ${answer.isCorrect ? 'text-green-300' : 'text-red-300'}`}>"{answer.userAnswer}"</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-300">Feedback:</p>
                        <p className="text-lg">{answer.feedback}</p>
                    </div>
                </div>
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
  gameState: "intro",
  userResponse: '',
  feedback: '',
  selectedIndex: null,
  score: 0,
  answers: [],
  insight: "",
  recommendedSectionId: null,
  recommendedSectionTitle: "",
  startTime: Date.now(),
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "video", startTime: Date.now() };
        case "SHOW_REPLY_SCREEN": return { ...state, gameState: "reply" };
        case "SELECT_REPLY": return { ...state, userResponse: action.payload.reply, selectedIndex: action.payload.index };
        case "TYPE_REPLY": return { ...state, userResponse: action.payload, selectedIndex: null };
        case "SUBMIT_ANSWER": {
            const { feedback, passed, score } = action.payload;
            return {
                ...state,
                gameState: "finished",
                feedback,
                score,
                answers: [{
                    userAnswer: state.userResponse,
                    isCorrect: passed,
                    feedback: feedback
                }]
            };
        }
        case "SET_AI_INSIGHT": return { ...state, ...action.payload };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "video", startTime: Date.now() };
        default: return state;
    }
}

// --- Main Game Component ---
const ListenerLensGame = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [isChecking, setIsChecking] = useState(false); // For AI loading state
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const videoRef = useRef(null);

    // Effects for session storage and background music...
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                dispatch({ type: 'RESTORE_STATE', payload: savedState });
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) { console.error("Failed to parse saved game state:", error); sessionStorage.removeItem(SESSION_STORAGE_KEY); }
        }
    }, []);
    useEffect(() => {
        if (state.gameState === 'finished' || state.gameState === 'review') {
            window.dispatchEvent(new CustomEvent('pause-background-audio'));
        }
    }, [state.gameState]);
    
    // Effect for generating AI insight on the results screen
    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const answer = state.answers[0];
                if (!answer || answer.isCorrect) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Great job! Your empathetic response shows strong listening skills!", recommendedSectionId: null, recommendedSectionTitle: "" } }); return;
                }
                const prompt = `You are an expert AI tutor. A student was asked to provide an empathetic response to a friend who failed an exam. The student wrote: "${answer.userAnswer}". This was flagged as not being empathetic. Your task is to provide targeted feedback. ### CONTEXT ### 1. **Student's Incorrect Answer:** "${answer.userAnswer}" 2. **All Available Note Sections for this Module:** ${JSON.stringify(notesCommunication9to10.map(n => ({topicId: n.topicId, title: n.title})), null, 2)} ### YOUR TWO-STEP TASK ### 1. **Step 1: DETECT.** Analyze the student's mistake. Identify the ONE note section that is the best match for their error (e.g., active listening, validation). 2. **Step 2: GENERATE.** Provide a short, encouraging, and educational insight (about 25-30 words) on why empathy is important in this context. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the section you identified", "insight": "Your personalized and encouraging feedback message here." }`;
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" } });
                    } else { throw new Error("Failed to parse response from AI."); }
                } catch (err) { console.error("Error fetching AI insight:", err); dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes on empathy.", recommendedSectionId: null, recommendedSectionTitle: "" } }); }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    // --- Core Game Handlers ---
    const handleStartGame = () => {
        window.dispatchEvent(new CustomEvent('play-background-audio'));
        dispatch({ type: "START_GAME" });
    };

    const handleSampleClick = (reply, index) => {
        dispatch({ type: 'SELECT_REPLY', payload: { reply, index } });
    };

    const handleInputChange = (e) => {
        dispatch({ type: 'TYPE_REPLY', payload: e.target.value });
    };
    
    const handleSubmitReply = async () => {
        if (!state.userResponse || isChecking) return;
        setIsChecking(true);

        const prompt = `You are a sentiment analysis AI for an educational game about empathy. A friend has just said they failed an important exam. Analyze the user's reply to them. The reply is: "${state.userResponse}". Is this reply empathetic, supportive, or helpful? Respond with ONLY a single word: "pass" or "fail". "pass" means the reply is empathetic, supportive, helpful, or at least not negative. "fail" means the reply is insensitive, dismissive, blaming, or completely irrelevant.`;

        try {
            const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
            const aiResult = response.data.candidates[0].content.parts[0].text.trim().toLowerCase();
            
            const passed = aiResult.includes("pass");
            const feedback = passed 
                ? "💖 Tone: Great job showing empathy and validation!" 
                : "😟 Tone: Needs improvement – try showing more empathy.";
            const score = passed ? PERFECT_SCORE : 0;

            if (passed) {
                completeCommunicationChallenge(0, 1);
                const timeTakenSec = Math.floor((Date.now() - state.startTime) / 1000);
                updatePerformance({
                    moduleName: "Communication", topicName: "communicationSkills", score: score,
                    accuracy: 100, avgResponseTimeSec: timeTakenSec,
                    studyTimeMinutes: Math.ceil(timeTakenSec / 60), completed: true,
                });
            }
            dispatch({ type: "SUBMIT_ANSWER", payload: { feedback, passed, score } });

        } catch (error) {
            console.error("Error calling AI for sentiment analysis:", error);
            // Fallback for API error
            alert("There was an error checking your answer. Please try again.");
        } finally {
            setIsChecking(false);
        }
    };

    // --- Navigation and Reset Handlers ---
    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=6-8&section=${state.recommendedSectionId}`);
        }
    };
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        window.dispatchEvent(new CustomEvent('play-background-audio'));
        dispatch({ type: 'RESET_GAME' });
    };
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        alert("Navigating to the next challenge!");
    };
    
    // --- Video and Music Handlers ---
    const handleVideoPlay = () => {
        window.dispatchEvent(new CustomEvent('pause-background-audio'));
    };
    const handleVideoPauseOrEnd = () => {
        window.dispatchEvent(new CustomEvent('play-background-audio'));
    };

    // --- Main Render Logic ---
    const renderGameContent = () => {
        switch(state.gameState) {
            case "intro":
                return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
            case "finished":
                const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
                const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
                return isVictory
                    ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                    : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
            case "review":
                return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
            
            default:
                const isSubmitEnabled = !!state.userResponse && !isChecking;
                const isReplyScreen = state.gameState === 'reply';
                return (
                    <div className="w-full min-h-screen bg-[#0A160E] flex flex-col font-['Inter'] relative">
                        <style>{scrollbarHideStyle}</style>
                        {state.gameState === "instructions" && <InstructionsScreen onStartGame={handleStartGame} />}
                        <GameNav />
                        <main className="flex-1 w-full flex flex-col items-center justify-center px-4 overflow-y-auto no-scrollbar">
                           <motion.div 
                                key={state.gameState} initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                                className="w-full max-w-3xl"
                            >
                                {isReplyScreen ? (
                                    <div className="bg-[rgba(32,47,54,0.3)] rounded-xl p-4 md:p-6 space-y-5">
                                        <p className="text-[#f1f7fb] font-bold text-lg text-center mb-3">🌟 Pick or Write a Kind Reply!</p>
                                        <div className="flex flex-col gap-3">
                                            {sampleReplies.map((reply, index) => (
                                                <Option key={index} text={`💌 ${reply}`} isSelected={state.selectedIndex === index} onClick={() => handleSampleClick(reply, index)} />
                                            ))}
                                        </div>
                                        <div>
                                          <p className="text-[#f1f7fb] font-medium text-center my-4">OR</p>
                                          <textarea
                                              rows="4" value={state.userResponse}
                                              onChange={handleInputChange} disabled={isChecking}
                                              placeholder="🖊️ Type your own sweet reply..."
                                              className="w-full p-4 rounded-xl border-2 border-[#37464f] bg-[#131f24] text-[#f1f7fb] focus:outline-none focus:ring-2 focus:ring-[#6DFF00] placeholder-gray-400 transition-all"
                                          />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-[rgba(32,47,54,0.3)] rounded-xl p-4 md:p-6">
                                        <video ref={videoRef} className="rounded-xl shadow-lg w-full mb-4" controls src="./ai_video.mp4"
                                            onPlay={handleVideoPlay} onPause={handleVideoPauseOrEnd} onEnded={handleVideoPauseOrEnd}
                                        />
                                        <p className="text-center text-lg font-semibold text-yellow-300">A friend is upset about failing an important exam.</p>
                                        <p className="text-center text-lg font-semibold text-[#f1f7fb] mt-2">🎧 What would you say in response?</p>
                                    </div>
                                )}
                            </motion.div>
                        </main>
                        <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                            <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                                <button
                                    className="relative w-full h-full cursor-pointer"
                                    onClick={isReplyScreen ? handleSubmitReply : () => dispatch({ type: 'SHOW_REPLY_SCREEN' })}
                                    disabled={isReplyScreen && !isSubmitEnabled}
                                >
                                    <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                                    <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] transition-opacity ${isSubmitEnabled || !isReplyScreen ? "opacity-100" : "opacity-50"}`}>
                                        {isChecking ? "Checking..." : (isReplyScreen ? "Submit" : "Continue")}
                                    </span>
                                </button>
                            </div>
                        </footer>
                    </div>
                );
        }
    };
    
    return <>{renderGameContent()}</>;
};

export default ListenerLensGame;