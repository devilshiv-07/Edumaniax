import React, { useState, useRef, useEffect, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Meyda from "meyda";
import axios from "axios";
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// --- External Component & Data Imports ---
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

// --- Constants & Helpers ---
const PERFECT_SCORE = 35;
const PASSING_THRESHOLD = 0.7;
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'toneTranslatorGameState';

const samples = [
  { id: "s1", src: "./voices/excited.mp3", label: "🥳 Excited" },
  { id: "s2", src: "./voices/sarcastic.mp3", label: "😏 Sarcastic" },
  { id: "s3", src: "./voices/angry.mp3", label: "😠 Angry" },
  { id: "s4", src: "./voices/polite.mp3", label: "😊 Polite" },
  { id: "s5", src: "./voices/bored.mp3", label: "😴 Bored" },
];
const labels = [ "😏 Sarcastic", "😊 Polite", "😴 Bored", "🥳 Excited", "😠 Angry"];

const parsePossiblyStringifiedJSON = (text) => {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) { text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim(); }
    try { return JSON.parse(text); } 
    catch (err) { console.error("Failed to parse JSON:", err); return null; }
};

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

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
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="lilita-one-regular text-2xl md:text-3xl text-yellow-400 mb-3">
                    Yayy! You completed Level 2.
                </h2>
                <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
                    Would you like to move to Level Three?
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

// --- Ending Screens (Written in-file) ---
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

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                        <h3 className="text-lg font-bold text-yellow-300">{ans.taskTitle}</h3>
                        <p className="text-gray-300 font-medium">{ans.taskDescription}</p>
                        <div>
                            <p className={ans.isCorrect ? 'text-green-300' : 'text-red-300'}>Your Answer: {ans.userAnswer || "Not Answered"}</p>
                            {!ans.isCorrect && <p className="text-green-400">Correct Answer: {ans.correctAnswer}</p>}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onBackToResults} className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

// --- Game Reducer ---
const initialState = {
    gameState: "intro",
    score: 0,
    answers: [],
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: ""
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing" };
        case "FINISH_GAME": return { ...state, gameState: "finished", score: action.payload.finalScore, answers: action.payload.finalAnswers };
        case "SET_AI_INSIGHT": return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing" };
        default: return state;
    }
}

