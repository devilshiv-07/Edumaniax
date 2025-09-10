import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, pointerWithin, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
// Note: These imports are placeholders. You must have these components defined in your project.
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';
import { notesCommunication11to12 } from "@/data/notesCommunication11to12.js";

// --- START: NEW GAME DATA FOR DIGITAL DILEMMA ---
const decisionTreeSteps = [
    {
        id: 'q1',
        question: "What do you do first?",
        options: ["Forward it to a friend", "Message the student privately", "Report it in the class group"],
        correct: 1,
        explanation: "Messaging privately is the most constructive first step. It avoids public shaming and opens a direct, respectful dialogue."
    },
    {
        id: 'q2',
        question: "How do you begin the conversation?",
        options: ["“That meme’s really messed up.”", "“Hey, I wanted to check in about the meme you posted…”", "“You’re going to get into trouble.”"],
        correct: 1,
        explanation: "A neutral, non-accusatory opening like 'checking in' is more likely to lead to a productive conversation rather than making the person defensive."
    },
    {
        id: 'q3',
        question: "What’s your closing line?",
        options: ["“Let’s remove the post and avoid hurting anyone.”", "“You should apologize or I’ll tell the teacher.”", "“Just delete it. It’s embarrassing.”"],
        correct: 0,
        explanation: "Focusing on a collaborative solution ('Let’s remove the post') and the impact on others ('avoid hurting anyone') is the most empathetic and effective approach."
    },
];

const etiquetteMatches = [
    { id: 1, principle: "Think before you share", example: "I paused before reposting a screenshot of someone’s private message." },
    { id: 2, principle: "Assume it’s public", example: "I avoided venting about school on Twitter." },
    { id: 3, principle: "Be constructive", example: "I gave polite feedback on someone’s project instead of mocking them." },
];
// --- END: NEW GAME DATA ---


// --- GAME CONFIGURATION (Updated) ---
const PERFECT_SCORE = decisionTreeSteps.length + etiquetteMatches.length; // 6
const PASSING_THRESHOLD = 0.8; // 80%
const GAME_DURATION_SECONDS = 420; // 7 minutes
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'digitalDilemmaGameState';

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Helper Functions ---
const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

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


// --- Draggable/Droppable Components ---
const DraggableExample = React.memo(({ item }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id, data: { ...item, type: 'example' } });
    
    // CHANGE: Opacity is now 0 when dragging to remove the "ghost card"
    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-3 bg-[#2a3b42] border-2 border-cyan-700 rounded-lg shadow-md cursor-grab touch-none text-sm font-medium text-gray-200 hover:bg-cyan-900/50 transition-colors">
            {item.example}
        </div>
    );
});

const DroppablePrinciple = React.memo(({ principle, onRemove, matchedItem }) => {
    const { setNodeRef, isOver } = useDroppable({ id: principle });
    return (
        <div className="flex-1 flex flex-col gap-4 p-4 border-2 border-dashed border-[#3F4B48] rounded-xl bg-gray-900/50 min-h-[200px] transition-colors duration-200">
            <h2 className="text-center text-lg font-bold text-yellow-400 lilita-one-regular">{principle}</h2>
            <div ref={setNodeRef} className={`flex-grow flex flex-col gap-2 p-2 rounded-lg ${isOver ? 'bg-yellow-400/20 border-yellow-400' : 'bg-transparent border-transparent'} border-2 border-dashed`}>
                {matchedItem ? (
                    <div className="w-full text-center relative p-3 bg-green-800/60 rounded-lg shadow-inner border border-green-500 text-gray-100 font-medium">
                        {matchedItem.example}
                        <button onClick={() => onRemove(principle, matchedItem)} className="absolute -top-2 -right-2 text-xs bg-red-800 text-red-200 w-5 h-5 rounded-full hover:bg-red-700 transition flex items-center justify-center font-bold">X</button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full"><span className="text-slate-100/50 text-sm font-medium">Drop example here</span></div>
                )}
            </div>
        </div>
    );
});

