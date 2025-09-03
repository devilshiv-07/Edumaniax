import React, { useState, useEffect, useReducer } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import { notesCommunication6to8 } from "@/data/notesCommunication6to8.js";

// --- DND-Kit imports ---
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

// --- Import your shared components ---
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';

// --- Helper for hiding scrollbar ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Game Data ---
const allStatements = [
  { id: "1", text: "How about I sit by the window in the morning, and you get it after lunch?", isCorrect: true },
  { id: "2", text: "We could ask the teacher if we can alternate seats every day.", isCorrect: true },
  { id: "3", text: "Let’s both try sitting somewhere else today and see if we like it.", isCorrect: true },
  { id: "4", text: "Fine, I’ll just sit alone then. Don’t talk to me!", isCorrect: false },
  { id: "5", text: "Why do you always have to ruin things?", isCorrect: false },
  { id: "6", text: "I’m never sitting with you again!", isCorrect: false },
  { id: "7", text: "I’ll ask the driver to remove you from the bus.", isCorrect: false },
];

const conversation = [
  { speaker: "Sara", tone: "😤 Frustrated", text: "I always sit by the window! You got it last week, so now it’s my turn.", align: "left" },
  { speaker: "Arjun", tone: "🛡️ Defensive", text: "But I really want to look outside today. It helps me feel calm before the test.", align: "right" },
  { speaker: "Sara", tone: "😢 Hurt", text: "That’s not fair! You just say that every time.", align: "left" },
  { speaker: "Arjun", tone: "😊 Calmer", text: "I didn’t mean to upset you. Maybe we can switch halfway through the ride?", align: "right" },
];

// --- Constants ---
const CORRECT_STATEMENTS_COUNT = allStatements.filter(s => s.isCorrect).length;
const PASSING_THRESHOLD = 0.7;
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'windowSeatWarGameState';

// --- Helper function ---
function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    } if (text.startsWith("`") && text.endsWith("`")) {
        text = text.slice(1, -1).trim();
    } try {
        return JSON.parse(text);
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        return null;
    }
}

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
                <p className="text-gray-300 mt-2">You're a master of compromise!</p>
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
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center px-4 text-center">
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

