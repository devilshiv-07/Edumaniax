import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { DndContext, DragOverlay, useSensor, useSensors, MouseSensor, TouchSensor, pointerWithin, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import IntroScreen from './IntroScreen'; 
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';

// --- Import your notes data ---
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

// --- Game Configuration & Data ---
const originalCards = [
    { id: 1, text: "We’ve studied how similar clubs in 3 other schools succeeded with this idea.", type: "Logos" },
    { id: 2, text: "This project will help students feel more involved and boost morale.", type: "Pathos" },
    { id: 3, text: "It requires only ₹500 and takes one day to execute.", type: "Logos" },
    { id: 4, text: "I’ve led 2 successful campaigns in the past.", type: "Ethos" },
    { id: 5, text: "Our team is truly passionate about making a difference.", type: "Pathos" },
    { id: 6, text: "It fits well with the school’s goals of inclusivity and leadership.", type: "Ethos" },
    { id: 7, text: "We have signatures from 40 students who support this.", type: "Logos" },
    { id: 8, text: "I’ve discussed this idea with 2 teachers already, and they were encouraging.", type: "Ethos" },
    { id: 9, text: "We plan to track impact with a survey afterwards.", type: "Logos" },
];

const zoneNames = ["Introduction", "Main Argument", "Final Appeal"];
const PERFECT_SCORE = 13; // Max score possible
const PASSING_THRESHOLD = 0.7; // 70% to win
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'pitchPerfectGameState';

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
const DraggableCard = React.memo(({ card }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id, data: card });
    const style = {
        transform: CSS.Transform.toString(transform),
        visibility: isDragging ? 'hidden' : 'visible',
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-3 bg-[#2a3b42] border-2 border-cyan-700 rounded-lg shadow-md cursor-grab touch-none text-sm font-medium text-gray-200 hover:bg-cyan-900/50 transition-colors">
            {card.text}
        </div>
    );
});

const DroppableZone = React.memo(({ zoneIndex, card, onRemove }) => {
    const { setNodeRef, isOver } = useDroppable({ id: zoneIndex });
    return (
        <div className="flex-1 flex flex-col gap-4 p-4 border-2 border-dashed border-[#3F4B48] rounded-xl bg-gray-900/50 min-h-[200px] transition-colors duration-200">
            <h2 className="text-center text-lg font-bold text-yellow-400 lilita-one-regular">{zoneNames[zoneIndex]}</h2>
            <div ref={setNodeRef} className={`flex-grow flex items-center justify-center p-2 rounded-lg ${isOver ? 'bg-yellow-400/20 border-yellow-400' : 'bg-transparent border-transparent'} border-2 border-dashed`}>
                {card ? (
                    <div className="w-full text-center">
                         <div className="p-3 bg-green-800/60 rounded-lg shadow-inner border border-green-500 text-gray-100 font-medium">
                            {card.text}
                        </div>
                        <button onClick={() => onRemove(zoneIndex, card)} className="mt-2 text-xs bg-red-800/70 text-red-200 px-2 py-1 rounded hover:bg-red-700 transition">
                            Remove
                        </button>
                    </div>
                ) : (
                    <span className="text-slate-100/50 text-sm font-medium">Drop a card here</span>
                )}
            </div>
        </div>
    );
});

