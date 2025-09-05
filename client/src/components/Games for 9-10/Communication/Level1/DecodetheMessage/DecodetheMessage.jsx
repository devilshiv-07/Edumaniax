import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import { DndContext, DragOverlay, useSensor, useSensors, useDraggable, useDroppable, MouseSensor, TouchSensor, pointerWithin } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const gameData = [
    { id: 1, text: 'A student whispers something during class. The other person doesn’t respond.', correctLabel: 'Feedback' },
    { id: 2, text: 'A boy shrugs silently after being asked a question.', correctLabel: 'Non-verbal cue' },
    { id: 3, text: 'A class announcement is written in French, and half the students don’t understand.', correctLabel: 'Message' },
    { id: 4, text: 'A student reads a note but doesn’t realize it’s meant for them.', correctLabel: 'Receiver' },
    { id: 5, text: 'A teacher emails a student, but the email ends up in the spam folder.', correctLabel: 'Medium' },
];

const labels = ['Sender', 'Message', 'Medium', 'Receiver', 'Feedback', 'Non-verbal cue'];
const PERFECT_SCORE = gameData.length * 5;
const PASSING_THRESHOLD = 0.7;
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'decodeTheMessageGameState';

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

const LabelPlaceholder = () => (
    <div className="w-full h-full min-h-[40px] bg-transparent border-2 border-dashed border-cyan-700/50 rounded-3xl" />
);

const Label = ({ label, isOverlay = false }) => (
    <div className={`w-auto bg-cyan-700 rounded-3xl flex items-center justify-center transition-transform duration-200 p-2.5 ${isOverlay ? 'shadow-2xl scale-105' : 'hover:scale-105'}`}>
        <span className="text-white text-center text-sm sm:text-base font-medium inter-font leading-relaxed px-2">{label.replace(/^[^\w\s]+/, '')}</span>
    </div>
);

const DraggableLabel = React.memo(({ label }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: label });
    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0 : 1,
    };
    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="cursor-grab touch-none">
            <Label label={label} />
        </div>
    );
});

