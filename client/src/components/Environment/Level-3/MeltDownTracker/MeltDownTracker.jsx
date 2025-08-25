import React, { useState, useEffect, useMemo, useCallback } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Data and Component Imports
import { notesEnvironment6to8 } from "@/data/notesEnvironment6to8.js";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";

// Placeholder contexts (assuming these are correct)
const useEnvirnoment = () => ({ completeEnvirnomentChallenge: () => {} });
const usePerformance = () => ({ updateEnvirnomentPerformance: () => {} });

// =============================================================================
// Constants and Configuration
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'meltdownTrackerGameState';
const PASSING_THRESHOLD = 0.8; // 80% to win

// Game Data
const gameLevels = [
    { id: 1, location: "Maldives", correctImpact: "Sea level rise" },
    { id: 2, location: "Arctic", correctImpact: "Ice caps melting" },
    { id: 3, location: "Uttarakhand", correctImpact: "Flash floods and landslides" },
    { id: 4, location: "Rajasthan", correctImpact: "Drought and desertification" },
    { id: 5, location: "Sundarbans", correctImpact: "Cyclones and habitat loss" },
    { id: 6, location: "Amazon Forest", correctImpact: "Deforestation & carbon loss" },
    { id: 7, location: "Chennai", correctImpact: "Urban flooding" },
    { id: 8, location: "Antarctica", correctImpact: "Melting glaciers" },
];
const allImpactOptions = [
    "Sea level rise", "Cyclones and habitat loss", "Ice caps melting", "Deforestation & carbon loss",
    "Flash floods and landslides", "Urban flooding", "Drought and desertification", "Melting glaciers",
];

const PERFECT_SCORE = gameLevels.length * 5;

// =============================================================================
// Helper Functions
// =============================================================================
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
// UI Components
// =============================================================================
function ImpactOptionCard({ impactText, isSelected, onClick, isDisabled, showFeedback, isCorrect }) {
    // This logic determines the card's appearance based on the game state.
    const getCardStyling = () => {
        if (showFeedback) {
            if (isCorrect) {
                // Style for the correct answer
                return "bg-green-900/50 border-2 border-green-500 shadow-[0_4px_0_0_#166534]";
            }
            if (isSelected && !isCorrect) {
                // Style for a selected, incorrect answer
                return "bg-red-900/50 border-2 border-red-500 shadow-[0_4px_0_0_#991b1b]";
            }
        }
        if (isSelected) {
            // Style for a selected answer before submission
            return "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_4px_0_0_#5f8428]";
        }
        // Default style
        return "bg-[#131f24] border-2 border-[#37464f] shadow-[0_4px_0_0_#37464f]";
    };

    const getTextStyling = () => {
        if (showFeedback) {
            if (isCorrect) return "text-green-300";
            if (isSelected && !isCorrect) return "text-red-300";
        }
        if (isSelected) return "text-[#79b933]";
        return "text-[#f1f7fb]";
    };

    const cardClasses = `
        relative flex items-center justify-center p-4 h-[85px] 
        rounded-xl cursor-pointer transition-all duration-200 ease-in-out
        ${getCardStyling()}
        ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
    `;
    const textClasses = `font-['Inter'] text-center text-base font-medium ${getTextStyling()}`;

    return (
        <div className={cardClasses} onClick={onClick}>
            <span className={textClasses}>{impactText}</span>
        </div>
    );
}

const scrollbarHideStyle = `.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`;

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
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
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
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
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
                        <button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg">
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
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-grow overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        <p className="text-gray-300 text-base mb-2 font-bold">{`Level ${idx + 1}: ${ans.location}`}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Answer:</p>
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>{ans.selectedImpact || "Not Answered"}</p>
                            {!ans.isCorrect && (<><p className="font-semibold pt-2">Correct Answer:</p><p className="font-mono text-green-300">{ans.correctImpact}</p></>)}
                            <p className="mt-2 italic text-gray-400">{ans.feedbackMessage}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBackToResults}
                className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg">
                Back to Results
            </button>
        </div>
    );
}

