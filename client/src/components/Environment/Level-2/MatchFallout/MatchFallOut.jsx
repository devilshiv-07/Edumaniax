import React, { useState, useEffect, useCallback, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import {
    DndContext,
    closestCenter,
    MouseSensor,
    TouchSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable,
    useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";

// Data and Component Imports
import { notesEnvironment6to8 } from "@/data/notesEnvironment6to8.js";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";

// =============================================================================
// Constants and Configuration
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'matchTheFalloutGameState';

const matchFalloutData = [
    { id: "1", text: "Dumping industrial waste", match: "Aquatic animal death" },
    { id: "2", text: "Plastic usage", match: "Wildlife choking" },
    { id: "3", text: "Over-mining", match: "Soil infertility" },
    { id: "4", text: "Cutting forests", match: "Loss of biodiversity" },
    { id: "5", text: "Excessive pesticide use", match: "Water poisoning and food chain damage" },
];

const PERFECT_SCORE = matchFalloutData.length * 5;
const PASSING_THRESHOLD = 0.7;
const GAME_TIME_LIMIT = 120;
const scrollbarHideStyle = `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;

// =============================================================================
// Helper Functions
// =============================================================================
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

// =============================================================================
// State Management (Reducer)
// =============================================================================
const initialState = {
    gameState: "intro",
    score: 0,
    answers: [],
    timeLeft: GAME_TIME_LIMIT,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE":
            return action.payload;
        case "SHOW_INSTRUCTIONS":
            return { ...state, gameState: "instructions" };
        case "START_GAME":
            return { ...initialState, gameState: "playing" };
        case "SUBMIT_ANSWERS": {
            const { slots } = action.payload;
            let currentScore = 0;
            const newAnswers = matchFalloutData.map(item => {
                const userSlot = slots.find(s => s.id === item.id);
                const userAnswer = userSlot ? userSlot.content : null;
                const isCorrect = userAnswer === item.match;
                if (isCorrect) {
                    currentScore += 5;
                }
                return { cause: item.text, userAnswer, correctAnswer: item.match, isCorrect };
            });
            return { ...state, score: currentScore, answers: newAnswers, gameState: "finished" };
        }
        case "TICK":
            if (state.timeLeft <= 1) {
                return { ...state, timeLeft: 0, gameState: "finished_timeout" };
            }
            return { ...state, timeLeft: state.timeLeft - 1 };
        case "REVIEW_GAME":
            return { ...state, gameState: "review" };
        case "BACK_TO_FINISH":
            return { ...state, gameState: "finished" };
        case "RESET_GAME":
            return { ...initialState, gameState: "playing" };
        case "SET_AI_INSIGHT":
            return { ...state, ...action.payload };
        default:
            return state;
    }
}

// =============================================================================
// UI Components
// =============================================================================
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
                <div className="mt-6 flex flex-col sm:flex-row sm:items-stretch gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] text-xs font-normal">{insight}</span>
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
                <div className="mt-6 flex flex-col sm:flex-row sm:items-stretch gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] flex-grow rounded-lg flex items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] text-xs font-normal">{insight}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                    {recommendedSectionTitle && (
                        <button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg">
                            Review "{recommendedSectionTitle}" Notes
                        </button>
                    )}
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) { return (<div className="w-full h-screen bg-[#0A160E] text-white p-4 flex flex-col items-center"><h1 className="text-3xl lg:text-[4.4vh] font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1><div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto p-2">{answers.map((ans) => (<div key={ans.cause} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}><p className="text-gray-300 text-base lg:text-[1.7vh] mb-2 font-bold">Cause: {ans.cause}</p><div className="text-sm space-y-1"><p className="font-semibold">Your Match:</p><p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>{ans.userAnswer || "Not Answered"}</p>{!ans.isCorrect && (<><p className="font-semibold pt-2">Correct Match:</p><p className="font-mono text-green-300">{ans.correctAnswer}</p></>)}</div></div>))}</div><button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">Back to Results</button></div>); }
const DraggableCard = React.memo(({ id, content }) => { const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id }); const style = { transform: transform ? CSS.Transform.toString(transform) : undefined, zIndex: isDragging ? 1000 : 'auto', visibility: isDragging ? 'hidden' : 'visible', touchAction: 'none', }; return (<div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex min-h-[4rem] md:min-h-[5rem] w-full items-center justify-center p-2 rounded-lg relative cursor-grab bg-[#131f24] border border-[#37464f] shadow-md"><span className="font-['Inter'] text-sm md:text-base font-medium text-[#f1f7fb] text-center">{content || id}</span></div>); });
const DroppableSlot = React.memo(({ id, labelText, content }) => { const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id }); const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({ id, disabled: !content }); const combinedRef = useCallback(node => { setDroppableNodeRef(node); if (content) setDraggableNodeRef(node); }, [setDroppableNodeRef, setDraggableNodeRef, content]); const style = { transform: transform ? CSS.Transform.toString(transform) : undefined, zIndex: isDragging ? 1000 : 'auto', visibility: isDragging ? 'hidden' : 'visible', touchAction: content ? 'none' : 'auto', }; return (<div ref={combinedRef} style={style} {...(content ? attributes : {})} {...(content ? listeners : {})} className="flex min-h-[4rem] md:min-h-[5rem] w-full items-center justify-center rounded-lg relative">{content ? (<div className="flex min-h-[4rem] md:min-h-[5rem] h-full w-full items-center justify-center p-2 rounded-lg relative cursor-grab bg-[#131f24] border border-[#37464f] shadow-md"><span className="font-['Inter'] text-sm md:text-base font-medium text-[#f1f7fb] text-center">{content}</span></div>) : (<div className={`flex min-h-[4rem] md:min-h-[5rem] h-full w-full items-center justify-center text-center p-2 rounded-lg bg-black/30 border-2 border-dashed ${isOver ? 'border-yellow-400' : 'border-[#37464f]'} transition-colors`}><span className="font-['Inter'] text-sm md:text-base font-medium text-gray-400">{labelText}</span></div>)}</div>); });
const EmptyPlaceholder = React.memo(({ id }) => { const { setNodeRef } = useDroppable({ id }); return <div ref={setNodeRef} className="flex min-h-[4rem] md:min-h-[5rem] w-full rounded-lg bg-black/20" />; });


// =============================================================================
// Main Game Component
// =============================================================================
const MatchTheFallout = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    
    // Kept your original useState hooks for DnD logic to avoid breaking it
    const [availableFallouts, setAvailableFallouts] = useState([]);
    const [slots, setSlots] = useState([]);
    const [activeId, setActiveId] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } })
    );

    const shuffle = useCallback((array) => [...array].sort(() => Math.random() - 0.5), []);
    
    const handleSubmit = useCallback(() => {
        dispatch({ type: "SUBMIT_ANSWERS", payload: { slots } });
    }, [slots]);

    // This effect now correctly initializes the DnD state when the game starts
    useEffect(() => {
        if (state.gameState === "playing") {
            setAvailableFallouts(shuffle(matchFalloutData.map(item => item.match)));
            setSlots(matchFalloutData.map(item => ({ id: item.id, labelText: item.text, content: null })));
        }
    }, [state.gameState, shuffle]);

    // Timer and timeout logic
    useEffect(() => {
        if (state.gameState === "playing" && state.timeLeft > 0) {
            const timerId = setInterval(() => dispatch({ type: "TICK" }), 1000);
            return () => clearInterval(timerId);
        } else if (state.gameState === "playing" && state.timeLeft <= 0) {
            handleSubmit();
        }
    }, [state.gameState, state.timeLeft, handleSubmit]);

    // Session persistence logic
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(savedStateJSON) });
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);

    // AI insight generation logic
    useEffect(() => {
        if ((state.gameState === "finished" || state.gameState === "finished_timeout") && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your matches...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectMatches = state.answers.filter(a => !a.isCorrect);
                if (incorrectMatches.length === 0 && state.answers.length > 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect match! Your understanding of environmental cause and effect is excellent.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }
                const prompt = `
You are an AI tutor. A student played a game matching environmental problems to their consequences and made some mistakes.
### CONTEXT ###
1.  **Student's Incorrect Matches:**
    ${JSON.stringify(incorrectMatches.map(m => ({ cause: m.cause, their_incorrect_match: m.userAnswer, correct_match_was: m.correctAnswer })), null, 2)}
2.  **All Available Note Sections for this Module:**
    ${JSON.stringify(notesEnvironment6to8, null, 2)}
### YOUR TWO-STEP TASK ###
1.  **Step 1: DETECT.** Analyze the incorrect matches. Identify the common environmental theme (e.g., pollution, deforestation, resource depletion) the student is struggling with. Find the ONE note section that best addresses this conceptual weakness.
2.  **Step 2: GENERATE.** Provide a short, encouraging insight (25-30 words). Explain the core concept they might be missing (e.g., "Remember that industrial actions often affect water..."). Recommend they review the detected note section by its 'title' to strengthen their knowledge and some technique they can use to remember it better.
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the most relevant section.",
  "insight": "Your personalized and encouraging feedback message here."
}`;
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesEnvironment6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" } });
                    } else { throw new Error("Failed to parse AI response."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Reviewing the correct matches is a great way to learn more about environmental impacts.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);
    
    // Your original drag-and-drop handlers, untouched
    const handleDragStart = (event) => setActiveId(event.active.id);
    const handleDragEnd = (event) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);
        const newSlots = [...slots];
        const newAvailableFallouts = [...availableFallouts];
        const isDraggingFromAvailable = newAvailableFallouts.includes(activeIdStr);
        const sourceSlotIndex = slots.findIndex(s => s.id === activeIdStr);
        const isDraggingFromSlot = sourceSlotIndex !== -1;
        const draggedContent = isDraggingFromAvailable ? activeIdStr : newSlots[sourceSlotIndex]?.content;
        if (!draggedContent) return;
        const targetSlotIndex = slots.findIndex(s => s.id === overIdStr);
        const isDroppingOnSlot = targetSlotIndex !== -1;
        const isDroppingOnAvailable = overIdStr.startsWith('available-placeholder');
        if (isDroppingOnSlot) {
            const contentInTargetSlot = newSlots[targetSlotIndex].content;
            if (isDraggingFromSlot) {
                newSlots[sourceSlotIndex].content = contentInTargetSlot;
            } else {
                const indexToRemove = newAvailableFallouts.indexOf(draggedContent);
                if (indexToRemove > -1) newAvailableFallouts.splice(indexToRemove, 1);
                if (contentInTargetSlot) newAvailableFallouts.push(contentInTargetSlot);
            }
            newSlots[targetSlotIndex].content = draggedContent;
        } else if (isDroppingOnAvailable) {
            if (isDraggingFromSlot) {
                newSlots[sourceSlotIndex].content = null;
                if (!newAvailableFallouts.includes(draggedContent)) newAvailableFallouts.push(draggedContent);
            }
        }
        setSlots(newSlots);
        setAvailableFallouts(newAvailableFallouts);
    };

    // New navigation handlers
    const handleNavigateToSection = () => { if (state.recommendedSectionId) { sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state)); navigate(`/environmental/notes?grade=6-8&section=${state.recommendedSectionId}`); }};
    const handlePlayAgain = () => { sessionStorage.removeItem(SESSION_STORAGE_KEY); dispatch({ type: 'RESET_GAME' }); };
    const handleContinue = () => { sessionStorage.removeItem(SESSION_STORAGE_KEY); navigate('/climate-pledge'); };
    
    // Render logic starts here
    if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    if (state.gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
    
    if (state.gameState === "finished" || state.gameState === "finished_timeout") {
        const accuracyScore = state.answers.length > 0 ? Math.round((state.score / PERFECT_SCORE) * 100) : 0;
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({type: 'REVIEW_GAME'})} onContinue={handleContinue} />
            : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({type: 'REVIEW_GAME'})} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
    }
    if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    
    const isSubmitEnabled = availableFallouts.length === 0;
    const activeContent = activeId ? (availableFallouts.includes(String(activeId)) ? String(activeId) : slots.find(s => s.id === String(activeId))?.content) : null;
    
    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col items-center pt-28 md:pt-[10vh] md:justify-center">
            <GameNav timeLeft={state.timeLeft} />
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col md:flex-row w-full max-w-5xl gap-8 px-5 md:px-7 my-10 mt-0 md:mt-10">
                    <div className="w-full md:w-1/2 flex flex-col gap-3 p-4 bg-[rgba(32,47,54,0.3)] rounded-xl border border-[#37464f]">
                        {availableFallouts.map(fallout => <DraggableCard key={fallout} id={fallout} content={fallout} />)}
                        {Array.from({ length: matchFalloutData.length - availableFallouts.length }).map((_, i) => <EmptyPlaceholder key={i} id={`available-placeholder-${i}`} />)}
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col gap-3 p-4 bg-[rgba(32,47,54,0.3)] rounded-xl border border-[#37464f]">
                         {slots.map(slot => <DroppableSlot key={slot.id} id={slot.id} labelText={slot.labelText} content={slot.content} />)}
                    </div>
                </div>
                <DragOverlay>
                    {activeId && activeContent ? <DraggableCard id={activeId} content={activeContent} /> : null}
                </DragOverlay>
            </DndContext>
            <div className="w-full bg-[#28343A] flex justify-center items-center px-4 mt-auto py-4 ">
                <div className="w-full max-w-xs h-14">
                    <button className="relative w-full h-full cursor-pointer disabled:opacity-50" onClick={handleSubmit} disabled={!isSubmitEnabled}>
                        <Checknow topGradientColor={"#09be43"} bottomGradientColor={"#068F36"} width="100%" height="100%" />
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-2xl text-white [text-shadow:0_2px_0_#000]">Check Now</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchTheFallout;