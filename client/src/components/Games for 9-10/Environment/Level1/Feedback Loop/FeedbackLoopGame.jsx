import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { ArrowRight } from "lucide-react"; 
import axios from "axios";

// NEW: Import the notes data for this module
import { notesEnvironment9to10 } from "@/data/notesEnvironment9to10.js"; 

import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";

const APIKEY = import.meta.env.VITE_API_KEY;
// NEW: A unique key for this game's session storage
const SESSION_STORAGE_KEY = 'feedbackLoopGameState';

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

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

// NEW: Updated VictoryScreen with flexible height
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
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center p-4">
                            <div className="flex items-center">
                                <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                                <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center p-4 text-center">
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

// NEW: Updated LosingScreen with flexible height and "Review Notes" button
function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p>
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center mb-6">Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center p-4">
                           <div className="flex items-center">
                                <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                                <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center p-4 text-center">
                            <span className="text-[#FFCC00] inter-font text-xs font-normal">{insight}</span>
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
            <h1 className="text-3xl md:text-4xl font-bold font-['Lilita_One'] mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grow overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                  <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        <p className="text-gray-300 text-base mb-2 font-bold">Loop: {ans.cause}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Answer:</p>
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>
                                {ans.userSequence.join(" → ")}
                            </p>
                            {!ans.isCorrect && (
                                <>
                                    <p className="font-semibold pt-2">Correct Answer:</p>
                                    <p className="font-mono text-green-300">{ans.correctSequence.join(" → ")}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white font-['Lilita_One'] rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

// --- NEW POPUP COMPONENT ---
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
                        Exit Game
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

const GamePage = ({ questions, currentQuestion, showResult, selectedCard, setSelectedCard, checkAnswer, nextQuestion, isSystemShock, onProceedFromShock}) => {
    const currentQ = questions[currentQuestion];
    const isSubmitEnabled = selectedCard !== null;
    const cardStyle = "bg-[#131F24] border border-[#37464F] rounded-xl shadow-[0_2px_0_0_#37464F]";
    const selectedCardStyle = "bg-green-500/20 border border-green-700/80 text-white rounded-xl shadow-[0_2px_0_0_rgba(21,128,61,0.8)]";
    const renderContent = () => {
        if (isSystemShock) {
            return (
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-lg md:max-w-3xl bg-[rgba(54,32,32,0.4)] border border-red-800 rounded-xl p-6 sm:p-10 text-center flex flex-col items-center justify-center">
                        <div className="text-6xl mb-4">{currentQ.crashIcon || '💥'}</div>
                        <h2 className="font-['Inter'] font-bold text-4xl sm:text-5xl text-red-500 mb-6">SYSTEM SHOCK!</h2>
                        <p className="text-base sm:text-xl text-gray-200 leading-relaxed">{currentQ.crashMessage || "An incorrect choice can have disastrous consequences!"}</p>
                    </div>
                </div>
            );
        }
        if (showResult) {
            return (
                <div className="w-full flex flex-col items-center">
                    <div className="w-full max-w-lg md:max-w-3xl bg-[rgba(32,47,54,0.3)] rounded-xl p-6 sm:p-10 text-center flex flex-col items-center justify-center">
                        <h2 className="font-['Inter'] font-bold text-4xl sm:text-5xl text-[#6CFF00] mb-6">{currentQ.feedbackType} feedback</h2>
                        <p className="text-base sm:text-xl text-gray-200 leading-relaxed">{currentQ.explanation}</p>
                    </div>
                </div>
            );
        }
        return (
            <div className="w-full flex flex-col items-center gap-8 md:gap-14">
                <div className="hidden lg:flex items-center justify-center gap-4">
                    {currentQ.flowSteps.map((step, index) => (
                        <React.Fragment key={index}>
                            <div className={`flex flex-col gap-2 items-center justify-center text-center p-4 w-40 h-40 ${cardStyle}`}>
                                <div className="text-4xl">{step.icon}</div>
                                <span className="font-medium">{step.text}</span>
                            </div>
                            {index < currentQ.flowSteps.length - 1 && <ArrowRight size={32} className="text-gray-150" />}
                        </React.Fragment>
                    ))}
                </div>
                <div className="lg:hidden grid grid-cols-2 gap-x-8 gap-y-12 relative w-fit">
                    {currentQ.flowSteps.map((step, index) => (
                        <div key={index} className={`flex flex-col gap-2 items-center justify-center text-center p-3 w-36 h-36 ${cardStyle}`}>
                            <div className="text-4xl">{step.icon}</div>
                            <span className="font-semibold text-sm">{step.text}</span>
                        </div>
                    ))}
                    <ArrowRight size={24} className="absolute text-gray-150 top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <ArrowRight size={24} className="absolute text-gray-150 top-1/2 left-[calc(100%-77px)] -translate-y-1/2 -rotate-270" />
                    <ArrowRight size={24} className="absolute text-gray-150 top-3/4 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-180" />
                </div>
                <div>
                    <h3 className="font-medium text-lg text-center text-gray-150 mb-4">Choose the missing link</h3>
                    <div className="w-full max-w-sm md:max-w-4xl bg-[rgba(32,47,54,0.30)] rounded-xl py-6 px-7.5 border border-gray-700 backdrop-blur-md ">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 ">
                            {currentQ.linkCards.map((card) => (
                                <button key={card} onClick={() => setSelectedCard(card)} className={`text-center py-3 px-5 transition-colors duration-200 font-medium text-sm sm:text-base ${selectedCard === card ? selectedCardStyle : `${cardStyle} hover:bg-[#1f2d34]`}`}>{card}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="w-full min-h-screen bg-[#09160E] font-['Inter'] text-white flex flex-col">
            <GameNav />
            <main className="flex-grow w-full flex flex-col justify-center items-center p-4 sm:p-6 md:p-8 overflow-y-auto mt-24 md:mt-18">
                {renderContent()}
            </main>
            <footer className="w-full bg-[#28343A] py-5 flex justify-center items-center shrink-0">
                <div className="w-full max-w-xs h-16">
                    {isSystemShock ? (
                        <button onClick={onProceedFromShock} className="w-full h-full relative cursor-pointer group">
                            <Checknow className="w-full h-full transition-transform duration-200 ease-in-out group-hover:scale-105" topGradientColor={"#09be43"} bottomGradientColor={"#068F36"} />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Lilita_One'] text-3xl text-white [text-shadow:0_2px_0_#000]">Continue</span>
                        </button>
                    ) : !showResult ? (
                        <button onClick={checkAnswer} disabled={!isSubmitEnabled} className="w-full h-full relative cursor-pointer disabled:opacity-50 group">
                            <Checknow className="w-full h-full transition-transform duration-200 ease-in-out group-hover:scale-105" topGradientColor={"#09be43"} bottomGradientColor={"#068F36"} />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Lilita_One'] text-3xl text-white [text-shadow:0_2px_0_#000]">Submit</span>
                        </button>
                    ) : (
                        <button onClick={nextQuestion} className="w-full h-full relative cursor-pointer group">
                            <Checknow className="w-full h-full transition-transform duration-200 ease-in-out group-hover:scale-105" topGradientColor={"#09be43"} bottomGradientColor={"#068F36"} />
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-['Lilita_One'] text-3xl text-white [text-shadow:0_2px_0_#000]">Continue</span>
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
};

const toShuffleQuestions = [
    { id: 1, title: "Climate Warming Loop", flowSteps: [{ text: "Increased CO2", icon: "🏭" }, { text: "Global Warming", icon: "🌡️" }, { text: "More Forest Fires", icon: "🔥" }, { text: "???", icon: "❓" }], correctAnswer: "Release more CO2", linkCards: ["Release more CO2", "Create more oxygen", "Cool the atmosphere", "Increase rainfall"], feedbackType: "Positive", explanation: "POSITIVE feedback loop! Dark surfaces absorb more heat than white snow, accelerating warming even more!", crashMessage: "Without stopping this cycle, runaway climate change could make large areas of Earth uninhabitable!", crashIcon: "🌍💥" },
    { id: 5, title: "Snow Cover Loop", flowSteps: [{ text: "Global Warming", icon: "🌡️" }, { text: "Less Snow Cover", icon: "❄️" }, { text: "Reduced Reflection", icon: "☀️" }, { text: "???", icon: "❓" }], correctAnswer: "More heat absorption", linkCards: ["More heat absorption", "Increased snow formation", "Better light reflection", "Cooler surface temperatures"], feedbackType: "Positive", explanation: "POSITIVE feedback loop! Dark surfaces absorb more heat than white snow, accelerating warming even more!", crashMessage: "Arctic ice could disappear completely, raising sea levels and drowning coastal cities!", crashIcon: "🏝️🌊" },
    { id: 7, title: "Plant Growth Loop", flowSteps: [{ text: "Higher CO2", icon: "💨" }, { text: "Faster Plant Growth", icon: "🌱" }, { text: "More CO2 Absorbed", icon: "📉" }, { text: "???", icon: "❓" }], correctAnswer: "Reduced CO2 in atmosphere", linkCards: ["Reduced CO2 in atmosphere", "Less plant growth", "Increased emissions", "Warming intensifies"], feedbackType: "Negative", explanation: "This is a NEGATIVE feedback loop! Plants absorb more CO2, which helps balance atmospheric carbon and slow warming.", crashMessage: "Deforestation can break this helpful loop, worsening climate change.", crashIcon: "🌳💔" },
    { id: 8, title: "Cloud Formation Loop", flowSteps: [{ text: "More Evaporation", icon: "💧" }, { text: "Increased Cloud Cover", icon: "☁️" }, { text: "More Sunlight Reflected", icon: "🔆" }, { text: "???", icon: "❓" }], correctAnswer: "Cooling effect on Earth", linkCards: ["Cooling effect on Earth", "Higher global warming", "Less cloud formation", "More solar energy absorbed"], feedbackType: "Negative", explanation: "NEGATIVE feedback! More clouds can reflect sunlight, helping cool the Earth and reduce warming effects.", crashMessage: "Loss of cloud formation could accelerate climate heating.", crashIcon: "☁️🔥" },
];

const FeedbackLoopGame = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState("intro");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedCard, setSelectedCard] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [answersForReview, setAnswersForReview] = useState([]);
    const [showSystemShock, setShowSystemShock] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false); // --- NEW STATE FOR POPUP ---

    // NEW STATES FOR AI FEATURES
    const [insight, setInsight] = useState("");
    const [recommendedSectionId, setRecommendedSectionId] = useState(null);
    const [recommendedSectionTitle, setRecommendedSectionTitle] = useState("");

    // NEW: useEffect for restoring state from sessionStorage
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            setCurrentPage(savedState.currentPage);
            setCurrentQuestion(savedState.currentQuestion);
            setSelectedCard(savedState.selectedCard);
            setShowResult(savedState.showResult);
            setScore(savedState.score);
            setQuestions(savedState.questions);
            setAnswersForReview(savedState.answersForReview);
            setShowSystemShock(savedState.showSystemShock);
            setInsight(savedState.insight);
            setRecommendedSectionId(savedState.recommendedSectionId);
            setRecommendedSectionTitle(savedState.recommendedSectionTitle);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        } else {
            setQuestions([...toShuffleQuestions].sort(() => Math.random() - 0.5));
        }
    }, []);

    // NEW: useEffect for the AI Insight API call
    useEffect(() => {
        if (currentPage === 'finished' && !insight) {
            const generateInsight = async () => {
                setInsight("Analyzing your results...");
                const accuracyScore = Math.round((score / questions.length) * 100);
                const incorrectAnswers = answersForReview.filter(ans => !ans.isCorrect);

                if (incorrectAnswers.length === 0) {
                    setInsight("Perfect score! Your grasp of system dynamics is impressive!");
                    return;
                }
                
                const noteSectionsForModule = notesEnvironment9to10;
                const prompt = `
A student played a game on environmental feedback loops. Their incorrect answers are:
${JSON.stringify(incorrectAnswers)}
The available notes for the module are:
${JSON.stringify(noteSectionsForModule)}
TASK:
1. DETECT: Find the most relevant note section for these errors. The game is about feedback loops.
2. GENERATE: Write a short, encouraging feedback message (25-35 words) that specifically recommends the user review that section by its title.
OUTPUT: JSON with "detectedTopicId" and "insight".`;
                
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const parsed = parsePossiblyStringifiedJSON(response.data.candidates[0].content.parts[0].text);

                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = noteSectionsForModule.find(note => note.topicId === parsed.detectedTopicId);
                        setInsight(parsed.insight);
                        setRecommendedSectionId(parsed.detectedTopicId);
                        if (recommendedNote) {
                            setRecommendedSectionTitle(recommendedNote.title);
                        }
                    } else { throw new Error("Parsed AI response is invalid."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    setInsight("Great effort! To master feedback loops, try reviewing 'Module 1: The Earth as a System'.");
                    setRecommendedSectionId('m-1');
                    setRecommendedSectionTitle("Module 1: The Earth as a System");
                }
            };
            generateInsight();
        }
    }, [currentPage, score, questions.length, answersForReview, insight]);

    const checkAnswer = () => {
        if (showResult || showSystemShock) return;
        const currentQ = questions[currentQuestion];
        const isCorrect = selectedCard === currentQ.correctAnswer;
        setAnswersForReview(prev => [...prev, {
            cause: currentQ.title,
            userSequence: [selectedCard || "Not Answered"],
            correctSequence: [currentQ.correctAnswer],
            isCorrect,
        }]);
        if (isCorrect) {
            setScore(score + 1);
            setShowResult(true);
        } else {
            setShowSystemShock(true);
        }
    };

    const proceedFromShock = () => {
        setShowSystemShock(false);
        setShowResult(true);
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedCard(null);
            setShowResult(false);
        } else {
            setCurrentPage("finished");
        }
    };
    
    const resetGame = () => {
        setCurrentPage("intro");
        setCurrentQuestion(0);
        setSelectedCard(null);
        setShowResult(false);
        setShowSystemShock(false);
        setScore(0);
        setAnswersForReview([]);
        setInsight(""); // Clear insight on reset
        setRecommendedSectionId(null);
        setRecommendedSectionTitle("");
        setQuestions([...toShuffleQuestions].sort(() => Math.random() - 0.5));
    };
    
    // NEW: Handlers that manage session storage
    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            const stateToSave = {
                currentPage, currentQuestion, selectedCard, showResult, score, questions, answersForReview, showSystemShock, insight, recommendedSectionId, recommendedSectionTitle
            };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
            navigate(`/environmental/notes?grade=9-10&section=${recommendedSectionId}`);
        }
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        resetGame();
        setCurrentPage("game");
    };

    // --- MODIFIED & NEW HANDLERS FOR POPUP ---
    const handleContinue = () => {
        setPopupVisible(true);
    };

    const handleConfirmNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/MeasureCompareQuiz');
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
    // --- END MODIFIED & NEW HANDLERS ---

    const renderContent = () => {
        if (currentPage === "intro") return <IntroScreen onShowInstructions={() => setCurrentPage("instructions")} />;
        if (currentPage === "instructions") return <InstructionsScreen onStartGame={() => setCurrentPage("game")} />;
        
        if (currentPage === "game") {
            return questions.length > 0 ? (
                <GamePage
                    questions={questions}
                    currentQuestion={currentQuestion}
                    showResult={showResult}
                    selectedCard={selectedCard}
                    setSelectedCard={setSelectedCard}
                    checkAnswer={checkAnswer}
                    nextQuestion={nextQuestion}
                    isSystemShock={showSystemShock}
                    onProceedFromShock={proceedFromShock}
                />
            ) : <div className="w-full h-screen bg-[#09160E] flex items-center justify-center text-white text-2xl font-['Inter']">Loading Game...</div>;
        }

        if (currentPage === "finished") {
            const accuracyScore = Math.round((score / questions.length) * 100);
            const isVictory = accuracyScore >= 80;
            return isVictory ? (
                <VictoryScreen accuracyScore={accuracyScore} insight={insight} onViewFeedback={() => setCurrentPage("review")} onContinue={handleContinue} />
            ) : (
                <LosingScreen 
                    accuracyScore={accuracyScore} 
                    insight={insight} 
                    onPlayAgain={handlePlayAgain} 
                    onViewFeedback={() => setCurrentPage("review")} 
                    onContinue={handleContinue}
                    onNavigateToSection={handleNavigateToSection}
                    recommendedSectionTitle={recommendedSectionTitle}
                />
            );
        }
        if (currentPage === "review") return <ReviewScreen answers={answersForReview} onBackToResults={() => setCurrentPage("finished")} />;

        return null;
    }

    return (
        <>
            {renderContent()}
            <LevelCompletePopup
                isOpen={isPopupVisible}
                onConfirm={handleConfirmNavigation}
                onCancel={handleCancelNavigation}
                onClose={handleClosePopup}
            />
        </>
    );
};

export default FeedbackLoopGame;