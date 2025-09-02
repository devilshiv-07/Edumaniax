import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";
import { Award, RefreshCw, Volume2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Core Game Imports ---
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// --- Component Imports ---
import { notesCommunication6to8 } from "@/data/notesCommunication6to8.js";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import IntroScreen from "./IntroScreen";
import InstructionsScreenComponent from "./InstructionsScreen";

// =============================================================================
// Setup & Helpers
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'nvcGameState_v12';

function parsePossiblyStringifiedJSON(text) {
  if (typeof text !== "string") return null;
  text = text.trim();
  if (text.startsWith("```")) {
    text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
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

// =============================================================================
// Reusable UI Components
// =============================================================================

const BuilderProgressTracker = ({ nvcSentence }) => {
    const steps = ['FEELING', 'ACTION', 'REASON', 'SOLUTION'];
    const completedSteps = [
        !!nvcSentence.feeling,
        !!nvcSentence.action,
        !!nvcSentence.reason,
        !!nvcSentence.solution,
    ];
    
    let currentStepIndex = completedSteps.findIndex(done => !done);
    if (currentStepIndex === -1) currentStepIndex = steps.length;

    return (
        <div className="w-full flex flex-col items-center justify-center pt-8 pb-4 gap-3 px-4 shrink-0">
            <div className="flex items-center space-x-2 md:space-x-3">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-md font-bold transition-colors duration-300 ${index < currentStepIndex ? 'bg-green-500 text-white' : index === currentStepIndex ? 'bg-yellow-400 text-black' : 'bg-gray-600 text-gray-300'}`}>
                            {index < currentStepIndex ? '✓' : index + 1}
                        </div>
                        {index < steps.length - 1 && (
                            <div className="h-1 w-8 md:w-12 bg-gray-600 rounded-full">
                                <div
                                    className="h-1 bg-green-500 transition-all duration-500"
                                    style={{ width: index < currentStepIndex ? '100%' : '0%' }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <h2 className="text-slate-100 text-2xl font-medium leading-relaxed text-center font-['Lilita_One']">
                Build Your Kind Message
            </h2>
        </div>
    );
};

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
  const { width, height } = useWindowSize();
  return (
    <div className="w-full h-screen bg-[#0A160E] flex flex-col">
      <style>{scrollbarHideStyle}</style>
      <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 overflow-y-auto no-scrollbar">
        <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
          <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
          <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
        </div>
        <h2 className="text-yellow-400 font-['Lilita_One'] text-3xl sm:text-4xl mt-6">Amazing Job!</h2>
        <p className="text-white text-lg mt-2">You have a real talent for kind and clear communication!</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl items-stretch">
          <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col">
            <p className="text-black text-sm font-bold my-2 uppercase">Accuracy Score</p>
            <div className="bg-[#131F24] w-full rounded-lg flex flex-grow items-center justify-center p-4">
              <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
              <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
            </div>
          </div>
          <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
            <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
            <div className="bg-[#131F24] w-full rounded-lg flex flex-grow items-center justify-center p-4 text-center">
              <span className="text-[#FFCC00] lilita-one-regular text-sm">{insight}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center items-center gap-4 shrink-0">
        <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-10 md:h-14 hover:scale-105" />
        <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-10 md:h-14 hover:scale-105" />
      </div>
    </div>
  );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
  return (
    <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
      <style>{scrollbarHideStyle}</style>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
        <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6" />
        <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl">Good try! This is a great chance to learn.</p>
        <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl mb-6">Want to try again?</p>
        <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl items-stretch">
          <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col">
            <p className="text-black text-sm font-bold my-2 uppercase">Accuracy Score</p>
            <div className="bg-[#131F24] w-full rounded-lg flex flex-grow items-center justify-center p-4">
              <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
              <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
            </div>
          </div>
          <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
            <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
            <div className="bg-[#131F24] w-full rounded-lg flex flex-grow items-center justify-center p-4 text-center">
              <span className="text-[#FFCC00] lilita-one-regular text-xs">{insight}</span>
            </div>
          </div>
        </div>
        {recommendedSectionTitle && (
          <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
            <button
              onClick={onNavigateToSection}
              className="bg-[#068F36] text-black font-semibold rounded-lg py-3 px-10 hover:bg-green-700 border-b-4 border-green-800 active:border-transparent"
            >
              Review "{recommendedSectionTitle}" Notes
            </button>
          </div>
        )}
      </div>
      <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
        <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 hover:scale-105" />
        <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 hover:scale-105" />
        <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" />
      </div>
    </div>
  );
}

function ReviewScreen({ results, scenario, onBackToResults }) {
    const correctChoice = scenario.choices.find(c => c.correct);
    const idealBuilderAnswers = {
        feeling: "upset",
        action: "take without asking",
        reason: "I was using it first",
        solution: "ask before taking things",
    };
    const reviewItems = [
        {
            question: "Initial Response",
            userAnswer: results.choice.userAnswerText,
            correctAnswer: correctChoice.text,
            isCorrect: results.choice.isCorrect,
        },
        {
            question: "How do you feel?",
            userAnswer: results.builder.sentence.feeling,
            correctAnswer: idealBuilderAnswers.feeling,
            isCorrect: results.builder.sentence.feeling === idealBuilderAnswers.feeling,
        },
        {
            question: "What was the action?",
            userAnswer: results.builder.sentence.action,
            correctAnswer: idealBuilderAnswers.action,
            isCorrect: results.builder.sentence.action === idealBuilderAnswers.action,
        },
        {
            question: "Why did it make you feel that way?",
            userAnswer: results.builder.sentence.reason,
            correctAnswer: idealBuilderAnswers.reason,
            isCorrect: results.builder.sentence.reason === idealBuilderAnswers.reason,
        },
        {
            question: "What is a kind solution?",
            userAnswer: results.builder.sentence.solution,
            correctAnswer: idealBuilderAnswers.solution,
            isCorrect: results.builder.sentence.solution === idealBuilderAnswers.solution,
        },
    ];
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400">Review Your Answers</h1>
            <div className="w-full max-w-4xl flex flex-col gap-4 overflow-y-auto p-2 no-scrollbar">
                {reviewItems.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${item.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                        <p className="text-gray-300 font-bold mb-2">{item.question}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Answer:</p>
                            <p className={`${item.isCorrect ? 'text-white' : 'text-red-300'}`}>• {item.userAnswer}</p>
                            {!item.isCorrect && (
                                <>
                                    <p className="font-semibold pt-2">Ideal Answer:</p>
                                    <p className="text-green-300">• {item.correctAnswer}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700">Back to Results</button>
        </div>
    );
}

const InstructionsScreen = ({ onStartGame }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <InstructionsScreenComponent onStartGame={onStartGame} />
        </div>
    );
};

// =============================================================================
// Main NVCGame Component
// =============================================================================
const NVCGame = () => {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();
    const [gameState, setGameState] = useState("intro");
    const [gamePhase, setGamePhase] = useState("choice");
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [score, setScore] = useState(0);
    const [nvcSentence, setNvcSentence] = useState({ feeling: "", action: "", reason: "", solution: "" });
    const [finalResults, setFinalResults] = useState(null);
    const [insight, setInsight] = useState("");
    const [recommendedSectionId, setRecommendedSectionId] = useState(null);
    const [recommendedSectionTitle, setRecommendedSectionTitle] = useState("");
    const [startTime, setStartTime] = useState(Date.now());
    const [responseTimes, setResponseTimes] = useState([]);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());
    const [showChoiceFeedback, setShowChoiceFeedback] = useState(false);
    const [choiceFeedbackMessage, setChoiceFeedbackMessage] = useState("");
    const builderScrollRef = useRef(null);

    const scenario = {
        text: "Your friend grabbed the sketch pen while you were using it.",
        choices: [
          { id: "A", text: "What's wrong with you?! I was using that!", correct: false },
          { id: "B", text: "I feel upset when you grab the pen without asking. Can we take turns?", correct: true },
        ],
    };
    const emotions = [
        { text: "angry", emoji: "😠" }, { text: "sad", emoji: "😢" },
        { text: "annoyed", emoji: "😤" }, { text: "upset", emoji: "😔" },
        { text: "frustrated", emoji: "😫" },
    ];
    const actions = ["take without asking", "grab things from me", "interrupt what I'm doing", "don't wait for your turn"];
    const reasons = ["it feels unfair", "I was using it first", "it makes me feel bad", "I need to finish my work"];
    const solutions = ["share better next time", "ask before taking things", "take turns nicely", "talk about it first"];
    
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                setGameState(savedState.gameState || "intro");
                setGamePhase(savedState.gamePhase || "choice");
                setSelectedChoice(savedState.selectedChoice || null);
                setScore(savedState.score || 0);
                setNvcSentence(savedState.nvcSentence || { feeling: "", action: "", reason: "", solution: "" });
                setFinalResults(savedState.finalResults || null);
                setInsight(savedState.insight || "");
                setRecommendedSectionId(savedState.recommendedSectionId || null);
                setRecommendedSectionTitle(savedState.recommendedSectionTitle || "");
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (e) { console.error("Failed to load saved game state", e); }
        }
    }, []);

    useEffect(() => {
        if (gameState === 'end' && finalResults && !insight) {
            const generateInsight = async () => {
                setInsight("Analyzing your results...");
                const prompt = `A student played a Nonviolent Communication game. Their accuracy was ${finalResults.accuracy}%. Their initial response was ${finalResults.review.choice.isCorrect ? 'correct' : 'incorrect'}. The available notes are: ${JSON.stringify(notesCommunication6to8)}. 
                TASK: 1. DETECT: Find the most relevant note section for improving emotional communication. 
                2. GENERATE: Write a 25-35 word insight recommending that section. OUTPUT: JSON with "detectedTopicId" and "insight".`;
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const parsed = parsePossiblyStringifiedJSON(response.data.candidates[0].content.parts[0].text);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication6to8.find(note => note.topicId === parsed.detectedTopicId);
                        setInsight(parsed.insight);
                        setRecommendedSectionId(parsed.detectedTopicId);
                        if (recommendedNote) setRecommendedSectionTitle(recommendedNote.title);
                    } else { throw new Error("Parsed AI response is invalid."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    setInsight("Great attempt! To make your communication even clearer, review the 'Understanding Empathy' notes.");
                    setRecommendedSectionId('2');
                    setRecommendedSectionTitle("Understanding Empathy");
                }
            };
            generateInsight();
        }
    }, [gameState, finalResults, insight]);

    useEffect(() => {
        if (gamePhase === 'builder' && builderScrollRef.current) {
            const timer = setTimeout(() => {
                builderScrollRef.current.scrollTo({
                    top: builderScrollRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [gamePhase, nvcSentence.feeling, nvcSentence.action, nvcSentence.reason]);


    const startGame = () => {
        setGameState("playing");
        setGamePhase("choice");
        setSelectedChoice(null);
        setScore(0);
        setNvcSentence({ feeling: "", action: "", reason: "", solution: "" });
        setFinalResults(null);
        setInsight("");
        setRecommendedSectionId(null);
        setRecommendedSectionTitle("");
        setShowChoiceFeedback(false);
        setChoiceFeedbackMessage("");
        setStartTime(Date.now());
        setResponseTimes([]);
        setQuestionStartTime(Date.now());
    };

    const handleChoiceSelect = (choice) => {
        if (showChoiceFeedback) return;
        setSelectedChoice(choice);
    };

    const handleSubmitChoice = () => {
        if (!selectedChoice) return;
        const responseTime = (Date.now() - questionStartTime) / 1000;
        setResponseTimes(prev => [...prev, responseTime]);
        setShowChoiceFeedback(true);
        if (selectedChoice.correct) {
            setScore(10);
            setChoiceFeedbackMessage("Excellent choice! That's a great way to communicate.");
        } else {
            setScore(0);
            setChoiceFeedbackMessage("That's one way to respond, but let's see if we can build an even kinder message.");
        }
    };

    const handleContinueChoice = () => {
        setGamePhase("builder");
        setQuestionStartTime(Date.now());
    };
    
    const handleNvcSelect = (category, value) => {
        setNvcSentence(prev => ({ ...prev, [category]: value }));
    };

    const isNvcComplete = useMemo(() => {
        return !!(nvcSentence.feeling && nvcSentence.action && nvcSentence.reason && nvcSentence.solution);
    }, [nvcSentence]);

    const handleGameComplete = () => {
        if (!isNvcComplete) return;
        let finalScore = score;
        if (isNvcComplete) {
            finalScore += 15;
        }
        const totalPossibleScore = 25;
        const accuracy = Math.round((finalScore / totalPossibleScore) * 100);
        const results = {
            score: finalScore, accuracy,
            review: {
                choice: { isCorrect: selectedChoice.correct, userAnswerText: selectedChoice.text },
                builder: { isComplete: isNvcComplete, sentence: nvcSentence }
            }
        };
        setFinalResults(results);
        setGameState("end");
        completeCommunicationChallenge(1, 0);
        const endTime = Date.now();
        const durationSec = (endTime - startTime) / 1000;
        const avgResponseTimeSec = responseTimes.length > 0 ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length : 0;
        updatePerformance({
            moduleName: "Communication", topicName: "emotionalIntelligence",
            score: Math.round(accuracy / 10), accuracy,
            studyTimeMinutes: durationSec / 60, avgResponseTimeSec, completed: true,
        });
    };
    
    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            const stateToSave = { gameState, gamePhase, selectedChoice, score, nvcSentence, finalResults, insight, recommendedSectionId, recommendedSectionTitle };
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
            navigate(`/communications/notes?grade=6-8&section=${recommendedSectionId}`);
        }
    };
    const handleContinue = () => navigate("/communications/games");
    const handleReviewAnswers = () => setGameState("review");
    const handleBackToResults = () => setGameState("end");

    if (gameState === "intro") return <IntroScreen title="Kindness Builder" onShowInstructions={() => setGameState("instructions")} />;
    if (gameState === "end" && finalResults) {
        const isVictory = finalResults.accuracy > 80;
        return isVictory ? <VictoryScreen accuracyScore={finalResults.accuracy} insight={insight} onViewFeedback={handleReviewAnswers} onContinue={handleContinue} /> : <LosingScreen accuracyScore={finalResults.accuracy} insight={insight} onPlayAgain={startGame} onViewFeedback={handleReviewAnswers} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={recommendedSectionTitle} />;
    }
    if (gameState === "review" && finalResults) return <ReviewScreen results={finalResults.review} scenario={scenario} onBackToResults={handleBackToResults} />;

    return (
        <div className="fixed inset-0 bg-[#0A160E] z-20 flex flex-col no-scrollbar overflow-hidden inter-font">
            <style>{scrollbarHideStyle}</style>
            
            <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${gameState === 'instructions' ? 'blur-xs scale-100' : 'blur-none scale-100'}`}>
                <GameNav />
                {gamePhase === 'choice' && (
                    <div className="flex-1 flex flex-col min-h-0">
                       <main className="flex-1 flex flex-col items-center justify-center p-4 min-h-0">
                            <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-10 text-center">
                                <h2 className="text-slate-100 text-2xl font-bold mb-3">Your friend grabbed the sketch pen while you were using it ✏️</h2>
                                <h2 className="text-slate-100 text-xl font-medium mb-6">Choose your response</h2>
                                <div className="w-full max-w-lg mx-auto mt-6 space-y-4">
                                    {scenario.choices.map((choice) => {
                                        let buttonClasses = "w-full p-4 rounded-xl text-left text-lg font-medium transition-colors duration-200 flex items-center space-x-4 border-2 ";
                                        if (showChoiceFeedback) {
                                            if (selectedChoice?.id === choice.id) {
                                                buttonClasses += choice.correct ? "bg-green-900/50 border-green-500 text-green-300 " : "bg-red-900/50 border-red-500 text-red-300 ";
                                            } else {
                                                buttonClasses += "bg-gray-900 border-gray-700 opacity-50 cursor-not-allowed";
                                            }
                                        } else {
                                            buttonClasses += selectedChoice?.id === choice.id ? "bg-gray-700 border-gray-500" : "bg-gray-900 border-gray-700 hover:bg-gray-800 hover:border-gray-600";
                                        }
                                        return (
                                            <button key={choice.id} onClick={() => handleChoiceSelect(choice)} disabled={showChoiceFeedback} className={buttonClasses}>
                                                <div className="bg-gray-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white flex-shrink-0">{choice.id}</div>
                                                <div className="text-gray-200">{choice.text}</div>
                                                {showChoiceFeedback && selectedChoice?.id === choice.id && choice.correct && (<CheckCircle className="text-green-400 ml-auto flex-shrink-0" size={24} />)}
                                            </button>
                                        );
                                    })}
                                </div>
                                {showChoiceFeedback && (<div className="mt-4 p-3 bg-gray-900/50 rounded-lg text-center"><p className={`font-medium ${selectedChoice?.correct ? 'text-green-400' : 'text-red-400'}`}>{choiceFeedbackMessage}</p></div>)}
                            </div>
                        </main>
                        <footer className="w-full h-[12vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                            <div className="w-full max-w-xs h-16">
                                <button className="relative w-full h-full" onClick={showChoiceFeedback ? handleContinueChoice : handleSubmitChoice} disabled={!selectedChoice}>
                                    <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                                    <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lilita-one-regular text-lg text-white [text-shadow:0_3px_0_#000] ${!selectedChoice ? "opacity-50" : ""}`}>{showChoiceFeedback ? "Continue" : "Check Now"}</span>
                                </button>
                            </div>
                        </footer>
                    </div>
                )}
                {gamePhase === 'builder' && (
                     <div className="flex-1 flex flex-col min-h-0">
                        <BuilderProgressTracker nvcSentence={nvcSentence} />
                        <main ref={builderScrollRef} className="flex-1 px-4 py-2 overflow-y-auto no-scrollbar min-h-0">
                            <div className="w-full max-w-4xl mx-auto space-y-4 pb-4">
                                <AnimatePresence>
                                    <BuilderSection key="feeling" title="😊 Step 1: How do you feel?" isVisible={true} accentColor="red">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                                            {emotions.map(item => <BuilderButton key={item.text} item={item} category="feeling" selectedValue={nvcSentence.feeling} onSelect={handleNvcSelect} accentColor="red" />)}
                                        </div>
                                    </BuilderSection>
                                    {nvcSentence.feeling && <BuilderSection key="action" title="👆 Step 2: What was the action?" isVisible={true} accentColor="blue">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {actions.map(text => <BuilderButton key={text} item={{text}} category="action" selectedValue={nvcSentence.action} onSelect={handleNvcSelect} accentColor="blue" />)}
                                        </div>
                                    </BuilderSection>}
                                    {nvcSentence.action && <BuilderSection key="reason" title="💭 Step 3: Why did it make you feel that way?" isVisible={true} accentColor="yellow">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {reasons.map(text => <BuilderButton key={text} item={{text}} category="reason" selectedValue={nvcSentence.reason} onSelect={handleNvcSelect} accentColor="yellow" />)}
                                        </div>
                                    </BuilderSection>}
                                    {nvcSentence.reason && <BuilderSection key="solution" title="🤝 Step 4: What is a kind solution?" isVisible={true} accentColor="green">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {solutions.map(text => <BuilderButton key={text} item={{text}} category="solution" selectedValue={nvcSentence.solution} onSelect={handleNvcSelect} accentColor="green" />)}
                                        </div>
                                    </BuilderSection>}
                                </AnimatePresence>
                            </div>
                        </main>
                         <footer className="w-full h-[12vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                            <div className="w-full max-w-xs h-16">
                                <button className="relative w-full h-full" onClick={handleGameComplete} disabled={!isNvcComplete}>
                                    <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                                    <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lilita-one-regular text-lg text-white [text-shadow:0_3px_0_#000] ${!isNvcComplete ? "opacity-50" : ""}`}>Complete!</span>
                                </button>
                            </div>
                        </footer>
                    </div>
                )}
            </div>
            {gameState === 'instructions' && <InstructionsScreen onStartGame={startGame} />}
        </div>
    );
};

// --- FIX: Corrected component definitions ---
const BuilderSection = ({ title, isVisible, children, accentColor }) => {
    if (!isVisible) return null;
    return (
        <motion.div
            className="bg-gray-800/50 rounded-2xl p-6 border-2 border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
        >
            <h3 className={`text-xl font-bold text-${accentColor}-400 mb-4`}>{title}</h3>
            {children}
        </motion.div>
    );
};

const BuilderButton = ({ item, category, selectedValue, onSelect, accentColor }) => {
    const isSelected = selectedValue === item.text;
    const colorVariants = {
        red: "border-red-500 bg-red-900/60 text-red-300",
        blue: "border-blue-500 bg-blue-900/60 text-blue-300",
        yellow: "border-yellow-500 bg-yellow-900/60 text-yellow-300",
        green: "border-green-500 bg-green-900/60 text-green-300",
    };
    return (
        <button
            onClick={() => onSelect(category, item.text)}
            className={`p-3 rounded-xl font-medium transition-colors duration-200 text-center
            ${isSelected 
                ? `${colorVariants[accentColor]} ring-1 ring-white` 
                : "bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-700"
            }`}
        >
            {item.emoji && <div className="text-3xl mb-1">{item.emoji}</div>}
            <div className="text-sm">{item.text}</div>
        </button>
    );
};

export default NVCGame;