import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { motion } from "framer-motion";
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
const SESSION_STORAGE_KEY = 'phosphorusPolicyGameState'; // Unique key for this game

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
                            <span className="text-[#FFCC00] inter-font text-xs font-semibold">{insight}</span>
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
                            <span className="text-[#FFCC00] inter-font text-xs font-semibold tracking-wide">{insight}</span>
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

function ReviewScreen({ reviewData, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center inter-font">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
            <div className="flex-grow w-full overflow-y-auto no-scrollbar">
                <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-2">
                    {gameSteps.map(questionKey => {
                        const question = gameData[questionKey];
                        const result = reviewData[questionKey];
                        return (
                            <div key={question.id} className={`p-4 rounded-xl flex flex-col ${result.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                                <p className="text-gray-200 text-lg mb-2 font-bold">{`Scenario ${question.id}`}</p>
                                <p className="text-gray-400 text-xs mb-4 font-medium whitespace-pre-wrap border-l-2 border-gray-600 pl-2">{question.question}</p>
                                <div className="text-sm space-y-1 mt-auto">
                                    <p className="font-semibold">Your Answer:</p>
                                    <p className={`break-words ${result.isCorrect ? 'text-green-300' : 'text-red-300'}`}>{result.userAnswer || "Not Answered"}</p>
                                    {!result.isCorrect && (
                                        <>
                                            <p className="font-semibold pt-2">Correct Answer:</p>
                                            <p className="text-green-300 break-words">{question.correctAnswer}</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-b-0 shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

// --- NEW FINAL POPUP COMPONENT ---
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


// YOUR ORIGINAL GAME DATA AND CHILD COMPONENTS - UNCHANGED
const scenarios = [
    { id: 1, label: "Scenario 1", color: "bg-red-500", situation: "A lake turns toxic green from fertilizer runoff. What's the best action?", options: [{ text: "Add more chlorine to the water", isCorrect: false }, { text: "Control phosphorus in fertilizers and restore wetlands", isCorrect: true }, { text: "Drain the lake completely", isCorrect: false }, { text: "Blame local fishers for the problem", isCorrect: false }] },
    { id: 2, label: "Scenario 2", color: "bg-blue-500", situation: "India’s domestic phosphorus mines are nearly depleted. What is a sustainable solution?", options: [{ text: "Launch phosphorus recycling from sewage and food waste", isCorrect: true }, { text: "Import all required phosphorus from Morocco indefinitely", isCorrect: false }, { text: "Attempt to start large-scale seawater extraction", isCorrect: false }, { text: "Replace phosphorus with potassium in all fertilizers", isCorrect: false }] },
    { id: 3, label: "Scenario 3", color: "bg-green-500", situation: "A farmer's crop yields are dropping due to a phosphorus shortage in the soil. How can you help?", options: [{ text: "Promote organic compost and precision fertilization techniques", isCorrect: true }, { text: "Ban all fertilizer use immediately to save the soil", isCorrect: false }, { text: "Provide heavy subsidies for imported chemical phosphorus", isCorrect: false }, { text: "Advise the farmer to grow less food", isCorrect: false }] },
    { id: 4, label: "Scenario 4", color: "bg-yellow-500", situation: "A major river is being choked by phosphorus-rich algae blooms. What policy should be enacted?", options: [{ text: "Increase the general use of pesticides along the river", isCorrect: false }, { text: "Implement strict agricultural runoff controls and create buffer zones", isCorrect: true }, { text: "Encase the river banks in concrete to stop erosion", isCorrect: false }, { text: "Introduce a new species of fish that eats algae", isCorrect: false }] },
];
const gameData = {};
const gameSteps = [];
scenarios.forEach((scenario, index) => {
    const key = `q${index + 1}`;
    gameSteps.push(key);
    const correctOption = scenario.options.find(opt => opt.isCorrect);
    gameData[key] = {
        id: scenario.id,
        title: scenario.situation, // Used by QuestionScreen
        question: scenario.situation, // Used by ReviewScreen
        label: scenario.label,
        color: scenario.color,
        options: scenario.options,
        type: 'single',
        correctAnswer: correctOption ? correctOption.text : null,
    };
});

function QuestionScreen({ question, selectedAnswer, setSelectedAnswer, isRevealed }) {
    return (
        <div className="w-full max-w-3xl bg-gray-800/30 rounded-xl p-6 md:p-10 inter-font">
            <div className="flex flex-col justify-center items-start gap-7">
                <div className="px-1 flex flex-col justify-center items-center gap-2 w-full">
                    <h2 className="text-slate-100 text-xl md:text-[1.4rem] font-medium leading-9 text-center">
                        {question.title}
                    </h2>
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    {question.options.map((option) => {
                        const isSelected = selectedAnswer === option.text;
                        let baseCardClasses = "self-stretch lg:min-h-[60px] px-6 py-3 lg:py-0 rounded-xl shadow-[0px_2px_0px_0px_rgba(55,70,79,1.00)] border flex items-center transition-all";
                        let stateCardClasses = "";
                        let textClasses = "text-sm lg:text-base font-medium leading-relaxed";

                        if (isRevealed) {
                            baseCardClasses += " cursor-default";
                            if (isSelected) {
                                if (option.isCorrect) {
                                    stateCardClasses = " bg-green-900/40 border-2 border-green-500";
                                    textClasses += " text-green-300";
                                } else {
                                    stateCardClasses = " bg-red-900/40 border-2 border-red-500 ";
                                    textClasses += " text-red-300";
                                }
                            } else if (option.isCorrect) {
                                stateCardClasses = " bg-green-900/40 border-2 border-green-700 ring-2 ring-green-500";
                                textClasses += " text-green-400";
                            } else {
                                stateCardClasses = " bg-gray-900/50 border-2 border-gray-800 opacity-60";
                                textClasses += " text-slate-100";
                            }
                        } else {
                            baseCardClasses += " cursor-pointer";
                            if (isSelected) {
                                stateCardClasses = " bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428]";
                                textClasses += " text-[#79b933]";
                            } else {
                                stateCardClasses = " bg-gray-900 border-2 border-gray-700 hover:bg-gray-800";
                                textClasses += " text-slate-100";
                            }
                        }
                        return (
                            <div key={option.text} onClick={() => !isRevealed && setSelectedAnswer(option.text)} className={`${baseCardClasses} ${stateCardClasses}`}>
                                <span className={textClasses}>{option.text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function SpinWheelScreen({ onSpin, isSpinning, rotation, currentStepIndex }) {
    const currentScenarioLabel = gameData[gameSteps[currentStepIndex]].label;
    return (
        <div className="w-full flex-1 flex flex-col items-center justify-center text-center p-4">
            <p className="text-slate-300 max-w-xl mb-8 inter-font">
                Spin the wheel to tackle the next challenge. Your goal is to choose the most sustainable policy for each scenario!
            </p>
            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-8">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-10">
                    <div style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} className="w-5 h-5 bg-yellow-400 border-b-4 border-yellow-600"></div>
                </div>
                <motion.div
                    className="rounded-full border-4 border-gray-600 w-full h-full grid grid-cols-2 grid-rows-2 text-white font-bold text-lg overflow-hidden shadow-2xl"
                    animate={{ rotate: rotation }}
                    transition={{ duration: 2.5, ease: "easeOut" }}
                >
                    {gameSteps.map(key => (
                        <div key={gameData[key].id} className={`flex items-center justify-center text-center p-2 ${gameData[key].color}`}>
                            {gameData[key].label}
                        </div>
                    ))}
                </motion.div>
            </div>
            <button onClick={onSpin} disabled={isSpinning} className="px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-yellow-500 disabled:border-yellow-700">
                {isSpinning ? 'Spinning...' : `Spin for ${currentScenarioLabel}`}
            </button>
        </div>
    );
}

export default function PhosphorusPolicyGame() {
    const navigate = useNavigate();
    
    // YOUR ORIGINAL useState LOGIC IS PRESERVED
    const [gameState, setGameState] = useState("intro");
    const [introStep, setIntroStep] = useState("first");
    const [currentScreen, setCurrentScreen] = useState("spin");
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const initialAnswers = useMemo(() => Object.fromEntries(gameSteps.map(key => [key, null])), []);
    const [answers, setAnswers] = useState(initialAnswers);
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
            setCurrentScreen(savedState.currentScreen);
            setCurrentStepIndex(savedState.currentStepIndex);
            setIsRevealed(savedState.isRevealed);
            setRotation(savedState.rotation);
            setIsSpinning(savedState.isSpinning);
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
                const prompt = `A student completed a quiz on Phosphorus policy and sustainability. Their accuracy was ${finalResults.accuracy}%. Their results: ${JSON.stringify(finalResults.review)}. The available notes are: ${JSON.stringify(noteSectionsForModule)}. TASK: 1. DETECT: Find the most relevant note section for errors related to phosphorus, farming, and pollution (likely Unit 1 or 4). 2. GENERATE: Write a 25-35 word insight recommending that section by title. OUTPUT: JSON with "detectedTopicId" and "insight".`;

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
                    setInsight("Great effort! The phosphorus cycle is vital. Reviewing 'Unit 1: Biogeochemical Cycles' will build on what you've learned.");
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
        setCurrentScreen("spin");
        setCurrentStepIndex(0);
        setIntroStep("first");
        setAnswers(initialAnswers);
        setFinalResults(null);
        setInsight("");
        setIsRevealed(false);
        setRotation(0);
        setIsSpinning(false);
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
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) score++;
            review[key] = { isCorrect, userAnswer };
        });
        const accuracy = Math.round((score / totalQuestions) * 100);
        setFinalResults({ score, accuracy, review });
        setGameState("end");
    };
    const handleSpin = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        const targetAngles = [45, 315, 135, 225];
        const targetAngle = targetAngles[currentStepIndex];
        const currentFullRotations = Math.floor(rotation / 360);
        const newFullRotations = (currentFullRotations + 4) * 360;
        const newRotation = newFullRotations + targetAngle;
        setRotation(newRotation);
        setTimeout(() => {
            setIsSpinning(false);
            setCurrentScreen("question");
        }, 2800);
    };
    const handleFooterButtonClick = () => {
        if (isRevealed) {
            if (currentStepIndex < gameSteps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
                setIsRevealed(false);
                setCurrentScreen("spin");
            } else {
                calculateResults();
            }
        } else {
            setIsRevealed(true);
        }
    };
    const { isButtonEnabled, buttonText } = useMemo(() => {
        const currentQuestionKey = gameSteps[currentStepIndex];
        const currentAnswer = answers[currentQuestionKey];
        if (isRevealed) {
            const isLastQuestion = currentStepIndex === gameSteps.length - 1;
            return { isButtonEnabled: true, buttonText: isLastQuestion ? 'Finish' : 'Continue' };
        } else {
            return { isButtonEnabled: !!currentAnswer, buttonText: 'Submit' };
        }
    }, [currentStepIndex, answers, isRevealed]);
    const handleShowInstructions = () => setIntroStep("instructions");

    // NEW Handlers for State Management and Navigation
    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            const stateToSave = { gameState, introStep, currentScreen, currentStepIndex, isRevealed, rotation, isSpinning, answers, finalResults, insight, recommendedSectionId, recommendedSectionTitle };
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

    const handleGoToGames = () => {
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
        return <QuestionScreen
            question={question}
            selectedAnswer={answers[currentQuestionKey]}
            setSelectedAnswer={(answer) => setAnswers(prev => ({ ...prev, [currentQuestionKey]: answer }))}
            isRevealed={isRevealed}
        />;
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
                    <div className="w-full h-full flex items-center justify-center" style={{ display: currentScreen === 'spin' ? 'flex' : 'none' }}>
                        <SpinWheelScreen onSpin={handleSpin} isSpinning={isSpinning} rotation={rotation} currentStepIndex={currentStepIndex} />
                    </div>
                    <div className="w-full h-full flex items-center justify-center" style={{ display: currentScreen === 'question' ? 'flex' : 'none' }}>
                        {currentScreen === 'question' && renderCurrentQuestion()}
                    </div>
                </div>
                {currentScreen === 'question' && (
                    <div className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 z-10 shrink-0">
                        <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                            <button className="relative w-full h-full cursor-pointer" onClick={handleFooterButtonClick} disabled={!isButtonEnabled}>
                                <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                                <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>
                                    {buttonText}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
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
        return <ReviewScreen reviewData={finalResults.review} onBackToResults={handleBackToResults} />;
      }
        
      return null;
    }

    return (
        <>
            {renderContent()}
            <FinalLevelPopup
                isOpen={isPopupVisible}
                onConfirm={handleGoToGames}
                onClose={handleClosePopup}
            />
        </>
    );
}