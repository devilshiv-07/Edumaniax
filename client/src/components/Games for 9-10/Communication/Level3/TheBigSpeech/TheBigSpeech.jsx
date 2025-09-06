import React, { useEffect, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Meyda from "meyda";
import axios from "axios";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

// Contexts
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// Imported Components (as requested)
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';
import SpeakingAnimation from "@/components/SpeakingAnimation";

// Data
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'theBigSpeechGameState';
const PASSING_THRESHOLD = 7; // Score out of 10 to pass

// Helper to hide scrollbar
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// Helper to parse Gemini's JSON response
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


// --- UI Components (Victory, Losing, Review Screens) ---

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
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Score</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}/10</span>
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
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Score</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}/10</span>
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

function ReviewScreen({ feedback1, feedback2, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Your Feedback</h1>
            <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6 overflow-y-auto p-2 no-scrollbar">
                {/* Text Feedback */}
                {feedback1 && (
                    <div className="flex-1 bg-gray-800/50 border border-cyan-700 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-cyan-300 mb-4 tracking-wide">📝 Speech Content</h3>
                        <ul className="space-y-3 text-md">
                            <li><span className="font-semibold text-gray-300">Structure:</span> {feedback1.structure}/3</li>
                            <li><span className="font-semibold text-gray-300">Clarity:</span> {feedback1.clarity}/2</li>
                            <li><span className="font-semibold text-gray-300">Tone:</span> {feedback1.tone}/2</li>
                        </ul>
                        {Array.isArray(feedback1.tips) && (
                            <div className="mt-5">
                                <p className="text-cyan-400 font-semibold mb-2">💡 Tips to Improve:</p>
                                <ul className="list-disc list-inside text-sm text-gray-200 space-y-1 ml-2">
                                    {feedback1.tips.map((tip, idx) => <li key={idx}>{tip}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
                {/* Delivery Feedback */}
                {feedback2 && (
                     <div className="flex-1 bg-gray-800/50 border border-green-700 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-green-300 mb-4 tracking-wide">🎤 Speech Delivery</h3>
                        <ul className="space-y-3 text-md">
                            <li><span className="font-semibold text-gray-300">🔊 Volume:</span> {feedback2.volume}</li>
                            <li><span className="font-semibold text-gray-300">⏱ Pacing:</span> {feedback2.pacing}</li>
                            <li><span className="font-semibold text-gray-300">💪 Confidence:</span> {feedback2.confidence}</li>
                        </ul>
                    </div>
                )}
            </div>
            <button onClick={onBackToResults} className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}


// --- Game Logic (Reducer and Initial State) ---

const initialState = {
    gameState: "intro", // intro, instructions, playing, finished, review
    currentStep: 0, // 0: Cause/Hook, 1: Points/Action, 2: Video Upload
    speechData: { cause: "", hook: "", point1: "", point2: "", action: "" },
    recording: null,
    feedback1: null, // Gemini text feedback
    feedback2: null, // Meyda audio feedback
    score2: 0, // Audio score
    totalScore: null,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
    loading: false,
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE":
            return action.payload;
        case "SHOW_INSTRUCTIONS":
            return { ...state, gameState: "instructions" };
        case "START_GAME":
            return { ...initialState, gameState: "playing", startTime: Date.now() };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_SPEECH_PART":
            return { ...state, speechData: { ...state.speechData, ...action.payload } };
        case "SET_RECORDING":
            return { ...state, recording: action.payload };
        case "SET_FEEDBACK_1":
            return { ...state, feedback1: action.payload, currentStep: 2, loading: false };
        // NEW: Combined action to set audio feedback and finalize the game state
        case "SET_FEEDBACK_2_AND_FINALIZE": {
            const { feedback, score } = action.payload;
            const total = state.feedback1.structure + state.feedback1.clarity + state.feedback1.tone + score;
            return {
                ...state,
                feedback2: feedback,
                score2: score,
                totalScore: total,
                gameState: "finished",
                loading: false,
            };
        }
        case "SET_AI_INSIGHT":
            return { ...state, ...action.payload };
        case "REVIEW_GAME":
            return { ...state, gameState: "review" };
        case "BACK_TO_FINISH":
            return { ...state, gameState: "finished" };
        case "RESET_GAME":
            return { ...initialState, gameState: "playing", startTime: Date.now() };
        case "ADVANCE_STEP":
            return { ...state, currentStep: state.currentStep + 1 };
        default:
            return state;
    }
}

// --- Main Game Component ---

export default function TheBigSpeech() {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    
    // Local state for form inputs
    const [formInputs, setFormInputs] = useState({ cause: '', hook: '', point1: '', point2: '', action: '' });

    const videoRef = useRef();
    const audioCtxRef = useRef(null);
    const sourceRef = useRef(null);
    const analyzerRef = useRef(null);
    const startTimeRef = useRef(Date.now());


    // Effect to handle session storage
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

    // Effect for completing challenge
    useEffect(() => {
        if (state.totalScore !== null && state.totalScore >= PASSING_THRESHOLD) {
            completeCommunicationChallenge(2, 1);
            
            const timeTakenSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
            updatePerformance({
                moduleName: "Communication",
                topicName: "interpersonalSkills",
                score: state.totalScore,
                accuracy: (state.totalScore / 10) * 100,
                avgResponseTimeSec: timeTakenSec,
                studyTimeMinutes: Math.ceil(timeTakenSec / 60),
                completed: true,
            });
        }
    }, [state.totalScore, completeCommunicationChallenge, updatePerformance]);
    
    // Effect to generate AI insight
    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results..." } });

                const feedbackSummary = {
                    content_score: state.feedback1 ? state.feedback1.structure + state.feedback1.clarity + state.feedback1.tone : 0,
                    content_tips: state.feedback1 ? state.feedback1.tips : [],
                    delivery_score: state.score2,
                    delivery_feedback: state.feedback2 ? [state.feedback2.volume, state.feedback2.pacing, state.feedback2.confidence] : []
                };

                const prompt = `You are an AI speech coach. A student completed a speech practice game. Analyze their performance and provide targeted feedback. ### CONTEXT ### 1. **Student's Performance:** ${JSON.stringify(feedbackSummary, null, 2)} 2. **Available Note Sections:** ${JSON.stringify(notesCommunication9to10.map(n => ({ topicId: n.topicId, title: n.title })), null, 2)} ### YOUR TASK ### 1. **DETECT:** Identify the main area for improvement (e.g., "speech structure," "vocal confidence," "clarity"). Find the ONE best-matching note section from the list. 2. **GENERATE:** Provide a short, encouraging insight (25-30 words) and suggest reviewing the chosen note section by its title. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the best section", "insight": "Your personalized feedback message." }`;

                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication9to10.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" } });
                    } else { throw new Error("Failed to parse response from AI."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Great job practicing! Reviewing the notes on delivery can help you improve even more.", recommendedSectionId: 'non-verbal-communication', recommendedSectionTitle: "Non-Verbal Communication" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.feedback1, state.feedback2, state.score2, state.insight]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormInputs(prev => ({ ...prev, [name]: value }));
    };

    const handleTextSubmit = async () => {
        dispatch({ type: "SET_SPEECH_PART", payload: { point1: formInputs.point1, point2: formInputs.point2, action: formInputs.action } });
        dispatch({ type: 'SET_LOADING', payload: true });

        const { cause, hook } = state.speechData;
        const { point1, point2, action } = formInputs;
        
        const prompt = `You're a speech evaluator. Rate this speech. Speech Details: Cause: ${cause}, Hook: ${hook}, Point1: ${point1}, Point2: ${point2}, CallToAction: ${action}. Give score out of 7: Structure (3), Clarity (2), Tone (2). Only give full marks if excellent. Give 2–3 specific improvement tips (max 20 words each). Respond in JSON like: {"structure":3,"clarity":2,"tone":2, "tips": ["Tip 1...", "Tip 2..."]}`;

        try {
            const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
            const jsonText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/```json|```/g, "");
            const data = JSON.parse(jsonText.trim());
            dispatch({ type: 'SET_FEEDBACK_1', payload: data });
        } catch (err) {
            alert("Gemini API error. Please try again.");
            console.error(err);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const analyzeAudio = () => {
        if (!videoRef.current) return;
        dispatch({ type: 'SET_LOADING', payload: true });

        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            sourceRef.current = audioCtxRef.current.createMediaElementSource(videoRef.current);
        }
        if (analyzerRef.current) {
            analyzerRef.current.stop();
        }

        const feats = [];
        analyzerRef.current = Meyda.createMeydaAnalyzer({
            audioContext: audioCtxRef.current,
            source: sourceRef.current,
            bufferSize: 512,
            featureExtractors: ["rms", "zcr", "spectralCentroid"],
            callback: (f) => feats.push(f),
        });

        analyzerRef.current.start();
        videoRef.current.play();

        setTimeout(() => {
            analyzerRef.current.stop();
            videoRef.current.pause();

            let payload;
            const count = feats.length;

            if (count === 0) {
                payload = {
                    feedback: {
                        volume: "🔇 No audio detected",
                        pacing: "🐢 Could be faster",
                        confidence: "😐 Add more energy",
                    },
                    score: 0
                };
            } else {
                const avg = feats.reduce((a, f) => ({ rms: a.rms + f.rms, zcr: a.zcr + f.zcr, spectralCentroid: a.spectralCentroid + f.spectralCentroid }), { rms: 0, zcr: 0, spectralCentroid: 0 });
                avg.rms /= count;
                avg.zcr /= count;
                avg.spectralCentroid /= count;
                
                const vol = avg.rms > 0.02;
                const pace = avg.zcr > 0.07;
                const conf = avg.spectralCentroid > 1500;
                let pts = (vol ? 1 : 0) + (pace ? 1 : 0) + (conf ? 1 : 0);

                payload = {
                    feedback: {
                        volume: vol ? "✅ Clear volume" : "🔇 Speak a bit louder",
                        pacing: pace ? "✅ Good pace" : "🐢 Could be faster",
                        confidence: conf ? "✅ Confident tone" : "😐 Add more energy",
                    },
                    score: pts
                };
            }

            // Dispatch the new combined action to finalize the game immediately
            dispatch({ type: 'SET_FEEDBACK_2_AND_FINALIZE', payload });

        }, 5000); // Analyze for 5 seconds
    };
    
    // --- Handlers ---
    
    const handleSubmit = () => {
        switch (state.currentStep) {
            case 0:
                if (!formInputs.cause || !formInputs.hook) return;
                dispatch({ type: "SET_SPEECH_PART", payload: { cause: formInputs.cause, hook: formInputs.hook } });
                dispatch({ type: 'ADVANCE_STEP' });
                break;
            case 1:
                if (!formInputs.point1 || !formInputs.point2 || !formInputs.action) return;
                handleTextSubmit();
                break;
            case 2:
                if (!state.recording) return;
                analyzeAudio();
                break;
            default:
                break;
        }
    };
    
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
        setFormInputs({ cause: '', hook: '', point1: '', point2: '', action: '' });
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=9-10&section=${state.recommendedSectionId}`);
        }
    };

    // --- Render Logic ---

    if (state.gameState === "intro") {
        return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    }
    
    if (state.gameState === "finished") {
        const isVictory = state.totalScore >= PASSING_THRESHOLD;
        return isVictory
            ? <VictoryScreen accuracyScore={state.totalScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={() => navigate('/communications')} />
            : <LosingScreen accuracyScore={state.totalScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
    }

    if (state.gameState === "review") {
        return <ReviewScreen feedback1={state.feedback1} feedback2={state.feedback2} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    // Determine button state and text
    let isButtonDisabled = false;
    let buttonText = "Submit";
    if (state.currentStep === 0) { isButtonDisabled = !formInputs.cause || !formInputs.hook; buttonText = "Next"; }
    if (state.currentStep === 1) { isButtonDisabled = !formInputs.point1 || !formInputs.point2 || !formInputs.action; buttonText = "Next"; }
    if (state.currentStep === 2) { isButtonDisabled = !state.recording; buttonText = "Finish"; }
    if (state.loading) { isButtonDisabled = true; buttonText = "Analyzing..."; }
    
    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative">
            <style>{scrollbarHideStyle}</style>
            {state.gameState === "instructions" && <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />}
            
            <GameNav />
            
            <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-3xl flex flex-col items-center gap-8">
                    {state.currentStep === 0 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6 p-8 bg-gray-800/30 border-2 border-[#3F4B48] rounded-xl">
                           <h2 className="text-2xl font-bold text-center text-cyan-300">Step 1: The Foundation</h2>
                            <label className="block font-semibold text-gray-200">🌟 Choose a Cause</label>
                            <select name="cause" value={formInputs.cause} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-cyan-700 bg-gray-900 text-white shadow-inner">
                                <option value="">Select...</option>
                                <option value="Mental Health Week">Mental Health Week</option>
                                <option value="Plastic-Free Campaign">Plastic-Free Campaign</option>
                                <option value="Canteen Upgrade">Canteen Upgrade</option>
                            </select>

                            <label className="block font-semibold text-gray-200">🎯 Choose a Hook (How will you start?)</label>
                            <select name="hook" value={formInputs.hook} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-cyan-700 bg-gray-900 text-white shadow-inner">
                                <option value="">Choose...</option>
                                <option value="Quote">Start with a Quote</option>
                                <option value="Story">Tell a Short Story</option>
                                <option value="Question">Ask a Question</option>
                            </select>
                        </motion.div>
                    )}

                    {state.currentStep === 1 && (
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-5 p-8 bg-gray-800/30 border-2 border-[#3F4B48] rounded-xl">
                            <h2 className="text-2xl font-bold text-center text-cyan-300">Step 2: The Core Message</h2>
                            <label className="block font-semibold text-gray-200">💡 Strong Point 1</label>
                            <input name="point1" value={formInputs.point1} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-cyan-600 bg-gray-800 text-white" placeholder="Your first main idea..."/>
                            
                            <label className="block font-semibold text-gray-200">💬 Strong Point 2</label>
                            <input name="point2" value={formInputs.point2} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-cyan-600 bg-gray-800 text-white" placeholder="Your second main idea..."/>

                            <label className="block font-semibold text-gray-200">📣 Call to Action</label>
                            <input name="action" value={formInputs.action} onChange={handleInputChange} className="w-full p-3 rounded-xl border border-cyan-600 bg-gray-800 text-white" placeholder="What do you want people to do?"/>
                        </motion.div>
                    )}

                     {state.currentStep === 2 && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-5 p-8 bg-gray-800/30 border-2 border-[#3F4B48] rounded-xl">
                            <SpeakingAnimation />
                            <h2 className="text-2xl font-bold text-center text-cyan-300">Final Step: The Delivery</h2>
                            <label className="flex flex-col items-center justify-center w-full h-32 bg-gray-900 rounded-2xl border-2 border-dashed border-cyan-700 cursor-pointer hover:border-yellow-400 transition">
                                <span className="text-gray-300 font-medium text-sm mb-2">Click or drag your speech video here</span>
                                <input type="file" accept="video/*" onChange={(e) => { const file = e.target.files[0]; if (file) { dispatch({ type: 'SET_RECORDING', payload: URL.createObjectURL(file) }) }}} className="hidden"/>
                                <span className="text-xs text-gray-500">Accepted: MP4, WebM, MOV</span>
                            </label>
                            {state.recording && <video ref={videoRef} src={state.recording} controls className="w-full mt-4 rounded-xl border border-cyan-800 shadow-lg"/>}
                        </motion.div>
                    )}

                </div>
            </main>

            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={isButtonDisabled}>
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${isButtonDisabled ? "opacity-50" : ""}`}>
                            {buttonText}
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}