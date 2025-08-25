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
import { notesEnvironment6to8 } from "@/data/notesEnvironment6to8.js";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import ThinkingCloud from "@/components/icon/ThinkingCloud";

import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'chainReactionGameState';

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

const puzzles = [
    { cause: "Cutting down trees", correctOrder: ["Loss of tree cover", "Soil erosion", "Crop failure and desertification"], image: "/environmentGameInfo/ChainReaction/cutdowntrees.png" },
    { cause: "Dumping industrial waste", correctOrder: ["Water pollution", "Death of aquatic life", "Unsafe drinking water"], image: "/environmentGameInfo/ChainReaction/cutdowntrees.png" },
    { cause: "Plastic usage", correctOrder: ["Waste accumulation", "Soil & water contamination", "Harm to marine life"], image: "/environmentGameInfo/ChainReaction/cutdowntrees.png" },
    { cause: "Over-mining", correctOrder: ["Resource depletion", "Habitat destruction", "Land degradation"], image: "/environmentGameInfo/ChainReaction/cutdowntrees.png" },
    { cause: "Burning fossil fuels", correctOrder: ["Air pollution", "Greenhouse gas buildup", "Global warming"], image: "/environmentGameInfo/ChainReaction/cutdowntrees.png" },
];
const PERFECT_SCORE = puzzles.length * 5;
const PASSING_THRESHOLD = 0.7;
const TIME_PER_PUZZLE = 60;


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

                <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                    {recommendedSectionTitle && (
                        <button
                            onClick={onNavigateToSection}
                            className="bg-[#068F36] text-black text-sm font-semibold  rounded-lg py-3 px-10 md:px-6  text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg"
                        >
                            Review "{recommendedSectionTitle}" Notes
                        </button>
                    )}
                </div>

            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex flex-wrap justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        <p className="text-gray-300 text-base mb-2 font-bold">Cause: {ans.cause}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Sequence:</p>
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>
                                {ans.userSequence.map(s => s || "Empty").join(" → ")}
                            </p>
                            {!ans.isCorrect && (
                                <>
                                    <p className="font-semibold pt-2">Correct Sequence:</p>
                                    <p className="font-mono text-green-300">{ans.correctSequence.join(" → ")}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBackToResults}
                className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg"
            >
                Back to Results
            </button>
        </div>
    );
}

function LevelCompletePopup({ isOpen, onConfirm, onCancel, onClose }) {
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
                {/* --- START: ADDED CLOSE BUTTON --- */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2 rounded-full"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                {/* --- END: ADDED CLOSE BUTTON --- */}
                
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="lilita-one-regular text-2xl md:text-3xl text-yellow-400 mb-3">
                    Yayy! You completed Level 1.
                </h2>
                <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
                    Would you like to move to Level Two?
                </p>
                <div className="flex justify-center items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="px-8 py-3 bg-red-600 text-lg text-white lilita-one-regular rounded-md hover:bg-red-700 transition-colors border-b-4 border-red-800 active:border-transparent shadow-lg"
                    >
                        Exit game
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
// --- END NEW POPUP COMPONENT ---


const DraggableCard = React.memo(({ id, content }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        zIndex: isDragging ? 1000 : 'auto',
        opacity: isDragging ? 0.8 : 1,
        touchAction: 'none',
    };
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="flex h-14 md:h-20 w-full items-center justify-center p-2 rounded-lg relative cursor-grab bg-[#131f24] border border-[#37464f] shadow-md">
            <span className="font-['Inter'] text-sm md:text-base font-medium text-[#f1f7fb] text-center">{content || id}</span>
        </div>
    );
});

