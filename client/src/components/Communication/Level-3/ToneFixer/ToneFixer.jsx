import React, { useState, useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

// --- Import your shared components here ---
import IntroScreen from './IntroScreen'; // Assuming reuse
import InstructionsScreen from './InstructionsScreen'; // Assuming reuse
import GameNav from './GameNav'; // Assuming reuse
import Checknow from '@/components/icon/GreenBudget/Checknow';
import ThinkingCloud from "@/components/icon/ThinkingCloud";

// --- Import your notes data ---
import { notesCommunication6to8 } from "@/data/notesCommunication6to8.js";

// --- Helper for hiding scrollbar ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Game Data ---
const gameData = [
  {
    message: "Why didn’t you invite me 😡??",
    options: [
      "Hey! I saw the party pics. Looked fun—wish I was there too 😊",
      "Why would you not invite me? That’s rude! 😠",
      "Guess I wasn’t cool enough for the party huh 😤",
    ],
    correctReply: "Hey! I saw the party pics. Looked fun—wish I was there too 😊",
    correctEmoji: "😊",
    correctTone: "friendly",
  },
  {
    message: "Are you ignoring me on purpose?",
    options: [
      "Hey, I hope everything’s okay—haven’t heard from you in a bit 😊",
      "You better have a good reason for not replying 😒",
      "You’re ignoring me. Cool. Got it. 🙄",
    ],
    correctReply: "Hey, I hope everything’s okay—haven’t heard from you in a bit 😊",
    correctEmoji: "😊",
    correctTone: "curious",
  },
  {
    message: "You never reply to my messages 👿",
    options: [
      "I miss our chats! Hope we can catch up soon 🫶",
      "So I guess I don’t matter to you anymore? 😠",
      "I’m done texting if you don’t care. 😡",
    ],
    correctReply: "I miss our chats! Hope we can catch up soon 🫶",
    correctEmoji: "😊",
    correctTone: "friendly",
  },
];

const toneTags = ["friendly", "playful", "curious"];
const emojiOptions = ["😊", "🤔", "😢", "😠"];


// --- Constants ---
const PERFECT_SCORE = gameData.length * 5;
const PASSING_THRESHOLD = 0.7; // 70%
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'toneTunerGameState';

// --- Helper function ---
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

// --- Reusable Components ---
const Option = ({ text, isSelected, onClick, isEmoji = false }) => (
    <div
        onClick={onClick}
        className={`flex items-center gap-2 px-3 bg-[#131f24] rounded-lg border border-[#37464f] shadow-[0_2px_0_0_#37464f] cursor-pointer transition-all duration-200 transform hover:scale-101 ${isSelected ? 'border-[#6DFF00] ring-1 ring-[#6DFF00]' : 'hover:border-gray-500'}`}
    >
        <div className={`w-5 h-5 flex-shrink-0 flex justify-center items-center rounded-sm border border-[#37464f] transition-colors ${isSelected ? 'bg-[#6DFF00] border-[#6DFF00]' : 'bg-[#0A160E]'}`}>
            {isSelected && <span className="text-black text-base font-bold">✓</span>}
        </div>
        <span className={`text-[#f1f7fb] font-normal text-left ${isEmoji ? 'text-2xl py-1' : 'text-sm py-2.5'}`}>
            {text}
        </span>
    </div>
);

function FeedbackCharacter({ isVisible, feedbackMessage }) {
    if (!isVisible) return null;
    return (
        <div className="flex items-end justify-center text-white inter-font">
            <img src="/feedbackcharacter.gif" alt="Character" className="w-[3.5rem] md:w-[4.8rem] h-auto object-contain shrink-0" />
            <div className="relative mb-8 md:ml-2">
                <ThinkingCloud className="w-[220px] h-auto md:w-[260px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] text-center">
                    <p className="text-xs md:text-sm font-medium">{feedbackMessage}</p>
                </div>
            </div>
        </div>
    );
}

// --- NEW Pre-Game Example Component ---
const PreGameExample = () => {
    const [selectedTone, setSelectedTone] = useState(null);
    const exampleTones = ["friendly", "playful", "curious"];
    return (
        <div className="w-full max-w-2xl bg-[rgba(32,47,54,0.5)] border border-[#37464f] p-4 md:p-6 rounded-xl">
            <h2 className="font-semibold text-lg text-yellow-300 mb-2 flex items-center gap-2 inter-font">
                <span className='text-2xl'>🔍</span> Before you start, check out this example!
            </h2>
            <p className="text-sm mb-6 text-gray-300 inter-font">
                Click the buttons to see how the tone transforms this rude sentence:
            </p>
            <p className="mb-6 text-red-400 font-medium text-center py-3 bg-black/20 rounded-md text-base ">
                "You're such an idiot."
            </p>
            <div className="flex flex-wrap gap-2 mb-4 inter-font">
                {exampleTones.map((tone) => (
                    <button
                        key={tone}
                        onClick={() => setSelectedTone(tone)}
                        className={`px-5 py-2.5 text-xs rounded-md font-medium transition-all duration-200 border-1 shadow-[0_2px_0_0_#37464f] active:border-b-1 ${selectedTone === tone
                            ? "bg-yellow-500 text-black border-yellow-700 shadow-[0_2px_0_0_#A65F00]"
                            : "bg-[#131f24] text-white border-[#37464f] hover:bg-[#28343A]"
                            }`}
                    >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </button>
                ))}
            </div>
            {selectedTone && (
                <div className="bg-black/20 p-3 border border-[#37464f] rounded-lg text-sm text-gray-200 animate-fade-in inter-font font-medium">
                    <strong className="text-yellow-400">
                        {selectedTone.charAt(0).toUpperCase() + selectedTone.slice(1)} tone:
                    </strong>
                    <span className="ml-1">
                        {selectedTone === "friendly" && "Hey, that wasn’t nice! Let’s talk calmly."}
                        {selectedTone === "playful" && "Whoa, someone woke up spicy today 😜"}
                        {selectedTone === "curious" && "Hmm, did I do something to upset you?"}
                    </span>
                </div>
            )}
        </div>
    );
};



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
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                        <h3 className="text-lg font-bold text-yellow-300">Scenario {idx + 1}</h3>
                        <div>
                            <p className="font-semibold text-gray-300">Your Reply:</p>
                            <p className={ans.userAnswers.reply === ans.correctAnswers.reply ? 'text-green-300' : 'text-red-300'}>{ans.userAnswers.reply}</p>
                            {ans.userAnswers.reply !== ans.correctAnswers.reply && <p className="text-green-400">Correct: {ans.correctAnswers.reply}</p>}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-300">Your Tone:</p>
                            <p className={ans.userAnswers.tone === ans.correctAnswers.tone ? 'text-green-300' : 'text-red-300'}>{ans.userAnswers.tone}</p>
                            {ans.userAnswers.tone !== ans.correctAnswers.tone && <p className="text-green-400">Suggested: {ans.correctAnswers.tone}</p>}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-300">Your Emoji:</p>
                            <p className={ans.userAnswers.emoji === ans.correctAnswers.emoji ? 'text-green-300' : 'text-red-300'}>{ans.userAnswers.emoji}</p>
                             {ans.userAnswers.emoji !== ans.correctAnswers.emoji && <p className="text-green-400">Suggested: {ans.correctAnswers.emoji}</p>}
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


// --- Game State Management ---
const initialState = { gameState: "intro", currentPuzzleIndex: 0, score: 0, answers: [], insight: "", recommendedSectionId: null, recommendedSectionTitle: "" };
function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SET_AI_INSIGHT": return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing" };
        case "SUBMIT_ANSWER": {
            const { userAnswers } = action.payload;
            const puzzle = gameData[state.currentPuzzleIndex];
            const isCorrect = userAnswers.reply === puzzle.correctReply;
            const correctAnswers = { reply: puzzle.correctReply, tone: puzzle.correctTone, emoji: puzzle.correctEmoji };
            const nextState = { ...state, score: isCorrect ? state.score + 5 : state.score, answers: [...state.answers, { userAnswers, correctAnswers, isCorrect }], currentPuzzleIndex: state.currentPuzzleIndex + 1 };
            if (nextState.currentPuzzleIndex >= gameData.length) {
                return { ...nextState, gameState: "finished" };
            }
            return nextState;
        }
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing" };
        default: return state;
    }
}

