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
import { notesCommunication11to12 } from "@/data/notesCommunication11to12.js";

// --- MODIFICATION START: Added 'source' property to each card ---
// This helps the review screen identify the correct section for each card.
const cardData = {
    intro: [
        { id: 1, text: "Clubs like these already exist in top international schools.", type: "Ethos", source: "intro" },
        { id: 2, text: "This initiative could boost student confidence and creativity.", type: "Pathos", source: "intro" },
        { id: 3, text: "We’ve surveyed 120 students, and 90% showed interest.", type: "Logos", source: "intro" },
        { id: 4, text: "Our faculty mentor has agreed to guide the club.", type: "Ethos", source: "intro" },
        { id: 5, text: "Let’s build something we’re proud to leave behind.", type: "Pathos", source: "intro" },
    ],
    body: [
        { id: 6, text: "Many successful alumni attribute their growth to similar clubs.", type: "Ethos", source: "body" },
        { id: 7, text: "This club can serve as a platform for creative expression.", type: "Pathos", source: "body" },
        { id: 8, text: "70% of students voted in favor in a school poll.", type: "Logos", source: "body" },
        { id: 9, text: "We already have three teachers willing to mentor.", type: "Ethos", source: "body" },
        { id: 10, text: "This could help students build strong portfolios.", type: "Pathos", source: "body" },
        { id: 11, text: "It aligns with NEP 2020’s emphasis on experiential learning.", type: "Logos", source: "body" },
    ],
    conclusion: [
        { id: 12, text: "Together, we can build something meaningful.", type: "Pathos", source: "conclusion" },
        { id: 13, text: "The principal’s approval will unlock incredible opportunities.", type: "Ethos", source: "conclusion" },
        { id: 14, text: "Let’s innovate like top institutions worldwide.", type: "Ethos", source: "conclusion" },
        { id: 15, text: "90% participation shows strong demand.", type: "Logos", source: "conclusion" },
    ],
};
// --- MODIFICATION END ---

const allCards = [...cardData.intro, ...cardData.body, ...cardData.conclusion];
const zoneConfig = {
    intro: { name: "Introduction", limit: 3 },
    body: { name: "Main Argument", limit: 3 },
    conclusion: { name: "Final Appeal", limit: 2 },
};

const PERFECT_SCORE = 13;
const PASSING_THRESHOLD = 0.8;
const GAME_DURATION_SECONDS = 480;
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

const getCardTypeCount = (cards) => {
    const counts = { Ethos: 0, Pathos: 0, Logos: 0 };
    cards.forEach((card) => counts[card.type]++);
    return counts;
};


// --- Draggable/Droppable Components ---
const DraggableCard = React.memo(({ card }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: card.id, data: card });
    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0 : 1,
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="p-3 bg-[#2a3b42] border-2 border-cyan-700 rounded-lg shadow-md cursor-grab touch-none text-sm font-medium text-gray-200 hover:bg-cyan-900/50 transition-colors">
            {card.text}
        </div>
    );
});

