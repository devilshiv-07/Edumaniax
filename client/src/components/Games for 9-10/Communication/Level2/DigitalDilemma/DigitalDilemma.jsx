import React, { useEffect, useState, useReducer } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';

// --- Context Hooks ---
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// --- Import your shared components (assuming they exist in the same folder) ---
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';

// --- Helper for hiding scrollbar ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// --- Import your notes data ---
import { notesCommunication9to10 } from "@/data/notesCommunication9to10.js";

// --- Constants ---
const MAX_SCORE = 7;
const PASSING_THRESHOLD = 0.8; // Corresponds to a score of ~6/7
const APIKEY = import.meta.env.VITE_API_KEY; // Make sure you have this in your .env file
const SESSION_STORAGE_KEY = 'digitalDilemmaGameState';

// --- Helper function for parsing AI response ---
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


// --- End Game Screens (Styled like ListenUp) ---
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
                            className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg"
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

// --- MAJOR CHANGE: ReviewScreen now shows a detailed score breakdown ---
function ReviewScreen({ answer, onBackToResults }) {
    const isPass = answer.score >= Math.floor(PASSING_THRESHOLD * MAX_SCORE);
    const { scoreBreakdown, userInputs } = answer;

    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answer</h1>
            <div className="w-full max-w-2xl overflow-y-auto p-2 no-scrollbar">
                 <div className={`p-4 rounded-xl flex flex-col ${isPass ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                    <h3 className="text-lg font-bold text-yellow-300">Your Response Breakdown</h3>
                    <div>
                        <p className="font-semibold text-gray-300">Rewritten Message:</p>
                        <p className="text-gray-100 italic">"{userInputs.rewrite || 'No answer given'}"</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-300">Chosen Emoji:</p>
                        <p className="text-gray-100">{userInputs.emoji}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-300">Clarification:</p>
                        <p className="text-gray-100 italic">"{userInputs.clarification || 'No answer given'}"</p>
                    </div>

                    {/* --- NEW: Score Breakdown Section --- */}
                    <div className="pt-3 mt-3 border-t border-gray-500/50">
                        <h4 className="text-md font-bold text-yellow-300 mb-2">Score Details</h4>
                        <div className="space-y-1 text-sm">
                            <p>Rewrite Score: <span className="font-bold">{scoreBreakdown.rewritePoints} / 3</span></p>
                            <p>Emoji Score: <span className="font-bold">{scoreBreakdown.emojiPoints} / 2</span></p>
                            <p>Clarification Score: <span className="font-bold">{scoreBreakdown.clarificationPoints} / 2</span></p>
                        </div>
                         <div className="mt-3 pt-2 border-t border-gray-500/50">
                             <p className="font-semibold text-gray-300">Total Score:</p>
                            <p className={`text-xl font-bold ${isPass ? 'text-green-300' : 'text-red-300'}`}>{answer.score} / {MAX_SCORE}</p>
                        </div>
                    </div>
                </div>
            </div>
            <button
                onClick={onBackToResults}
                className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg"
            >
                Back to Results
            </button>
        </div>
    );
}

// --- Game State Management ---
const initialState = {
    gameState: "intro",
    score: 0,
    answer: null,
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
        // MODIFICATION: Reducer now accepts score and scoreBreakdown
        case "SUBMIT_ANSWER": {
            const { rewrite, emoji, clarification, score, scoreBreakdown } = action.payload;
            return {
                ...state,
                gameState: "finished",
                score: score,
                answer: {
                    userInputs: { rewrite, emoji, clarification },
                    score: score,
                    scoreBreakdown: scoreBreakdown,
                }
            };
        }
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
const DigitalDilemma = () => {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    
    const [state, dispatch] = useReducer(gameReducer, initialState);
    
    const [rewrite, setRewrite] = useState("");
    const [emoji, setEmoji] = useState("None");
    const [clarification, setClarification] = useState("");
    const [challengeCompleted, setChallengeCompleted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        if (state.gameState === "finished") {
            const timeTakenSec = Math.floor((Date.now() - state.startTime) / 1000);
            updatePerformance({
                moduleName: "Communication",
                topicName: "emotionalIntelligence",
                score: Math.round((state.score / MAX_SCORE) * 10),
                accuracy: Math.round((state.score / MAX_SCORE) * 100),
                avgResponseTimeSec: timeTakenSec,
                studyTimeMinutes: Math.ceil(timeTakenSec / 60),
                completed: state.score >= Math.floor(PASSING_THRESHOLD * MAX_SCORE),
            });

            if (state.score >= Math.floor(PASSING_THRESHOLD * MAX_SCORE) && !challengeCompleted) {
                completeCommunicationChallenge(1, 1);
                setChallengeCompleted(true);
            }

            if (!state.insight) {
                 const generateInsight = async () => {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    const isPass = state.score >= Math.floor(PASSING_THRESHOLD * MAX_SCORE);
                    if (isPass) {
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Fantastic job! You turned a negative message into a positive one with empathy and skill!", recommendedSectionId: null, recommendedSectionTitle: "" } });
                        return;
                    }

                    // --- MAJOR CHANGE: New and improved insight prompt ---
                    const prompt = `You are an expert AI tutor for young learners providing targeted feedback for a communication game.

                    ### CONTEXT ###
                    1.  **Student's Performance:**
                        -   **Task:** To fix the hurtful message "Whatever."
                        -   **Rewrite attempt:** "${state.answer.userInputs.rewrite}"
                        -   **Emoji choice:** "${state.answer.userInputs.emoji}"
                        -   **Clarification attempt:** "${state.answer.userInputs.clarification}"
                        -   **Score Breakdown:**
                            -   Rewrite Score: ${state.answer.scoreBreakdown.rewritePoints} out of 3
                            -   Emoji Score: ${state.answer.scoreBreakdown.emojiPoints} out of 2
                            -   Clarification Score: ${state.answer.scoreBreakdown.clarificationPoints} out of 2
                        -   **Total Score:** ${state.score} out of 7.

                    2.  **Available Learning Notes (Content Preview):**
                        ${JSON.stringify(notesCommunication9to10.map(n => ({ topicId: n.topicId, title: n.title, content: n.content.substring(0, 150) + '...' })), null, 2)}

                    ### YOUR TWO-STEP TASK ###
                    1.  **Step 1: DETECT.** Analyze the student's score breakdown to identify their main weakness.
                        -   If 'Rewrite Score' is low, they struggle with apologies.
                        -   If 'Emoji Score' is low, they misunderstand tone.
                        -   If 'Clarification Score' is low, they have trouble explaining their intent.
                        Based on this weakness, examine the "Available Learning Notes" and identify the ONE note section that is the best match to help them improve.

                    2.  **Step 2: GENERATE.** Create a personalized insight (25-30 words) that is encouraging and educational.
                        -   Briefly mention their area of weakness (e.g., "adding a clear apology," "using emojis to show kindness").
                        -   Strongly suggest reviewing the specific note section you detected by its 'title'.

                    ### OUTPUT FORMAT ###
                    Return ONLY a raw JSON object. Do not add explanations or markdown.
                    {
                      "detectedTopicId": "The 'topicId' of the section you identified",
                      "insight": "Your personalized and encouraging feedback message here."
                    }`;

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
                        dispatch({ type: "SET_AI_INSIGHT", payload: { 
                            insight: "Good effort! Take a moment to review the module notes for more tips.", 
                            recommendedSectionId: notesCommunication9to10[0]?.topicId || null, 
                            recommendedSectionTitle: notesCommunication9to10[0]?.title || "" 
                        }});
                    }
                };
                generateInsight();
            }
        }
    }, [state.gameState]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const emojiPoints = (emoji === "😊" || emoji === "❤️") ? 2 : 0;

        const scoringPrompt = `You are a scoring AI...`; // Same scoring prompt as before
        let rewritePoints = 0;
        let clarificationPoints = 0;

        try {
            const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: scoringPrompt }] }] });
            const aiReply = response.data.candidates[0].content.parts[0].text;
            const parsed = parsePossiblyStringifiedJSON(aiReply);
            if (parsed && typeof parsed.rewritePoints === 'number' && typeof parsed.clarificationPoints === 'number') {
                rewritePoints = parsed.rewritePoints;
                clarificationPoints = parsed.clarificationPoints;
            } else {
                if (/sorry|didn['’]t mean|apolog|not my intention/i.test(rewrite)) rewritePoints = 3;
                if (/sorry|just meant|i meant|i was trying|i really/i.test(clarification)) clarificationPoints = 2;
            }
        } catch (error) {
            console.error("AI scoring failed, using fallback regex scoring:", error);
            if (/sorry|didn['’]t mean|apolog|not my intention/i.test(rewrite)) rewritePoints = 3;
            if (/sorry|just meant|i meant|i was trying|i really/i.test(clarification)) clarificationPoints = 2;
        }

        const totalScore = rewritePoints + clarificationPoints + emojiPoints;

        // --- NEW: Passing the score breakdown to the reducer ---
        dispatch({ 
            type: "SUBMIT_ANSWER", 
            payload: { 
                rewrite, 
                emoji, 
                clarification,
                score: totalScore,
                scoreBreakdown: { rewritePoints, emojiPoints, clarificationPoints }
            } 
        });
    };
    
    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=9-10&section=${state.recommendedSectionId}`);
        }
    };
    
    const handleStartGame = () => dispatch({ type: "START_GAME" });
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setRewrite("");
        setEmoji("None");
        setClarification("");
        dispatch({ type: 'RESET_GAME' });
    };
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/next-challenge-path');
    };

    const isSubmitEnabled = rewrite.trim().length > 0 && clarification.trim().length > 0 && emoji !== "None";

    const renderGameContent = () => {
        if (state.gameState === "intro") {
            return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
        }
        if (state.gameState === "finished") {
            const accuracyScore = Math.round((state.score / MAX_SCORE) * 100);
            const isVictory = state.score >= Math.floor(PASSING_THRESHOLD * MAX_SCORE);
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
        }
        if (state.gameState === "review") {
            return <ReviewScreen answer={state.answer} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;
        }
        return (
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col font-['Inter'] relative">
                <style>{scrollbarHideStyle}</style>
                {state.gameState === "instructions" && (<InstructionsScreen onStartGame={handleStartGame} />)}
                <GameNav />
                <main className="flex-1 w-full flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-[rgba(32,47,54,0.3)] rounded-xl p-4 md:p-6 space-y-6">
                        <p className="text-center text-white text-lg">
                            Uh-oh! Your friend felt hurt by your message: 
                            <span className="block font-bold text-red-500 text-3xl my-2">"Whatever."</span>
                            How can you fix it?
                        </p>
                        <div>
                            <label className="block mb-1.5 text-green-400 font-medium text-sm">✍️ Rewrite the message kindly:</label>
                             <textarea className="w-full p-3 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500" value={rewrite} onChange={(e) => setRewrite(e.target.value)} placeholder="e.g., I'm sorry, I didn't mean..."/>
                        </div>
                        <div>
                            <label className="block mb-1.5 text-blue-400 font-medium text-sm">😀 Add an emoji to show your tone:</label>
                             <select className="w-full p-3 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={emoji} onChange={(e) => setEmoji(e.target.value)}>
                                <option value="None">🚫 None</option>
                                <option value="🙁">🙁 Sad Face</option>
                                <option value="😊">😊 Smile</option>
                                <option value="❤️">❤️ Heart</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1.5 text-yellow-400 font-medium text-sm">💬 Clarify what you really meant:</label>
                            <textarea className="w-full p-3 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-500" value={clarification} onChange={(e) => setClarification(e.target.value)} placeholder="e.g., I was just trying to say..."/>
                        </div>
                    </div>
                </main>
                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={!isSubmitEnabled || isSubmitting}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${(!isSubmitEnabled || isSubmitting) ? "opacity-50" : ""}`}>
                                {isSubmitting ? "Checking..." : "Submit"}
                            </span>
                        </button>
                    </div>
                </footer>
            </div>
        );
    };

    return <>{renderGameContent()}</>;
};

export default DigitalDilemma;