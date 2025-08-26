import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
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
const SESSION_STORAGE_KEY = 'ureaAddictionGameState'; // Unique key for this game

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
                                <p className="text-gray-200 text-lg mb-2 font-bold">{question.question}</p>
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
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

// YOUR ORIGINAL GAME DATA & COMPONENTS - UNCHANGED
const cardsData = [
    { question: "Why is urea overused in Indian agriculture?", options: [ { front: "Urea gives a quick crop boost – every farmer swears by it!", back: "✅ Correct! 💥 It’s heavily subsidized and gives quick results.", isCorrect: true }, { front: "Long-term soil health? Urea is a magic fix!", back: "❌ Nope! 🧪 Urea actually degrades soil over time.", isCorrect: false }, { front: "It’s the only fertilizer accessible in rural markets.", back: "❌ Not quite! 📦 It’s common but not the only one available.", isCorrect: false }, { front: "Urea is eco-friendly and natural, right?", back: "❌ Incorrect. 🌿 It’s synthetic and overuse harms the environment.", isCorrect: false } ] },
    { question: "What environmental issue is directly linked to excess urea?", options: [ { front: "More urea = fewer trees. It causes deforestation!", back: "❌ Incorrect! 🌳 Deforestation isn’t directly caused by urea.", isCorrect: false }, { front: "It seeps into water and weakens the soil?", back: "✅ Yes! 💧 It causes nitrate pollution and soil fatigue.", isCorrect: true }, { front: "It blocks drains and causes urban flooding!", back: "❌ Nope! 🌧️ Urban flooding isn’t linked to urea use.", isCorrect: false }, { front: "It speeds up melting glaciers due to emissions!", back: "❌ Incorrect! ❄️ That’s more about fossil fuels, not urea.", isCorrect: false } ] },
    { question: "What’s a smarter policy move than banning urea?", options: [ { front: "Let’s promote compost and biofertilizers instead!", back: "✅ Spot on! 🌿 Subsidizing eco-alternatives is smart policy.", isCorrect: true }, { front: "Farmers should be fined for overusing it!", back: "❌ Not effective. 🚫 Penalties may increase resistance.", isCorrect: false }, { front: "Let’s build more urea factories to meet demand!", back: "❌ Nope! 🏭 That encourages more use, not less.", isCorrect: false }, { front: "Import more urea — problem solved!", back: "❌ Incorrect! 🌍 Importing just shifts the issue.", isCorrect: false } ] },
    { question: "What message can shift farmer behaviour?", options: [ { front: "Let’s go hard — 'Urea is poison!'", back: "❌ Fear doesn’t work. ☠️ People shut down with such messaging.", isCorrect: false }, { front: "A farmer’s wealth starts with healthy soil!", back: "✅ Exactly! 💚 'Healthy Soil, Wealthy Farmer' motivates positive change.", isCorrect: true }, { front: "Strict rule: 'Stop using urea or get fined!'", back: "❌ Not ideal. 📢 It’s too threatening and could backfire.", isCorrect: false }, { front: "All or nothing: 'Chemical-free or nothing!'", back: "❌ Too extreme. 🧪 Real change needs balance, not ultimatums.", isCorrect: false } ] },
];
const gameData = {};
const gameSteps = [];
cardsData.forEach((card, index) => {
    const key = `q${index + 1}`;
    gameSteps.push(key);
    const correctOption = card.options.find(opt => opt.isCorrect);
    gameData[key] = {
        id: index + 1,
        title: card.question,
        question: card.question,
        options: card.options,
        type: 'single',
        correctAnswer: correctOption ? correctOption.front : null,
    };
});