const DropArea = React.memo(({ droppedLabel }) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'drop-area' });

    return (
        <div
            ref={setNodeRef}
            className={`w-full min-h-[5rem] bg-gray-900 rounded-xl border-2 border-dashed flex justify-center items-center p-4 transition-all duration-200 ${isOver ? 'border-yellow-400 bg-gray-700/50' : 'border-[#3F4B48]'}`}
        >
            {droppedLabel ? <Label label={droppedLabel} /> : <span className="text-slate-100/50 text-sm sm:text-base font-medium leading-relaxed">Drop the suitable element here</span>}
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

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                        <h3 className="text-lg font-bold text-yellow-300">Scenario {idx + 1}</h3>
                        <p className="text-gray-300 font-medium">{gameData[idx].text}</p>
                        <div>
                            <p className={ans.isCorrect ? 'text-green-300' : 'text-red-300'}>Your Answer: {ans.userAnswer}</p>
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

const initialState = {
    gameState: "intro",
    currentPuzzleIndex: 0,
    score: 0,
    answers: [],
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: ""
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE":
            return action.payload;
        case "SET_AI_INSIGHT":
            return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        case "SHOW_INSTRUCTIONS":
            return { ...state, gameState: "instructions" };
        case "START_GAME":
            return { ...initialState, gameState: "playing" };
        case "SUBMIT_ANSWER": {
            const { userAnswer, correctAnswer } = action.payload;
            const isCorrect = userAnswer === correctAnswer;
            const newScore = isCorrect ? state.score + 5 : state.score;
            const nextState = {
                ...state,
                score: newScore,
                answers: [...state.answers, { userAnswer, correctAnswer, isCorrect }],
                currentPuzzleIndex: state.currentPuzzleIndex + 1,
            };
            if (nextState.currentPuzzleIndex >= gameData.length) {
                return { ...nextState, gameState: "finished" };
            }
            return nextState;
        }
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

const GameScreen = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [droppedLabel, setDroppedLabel] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    );

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
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectAnswers = state.answers.filter(ans => !ans.isCorrect).map((ans, index) => ({
                    scenario: gameData.find(g => g.correctLabel === ans.correctAnswer)?.text || `Scenario ${index + 1}`,
                    your_answer: ans.userAnswer,
                    correct_answer: ans.correctAnswer
                }));

                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You're a communication expert!", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }

                const prompt = `You are an AI tutor. A student made mistakes in a game about communication elements. Analyze their errors and provide targeted feedback. ### CONTEXT ### 1. **Student's Incorrect Answers:** ${JSON.stringify(incorrectAnswers, null, 2)} 2. **Available Note Sections:** ${JSON.stringify(notesCommunication9to10.map(n => ({ topicId: n.topicId, title: n.title, content: n.content.substring(0, 150) + '...' })), null, 2)} ### YOUR TASK ### 1. **DETECT:** Identify the main area of weakness (e.g., "identifying communication barriers," "understanding feedback loops") and find the ONE best-matching note section. 2. **GENERATE:** Provide a short, encouraging insight (25-30 words) and suggest reviewing the note section by its title. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the best section", "insight": "Your personalized feedback message." }`;

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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes...", recommendedSectionId: 'types-of-communication-barriers', recommendedSectionTitle: "Types of Communication Barriers" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (over && over.id === 'drop-area') {
            setDroppedLabel(active.id);
        }
        setActiveId(null);
    };

    const handleSubmit = () => {
        if (!droppedLabel) return;
        const currentPuzzle = gameData[state.currentPuzzleIndex];
        dispatch({
            type: "SUBMIT_ANSWER",
            payload: { userAnswer: droppedLabel, correctAnswer: currentPuzzle.correctLabel }
        });
        setDroppedLabel(null);
    };

    const handleStartGame = () => dispatch({ type: "START_GAME" });

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=9-10&section=${state.recommendedSectionId}`);
        }
    };

    if (state.gameState === "intro") {
        return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
    }

    if (state.gameState === "finished") {
        const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
        return isVictory
            ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={() => navigate('/communications')} />
            : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
    }

    if (state.gameState === "review") {
        return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
    }

    const currentPuzzle = gameData[state.currentPuzzleIndex];
    const isLastQuestion = state.currentPuzzleIndex === gameData.length - 1;

    return (
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font relative">
                <style>{scrollbarHideStyle}</style>
                {state.gameState === "instructions" && <InstructionsScreen onStartGame={handleStartGame} />}
                <GameNav />
                <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-5xl flex flex-col items-center gap-12 md:gap-16">
                        <div className="w-full max-w-3xl min-h-[16rem] bg-gray-800/30 border-2 border-[#3F4B48] rounded-xl p-6 md:p-8 flex flex-col justify-between gap-4">
                            <div className="flex-grow flex items-center justify-center">
                                <p className="text-center text-slate-100 text-base sm:text-lg font-medium leading-relaxed">
                                    SCENARIO {currentPuzzle.id}: {currentPuzzle.text}
                                </p>
                            </div>

                            <DropArea droppedLabel={droppedLabel} />

                        </div>
                        <div className="w-full">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {labels.map(label => (
                                    droppedLabel === label ? <LabelPlaceholder key={label} /> : <DraggableLabel key={label} label={label} />
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={!droppedLabel}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!droppedLabel ? "opacity-50" : ""}`}>
                                {isLastQuestion ? 'Finish' : 'Submit'}
                            </span>
                        </button>
                    </div>
                </footer>
            </div>
            <DragOverlay>
                {activeId ? <Label label={activeId} isOverlay={true} /> : null}
            </DragOverlay>
        </DndContext>
    );
};

const DecodetheMessage = () => {
    return <GameScreen />;
};

export default DecodetheMessage;