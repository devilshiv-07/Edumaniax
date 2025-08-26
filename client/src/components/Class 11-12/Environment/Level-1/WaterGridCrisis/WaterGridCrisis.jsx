import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { Star } from "lucide-react";
import axios from "axios";

// NEW: Import the notes data for this module
import { notesEnvironment11to12 } from "@/data/notesEnvironment11to12.js";

// Your original component imports are preserved
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";

// =============================================================================
// Gemini API and Session Storage Setup
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'waterGridCrisisState'; // Unique key for this game

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

// =============================================================================
// NEW: Fully Featured End-Screen Components
// =============================================================================
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

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
                            <span className="text-[#FFCC00] lilita-one-regular text-xs font-normal">{insight}</span>
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
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ reviewData, onBackToResults, gameData, gameSteps }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center inter-font">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
            <div className="flex-grow w-full overflow-y-auto no-scrollbar">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                    {gameSteps.map(questionKey => {
                        const question = gameData[questionKey];
                        const result = reviewData[questionKey];
                        const userAnswer = Array.isArray(result.userAnswer) 
                            ? result.userAnswer.join(', ') 
                            : result.userAnswer;
                        const correctAnswer = Array.isArray(question.correctAnswer || question.correctAnswers)
                            ? (question.correctAnswer || question.correctAnswers).join(', ')
                            : question.correctAnswer;

                        return (
                            <div key={question.id} className={`p-4 rounded-xl flex flex-col ${result.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                                <p className="text-gray-200 text-lg mb-1 font-bold">{question.title}</p>
                                <p className="text-gray-400 text-xs mb-4 font-medium whitespace-pre-wrap border-l-2 border-gray-600 pl-2">
                                    {question.prompt}
                                </p>
                                <div className="text-sm space-y-1 ">
                                    <p className="font-semibold">Your Answer:</p>
                                    <p className={`break-words ${result.isCorrect ? 'text-green-300' : 'text-red-300'}`}>{userAnswer || "Not Answered"}</p>
                                    {!result.isCorrect && (
                                        <>
                                            <p className="font-semibold pt-2">Correct Answer:</p>
                                            <p className="text-green-300 break-words">{correctAnswer}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
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

// YOUR ORIGINAL GAME DATA - UNCHANGED
const gameData = {
    q1: { id: 1, type: "single", title: "🌫️ Q1: Missing Flowchart Step", prompt: "Flow: Evaporation → ? → Precipitation → Infiltration", options: ["Condensation", "Runoff", "Transpiration"], correctAnswer: "Condensation" },
    q2: { id: 2, type: "multi-select-2", title: "🌆 Q2: Urban Scenario", prompt: "A city replaced wetlands, leading to heavy flooding and groundwater loss. Which 2 steps of the water cycle are most disrupted?", options: ["Transpiration", "Infiltration", "Runoff", "Ocean absorption"], correctAnswers: ["Infiltration", "Runoff"] },
    q3: { id: 3, type: "multi-select-2", title: "💦 Q3: Action Time", prompt: "Pick 2 urgent fixes for the city’s water crisis:", options: ["Build more dams", "Ban borewells", "Restore green recharge zones", "Introduce rainwater harvesting"], correctAnswers: ["Restore green recharge zones", "Introduce rainwater harvesting"] },
    q4: { id: 4, type: "single", title: "🎉 Q4: FINAL ESCAPE PUZZLE", prompt: `“I move through plants but don't have leaves,\nI cycle through rocks but never grieves,\nYou broke my flow but made amends —\nNow Earth can breathe and life extends.”`, options: ["Photosynthesis", "Biogeochemical Cycle", "Hydraulic Pump"], correctAnswer: "Biogeochemical Cycle" },
};
const gameSteps = ["q1", "q2", "q3", "q4"];

// YOUR ORIGINAL CHILD COMPONENTS - UNCHANGED
function SingleChoiceQuestion({ question, selectedAnswer, setSelectedAnswer }) {
    return (
        <div className="w-full max-w-3xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
            <div className="flex flex-col justify-center items-start gap-10">
                <div className="px-1 flex flex-col justify-center items-start gap-2">
                    <h2 className="text-slate-100 text-xl md:text-2xl font-medium leading-9 whitespace-pre-wrap">{question.title}</h2>
                    <p className="text-slate-100 text-xs md:text-base font-semibold leading-relaxed whitespace-pre-wrap">{question.prompt}</p>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswer === option;
                        return (
                            <div key={option} onClick={() => setSelectedAnswer(option)} className={`self-stretch lg:min-h-[60px] px-6 py-3 lg:py-0 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border flex items-center cursor-pointer transition-all ${isSelected ? "bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]" : "bg-gray-900 border-gray-700 hover:bg-gray-800"}`}>
                                <span className={`text-sm lg:text-base font-medium leading-relaxed ${isSelected ? "text-[#79b933]" : "text-slate-100"}`}>{option}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
function MultiSelectQuestion({ question, selectedAnswers, setSelectedAnswers }) {
    const handleSelect = (option) => {
        let newAnswers;
        if (selectedAnswers.includes(option)) {
            newAnswers = selectedAnswers.filter(item => item !== option);
        } else if (selectedAnswers.length < 2) {
            newAnswers = [...selectedAnswers, option];
        } else {
            newAnswers = selectedAnswers;
        }
        setSelectedAnswers(newAnswers);
    };
    return (
        <div className="w-full max-w-3xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
            <div className="flex flex-col justify-center items-start gap-10">
                <div className="px-1 flex flex-col justify-center items-start gap-2">
                    <h2 className="text-slate-100 text-xl md:text-2xl font-medium leading-9">{question.title}</h2>
                    <p className="text-slate-100 text-xs md:text-base font-semibold leading-relaxed">{question.prompt}</p>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswers.includes(option);
                        return (
                            <div key={option} onClick={() => handleSelect(option)} className={`self-stretch lg:min-h-[60px] px-6 py-3 lg:py-0 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border flex items-center cursor-pointer transition-all ${isSelected ? "bg-[#202f36] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]" : "bg-gray-900 border-gray-700 hover:bg-gray-800"}`}>
                                <span className={`text-sm lg:text-base font-medium leading-relaxed ${isSelected ? "text-[#79b933]" : "text-slate-100"}`}>{option}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function WaterGridCrisis() {
    const navigate = useNavigate();
    
    // YOUR ORIGINAL useState LOGIC IS PRESERVED
    const [gameState, setGameState] = useState("intro");
    const [introStep, setIntroStep] = useState("first"); 
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [answers, setAnswers] = useState({ q1: null, q2: [], q3: [], q4: null });
    const [finalResults, setFinalResults] = useState(null);
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
            setGameState(savedState.gameState);
            setIntroStep(savedState.introStep);
            setCurrentStepIndex(savedState.currentStepIndex);
            setAnswers(savedState.answers);
            setFinalResults(savedState.finalResults);
            setInsight(savedState.insight);
            setRecommendedSectionId(savedState.recommendedSectionId);
            setRecommendedSectionTitle(savedState.recommendedSectionTitle);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);

    // MODIFIED: AI useEffect with all features
    useEffect(() => {
        if (gameState === 'end' && finalResults && !insight) {
            const generateInsight = async () => {
                setInsight("Analyzing your results...");
                const noteSectionsForModule = notesEnvironment11to12;
                const prompt = `A student completed a 4-part quiz on the Water Cycle. Their accuracy was ${finalResults.accuracy}%. Their specific results are: ${JSON.stringify(finalResults.review)}. The available notes are: ${JSON.stringify(noteSectionsForModule)}. TASK: 1. DETECT: Find the most relevant note section. The game is about the Water Cycle, part of biogeochemical cycles. 2. GENERATE: Write a 25-35 word insight recommending that section by title. OUTPUT: JSON with "detectedTopicId" and "insight".`;

                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const parsed = parsePossiblyStringifiedJSON(response.data.candidates[0].content.parts[0].text);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = noteSectionsForModule.find(note => note.topicId === parsed.detectedTopicId);
                        setInsight(parsed.insight);
                        setRecommendedSectionId(parsed.detectedTopicId);
                        if (recommendedNote) setRecommendedSectionTitle(recommendedNote.title);
                    } else { throw new Error("Parsed AI response is invalid."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    setInsight("Great work on a complex topic! To master this, a review of 'Unit 1: Biogeochemical Cycles' will connect all the dots.");
                    setRecommendedSectionId('s-1');
                    setRecommendedSectionTitle("Unit 1: Biogeochemical Cycles");
                }
            };
            generateInsight();
        }
    }, [gameState, finalResults, insight]);

    // UNCHANGED Game Logic Functions
    const startGame = () => {
        setGameState("playing");
        setCurrentStepIndex(0);
        setIntroStep("first");
        setAnswers({ q1: null, q2: [], q3: [], q4: null });
        setFinalResults(null);
        setInsight("");
        setRecommendedSectionId(null);
        setRecommendedSectionTitle("");
    };
    
    const calculateResults = () => {
        let score = 0;
        const totalQuestions = gameSteps.length;
        const review = {};
        gameSteps.forEach(key => {
            const question = gameData[key];
            const userAnswer = answers[key];
            let isCorrect = false;
            if (question.type === 'single') {
                isCorrect = userAnswer === question.correctAnswer;
            } else if (question.type === 'multi-select-2') {
                const sortedUserAnswers = [...(userAnswer || [])].sort();
                const sortedCorrectAnswers = [...question.correctAnswers].sort();
                isCorrect = JSON.stringify(sortedUserAnswers) === JSON.stringify(sortedCorrectAnswers);
            }
            if(isCorrect) score++;
            review[key] = { isCorrect, userAnswer };
        });
        const accuracy = Math.round((score / totalQuestions) * 100);
        setFinalResults({ score, accuracy, review });
        setGameState("end");
    };

    const handleNextStep = () => {
        if (currentStepIndex < gameSteps.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
        } else {
            calculateResults();
        }
    };
    
    const { isButtonEnabled, buttonText } = useMemo(() => {
        const currentQuestionKey = gameSteps[currentStepIndex];
        const currentQuestion = gameData[currentQuestionKey];
        const currentAnswer = answers[currentQuestionKey];
        const isLastStep = currentStepIndex === gameSteps.length - 1;
        let enabled = false;

        if (currentQuestion.type === 'single') {
            enabled = !!currentAnswer;
        } else if (currentQuestion.type === 'multi-select-2') {
            enabled = currentAnswer && currentAnswer.length === 2;
        }
        
        return { isButtonEnabled: enabled, buttonText: isLastStep ? 'Submit' : 'Continue' };
    }, [currentStepIndex, answers]);
    
    const handleShowInstructions = () => setIntroStep("instructions");

    // NEW Handlers for State Management and Navigation
    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            const stateToSave = { gameState, introStep, currentStepIndex, answers, finalResults, insight, recommendedSectionId, recommendedSectionTitle };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
            navigate(`/environmental/notes?grade=11-12&section=${recommendedSectionId}`);
        }
    };
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        startGame();
    };

    // --- MODIFIED & NEW HANDLERS FOR POPUP ---
    const handleContinue = () => {
        setPopupVisible(true);
    };

    const handleConfirmNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate("/UrbanFloodFlashpoint");
        setPopupVisible(false);
    };

    const handleCancelNavigation = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate("/environmental/games");
        setPopupVisible(false);
    };
    
    const handleClosePopup = () => {
        setPopupVisible(false);
    };
    // --- END MODIFIED & NEW HANDLERS ---
    
    const handleReviewAnswers = () => setGameState("review");
    const handleBackToResults = () => setGameState("end");

    const renderCurrentQuestion = () => {
        const currentQuestionKey = gameSteps[currentStepIndex];
        const question = gameData[currentQuestionKey];
        if (question.type === 'single') {
            return <SingleChoiceQuestion 
                question={question} 
                selectedAnswer={answers[currentQuestionKey]} 
                setSelectedAnswer={(answer) => setAnswers(prev => ({...prev, [currentQuestionKey]: answer}))} 
            />;
        }
        if (question.type === 'multi-select-2') {
            return <MultiSelectQuestion 
                question={question}
                selectedAnswers={answers[currentQuestionKey]}
                setSelectedAnswers={(answer) => setAnswers(prev => ({...prev, [currentQuestionKey]: answer}))}
            />;
        }
        return null;
    };

    const renderContent = () => {
      if (gameState === "intro") {
        return introStep === "first" 
            ? <IntroScreen onShowInstructions={handleShowInstructions} />
            : <InstructionsScreen onStartGame={startGame} />;
      }
        
      if (gameState === "playing") {
        return (
            <div className="main-container w-full h-screen bg-[#0A160E] relative overflow-hidden flex flex-col justify-between inter-font">
                <GameNav />
                <div className="flex-1 flex flex-col items-center justify-start lg:justify-center overflow-y-auto no-scrollbar p-4 pt-8 md:pt-4">
                    {renderCurrentQuestion()}
                </div>
                <div className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 z-10 shrink-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full cursor-pointer" onClick={handleNextStep} disabled={!isButtonEnabled}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>
                                {buttonText}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
      }
        
      if (gameState === "end" && finalResults) {
        const isVictory = finalResults.accuracy >= 75;
        return isVictory ? (
            <VictoryScreen
                accuracyScore={finalResults.accuracy}
                insight={insight}
                onViewFeedback={handleReviewAnswers}
                onContinue={handleContinue}
            />
        ) : (
            <LosingScreen
                accuracyScore={finalResults.accuracy}
                insight={insight}
                onPlayAgain={handlePlayAgain}
                onViewFeedback={handleReviewAnswers}
                onContinue={handleContinue}
                onNavigateToSection={handleNavigateToSection}
                recommendedSectionTitle={recommendedSectionTitle}
            />
        );
      }

      if (gameState === "review" && finalResults) {
        return <ReviewScreen reviewData={finalResults.review} onBackToResults={handleBackToResults} gameData={gameData} gameSteps={gameSteps} />;
      }
        
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
}