// --- Screen Components (Victory, Losing, Review) ---
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
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Pitch</h1>
            <div className="w-full max-w-4xl space-y-6 overflow-y-auto p-2 no-scrollbar">
                <div>
                    <h2 className="text-2xl font-semibold text-cyan-300 mb-2">Your Chosen Cards</h2>
                    <div className="space-y-3">
                        {answers.zones.map((card, idx) => (
                             <div key={idx} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                                <h3 className="text-lg font-bold text-yellow-300">{zoneNames[idx]}</h3>
                                <p className="text-gray-300 font-medium mt-1">{card ? card.text : "No card selected"}</p>
                             </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-semibold text-cyan-300 mb-2">Your Custom Pitch</h2>
                     <div className="space-y-3">
                        {answers.customPitch.map((text, idx) => (
                             <div key={idx} className="p-4 rounded-xl bg-gray-800 border border-gray-700">
                                <h3 className="text-lg font-bold text-yellow-300">{zoneNames[idx]}</h3>
                                <p className="text-gray-300 font-medium mt-1 italic">{text ? `"${text}"` : "No custom text written"}</p>
                             </div>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={onBackToResults} className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

// --- Game State Management (Reducer) ---
const initialState = {
    gameState: "intro", // "intro", "instructions", "playing", "bonus_round", "finished", "review"
    cardBank: shuffleArray(originalCards),
    zones: [null, null, null],
    customPitch: ["", "", ""],
    cardScore: 0, // Score from the card selection part
    totalScore: 0, // Final combined score
    answers: null,
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: ""
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE":
            return action.payload;
        case "SHOW_INSTRUCTIONS":
            return { ...state, gameState: "instructions" };
        case "START_GAME":
            return { ...initialState, gameState: "playing" };
        case "DROP_CARD": {
            const { zoneIndex, card } = action.payload;
            if (state.zones[zoneIndex]) return state;
            const newZones = [...state.zones];
            newZones[zoneIndex] = card;
            const newCardBank = state.cardBank.filter(c => c.id !== card.id);
            return { ...state, zones: newZones, cardBank: newCardBank };
        }
        case "REMOVE_CARD": {
            const { zoneIndex, card } = action.payload;
            const newZones = [...state.zones];
            newZones[zoneIndex] = null;
            const newCardBank = [...state.cardBank, card];
            return { ...state, zones: newZones, cardBank: newCardBank };
        }
        case "PROCEED_TO_BONUS": {
            let score = 0;
            const types = state.zones.map((c) => c?.type);
            if (types.includes("Ethos") && types.includes("Pathos") && types.includes("Logos")) score += 3;
            if (state.zones.every((c) => !!c)) score += 2;
            const idealOrder = ["Ethos", "Pathos", "Logos"];
            if (state.zones.map((c) => c?.type).every((t, i) => t === idealOrder[i])) score += 2;
            if (state.zones.some(c => c !== null)) score += 3;
            
            return { ...state, gameState: "bonus_round", cardScore: score };
        }
        case "UPDATE_CUSTOM_PITCH": {
            const { index, value } = action.payload;
            const newCustomPitch = [...state.customPitch];
            newCustomPitch[index] = value;
            return { ...state, customPitch: newCustomPitch };
        }
        case "FINISH_GAME":
            return {
                ...state,
                gameState: "finished",
                totalScore: action.payload.score,
                answers: { zones: state.zones, customPitch: state.customPitch }
            };
        case "SET_AI_INSIGHT":
            return { ...state, ...action.payload };
        case "REVIEW_GAME":
            return { ...state, gameState: "review" };
        case "BACK_TO_FINISH":
            return { ...state, gameState: "finished" };
        case "RESET_GAME":
             return { ...initialState, gameState: "playing" };
        default:
            return state;
    }
}

// --- Main Game Component ---
const PitchPerfectGame = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [activeCard, setActiveCard] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    );

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(savedStateJSON) });
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) { console.error("Failed to parse saved game state:", error); }
        }
    }, []);

    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const scorePercentage = (state.totalScore / PERFECT_SCORE) * 100;
                const prompt = `You are an AI tutor. A student just completed a persuasive pitch-building game. Analyze their performance and provide targeted feedback.
                ### CONTEXT ###
                1. **Student's Chosen Cards:**
                   - Introduction: ${state.answers.zones[0]?.text || "None"} (${state.answers.zones[0]?.type || "N/A"})
                   - Main Argument: ${state.answers.zones[1]?.text || "None"} (${state.answers.zones[1]?.type || "N/A"})
                   - Final Appeal: ${state.answers.zones[2]?.text || "None"} (${state.answers.zones[2]?.type || "N/A"})
                2. **Student's Custom Pitch:**
                   - Introduction: "${state.answers.customPitch[0] || "Empty"}"
                   - Main Argument: "${state.answers.customPitch[1] || "Empty"}"
                   - Final Appeal: "${state.answers.customPitch[2] || "Empty"}"
                3. **Student's Final Score:** ${state.totalScore}/${PERFECT_SCORE}
                4. **Available Note Sections:** ${JSON.stringify(notesCommunication9to10.map(n => ({ topicId: n.topicId, title: n.title })), null, 2)}
                ### YOUR TASK ###
                1. **DETECT:** Based on the card choices, custom text, and score, identify the single biggest area for improvement. Find the ONE best-matching note section.
                2. **GENERATE:** Provide a short, encouraging insight (25-30 words).
                ### OUTPUT FORMAT ###
                Return ONLY a raw JSON object: { "detectedTopicId": "...", "insight": "..." }`;

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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Review the notes on persuasion to improve.", recommendedSectionId: 'the-art-of-persuasion', recommendedSectionTitle: "The Art of Persuasion" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight, state.totalScore]);

    const handleDragStart = (event) => setActiveCard(event.active.data.current);
    const handleDragEnd = (event) => {
        const { over, active } = event;
        if (over && typeof over.id === 'number') {
            dispatch({ type: 'DROP_CARD', payload: { zoneIndex: over.id, card: active.data.current } });
        }
        setActiveCard(null);
    };

    const handleFinishGame = async () => {
        setIsSubmitting(true);
        let customPitchScore = 0;
        if (state.customPitch.some(p => p.trim().length > 0)) {
             try {
                const prompt = `Evaluate the persuasive quality of this pitch. Score it from 0 to 3. Intro: ${state.customPitch[0]}, Body: ${state.customPitch[1]}, Appeal: ${state.customPitch[2]}. Respond ONLY with a single number: 0, 1, 2, or 3.`;
                const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                const text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "0";
                customPitchScore = parseInt(text.trim()) || 0;
            } catch (error) {
                console.error("Gemini custom pitch evaluation error:", error);
                customPitchScore = 0;
            }
        }
        const finalScore = state.cardScore + customPitchScore;
        dispatch({ type: 'FINISH_GAME', payload: { score: Math.min(finalScore, PERFECT_SCORE) } });
        setIsSubmitting(false);
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
        const accuracyScore = Math.round((state.totalScore / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={() => navigate('/communications')} />
            : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={() => dispatch({ type: 'RESET_GAME' })} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
    }
    if (state.gameState === "review") {
        return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    // --- Main Game & Bonus Round Screens ---
    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative text-white">
            <style>{scrollbarHideStyle}</style>
            {state.gameState === "instructions" && <InstructionsScreen onStartGame={() => dispatch({ type: 'START_GAME' })} />}
            <GameNav />

            {state.gameState === "playing" && (
                <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                    <main className="flex-1 w-full flex flex-col items-center justify-center p-4 overflow-y-auto no-scrollbar">
                        <div className="w-full max-w-7xl flex flex-col items-center gap-6">
                            <div className="w-full flex flex-col md:flex-row gap-4">
                                {state.zones.map((card, i) => (
                                    <DroppableZone key={i} zoneIndex={i} card={card} onRemove={(idx, card) => dispatch({ type: 'REMOVE_CARD', payload: { zoneIndex: idx, card } })} />
                                ))}
                            </div>
                            <div className="w-full p-4 bg-gray-800/50 border-2 border-[#3F4B48] rounded-xl">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3 text-center lilita-one-regular">Your Magical Card Bank</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {state.cardBank.map((card) => <DraggableCard key={card.id} card={card} />)}
                                </div>
                            </div>
                        </div>
                    </main>
                    <DragOverlay>
                        {activeCard && <div className="p-3 bg-[#3a505a] border-2 border-yellow-400 rounded-lg shadow-2xl text-sm font-medium text-white scale-105">{activeCard.text}</div>}
                    </DragOverlay>
                </DndContext>
            )}

            {state.gameState === "bonus_round" && (
                 <main className="flex-1 w-full flex flex-col items-center justify-center p-4 overflow-y-auto no-scrollbar">
                     <div className="w-full max-w-4xl p-6 bg-gray-800/50 border-2 border-[#3F4B48] rounded-xl space-y-4">
                        <p className="text-center text-yellow-400 mb-4 text-lg font-semibold">Enhance your chosen cards with your own words.</p>
                        {state.zones.map((card, i) => (
                             <div key={i} className="p-3 bg-gray-900/70 rounded-lg">
                                <label className="font-bold text-cyan-300">{zoneNames[i]}: <span className="font-normal text-gray-300 ">{card?.text || "No card chosen"}</span></label>
                                <textarea
                                    placeholder={`Write your custom ${zoneNames[i].toLowerCase()} here...`}
                                    maxLength={300}
                                    value={state.customPitch[i]}
                                    onChange={(e) => dispatch({ type: 'UPDATE_CUSTOM_PITCH', payload: { index: i, value: e.target.value } })}
                                    className="mt-2 w-full p-3 border-2 border-gray-600 rounded-lg shadow-sm text-gray-200 bg-[#1e2d34] placeholder-gray-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                                />
                             </div>
                         ))}
                     </div>
                 </main>
            )}

            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button 
                        className="relative w-full h-full cursor-pointer" 
                        onClick={state.gameState === 'playing' ? () => dispatch({ type: 'PROCEED_TO_BONUS' }) : handleFinishGame}
                        disabled={(state.gameState === 'playing' && state.zones.every(z => z === null)) || isSubmitting}
                    >
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${isSubmitting ? "opacity-50" : ""}`}>
                            {state.gameState === 'playing' ? 'Next Step' : (isSubmitting ? 'Evaluating...' : 'Finish')}
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default PitchPerfectGame;