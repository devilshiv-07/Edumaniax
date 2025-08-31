import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { motion, AnimatePresence } from "framer-motion";

// --- Import your components ---
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';
import { notesCommunication6to8 } from "@/data/notesCommunication6to8.js";

// --- Constants & Helpers ---
const scrollbarHideStyle = ` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'feelItFindItGameState';
const PASSING_THRESHOLD = 0.8;

const emotionData = [
    { id: 1, face: "😢", emotion: "Sad", situation: "Group didn't include them" },
    { id: 2, face: "😠", emotion: "Angry", situation: "Someone pushed them" },
    { id: 3, face: "😄", emotion: "Happy", situation: "Got complimented" },
    { id: 4, face: "😳", emotion: "Embarrassed", situation: "Slipped in hallway" },
    { id: 5, face: "😱", emotion: "Scared", situation: "Lost notebook before test" },
    { id: 6, face: "😐", emotion: "Neutral", situation: "Didn't understand the problem" },
];

function shuffleArray(array) { const newArr = [...array]; for (let i = newArr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; } return newArr; }
const getNewGameEmotions = () => shuffleArray(emotionData).slice(0, 4);

function parsePossiblyStringifiedJSON(text) {
    try {
        if (typeof text !== "string") return null;
        text = text.trim();
        if (text.startsWith("```")) {
            text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
        }
        if (text.startsWith("`") && text.endsWith("`")) {
            text = text.slice(1, -1).trim();
        }
        return JSON.parse(text);
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        return null;
    }
}

// --- Game State Management ---
const initialState = {
    gameState: "intro",
    gameEmotions: [],
    matches: [],
    phase2Matches: [],
    reflectionAnswers: {},
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: ""
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing", gameEmotions: getNewGameEmotions() };
        case "FINISH_GAME": return { ...state, gameState: "finished", matches: action.payload.matches, phase2Matches: action.payload.phase2Matches, reflectionAnswers: action.payload.reflectionAnswers };
        case "SET_AI_INSIGHT": return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        default: return state;
    }
}

// --- Main Game Component ---
export default function FeelItFindItGame() {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);

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
        if (state.gameState === 'finished' && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                
                const incorrectAnswers = [
                    ...state.matches.filter(m => !m.isCorrect).map(m => ({ type: 'Phase 1: Face to Emotion', mistake: `Incorrectly matched ${m.face.face} with ${m.emotion.emotion}. Correct was ${m.face.emotion}.` })),
                    ...state.phase2Matches.filter(m => !m.isCorrect).map(m => ({ type: 'Phase 2: Emotion to Situation', mistake: `Incorrectly matched ${m.emotion.emotion} with a situation. Correct was ${m.emotion.situation}.` }))
                ];

                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You're an expert at picking up emotional cues!", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }

                const prompt = `You are an expert AI tutor. A student made mistakes in a game about emotional intelligence called 'Feel It, Find It'. Provide targeted feedback. ### CONTEXT ### 1. **Student's Incorrect Answers:** ${JSON.stringify(incorrectAnswers, null, 2)} 2. **Available Note Sections:** ${JSON.stringify(notesCommunication6to8.map(n => ({topicId: n.topicId, title: n.title})), null, 2)} ### YOUR TASK ### 1. **DETECT:** Analyze the mistakes. Identify the ONE note section that is the best match for their errors. 2. **GENERATE:** Provide a short, encouraging insight (25-30 words) about their performance. Suggest reviewing the note section you detected by its 'title'. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the section you identified", "insight": "Your personalized feedback message here." }`;
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" } });
                    } else { throw new Error("Failed to parse AI response."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes...", recommendedSectionId: 'emotional-awareness', recommendedSectionTitle: 'Emotional Awareness' } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.matches, state.phase2Matches]);

    const handleNavigateToSection = () => { 
        if (state.recommendedSectionId) { 
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state)); 
            navigate(`/communications/notes?grade=6-8&section=${state.recommendedSectionId}`); 
        } 
    };
    
    // --- RENDER LOGIC ---
    if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;

    if (state.gameState === "finished" || state.gameState === "review") {
        const p1Score = state.matches.filter(m => m.isCorrect).length;
        const p2Score = state.phase2Matches.filter(m => m.isCorrect).length;
        const p3Score = Object.keys(state.reflectionAnswers).length;
        const totalScore = p1Score + p2Score + p3Score;
        const accuracyScore = state.gameEmotions.length > 0 ? Math.round((totalScore / (state.gameEmotions.length * 3)) * 100) : 0;
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        
        const answersForReview = state.gameEmotions.map((emotion, idx) => {
            const p1Answer = state.matches.find(m => m.face.id === emotion.id) || { isCorrect: false };
            const p2Answer = state.phase2Matches.find(m => m.emotion.id === emotion.id) || { isCorrect: false };
            return {
                idx,
                isCorrect: p1Answer.isCorrect && p2Answer.isCorrect,
                userAnswers: {
                    emotion: p1Answer.emotion ? `${p1Answer.face.face} → ${p1Answer.emotion.emotion}` : "Not Answered",
                    behavior: p2Answer.situation ? `${p2Answer.emotion.emotion} → ${p2Answer.situation.situation}`: "Not Answered",
                },
                correctAnswers: {
                    emotion: `${emotion.face} → ${emotion.emotion}`,
                    behavior: `${emotion.emotion} → ${emotion.situation}`,
                }
            };
        });

        if (state.gameState === 'review') {
            return <ReviewScreen answers={answersForReview} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
        }
        
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={() => dispatch({ type: 'START_GAME' })} />
            : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={() => dispatch({ type: 'START_GAME' })} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
    }

    // --- RENDER GAME (with overlay logic) ---
    return (
        <div className="w-full h-screen bg-neutral-950 flex flex-col font-['Comic_Neue'] text-white relative">
            <GameUI gameEmotions={state.gameEmotions} dispatch={dispatch} />
            {state.gameState === "instructions" && <InstructionsScreen onStartGame={() => dispatch({ type: 'START_GAME' })} />}
        </div>
    );
}

