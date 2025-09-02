import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useFinance } from "../../../../../contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import confetti from "canvas-confetti";
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";
import { notesFinance6to8 } from "@/data/notesFinance6to8.js";

function parsePossiblyStringifiedJSON(text) {
  if (typeof text !== "string") return null;

  // Remove triple backticks and optional "json" after them
  text = text.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(json)?/, "")
      .replace(/```$/, "")
      .trim();
  }

  // Remove single backticks
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

const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'overspendTrapGameState';


export default function OverspendTrap() {
  const { completeFinanceChallenge } = useFinance();
  const [selectedOption, setSelectedOption] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const feedbackRef = useRef(null);
  const [parsedWinner, setParsedWinner] = useState(null); // <--- add this here
  const [showGif, setShowGif] = useState(false); // <-- Added

  //for Performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [firstSelectionMade, setFirstSelectionMade] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate(); // ensure `useNavigate()` is defined
  const [step, setStep] = useState("play"); // "play" | "result"
  const [showInstructions, setShowInstructions] = useState(true);
  const [aiInsight, setAiInsight] = useState({
    tip: "",
    recommendedSectionId: null,
    recommendedSectionTitle: ""
  });

    useEffect(() => {
    const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedStateJSON) {
      try {
        const savedState = JSON.parse(savedStateJSON);

        // Restore the state from the saved data
        setStep("result");
        setParsedWinner(savedState.isWinner);
        setFeedback(savedState.aiInsight.tip);
        setAiInsight(savedState.aiInsight);

        // Make sure to skip the intro screens when restoring state
        setShowIntro(false);
        setShowInstructions(false);

        // Clean up sessionStorage to prevent re-loading this state on a full refresh
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (error) {
        console.error("Failed to parse saved game state:", error);
        sessionStorage.removeItem(SESSION_STORAGE_KEY); // Clean up corrupted data
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (feedback) {
      setTimeout(() => {
        if (feedbackRef.current) {
          feedbackRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [feedback]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const problem =
    "Your friend just spent ₹1,200 on concert tickets and now can not pay for school trip fees. What would you do?";

  const options = [
    "Lend them money",
    "Suggest selling something",
    "Help them budget next month",
    "Tell them to skip the trip",
  ];

  const prompt =  `
You are an expert AI tutor for a student in grades 6-8 who has answered a question about helping a friend who overspent.

### CONTEXT ###
1.  **The Scenario:** A friend spent ₹1,200 on concert tickets and now cannot pay for a school trip.
2.  **Student's Chosen Solution:** "${selectedOption}"
3.  **All Available Note Sections for this Finance Module:**
    ${JSON.stringify(notesFinance6to8, null, 2)}

### YOUR TASK ###
1.  **EVALUATE:** Assess the student's choice. A good choice promotes long-term financial health (e.g., budgeting), while a poor one enables bad habits (e.g., lending money without a plan).
2.  **DETECT:** Based on the scenario (impulsive spending) and the student's choice, identify the ONE note section from the provided list that is the best match for review. For example, if the choice is poor, 'Impulse Buying' or 'Budgeting 101' would be excellent recommendations.
3.  **GENERATE RESPONSE:** Create a response in the specified JSON format.

### RULES & OUTPUT FORMAT ###
- The 'feedback' should be short (max 80 words), encouraging, and address the student directly.
- If the choice is responsible and forward-thinking, set "isWinner" to true. Otherwise, set it to false.
- Return ONLY a raw JSON object. Do not add markdown backticks.

{
  "feedback": "Your personalized and encouraging feedback message here.",
  "isWinner": false,
  "detectedTopicId": "The 'topicId' of the most relevant note section you identified (e.g., '2', '6', etc.)"
}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APIKEY}`,
        {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }
      );

      const aiReply = response.data.candidates[0].content.parts[0].text;
      console.log("Raw AI reply:", aiReply);

      const parsed = parsePossiblyStringifiedJSON(aiReply);
      if (!parsed || typeof parsed.isWinner === "undefined") {
        setError("AI response could not be understood.");
        return;
      }

      console.log("Parsed AI JSON:", parsed);
      const recommendedNote = notesFinance6to8.find(note => note.topicId === parsed.detectedTopicId);

      setAiInsight({
        tip: parsed.feedback,
        recommendedSectionId: parsed.detectedTopicId,
        recommendedSectionTitle: recommendedNote ? recommendedNote.title : ""
      });
      setFeedback(parsed.feedback);
      setParsedWinner(parsed.isWinner);

      const totalTime = (Date.now() - startTime) / 1000;
      const studyTimeMinutes = Math.ceil(totalTime / 60);

      if (parsed.isWinner) {
        // ✅ Player Wins
        updatePerformance({
          moduleName: "Finance",
          topicName: "budgetExpert",
          score: 10,
          accuracy: 100,
          avgResponseTimeSec: totalTime,
          studyTimeMinutes,
          completed: true,
        });

        // 🎉 Trigger Confetti
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        // ❌ Player Loses
        updatePerformance({
          moduleName: "Finance",
          topicName: "budgetExpert",
          score: 0,
          accuracy: 0,
          avgResponseTimeSec: totalTime,
          studyTimeMinutes,
          completed: false,
        });
      }
      setStep("result");

      setStartTime(Date.now());
      completeFinanceChallenge(0, 2);
    } catch (e) {
      console.error("Error generating feedback", e);
      setError("Error generating feedback. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // View Feedback Handler
  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/budget-activity"); // ensure `useNavigate()` is defined
  };
  const handleNavigateToSection = () => {
    if (aiInsight.recommendedSectionId) {
        const stateToSave = {
            isWinner: parsedWinner,
            aiInsight: aiInsight,
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));
        navigate(`/finance/notes?grade=6-8&section=${aiInsight.recommendedSectionId}`);
    }
  };

  return (
    <>
      <GameNav />
      <div className="pt-20 pb-32 md:pt-50 flex flex-col md:flex-row items-center justify-center min-h-screen bg-[#0A160E] p-6 md:space-x-10 space-y-10 md:space-y-0">
        {step === "play" && (
          <>
            {/* Right: Overspend Trap Card */}
            <div className="max-w-xl bg-[#202F364D] w-full p-6 shadow-2xl rounded-3xl">
              <h2 className="text-3xl font-extrabold lilita-one-regular mb-6 text-white font-sans text-center">
                🎯 Overspend Trap
              </h2>
              <p className="mb-6 lilita-one-regular text-lg text-white font-medium text-center">
                {problem}
              </p>

              <div className="space-y-4">
                {options.map((option, index) => (
                  <motion.label
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={index}
                    className={`block lilita-one-regular p-4 rounded-2xl border-2 text-lg font-semibold transition-all duration-200 shadow-md ${
                      selectedOption === option
                        ? "bg-[#172b33] border-green-500 text-white"
                        : "bg-[#131F24] border-gray-300 text-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision"
                      value={option}
                      checked={selectedOption === option}
                      onChange={() => {
                        setSelectedOption(option);
                        if (!firstSelectionMade) {
                          setFirstSelectionMade(true);
                          setShowGif(true);
                          setTimeout(() => setShowGif(false), 2000);
                        }
                      }}
                      className="mr-3 accent-[#131F24] scale-125"
                    />
                    {option}
                  </motion.label>
                ))}
              </div>

              {/* Footer */}
              <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
                {/* Kid Celebration Gif + Speech Bubble */}
                {showGif && (
                  <div
                    className="
              absolute
              -top-24 sm:-top-30
              transform -translate-x-1/2
              z-50 flex items-start
            "
                    style={{ left: "85%" }}
                  >
                    <img
                      src="/financeGames6to8/kid-gif.gif"
                      alt="Kid Celebration"
                      className="object-contain"
                      style={{
                        maxHeight: "120px",
                        height: "auto",
                        width: "auto",
                      }}
                    />
                    <img
                      src="/financeGames6to8/kid-saying.svg"
                      alt="Kid Saying"
                      className="absolute top-2 left-[90px] w-24 hidden md:block"
                    />
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center justify-center my-2">
                    <div className="w-12 h-12 border-4 border-t-pink-500 border-yellow-300 rounded-full animate-spin"></div>
                    <p className="mt-2 text-gray-200 lilita-one-regular text-lg font-semibold">
                      Thinking...
                    </p>
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!selectedOption}
                    className={`${
                      !selectedOption ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <img
                      src="/financeGames6to8/check-now-btn.svg"
                      alt="Check Now"
                      className="h-12 sm:h-16 w-auto"
                    />
                  </motion.button>
                )}
              </div>
            </div>
          </>
        )}

        {/* WIN/LOSE VIEW */}
        {step === "result" &&
          (parsedWinner ? (
            // WIN VIEW
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              {/* Center Content */}
              <div className="flex flex-col items-center justify-center flex-1 p-6">
                {/* Trophy GIFs */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <img
                    src="/financeGames6to8/trophy-rotating.gif"
                    alt="Rotating Trophy"
                    className="absolute w-full h-full object-contain"
                  />
                  <img
                    src="/financeGames6to8/trophy-celebration.gif"
                    alt="Celebration Effects"
                    className="absolute w-full h-full object-contain"
                  />
                </div>

                {/* Challenge Complete Text */}
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                  Challenge Complete!
                </h2>

                {/* Insight Box */}
                <div className="mt-6 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-74">
                  <p className="text-black text-sm font-extrabold mb-1 mt-2">
                    INSIGHT
                  </p>
                  <div className="bg-[#131F24] w-73 rounded-xl flex items-center justify-center px-4 py-1 text-center">
                    <span
                      className="text-[#FFCC00] font-bold leading-tight"
                      style={{
                        fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
                        lineHeight: "1.1",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      {feedback || "Analyzing your results..."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/feedback.svg"
                  alt="Feedback"
                  onClick={handleViewFeedback}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/next-challenge.svg"
                  alt="Next Challenge"
                  onClick={handleNextChallenge}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
          ) : (
            // LOSE VIEW
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              {/* Game Over */}
              <div className="flex flex-col items-center justify-center flex-1 p-4">
                <img
                  src="/financeGames6to8/game-over-game.gif"
                  alt="Game Over"
                  className="w-48 sm:w-64 h-auto mb-4"
                />
                <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                  Oops! That was close! Wanna Retry?
                </p>

                {/* What Went Wrong Box */}
                {aiInsight.tip && (
              <div className="mt-6 flex flex-col gap-4 w-full max-w-md">
                <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                  <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                  <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center px-4 text-center">
                    <span className="text-[#FFCC00] text-sm">{aiInsight.tip}</span>
                  </div>
                </div>
                {aiInsight.recommendedSectionTitle && (
                  <button
                    onClick={handleNavigateToSection}
                    className="bg-[#068F36] text-white rounded-lg py-3 px-6 text-sm md:text-base hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg"
                  >
                    Review "{aiInsight.recommendedSectionTitle}" Notes
                  </button>
                )}
              </div>
            )}
              </div>

              {/* Footer */}
              <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/feedback.svg"
                  alt="Feedback"
                  onClick={handleViewFeedback}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={() => setStep("play")}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/next-challenge.svg"
                  alt="Next Challenge"
                  onClick={handleNextChallenge}
                  className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
          ))}
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
}
