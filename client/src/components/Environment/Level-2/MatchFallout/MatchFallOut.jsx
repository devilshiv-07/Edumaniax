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

// Import your components
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";

// =============================================================================
// Game Data & Config
// =============================================================================
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

// =============================================================================
// Reusable End-Screen Components (Responsive)
// =============================================================================
function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
  const { width, height } = useWindowSize();
  return (
    <>
      <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
      <div className="flex flex-col justify-between h-screen bg-[#0A160E] text-center">
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          <div className="relative w-48 h-48 lg:w-[17.7vw] lg:h-[28.4vh] flex items-center justify-center">
            <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
            <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
          </div>
          <h2 className="text-yellow-400 lilita-one-regular text-3xl lg:text-[4vh] font-bold mt-6">Challenge Complete!</h2>
          <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
              <p className="text-black text-sm font-bold my-2">TOTAL ACCURACY</p>
              <div className="bg-[#131F24] w-full min-h-[5rem] lg:h-[8.8vh] rounded-lg flex items-center justify-center p-2">
                <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2 lg:w-[1.6vw] lg:h-[2.6vh]" />
                <span className="text-[#09BE43] text-2xl lg:text-[2.7vh] font-extrabold">{accuracyScore}%</span>
              </div>
            </div>
            <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
              <p className="text-black text-sm font-bold my-2">INSIGHT</p>
              <div className="bg-[#131F24] w-full min-h-[5rem] lg:h-[8.8vh] rounded-lg flex items-center justify-center p-3 text-center">
                <span className="text-[#FFCC00] lilita-one-regular text-sm lg:text-[1.5vh] font-medium italic">{insight}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-4 flex justify-center gap-4">
          <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-12 lg:h-[7.7vh] w-auto object-contain hover:scale-105" />
          <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-12 lg:h-[7.7vh] w-auto object-contain hover:scale-105" />
        </div>
      </div>
    </>
  );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore }) {
    return (
        <div className="flex flex-col justify-between h-screen bg-[#0A160E] text-center">
            <div className="flex flex-col items-center justify-center flex-1 p-4">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 lg:w-[17.7vw] h-auto mb-6" />
                <p className="text-yellow-400 lilita-one-regular text-2xl lg:text-[3.3vh] font-semibold text-center">Oops! That was close! Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-lg">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2">TOTAL ACCURACY</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] lg:h-[8.8vh] rounded-lg flex items-center justify-center p-2">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2 lg:w-[1.6vw] lg:h-[2.6vh]" />
                            <span className="text-red-500 text-2xl lg:text-[2.7vh] font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2">INSIGHT</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] lg:h-[8.8vh] rounded-lg flex items-center justify-center p-3 text-center">
                            <span className="text-[#FFCC00] lilita-one-regular text-sm lg:text-[1.5vh] font-medium italic">{insight}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-4 flex justify-center items-center gap-4 flex-wrap">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-12 lg:h-[7.7vh] w-auto object-contain hover:scale-105" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-12 lg:h-[7.7vh] w-auto object-contain hover:scale-105" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-12 lg:h-[7.7vh] w-auto object-contain hover:scale-105" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] text-white p-4 flex flex-col items-center">
            <h1 className="text-3xl lg:text-[4.4vh] font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto p-2">
                {answers.map((ans) => (
                    <div key={ans.cause} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        <p className="text-gray-300 text-base lg:text-[1.7vh] mb-2 font-bold">Cause: {ans.cause}</p>
                        <div className="text-sm lg:text-[1.5vh] space-y-1">
                            <p className="font-semibold">Your Match:</p>
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>{ans.userAnswer || "Not Answered"}</p>
                            {!ans.isCorrect && (
                                <>
                                    <p className="font-semibold pt-2">Correct Match:</p>
                                    <p className="font-mono text-green-300">{ans.correctAnswer}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button 
                onClick={onBackToResults} 
                className="
                    mt-6 px-8 py-3 
                    bg-yellow-600 
                    text-lg text-white
                    lilita-one-regular
                    rounded-md
                    hover:bg-yellow-700 
                    transition-colors 
                    flex-shrink-0
                    border-b-4 border-yellow-800 active:border-b-0
                    shadow-lg
                "
            >
                Back to Results
            </button>
        </div>
    );
}

// =============================================================================
// DnD Components (Responsive with Touch Support)
// =============================================================================
const DraggableCard = React.memo(({ id, content }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        zIndex: isDragging ? 1000 : 'auto',
        // FIX: Hide the original element when dragging to prevent "duplicate" glitch
        visibility: isDragging ? 'hidden' : 'visible',
        touchAction: 'none',
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex min-h-[4rem] md:min-h-[5rem] w-full items-center justify-center p-2 rounded-lg relative cursor-grab bg-[#131f24] border border-[#37464f] shadow-md">
            <span className="font-['Inter'] text-sm md:text-base font-medium text-[#f1f7fb] text-center">{content || id}</span>
        </div>
    );
});

const DroppableSlot = React.memo(({ id, labelText, content }) => {
    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id });
    const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({ id, disabled: !content });
    
    const combinedRef = useCallback(node => {
        setDroppableNodeRef(node);
        if (content) setDraggableNodeRef(node);
    }, [setDroppableNodeRef, setDraggableNodeRef, content]);

    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        zIndex: isDragging ? 1000 : 'auto',
        // FIX: Hide the original element when dragging from a slot
        visibility: isDragging ? 'hidden' : 'visible',
        touchAction: content ? 'none' : 'auto',
    };
    
    return (
        <div ref={combinedRef} style={style} {...(content ? attributes : {})} {...(content ? listeners : {})} className="flex min-h-[4rem] md:min-h-[5rem] w-full items-center justify-center rounded-lg relative">
            {content ? (
                <div className="flex min-h-[4rem] md:min-h-[5rem] h-full w-full items-center justify-center p-2 rounded-lg relative cursor-grab bg-[#131f24] border border-[#37464f] shadow-md">
                    <span className="font-['Inter'] text-sm md:text-base font-medium text-[#f1f7fb] text-center">{content}</span>
                </div>
            ) : (
                // FIX: Added min-height to the empty slot to ensure it matches card size
                <div className={`flex min-h-[4rem] md:min-h-[5rem] h-full w-full items-center justify-center text-center p-2 rounded-lg bg-black/30 border-2 border-dashed ${isOver ? 'border-yellow-400' : 'border-[#37464f]'} transition-colors`}>
                    <span className="font-['Inter'] text-sm md:text-base font-medium text-gray-400">{labelText}</span>
                </div>
            )}
        </div>
    );
});