// --- Sub-Components ---
const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState('lg');
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setBreakpoint('sm');
            else if (window.innerWidth < 1024) setBreakpoint('md');
            else setBreakpoint('lg');
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return breakpoint;
};

const slideInLeft = { hidden: { opacity: 0, x: -50 }, visible: i => ({ opacity: 1, x: 0, transition: { delay: i * 0.05 } }) };
const slideInRight = { hidden: { opacity: 0, x: 50 }, visible: i => ({ opacity: 1, x: 0, transition: { delay: i * 0.05 } }) };
const scaleUp = { hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1 } };

function GameUI({ gameEmotions, dispatch }) {
    const [phase, setPhase] = useState(1);
    const [localMatches, setLocalMatches] = useState([]);
    const [localPhase2Matches, setLocalPhase2Matches] = useState([]);
    const [localReflections, setLocalReflections] = useState({});
    const [remainingFaces, setRemainingFaces] = useState([]);
    const [remainingEmotions, setRemainingEmotions] = useState([]);
    const [remainingEmotionsForPhase2, setRemainingEmotionsForPhase2] = useState([]);
    const [remainingSituations, setRemainingSituations] = useState([]);
    const [selectedFace, setSelectedFace] = useState(null);
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [selectedPhase2Emotion, setSelectedPhase2Emotion] = useState(null);
    const [selectedSituation, setSelectedSituation] = useState(null);

    const breakpoint = useBreakpoint();
    const isSmallScreen = breakpoint === 'sm' || breakpoint === 'md';

    useEffect(() => {
        if (gameEmotions && gameEmotions.length > 0) {
            setPhase(1);
            setLocalMatches([]);
            setLocalPhase2Matches([]);
            setLocalReflections({});
            setRemainingFaces(gameEmotions);
            setRemainingEmotions(shuffleArray([...gameEmotions]));
        }
    }, [gameEmotions]);

    useEffect(() => {
        if(phase === 1 && selectedFace && selectedEmotion) {
            setLocalMatches(p => [...p, {face: selectedFace, emotion: selectedEmotion, isCorrect: selectedFace.id === selectedEmotion.id}]);
            setRemainingFaces(p => p.filter(f => f.id !== selectedFace.id));
            setRemainingEmotions(p => p.filter(e => e.id !== selectedEmotion.id));
            setSelectedFace(null); setSelectedEmotion(null);
        }
    }, [selectedFace, selectedEmotion, phase]);

    useEffect(() => {
        if(phase === 2 && selectedPhase2Emotion && selectedSituation) {
            setLocalPhase2Matches(p => [...p, {emotion: selectedPhase2Emotion, situation: selectedSituation, isCorrect: selectedPhase2Emotion.id === selectedSituation.id}]);
            setRemainingEmotionsForPhase2(p => p.filter(e => e.id !== selectedPhase2Emotion.id));
            setRemainingSituations(p => p.filter(s => s.id !== selectedSituation.id));
            setSelectedPhase2Emotion(null); setSelectedSituation(null);
        }
    }, [selectedPhase2Emotion, selectedSituation, phase]);
    
    const isSubmitEnabled = (phase === 1 && remainingFaces.length === 0) || (phase === 2 && remainingEmotionsForPhase2.length === 0) || (phase === 3 && gameEmotions.every(e => localReflections[e.id]?.emotion?.trim() && localReflections[e.id]?.situation?.trim()));

    const handleSubmit = () => {
        if (!isSubmitEnabled) return;
        if (phase === 1) {
            setRemainingEmotionsForPhase2(gameEmotions);
            setRemainingSituations(shuffleArray([...gameEmotions]));
            setPhase(2);
        } else if (phase === 2) {
            setPhase(3);
        } else if (phase === 3) {
            dispatch({ type: 'FINISH_GAME', payload: { matches: localMatches, phase2Matches: localPhase2Matches, reflectionAnswers: localReflections } });
        }
    };
    
    const mainMarginClass = phase === 3 ? "mx-4 md:mx-16 lg:mx-32" : "mx-4 md:mx-16 lg:mx-64";

    return (
        <>
            <style>{scrollbarHideStyle}</style>
            <div className="w-full h-full bg-neutral-950 flex flex-col overflow-y-auto lg:overflow-hidden no-scrollbar">
                <GameNav />
                <ProgressTracker currentPhase={phase} />
                <main className={`flex-grow flex flex-col ${mainMarginClass} mb-5 gap-4`}>
                {phase === 1 && (
                 <section className="w-full h-full flex flex-col gap-4">
                    <div className="bg-gray-800/30 rounded-xl p-4 min-h-[200px] lg:h-[45%] lg:min-h-0">
                        {remainingFaces.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full"><AnimatePresence>{remainingFaces.map((face, i) => (<motion.div key={face.id} layout={!isSmallScreen} variants={isSmallScreen ? slideInLeft : scaleUp} initial="hidden" animate="visible" exit="hidden" custom={i} onClick={() => setSelectedFace(face)} className={`bg-gray-900 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] outline outline-1 outline-gray-700 flex flex-col justify-center items-center gap-1 p-2 cursor-pointer transition-all duration-200 ${selectedFace?.id === face.id ? 'outline-yellow-400 outline-2 scale-105' : 'hover:scale-105 hover:outline-gray-500'}`}><span className="text-4xl">{face.face}</span><span className="text-base font-bold text-slate-100">Face {face.id}</span></motion.div>))}</AnimatePresence></div>
                        ) : (<div className="flex items-center justify-center h-full"><h3 className="text-2xl text-gray-500 font-bold">Faces</h3></div>)}
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-4 min-h-[150px] lg:h-[25%] lg:min-h-0">
                        {remainingEmotions.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full"><AnimatePresence>{remainingEmotions.map((emotion, i) => (<motion.div key={emotion.id} layout={!isSmallScreen} variants={isSmallScreen ? slideInRight : scaleUp} initial="hidden" animate="visible" exit="hidden" custom={i} onClick={() => { if (selectedFace) { setSelectedEmotion(emotion); } }} className={`bg-gray-900 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] outline outline-1 outline-gray-700 flex justify-center items-center p-3 md:p-2 transition-all duration-200 ${selectedFace ? 'cursor-pointer hover:scale-105 hover:outline-gray-500' : 'cursor-not-allowed opacity-60'}`}><span className="text-lg font-bold text-slate-100">{emotion.emotion}</span></motion.div>))}</AnimatePresence></div>
                        ) : (<div className="flex items-center justify-center h-full"><h3 className="text-2xl text-gray-500 font-bold">Emotions</h3></div>)}
                    </div>
                    <div className="bg-gray-800/30 rounded-xl p-4 flex-grow lg:h-[30%] flex items-center justify-center">
                        {localMatches.length === 0 ? (<div className="text-white text-2xl font-normal">Your Matches</div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full h-full"><AnimatePresence>{localMatches.map((match, index) => (<motion.div key={index} layout={!isSmallScreen} variants={scaleUp} initial="hidden" animate="visible" className="bg-gray-900 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] outline outline-1 outline-gray-700 flex justify-center items-center p-3 md:p-2"><div className="flex items-center justify-center gap-2 text-slate-100 text-base font-semibold"><span className="text-3xl">{match.face.face}</span><span>⟶</span><span>{match.emotion.emotion}</span></div></motion.div>))}</AnimatePresence></div>)}
                    </div>
                </section>
                )}
                {phase === 2 && (
                    <section className="w-full h-full flex flex-col gap-4">
                         <div className="bg-gray-800/30 rounded-xl p-4 min-h-[200px] lg:h-[45%] lg:min-h-0">
                            {remainingEmotionsForPhase2.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full"><AnimatePresence>{remainingEmotionsForPhase2.map((emotion, i) => (<motion.div key={emotion.id} layout={!isSmallScreen} variants={isSmallScreen ? slideInLeft : scaleUp} initial="hidden" animate="visible" exit="hidden" custom={i} onClick={() => setSelectedPhase2Emotion(emotion)} className={`bg-gray-900 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] outline outline-1 outline-gray-700 flex flex-col justify-center items-center gap-1 p-2 cursor-pointer transition-all duration-200 ${selectedPhase2Emotion?.id === emotion.id ? 'outline-yellow-400 outline-2 scale-105' : 'hover:scale-105 hover:outline-gray-500'}`}><span className="text-4xl">{emotion.face}</span><span className="text-base font-bold text-slate-100">{emotion.emotion}</span></motion.div>))}</AnimatePresence></div>
                            ) : (<div className="flex items-center justify-center h-full"><h3 className="text-2xl text-gray-500 font-bold">Emotions</h3></div>)}
                        </div>
                         <div className="bg-gray-800/30 rounded-xl p-4 min-h-[150px] lg:h-[25%] lg:min-h-0">
                            {remainingSituations.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full"><AnimatePresence>{remainingSituations.map((situation, i) => (<motion.div key={situation.id} layout={!isSmallScreen} variants={isSmallScreen ? slideInRight : scaleUp} initial="hidden" animate="visible" exit="hidden" custom={i} onClick={() => { if (selectedPhase2Emotion) { setSelectedSituation(situation); } }} className={`bg-gray-900 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] outline outline-1 outline-gray-700 flex justify-center items-center p-3 md:p-2 text-center transition-all duration-200 ${selectedPhase2Emotion ? 'cursor-pointer hover:scale-105 hover:outline-gray-500' : 'cursor-not-allowed opacity-60'}`}><span className="text-sm font-bold text-slate-100">{situation.situation}</span></motion.div>))}</AnimatePresence></div>
                            ) : (<div className="flex items-center justify-center h-full"><h3 className="text-2xl text-gray-500 font-bold">Situations</h3></div>)}
                        </div>
                        <div className="bg-gray-800/30 rounded-xl p-4 flex-grow lg:h-[30%] flex items-center justify-center">
                            {localPhase2Matches.length === 0 ? (<div className="text-white text-2xl font-normal">Your Matches</div>) : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full h-full"><AnimatePresence>{localPhase2Matches.map((match, index) => (<motion.div key={index} layout={!isSmallScreen} variants={scaleUp} initial="hidden" animate="visible" className="bg-gray-900 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] outline outline-1 outline-gray-700 flex items-center p-3 md:p-2"><div className="flex items-center justify-start gap-1 text-slate-100 font-semibold w-full text-xs"><span className="text-2xl">{match.emotion.face}</span><span className="font-bold text-xs">{match.emotion.emotion}</span><span className="text-lg mx-1">⟶</span><span className="text-left flex-1">{match.situation.situation}</span></div></motion.div>))}</AnimatePresence></div>)}
                        </div>
                    </section>
                )}
                {phase === 3 && (
                     <section className="w-full h-full">
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                             {gameEmotions.map((emotion, i) => (
                                 <motion.div key={emotion.id} variants={scaleUp} initial="hidden" animate="visible" transition={{delay: i * 0.1}} className="bg-gray-900/80 rounded-xl p-3 flex flex-col gap-2">
                                     <div className="text-center space-y-1"><div className="text-3xl">{emotion.face}</div><div className="text-base font-bold">{emotion.emotion}</div><div className="text-xs text-gray-400">{emotion.situation}</div></div>
                                     <div className="space-y-2 flex-grow flex flex-col mt-2">
                                         <label className="text-xs font-semibold text-gray-300">I think they feel:</label>
                                         <input type="text" placeholder="Enter emotion..." onChange={e => setLocalReflections(p => ({...p, [emotion.id]: {...p[emotion.id], emotion: e.target.value}}))} className="w-full bg-gray-700 text-white rounded-md p-2 text-xs border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                                         <label className="text-xs font-semibold text-gray-300">Because:</label>
                                         <textarea placeholder="Explain the situation..." rows="3" onChange={e => setLocalReflections(p => ({...p, [emotion.id]: {...p[emotion.id], situation: e.target.value}}))} className="w-full bg-gray-700 text-white rounded-md p-2 text-xs border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none flex-grow" />
                                     </div>
                                 </motion.div>
                             ))}
                         </div>
                     </section>
                )}
                </main>
                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={!isSubmitEnabled}><Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" /><span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isSubmitEnabled ? "opacity-50 cursor-not-allowed" : ""}`}>{phase === 3 ? "Complete" : "Submit"}</span></button>
                    </div>
                </footer>
             </div>
        </>
    );
}

