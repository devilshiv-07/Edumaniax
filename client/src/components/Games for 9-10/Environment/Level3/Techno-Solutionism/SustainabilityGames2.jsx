import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import { Star } from "lucide-react";
import axios from "axios";

// NEW: Import the notes data for this module
import { notesEnvironment9to10 } from "@/data/notesEnvironment9to10.js";

// Your original component imports are preserved
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import ThinkingCloud from "@/components/icon/ThinkingCloud";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";

// =============================================================================
// Gemini API and Session Storage Setup
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'infrastructureShowdownState'; // Unique key for this game

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
            <p className="text-black text-sm font-bold my-2 uppercase text-center">Total Accuracy</p>
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

function ReviewScreen({ answers, onBackToResults }) {
  return (
    <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center inter-font">
      <style>{scrollbarHideStyle}</style>
      <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 shrink-0">Review Your Answers</h1>
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grow overflow-y-auto p-2 no-scrollbar">
        {answers.map((ans, idx) => {
            const isCorrect = ans.scoreAwarded === 3;
            return (
             <div key={idx} className={`p-4 rounded-xl flex flex-col ${isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
               <p className="text-gray-300 text-base mb-2 font-bold">{ans.scenario}</p>
               <div className="text-sm space-y-1">
                 <p className="font-semibold">Your Answer:</p>
                 <p className={`${isCorrect ? 'text-white' : 'text-red-300'}`}>
                   {ans.selectedOption.text}
                 </p>
                 {!isCorrect && (
                   <>
                     <p className="font-semibold pt-2">Correct Answer:</p>
                     <p className="text-green-300">{ans.correctAnswerText}</p>
                   </>
                 )}
               </div>
             </div>
            );
        })}
      </div>
      <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors shrink-0 border-b-4 border-yellow-800 active:border-transparentshadow-lg">
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


// YOUR ORIGINAL CHILD COMPONENTS - UNCHANGED
function OptionCard({ option, isSelected, onClick, isDisabled }) {
  const cardClasses = `flex items-center justify-center inter-font
    w-full min-h-[60px] px-4 py-3 rounded-xl shadow-md transition-all duration-200 ease-in-out cursor-pointer text-center
    lg:min-h-[7vh] lg:px-[2vw] lg:py-[1.5vh] lg:rounded-[1.2vh] lg:shadow-[0_2px_0_0_#37464f]
    ${
      isSelected
        ? "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428] lg:border-[0.2vh]"
        : "bg-[#131f24] border-2 border-[#37464f] lg:border-[0.2vh]"
    } ${
    isDisabled && !isSelected
      ? "opacity-50 cursor-not-allowed"
      : "hover:scale-102"
  }`;
  
  const textClasses = `font-medium 
    text-base leading-normal 
    lg:text-[1.1vw] lg:leading-[3vh] 
    ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <span className={textClasses}>{option.text}</span>
    </div>
  );
}

function FeedbackCharacter({ message }) {
  return (
    <div className="flex items-end justify-center">
      <img
        src="/feedbackcharacter.gif"
        alt="Character talking"
        className="w-[4rem] md:w-[5rem] h-auto object-contain shrink-0"
      />
      <div className="relative  md:ml-[1rem] md:mb-[2rem]">
        <ThinkingCloud className="w-[180px] md:w-[320px] lg:w-[300px]" />
        <p 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] pl-4
                       text-[9px] md:text-sm leading-tight text-white text-center inter-font font-medium"
        >
          {message}
        </p>
      </div>
    </div>
  );
}

// YOUR ORIGINAL GAME DATA - UNCHANGED
const questions = [
  { "id": 1, "question": "Which infrastructure project contributes more to long-term sustainability?", "scenario": "A city wants to beautify its downtown area. They're considering two options:", "options": [ "Building decorative fountains in the plaza", "Installing vertical gardens on building walls" ], "correct": "Installing vertical gardens on building walls", "explanation": "Vertical gardens improve air quality, provide insulation, and create habitats for wildlife!" },
  { "id": 2, "question": "Which option creates a more sustainable urban environment?", "scenario": "The city council is planning street improvements. They need to choose between:", "options": [ "Planting trees along all major streets", "Installing bright LED billboards for advertising" ], "correct": "Planting trees along all major streets", "explanation": "Tree-lined streets clean the air, provide shade, reduce heat, and create a healthier environment!" },
  { "id": 3, "question": "Which transportation infrastructure is better for sustainability?", "scenario": "Traffic is increasing in the city. The mayor must decide between:", "options": [ "Building dedicated bike lanes throughout the city", "Making roads wider to accommodate more cars" ], "correct": "Building dedicated bike lanes throughout the city", "explanation": "Bike lanes reduce pollution, promote health, and create safer streets for everyone!" },
  { "id": 4, "question": "Which water management system is more sustainable?", "scenario": "The city needs to improve its water infrastructure. They're debating between:", "options": [ "Building new decorative swimming pools in parks", "Installing water reuse and recycling systems" ], "correct": "Installing water reuse and recycling systems", "explanation": "Water reuse systems conserve precious water resources and reduce waste!" },
  { "id": 5, "question": "Which energy infrastructure choice is more sustainable?", "scenario": "New buildings are being constructed. The architect must choose between:", "options": [ "Designing tall glass skyscrapers with lots of windows", "Installing solar panels on all rooftops" ], "correct": "Installing solar panels on all rooftops", "explanation": "Solar rooftops generate clean, renewable energy and reduce dependence on fossil fuels!" },
];
const dilemmas = questions.map((q) => ({
  id: q.id,
  question: q.question,
  scenario: q.scenario,
  options: q.options.map((optText) => ({
    text: optText,
    score: optText === q.correct ? 3 : 0,
    consequence: q.explanation,
  })),
}));

export default function InfrastructureShowdown() {
  const navigate = useNavigate();
  
  // YOUR ORIGINAL useState LOGIC IS PRESERVED
  const [step, setStep] = useState("intro");
  const [introStep, setIntroStep] = useState("first");
  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [dilemmaResults, setDilemmaResults] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false); // --- NEW STATE FOR POPUP ---
  
  // NEW STATES FOR AI FEATURES
  const [insight, setInsight] = useState("");
  const [recommendedSectionId, setRecommendedSectionId] = useState(null);
  const [recommendedSectionTitle, setRecommendedSectionTitle] = useState("");

  const currentDilemma = useMemo(() => dilemmas[currentDilemmaIndex], [currentDilemmaIndex]);
  
  // NEW: useEffect for restoring state from sessionStorage
  useEffect(() => {
    const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setStep(savedState.step);
        setIntroStep(savedState.introStep);
        setCurrentDilemmaIndex(savedState.currentDilemmaIndex);
        setSelectedOption(savedState.selectedOption);
        setTotalScore(savedState.totalScore);
        setShowFeedback(savedState.showFeedback);
        setFeedbackMessage(savedState.feedbackMessage);
        setDilemmaResults(savedState.dilemmaResults);
        setInsight(savedState.insight);
        setRecommendedSectionId(savedState.recommendedSectionId);
        setRecommendedSectionTitle(savedState.recommendedSectionTitle);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);
  
  // MODIFIED: AI useEffect with all features
  useEffect(() => {
    if (step === 'end' && !insight) {
      const generateInsight = async () => {
        setInsight("Fetching personalized insight...");
        const totalPossibleScore = dilemmas.length * 3;
        const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
        const incorrectAnswers = dilemmaResults.filter(res => res.scoreAwarded === 0);

        if (incorrectAnswers.length === 0) {
            setInsight("Perfect score! You're a true urban planner with a vision for green cities!");
            return;
        }

        const noteSectionsForModule = notesEnvironment9to10;
        const prompt = `A student played 'Infrastructure Showdown', choosing sustainable projects. Their incorrect choices are: ${JSON.stringify(incorrectAnswers)}. The available notes are: ${JSON.stringify(noteSectionsForModule)}. TASK: 1. DETECT: Find the most relevant note section for errors related to urban planning, tech, and sustainability (likely Module 4). 2. GENERATE: Write a 25-35 word insight recommending that section by title. OUTPUT: JSON with "detectedTopicId" and "insight".`;

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
            setInsight("Great choices! To master urban planning, review 'Module 4: Cities and Tech'.");
            setRecommendedSectionId('m-4');
            setRecommendedSectionTitle("Module 4: Cities and Tech");
        }
      };
      generateInsight();
    }
  }, [step, totalScore, dilemmaResults, insight]);

  // UNCHANGED Game Logic Functions
  const handleShowInstructions = () => setIntroStep("instructions");
  const handleNextDilemma = useCallback(() => {
    setShowFeedback(false);
    if (currentDilemmaIndex < dilemmas.length - 1) {
      setCurrentDilemmaIndex((prevIndex) => prevIndex + 1);
      setSelectedOption(null);
      setFeedbackMessage("");
    } else {
      setStep("end");
    }
  }, [currentDilemmaIndex]);
  const handleSubmit = useCallback(() => {
    if (!selectedOption) {
      setFeedbackMessage("Please select an option.");
      setShowFeedback(true);
      return;
    }
    const { score, consequence } = selectedOption;
    setTotalScore((prevScore) => prevScore + score);
    setFeedbackMessage(consequence);
    setShowFeedback(true);
    const correctAnswer = currentDilemma.options.find(opt => opt.score === 3);
    setDilemmaResults((prevResults) => [...prevResults, {
      scenario: currentDilemma.question,
      selectedOption: selectedOption,
      scoreAwarded: score,
      correctAnswerText: correctAnswer ? correctAnswer.text : "N/A",
    }]);
  }, [selectedOption, currentDilemma]);
  const startGame = () => {
    setStep("playing");
    setIntroStep("first");
    setCurrentDilemmaIndex(0);
    setSelectedOption(null);
    setTotalScore(0);
    setDilemmaResults([]);
    setShowFeedback(false);
    setFeedbackMessage("");
    setInsight("");
    setRecommendedSectionId(null);
    setRecommendedSectionTitle("");
  };
  const handleSelectOption = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
  };
  
  // NEW Handlers for State Management and Navigation
  const handleNavigateToSection = () => {
    if (recommendedSectionId) {
        const stateToSave = { step, introStep, currentDilemmaIndex, selectedOption, totalScore, showFeedback, feedbackMessage, dilemmaResults, insight, recommendedSectionId, recommendedSectionTitle };
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

  const handleGoToGames = () => {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      navigate("/environmental/games");
      setPopupVisible(false);
  };

  const handleClosePopup = () => {
      setPopupVisible(false);
  };
  // --- END MODIFIED & NEW HANDLERS ---

  const handleReviewAnswers = () => setStep("review");
  const handleBackToResults = () => setStep("end");

  const buttonText = showFeedback ? "Continue" : "Check Now";
  const isButtonEnabled = showFeedback || selectedOption !== null;
  
  const renderContent = () => {
    if (step === "intro") {
      return introStep === "first" 
          ? <IntroScreen onShowInstructions={handleShowInstructions} />
          : <InstructionsScreen onStartGame={startGame} />;
    }
    
    if (step === "playing" && currentDilemma) {
      return (
        <div className="main-container w-full h-screen bg-[#0A160E] relative overflow-hidden flex flex-col justify-between inter-font">
          <GameNav />
          <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
            <div className="flex-grow flex items-center justify-center p-4">
              <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-10">
                <div className="flex flex-col justify-center items-center gap-5 text-center">
                  <h2 className="text-slate-100 text-xl md:text-2xl font-medium leading-snug md:leading-9">
                      {currentDilemma.question}
                  </h2>
                  <p className="text-gray-300 text-sm md:text-base leading-relaxed font-regular">
                      <span className="font-bold">Scenario:</span> {currentDilemma.scenario}
                  </p>
                  <div className="w-full max-w-lg mt-4 flex flex-col justify-start items-stretch gap-4">
                      {currentDilemma.options.map((option, index) => (
                          <OptionCard 
                              key={index} 
                              option={option} 
                              isSelected={selectedOption?.text === option.text} 
                              onClick={() => handleSelectOption(option)} 
                              isDisabled={showFeedback && selectedOption?.text !== option.text}
                          />
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full h-28 md:h-32 flex justify-center items-end shrink-0">
              <div className={`transition-opacity duration-300 ${showFeedback ? 'opacity-100' : 'opacity-0'}`}>
                <FeedbackCharacter message={feedbackMessage} />
              </div>
            </div>
          </div>
          <div className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 z-10 shrink-0">
            <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
              <button className="relative w-full h-full cursor-pointer" onClick={showFeedback ? handleNextDilemma : handleSubmit} disabled={!isButtonEnabled}>
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
    
    if (step === "end") {
      const totalPossibleScore = dilemmas.length * 3;
      const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
      const isVictory = accuracyScore >= 70; // Your original victory condition was 70
      
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
    }

    if (step === "review") {
      return <ReviewScreen answers={dilemmaResults} onBackToResults={handleBackToResults} />;
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