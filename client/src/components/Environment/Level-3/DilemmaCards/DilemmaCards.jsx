import React, { useReducer, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";

// Data and Component Imports
import { notesEnvironment6to8 } from "@/data/notesEnvironment6to8.js";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import ThinkingCloud from "@/components/icon/ThinkingCloud";

// =============================================================================
// Constants and Configuration
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'dilemmaCardsGameState';
const PASSING_THRESHOLD = 0.75; // 75% to win

const dilemmas = [
    { id: 1, scenario: "Your school is planning to cut down 5 trees to expand parking for teachers’ cars.", options: [
        { text: "Protest with a placard and ask for a meeting with the principal", score: 2, consequence: "Good job! While protesting raises awareness, proposing a concrete solution is even more powerful." },
        { text: "Say nothing — not your problem", score: 0, consequence: "Choosing to be passive allows environmental damage to happen. Every voice matters in protecting our planet." },
        { text: "Suggest vertical parking or carpooling and saving the trees", score: 3, consequence: "Excellent! You proposed an innovative, eco-friendly solution that solves the problem without harming nature." },
    ]},
    { id: 2, scenario: "Your school canteen only uses plastic plates, cups, and spoons every day.", options: [
        { text: "Bring your own steel tiffin and ask friends to do the same", score: 3, consequence: "Perfect! By setting a personal example, you start a powerful student-led movement for change." },
        { text: "Complain to the principal about health hazards of plastic", score: 2, consequence: "Raising the issue is a good step, but suggesting a practical alternative would be even more effective." },
        { text: "Ignore — it’s convenient and fast", score: 0, consequence: "Convenience shouldn't come at the cost of our planet's health. This choice adds to the plastic pollution problem." },
    ]},
    { id: 3, scenario: "Students keep the classroom AC on even when windows are open.", options: [
        { text: "Close the windows every time and remind others", score: 2, consequence: "This is a responsible action! You're actively stopping energy waste in the moment." },
        { text: "Enjoy the cool — it’s not your electricity bill", score: 0, consequence: "This mindset wastes valuable resources. Collective responsibility is key to energy conservation." },
        { text: "Talk to the class teacher about putting up an energy-saving rule", score: 3, consequence: "Great initiative! Creating a system-level change has a long-lasting impact beyond just one classroom." },
    ]},
    { id: 4, scenario: "Your school is organizing a big celebration. Everything is plastic — balloons, flex banners, decorations.", options: [
        { text: "Offer to make eco-friendly décor from paper and cloth with your class", score: 3, consequence: "Fantastic! You've turned a wasteful event into a creative, sustainable, and memorable one." },
        { text: "Ask the principal to cancel the event", score: 1, consequence: "While your intention is good, cancelling isn't always the answer. Finding a green alternative is a better approach." },
        { text: "Just enjoy — it’s once a year", score: 0, consequence: "This 'once a year' mindset, when adopted by many, leads to massive amounts of holiday waste." },
    ]},
    { id: 5, scenario: "The school throws away fruit peels and leftover food into regular dustbins.", options: [
        { text: "Propose a compost bin and volunteer to maintain it", score: 3, consequence: "Amazing! You're turning waste into a valuable resource that can nourish the school garden." },
        { text: "Write an anonymous note to the teacher", score: 1, consequence: "While it raises awareness, taking ownership of the idea is much more likely to lead to real action." },
        { text: "Pretend not to notice", score: 0, consequence: "Ignoring the problem of food waste contributes to landfill build-up and the release of harmful greenhouse gases." },
    ]},
];

const PERFECT_SCORE = dilemmas.length * 3;
const scrollbarHideStyle = `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;

// =============================================================================
// Helper Functions
// =============================================================================
function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    if (text.startsWith("`") && text.endsWith("`")) text = text.slice(1, -1).trim();
    try { return JSON.parse(text); }
    catch (err) { console.error("Failed to parse JSON:", err); return null; }
}

// =============================================================================
// State Management (Reducer)
// =============================================================================
const initialState = {
    gameState: "intro",
    currentDilemmaIndex: 0,
    selectedOption: null,
    score: 0,
    answers: [],
    feedback: { visible: false, message: "" },
    insight: "",
    recommendedSectionId: null,
    recommendedSectionTitle: "",
};

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing" };
        case "RESET_GAME": return { ...initialState, gameState: "playing" };
        case "SELECT_OPTION":
            if (state.feedback.visible) return state;
            return { ...state, selectedOption: action.payload };
        case "SUBMIT_ANSWER": {
            if (!state.selectedOption) return state;
            const { score, consequence } = state.selectedOption;
            return {
                ...state,
                score: state.score + score,
                feedback: { visible: true, message: consequence },
                answers: [...state.answers, {
                    scenario: dilemmas[state.currentDilemmaIndex].scenario,
                    selectedOption: state.selectedOption,
                    scoreAwarded: score,
                }],
            };
        }
        case "NEXT_DILEMMA": {
            if (state.currentDilemmaIndex < dilemmas.length - 1) {
                return {
                    ...state,
                    currentDilemmaIndex: state.currentDilemmaIndex + 1,
                    selectedOption: null,
                    feedback: { visible: false, message: "" },
                };
            }
            return { ...state, gameState: "finished" };
        }
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "SET_AI_INSIGHT": return { ...state, ...action.payload };
        default: return state;
    }
}

// =============================================================================
// UI Components
// =============================================================================
function OptionCard({ option, isSelected, onClick, isDisabled }) {
    const cardClasses = `flex items-center justify-center 
        w-full min-h-[60px] px-4 py-3 rounded-xl shadow-md cursor-pointer text-center transition-all duration-200 ease-in-out 
        lg:w-[26vw] lg:min-h-[9vh] lg:px-[2vw] lg:py-[1.5vh] lg:rounded-[1.2vh] lg:shadow-[0_2px_0_0_#37464f] 
        ${isSelected ? "bg-[#202f36] border-2 lg:border-[0.2vh] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]" : "bg-[#131f24] border-2 lg:border-[0.2vh] border-[#37464f]"} 
        ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "hover:scale-102"}`;

    const textClasses = `font-['Inter'] font-medium 
        text-sm leading-normal 
        lg:text-[1.1vw] lg:leading-[3vh] 
        ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}`;

    return (<div className={cardClasses} onClick={onClick}><span className={textClasses}>{option.text}</span></div>);
}

function FeedbackCharacter({ message }) {
    // This component now handles both the mobile (centered) and desktop (absolute) layouts internally.
    return (
        <div className="relative flex items-end justify-center lg:absolute lg:block lg:-right-[5vw] lg:top-[46vh]">
            <img 
                src="/feedbackcharacter.gif" 
                alt="Character talking" 
                className="w-24 h-auto object-contain lg:w-[10vw] lg:h-[15vh]" 
            />
            <div className="relative bottom-[5vh] lg:absolute lg:left-[7.5vw] lg:bottom-[5vh]">
                <ThinkingCloud className="w-[250px] lg:w-[18vw]"/>
                <p className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] text-xs text-white text-center font-['Comic_Neue']
                                 ">
                    {message}
                </p>
            </div>
        </div>
    );
}

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
                        <p className="text-black text-sm font-bold my-2 uppercase">Decision Score</p>
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
                        <p className="text-black text-sm font-bold my-2 uppercase">Decision Score</p>
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
                        <button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg">
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

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Choices</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => {
                    const isBestChoice = ans.scoreAwarded === 3;
                    return (
                        <div key={idx} className={`p-4 rounded-xl flex flex-col ${isBestChoice ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                            <p className="text-gray-300 text-base mb-2 font-bold">{ans.scenario}</p>
                            <div className="text-sm space-y-1">
                                <p className="font-semibold">Your Choice:</p>
                                <p className="font-mono text-white">{ans.selectedOption.text || "Not Answered"}</p>
                                <p className="font-semibold pt-2">Consequence:</p>
                                <p className="font-mono text-gray-300">{ans.selectedOption.consequence}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button
                onClick={onBackToResults}
                className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

function FinalLevelPopup({ isOpen, onConfirm, onClose }) {
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
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2 rounded-full"
                    aria-label="Close"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
                
                <div className="relative w-24 h-24 mx-auto mb-4">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="lilita-one-regular text-2xl md:text-3xl text-yellow-400 mb-6 px-4">
                    Yayy! You successfully completed all the levels.
                </h2>
                <div className="flex justify-center items-center">
                    <button
                        onClick={onConfirm}
                        className="px-8 py-3 bg-green-600 text-lg text-white lilita-one-regular rounded-md hover:bg-green-700 transition-colors border-b-4 border-green-800 active:border-transparent shadow-lg"
                    >
                        Go to Games Page
                    </button>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// Main Game Component: DilemmaCardsGame
// =============================================================================
export default function DilemmaCardsGame() {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [isPopupVisible, setPopupVisible] = useState(false); // --- NEW STATE FOR POPUP ---
    const currentDilemma = useMemo(() => dilemmas[state.currentDilemmaIndex], [state.currentDilemmaIndex]);

    // AI Insight logic and other hooks remain unchanged
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            dispatch({ type: 'RESTORE_STATE', payload: JSON.parse(savedStateJSON) });
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);

    useEffect(() => {
        if (state.gameState === 'finished' && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your choices...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const suboptimalChoices = state.answers.filter(a => a.scoreAwarded < 3);
                if (suboptimalChoices.length === 0 && state.answers.length > 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Fantastic! You're an expert at finding proactive, eco-friendly solutions.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }
                const prompt = `
You are an AI tutor analyzing a student's choices in an environmental dilemma game.
### CONTEXT ###
1.  **Student's Suboptimal Choices (score < 3):**
    ${JSON.stringify(suboptimalChoices.map(c => ({ dilemma: c.scenario, their_choice: c.selectedOption.text, their_score: c.scoreAwarded })), null, 2)}
2.  **All Available Note Sections for this Module:**
    ${JSON.stringify(notesEnvironment6to8, null, 2)}
### YOUR TWO-STEP TASK ###
1.  **Step 1: DETECT.** The student is choosing passive (score 0) or reactive (score 1-2) solutions instead of proactive ones (score 3). Find the ONE note section that best teaches leadership, creative problem-solving, and taking initiative for environmental action.
2.  **Step 2: GENERATE.** Provide a short, encouraging insight (25-30 words). Encourage them to think about proactive solutions that prevent problems. Recommend they review the detected note section by its 'title' to become a better environmental leader.
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the section about proactive solutions.",
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
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good start! To improve, try focusing more on proactive solutions instead of just reacting to problems.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);
    
    // --- MODIFIED & NEW HANDLERS FOR POPUP ---
    const handleNavigateToSection = () => { if (state.recommendedSectionId) { sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state)); navigate(`/environmental/notes?grade=6-8&section=${state.recommendedSectionId}`); }};
    const handlePlayAgain = () => { sessionStorage.removeItem(SESSION_STORAGE_KEY); dispatch({ type: 'RESET_GAME' }); };
    
    const handleContinue = () => {
        setPopupVisible(true);
    };

    const handleGoToGames = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/environmental/games');
        setPopupVisible(false);
    };

    const handleClosePopup = () => {
        setPopupVisible(false);
    };
    // --- END MODIFIED & NEW HANDLERS ---
    
    const handleReviewAnswers = () => dispatch({ type: 'REVIEW_GAME' });
    const handleBackToResults = () => dispatch({ type: 'BACK_TO_FINISH' });

    const { gameState, selectedOption, score, feedback } = state;
    const buttonText = feedback.visible ? "Continue" : "Check Now";
    const isButtonEnabled = feedback.visible || selectedOption !== null;

    const renderGameContent = () => {
        if (gameState === "intro") return <IntroScreen onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })} />;
        if (gameState === "instructions") return <InstructionsScreen onStartGame={() => dispatch({ type: "START_GAME" })} />;

        if (gameState === "finished") {
            const accuracyScore = Math.round((score / PERFECT_SCORE) * 100);
            const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={handleReviewAnswers} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={handleReviewAnswers} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
        }

        if (gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={handleBackToResults} />;

        return (
            <div className="main-container w-full h-screen bg-[#0A160E] relative overflow-hidden flex flex-col justify-between">
                <style>{scrollbarHideStyle}</style>
                <GameNav />
                
                <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
                    {/* Centering container */}
                    <div className="flex-grow flex items-center justify-center p-4">

                        {/* This div is the layout switcher. It's a single card on mobile, and a transparent flex container on desktop. */}
                        <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-10
                                        lg:w-auto lg:max-w-none lg:bg-transparent lg:p-0 lg:flex lg:flex-row lg:items-center lg:justify-center lg:gap-[2vw]">
                            
                            {/* --- Options Container --- */}
                            {/* On desktop (lg), it's a styled box. On mobile, it's part of the single card. */}
                            <div className="w-full max-w-lg mx-auto lg:w-auto lg:max-w-none lg:order-1 lg:bg-[rgba(32,47,54,0.3)] lg:py-[4.6vh] lg:px-[2.4vh] lg:rounded-[1.2vh]">
                                {/* Scenario is presented here on mobile/tablet screens */}
                                <div className="text-center lg:hidden mb-6">
                                    <p className="text-slate-100 text-xl md:text-2xl font-medium leading-snug">
                                        {currentDilemma.scenario}
                                    </p>
                                </div>

                                {/* The list of options */}
                                <div className="flex flex-col gap-4 lg:gap-[2.8vh]">
                                    {currentDilemma.options.map((option) => (
                                        <OptionCard
                                            key={option.text}
                                            option={option}
                                            isSelected={selectedOption?.text === option.text}
                                            onClick={() => dispatch({ type: 'SELECT_OPTION', payload: option })}
                                            isDisabled={feedback.visible && selectedOption?.text !== option.text}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* --- Scenario Container (Desktop-only view) --- */}
                            {/* This is hidden on mobile, as the scenario is shown above. */}
                            <div className="hidden lg:flex flex-col justify-center items-center relative lg:order-2 lg:w-[28vw] lg:h-[42vh] lg:p-[2vh] lg:bg-[rgba(32,47,54,0.3)] lg:rounded-[1.2vh] text-white">
                                <span className="font-['Inter'] text-[1.1vw] font-medium leading-[4vh] text-center max-w-[30vw]">
                                    {currentDilemma.scenario}
                                </span>
                                
                                {/* Feedback character for desktop is positioned absolutely inside this box */}
                                {feedback.visible && <FeedbackCharacter message={feedback.message} />}
                            </div>
                        </div>
                    </div>

                    {/* --- Feedback Area (Mobile/Tablet-only view) --- */}
                    {/* A dedicated space at the bottom, exactly like the example layout. */}
                    <div className="w-full h-28 md:h-32 flex justify-center items-end shrink-0 lg:hidden">
                        <div className={`transition-opacity duration-300 ${feedback.visible ? 'opacity-100' : 'opacity-0'}`}>
                            {feedback.visible && <FeedbackCharacter message={feedback.message} />}
                        </div>
                    </div>
                </div>

                {/* --- Footer / Action Bar --- */}
                <div className="w-full h-24 lg:h-[10vh] bg-[#28343A] flex justify-center items-center px-4 z-10 shrink-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-14 lg:h-[8vh]">
                        <button className="relative w-full h-full cursor-pointer" onClick={() => dispatch({ type: feedback.visible ? 'NEXT_DILEMMA' : 'SUBMIT_ANSWER' })} disabled={!isButtonEnabled}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute text-nowrap top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>{buttonText}</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <>
            {renderGameContent()}
            <FinalLevelPopup
                isOpen={isPopupVisible}
                onConfirm={handleGoToGames}
                onClose={handleClosePopup}
            />
        </>
    );
}