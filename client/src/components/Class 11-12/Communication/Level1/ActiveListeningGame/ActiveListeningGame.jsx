import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from 'axios';

// --- Context Hooks ---
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

import { notesCommunication11to12 } from "@/data/notesCommunication11to12.js";

// --- Icon & Page Components (ensure paths are correct) ---
import Checknow from '@/components/icon/GreenBudget/Checknow';
import ThinkingCloud from "@/components/icon/ThinkingCloud";
import GameNav from "./GameNav";
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';

// --- Helper for hiding scrollbar & parsing JSON ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) { text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim(); }
    if (text.startsWith("`") && text.endsWith("`")) { text = text.slice(1, -1).trim(); }
    try { return JSON.parse(text); } catch (err) { console.error("Failed to parse JSON:", err); return null; }
}

// --- Game Constants ---
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'activeListeningGameState';
const PASSING_THRESHOLD = 70; // 70% accuracy to win

const emotionOptions = ["Angry", "Embarrassed", "Anxious", "Frustrated", "Disappointed", "Confident"];
const correctEmotions = ["Anxious", "Frustrated", "Disappointed"];

// --- MODEL ANSWERS FOR REVIEW SCREEN ---
const MODEL_ANSWERS = {
    concerns: "Riya is feeling overwhelmed with her tasks, specifically mentioning the missed vendor coordination and logistics. She is asking for help and support to reorganize or redistribute the work.",
    emotions: correctEmotions,
    response: "Hey Riya, thank you for being open about this. It sounds incredibly stressful. Let's definitely tackle this together. How about we sit down first thing tomorrow to re-distribute the tasks? I can take over the vendor logistics right away to get that off your plate."
};

// =============================================================================
//  Sub-Components
// =============================================================================

function AudioPlayerCharacter({ audioSrc, onPlaybackStop = () => {} }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audioElement = audioRef.current;
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            setIsPlaying(false);
        }
    }, [audioSrc]);

    const handleAudioEnded = () => {
        setIsPlaying(false);
        onPlaybackStop();
    };

    const togglePlayPause = async () => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        if (isPlaying) {
            audioElement.pause();
            setIsPlaying(false);
            onPlaybackStop();
        } else {
            window.dispatchEvent(new CustomEvent('pause-background-audio'));
            try {
                await audioElement.play();
                setIsPlaying(true);
            } catch (error) {
                console.error(`Audio play failed for src: "${audioSrc}".`, error);
                setIsPlaying(false);
                onPlaybackStop();
            }
        }
    };

    return (
        <div className="flex items-end justify-center">
            <audio ref={audioRef} onEnded={handleAudioEnded} preload="auto" style={{ display: 'none' }}>
                <source src={audioSrc} type="audio/mpeg" />
            </audio>
            <img src="/feedbackcharacter.gif" alt="Character" className="w-[3.5rem] md:w-[4.8rem] h-auto object-contain shrink-0" />
            <div className="relative mb-8 md:ml-2">
                <ThinkingCloud className="w-[220px] h-auto md:w-[260px]" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center gap-5">
                    <button onClick={togglePlayPause} className="cursor-pointer flex-shrink-0 focus:outline-none rounded-full w-7">
                        <img src={isPlaying ? "/communicationGames6to8/pause.svg" : "/communicationGames6to8/play.svg"} alt={isPlaying ? "Pause" : "Play"} className="w-9 h-9 md:w-11 md:h-11 transition-transform duration-200 hover:scale-105 active:scale-95" />
                    </button>
                    <img src="/communicationGames6to8/audio.svg" alt="Audio waveform" className="h-9 md:h-11" />
                </div>
            </div>
        </div>
    );
}

