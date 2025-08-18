import React, { useState, useEffect, useMemo, useCallback } from "react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import ThinkingCloud from "@/components/icon/ThinkingCloud";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // 1. ADDED AXIOS IMPORT

// Placeholder for context functions
const useEnvirnoment = () => ({
  completeEnvirnomentChallenge: (challengeId, taskId) => {
    console.log(
      `(Mock) Environment Challenge ${challengeId}, Task ${taskId} completed!`
    );
  },
});

const usePerformance = () => ({
  updateEnvirnomentPerformance: (data) => {
    console.log("(Mock) Performance updated:", data);
  },
});

// =============================================================================
// Gemini API Integration Helpers (Added from previous requests)
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;

function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) {
        text = text
            .replace(/^```(json)?/, "")
            .replace(/```$/, "")
            .trim();
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
// Game Data (Dilemma-Based)
// =============================================================================
const dilemmas = [
  {
    id: 1,
    scenario: "Your school is planning to cut down 5 trees to expand parking for teachers’ cars.",
    options: [
      { text: "Protest with a placard and ask for a meeting with the principal", score: 2, consequence: "Good job! While protesting raises awareness, proposing a concrete solution is even more powerful." },
      { text: "Say nothing — not your problem", score: 0, consequence: "Choosing to be passive allows environmental damage to happen. Every voice matters in protecting our planet." },
      { text: "Suggest vertical parking or carpooling and saving the trees", score: 3, consequence: "Excellent! You proposed an innovative, eco-friendly solution that solves the problem without harming nature." },
    ],
  },
  {
    id: 2,
    scenario: "Your school canteen only uses plastic plates, cups, and spoons every day.",
    options: [
      { text: "Bring your own steel tiffin and ask friends to do the same", score: 3, consequence: "Perfect! By setting a personal example, you start a powerful student-led movement for change." },
      { text: "Complain to the principal about health hazards of plastic", score: 2, consequence: "Raising the issue is a good step, but suggesting a practical alternative would be even more effective." },
      { text: "Ignore — it’s convenient and fast", score: 0, consequence: "Convenience shouldn't come at the cost of our planet's health. This choice adds to the plastic pollution problem." },
    ],
  },
  {
    id: 3,
    scenario: "Students keep the classroom AC on even when windows are open.",
    options: [
      { text: "Close the windows every time and remind others", score: 2, consequence: "This is a responsible action! You're actively stopping energy waste in the moment." },
      { text: "Enjoy the cool — it’s not your electricity bill", score: 0, consequence: "This mindset wastes valuable resources. Collective responsibility is key to energy conservation." },
      { text: "Talk to the class teacher about putting up an energy-saving rule", score: 3, consequence: "Great initiative! Creating a system-level change has a long-lasting impact beyond just one classroom." },
    ],
  },
  {
    id: 4,
    scenario: "Your school is organizing a big celebration. Everything is plastic — balloons, flex banners, decorations.",
    options: [
      { text: "Offer to make eco-friendly décor from paper and cloth with your class", score: 3, consequence: "Fantastic! You've turned a wasteful event into a creative, sustainable, and memorable one." },
      { text: "Ask the principal to cancel the event", score: 1, consequence: "While your intention is good, cancelling isn't always the answer. Finding a green alternative is a better approach." },
      { text: "Just enjoy — it’s once a year", score: 0, consequence: "This 'once a year' mindset, when adopted by many, leads to massive amounts of holiday waste." },
    ],
  },
  {
    id: 5,
    scenario: "The school throws away fruit peels and leftover food into regular dustbins.",
    options: [
      { text: "Propose a compost bin and volunteer to maintain it", score: 3, consequence: "Amazing! You're turning waste into a valuable resource that can nourish the school garden." },
      { text: "Write an anonymous note to the teacher", score: 1, consequence: "While it raises awareness, taking ownership of the idea is much more likely to lead to real action." },
      { text: "Pretend not to notice", score: 0, consequence: "Ignoring the problem of food waste contributes to landfill build-up and the release of harmful greenhouse gases." },
    ],
  },
];


// =============================================================================
// Components (Nested within the main file, unchanged)
// =============================================================================

function OptionCard({ option, isSelected, onClick, isDisabled }) {
  const cardClasses = `flex items-center justify-center w-[26vw] min-h-[9vh] px-[2vw] py-[1.5vh] rounded-[1.2vh] shadow-[0_2px_0_0_#37464f] transition-all duration-200 ease-in-out cursor-pointer text-center ${isSelected ? "bg-[#202f36] border-[0.2vh] border-[#5f8428] shadow-[0_2px_0_0_#5f8428]" : "bg-[#131f24] border-[0.2vh] border-[#37464f]"} ${isDisabled && !isSelected ? "opacity-50 cursor-not-allowed" : "hover:scale-102"}`;
  const textClasses = `font-['Inter'] text-[1.1vw] font-medium leading-[3vh] ${isSelected ? "text-[#79b933]" : "text-[#f1f7fb]"}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <span className={textClasses}>{option.text}</span>
    </div>
  );
}

function FeedbackCharacter({ message }) {
  return (
    <div className="absolute -right-[5vw] top-[46vh] flex items-end">
      <img src="/feedbackcharacter.gif" alt="Character talking" className="w-[10vw] h-[15vh] object-contain" />
      <div className="absolute left-[7.5vw] bottom-[5vh]"><ThinkingCloud width="18vw"/></div>
      <p className="absolute bottom-[9vh] left-[9.2vw] w-[16vw] text-[0.68vw] text-white text-center font-['Comic_Neue'] ">{message}</p>
    </div>
  );
}

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
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
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center px-4 text-center">
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

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p>
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center mb-6">Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] lilita-one-regular text-xs font-normal">{insight}</span>
                        </div>
                    </div>
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
                        <p className="text-gray-300 text-base mb-2 font-bold">{ans.scenario}</p>
                        <div className="text-sm space-y-1">
                            <p className="font-semibold">Your Answer:</p>
                            <p className={`font-mono ${ans.isCorrect ? 'text-white' : 'text-red-300'}`}>
                                {ans.selectedOption.text || "Not Answered"}
                            </p>
                            {!ans.isCorrect && (
                                <>
                                    <p className="font-semibold pt-2">Consequence:</p>
                                    <p className="font-mono text-green-300">{ans.scenario}</p>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBackToResults}
                className="
                    mt-6 px-8 py-3 
                    bg-yellow-600 
                    text-lg text-white
                    lilita-one-regular
                    rounded-md
                    hover:bg-yellow-700 
                    transition-colors 
                    flex-shrink-0
                    border-b-4 border-yellow-800 active:border-b-0
                    shadow-lg
                "
            >
                Back to Results
            </button>
        </div>
    );
}


// =============================================================================
// Main Game Component: DilemmaCardsGame
// =============================================================================

export default function DilemmaCardsGame() {
  const { completeEnvirnomentChallenge } = useEnvirnoment();
  const { updateEnvirnomentPerformance } = usePerformance();
  const navigate = useNavigate();

  const [step, setStep] = useState("intro");
  const [introStep, setIntroStep] = useState("first");
  const [currentDilemmaIndex, setCurrentDilemmaIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [dilemmaResults, setDilemmaResults] = useState([]);
  const [insight, setInsight] = useState(""); // 2. ADDED INSIGHT STATE

  const currentDilemma = useMemo(() => dilemmas[currentDilemmaIndex], [currentDilemmaIndex]);

  // 3. ADDED USEEFFECT FOR GEMINI API CALL
  useEffect(() => {
      if (step === 'end') {
          const generateInsight = async () => {
              setInsight("Fetching personalized insight...");
              const totalPossibleScore = dilemmas.length * 3;
              const accuracyScore = Math.round((totalScore / totalPossibleScore) * 100);

              const answersSummary = dilemmaResults.map(res =>
                  `- For the dilemma "${res.scenario}", the user chose "${res.selectedOption.text}", which awarded ${res.scoreAwarded} out of 3 points.`
              ).join('\n');

              const prompt = `
A student played a decision-making game about environmental dilemmas. They chose from options with different scores (0 for passive, 1-2 for good, 3 for excellent/proactive solutions). Here is their performance:

Overall Score: ${totalScore} out of ${totalPossibleScore} (${accuracyScore}%)

Their Choices:
${answersSummary}

### INSTRUCTION ###
Based on their choices, provide a short, holistic, and encouraging insight (20-30 words) on their environmental decision-making skills. Analyze if they tend to be passive, reactive, or proactive.
If they achieved a perfect score, praise them as a master. 
If they did well (>80%), praise their solid understanding and tell where they can improve to reach mastery.
If they struggled, see where they went wrong and provide them with some actionable feedback like what should they do or which concepts they should review or focus on or a technique that might help them improve. 
basically give an actionable insight that they can use to improve their understanding of topics where they lag by analyzing them.

Return ONLY a raw JSON object in the following format (no backticks, no markdown):
{
  "insight": "Your insightful and encouraging feedback here."
}`;

              try {
                  const response = await axios.post(
                      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`,
                      { contents: [{ parts: [{ text: prompt }] }] }
                  );
                  const aiReply = response.data.candidates[0].content.parts[0].text;
                  const parsed = parsePossiblyStringifiedJSON(aiReply);
                  if (parsed && parsed.insight) {
                      setInsight(parsed.insight);
                  } else {
                      throw new Error("Failed to parse insight from AI response.");
                  }
              } catch (err) {
                  console.error("Error fetching AI insight:", err);
                  // Fallback to original hardcoded insights
                  let fallbackInsight = "";
                  if (accuracyScore === 100) {
                      fallbackInsight = "Fantastic! You're an expert at finding creative, eco-friendly solutions. Your proactive approach makes you a true leader in sustainability.";
                  } else if (totalScore >= 9) {
                      fallbackInsight = "Great work! You have a strong sense of responsibility. To improve, try focusing more on proactive solutions instead of just identifying problems.";
                  } else {
                      fallbackInsight = "A good start! Some of your choices were passive. Remember that even small, proactive steps can make a big difference. Review your answers to learn more.";
                  }
                  setInsight(fallbackInsight);
              }
          };
          generateInsight();
      }
  }, [step, totalScore, dilemmaResults]);

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

    setDilemmaResults((prevResults) => [...prevResults, {
      scenario: currentDilemma.scenario,
      selectedOption: selectedOption,
      scoreAwarded: score,
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
  };

  const handleSelectOption = (option) => {
    if (showFeedback) return;
    setSelectedOption(option);
    setShowFeedback(false);
  };
  
  const handlePlayAgain = () => startGame();
  const handleReviewAnswers = () => setStep("review");
  const handleBackToResults = () => setStep("end");
  const handleContinue = () => navigate("/environmental/games");

  const buttonText = showFeedback ? "Continue" : "Check Now";
  const isButtonEnabled = showFeedback || selectedOption !== null;

  return (
    <div>
      {step === "intro" && introStep === "first" && (<IntroScreen onShowInstructions={handleShowInstructions} />)}
      {step === "intro" && introStep === "instructions" && (<InstructionsScreen onStartGame={startGame} />)}
      {step !== "intro" && (
        <div className="main-container w-full h-[100vh] bg-[#0A160E] relative overflow-hidden flex flex-col justify-between">
          {step === "playing" && currentDilemma && (
            <>
              <GameNav />

              <div className="flex flex-1 items-center justify-center w-full px-[5vw] py-[2vh] gap-[2vw]">
                {/* Options on the left */}
                <div className="flex flex-col py-[4.6vh] w-auto h-auto px-[2.4vh] bg-[rgba(32,47,54,0.3)] rounded-[1.2vh] gap-[2.8vh]">
                  {currentDilemma.options.map((option) => (
                    <OptionCard
                      key={option.text}
                      option={option}
                      isSelected={selectedOption?.text === option.text}
                      onClick={() => handleSelectOption(option)}
                      isDisabled={showFeedback && selectedOption?.text !== option.text}
                    />
                  ))}
                </div>

                {/* Scenario on the right */}
                <div className="relative flex flex-col w-[28vw] h-[42vh] p-[2vh] bg-[rgba(32,47,54,0.3)] rounded-[1.2vh] justify-center items-center text-white">
                  <span className="font-['Inter'] text-[1.1vw] font-medium leading-[4vh] text-center max-w-[30vw]">
                    {currentDilemma.scenario}
                  </span>
                  {showFeedback && <FeedbackCharacter message={feedbackMessage} />}
                </div>
              </div>
              
              {/* Bottom Bar */}
              <div className="w-full h-[10vh] bg-[#28343A] flex justify-evenly items-center px-[5vw] z-10">
                <div className="w-[15vw] h-[8vh]">
                  <button className="relative w-full h-full cursor-pointer" onClick={showFeedback ? handleNextDilemma : handleSubmit} disabled={!isButtonEnabled}>
                    <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                    <span className={`absolute text-nowrap top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita text-[2.8vh] text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled && "opacity-50"}`}>{buttonText}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 4. UPDATED RENDER LOGIC FOR 'END' STATE */}
          {step === "end" && (() => {
            const totalPossibleScore = dilemmas.length * 3;
            const accuracyScore = Math.round((totalScore / totalPossibleScore) * 100);
            // In this game logic, "victory" is not just 100%, but a high score. Let's set a threshold, e.g., 75%
            const isVictory = accuracyScore >= 75;

            // The hardcoded 'insightText' is removed. We now use the 'insight' state variable from the useEffect hook.
            if (isVictory) {
                return (
                    <VictoryScreen
                        accuracyScore={accuracyScore}
                        insight={insight}
                        onViewFeedback={handleReviewAnswers}
                        onContinue={handleContinue}
                    />
                );
            } else {
                return (
                    <LosingScreen
                        accuracyScore={accuracyScore}
                        insight={insight}
                        onPlayAgain={handlePlayAgain}
                        onViewFeedback={handleReviewAnswers}
                        onContinue={handleContinue}
                    />
                );
            }
          })()}

          {step === "review" && (
            <ReviewScreen answers={dilemmaResults} onBackToResults={handleBackToResults} />
          )}
        </div>
      )}
    </div>
  );
}