import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { Globe, Droplets, Wind, TreePine, ArrowRight } from "lucide-react";
import axios from "axios";

// NEW: Import the notes data for this module
import { notesEnvironment9to10 } from "@/data/notesEnvironment9to10.js"; 

// Your original component imports are preserved
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";

// =============================================================================
// Gemini API and Session Storage Setup
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'causeEffectGameState'; // Unique key for this game

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
// NEW: Reusable End-Screen Components with All Features
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
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold font-['Lilita_One'] mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grow overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                  <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                      <p className="text-gray-300 text-base mb-2 font-bold">Cause: {ans.cause}</p>
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

// Your original GamePage component - UNCHANGED
const GamePage = ({ questions, currentQuestion, showResult, userAnswers, selectedEffect, selectedSphere, setSelectedEffect, setSelectedSphere, checkAnswer, nextQuestion }) => {
    const currentQ = questions[currentQuestion];
    const isSubmitEnabled = selectedEffect && selectedSphere;
    const sphereIcons = { Hydrosphere: <Droplets />, Atmosphere: <Wind />, Biosphere: <TreePine />, Geosphere: <Globe /> };

    return (
        <div className="w-full min-h-screen bg-[#09160E] font-['Inter'] text-white flex flex-col">
            <GameNav/>
            <main className="flex-grow w-full flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 mt-25 md:mt-0 lg:mt-27 overflow-y-auto">
                {!showResult ? (
                    <div key="question" className="w-full flex flex-col items-center gap-6 md:gap-10">
                        <div className="w-full max-w-sm md:max-w-3xl bg-[rgba(32,47,54,0.3)] rounded-xl p-4 sm:p-6 border border-gray-700">
                            <h3 className="font-medium text-lg text-gray-300 mb-4">Choose the effect</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {currentQ.effects.map((effect) => (
                                    <button key={effect} onClick={() => setSelectedEffect(effect)} className={`text-center p-3 rounded-lg border transition-all duration-200 shadow-md font-semibold text-sm sm:text-base ${selectedEffect === effect ? 'bg-green-500/20 border-green-500 text-white' : 'bg-[#131F24] border-[#37464F] hover:bg-[#1f2d34] hover:border-gray-500'}`}>{effect}</button>
                                ))}
                            </div>
                            <h3 className="font-medium text-lg text-gray-300 mt-6 mb-4">Which earth system is affected?</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                {currentQ.spheres.map((sphere) => (
                                    <button key={sphere} onClick={() => setSelectedSphere(sphere)} className={`p-3 rounded-lg border transition-all duration-200 shadow-md flex flex-col items-center gap-2 ${selectedSphere === sphere ? 'bg-green-500/20 border-green-500 text-white' : 'bg-[#131F24] border-[#37464F] hover:bg-[#1f2d34] hover:border-gray-500'}`}>
                                        <div className="w-6 h-6">{sphereIcons[sphere]}</div>
                                        <span className="font-semibold text-sm sm:text-base">{sphere}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <img src={currentQ.causeIcon} alt={currentQ.cause} className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
                            <div className="relative">
                                <div className="absolute top-1/2 -translate-y-1/2 -left-[13px] transform z-50">
                                    <div className="relative inline-block">
                                        <div className="absolute -top-0.5 right-0 w-0 h-0 border-t-[12px] border-t-transparent border-r-[18px] border-r-[#37464F] border-b-0 border-l-0"></div>
                                        <div className="relative w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-[#131F24] border-b-0 border-l-0"></div>
                                    </div>
                                </div>
                                <div className="relative bg-[#131F24] border border-[#37464F] rounded-lg px-4 sm:px-6 py-3">
                                    <span className="text-lg sm:text-2xl font-bold text-gray-200">{currentQ.cause}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div key="result" className="w-full flex flex-col items-center gap-6 md:gap-10">
                        <div className="w-full max-w-sm md:max-w-3xl bg-[rgba(32,47,54,0.3)] rounded-xl p-6 sm:p-10 border border-gray-700 text-center flex flex-col items-center justify-center min-h-[300px]">
                            {userAnswers[currentQuestion]?.isCorrect ? ( <> <h2 className="text-4xl sm:text-5xl text-[#6CFF00] mb-6 font-bold">Amazing Fact</h2> <p className="text-base sm:text-xl text-gray-200 leading-relaxed lg:px-4 font-medium">{currentQ.trivia}</p> </> ) : ( <> <h2 className="text-4xl sm:text-5xl text-red-400 mb-6 font-bold">System Shock!</h2> <p className="text-base sm:text-xl text-gray-200 leading-relaxed lg:px-4 font-medium">{currentQ.systemShock}</p> </> )}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4">
                            <img src={currentQ.causeIcon} alt={currentQ.cause} className="w-20 h-20 sm:w-28 sm:h-28 object-contain" />
                            <div className="relative">
                                <div className="absolute top-1/2 -translate-y-1/2 -left-[13px] transform z-51">
                                    <div className="relative inline-block">
                                        <div className="absolute -top-0.5 right-0 w-0 h-0 border-t-[12px] border-t-transparent border-r-[18px] border-r-[#37464F] border-b-0 border-l-0"></div>
                                        <div className="relative w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-[#131F24] border-b-0 border-l-0"></div>
                                    </div>
                                </div>
                                <div className="relative bg-[#131F24] border border-[#37464F] rounded-lg px-4 sm:px-6 py-3">
                                    <span className="text-lg sm:text-2xl font-bold text-gray-200">{currentQ.cause}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <footer className="w-full h-24 bg-[#28343A] px-4 flex justify-center items-center shrink-0">
                <div className="w-full max-w-xs h-16">
                    {!showResult ? (
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

const CauseEffectGame = () => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState("intro");
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedEffect, setSelectedEffect] = useState(null);
    const [selectedSphere, setSelectedSphere] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [userAnswers, setUserAnswers] = useState([]);

    // NEW: States for AI features
    const [insight, setInsight] = useState("");
    const [recommendedSectionId, setRecommendedSectionId] = useState(null);
    const [recommendedSectionTitle, setRecommendedSectionTitle] = useState("");

    const questions = [
        { id: 1, cause: "Urbanization", causeIcon: "/environmentGameInfo/Cause&Effect/urbanization.png", correctEffect: "Soil sealing with concrete", correctSphere: "Geosphere", effects: ["Soil sealing with concrete", "Increased plant growth", "More rainfall", "Ocean warming"], spheres: ["Hydrosphere", "Atmosphere", "Biosphere", "Geosphere"], trivia: "Urban areas cover soil with concrete and asphalt, preventing water from soaking into the ground and reducing groundwater recharge!", systemShock: "Without proper planning, cities can become heat islands and flood zones, disrupting natural water cycles!" },
        { id: 2, cause: "Industrial Air Pollution", causeIcon: "/environmentGameInfo/Cause&Effect/urbanization.png", correctEffect: "Toxic substances in air", correctSphere: "Biosphere", effects: ["Cleaner oceans", "Toxic substances in air", "More fertile soil", "Cooler temperatures"], spheres: ["Biosphere", "Geosphere", "Hydrosphere", "Atmosphere"], trivia: "Air pollution doesn't just stay in the air - it falls as acid rain and contaminates soil and water, harming all living things!", systemShock: "Polluted air can travel thousands of miles, affecting forests, crops, and wildlife far from the pollution source!" },
        { id: 3, cause: "Ocean Acidification", causeIcon: "/environmentGameInfo/Cause&Effect/urbanization.png", correctEffect: "Damage to marine life", correctSphere: "Biosphere", effects: ["Stronger coral reefs", "More fish reproduction", "Damage to marine life", "Cleaner water"], spheres: ["Hydrosphere", "Biosphere", "Atmosphere", "Geosphere"], trivia: "When oceans absorb too much CO2, they become acidic, making it hard for sea creatures to build shells and skeletons!", systemShock: "Acidic oceans could collapse entire marine food chains, affecting billions of people who depend on seafood!" },
        { id: 4, cause: "Agriculture", causeIcon: "/environmentGameInfo/Cause&Effect/urbanization.png", correctEffect: "Methane and nitrous oxide release", correctSphere: "Atmosphere", effects: ["Cleaner air production", "Methane and nitrous oxide release", "Ocean cooling", "Mountain formation"], spheres: ["Atmosphere", "Geosphere", "Biosphere", "Hydrosphere"], trivia: "Cows burp methane, and fertilizers release nitrous oxide - both are potent greenhouse gases that trap heat in our atmosphere!", systemShock: "Agricultural emissions contribute significantly to climate change, affecting weather patterns worldwide!" },
        { id: 5, cause: "Wildfires", causeIcon: "/environmentGameInfo/Cause&Effect/urbanization.png", correctEffect: "Ash contamination", correctSphere: "Hydrosphere", effects: ["Improved air quality", "Ash contamination", "Stronger tree roots", "More snow formation"], spheres: ["Hydrosphere", "Atmosphere", "Geosphere", "Biosphere"], trivia: "Wildfire ash washes into rivers and lakes, making water unsafe to drink and harming aquatic life!", systemShock: "Massive wildfires can contaminate water supplies for entire cities, creating long-term environmental damage!" },
    ];

    // NEW: useEffect for restoring state from sessionStorage
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            setCurrentPage(savedState.currentPage);
            setCurrentQuestion(savedState.currentQuestion);
            setSelectedEffect(savedState.selectedEffect);
            setSelectedSphere(savedState.selectedSphere);
            setShowResult(savedState.showResult);
            setScore(savedState.score);
            setUserAnswers(savedState.userAnswers);
            setInsight(savedState.insight);
            setRecommendedSectionId(savedState.recommendedSectionId);
            setRecommendedSectionTitle(savedState.recommendedSectionTitle);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);
    
    // NEW: useEffect for the AI Insight API call
    useEffect(() => {
        if (currentPage === 'finished' && !insight) {
            const generateInsight = async () => {
                setInsight("Analyzing your results...");
                const accuracyScore = Math.round((score / questions.length) * 100);
                const incorrectAnswers = userAnswers.filter(ans => !ans.isCorrect);

                if (incorrectAnswers.length === 0) {
                    setInsight("You're an Earth Systems Expert! Perfect score!");
                    return;
                }
                
                const noteSectionsForModule = notesEnvironment9to10;
                const prompt = `A student played a game matching environmental causes to effects and the affected Earth system. Their incorrect answers are: ${JSON.stringify(incorrectAnswers)}. The available notes are: ${JSON.stringify(noteSectionsForModule)}. TASK: 1. DETECT the most relevant note section for these errors. 2. GENERATE a 25-35 word insight recommending that section by title. OUTPUT: JSON with "detectedTopicId" and "insight".`;
                
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
                    setInsight("Great effort! Reviewing your notes on how Earth's systems are connected will help you master these concepts.");
                    setRecommendedSectionId('m-1');
                    setRecommendedSectionTitle("Module 1: The Earth as a System");
                }
            };
            generateInsight();
        }
    }, [currentPage, score, questions.length, userAnswers, insight]);

    const checkAnswer = () => {
        const currentQ = questions[currentQuestion];
        const isCorrect = selectedEffect === currentQ.correctEffect && selectedSphere === currentQ.correctSphere;
        if (isCorrect) {
            setScore((prevScore) => prevScore + 1);
        }
        setUserAnswers(prev => [...prev, {
            cause: currentQ.cause,
            userSequence: [selectedEffect || "Not Answered", selectedSphere || "Not Answered"],
            correctSequence: [currentQ.correctEffect, currentQ.correctSphere],
            isCorrect: isCorrect,
        }]);
        setShowResult(true);
    };

    const nextQuestion = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion((prev) => prev + 1);
            setSelectedEffect(null);
            setSelectedSphere(null);
            setShowResult(false);
        } else {
            setCurrentPage("finished");
        }
    };

    const resetGame = () => {
        setCurrentQuestion(0);
        setSelectedEffect(null);
        setSelectedSphere(null);
        setShowResult(false);
        setScore(0);
        setUserAnswers([]);
        setCurrentPage("intro");
        setInsight("");
        setRecommendedSectionId(null);
        setRecommendedSectionTitle("");
    };

    // NEW: Handlers that manage session storage
    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            const stateToSave = {
                currentPage, currentQuestion, selectedEffect, selectedSphere, showResult, score, userAnswers, insight, recommendedSectionId, recommendedSectionTitle
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

    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/FeedbackLoopGame');
    };

    if (currentPage === "intro") { return <IntroScreen onShowInstructions={() => setCurrentPage("instructions")} />; }
    if (currentPage === "instructions") { return <InstructionsScreen onStartGame={() => setCurrentPage("game")} />; }
    if (currentPage === "game") {
        return (
            <GamePage
                questions={questions}
                currentQuestion={currentQuestion}
                showResult={showResult}
                userAnswers={userAnswers}
                selectedEffect={selectedEffect}
                selectedSphere={selectedSphere}
                setSelectedEffect={setSelectedEffect}
                setSelectedSphere={setSelectedSphere}
                checkAnswer={checkAnswer}
                nextQuestion={nextQuestion}
            />
        );
    }
    
    if (currentPage === "finished") {
        const accuracyScore = Math.round((score / questions.length) * 100);
        const isVictory = accuracyScore > 80;
        return isVictory ? (
            <VictoryScreen 
                accuracyScore={accuracyScore} 
                insight={insight} 
                onViewFeedback={() => setCurrentPage("review")} 
                onContinue={handleContinue} 
            />
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
    if (currentPage === "review") { return <ReviewScreen answers={userAnswers} onBackToResults={() => setCurrentPage("finished")} />; }

    return null;
};

export default CauseEffectGame;