// --- Victory/Losing Screens ---
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
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p><div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center py-3 px-5"><img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" /><span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span></div></div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Insight</p><div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center px-4 text-center"><span className="text-[#FFCC00] lilita-one-regular text-xs font-normal">{insight}</span></div></div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0"><img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /><img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /></div>
        </div>
    );
}

function LosingScreen({ onPlayAgain, onViewFeedback, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p><p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center mb-6">Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p><div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center py-3 px-5"><img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" /><span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span></div></div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Insight</p><div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center px-4 text-center"><span className="text-[#FFCC00] inter-font text-[11px] font-normal">{insight}</span></div></div>
                </div>
                {recommendedSectionTitle && (<div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center"><button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 hover:bg-green-700 border-b-4 border-green-800 active:border-transparent shadow-lg">Review "{recommendedSectionTitle}" Notes</button></div>)}
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex flex-wrap justify-center gap-4 shrink-0"><img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /><img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /></div>
        </div>
    );
}

// --- REVIEW SCREEN ---
function ReviewScreen({ answers, onBackToResults }) {
    const CheckIcon = () => <svg className="w-5 h-5 text-green-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
    const CrossIcon = () => <svg className="w-5 h-5 text-red-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-shrink-0 text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular text-yellow-400">Review Your Choices</h1>
                <p className="text-gray-400 mt-1">See how you handled the digital dilemma.</p>
            </div>
            <div className="w-full max-w-5xl mx-auto flex-1 overflow-y-auto p-2 no-scrollbar space-y-6">
                <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700">
                    <h2 className="text-xl font-bold text-yellow-300 lilita-one-regular border-b-2 border-yellow-300/30 pb-2 mb-4">Decision Breakdown</h2>
                    {decisionTreeSteps.map((step, index) => {
                        const userAnswerIndex = answers.decisions[step.id];
                        const isCorrect = userAnswerIndex === step.correct;
                        return (
                            <div key={step.id} className={`p-3 rounded-md mt-3 ${isCorrect ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                                <h3 className="font-semibold text-gray-200">{index + 1}. {step.question}</h3>
                                <div className="flex items-start mt-2 p-2 rounded-md bg-black/20">
                                    {isCorrect ? <CheckIcon /> : <CrossIcon />}
                                    <div><p>Your Answer: "{step.options[userAnswerIndex]}"</p>{!isCorrect && <p className="text-green-300 mt-1">Correct Answer: "{step.options[step.correct]}"</p>}</div>
                                </div>
                                <p className="text-xs text-yellow-300 mt-2 pl-8"><em>{step.explanation}</em></p>
                            </div>
                        );
                    })}
                </div>
                <div className="p-4 rounded-xl bg-gray-800/60 border border-gray-700">
                    <h2 className="text-xl font-bold text-yellow-300 lilita-one-regular border-b-2 border-yellow-300/30 pb-2 mb-4">Etiquette Matching Review</h2>
                    {etiquetteMatches.map(item => {
                        const userMatchExample = answers.matches[item.principle]?.example;
                        const isCorrect = userMatchExample === item.example;
                        return (
                            <div key={item.id} className={`flex items-start p-2 mt-2 rounded-md ${isCorrect ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                                {isCorrect ? <CheckIcon /> : <CrossIcon />}
                                <div><p className="font-semibold">{item.principle}</p><p className="text-sm">Your Match: "{userMatchExample || 'No match'}"</p>{!isCorrect && <p className="text-sm text-green-300 mt-1">Correct Match: "{item.example}"</p>}</div>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="flex-shrink-0 pt-6 text-center">
                <button onClick={onBackToResults} className="px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors border-b-4 border-yellow-800 active:border-transparent shadow-lg">Back to Results</button>
            </div>
        </div>
    );
}

// --- GAME REDUCER ---
const initialState = {
    gameState: "intro", // "intro", "instructions", "playing", "finished", "review"
    gamePhase: "decision",
    availableExamples: shuffleArray(etiquetteMatches),
    selectedDecisions: {},
    matches: {},
    timeLeft: GAME_DURATION_SECONDS,
    totalScore: 0,
    answers: null,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: ""
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing", availableExamples: shuffleArray(etiquetteMatches) };
        case "TICK_TIMER":
            if (state.timeLeft <= 1) return { ...state, timeLeft: 0, gameState: "finished", answers: { decisions: state.selectedDecisions, matches: state.matches } };
            return { ...state, timeLeft: state.timeLeft - 1 };
        case "SELECT_DECISION": return { ...state, selectedDecisions: { ...state.selectedDecisions, [action.payload.questionId]: action.payload.optionIndex } };
        case "SUBMIT_DECISIONS": return { ...state, gamePhase: 'matching' };
        case "DROP_MATCH": {
            const { principle, item } = action.payload;
            const newMatches = { ...state.matches, [principle]: item };
            const newAvailable = state.availableExamples.filter(ex => ex.id !== item.id);
            Object.keys(newMatches).forEach(key => { if (key !== principle && newMatches[key]?.id === item.id) { delete newMatches[key]; } });
            return { ...state, matches: newMatches, availableExamples: newAvailable };
        }
        case "REMOVE_MATCH": {
            const { principle, item } = action.payload;
            const newMatches = { ...state.matches };
            delete newMatches[principle];
            const newAvailable = [...state.availableExamples, item];
            return { ...state, matches: newMatches, availableExamples: newAvailable };
        }
        case "FINISH_GAME": {
            let score = 0;
            decisionTreeSteps.forEach(step => { if (state.selectedDecisions[step.id] === step.correct) score++; });
            etiquetteMatches.forEach(item => { if (state.matches[item.principle]?.example === item.example) score++; });
            return { ...state, gameState: "finished", totalScore: score, answers: { decisions: state.selectedDecisions, matches: state.matches } };
        }
        case "SET_AI_INSIGHT": return { ...state, ...action.payload };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing", availableExamples: shuffleArray(etiquetteMatches) };
        default: return state;
    }
}


const DigitalDilemmaChallenge = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [activeItem, setActiveItem] = useState(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    );

    useEffect(() => {
        if (state.gameState !== 'playing') return;
        const timer = setInterval(() => { dispatch({ type: 'TICK_TIMER' }); }, 1000);
        return () => clearInterval(timer);
    }, [state.gameState]);

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(savedStateJSON) });
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) { console.error("Failed to parse saved game state:", error); }
        }
    }, []);

    // AI INSIGHT EFFECT
    useEffect(() => {
        if (state.gameState === "finished" && !state.insight && state.answers) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });

                const formatDecisions = () => decisionTreeSteps.map(step => `For "${step.question}", user chose "${step.options[state.answers.decisions[step.id]]}". Correct was "${step.options[step.correct]}".`).join('\n');
                const formatMatches = () => etiquetteMatches.map(item => `For principle "${item.principle}", user matched "${state.answers.matches[item.principle]?.example || 'nothing'}". Correct was "${item.example}".`).join('\n');

                const prompt = `You are an AI tutor for a game on digital etiquette. A student just finished. Analyze their performance and provide feedback.
                ### CONTEXT ###
                The game had two parts: making decisions in a scenario about a bad meme, and matching etiquette principles.
                1. **Student's Decisions:**
                ${formatDecisions()}
                2. **Student's Matches:**
                ${formatMatches()}
                3. **Student's Final Score:** ${state.totalScore}/${PERFECT_SCORE}
                4. **Available Note Sections:** ${JSON.stringify(notesCommunication11to12.map(n => ({ topicId: n.topicId, title: n.title })), null, 2)}
                ### YOUR TASK ###
                1. **DETECT:** Based on incorrect answers, find the single biggest weakness. (e.g., Was it being too confrontational? Did they fail to understand a specific principle like 'Be Constructive'?) Find the ONE best-matching note section from the list.
                2. **GENERATE:** Provide a short, encouraging insight (25-30 words) pinpointing this weakness.
                ### OUTPUT FORMAT ###
                Return ONLY a raw JSON object: { "detectedTopicId": "...", "insight": "..." }`;

                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication11to12.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" } });
                    } else { throw new Error("Failed to parse response from AI."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Great effort! To improve, focus on choosing options that are respectful and aim to solve problems privately first.", recommendedSectionId: 'effective-communication', recommendedSectionTitle: "Effective Communication" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight, state.totalScore]);

    const handleDragStart = (event) => setActiveItem(event.active.data.current);
    const handleDragEnd = (event) => {
        const { over, active } = event;
        if (over && typeof over.id === 'string' && etiquetteMatches.some(e => e.principle === over.id)) {
            dispatch({ type: 'DROP_MATCH', payload: { principle: over.id, item: active.data.current } });
        }
        setActiveItem(null);
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=11-12&section=${state.recommendedSectionId}`);
        }
    };
    
    if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    if (state.gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: 'START_GAME' })} />;
    if (state.gameState === "finished") {
        const accuracyScore = Math.round((state.totalScore / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={() => navigate('/communications')} />
            : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={() => dispatch({ type: 'RESET_GAME' })} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
    }
    if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;

    // --- MAIN GAMEPLAY RENDER ---
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col inter-font relative text-white">
            <style>{scrollbarHideStyle}</style>
            <GameNav />

            
            <main className="flex-1 w-full flex flex-col items-center justify-center p-4 overflow-y-auto no-scrollbar">

                {state.gamePhase === 'decision' && (
                    <div className="w-full max-w-5xl flex flex-col gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
                        <div className="p-3 bg-gray-900 rounded-lg border border-cyan-500/30">
                            <h2 className="text-lg font-bold text-yellow-300 lilita-one-regular">The Scenario</h2>
                            <p className="text-sm text-gray-300">A classmate posted a sarcastic meme targeting a teacher on your school group. It’s going viral. Choose how to handle this respectfully.</p>
                        </div>
                        {decisionTreeSteps.map((step) => (
                            <div key={step.id} className="p-3 bg-gray-900 rounded-lg">
                                <h3 className="font-semibold text-cyan-400 mb-3">{step.question}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {step.options.map((opt, idx) => (
                                        <button key={idx} onClick={() => dispatch({ type: 'SELECT_DECISION', payload: { questionId: step.id, optionIndex: idx } })}
                                            className={`p-2 rounded-md text-sm text-center transition-all border-2 ${state.selectedDecisions[step.id] === idx ? 'bg-yellow-400 border-yellow-300 text-black font-bold scale-105' : 'bg-[#2a3b42] border-cyan-700/50 hover:bg-cyan-900/50'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {state.gamePhase === 'matching' && (
                    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                        <div className="w-full max-w-7xl mx-auto flex flex-col gap-4">
                            <div className="w-full flex flex-col md:flex-row gap-4">
                                {etiquetteMatches.map(({ principle }) => (
                                    <DroppablePrinciple key={principle} principle={principle} matchedItem={state.matches[principle]} onRemove={(p, item) => dispatch({ type: 'REMOVE_MATCH', payload: { principle: p, item: item } })} />
                                ))}
                            </div>
                            <div className="w-full p-4 bg-gray-800/50 border-2 border-[#3F4B48] rounded-xl">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3 text-center lilita-one-regular">Available Examples</h3>
                                {state.availableExamples.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {state.availableExamples.map((item) => <DraggableExample key={item.id} item={item} />)}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-400 p-4">All examples have been matched!</p>
                                )}
                            </div>
                        </div>
                        <DragOverlay>{activeItem && <div className="p-3 bg-[#3a505a] border-2 border-yellow-400 rounded-lg shadow-2xl text-sm font-medium text-white scale-105">{activeItem.example}</div>}</DragOverlay>
                    </DndContext>
                )}
            </main>
            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    {state.gamePhase === 'decision' ? (
                        <button className="relative w-full h-full" onClick={() => dispatch({ type: 'SUBMIT_DECISIONS' })} disabled={Object.keys(state.selectedDecisions).length < decisionTreeSteps.length}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            {/* CHANGE: Button text is now always "Submit" */}
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl text-white [text-shadow:0_3px_0_#000]">
                                Submit
                            </span>
                        </button>
                    ) : (
                        <button className="relative w-full h-full" onClick={() => dispatch({ type: 'FINISH_GAME' })}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl text-white [text-shadow:0_3px_0_#000]">Finish Game</span>
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default DigitalDilemmaChallenge;