const DroppableSequenceSlot = React.memo(({ id, content, text }) => {
    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({ id });
    const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({ id: id, disabled: !content });
    const combinedRef = useCallback(node => {
        setDroppableNodeRef(node);
        setDraggableNodeRef(node);
    }, [setDroppableNodeRef, setDraggableNodeRef]);
    const style = {
        transform: transform ? CSS.Transform.toString(transform) : undefined,
        zIndex: isDragging ? 1000 : 'auto',
        opacity: isDragging ? 0 : 1,
        touchAction: content ? 'none' : 'auto',
    };
    return (
        <div ref={combinedRef} style={style} {...attributes} {...listeners} className="flex h-14 md:h-20 w-full items-center justify-center rounded-lg relative">
            {content ? (
                <div className="flex h-full w-full items-center justify-center p-2 rounded-lg relative cursor-grab bg-[#131f24] border border-[#37464f] shadow-md">
                    <span className="font-['Inter'] text-sm md:text-base font-medium text-[#f1f7fb] text-center">{content}</span>
                </div>
            ) : (
                <div className={`flex h-full w-full items-center justify-center rounded-lg border-2 border-dashed ${isOver ? 'border-yellow-400 bg-yellow-400/10' : 'border-[#37464f]'} transition-colors`}>
                    <span className="font-['Inter'] text-lg md:text-xl font-medium text-[#f1f7fb]">{text}</span>
                </div>
            )}
        </div>
    );
});

const EmptyPlaceholderCardLeft = React.memo(({ id }) => {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div ref={setNodeRef} className={`flex h-14 md:h-20 w-full bg-transparent rounded-lg border-2 border-dashed ${isOver ? 'border-yellow-400 bg-yellow-400/10' : 'border-[#37464f]'} relative transition-colors`} />
    );
});

const initialState = { 
    gameState: "intro", 
    currentPuzzleIndex: 0, 
    score: 0, 
    answers: [], 
    timeLeft: TIME_PER_PUZZLE,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: ""
};
const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE":
            return action.payload;
        case "SET_AI_INSIGHT":
            return {
                ...state,
                insight: action.payload.insight,
                recommendedSectionId: action.payload.recommendedSectionId,
                recommendedSectionTitle: action.payload.recommendedSectionTitle,
            };
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing" };
        case "SUBMIT_ANSWER": {
            const { userSequence } = action.payload;
            const puzzle = puzzles[state.currentPuzzleIndex];
            const isCorrect = userSequence.every((item, index) => item && item.toLowerCase() === puzzle.correctOrder[index].toLowerCase());
            const nextState = {
                ...state,
                score: isCorrect ? state.score + 5 : state.score,
                answers: [...state.answers, { cause: puzzle.cause, userSequence, correctSequence: puzzle.correctOrder, isCorrect }],
                currentPuzzleIndex: state.currentPuzzleIndex + 1,
                timeLeft: TIME_PER_PUZZLE,
            };
            if (nextState.currentPuzzleIndex >= puzzles.length) {
                return { ...nextState, gameState: "finished" };
            }
            return nextState;
        }
        case "TICK": return { ...state, timeLeft: state.timeLeft - 1 };
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing" };
        default: return state;
    }
}