const DroppableZone = React.memo(({ zoneId, title, limit, cards, onRemove }) => {
    const { setNodeRef, isOver } = useDroppable({ id: zoneId });
    return (
        <div className="flex-1 flex flex-col gap-4 p-4 border-2 border-dashed border-[#3F4B48] rounded-xl bg-gray-900/50 min-h-[200px] transition-colors duration-200">
            <h2 className="text-center text-lg font-bold text-yellow-400 lilita-one-regular">{title} ({cards.length}/{limit})</h2>
            <div ref={setNodeRef} className={`flex-grow flex flex-col gap-2 p-2 rounded-lg ${isOver ? 'bg-yellow-400/20 border-yellow-400' : 'bg-transparent border-transparent'} border-2 border-dashed`}>
                {cards.length > 0 ? (
                    cards.map(card => (
                        <div key={card.id} className="w-full text-center relative p-3 bg-green-800/60 rounded-lg shadow-inner border border-green-500 text-gray-100 font-medium">
                            {card.text}
                            <button onClick={() => onRemove(zoneId, card)} className="absolute -top-2 -right-2 text-xs bg-red-800 text-red-200 w-5 h-5 rounded-full hover:bg-red-700 transition flex items-center justify-center font-bold">
                                X
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full">
                       <span className="text-slate-100/50 text-sm font-medium">Drop cards here</span>
                    </div>
                )}
            </div>
        </div>
    );
});


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

// --- MODIFICATION START: New enhanced ReviewScreen component ---
function ReviewScreen({ answers, onBackToResults }) {
    const CheckIcon = () => <svg className="w-5 h-5 text-green-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
    const CrossIcon = () => <svg className="w-5 h-5 text-red-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;

    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-shrink-0 text-center mb-6">
                <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular text-yellow-400">Review Your Pitch</h1>
                <p className="text-gray-400 mt-1">See how your choices compare to the ideal pitch structure.</p>
            </div>

            <div className="w-full max-w-5xl mx-auto flex-1 overflow-y-auto p-2 no-scrollbar space-y-6">
                {Object.keys(zoneConfig).map(zoneId => {
                    const userCards = answers.selectedCards[zoneId];
                    const idealCards = cardData[zoneId];
                    return (
                        <div key={zoneId} className="p-4 rounded-xl bg-gray-800/60 border border-gray-700">
                            <h2 className="text-xl font-bold text-yellow-300 lilita-one-regular border-b-2 border-yellow-300/30 pb-2 mb-4">{zoneConfig[zoneId].name}</h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Column 1: Your Choices */}
                                <div>
                                    <h3 className="font-bold text-lg text-cyan-300 mb-3">Your Choices</h3>
                                    {userCards.length > 0 ? (
                                        <ul className="space-y-3">
                                            {userCards.map(card => {
                                                const isCorrect = card.source === zoneId;
                                                return (
                                                    <li key={card.id} className={`flex items-start p-2 rounded-md ${isCorrect ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                                                        {isCorrect ? <CheckIcon /> : <CrossIcon />}
                                                        <div>
                                                            <p className={`font-medium ${isCorrect ? 'text-gray-200' : 'text-gray-200'}`}>"{card.text}"</p>
                                                            {!isCorrect && (
                                                                <p className="text-xs text-red-300 mt-1">
                                                                    (This was an ideal card for the '{card.source}' section)
                                                                </p>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-500 italic mt-2">You didn't place any cards here.</p>
                                    )}
                                </div>

                                {/* Column 2: Ideal Cards */}
                                <div>
                                    <h3 className="font-bold text-lg text-green-300 mb-3">Ideal Cards for this Section</h3>
                                    <ul className="space-y-2">
                                        {idealCards.map(card => (
                                            <li key={card.id} className="text-gray-300 font-medium p-2 bg-gray-700/50 rounded-md">
                                                "{card.text}"
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex-shrink-0 pt-6 text-center">
                <button onClick={onBackToResults} className="px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                    Back to Results
                </button>
            </div>
        </div>
    );
}
// --- MODIFICATION END ---


const initialState = {
    gameState: "intro", // "intro", "instructions", "playing", "finished", "review"
    availableCards: shuffleArray(allCards),
    selectedCards: { intro: [], body: [], conclusion: [] },
    timeLeft: GAME_DURATION_SECONDS,
    totalScore: 0,
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
            return { ...initialState, gameState: "playing", availableCards: shuffleArray(allCards) };
        case "TICK_TIMER":
             if (state.timeLeft <= 1) { // Check if time is about to run out
                 return { ...state, timeLeft: 0, gameState: "finished", answers: { selectedCards: state.selectedCards } };
             }
            return { ...state, timeLeft: state.timeLeft - 1 };
        case "DROP_CARD": {
            const { zoneId, card } = action.payload;
            const zone = state.selectedCards[zoneId];
            const limit = zoneConfig[zoneId].limit;
            if (zone.length >= limit || zone.find(c => c.id === card.id)) return state;

            const newSelectedCards = {
                ...state.selectedCards,
                [zoneId]: [...zone, card]
            };
            const newAvailableCards = state.availableCards.filter(c => c.id !== card.id);
            return { ...state, selectedCards: newSelectedCards, availableCards: newAvailableCards };
        }
        case "REMOVE_CARD": {
            const { zoneId, card } = action.payload;
            const newSelectedCards = {
                ...state.selectedCards,
                [zoneId]: state.selectedCards[zoneId].filter(c => c.id !== card.id)
            };
            const newAvailableCards = [...state.availableCards, card];
            return { ...state, selectedCards: newSelectedCards, availableCards: newAvailableCards };
        }
        case "FINISH_GAME": {
            let score = 0;
            const { intro, body, conclusion } = state.selectedCards;

            const counts = {
                intro: getCardTypeCount(intro),
                body: getCardTypeCount(body),
                conclusion: getCardTypeCount(conclusion)
            };
            
            if (Object.values(counts.intro).filter(c => c > 0).length >= 2) score += 4;
            if (Object.values(counts.body).filter(c => c > 0).length >= 2) score += 4;
            if (Object.values(counts.conclusion).filter(c => c > 0).length >= 2) score += 4;
            
            if (intro.length > 0 && body.length > 0 && conclusion.length > 0) score += 1;

            return {
                ...state,
                gameState: "finished",
                totalScore: Math.min(score, PERFECT_SCORE),
                answers: { selectedCards: state.selectedCards }
            };
        }
        case "SET_AI_INSIGHT":
            return { ...state, ...action.payload };
        case "REVIEW_GAME":
            return { ...state, gameState: "review" };
        case "BACK_TO_FINISH":
            return { ...state, gameState: "finished" };
        case "RESET_GAME":
             return { ...initialState, gameState: "playing", availableCards: shuffleArray(allCards) };
        default:
            return state;
    }
}

const PitchPerfectGame = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [activeCard, setActiveCard] = useState(null);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    );

     useEffect(() => {
         if (state.gameState !== 'playing') return;
         const timer = setInterval(() => {
              dispatch({ type: 'TICK_TIMER' });
         }, 1000);
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

    useEffect(() => {
        if (state.gameState === "finished" && !state.insight && state.answers) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                
                const formatCardsForPrompt = (cards) => {
                    if (!cards || cards.length === 0) return "None";
                    return `[${cards.map(c => `"${c.text}" (${c.type})`).join(', ')}]`;
                };

                const prompt = `You are an AI tutor. A student just completed a persuasive pitch-building game. Analyze their performance and provide targeted feedback.
                ### CONTEXT ###
                1. **Student's Chosen Cards:**
                    - Introduction: ${formatCardsForPrompt(state.answers.selectedCards.intro)}
                    - Main Argument: ${formatCardsForPrompt(state.answers.selectedCards.body)}
                    - Final Appeal: ${formatCardsForPrompt(state.answers.selectedCards.conclusion)}
                2. **Student's Final Score:** ${state.totalScore}/${PERFECT_SCORE}
                3. **Available Note Sections:** ${JSON.stringify(notesCommunication11to12.map(n => ({ topicId: n.topicId, title: n.title })), null, 2)}
                ### YOUR TASK ###
                1. **DETECT:** Based on the card choices (especially the balance of Ethos, Pathos, Logos) and score, identify the single biggest area for improvement. Find the ONE best-matching note section.
                2. **GENERATE:** Provide a short, encouraging insight (25-30 words).
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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Review the notes on persuasion to improve.", recommendedSectionId: 'the-art-of-persuasion', recommendedSectionTitle: "The Art of Persuasion" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight, state.totalScore]);

    const handleDragStart = (event) => setActiveCard(event.active.data.current);
    const handleDragEnd = (event) => {
        const { over, active } = event;
        if (over && typeof over.id === 'string' && ['intro', 'body', 'conclusion'].includes(over.id)) {
            dispatch({ type: 'DROP_CARD', payload: { zoneId: over.id, card: active.data.current } });
        }
        setActiveCard(null);
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=11-12&section=${state.recommendedSectionId}`);
        }
    };
    
    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    if (state.gameState === "intro") {
        return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    }
     if (state.gameState === "instructions") {
        return <InstructionsScreen onStartGame={() => dispatch({ type: 'START_GAME' })} />;
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

    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative text-white">
            <style>{scrollbarHideStyle}</style>
            <GameNav />

            <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
                <main className="flex-1 w-full flex flex-col p-4 overflow-y-auto no-scrollbar">
                    <div className="w-full max-w-7xl max-h-[65vh] mx-auto flex flex-col gap-4">
                        
                        {/* Drop Zones */}
                        <div className="w-full flex flex-col md:flex-row gap-4 ">
                            {Object.keys(zoneConfig).map(zoneId => (
                                <DroppableZone
                                    key={zoneId}
                                    zoneId={zoneId}
                                    title={zoneConfig[zoneId].name}
                                    limit={zoneConfig[zoneId].limit}
                                    cards={state.selectedCards[zoneId]}
                                    onRemove={(zId, card) => dispatch({ type: 'REMOVE_CARD', payload: { zoneId: zId, card } })}
                                />
                            ))}
                        </div>

                        {/* Card Bank */}
                        <div className="w-full p-4 bg-gray-800/50 border-2 border-[#3F4B48] rounded-xl">
                            <h3 className="text-xl font-bold text-cyan-300 mb-3 text-center lilita-one-regular">Your Magical Card Bank</h3>
                            {state.availableCards.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                    {state.availableCards.map((card) => <DraggableCard key={card.id} card={card} />)}
                                </div>
                            ) : (
                                 <p className="text-center text-gray-400 p-4">All cards have been used!</p>
                            )}
                        </div>
                    </div>
                </main>
                <DragOverlay>
                    {activeCard && <div className="p-3 bg-[#3a505a] border-2 border-yellow-400 rounded-lg shadow-2xl text-sm font-medium text-white scale-105">{activeCard.text}</div>}
                </DragOverlay>
            </DndContext>

            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button
                        className="relative w-full h-full cursor-pointer"
                        onClick={() => dispatch({ type: 'FINISH_GAME' })}
                    >
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000]">
                            Finish Pitch
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default PitchPerfectGame;