function VictoryScreen({ onRestart, onViewFeedback, onContinue, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col overflow-hidden">
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
                <img src="/financeGames6to8/retry.svg" alt="Play Again" onClick={onRestart} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function LossScreen({ onPlayAgain, onViewFeedback, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col overflow-hidden">
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
                        <button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg">
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

function ReviewScreen({ onBackToResults, results }) {
    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col text-white p-4">
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-4 text-yellow-400 text-center shrink-0">Review Your Answers</h1>
            <div className="flex-1 overflow-auto no-scrollbar space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h2 className="text-lg font-bold text-green-400 mb-2">Q1: Riya's Key Concerns (Score: {results.scores.concernsScore}/3)</h2>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-300">Your Summary:</p>
                        <p className="text-gray-100 italic">"{results.userConcerns || 'No answer given'}"</p>
                        <p className="font-semibold text-gray-300 pt-2">Ideal Summary:</p>
                        <p className="text-green-300">"{MODEL_ANSWERS.concerns}"</p>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h2 className="text-lg font-bold text-blue-400 mb-2">Q2: Riya's Emotions (Score: {results.scores.emotionScore}/3)</h2>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-300">Your Selection:</p>
                        <div className="flex flex-wrap gap-2">
                            {results.userEmotions.length > 0 ? results.userEmotions.map(e => (
                                <span key={e} className={`px-3 py-1 rounded-full text-sm ${MODEL_ANSWERS.emotions.includes(e) ? 'bg-green-500' : 'bg-red-500'}`}>{e}</span>
                            )) : <p className="italic">No emotions selected.</p>}
                        </div>
                        <p className="font-semibold text-gray-300 pt-2">Correct Emotions:</p>
                        <div className="flex flex-wrap gap-2">
                           {MODEL_ANSWERS.emotions.map(e => <span key={e} className="px-3 py-1 rounded-full text-sm bg-blue-500">{e}</span>)}
                        </div>
                    </div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg">
                    <h2 className="text-lg font-bold text-yellow-400 mb-2">Q3: Your Response (Score: {results.scores.responseScore}/4)</h2>
                    <div className="space-y-2">
                        <p className="font-semibold text-gray-300">Your Response:</p>
                        <p className="text-gray-100 italic">"{results.userResponse || 'No answer given'}"</p>
                        <p className="font-semibold text-gray-300 pt-2">An Ideal Response:</p>
                        <p className="text-yellow-300">"{MODEL_ANSWERS.response}"</p>
                    </div>
                </div>
            </div>
            <div className="shrink-0 pt-4 flex justify-center">
                 <button onClick={onBackToResults} className="px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                    Back to Results
                </button>
            </div>
        </div>
    );
}

// =============================================================================
// Main Game Component
// =============================================================================
export default function ActiveListeningGame() {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();

    const [gameState, setGameState] = useState({
        screen: 'intro',
        endScreen: null, gameKey: Date.now(),
        concerns: "", selectedEmotions: [], response: "",
        gameResults: null, insight: "Analyzing your results...",
        recommendedSectionId: null, recommendedSectionTitle: "",
        accuracyScore: 0, loading: false, startTime: Date.now()
    });

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                setGameState(JSON.parse(savedStateJSON));
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) {
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
    }, []);

    const handleTimeUp = () => {
        setGameState(prev => ({
            ...prev,
            screen: 'loss',
            endScreen: 'loss',
            accuracyScore: 0,
            insight: "Time ran out! Quick, thoughtful responses are a key part of effective communication.",
            gameResults: {
                userConcerns: prev.concerns || "No answer",
                userEmotions: prev.selectedEmotions,
                userResponse: prev.response || "No answer",
                scores: { concernsScore: 0, emotionScore: 0, responseScore: 0 }
            }
        }));
    };
    
    const handleRestart = () => {
        setGameState({
            screen: 'intro',
            endScreen: null, gameKey: Date.now(), concerns: "", selectedEmotions: [],
            response: "", gameResults: null, insight: "Analyzing your results...",
            recommendedSectionId: null, recommendedSectionTitle: "",
            accuracyScore: 0, loading: false, startTime: Date.now()
        });
    };

    const handleShowInstructions = () => setGameState(prev => ({ ...prev, screen: 'instructions' }));
    const handleStartGame = () => setGameState(prev => ({ ...prev, screen: 1, startTime: Date.now() }));
    const resumeBackgroundMusic = () => window.dispatchEvent(new CustomEvent('play-background-audio'));
    const handleViewFeedback = () => setGameState(prev => ({ ...prev, screen: 'review' }));
    const handleBackToResults = () => setGameState(prev => ({ ...prev, screen: prev.endScreen }));
    const handleContinue = () => navigate('/communications/games');
    const handleNavigateToSection = () => {
    if (gameState.recommendedSectionId) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(gameState));
        navigate(`/communications/notes?grade=11-12&section=${gameState.recommendedSectionId}`);
    }
};
    const toggleEmotion = (emotion) => {
        setGameState(prev => ({...prev, selectedEmotions: prev.selectedEmotions.includes(emotion) ? prev.selectedEmotions.filter((e) => e !== emotion) : prev.selectedEmotions.length < 3 ? [...prev.selectedEmotions, emotion] : prev.selectedEmotions }));
    };
    const handleProceedToScreen2 = () => setGameState(prev => ({ ...prev, screen: 2 }));

    const handleSubmit = async () => {
        setGameState(prev => ({...prev, loading: true}));
        const { concerns, selectedEmotions, response, startTime } = gameState;

        const emotionScore = selectedEmotions.filter(e => correctEmotions.includes(e)).length;

        const scoringPrompt = `You are an AI evaluator for a communication skills game. A student listened to an audio clip from an overwhelmed teammate (Riya) who mentioned missed vendor coordination, logistics, and needing help. Evaluate the student's two written answers below.
        ### STUDENT'S ANSWERS ###
        1. Summary of Riya's Concerns: "${concerns}"
        2. Empathetic Response to Riya: "${response}"
        ### YOUR TASK ###
        Evaluate the answers and return ONLY a valid JSON object with scores based on these criteria:
        - "concernsScore" (0-3 points): 3 points for capturing 2+ key issues (overwhelmed, vendor, logistics, help). 2 for one issue. 1 for vague mention of stress. 0 for irrelevant answers like "hi".
        - "responseScore" (0-4 points): Award points for: Empathy (up to 2), a clear Action plan (1), and a Non-Blaming Tone (1).
        ### OUTPUT FORMAT ###
        { "concernsScore": <number>, "responseScore": <number> }`;
        
        let aiScores = { concernsScore: 0, responseScore: 0 };
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, {
                method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: scoringPrompt }] }] }),
            });
            const data = await res.json();
            aiScores = parsePossiblyStringifiedJSON(data.candidates[0].content.parts[0].text) || { concernsScore: 0, responseScore: 0 };
        } catch (error) { console.error("AI scoring failed:", error); }

        const totalScore = aiScores.concernsScore + emotionScore + aiScores.responseScore;
        const accuracy = Math.round((totalScore / 10) * 100);
        const results = { userConcerns: concerns, userEmotions: selectedEmotions, userResponse: response, scores: { concernsScore: aiScores.concernsScore, emotionScore, responseScore: aiScores.responseScore }};
        const totalTimeSec = Math.floor((Date.now() - startTime) / 1000);
        updatePerformance({ moduleName: "Communication", topicName: "emotionalIntelligence", completed: accuracy >= PASSING_THRESHOLD, studyTimeMinutes: Math.max(1, Math.round(totalTimeSec / 60)), avgResponseTimeSec: Math.floor(totalTimeSec / 3), score: totalScore, accuracy: accuracy });
        
        if (accuracy >= PASSING_THRESHOLD) {
            completeCommunicationChallenge(0, 1);
            setGameState(prev => ({...prev, screen: 'victory', endScreen: 'victory', insight: "Fantastic job! You perfectly balanced empathy with a clear plan of action.", accuracyScore: accuracy, gameResults: results, loading: false}));
        } else {
            const insightPrompt = `An AI tutor analyzing a student's active listening failure. Their scores: Concerns Summary ${aiScores.concernsScore}/3, Emotion ID ${emotionScore}/3, Empathetic Response ${aiScores.responseScore}/4. Note options: ${JSON.stringify(notesCommunication11to12.map(n => ({ topicId: n.topicId, title: n.title })), null, 2)}. ### TASK ### Based on their lowest score, DETECT their main weakness, find the BEST note section, and GENERATE a 25-word encouraging insight recommending that note by title. ### OUTPUT ### Return ONLY a JSON object: { "detectedTopicId": "...", "insight": "..." }`;
            try {
                const parsedInsight = parsePossiblyStringifiedJSON(insightRes.data.candidates[0].content.parts[0].text);
                const recommendedNote = notesCommunication11to12.find(note => note.topicId === parsedInsight.detectedTopicId);
                setGameState(prev => ({ ...prev, screen: 'loss', endScreen: 'loss', insight: parsedInsight.insight, recommendedSectionId: parsedInsight.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "", accuracyScore: accuracy, gameResults: results, loading: false }));                setGameState(prev => ({ ...prev, screen: 'loss', endScreen: 'loss', insight: parsedInsight.insight, recommendedSectionId: parsedInsight.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "", accuracyScore: accuracy, gameResults: results, loading: false }));
            } catch (insightError) {
                setGameState(prev => ({ ...prev, screen: 'loss', endScreen: 'loss', insight: "Good effort! Active listening is tough. Reviewing the notes can help sharpen your skills.", recommendedSectionId: "active-listening", recommendedSectionTitle: "Active Listening", accuracyScore: accuracy, gameResults: results, loading: false }));
            }
        }
    };
    
    const { screen, gameKey, concerns, selectedEmotions, response, loading, gameResults, insight, recommendedSectionTitle, accuracyScore } = gameState;
    const isNextDisabled = concerns.trim() === '' || selectedEmotions.length === 0;
    const isSubmitDisabled = response.trim() === '';

    // --- RENDER LOGIC ---

    if (screen === 'intro') {
        return <IntroScreen onShowInstructions={handleShowInstructions} />;
    }

    if (['review', 'victory', 'loss'].includes(screen)) {
        return (
            <div className="w-full h-screen bg-[#0A160E]">
                {screen === 'review' && <ReviewScreen onBackToResults={handleBackToResults} results={gameResults} />}
                {screen === 'victory' && <VictoryScreen onRestart={handleRestart} onViewFeedback={handleViewFeedback} onContinue={handleContinue} accuracyScore={accuracyScore} insight={insight} />}
                {screen === 'loss' && <LossScreen onPlayAgain={handleRestart} onViewFeedback={handleViewFeedback} insight={insight} accuracyScore={accuracyScore} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={recommendedSectionTitle} />}
            </div>
        );
    }
    
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col inter-font relative text-white">
            <GameNav key={gameKey} onTimeUp={handleTimeUp} />
            
            {(screen === 1 || screen === 'instructions') && (
                <main className="flex-1 w-full flex flex-col pt-4 px-4 overflow-hidden">
                    <div className="flex-1 flex justify-center items-center overflow-auto no-scrollbar py-4">
                        <div className="w-full max-w-3xl bg-[rgba(32,47,54,0.3)] rounded-xl p-4 md:p-6 space-y-6">
                            <div><h3 className="text-lg font-bold text-yellow-400 mb-2 text-center">🎙️ Incoming Voice Note From Riya</h3></div>
                            <div>
                                <label className="block mb-1.5 text-green-400 font-medium text-sm">📝 Q1: What are Riya's key concerns?</label>
                                <textarea className="w-full p-3 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-lg" rows={3} placeholder="Summarize her main worries..." value={concerns} onChange={(e) => setGameState(prev => ({...prev, concerns: e.target.value}))} />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-blue-400 font-medium text-sm">🧠 Q2: What emotions is Riya expressing? (Choose up to 3)</label>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    {emotionOptions.map((emotion) => ( <button key={emotion} onClick={() => toggleEmotion(emotion)} className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold transition-all duration-200 shadow-sm ${selectedEmotions.includes(emotion) ? "bg-blue-500 text-white border-blue-400" : "bg-[#131f24] text-gray-300 border border-[#37464f] hover:bg-gray-700" }`}> {emotion} </button> ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="shrink-0 flex justify-center"> <AudioPlayerCharacter key={gameKey} audioSrc="./voices/level1_challenge2.mp3" onPlaybackStop={resumeBackgroundMusic} /> </div>
                </main>
            )}

            {screen === 2 && (
                <main className="flex-1 w-full flex flex-col items-center justify-center p-4 overflow-auto no-scrollbar">
                     <div className="w-full max-w-2xl bg-[rgba(32,47,54,0.3)] rounded-xl p-4 md:p-6 space-y-6">
                        <div>
                            <label className="block mb-1.5 text-yellow-400 font-medium text-lg text-center">💬 Q3: Show Your Leadership Voice</label>
                            <p className="text-center text-gray-300 mb-4">Show Riya you understand her feelings and offer a way to help her move forward with confidence.</p>
                            <textarea className="w-full p-3 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-lg" rows={4} placeholder="Respond in 3–4 thoughtful lines..." value={response} onChange={(e) => setGameState(prev => ({...prev, response: e.target.value}))} />
                        </div>
                    </div>
                </main>
            )}
            
            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    {(screen === 1 || screen === 'instructions') && ( <button className="relative w-full h-full cursor-pointer" onClick={handleProceedToScreen2} disabled={isNextDisabled}> <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" /> <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] lilita-one-regular ${isNextDisabled ? "opacity-50" : ""}`}> Next </span> </button> )}
                    {screen === 2 && ( <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={isSubmitDisabled || loading}> <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" /> <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] lilita-one-regular ${isSubmitDisabled || loading ? "opacity-50" : ""}`}> {loading ? "Checking..." : "Submit"} </span> </button> )}
                </div>
            </footer>

            {screen === 'instructions' && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <InstructionsScreen onStartGame={handleStartGame} />
                </div>
            )}
        </div>
    );
}