const ChainReaction = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [availableCards, setAvailableCards] = useState([]);
    const [sequenceSlotsContent, setSequenceSlotsContent] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [isPopupVisible, setPopupVisible] = useState(false); // --- NEW STATE FOR POPUP ---

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            dispatch({ type: 'RESTORE_STATE', payload: savedState });
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);


    const sensors = useSensors(useSensor(PointerSensor), useSensor(MouseSensor, { activationConstraint: { distance: 10 } }), useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }));

    useEffect(() => {
        if (state.gameState === "playing") {
            const puzzle = puzzles[state.currentPuzzleIndex];
            if (puzzle) {
                setAvailableCards(shuffle([...puzzle.correctOrder]));
                setSequenceSlotsContent([{ id: null, slotId: 'slot-0' }, { id: null, slotId: 'slot-1' }, { id: null, slotId: 'slot-2' }]);
            }
        }
    }, [state.gameState, state.currentPuzzleIndex]);

    const handleSubmit = useCallback(() => {
        const userSequence = sequenceSlotsContent.map(item => item.id);
        dispatch({ type: "SUBMIT_ANSWER", payload: { userSequence } });
    }, [sequenceSlotsContent]);

    useEffect(() => {
        if (state.gameState !== "playing") return;
        if (state.timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timerId = setInterval(() => { dispatch({ type: "TICK" }); }, 1000);
        return () => clearInterval(timerId);
    }, [state.gameState, state.timeLeft]);

useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });

                const incorrectAnswers = state.answers.filter(ans => !ans.isCorrect);
                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You have an excellent understanding of this module.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }
                
                const noteSectionsForModule = notesEnvironment6to8;
                const prompt = `
You are an expert AI tutor. A student has just finished a game and made mistakes. Your task is to provide targeted feedback.
### CONTEXT ###
1.  **Student's Incorrect Answers:**
    ${JSON.stringify(incorrectAnswers.map(a => ({ from_cause: a.cause, their_incorrect_sequence: a.userSequence.join(' -> ') })), null, 2)}
2.  **All Available Note Sections for this Module:**
    ${JSON.stringify(noteSectionsForModule, null, 2)}
### YOUR TWO-STEP TASK ###
1.  **Step 1: DETECT.** Analyze the student's mistakes and compare them to the 'content' of each note section. Identify the ONE section that is the best match for their errors.
2.  **Step 2: GENERATE.** Based on their performance, provide a short, encouraging, and educational insight (about 25-30 words) into their understanding of environmental chain reactions. If they did well, praise their logical thinking.
If they struggled, first see and tell where they went wrong , the topics they struggle with and then provide them with some actionable feedback which concepts they should review or focus on and then Based on the section you detected,
recommend the student review that section by its 'title' and any technique which you think might help them.
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the section you identified (e.g., '1', '3', etc.)",
  "insight": "Your personalized and encouraging feedback message here."
}`; 

                try {
                    const response = await axios.post(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`,
                    { contents: [{ parts: [{ text: prompt }] }] }
                );
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);

                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesEnvironment6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({
                            type: "SET_AI_INSIGHT",
                            payload: {
                                insight: parsed.insight,
                                recommendedSectionId: parsed.detectedTopicId,
                                recommendedSectionTitle: recommendedNote ? recommendedNote.title : ""
                            }
                        });
                    } else { throw new Error("Failed to parse response from AI."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/environmental/notes?grade=6-8&section=${state.recommendedSectionId}`);
        }
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleContinue = () => {
        setPopupVisible(true);
    };

    const handleConfirmNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/green-budget');
        setPopupVisible(false);
    };

    const handleCancelNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/environmental/games');
        setPopupVisible(false);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };

    const handleDragStart = (event) => { setActiveId(event.active.id); };
    
    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);
        if (!over || active.id === over.id) return;

        const { id: activeId } = active;
        const { id: overId } = over;

        const newAvailableCards = [...availableCards];
        const newSequenceSlotsContent = JSON.parse(JSON.stringify(sequenceSlotsContent));

        const isDraggingFromAvailable = newAvailableCards.includes(activeId);
        const activeSequenceSlotIndex = newSequenceSlotsContent.findIndex(slot => slot.slotId === activeId);
        const isDraggingFromSequence = activeSequenceSlotIndex !== -1;

        const overSequenceSlotIndex = newSequenceSlotsContent.findIndex(slot => slot.slotId === overId);
        const isDroppingOnSequence = overSequenceSlotIndex !== -1;

        if (isDraggingFromAvailable && isDroppingOnSequence) {
            const draggedContent = activeId;
            const contentInTargetSlot = newSequenceSlotsContent[overSequenceSlotIndex].id;
            newSequenceSlotsContent[overSequenceSlotIndex].id = draggedContent;
            const indexToRemove = newAvailableCards.indexOf(draggedContent);
            if (indexToRemove > -1) newAvailableCards.splice(indexToRemove, 1);
            if (contentInTargetSlot) newAvailableCards.push(contentInTargetSlot);
        } else if (isDraggingFromSequence && isDroppingOnSequence) {
            const draggedContent = newSequenceSlotsContent[activeSequenceSlotIndex].id;
            const contentInTargetSlot = newSequenceSlotsContent[overSequenceSlotIndex].id;
            newSequenceSlotsContent[overSequenceSlotIndex].id = draggedContent;
            newSequenceSlotsContent[activeSequenceSlotIndex].id = contentInTargetSlot;
        } else if (isDraggingFromSequence && (over.id.toString().startsWith('available-cards-placeholder') || over.id === null)) {
            const draggedContent = newSequenceSlotsContent[activeSequenceSlotIndex].id;
            if (draggedContent) {
                newSequenceSlotsContent[activeSequenceSlotIndex].id = null;
                if (!newAvailableCards.includes(draggedContent)) newAvailableCards.push(draggedContent);
            }
        }
        setAvailableCards(newAvailableCards);
        setSequenceSlotsContent(newSequenceSlotsContent);
    };

    // --- MODIFIED RENDER LOGIC TO INCLUDE POPUP ---
    const renderGameContent = () => {
        if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
        if (state.gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;
        
        if (state.gameState === "finished") {
            const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
            const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
            
            return isVictory
                ? <VictoryScreen 
                    accuracyScore={accuracyScore} 
                    insight={state.insight} 
                    onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} 
                    onContinue={handleContinue} 
                    />
                : <LosingScreen
                    accuracyScore={accuracyScore}
                    insight={state.insight}
                    onPlayAgain={handlePlayAgain}
                    onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })}
                    onContinue={handleContinue}
                    onNavigateToSection={handleNavigateToSection}
                    recommendedSectionTitle={state.recommendedSectionTitle}
                    />;
        }
        
        if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;

        const currentPuzzle = puzzles[state.currentPuzzleIndex];
        if (state.gameState === 'playing' && !currentPuzzle) return <div className="text-white bg-[#202f36] flex items-center justify-center h-screen">Loading...</div>;

        const isSubmitEnabled = sequenceSlotsContent.every(item => item.id !== null);
        let activeDragItemContent = null;
        if (activeId) {
            if (availableCards.includes(activeId)) {
                activeDragItemContent = activeId;
            } else {
                const activeSlot = sequenceSlotsContent.find(s => s.slotId === activeId);
                if (activeSlot) activeDragItemContent = activeSlot.id;
            }
        }

        return (
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col items-center p-4 pt-34 md:pt-[20vh] pb-28 relative no-scrollbar">
                <style>{scrollbarHideStyle}</style>
                <GameNav timeLeft={state.timeLeft} />
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="flex flex-col items-center gap-8 w-full max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row w-full justify-center items-start gap-4 md:gap-8">
                            <div className="flex w-full md:w-80 lg:w-96 flex-col gap-3 p-4 bg-[rgba(32,47,54,0.3)] rounded-xl border border-[#37464f]">
                                {availableCards.map((item) => <DraggableCard key={item} id={item} content={item} />)}
                                {Array.from({ length: 3 - availableCards.length }).map((_, index) => <EmptyPlaceholderCardLeft key={`empty-${index}`} id={`available-cards-placeholder-${index}`} />)}
                            </div>
                            <div className="flex w-full md:w-80 lg:w-96 flex-col gap-3 p-4 bg-[rgba(32,47,54,0.3)] rounded-xl border border-[#37464f]">
                                {sequenceSlotsContent.map((item, index) => (
                                    <DroppableSequenceSlot key={item.slotId} id={item.slotId} content={item.id} text={['1st', '2nd', '3rd'][index]} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-center">
                            <img src={currentPuzzle.image} alt="Cause" className="w-15 h-15 md:w-24 md:h-24 object-contain mt-3 lg:mt-0" />
                            <div className="relative md:ml-[1rem] md:mb-[2rem] md:mt-4 lg:mt-1">
                                <ThinkingCloud className="w-[150px] md:w-[280px] lg:w-[260px]" />
                                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] pl-4 text-[9px] md:text-sm leading-tight text-white text-center inter-font font-medium">
                                    {currentPuzzle.cause}
                                </p>
                            </div>
                        </div>
                    </div>
                    <DragOverlay>
                        {activeId && activeDragItemContent ? <DraggableCard id={activeId} content={activeDragItemContent} /> : null}
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
                                Continue
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            {renderGameContent()}
            <LevelCompletePopup
                isOpen={isPopupVisible}
                onConfirm={handleConfirmNavigation}
                onCancel={handleCancelNavigation}
                onClose={handleClosePopup} 
            />
        </>
    );
};

export default ChainReaction;