// --- Main Game Component ---
export default function ToneTranslatorGame() {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [isPopupVisible, setPopupVisible] = useState(false);
    
    const [gameStep, setGameStep] = useState(1);
    const [drops, setDrops] = useState({});
    const [dragging, setDragging] = useState(null);
    const [recordings, setRecordings] = useState({});
    const [feedback, setFeedback] = useState({});
    const mediaRecorder = useRef(null);
    const [loadingSample, setLoadingSample] = useState(null);
    const [isRecording, setIsRecording] = useState({});
    
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const [startTime, setStartTime] = useState(null);

    useEffect(() => {
        if (state.gameState === 'playing' && startTime === null) setStartTime(Date.now());
    }, [state.gameState, startTime]);
    
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try { dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(savedStateJSON) }); }
            catch (error) { console.error("Failed to parse saved game state:", error); }
            finally { sessionStorage.removeItem(SESSION_STORAGE_KEY); }
        }
    }, []);

    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const timeTakenSec = Math.floor((Date.now() - startTime) / 1000);
            const accuracy = Math.round((state.score / PERFECT_SCORE) * 100);
            updatePerformance({ moduleName: "Communication", topicName: "emotionalIntelligence", score: Math.round(accuracy / 10), accuracy, avgResponseTimeSec: timeTakenSec, studyTimeMinutes: Math.ceil(timeTakenSec / 60), completed: 1 });
            if (accuracy === 100) completeCommunicationChallenge(1, 2);
            
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectAnswers = state.answers.filter(ans => !ans.isCorrect);

                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You're a communication expert!", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }

                const prompt = `You are an AI tutor. A student made mistakes in a game about vocal tones. Analyze their errors and provide targeted feedback. ### CONTEXT ### 1. **Student's Incorrect Answers:** ${JSON.stringify(incorrectAnswers, null, 2)} 2. **Available Note Sections:** ${JSON.stringify(notesCommunication9to10.map(n => ({ topicId: n.topicId, title: n.title, content: n.content.substring(0, 150) + '...' })), null, 2)} ### YOUR TASK ### 1. **DETECT:** Identify the main area of weakness (e.g., "confusing sarcasm with excitement," "difficulty producing a polite tone") and find the ONE best-matching note section. 2. **GENERATE:** Provide a short, encouraging insight (25-30 words) and suggest reviewing the note section by its title. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the best section", "insight": "Your personalized feedback message." }`;

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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes on non-verbal cues.", recommendedSectionId: 'non-verbal-communication', recommendedSectionTitle: "Non-Verbal Communication" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight, completeCommunicationChallenge, startTime, state.score, updatePerformance, navigate]);

    const analyzeTone = (blob, slot) => {
        return new Promise(async (resolve) => {
             const arrayBuffer = await blob.arrayBuffer();
             const audioCtx = new AudioContext();
             const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
             const source = audioCtx.createBufferSource();
             source.buffer = audioBuffer;
             const analyzer = Meyda.createMeydaAnalyzer({
                 audioContext: audioCtx, source, bufferSize: 512, featureExtractors: ["rms", "spectralCentroid", "zcr", "mfcc"],
                 callback: (features) => {
                     let tone = "😊 Neutral", tip = "Try raising pitch slightly and adding warmth.";
                     const { rms, zcr, spectralCentroid: centroid, mfcc } = features;
                     if (rms < 0.03 && zcr < 0.05 && centroid < 1500) { tone = "😴 Bored"; tip = "Speak a bit louder and quicker!"; }
                     else if (rms > 0.05 && zcr > 0.15 && centroid > 2500 && mfcc[0] > -50) { tone = "🥳 Excited"; tip = "Nice energy! Keep it up."; }
                     else if (mfcc[0] < -100 && centroid > 2200) { tone = "😠 Angry"; tip = "Try softening your tone and slowing down."; }
                     else if (rms > 0.03 && zcr > 0.08 && mfcc[0] > -80 && centroid < 2000) { tone = "😊 Polite"; tip = "Great! You're sounding calm and respectful."; }
                     else if (zcr > 0.2 && mfcc[0] < -70 && centroid > 2000) { tone = "😏 Sarcastic"; tip = "Sounds a bit sarcastic. Try being more genuine!"; }
                     setFeedback((f) => ({ ...f, [slot]: { tone, tip } }));
                     analyzer.stop();
                     source.stop();
                     resolve({ tone, tip });
                 },
             });
             analyzer.start();
             source.start();
        });
   };

    const startRecord = async (slot) => {
        window.dispatchEvent(new CustomEvent('pause-background-audio'));
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mr = new MediaRecorder(stream);
            mediaRecorder.current = mr;
            setIsRecording((p) => ({ ...p, [slot]: true }));
            let audioChunks = [];
            mr.ondataavailable = (e) => audioChunks.push(e.data);
            
            mr.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/wav' });
                setRecordings((r) => ({ ...r, [slot]: URL.createObjectURL(blob) }));
                analyzeTone(blob, slot);
                stream.getTracks().forEach(track => track.stop());
                setIsRecording((p) => ({ ...p, [slot]: false }));
                window.dispatchEvent(new CustomEvent('play-background-audio'));
            };

            mr.start();
            setTimeout(() => { if (mr.state === "recording") mr.stop(); }, 5000);
        } catch (error) {
            console.error("Mic permission error:", error);
            alert("Could not start recording. Please grant microphone permissions.");
            setIsRecording((p) => ({ ...p, [slot]: false }));
            window.dispatchEvent(new CustomEvent('play-background-audio'));
        }
    };

    const handleDrop = (targetLabel) => {
        if (!dragging) return;
        const newDrops = { ...drops };
        const existingVoiceInZone = Object.keys(newDrops).find(voiceId => newDrops[voiceId] === targetLabel);
        if (existingVoiceInZone) {
            delete newDrops[existingVoiceInZone];
        }
        newDrops[dragging] = targetLabel;
        setDrops(newDrops);
    };

    const handleNextStep = () => setGameStep(2);
    const handleContinue = () => {
        setPopupVisible(true);
    };

    const handleConfirmNavigation = () => {
        setPopupVisible(false);
        navigate('/ConflictCommanderGame'); 
    };

    const handleCancelNavigation = () => {
        setPopupVisible(false);
        navigate('/communications/games'); 
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };
    
    const handleFinish = () => {
        let score = 0, finalAnswers = [];
        samples.forEach((s, i) => {
            const isCorrect = drops[s.id] === s.label;
            if (isCorrect) score += 5;
            finalAnswers.push({ taskTitle: `Voice Sample ${i + 1}`, taskDescription: `Matching the audio for "${s.label}".`, userAnswer: drops[s.id], correctAnswer: s.label, isCorrect });
        });
        const tasks = [{ s: 'slot1', e: '🥳 Excited', d: 'Say "You’re here early." excitedly.' }, { s: 'slot2', e: '😊 Polite', d: 'Say "That’s nice." politely.' }];
        tasks.forEach(t => {
            const isCorrect = feedback[t.s]?.tone === t.e;
            if (isCorrect) score += 5;
            finalAnswers.push({ taskTitle: `Recording: ${t.e}`, taskDescription: `Task: ${t.d}`, userAnswer: feedback[t.s]?.tone, correctAnswer: t.e, isCorrect });
        });
        dispatch({ type: "FINISH_GAME", payload: { finalScore: score, finalAnswers } });
    };
    
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setDrops({}); setDragging(null); setRecordings({}); setFeedback({}); setStartTime(null); setGameStep(1);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=9-10&section=${state.recommendedSectionId}`);
        }
    };

    const playSampleAudio = (sampleId) => {
        window.dispatchEvent(new CustomEvent('pause-background-audio'));
        const audio = document.getElementById(sampleId);
        const handleSampleEnd = () => {
            window.dispatchEvent(new CustomEvent('play-background-audio'));
        };
        audio.addEventListener('ended', handleSampleEnd, { once: true });
        audio.play().catch(err => {
            console.error("Sample audio playback failed:", err);
            handleSampleEnd();
        });
        setLoadingSample(sampleId);
        setTimeout(() => setLoadingSample(null), 2500);
    };

    if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    if (state.gameState === "finished") {
        const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
        return accuracyScore >= PASSING_THRESHOLD * 100
            ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
            : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
    }
    if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;

    const isStep1SubmitDisabled = Object.keys(drops).length < samples.length;

    return (<>
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative text-white">
            <style>{scrollbarHideStyle}</style>
            {state.gameState === "instructions" && <InstructionsScreen onStartGame={() => dispatch({type: 'START_GAME'})} />}
            <GameNav />
            
            <main className="flex-1 w-full flex flex-col items-center justify-center p-4 overflow-y-auto no-scrollbar">
                {gameStep === 1 && (
                    <div className="w-full max-w-5xl">
                        <p className="text-center text-slate-300 mb-6 text-lg">🎵 Part 1: Listen and match each voice to the correct emotion.</p>
                        <div className="flex flex-wrap gap-4 justify-center mb-6 min-h-[140px]">
                            {samples.map((sample, i) => (
                                !Object.keys(drops).includes(sample.id) && (
                                    <motion.div key={sample.id} whileHover={{ scale: 1.05 }} className="bg-[#131F24] p-4 rounded-xl w-40 shadow-lg text-center relative border border-[#3F4B48]">
                                        <button onClick={() => playSampleAudio(sample.id)} className="text-2xl bg-cyan-700 hover:bg-cyan-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2">▶️</button>
                                        <audio id={sample.id} src={sample.src} preload="auto" />
                                        <div className="cursor-grab text-sm bg-yellow-500 text-black px-2 py-1 rounded-full font-semibold" draggable onDragStart={() => setDragging(sample.id)}>Voice {i + 1}</div>
                                        {loadingSample === sample.id && ( <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-xl"><div className="flex gap-1"><div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" /></div></div> )}
                                    </motion.div>
                                )
                            ))}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                            {labels.map((label) => {
                                const droppedVoiceId = Object.keys(drops).find(voiceId => drops[voiceId] === label);
                                return (
                                <div key={label} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(label)} className="h-[100px] bg-gray-800/50 border-2 border-dashed border-cyan-700/50 rounded-xl text-center p-3 transition-colors duration-200 flex flex-col items-center justify-center">
                                    <div className="font-bold text-lg text-slate-200">{label}</div>
                                    {droppedVoiceId && ( <div className="bg-green-800 text-green-100 rounded-full px-2 py-1 text-sm inline-block mt-1">Voice {samples.findIndex(s => s.id === droppedVoiceId) + 1}</div> )}
                                </div>
                            )})}
                        </div>
                    </div>
                )}

                {gameStep === 2 && (
                     <div className="w-full max-w-3xl">
                        <h3 className="text-xl text-yellow-400 font-bold text-center mb-4 ">🎤 Part 2: Try It Yourself!</h3>
                         <div className="grid grid-cols-1 gap-4">
                            {[{slot: "slot1", text: `"You’re here early."`, goal: "🥳 Excited"}, {slot: "slot2", text: `"That’s nice."`, goal: "😊 Polite"}].map((task) => (
                              <div key={task.slot} className="bg-[#131F24] rounded-xl p-4 shadow-lg border border-[#3F4B48]">
                                <p className="font-semibold text-lg mb-2 text-slate-200">Say: <span className="italic text-cyan-300">{task.text}</span></p>
                                <p className="font-semibold text-md mb-3 text-slate-400">Your Goal: <span className="font-bold text-yellow-400">{task.goal}</span></p>
                                <div className="flex gap-3 mb-2">
                                  <button onClick={() => startRecord(task.slot)} disabled={isRecording[task.slot]} className={`font-bold py-2 px-4 rounded-full transition-colors ${isRecording[task.slot] ? "bg-gray-600 cursor-not-allowed" : "bg-cyan-700 hover:bg-cyan-600"}`}>🎙️ Start</button>
                                  <button onClick={() => mediaRecorder.current?.stop()} disabled={!isRecording[task.slot]} className={`font-bold py-2 px-4 rounded-full transition-colors ${!isRecording[task.slot] ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-500"}`}>⏹️ Stop</button>
                                </div>
                                {recordings[task.slot] && (
                                  <div className="mt-2">
                                    <audio controls src={recordings[task.slot]} className="my-2 w-full" />
                                    {feedback[task.slot] && ( <div className="text-sm bg-gray-800/50 p-2 rounded-md"><p className="text-slate-300">🧠 Detected: <span className="font-semibold text-yellow-300">{feedback[task.slot]?.tone}</span></p><p className="text-slate-400">💡 Tip: {feedback[task.slot]?.tip}</p></div> )}
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            
            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button 
                        className="relative w-full h-full cursor-pointer" 
                        onClick={gameStep === 1 ? handleNextStep : handleFinish}
                        disabled={gameStep === 1 && isStep1SubmitDisabled}
                    >
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${(gameStep === 1 && isStep1SubmitDisabled) ? "opacity-50" : ""}`}>
                           {gameStep === 1 ? 'Submit' : 'Finish'}
                        </span>
                    </button>
                </div>
            </footer>
        </div>
        <LevelCompletePopup
                isOpen={isPopupVisible}
                onConfirm={handleConfirmNavigation}
                onCancel={handleCancelNavigation}
                onClose={handleClosePopup}
            />
        </>
        
    );
}