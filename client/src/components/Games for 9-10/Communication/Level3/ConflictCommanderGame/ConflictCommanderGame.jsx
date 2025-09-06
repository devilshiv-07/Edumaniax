import React, { useState, useEffect, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

// Contexts
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// --- Corrected Imports as per your project structure ---
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

// --- Data & Constants ---
const gameData = [
    {
        id: 1,
        scenario: "Your teammate seems angry and says: “You never submit things on time! I always have to cover for you!”",
        question: "Step 1: How do you first respond?",
        options: [
            { id: "q1a", text: "😤 “You’re just yelling again.”" },
            { id: "q1b", text: "😟 “I get that you’re upset.”" }
        ],
        correctId: "q1b",
        feedback: "Acknowledging their feelings (empathy) is a great first step to de-escalate the situation."
    },
    {
        id: 2,
        scenario: "After acknowledging their feelings, the tension has slightly eased.",
        question: "Step 2: What do you propose next?",
        options: [
            { id: "q2a", text: "🤝 “Let’s divide the work now so we’re clear.”" },
            { id: "q2b", text: "🙅 “It’s not my fault entirely.”" }
        ],
        correctId: "q2a",
        feedback: "Moving towards a clear, actionable solution (assertiveness) is key to resolving the conflict productively."
    }
];

const PERFECT_SCORE = gameData.length * 5;
const PASSING_THRESHOLD = 0.8;
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'conflictCommanderGameState';

// --- Helper Functions & Styles ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

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

// --- Result Screen Components ---

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration" className="w-56 h-56" />
                <h2 className="text-yellow-400 text-3xl sm:text-4xl font-bold mt-6">Challenge Complete!</h2>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center">
                            <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center px-4">
                            <span className="text-[#FFCC00] text-sm font-normal">{insight}</span>
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
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6" />
                <p className="text-yellow-400 text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center">
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center px-4">
                            <span className="text-[#FFCC00] text-sm font-normal">{insight}</span>
                        </div>
                    </div>
                </div>
                {recommendedSectionTitle && (
                    <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                        <button onClick={onNavigateToSection} className="bg-[#068F36] text-white text-sm font-semibold rounded-lg py-3 px-6 hover:bg-green-700 transition-all border-b-4 border-green-800 active:border-transparent shadow-lg">
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
            <h1 className="text-3xl md:text-4xl font-bold mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-4xl space-y-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                        <h3 className="text-lg font-bold text-yellow-300">Question {idx + 1}</h3>
                        <p className="text-gray-300 font-medium">{gameData[idx].scenario}</p>
                        <p className="text-gray-300 font-medium">{gameData[idx].question}</p>
                        <div>
                            <p className={ans.isCorrect ? 'text-green-300' : 'text-red-300'}>Your Answer: {ans.userAnswerText}</p>
                            {!ans.isCorrect && <p className="text-green-400">Correct Answer: {ans.correctAnswerText}</p>}
                            <p className="text-cyan-300 mt-2 text-sm italic">Feedback: {gameData[idx].feedback}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onBackToResults} className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

// --- Game Logic & State Management ---

const initialState = {
    gameState: "intro", // "intro", "instructions", "playing", "reflection", "finished", "review"
    currentPuzzleIndex: 0,
    score: 0,
    answers: [],
    reflection: "",
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
    startTime: Date.now(),
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
            return { ...initialState, gameState: "playing", startTime: Date.now() };
        case "SUBMIT_ANSWER": {
            const { selectedOption } = action.payload;
            const currentPuzzle = gameData[state.currentPuzzleIndex];
            const isCorrect = selectedOption.id === currentPuzzle.correctId;
            const newAnswer = {
                userAnswerId: selectedOption.id,
                userAnswerText: selectedOption.text,
                correctAnswerId: currentPuzzle.correctId,
                correctAnswerText: currentPuzzle.options.find(o => o.id === currentPuzzle.correctId).text,
                isCorrect,
            };
            const nextState = {
                ...state,
                score: isCorrect ? state.score + 5 : state.score,
                answers: [...state.answers, newAnswer],
                currentPuzzleIndex: state.currentPuzzleIndex + 1,
            };
            if (nextState.currentPuzzleIndex >= gameData.length) {
                return { ...nextState, gameState: "reflection" }; // Go to reflection screen
            }
            return nextState;
        }
        case "UPDATE_REFLECTION":
            return { ...state, reflection: action.payload };
        case "FINISH_REFLECTION":
            return { ...state, gameState: "finished" }; // Now go to results
        case "REVIEW_GAME":
            return { ...state, gameState: "review" };
        case "BACK_TO_FINISH":
            return { ...state, gameState: "finished" };
        case "RESET_GAME":
            return { ...initialState, gameState: "playing", startTime: Date.now() };
        default:
            return state;
    }
}

// --- Main Game Component ---

export default function ConflictCommanderGame() {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [selectedOptionId, setSelectedOptionId] = useState(null);

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                dispatch({ type: 'RESTORE_STATE', payload: savedState });
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) {
                console.error("Failed to parse saved game state:", error);
            }
        }
    }, []);

    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const accuracy = (state.answers.filter(a => a.isCorrect).length / gameData.length) * 100;
            const timeTakenSec = Math.floor((Date.now() - state.startTime) / 1000);
            const isVictory = accuracy >= PASSING_THRESHOLD * 100;
            
            updatePerformance({
                moduleName: "Communication",
                topicName: "interpersonalSkills",
                score: state.score,
                accuracy: Math.round(accuracy),
                avgResponseTimeSec: timeTakenSec,
                studyTimeMinutes: Math.ceil(timeTakenSec / 60),
                completed: isVictory,
            });

            if (isVictory) {
                completeCommunicationChallenge(2, 0);
            }

            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectAnswers = state.answers
                    .filter(ans => !ans.isCorrect)
                    .map((ans) => ({
                        question: gameData[state.answers.indexOf(ans)].question,
                        your_answer: ans.userAnswerText,
                        correct_answer: ans.correctAnswerText
                    }));

                if (incorrectAnswers.length === 0 && !state.reflection) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect! You balanced empathy and assertiveness beautifully.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }

                const prompt = `You are an AI tutor. A student played a conflict resolution game.
                1. Their incorrect answers: ${JSON.stringify(incorrectAnswers)}.
                2. Their personal reflection: "${state.reflection}".
                3. Available notes: ${JSON.stringify(notesCommunication9to10.map(n => ({ topicId: n.topicId, title: n.title })))}.
                Analyze their errors AND their reflection. Find the ONE best-matching note section and provide a short, encouraging insight (25-30 words) that acknowledges their reflection if possible.
                ### OUTPUT FORMAT ###
                Return ONLY a raw JSON object.
                { "detectedTopicId": "best_topic_id", "insight": "Your personalized feedback." }`;

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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Reviewing notes on empathy and assertiveness can help fine-tune your approach.", recommendedSectionId: 'conflict-resolution', recommendedSectionTitle: "Conflict Resolution" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.insight, state.answers, state.score, state.startTime, state.reflection, completeCommunicationChallenge, updatePerformance]);

    const handleSubmit = () => {
        if (!selectedOptionId) return;
        const currentPuzzle = gameData[state.currentPuzzleIndex];
        const selectedOption = currentPuzzle.options.find(opt => opt.id === selectedOptionId);
        dispatch({ type: "SUBMIT_ANSWER", payload: { selectedOption } });
        setSelectedOptionId(null);
    };

    const handleShowResults = () => {
        dispatch({ type: 'FINISH_REFLECTION' });
    };

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

    if (state.gameState === "reflection") {
        return (
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col relative">
                <style>{scrollbarHideStyle}</style>
                <GameNav />
                <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
                        <label className="font-bold text-yellow-400 text-2xl text-center">
                            ✏️ Final Reflection
                        </label>
                        <p className="text-slate-300 text-center">What worked best in your response and why?</p>
                        <textarea
                            className="w-full p-4 border-2 border-[#3F4B48] rounded-xl bg-[#131F24] text-slate-100 shadow-lg focus:border-cyan-500 focus:ring-cyan-500 transition"
                            rows={5}
                            value={state.reflection}
                            onChange={(e) => dispatch({ type: 'UPDATE_REFLECTION', payload: e.target.value })}
                            placeholder="Type your thoughts here..."
                        />
                    </div>
                </main>
                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button className="relative w-full h-full cursor-pointer" onClick={handleShowResults}>
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000]`}>
                            See Result
                        </span>
                    </button>
                </div>
            </footer>
            </div>
        );
    }

    const currentPuzzle = gameData[state.currentPuzzleIndex];
    const isLastQuestion = state.currentPuzzleIndex === gameData.length - 1;

    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col relative">
            <style>{scrollbarHideStyle}</style>
            {state.gameState === "instructions" && <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />}
            <GameNav />

            <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-3xl flex flex-col items-center gap-8">
                    <div className="w-full bg-gray-800/30 border-2 border-[#3F4B48] rounded-xl p-6 text-center">
                        <p className="text-gray-400 text-sm mb-2">SCENARIO {currentPuzzle.id} of {gameData.length}</p>
                        <p className="text-slate-100 text-lg font-medium leading-relaxed mb-4">{currentPuzzle.scenario}</p>
                        <p className="text-yellow-400 text-xl font-bold">{currentPuzzle.question}</p>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentPuzzle.options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelectedOptionId(opt.id)}
                                className={`p-4 rounded-xl text-left transition-all duration-200 border-4 ${selectedOptionId === opt.id ? 'border-cyan-500 bg-cyan-900/50 scale-105' : 'border-transparent bg-[#131F24] hover:bg-[#1f2d33]'}`}
                            >
                                <span className="text-white text-lg">{opt.text}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </main>

            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={!selectedOptionId}>
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!selectedOptionId ? "opacity-50" : ""}`}>
                            {isLastQuestion ? 'Finish' : 'Submit'}
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}