export default function MeltdownTracker() {
    const navigate = useNavigate();
    const [step, setStep] = useState("intro");
    const [introStep, setIntroStep] = useState("first");
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
    const [selectedImpact, setSelectedImpact] = useState(null);
    const [totalScore, setTotalScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState("");
    const [levelResults, setLevelResults] = useState([]);
    const [timeLeft, setTimeLeft] = useState(180);
    const [insight, setInsight] = useState("");
    const [recommendedSectionId, setRecommendedSectionId] = useState(null);
    const [recommendedSectionTitle, setRecommendedSectionTitle] = useState("");

    const currentLevel = useMemo(() => gameLevels[currentLevelIndex], [currentLevelIndex]);

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            setStep("end");
            setTotalScore(savedState.totalScore);
            setLevelResults(savedState.levelResults);
            setTimeLeft(savedState.timeLeft);
            setInsight(savedState.insight);
            setRecommendedSectionId(savedState.recommendedSectionId);
            setRecommendedSectionTitle(savedState.recommendedSectionTitle);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);
    
    useEffect(() => {
        if (step === 'end' && insight === "") {
            const generateInsight = async () => {
                setInsight("Fetching personalized insight...");
                const incorrectAnswers = levelResults.filter(res => !res.isCorrect);

                if (incorrectAnswers.length === 0 && levelResults.length > 0) {
                     setInsight("Perfect score! You're a true climate expert!");
                     return;
                }

                const prompt = `
You are an AI tutor for a student playing 'Meltdown Tracker', a game matching climate impacts to locations.
### CONTEXT ###
1.  **Student's Incorrect Matches:**
    ${JSON.stringify(incorrectAnswers.map(res => ({ location: res.location, their_choice: res.selectedImpact, correct_impact: res.correctImpact })), null, 2)}
2.  **All Available Note Sections for this Module:**
    ${JSON.stringify(notesEnvironment6to8, null, 2)}
### YOUR TWO-STEP TASK ###
1.  **Step 1: DETECT.** Analyze the incorrect matches. Identify if there's a pattern, such as confusing different types of water-related disasters (floods vs. sea level rise) or melting events (glaciers vs. ice caps). Find the ONE note section that best explains these specific climate change impacts.
2.  **Step 2: GENERATE.** Provide a short, encouraging insight (25-30 words). Highlight the type of confusion (e.g., "It seems the difference between melting glaciers and sea-level rise is tricky..."). Recommend they review the detected note section by its 'title' for clarity.
### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the most relevant section.",
  "insight": "Your personalized and encouraging feedback message here."
}`;
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesEnvironment6to8.find(note => note.topicId === parsed.detectedTopicId);
                        setInsight(parsed.insight);
                        setRecommendedSectionId(parsed.detectedTopicId);
                        setRecommendedSectionTitle(recommendedNote ? recommendedNote.title : "");
                    } else { throw new Error("Failed to parse AI response."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    setInsight("Good effort! Review your answers to better understand these critical connections.");
                }
            };
            generateInsight();
        }
    }, [step, totalScore, levelResults, timeLeft, insight]);

    useEffect(() => {
        if (step !== "playing") return;
        if (timeLeft <= 0) {
            setStep("end");
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, step]);

    const handleShowInstructions = () => setIntroStep("instructions");
    const handleNextLevel = useCallback(() => {
        setShowFeedback(false);
        if (currentLevelIndex < gameLevels.length - 1) {
            setCurrentLevelIndex((prevIndex) => prevIndex + 1);
            setSelectedImpact(null);
            setFeedbackMessage("");
        } else {
            setStep("end");
        }
    }, [currentLevelIndex]);
    const handleSubmit = useCallback(() => {
        if (!selectedImpact) return;
        const isCorrect = selectedImpact === currentLevel.correctImpact;
        let message = "";
        let score = 0;
        if (isCorrect) {
            score = 5;
            message = "That's correct! Great job!";
        } else {
            score = 0;
            message = `Not quite. The right match for ${currentLevel.location} is ${currentLevel.correctImpact}.`;
        }
        setTotalScore((prevScore) => prevScore + score);
        setFeedbackMessage(message);
        setShowFeedback(true);
        setLevelResults((prevResults) => [
            ...prevResults,
            {
                location: currentLevel.location,
                selectedImpact: selectedImpact,
                correctImpact: currentLevel.correctImpact,
                isCorrect: isCorrect,
                feedbackMessage: isCorrect ? "You nailed it!" : "A learning moment!",
            },
        ]);
    }, [selectedImpact, currentLevel]);
    const startGame = () => {
        setStep("playing");
        setIntroStep("first");
        setCurrentLevelIndex(0);
        setSelectedImpact(null);
        setTotalScore(0);
        setLevelResults([]);
        setShowFeedback(false);
        setFeedbackMessage("");
        setTimeLeft(180);
        setInsight("");
        setRecommendedSectionId(null);
        setRecommendedSectionTitle("");
    };
    const handleSelectImpact = (impact) => {
        if (showFeedback) return;
        setSelectedImpact(impact);
    };
    const handleReviewAnswers = () => setStep("review");
    const handleBackToResults = () => setStep("end");
    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        startGame();
    };
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate("/dilemma-cards");
    };
    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            const stateToSave = { totalScore, levelResults, timeLeft, insight, recommendedSectionId, recommendedSectionTitle };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
            navigate(`/environmental/notes?grade=6-8&section=${recommendedSectionId}`);
        }
    };

    const buttonText = showFeedback ? "Continue" : "Check Now";
    const isButtonEnabled = !!selectedImpact;

    return (
        <div>
            {step === "intro" && introStep === "first" && (<IntroScreen onShowInstructions={handleShowInstructions} gameTitle="Meltdown Tracker" />)}
            {step === "intro" && introStep === "instructions" && (<InstructionsScreen onStartGame={startGame} gameTitle="Meltdown Tracker" />)}
            {step !== "intro" && (
                <div className="main-container w-full h-[100vh] bg-[#0A160E] relative overflow-hidden flex flex-col justify-between">
                    {step === "playing" && currentLevel && (
                        <>
                            <GameNav timeLeft={timeLeft} />
                            <div className="flex-1 flex flex-col items-center justify-center p-4">
                                <div className="w-full max-w-4xl bg-[#202f36]/30 rounded-xl p-8">
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                        {allImpactOptions.map((impact) => (
                                            <ImpactOptionCard
                                                key={impact}
                                                impactText={impact}
                                                isSelected={selectedImpact === impact}
                                                onClick={() => handleSelectImpact(impact)}
                                                isDisabled={showFeedback && selectedImpact !== impact}
                                                // Props for visual feedback
                                                showFeedback={showFeedback}
                                                isCorrect={impact === currentLevel.correctImpact}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-[10vh] bg-[#28343A] flex justify-evenly items-center px-[5vw] z-10">
                                <span className="lilita text-[3.8vh] [-webkit-text-stroke:0.7px_black] text-white">Location: {currentLevel.location}</span>
                                <div className="w-[12vw] h-[8vh]">
                                    <button className="relative w-full h-full cursor-pointer" onClick={showFeedback ? handleNextLevel : handleSubmit} disabled={!isButtonEnabled}>
                                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-[2.5vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>{buttonText}</span>
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    
                    {step === "end" && (() => {
                        const accuracyScore = PERFECT_SCORE > 0 ? Math.round((totalScore / PERFECT_SCORE) * 100) : 0;
                        const gameTimedOut = timeLeft <= 0;
                        const isVictory = accuracyScore >= PASSING_THRESHOLD * 100 && !gameTimedOut;

                        return isVictory ? (
                            <VictoryScreen
                                accuracyScore={accuracyScore}
                                insight={insight}
                                onViewFeedback={handleReviewAnswers}
                                onContinue={handleContinue}
                            />
                        ) : (
                            <LosingScreen
                                accuracyScore={accuracyScore}
                                insight={insight}
                                onPlayAgain={handlePlayAgain}
                                onViewFeedback={handleReviewAnswers}
                                onContinue={handleContinue}
                                onNavigateToSection={handleNavigateToSection}
                                recommendedSectionTitle={recommendedSectionTitle}
                            />
                        );
                    })()}

                    {step === "review" && (
                        <ReviewScreen answers={levelResults} onBackToResults={handleBackToResults} />
                    )}
                </div>
            )}
        </div>
    );
}