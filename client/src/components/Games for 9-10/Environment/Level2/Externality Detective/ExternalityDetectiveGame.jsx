import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Star } from "lucide-react";
import axios from "axios";

// NEW: Import the notes data for this module
import { notesEnvironment9to10 } from "@/data/notesEnvironment9to10.js"; 

import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import GameNav from "./GameNav";

// =============================================================================
// Gemini API and Session Storage Setup
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'externalityDetectiveGameState'; // Unique key for this game

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
// REUSABLE END-SCREEN COMPONENTS (Fully Integrated)
// =============================================================================

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col ">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center sm:justify-start md:justify-center text-center px-4 overflow-y-auto md:overflow-y-hidden no-scrollbar">
                <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="text-yellow-400 font-['Lilita_One'] text-3xl sm:text-4xl sm:mt-6 md:mt-0">Case Solved!</h2>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Pairs Found</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center p-4">
                           <div className="flex items-center">
                                <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                                <span className="text-[#09BE43] text-2xl ">{accuracyScore}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center p-4 text-center">
                            <span className="text-[#FFCC00] inter-font font-normal text-xs ">{insight}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center items-center gap-2 sm:gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-10 sm:h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-10 sm:h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, moves, pairsFound, totalPairs, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto md:overflow-y-hidden no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 font-['Lilita_One'] text-2xl sm:text-3xl text-center">Oops! Time's Up!</p>
                <p className="text-yellow-400 font-['Lilita_One'] text-2xl sm:text-3xl text-center mb-4">Wanna Retry?</p>
                
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md md:max-w-xl ">
                    <div className="bg-red-500 rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[4rem] rounded-lg flex flex-grow items-center justify-center p-4">
                            <div className="flex items-center">
                                <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                                <span className="text-red-500 text-xl ">{accuracyScore}%</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-blue-500 rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Moves Used</p>
                        <div className="bg-[#131F24] w-full min-h-[4rem] rounded-lg flex flex-grow items-center justify-center p-4">
                            <span className="text-blue-400 text-xl ">{moves}</span>
                        </div>
                    </div>

                    <div className="bg-purple-500 rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Pairs Found</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center p-4">
                            <span className="text-purple-400 text-2xl ">{`${pairsFound}/${totalPairs}`}</span>
                        </div>
                    </div>

                    <div className="bg-[#FFCC00] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase text-center">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center p-4 text-center">
                            <span className="text-[#FFCC00] inter-font font-normal text-xs ">{insight}</span>
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
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center items-center gap-2 sm:gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-10 sm:h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-10 sm:h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-10 sm:h-12 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold font-['Lilita_One'] mb-6 text-yellow-400 shrink-0">Review Your Matches</h1>
            <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grow overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        <p className="text-gray-300 text-base mb-2 font-bold">Scenario: {ans.cause}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Match:</p>
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>
                                {ans.userSequence?.join(" → ")}
                            </p>
                            {!ans.isCorrect && (
                                <>
                                    <p className="font-semibold pt-2">Correct Match:</p>
                                    <p className="font-mono text-green-300">{ans.correctSequence?.join(" → ")}</p>
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

// =============================================================================
// Main Game Component
// =============================================================================
const ExternalityDetectiveGame = () => {
    const navigate = useNavigate();
    
    // Original State Management
    const [currentPage, setCurrentPage] = useState("intro"); 
    const [resultPage, setResultPage] = useState('victory');
    const [reviewData, setReviewData] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedPairs, setMatchedPairs] = useState([]);
    const [moves, setMoves] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(120);
    const [gameStarted, setGameStarted] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [isWinner, setIsWinner] = useState(false);
    const [isPopupVisible, setPopupVisible] = useState(false); // --- NEW STATE FOR POPUP ---
    
    // States for AI features
    const [insight, setInsight] = useState("");
    const [recommendedSectionId, setRecommendedSectionId] = useState(null);
    const [recommendedSectionTitle, setRecommendedSectionTitle] = useState("");

    const cardPairs = useMemo(() => [
        { id: 1, scenario: "🚗 Heavy Traffic Congestion", externality: "🌫️ Air Pollution & Time Loss" },
        { id: 2, scenario: "📦 Cheap Plastic Packaging", externality: "🌍 Environmental Cleanup Cost" },
        { id: 3, scenario: "👕 Fast Fashion Store", externality: "🗑️ Textile Waste & Poor Labor" },
        { id: 4, scenario: "🌾 Agricultural Fertilizers", externality: "💧 Water Pollution & Algae" },
        { id: 5, scenario: "🏖️ Tourist Resort Motorboats", externality: "🐠 Coral Damage & Noise" },
    ], []);

    const createCards = useCallback(() => {
        const cards = [];
        cardPairs.forEach((pair) => {
            cards.push({ id: `scenario-${pair.id}`, type: "scenario", content: pair.scenario, pairId: pair.id });
            cards.push({ id: `externality-${pair.id}`, type: "externality", content: pair.externality, pairId: pair.id });
        });
        return cards.sort(() => Math.random() - 0.5);
    }, [cardPairs]);

    const [cards, setCards] = useState(() => createCards());

    // useEffect to restore state from sessionStorage
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            const savedState = JSON.parse(savedStateJSON);
            setCurrentPage(savedState.currentPage);
            setResultPage(savedState.resultPage);
            setReviewData(savedState.reviewData);
            setFlippedCards(savedState.flippedCards);
            setMatchedPairs(savedState.matchedPairs);
            setMoves(savedState.moves);
            setScore(savedState.score);
            setTimeLeft(savedState.timeLeft);
            setGameStarted(savedState.gameStarted);
            setGameOver(savedState.gameOver);
            setIsWinner(savedState.isWinner);
            setInsight(savedState.insight);
            setRecommendedSectionId(savedState.recommendedSectionId);
            setRecommendedSectionTitle(savedState.recommendedSectionTitle);
            setCards(savedState.cards);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, []);

    // Original timer useEffect
    useEffect(() => {
        if (gameStarted && timeLeft > 0 && !gameOver) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0 && !gameOver) {
            setIsWinner(false);
            setGameOver(true);
            setCurrentPage("result");
        }
    }, [timeLeft, gameStarted, gameOver]);

    // MODIFIED: This effect now handles ALL end-of-game logic, including creating review data
    useEffect(() => {
        if (currentPage === 'result') {
            
            // =================================================================
            // FIXED: Populate reviewData as soon as the game ends.
            // =================================================================
            const finalReviewData = cardPairs.map(pair => {
                const scenarioCardId = `scenario-${pair.id}`;
                // A pair is considered correctly matched if its scenario card is in the matchedPairs array.
                const isCorrectlyMatched = matchedPairs.includes(scenarioCardId);

                return {
                    cause: pair.scenario,
                    isCorrect: isCorrectlyMatched,
                    // If matched, show the correct pair. If not, show a placeholder.
                    userSequence: isCorrectlyMatched
                        ? [pair.scenario, pair.externality]
                        : [pair.scenario, "--- Not Found ---"],
                    // Always show the correct sequence for reference.
                    correctSequence: [pair.scenario, pair.externality],
                };
            });
            setReviewData(finalReviewData);
            // =================================================================

            // Now, handle the AI insight generation if it hasn't been done yet
            if (!insight) {
                const generateInsight = async () => {
                    setInsight("Analyzing your results...");
                    const accuracyScore = Math.round((matchedPairs.length / cards.length) * 100);
                    
                    const incorrectAnswers = cardPairs
                        .filter(pair => !matchedPairs.includes(`scenario-${pair.id}`))
                        .map(pair => ({ cause: pair.scenario, correctMatch: pair.externality }));

                    if (incorrectAnswers.length === 0 && isWinner) {
                        setInsight("Great detective work! You linked every scenario to its hidden cost.");
                        return;
                    }

                    const noteSectionsForModule = notesEnvironment9to10;
                    const prompt = `
A student played a game called 'Externality Detective', matching scenarios to their hidden environmental/social costs.
### Performance Data:
- Accuracy: ${accuracyScore}%
- Moves: ${moves}
- Unmatched Pairs (Mistakes): ${JSON.stringify(incorrectAnswers)}

### Available Note Sections for this Module:
${JSON.stringify(noteSectionsForModule)}

### YOUR TASK:
1.  **DETECT:** Analyze the unmatched pairs. The game is about externalities, development costs, and pollution. The most relevant note section will likely be "Module 2: Unsustainable Growth".
2.  **GENERATE:** Write a short, encouraging feedback message (25-35 words) that specifically recommends the user review the detected section by its title.
### OUTPUT FORMAT:
Return ONLY a raw JSON object.
{
  "detectedTopicId": "m-2",
  "insight": "Your personalized feedback recommending Module 2 here."
}`;

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
                        setInsight("Spotting hidden costs is tricky! Reviewing 'Module 2: Unsustainable Growth' will help sharpen your detective skills.");
                        setRecommendedSectionId('m-2');
                        setRecommendedSectionTitle("Module 2: Unsustainable Growth");
                    }
                };
                generateInsight();
            }
        }
    }, [currentPage, insight, matchedPairs, cards, moves, isWinner, cardPairs]); // Added cardPairs to dependencies
    
    // Game functions
    const startGame = () => {
        setCurrentPage("game");
        setGameStarted(true);
        setTimeLeft(120);
        setMoves(0);
        setScore(0);
        setFlippedCards([]);
        setMatchedPairs([]);
        setGameOver(false);
        setIsWinner(false);
        setReviewData([]);
        setInsight("");
        setRecommendedSectionId(null);
        setRecommendedSectionTitle("");
        setCards(createCards());
    };

    const handleCardClick = (cardId) => {
        if (gameOver || flippedCards.length >= 2 || flippedCards.includes(cardId) || matchedPairs.includes(cardId)) return;

        const newFlippedCards = [...flippedCards, cardId];
        setFlippedCards(newFlippedCards);
        
        if(newFlippedCards.length === 1) {
            setTimeout(() => {
                setFlippedCards((current) => current.length === 1 && current[0] === cardId ? [] : current);
            }, 3000);
        }

        if (newFlippedCards.length === 2) {
            setMoves(moves + 1);
            const card1 = cards.find((c) => c.id === newFlippedCards[0]);
            const card2 = cards.find((c) => c.id === newFlippedCards[1]);

            if (card1.pairId === card2.pairId) {
                setTimeout(() => {
                    const newMatchedPairs = [...matchedPairs, ...newFlippedCards];
                    setMatchedPairs(newMatchedPairs);
                    setFlippedCards([]);
                    setScore(score + 100 + Math.max(0, 60 - moves) * 5); 

                    if (newMatchedPairs.length === cards.length) {
                        setIsWinner(true);
                        setGameOver(true);
                        setCurrentPage("result");
                    }
                }, 1000);
            } else {
                setTimeout(() => setFlippedCards([]), 1500);
            }
        }
    };

    const handleShowInstructions = () => setCurrentPage("instructions");
    const handleBackToResults = () => setResultPage(isWinner ? "victory" : "loss");
    const handleViewReview = () => setResultPage("review");
    
    // Handlers that manage session storage
    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            const stateToSave = { currentPage, resultPage, reviewData, flippedCards, matchedPairs, moves, score, timeLeft, gameStarted, gameOver, isWinner, insight, recommendedSectionId, recommendedSectionTitle, cards };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
            navigate(`/environmental/notes?grade=9-10&section=${recommendedSectionId}`);
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
        navigate('/SustainabilityGames1');
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

    // Render logic
    const renderContent = () => {
        if (currentPage === "intro") return <IntroScreen onShowInstructions={handleShowInstructions} onStartGame={startGame} />;
        if (currentPage === "instructions") return <InstructionsScreen onStartGame={startGame} />;
        if (currentPage === "game") {
            return ( <div className="min-h-screen w-full bg-[#0A160E]">
                 <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                      <GameNav timeLeft={timeLeft} moves={moves} />
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 mt-16 md:mt-24 lg:mt-35">
                            {cards.map((card) => {
                                const isFlipped = flippedCards.includes(card.id) || matchedPairs.includes(card.id);
                                const isMatched = matchedPairs.includes(card.id);
                                let cardStyle = "";
                                let textColor = "";

                                if (isMatched) {
                                    cardStyle = "rounded-[0.75rem] border border-[#2BFF00] bg-[rgba(43,255,0,0.25)] shadow-[0_2px_0_0_#2BFF00]";
                                    textColor = "text-[#2BFF00]";
                                } else if (isFlipped) {
                                    cardStyle = "rounded-[0.75rem] border border-[#08B6FF] bg-[rgba(8,182,255,0.20)] shadow-[0_2px_0_0_#08B6FF]";
                                    textColor = "text-[#08B6FF]";
                                } else {
                                    cardStyle = "rounded-[0.75rem] border border-[#37464F] bg-[#131F24] shadow-[0_2px_0_0_#37464F]";
                                }

                                return (
                                    <div key={card.id} onClick={() => handleCardClick(card.id)} className="relative aspect-square cursor-pointer transform transition-all duration-300 hover:scale-105">
                                        <div className={`absolute inset-0 transition-all duration-500 ${cardStyle} ${isFlipped ? "rotate-0" : "-rotate-y-180"}`} style={{ transformStyle: "preserve-3d" }}>
                                            <div className={`absolute inset-0 h-full w-full flex flex-col justify-center items-center text-center p-2 sm:p-3 backface-hidden ${isFlipped ? '' : 'hidden'}`}>
                                                <div className="text-2xl sm:text-3xl lg:text-4xl mb-1 sm:mb-2">
                                                    {card.content.split(" ")[0]}
                                                </div>
                                                <div className={`text-xs sm:text-sm lg:text-lg font-bold break-words ${textColor}`}>
                                                    {card.content.substring(card.content.indexOf(" ") + 1)}
                                                </div>
                                                {isMatched && (
                                                    <div className={`absolute top-1 right-1 ${textColor}`}>
                                                        <Star className="w-4 h-4 fill-current" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`absolute inset-0 h-full w-full flex items-center justify-center rotate-y-180 backface-hidden ${isFlipped ? 'hidden' : ''}`}>
                                                <div className="text-4xl animate-pulse">🔍</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                       </div>
                   </div>
             </div>
            );
        }
        
        if (currentPage === "result") {
            const pairsFoundCount = matchedPairs.length / 2;
            const totalPairsCount = cardPairs.length;
            const accuracyScore = Math.round((pairsFoundCount / totalPairsCount) * 100);
            
            if (resultPage === 'review') {
                return <ReviewScreen answers={reviewData} onBackToResults={handleBackToResults} />;
            }
            
            return isWinner ? (
                <VictoryScreen 
                    accuracyScore={accuracyScore}
                    insight={insight}
                    onContinue={handleContinue}
                    onViewFeedback={handleViewReview}
                />
            ) : (
                <LosingScreen 
                    accuracyScore={accuracyScore}
                    insight={insight}
                    onPlayAgain={handlePlayAgain}
                    onContinue={handleContinue}
                    onViewFeedback={handleViewReview}
                    moves={moves}
                    pairsFound={pairsFoundCount}
                    totalPairs={totalPairsCount}
                    onNavigateToSection={handleNavigateToSection}
                    recommendedSectionTitle={recommendedSectionTitle}
                />
            );
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
};

export default ExternalityDetectiveGame;