function ReviewScreen({ droppedAnswers, onBackToResults }) {
    const allCorrectStatements = allStatements.filter(s => s.isCorrect);
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-4xl flex-grow overflow-y-auto no-scrollbar p-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-300 mb-3">Your Choices:</h2>
                        <div className="space-y-3">
                            {droppedAnswers.length > 0 ? droppedAnswers.map(ans => (
                                <div key={ans.id} className={`p-4 rounded-lg border ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'}`}>
                                    <p>{ans.text}</p>
                                </div>
                            )) : <p className="text-gray-500 italic">You didn't select any options.</p>}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-green-400 mb-3">All Correct Solutions:</h2>
                        <div className="space-y-3">
                            {allCorrectStatements.map(s => (
                                <div key={s.id} className="p-4 rounded-lg bg-gray-800 border border-gray-700">
                                    <p>{s.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

// --- DND-Kit Draggable Component ---
const DraggableStatement = React.memo(({ statement }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: statement.id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        visibility: isDragging ? 'hidden' : 'visible',
    };

    return (
        <div ref={setNodeRef} style={{ ...style, touchAction: "none" }} {...listeners} {...attributes}>
            <div className="p-3 bg-gray-800 border border-gray-700 text-white rounded-lg cursor-grab">
                {statement.text}
            </div>
        </div>
    );
});

// --- Presentational Component for the Drag Overlay ---
const StatementItem = React.memo(({ statement }) => {
    return (
        <div className="p-3 bg-gray-800 border border-gray-700 text-white rounded-lg shadow-2xl scale-105">
            {statement.text}
        </div>
    );
});


// --- Game State Management ---
const initialState = { gameState: "intro", score: 0, answers: [], insight: "", recommendedSectionId: null, recommendedSectionTitle: "" };
function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SET_AI_INSIGHT": return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_CONVERSATION": return { ...initialState, gameState: "conversation" };
        case "START_DRAGGING": return { ...state, gameState: "playing" };
        case "SUBMIT_ANSWERS": {
            const { droppedItems } = action.payload;
            const correctCount = droppedItems.filter(item => item.isCorrect).length;
            const incorrectCount = droppedItems.filter(item => !item.isCorrect).length;
            const score = Math.max(0, correctCount - incorrectCount);
            return { ...state, score, answers: droppedItems, gameState: "finished" };
        }
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "conversation" };
        default: return state;
    }
}

// --- Main Game Component ---
const WindowSeatWarGame = () => {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [startTime, setStartTime] = useState(null);

    const [available, setAvailable] = useState(allStatements);
    const [dropped, setDropped] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

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
        if (state.gameState === 'playing' && startTime === null) setStartTime(Date.now());
    }, [state.gameState, startTime]);

    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const correctAnswers = state.answers.filter(a => a.isCorrect);
                const incorrectAnswers = state.answers.filter(a => !a.isCorrect);
                const allCorrectSolutions = allStatements.filter(s => s.isCorrect);
                if (correctAnswers.length === allCorrectSolutions.length && incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You chose all the collaborative and positive solutions.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }
                const prompt = `You are an expert AI tutor. A student has just finished a game on conflict resolution and made mistakes. Your task is to provide targeted feedback. ### CONTEXT ### 1. **Student's Incorrect Selections (Aggressive/Unhelpful Options Chosen):** ${JSON.stringify(incorrectAnswers, null, 2)} 2. **All Available Note Sections for this Module:** ${JSON.stringify(notesCommunication6to8.map(n => ({topicId: n.topicId, title: n.title, content: n.content.substring(0, 200) + '...'})), null, 2)} ### YOUR TWO-STEP TASK ### 1. **Step 1: DETECT.** Analyze the student's mistakes. Did they choose aggressive options or fail to see collaborative ones? Identify the ONE note section that is the best match for their errors. 2. **Step 2: GENERATE.** Based on their performance, provide a short, encouraging, and educational insight (about 25-30 words). Identify the main area of weakness (e.g., "choosing aggressive language," "finding win-win solutions") and suggest reviewing the note section you detected by its 'title'. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the section you identified", "insight": "Your personalized and encouraging feedback message here." }`;
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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Finding peaceful solutions can be tricky. Reviewing the notes can help!", recommendedSectionId: "conflict-resolution-strategies", recommendedSectionTitle: "Conflict Resolution Strategies" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);
    
    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over) return;
        const draggedStatement = allStatements.find(s => s.id === active.id);
        if (!draggedStatement) return;
        if (over.id === 'resolution-box' && available.some(s => s.id === active.id)) {
            setAvailable(prev => prev.filter(s => s.id !== active.id));
            setDropped(prev => [...prev, draggedStatement]);
        }
        if (over.id === 'available-box' && dropped.some(s => s.id === active.id)) {
            setDropped(prev => prev.filter(s => s.id !== active.id));
            setAvailable(prev => [...prev, draggedStatement]);
        }
    };

    const handleSubmit = () => {
        const endTime = Date.now();
        const durationSec = startTime ? (endTime - startTime) / 1000 : 0;
        const correctDropped = dropped.filter(d => d.isCorrect).length;
        const accuracy = CORRECT_STATEMENTS_COUNT > 0 ? (correctDropped / CORRECT_STATEMENTS_COUNT) * 100 : 0;
        updatePerformance({ moduleName: "Communication", topicName: "situationalAwareness", score: state.score, accuracy: accuracy, studyTimeMinutes: durationSec / 60, avgResponseTimeSec: dropped.length > 0 ? durationSec / dropped.length : 0, completed: true });
        if (accuracy >= PASSING_THRESHOLD * 100) completeCommunicationChallenge(3, 0);
        dispatch({ type: "SUBMIT_ANSWERS", payload: { droppedItems: dropped } });
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setDropped([]);
        setAvailable(allStatements);
        setStartTime(null);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=6-8&section=${state.recommendedSectionId}`);
        }
    };
    
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/next-game-path');
    };
    
    const activeDragItem = activeId ? allStatements.find(s => s.id === activeId) : null;

    const renderGameContent = () => {
        if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
        if (state.gameState === "finished") {
            const accuracyScore = Math.round((state.score / CORRECT_STATEMENTS_COUNT) * 100);
            const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
        }
        if (state.gameState === "review") return <ReviewScreen droppedAnswers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
        
        return (
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative">
                <style>{scrollbarHideStyle}</style>
                {state.gameState === "instructions" && <InstructionsScreen onStartGame={() => dispatch({ type: "START_CONVERSATION" })} />}
                <GameNav />
                <main className="flex-1 w-full flex flex-col items-center p-4 overflow-y-auto no-scrollbar">
                    {state.gameState === 'conversation' && (
                        <div className="w-full max-w-3xl">
                            <div className="bg-[rgba(32,47,54,0.5)] rounded-xl p-6 mt-7 shadow-lg space-y-4">
                                <h2 className="text-xl font-semibold text-gray-200 mb-2">🎭 The Argument:</h2>
                                {conversation.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.align === 'right' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-sm px-4 py-3 rounded-xl shadow-md ${msg.align === 'right' ? 'bg-blue-900/50' : 'bg-pink-900/50'}`}>
                                            <div className="text-sm font-semibold text-gray-300 mb-1">{msg.speaker} <span className="ml-1 text-xs font-normal">({msg.tone})</span></div>
                                            <div className="text-base text-white">{msg.text}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {state.gameState === 'playing' && (
                        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                            <div className="w-full max-w-6xl">
                                <p className="text-md mb-4 text-gray-300 max-w-3xl text-center mx-auto">Drag the best resolution options into the box. Find all three correct solutions!</p>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <DroppableZone id="available-box" className="flex-1 bg-[rgba(32,47,54,0.5)] rounded-xl p-4 shadow-md min-h-[300px]">
                                        <h2 className="font-semibold text-md mb-4 text-gray-200">🧩 Available Statements</h2>
                                        <div className="space-y-3">
                                            {available.map((statement) => <DraggableStatement key={statement.id} statement={statement} />)}
                                        </div>
                                    </DroppableZone>
                                    <DroppableZone id="resolution-box" className="flex-1 bg-green-900/30 rounded-xl p-4 shadow-md border-2 border-dashed border-green-400 min-h-[300px]">
                                        <h2 className="font-semibold text-md mb-4 text-gray-200">📥 Resolution Box</h2>
                                        {dropped.length === 0 && <p className="text-gray-500 italic text-center mt-10">Drop resolution statements here...</p>}
                                        <div className="space-y-3">
                                            {dropped.map((statement) => <DraggableStatement key={statement.id} statement={statement} />)}
                                        </div>
                                    </DroppableZone>
                                </div>
                            </div>
                            <DragOverlay>
                                {activeDragItem ? <StatementItem statement={activeDragItem} /> : null}
                            </DragOverlay>
                        </DndContext>
                    )}
                </main>
                <footer className="fixed bottom-0 left-0 w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full cursor-pointer" onClick={state.gameState === 'conversation' ? () => dispatch({ type: 'START_DRAGGING' }) : handleSubmit} disabled={state.gameState === 'playing' && dropped.length === 0}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${(state.gameState === 'playing' && dropped.length === 0) ? "opacity-50" : ""}`}>
                                {state.gameState === 'conversation' ? 'Start' : 'Submit'}
                            </span>
                        </button>
                    </div>
                </footer>
            </div>
        );
    };

    return <>{renderGameContent()}</>;
};

// --- DroppableZone Component ---
function DroppableZone({ id, children, className }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    const style = {
        transition: 'border-color 0.2s ease',
        borderColor: isOver ? '#FFCC00' : undefined,
    };

    return (
        <div ref={setNodeRef} className={className} style={style}>
            {children}
        </div>
    );
}

export default WindowSeatWarGame;