function FlippableCardQuestion({ question, selectedAnswer, setSelectedAnswer, isRevealed }) {
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
                        const isSelected = selectedAnswer === option.front;
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
                                stateCardClasses = " bg-green-900/40 border-2 border-green-500 ";
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
                            <div key={option.front} onClick={() => !isRevealed && setSelectedAnswer(option.front)} className={`${baseCardClasses} ${stateCardClasses}`}>
                                <span className={textClasses}>
                                    {isRevealed && isSelected ? option.back : option.front}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default function UreaAddiction() {
    const navigate = useNavigate();

    // YOUR ORIGINAL useState LOGIC IS PRESERVED
    const [gameState, setGameState] = useState("intro");
    const [introStep, setIntroStep] = useState("first");
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isRevealed, setIsRevealed] = useState(false);
    const initialAnswers = Object.fromEntries(gameSteps.map(key => [key, null]));
    const [answers, setAnswers] = useState(initialAnswers);
    const [finalResults, setFinalResults] = useState(null);

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
            setIsRevealed(savedState.isRevealed);
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
                setInsight("Fetching personalized insight...");
                const noteSectionsForModule = notesEnvironment11to12;
                const prompt = `A student completed a quiz on Urea Addiction in agriculture. Their accuracy was ${finalResults.accuracy}%. Their results: ${JSON.stringify(finalResults.review)}. The available notes are: ${JSON.stringify(noteSectionsForModule)}. TASK: 1. DETECT: Find the most relevant note section for errors related to farming policy, pollution, and sustainability. 2. GENERATE: Write a 25-35 word insight recommending that section by title. OUTPUT: JSON with "detectedTopicId" and "insight".`;

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
                    setInsight("You've got the basics! To understand the bigger picture of India's policies and challenges, review 'Unit 4: India and Sustainability'.");
                    setRecommendedSectionId('s-4');
                    setRecommendedSectionTitle("Unit 4: India and Sustainability");
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
        setAnswers(initialAnswers);
        setFinalResults(null);
        setInsight("");
        setIsRevealed(false);
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
    const handleFooterButtonClick = () => {
        if (isRevealed) {
            if (currentStepIndex < gameSteps.length - 1) {
                setCurrentStepIndex(prev => prev + 1);
                setIsRevealed(false);
            } else {
                calculateResults();
            }
        } else {
            setIsRevealed(true);
        }
    };
    const { isButtonEnabled, buttonText } = useMemo(() => {
        if (isRevealed) {
            const isLastQuestion = currentStepIndex === gameSteps.length - 1;
            return { isButtonEnabled: true, buttonText: isLastQuestion ? 'Finish' : 'Continue' };
        } else {
            const currentQuestionKey = gameSteps[currentStepIndex];
            const currentAnswer = answers[currentQuestionKey];
            return { isButtonEnabled: !!currentAnswer, buttonText: 'Submit' };
        }
    }, [currentStepIndex, answers, isRevealed]);
    const handleShowInstructions = () => setIntroStep("instructions");
    
    // NEW Handlers for State Management and Navigation
    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            const stateToSave = { gameState, introStep, currentStepIndex, answers, finalResults, isRevealed, insight, recommendedSectionId, recommendedSectionTitle };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
            navigate(`/environmental/notes?grade=11-12&section=${recommendedSectionId}`);
        }
    };
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        startGame();
    };
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate("/PeakPhosphorusPanic");
    };
    const handleReviewAnswers = () => setGameState("review");
    const handleBackToResults = () => setGameState("end");

    const renderCurrentQuestion = () => {
        const currentQuestionKey = gameSteps[currentStepIndex];
        const question = gameData[currentQuestionKey];
        return <FlippableCardQuestion
            question={question}
            selectedAnswer={answers[currentQuestionKey]}
            setSelectedAnswer={(answer) => setAnswers(prev => ({...prev, [currentQuestionKey]: answer}))}
            isRevealed={isRevealed}
        />;
    };
    
    // UNCHANGED Render Logic (with new handlers passed to end screens)
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
                        <button className="relative w-full h-full cursor-pointer" onClick={handleFooterButtonClick} disabled={!isButtonEnabled}>
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
        return <ReviewScreen reviewData={finalResults.review} onBackToResults={handleBackToResults} />;
    }
      
    return null;
}