const EmptyPlaceholder = React.memo(({ id }) => {
    const { setNodeRef } = useDroppable({ id });
    return <div ref={setNodeRef} className="flex min-h-[4rem] md:min-h-[5rem] w-full rounded-lg bg-black/20" />;
});


// =============================================================================
// Reducer Logic
// =============================================================================
const initialState = {
    gameState: "intro", score: 0, answers: [], timeLeft: GAME_TIME_LIMIT,
};

function gameReducer(state, action) {
    switch (action.type) {
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing" };
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
            if (state.timeLeft <= 0) return state;
            return { ...state, timeLeft: state.timeLeft - 1 };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing" };
        default: return state;
    }
}
// =============================================================================
// Main Game Component (FIXED & FULLY RESPONSIVE)
// =============================================================================
const MatchTheFallout = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    
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

    useEffect(() => {
        if (state.gameState === "playing") {
            setAvailableFallouts(shuffle(matchFalloutData.map(item => item.match)));
            setSlots(matchFalloutData.map(item => ({ id: item.id, labelText: item.text, content: null })));
        }
    }, [state.gameState, shuffle]);

    useEffect(() => {
        if (state.gameState !== "playing") return;
        if (state.timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timerId = setInterval(() => dispatch({ type: "TICK" }), 1000);
        return () => clearInterval(timerId);
    }, [state.gameState, state.timeLeft, handleSubmit]);
    
    const handleDragStart = (event) => setActiveId(event.active.id);

    const handleDragEnd = (event) => {
        setActiveId(null);
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = active.id;
        const overId = over.id;

        const newSlots = [...slots];
        const newAvailableFallouts = [...availableFallouts];

        const isDraggingFromAvailable = newAvailableFallouts.includes(activeId);
        const sourceSlotIndex = slots.findIndex(s => s.id === activeId);
        const isDraggingFromSlot = sourceSlotIndex !== -1;
        const draggedContent = isDraggingFromAvailable ? activeId : newSlots[sourceSlotIndex]?.content;

        if (!draggedContent) return;

        const targetSlotIndex = slots.findIndex(s => s.id === overId);
        const isDroppingOnSlot = targetSlotIndex !== -1;
        const isDroppingOnAvailable = overId.toString().startsWith('available-placeholder');

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
    
    if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    if (state.gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
    if (state.gameState === "finished") {
        const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        let insightText = accuracyScore >= 80 ? "Excellent! You know the consequences." : "Good try! Review the matches to learn more.";
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={insightText} onViewFeedback={() => dispatch({type: 'REVIEW_GAME'})} onContinue={() => navigate('/environmental/games')} />
            : <LosingScreen accuracyScore={accuracyScore} insight={insightText} onPlayAgain={() => dispatch({ type: 'RESET_GAME'})} onViewFeedback={() => dispatch({type: 'REVIEW_GAME'})} onContinue={() => navigate('/environmental/games')} />;
    }
    if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    
    const isSubmitEnabled = availableFallouts.length === 0;
    const activeContent = activeId ? (availableFallouts.includes(activeId) ? activeId : slots.find(s => s.id === activeId)?.content) : null;

    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col items-center p-4 pt-28 md:pt-[10vh] pb-28">
            <GameNav timeLeft={state.timeLeft} />
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="flex flex-col md:flex-row w-full max-w-5xl h-full gap-8 md:mt-10">
                    
                    <div className="w-full md:w-1/2 flex flex-col gap-3 p-4 bg-[rgba(32,47,54,0.3)] rounded-xl border border-[#37464f]">
                        {availableFallouts.map(fallout => (
                            <DraggableCard key={fallout} id={fallout} content={fallout} />
                        ))}
                        {Array.from({ length: matchFalloutData.length - availableFallouts.length }).map((_, i) => (
                           <EmptyPlaceholder key={i} id={`available-placeholder-${i}`} />
                        ))}
                    </div>

                    <div className="w-full md:w-1/2 flex flex-col gap-3 p-4 bg-[rgba(32,47,54,0.3)] rounded-xl border border-[#37464f]">
                         {slots.map(slot => (
                            <DroppableSlot key={slot.id} id={slot.id} labelText={slot.labelText} content={slot.content} />
                         ))}
                    </div>
                </div>
                
                <DragOverlay>
                    {activeId && activeContent ? <DraggableCard id={activeId} content={activeContent} /> : null}
                </DragOverlay>
            </DndContext>

            <div className="w-full h-24 bg-[#28343A] flex justify-center items-center px-4 z-50 fixed bottom-0 left-0">
                <div className="w-full max-w-xs h-14">
                    <button
                        className="relative w-full h-full cursor-pointer disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={!isSubmitEnabled}
                    >
                        <Checknow topGradientColor={"#09be43"} bottomGradientColor={"#068F36"} width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-2xl text-white [text-shadow:0_2px_0_#000]`}>
                            Check Now
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MatchTheFallout;