function ProgressTracker({ currentPhase }) {
    const instructionText = currentPhase === 1 ? "Match faces to emotions" : currentPhase === 2 ? "Match emotions to situations" : "Complete your reflections";
    const paddingclass = currentPhase === 3 ? "pt-10 pb-6" : "pt-8 pb-6";

    return (
        <div className={`w-full flex flex-col items-center justify-center ${paddingclass} gap-2`}>
            <div className="flex items-center space-x-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${currentPhase === 1 ? 'bg-lime-500' : currentPhase > 1 ? 'bg-lime-500' : 'bg-neutral-400'}`}>
                    {currentPhase > 1 ? '✓' : '1'}
                </div>
                <div className="border-t-2 border-dashed border-white w-[5vw]" style={{ borderImage: "repeating-linear-gradient(to right, white 0, white 10px, transparent 10px, transparent 16px) 1" }}></div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${currentPhase === 2 ? 'bg-lime-500' : currentPhase > 2 ? 'bg-lime-500' : 'bg-neutral-400'}`}>
                    {currentPhase > 2 ? '✓' : '2'}
                </div>
                <div className="border-t-2 border-dashed border-white w-[5vw]" style={{ borderImage: "repeating-linear-gradient(to right, white 0, white 10px, transparent 10px, transparent 16px) 1" }}></div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-semibold transition-colors ${currentPhase === 3 ? 'bg-lime-500' : 'bg-neutral-400'}`}>3</div>
            </div>
            <h2 className="text-slate-100 text-2xl font-bold leading-relaxed text-center">{instructionText}</h2>
        </div>
    );
}

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) { 
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0"><img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" /><img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" /></div>
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">Challenge Complete!</h2>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p><div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center py-3 px-5"><img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" /><span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span></div></div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Insight</p><div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center px-4 text-center"><span className="text-[#FFCC00] inter-font text-xs font-normal">{insight}</span></div></div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0"><img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" /><img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" /></div>
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
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p><div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center py-3 px-5"><img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" /><span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span></div></div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Insight</p><div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center px-4 text-center"><span className="text-[#FFCC00] inter-font text-xs font-normal">{insight}</span></div></div>
                </div>
                <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                    {recommendedSectionTitle && (<button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg">Review "{recommendedSectionTitle}" Notes</button>)}
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex flex-wrap justify-center gap-4 shrink-0"><img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" /><img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" /></div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) { 
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans) => (
                    <div key={ans.idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                        <h3 className="text-lg font-bold text-yellow-300">Scenario {ans.idx + 1}</h3>
                        <div>
                            <p className="font-semibold text-gray-300">Phase 1: Face → Emotion</p>
                            <p className={ans.userAnswers.emotion === ans.correctAnswers.emotion ? 'text-green-300' : 'text-red-300'}>Your Answer: {ans.userAnswers.emotion}</p>
                            {ans.userAnswers.emotion !== ans.correctAnswers.emotion && <p className="text-green-400 text-sm">Correct: {ans.correctAnswers.emotion}</p>}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-300">Phase 2: Emotion → Situation</p>
                            <p className={ans.userAnswers.behavior === ans.correctAnswers.behavior ? 'text-green-300' : 'text-red-300'}>Your Answer: {ans.userAnswers.behavior}</p>
                            {ans.userAnswers.behavior !== ans.correctAnswers.behavior && <p className="text-green-400 text-sm">Correct: {ans.correctAnswers.behavior}</p>}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onBackToResults} className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">Back to Results</button>
        </div>
    );
}
