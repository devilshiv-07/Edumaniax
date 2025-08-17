import React, { useState, useEffect } from "react";
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { useEnvirnoment } from "@/contexts/EnvirnomentContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import { Star } from "lucide-react";
import GameNav from "./GameNav";

// ======================= CHANGE 1: Import new screens =======================
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
// ============================================================================


// =============================================================================
// Reusable End-Screen Components (No Changes Here)
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
          <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
            <p className="text-black text-sm font-bold my-2 uppercase">Pairs Found</p>
            <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center py-3 px-5">
              <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
              <span className="text-[#09BE43] text-2xl ">{accuracyScore}%</span>
            </div>
          </div>
          <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
            <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
            <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center px-4 text-center">
              <span className="text-[#FFCC00] font-['Lilita_One'] text-sm ">{insight}</span>
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

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, moves, pairsFound, totalPairs }) {
    return (
      <div className="w-full min-h-screen bg-[#0A160E] flex flex-col overflow-hidden">
        <style>{scrollbarHideStyle}</style>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto md:overflow-y-hidden no-scrollbar">
          <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
          <p className="text-yellow-400 font-['Lilita_One'] text-2xl sm:text-3xl  text-center">Oops! Time's Up!</p>
          <p className="text-yellow-400 font-['Lilita_One'] text-2xl sm:text-3xl  text-center mb-6">Wanna Retry?</p>
          
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md md:max-w-xl ">
            <div className="bg-red-500 rounded-xl p-1 flex flex-col items-center">
              <p className="text-black text-sm font-bold my-2 uppercase">Accuracy</p>
              <div className="bg-[#131F24] w-full h-20 md:h-16 lg:h-20 rounded-lg flex items-center justify-center py-3 px-5">
                <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                <span className="text-red-500 text-2xl ">{accuracyScore}%</span>
              </div>
            </div>
            
            <div className="bg-blue-500 rounded-xl p-1 flex flex-col items-center">
              <p className="text-black text-sm font-bold my-2 uppercase">Moves Used</p>
              <div className="bg-[#131F24] w-full h-20 md:h-16 lg:h-20 rounded-lg flex items-center justify-center py-3 px-5">
                <span className="text-blue-400 text-2xl ">{moves}</span>
              </div>
            </div>

            <div className="bg-purple-500 rounded-xl p-1 flex flex-col items-center">
              <p className="text-black text-sm font-bold my-2 uppercase">Pairs Found</p>
              <div className="bg-[#131F24] w-full h-20 md:h-16 lg:h-20 rounded-lg flex items-center justify-center py-3 px-5">
                <span className="text-purple-400 text-2xl ">{`${pairsFound}/${totalPairs}`}</span>
              </div>
            </div>

            <div className="bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
              <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
              <div className="bg-[#131F24] w-full h-20 md:h-16 lg:h-20 rounded-lg flex items-center justify-center px-4 text-center">
                <span className="text-[#FFCC00] font-['Lilita_One'] text-sm ">{insight}</span>
              </div>
            </div>
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
        <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white font-['Lilita_One'] rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-b-0 shadow-lg">
          Back to Results
        </button>
      </div>
    );
}


// =============================================================================
// Main Game Component
// =============================================================================