// --- Main Game Component ---
const ToneTuner = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    
    // State for the current question's selections
    const [selections, setSelections] = useState({ emoji: null, tone: null, reply: null });
    // State to manage feedback visibility and content
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedback, setFeedback] = useState("");
    // --- NEW state to control if the example is visible ---
    const [isExampleVisible, setIsExampleVisible] = useState(true);

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                dispatch({ type: 'RESTORE_STATE', payload: savedState });
                setIsExampleVisible(false); // If we restore state, we are in the middle of a game, so don't show the example
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) {
                console.error("Failed to parse saved game state:", error);
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
    }, []);
    
    useEffect(() => { window.dispatchEvent(new CustomEvent('pause-background-audio')); }, []);

    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectAnswers = state.answers.filter(ans => !ans.isCorrect).map((ans, index) => ({ scenario: index + 1, your_reply: ans.userAnswers.reply, correct_reply: ans.correctAnswers.reply }));
                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You're an expert at turning tough talks into positive chats!", recommendedSectionId: null, recommendedSectionTitle: "" } }); return;
                }
                const prompt = `You are an expert AI tutor. A student just finished a game about rewriting rude messages politely. Your task is to provide targeted feedback. ### CONTEXT ### 1. **Student's Incorrect Answers:** ${JSON.stringify(incorrectAnswers, null, 2)} 2. **All Available Note Sections for this Module:** ${JSON.stringify(notesCommunication6to8.map(n => ({topicId: n.topicId, title: n.title, content: n.content.substring(0, 200) + '...'})), null, 2)} ### YOUR TWO-STEP TASK ### 1. **Step 1: DETECT.** Analyze the student's mistakes. Do they struggle with staying positive, being assertive without being aggressive, or understanding the other person's feelings? Identify the ONE note section that is the best match for their errors. 2. **Step 2: GENERATE.** Based on their performance, provide a short, encouraging insight (about 25-30 words) into their communication style. Identify the main area for improvement (e.g., "choosing a calmer tone," "using more positive language") and suggest reviewing the note section you detected by its 'title'. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the section you identified", "insight": "Your personalized and encouraging feedback message here." }`;
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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes to master positive communication.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    const handleSelection = (type, value) => { setSelections(prev => ({ ...prev, [type]: value })); };

    const handleSubmit = () => {
        const currentPuzzle = gameData[state.currentPuzzleIndex];
        const isCorrect = selections.reply === currentPuzzle.correctReply;
        setFeedback(isCorrect ? "  Great choice! That message feels warm and friendly." : "  Oops! That response might sound a bit harsh.");
        setShowFeedback(true);
    };
    
    const handleContinueToNext = () => {
        dispatch({ type: "SUBMIT_ANSWER", payload: { userAnswers: selections } });
        setSelections({ emoji: null, tone: null, reply: null });
        setShowFeedback(false);
        setFeedback("");
    };
    
    const handleNavigateToSection = () => { 
        if (state.recommendedSectionId) { 
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state)); 
            navigate(`/communications/notes?grade=6-8&section=${state.recommendedSectionId}`); 
        } 
    };
    
    // This now also resets the example visibility
    const handleStartGame = () => {
        dispatch({ type: "START_GAME" });
        setIsExampleVisible(true);
    };

    // This also resets the example visibility
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
        setIsExampleVisible(true);
    };

    const handleContinue = () => { 
        sessionStorage.removeItem(SESSION_STORAGE_KEY); 
        navigate('/speak-up-without-blowing-up');
    };

    const isSubmitEnabled = selections.emoji && selections.tone && selections.reply;

    // --- Render Logic ---
    const renderGameContent = () => {
        if (state.gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
        
        if (state.gameState === "finished") {
            const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
            const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
        }

        if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
        
        const currentPuzzle = gameData[state.currentPuzzleIndex];
        if (!currentPuzzle && state.gameState === "playing" && !isExampleVisible) {
             return <div className="text-white">Loading...</div>;
        }

        return (
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col font-['Inter'] relative">
                <style>{scrollbarHideStyle}</style>
                <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-in-out; } @keyframes fadeIn { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }`}</style>
                
                {state.gameState === "instructions" && <InstructionsScreen onStartGame={handleStartGame} />}

                <GameNav />
                
                <main className="flex-1 w-full flex flex-col items-center justify-center px-2 md:px-4 pb-25">
                    {isExampleVisible ? (
                        <PreGameExample />
                    ) : (
                        <>
                             {/* The rude message to respond to */}
                             <div className="w-full max-w-2xl bg-[rgba(32,47,54,0.3)] rounded-xl p-4 md:p-6 space-y-3 mt-2 md:mt-0">
                                <div className="w-full max-w-2xl text-center mb-4">
                                  <p className="text-white text-base lg:text-lg inter-font">Someone sends you this message:</p>
                                  <p className=" text-yellow-400 font-semibold text-xl md:text-2xl mt-1">"{currentPuzzle.message}"</p>
                                </div>
                                <div>
                                    <p className="text-[#f1f7fb] inter-font font-medium text-sm mb-1.5">1. Pick an emoji to set the mood.</p>
                                    <div className="flex gap-2 md:gap-3 flex-wrap">
                                        {emojiOptions.map(emo => <Option key={emo} text={emo} isSelected={selections.emoji === emo} onClick={() => handleSelection('emoji', emo)} isEmoji />)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[#f1f7fb] inter-font font-medium text-sm mb-1.5">2. Select your tone.</p>
                                    <div className="flex flex-col md:flex-row gap-2 md:gap-3 inter-font">
                                        {toneTags.map(tag => <Option key={tag} text={tag} isSelected={selections.tone === tag} onClick={() => handleSelection('tone', tag)} />)}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[#f1f7fb] inter-font font-medium text-sm mb-1.5">3. Select your reply.</p>
                                    <div className="flex flex-col items-start gap-2 md:gap-3 inter-font">
                                        {currentPuzzle.options.map(opt => <Option key={opt} text={opt} isSelected={selections.reply === opt} onClick={() => handleSelection('reply', opt)} />)}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </main>

                <div className="absolute bottom-[10vh] left-1/2 -translate-x-1/2 w-full flex justify-center pointer-events-none">
                    <div className="pointer-events-auto">
                         <FeedbackCharacter isVisible={showFeedback} feedbackMessage={feedback} />
                    </div>
                </div>

                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        {isExampleVisible ? (
                             <button className="relative w-full h-full cursor-pointer" onClick={() => setIsExampleVisible(false)}>
                                <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000]">
                                    Start Game
                                </span>
                            </button>
                        ) : showFeedback ? (
                             <button className="relative w-full h-full cursor-pointer" onClick={handleContinueToNext}>
                                <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000]">
                                    Continue
                                </span>
                            </button>
                        ) : (
                            <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={!isSubmitEnabled}>
                                <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isSubmitEnabled ? "opacity-50" : ""}`}>
                                    Submit
                                </span>
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        );
    };

    return <>{renderGameContent()}</>;
};

export default ToneTuner;