const ExternalityDetectiveGame = () => {
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  
  // =================== CHANGE 2: Update initial state =======================
  // 'intro' -> 'instructions' -> 'game' -> 'result'
  const [currentPage, setCurrentPage] = useState("intro"); 
  // ==========================================================================

  const [resultPage, setResultPage] = useState('victory'); // 'victory', 'loss', 'review'
  const [reviewData, setReviewData] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());

  // Game data - scenarios and their externalities
  const cardPairs = [
    { id: 1, scenario: "🚗 Heavy Traffic Congestion", externality: "🌫️ Air Pollution & Time Loss" },
    { id: 2, scenario: "📦 Cheap Plastic Packaging", externality: "🌍 Environmental Cleanup Cost" },
    { id: 3, scenario: "👕 Fast Fashion Store", externality: "🗑️ Textile Waste & Poor Labor" },
    { id: 4, scenario: "🌾 Agricultural Fertilizers", externality: "💧 Water Pollution & Algae" },
    { id: 5, scenario: "🏖️ Tourist Resort Motorboats", externality: "🐠 Coral Damage & Noise" },
  ];

  // Create shuffled cards array
  const createCards = () => {
    const cards = [];
    cardPairs.forEach((pair) => {
      cards.push({ id: `scenario-${pair.id}`, type: "scenario", content: pair.scenario, pairId: pair.id });
      cards.push({ id: `externality-${pair.id}`, type: "externality", content: pair.externality, pairId: pair.id });
    });
    return cards.sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState(createCards);

  // Timer effect
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      setIsWinner(false); // Explicitly set as not winner
      setGameOver(true);
      setCurrentPage("result");
    }
  }, [timeLeft, gameStarted, gameOver]);

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
    setCards(createCards());
    setStartTime(Date.now());
  };

  const handleCardClick = (cardId) => {
    if (gameOver || flippedCards.length >= 2 || flippedCards.includes(cardId) || matchedPairs.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);
    
    if(newFlippedCards.length === 1) {
        // Auto-close after 3 seconds if no second card is selected
        setTimeout(() => {
            setFlippedCards((current) => current.length === 1 && current[0] === cardId ? [] : current);
        }, 3000);
    }

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const card1 = cards.find((c) => c.id === newFlippedCards[0]);
      const card2 = cards.find((c) => c.id === newFlippedCards[1]);

      if (card1.pairId === card2.pairId) {
        // Match found!
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
        // No match
        setTimeout(() => setFlippedCards([]), 1500);
      }
    }
  };

  const resetGame = () => {
    // On continue, go back to the very start
    setCurrentPage("intro");
    setGameStarted(false);
  };

  // Handlers for the new end screens
  const handlePlayAgain = () => startGame();
  const handleContinue = () => resetGame();
  const handleViewReview = () => setResultPage("review");
  const handleBackToResults = () => {
      setResultPage(isWinner ? "victory" : "loss");
  };

  useEffect(() => {
    if (!gameOver) return;

    if (currentPage === 'result') {
        setResultPage(isWinner ? "victory" : "loss");
        if(isWinner) {
            completeEnvirnomentChallenge(1, 1);
        }

        const generatedReviewData = cardPairs.map(pair => {
            const scenarioCardId = `scenario-${pair.id}`;
            const wasFound = matchedPairs.includes(scenarioCardId);
            return {
              cause: pair.scenario,
              isCorrect: wasFound,
              userSequence: wasFound ? [pair.externality] : ["-- Not Matched --"],
              correctSequence: [pair.externality]
            };
        });
        setReviewData(generatedReviewData);
    }
    
    // Logic for performance update
    const endTime = Date.now();
    const timeTakenSec = Math.floor((endTime - startTime) / 1000);
    const studyTimeMin = Math.ceil(timeTakenSec / 60);
    const accuracy = matchedPairs.length / cards.length;
    const finalScore = score + (isWinner ? Math.max(0, timeLeft * 10) : 0);
    const maxPossibleScore = cardPairs.length * 100 + 60 * 5; 
    const scaledScore = parseFloat(((finalScore / maxPossibleScore) * 10).toFixed(2));

    updatePerformance({
      moduleName: "Environment",
      topicName: "ecoDecisionMaker",
      score: scaledScore,
      accuracy: parseFloat((accuracy * 100).toFixed(2)),
      avgResponseTimeSec: parseFloat((timeTakenSec / (moves || 1)).toFixed(2)),
      studyTimeMinutes: studyTimeMin,
      completed: true,
    });

  }, [gameOver, currentPage, isWinner]);

  // ================ CHANGE 3: REMOVED the old start screen logic ================
  // The typing effect has been moved to IntroScreen.js
  // ============================================================================
  
  // ================ CHANGE 4: Add new handler and update rendering ============
  const handleShowInstructions = () => {
    setCurrentPage("instructions");
  };

  if (currentPage === "intro") {
    return <IntroScreen onShowInstructions={handleShowInstructions} />;
  }

  if (currentPage === "instructions") {
    return <InstructionsScreen onStartGame={startGame} />;
  }
  // ============================================================================

  if (currentPage === "game") {
    return (
      <div className="min-h-screen w-full bg-[#0A160E]">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <GameNav timeLeft={timeLeft} moves={moves} />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-4 mt-12 md:mt-16 lg:mt-35">
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

  // New Result Screen Logic
  if (currentPage === "result") {
    const pairsFoundCount = matchedPairs.length / 2;
    const totalPairsCount = cardPairs.length;
    const accuracyScore = Math.round((matchedPairs.length / cards.length) * 100);
    const insight = isWinner ? "Great detective work! You linked every scenario to its hidden cost." : "Some externalities are tricky. Review them to sharpen your skills!";
    
    switch (resultPage) {
        case 'victory':
            return <VictoryScreen 
                accuracyScore={accuracyScore}
                insight={insight}
                onContinue={handleContinue}
                onViewFeedback={handleViewReview}
            />;
        case 'loss':
            return <LosingScreen 
                accuracyScore={accuracyScore}
                insight={insight}
                onPlayAgain={handlePlayAgain}
                onContinue={handleContinue}
                onViewFeedback={handleViewReview}
                moves={moves}
                pairsFound={pairsFoundCount}
                totalPairs={totalPairsCount}
            />;
        case 'review':
            return <ReviewScreen 
                answers={reviewData}
                onBackToResults={handleBackToResults}
            />;
        default:
            return null; // Should not happen
    }
  }
};

export default ExternalityDetectiveGame;