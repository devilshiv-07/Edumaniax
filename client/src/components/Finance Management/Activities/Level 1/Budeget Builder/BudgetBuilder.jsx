import { useEffect, useState } from "react";
import {
  FaShoePrints,
  FaIceCream,
  FaGift,
  FaMobileAlt,
  FaUserFriends,
  FaFilm,
  FaHamburger,
  FaBook,
  FaWallet,
} from "react-icons/fa";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import { motion } from "framer-motion";
import { useFinance } from "../../../../../contexts/FinanceContext.jsx";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen.jsx";
import GameNav from "./GameNav.jsx";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay.jsx";
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
const SESSION_STORAGE_KEY = 'budgetBuilderGameState';

const BudgetBuilder = () => {
  const { completeFinanceChallenge } = useFinance();

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);

  const initialExpenses = [
    {
      id: "1",
      label: "Save for Shoes",
      cost: 350,
      imgSrc: "/financeGames6to8/level-1/shoes.svg",
      priorityScore: 4,
    },
    {
      id: "2",
      label: "Ice Cream Treat",
      cost: 150,
      imgSrc: "/financeGames6to8/level-1/ice-cream.svg",
      priorityScore: 2,
    },
    {
      id: "3",
      label: "Gift",
      cost: 150,
      imgSrc: "/financeGames6to8/level-1/gift.svg",
      priorityScore: 4,
    },
    {
      id: "4",
      label: "Data Plan",
      cost: 210,
      imgSrc: "/financeGames6to8/level-1/data-plan.svg",
      priorityScore: 4,
    },
    {
      id: "5",
      label: "Lend to a Friend",
      cost: 50,
      imgSrc: "/financeGames6to8/level-1/lend-to-a-friend.svg",
      priorityScore: 3,
    },
    {
      id: "6",
      label: "Weekend Movie",
      cost: 50,
      imgSrc: "/financeGames6to8/level-1/weekend-movie.svg",
      priorityScore: 2,
    },
    {
      id: "7",
      label: "Lunch",
      cost: 50,
      imgSrc: "/financeGames6to8/level-1/lunch.svg",
      priorityScore: 3,
    },
    {
      id: "8",
      label: "Books",
      cost: 50,
      imgSrc: "/financeGames6to8/level-1/books.svg",
      priorityScore: 5,
    },
  ];

  function getSavingsScore(percentageSpent) {
    let savingsScore;

    if (percentageSpent > 90 && percentageSpent <= 100) {
      savingsScore = 1;
    } else if (percentageSpent > 60 && percentageSpent <= 80) {
      savingsScore = 4;
    } else if (percentageSpent >= 50 && percentageSpent <= 60) {
      savingsScore = 7;
    } else if (percentageSpent < 50) {
      savingsScore = 10;
    } else {
      savingsScore = 2; // fallback if needed, e.g. for 81–90%
    }

    return savingsScore;
  }

  const [wallet, setWallet] = useState(1000);
  const [available, setAvailable] = useState(initialExpenses);
  const [spent, setSpent] = useState([]);
  const [feedbackAvatarType, setFeedbackAvatarType] = useState("disappointing");
  const [showFeedback, setShowFeedback] = useState(false);
  const [showVictoryScreen, setShowVictoryScreen] = useState(false);
  const navigate = useNavigate(); // ensure `useNavigate()` is defined
  const [heartCount, setHeartCount] = useState(4);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        // Restore the critical parts of the state
        setShowIntro(false); 
        setIsGameOver(true);
        setAiInsight(savedState.aiInsight);
        setResult(savedState.result);
        setShowVictoryScreen(savedState.showVictoryScreen);
        
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (heartCount === 0) {
      setIsGameOver(true);
    }
  }, [heartCount]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    // Ignore same list movement
    if (source.droppableId === destination.droppableId) return;

    let movedItem;

    // FROM AVAILABLE TO SPENT
    if (
      source.droppableId === "available" &&
      destination.droppableId === "spent"
    ) {
      movedItem = available[source.index];

      if (wallet < movedItem.cost) {
        toast.error("💸 Not enough money in wallet!");
        return;
      }

      const newAvailable = [...available];
      newAvailable.splice(source.index, 1);

      const newSpent = [...spent];
      newSpent.splice(destination.index, 0, movedItem);

      const newWallet = wallet - movedItem.cost;
      setAvailable(newAvailable);
      setSpent(newSpent);
      setWallet(newWallet);

      // 💔 Deduct a life if priorityScore is 3 or below
      if (movedItem.priorityScore <= 3) {
        setHeartCount((prev) => {
          const updated = Math.max(0, prev - 1);
          if (updated === 0) {
            setIsGameOver(true); // Trigger Game Over
          }
          return updated;
        });
      }

      // 🎯 Show gif for 1 sec, only 3 times
      if (gifCount < 3) {
        setShowGif(true);
        setGifCount((prev) => prev + 1);
        setTimeout(() => setShowGif(false), 3000);
      }
    }

    // FROM SPENT TO AVAILABLE
    else if (
      source.droppableId === "spent" &&
      destination.droppableId === "available"
    ) {
      movedItem = spent[source.index];

      const newSpent = [...spent];
      newSpent.splice(source.index, 1);

      const newAvailable = [...available];
      newAvailable.splice(destination.index, 0, movedItem);

      const refund = wallet + movedItem.cost;
      setSpent(newSpent);
      setAvailable(newAvailable);
      setWallet(refund);

      // 🛑 No heartCount logic here as per your current rule
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGif, setShowGif] = useState(false);
  const [result, setResult] = useState(null);
  const [showResultBox, setShowResultBox] = useState(false);
  const [gifCount, setGifCount] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [aiInsight, setAiInsight] = useState({
      tip: "",
      spendingScore: "0/10",
      categoryToCut: "",
      recommendedSectionId: null,
      recommendedSectionTitle: ""
  });

  useEffect(() => {
    if (result) {
      setShowResultBox(true);
      setIsFadingOut(false);

      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 14000); // fade after 20s

      const hideTimer = setTimeout(() => {
        setShowResultBox(false);
      }, 15000); // remove after fade

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [result]);

  useEffect(() => {
    if (parseInt(result?.spendingScore?.split("/")[0]) >= 7) {
      setShowVictoryScreen(true);
    }
  }, [showVictoryScreen, result]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    const cleanExpenses = initialExpenses.map(
      ({ id, label, cost, priorityScore }) => ({
        id,
        label,
        cost,
        priorityScore,
      })
    );

    const cleanSpent = spent.map(({ id, label, cost, priorityScore }) => ({
      id,
      label,
      cost,
      priorityScore,
    }));

    const totalSpent = spent.reduce((acc, item) => acc + item.cost, 0);
    const percentageSpent = Number(((totalSpent / 1000) * 100).toFixed(0));
    const totalPriorityScore = spent.reduce(
      (acc, item) => acc + item.priorityScore * item.cost,
      0
    );

    const priorityScoreRatio = totalPriorityScore / (5 * totalSpent);
    const savingScore = Number(getSavingsScore(percentageSpent));
    const finalScore = Number(
      (7 * priorityScoreRatio + 0.3 * savingScore).toFixed(1)
    );
    console.log(
      cleanSpent,
      percentageSpent,
      totalPriorityScore,
      priorityScoreRatio,
      savingScore,
      finalScore
    );

    const mistakes = spent.filter(item => item.priorityScore <= 3)
                      .map(item => ({ label: item.label, relatedTopics: item.relatedTopics }));

const prompt = `
You are an expert AI tutor for a student in grades 6-8. The student just finished a budgeting game. Your task is to provide targeted feedback.

### CONTEXT ###
1.  **Student's Spending Decisions & Mistakes:**
    The student spent money on these items. Items with a low priority score (3 or less) are considered spending mistakes or "wants" over "needs".
    ${JSON.stringify(mistakes, null, 2)}

2.  **Final Score:** ${finalScore}/10

3.  **All Available Note Sections for this Finance Module:**
    ${JSON.stringify(notesFinance6to8, null, 2)}

### YOUR TASK ###
1.  **DETECT:** Analyze the student's spending mistakes. Based on the "relatedTopics" of their mistakes, find the ONE note section from the provided list that is the best match for review.
2.  **GENERATE FEEDBACK:** Provide feedback based on their score and mistakes.
    - If the score is > 6, the tip should be encouraging.
    - If the score is <= 6, the tip must be critical and suggest what to focus on. The avatarType should be "disappointing".
    - The "categoryToCut" must be one of the spent items with the lowest priority score. If all spending was on high-priority items, set it to "None - you balanced well!".
    - The tip should be a short, encouraging insight (about 25-30 words).

### OUTPUT FORMAT ###
Return ONLY a raw JSON object. Do not add markdown backticks.
{
  "spendingScore": "${finalScore}/10",
  "tip": "Your personalized and encouraging feedback message here.",
  "categoryToCut": "The item with the lowest priority score from what they spent",
  "avatarType": "congratulatory" or "disappointing",
  "detectedTopicId": "The 'topicId' of the most relevant note section you identified (e.g., '2', '6', etc.)"
}`;

    // console.log(finalScore);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }
      );

      const aiReply = response.data.candidates[0].content.parts[0].text;
const parsed = parsePossiblyStringifiedJSON(aiReply);
      
if (parsed) {
    const recommendedNote = notesFinance6to8.find(note => note.topicId === parsed.detectedTopicId);
        
    setAiInsight({
        tip: parsed.tip,
        spendingScore: parsed.spendingScore,
        categoryToCut: parsed.categoryToCut,
        recommendedSectionId: parsed.detectedTopicId,
        recommendedSectionTitle: recommendedNote ? recommendedNote.title : ""
    });

    setResult(parsed); 
    setShowResultBox(true);

    const scoreNumber = parseInt(parsed.spendingScore?.split("/")[0]);
    if (!isNaN(scoreNumber) && scoreNumber >= 7) {
        setShowVictoryScreen(true);
        completeFinanceChallenge(0, 0);
    } else if (heartCount > 0) {
        setIsGameOver(true);
    }

} else {
    throw new Error("Failed to parse AI response");
}

      // ✅ For performance
      const scoreNumber = parseInt(parsed.spendingScore?.split("/")[0]);

      const totalTime = (Date.now() - startTime) / 1000;
      const studyTimeMinutes = Math.ceil(totalTime / 60);

      updatePerformance({
        moduleName: "Finance",
        topicName: "budgetExpert",
        score: scoreNumber, // Already scaled out of 10
        accuracy: scoreNumber * 10,
        avgResponseTimeSec: totalTime,
        studyTimeMinutes,
        completed: true,
      });
      setStartTime(Date.now());
      if (!isNaN(scoreNumber) && scoreNumber >= 8) {
        completeFinanceChallenge(0, 0); // mark completed
      }

      // ✅ Scroll up only for small screens so result is visible
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          document.querySelector("#resultBox")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 300);
      }
    } catch (err) {
      setError("Error fetching AI response");
      console.log(err);
    }
    setLoading(false);
  };

  // View Feedback Handler
  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/pick-a-bank"); // ensure `useNavigate()` is defined
  };

  const handleNavigateToSection = () => {
      if (aiInsight.recommendedSectionId) {
          const stateToSave = {
              isGameOver: true,
              aiInsight: aiInsight,
              result: result,
              showVictoryScreen: showVictoryScreen
          };
          sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(stateToSave));

          navigate(`/finance/notes?grade=6-8&section=${aiInsight.recommendedSectionId}`);
      }
  };

  if (isGameOver && !showVictoryScreen) {
    return (
      <div className="flex flex-col justify-between h-screen bg-[#0A160E] text-center overflow-hidden">
        {/* Game Over Content */}
        <div className="flex flex-col items-center justify-center flex-1 p-4">
          {/* Game Over GIF */}
          <img
            src="/financeGames6to8/game-over-game.gif"
            alt="Game Over"
            className="w-48 sm:w-64 h-auto mb-4"
          />

          {/* Text */}
          <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
            Oops! That was close! Wanna Retry?
          </p>
        
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

        {/* Footer Buttons */}
        <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex flex-wrap justify-center gap-3">
          <img
            src="/financeGames6to8/feedback.svg"
            alt="Feedback"
            onClick={handleViewFeedback}
            className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/retry.svg"
            alt="Retry"
            onClick={() => {
              setWallet(1000);
              setAvailable(initialExpenses);
              setSpent([]);
              setHeartCount(4);
              setIsGameOver(false);
              setShowIntro(false);
            }}
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
    );
  }

  return (
    <>
      <div
        className={`${
          showInstructions ? "brightness-50 transition-all duration-300" : ""
        }`}
      >
        <GameNav heartCount={heartCount} />
      </div>

      <div
        className={`flex flex-col bg-[#0A160E] lg:flex-row justify-center items-start gap-8 lg:gap-6 p-4 sm:p-6 lg:p-8 ${
          showInstructions ? "brightness-50" : ""
        }`}
        style={{ paddingTop: "180px" }} // ✅ Inline style works for quick testing
      >
        {/* Dark Theme Weekly Budget Builder */}
        <div
          className="w-full -mt-22 sm:mt-0 main-content bg-[#0A160E] font-sans"
          style={{
            fontFamily: "'Inter', sans-serif",
            paddingBottom:
              document.body.scrollHeight > window.innerHeight ? "8rem" : "0rem",
          }}
        >
          {!showVictoryScreen && result && showResultBox && (
            <div
              id="resultBox"
              className={`w-full lg:max-w-2xl lg:mt-0 p-6 mx-auto flex items-center justify-center transition-opacity duration-1000 ${
                isFadingOut ? "opacity-0" : "opacity-100"
              }`}
            >
              <div className="bg-[#594500CC] border border-[#FFCC00] p-6 rounded-xl shadow-lg text-center space-y-4">
                <p className="text-lg lilita-one-regular font-semibold text-white">
                  <span role="img" aria-label="target">
                    🎯
                  </span>{" "}
                  <span className="text-outline">
                    Spending Score: {result?.spendingScore}
                  </span>
                </p>

                <p className="text-sm text-gray-300 lilita-one-regular">
                  <span role="img" aria-label="tip">
                    💡
                  </span>{" "}
                  <span className="text-outline">Tip: {result?.tip}</span>
                </p>

                <p className="text-sm text-red-400 lilita-one-regular">
                  <span role="img" aria-label="cut">
                    ✂️
                  </span>{" "}
                  <span className="text-outline">
                    Cut this category: {result?.categoryToCut}
                  </span>
                </p>
              </div>
            </div>
          )}

          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex flex-col lg:flex-row justify-center items-stretch gap-12 lg:gap-16 px-4 lg:px-8">
              {/* Available Expenses Section */}
              <div className="w-full lg:w-auto">
                <h2 className="text-xl font-semibold text-center text-white mb-4">
                  Available Expenses
                </h2>

                <Droppable droppableId="available">
                  {(provided) => (
                    <div
                      className="bg-[#202F364D] p-6 rounded-xl shadow-lg w-full lg:w-96 min-h-[450px] border border-gray-600"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {available.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className={`transition-all duration-200 mb-3 rounded-lg flex justify-between items-center shadow-sm cursor-grab border pr-2
    ${snapshot.isDragging ? "border-[#5F8428]" : "border-gray-600"}
  bg-[#131F24] hover:bg-[#202F36]`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {/* Left: Coin + Cost */}
                              <div
                                className={`flex items-center justify-center gap-1 w-[90px] px-2 py-1 rounded-lg border bg-[#1E2A30] shadow-inner
      ${snapshot.isDragging ? "border-[#5F8428]" : "border-white/20"}`}
                                style={{ margin: "4px" }}
                              >
                                <img
                                  src="/financeGames6to8/coin.svg"
                                  alt="coin"
                                  className="w-5 h-5"
                                />
                                <span className="text-white font-extrabold drop-shadow-sm">
                                  ₹{item.cost}
                                </span>
                              </div>

                              {/* Center: Label */}
                              <div className="text-white font-medium text-sm text-center flex-1">
                                {item.label}
                              </div>

                              {/* Right: Icon Image */}
                              <img
                                src={item.imgSrc}
                                alt={item.label}
                                className="w-6 h-6 flex-shrink-0"
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Spent Expenses */}
              <div className="w-full lg:w-96">
                <h2 className="text-xl font-semibold text-center text-white mb-4">
                  Spend It
                </h2>

                <Droppable droppableId="spent">
                  {(provided) => (
                    <div
                      className="bg-[#0A160E] p-6 rounded-xl shadow-lg w-full min-h-[450px] border border-gray-600"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {spent.length === 0 ? (
                        <div className="text-gray-400 text-center mt-40 text-sm">
                          Drag and drop here from
                          <br />
                          available expenses
                        </div>
                      ) : (
                        spent.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                className={`transition-all duration-200 mb-3 rounded-lg flex justify-between items-center shadow-sm cursor-grab border pr-2
                  ${
                    snapshot.isDragging
                      ? "border-[#5F8428]"
                      : "border-[#5F8428]"
                  }
                  bg-[#131F24] hover:bg-[#202F36]`}
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {/* Left: Coin + Cost */}
                                <div
                                  className="flex items-center justify-center gap-1 w-[90px] px-2 py-1 rounded-lg border border-[#5F8428] bg-[#1E2A30]"
                                  style={{ margin: "4px" }}
                                >
                                  <img
                                    src="/financeGames6to8/coin.svg"
                                    alt="coin"
                                    className="w-5 h-5"
                                  />
                                  <span className="text-yellow-400 font-bold">
                                    ₹{item.cost}
                                  </span>
                                </div>

                                {/* Center: Label */}
                                <div className="text-[#5F8428] font-medium text-sm text-center flex-1">
                                  {item.label}
                                </div>

                                {/* Right: Icon Image */}
                                <img
                                  src={item.imgSrc}
                                  alt={item.label}
                                  className="w-6 h-6 flex-shrink-0"
                                />
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>

          {/* Footer with Total Wallet and Check Now Button */}
          <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40">
            {/* Kid Celebration Gif + Speech Bubble */}
            {showGif && (
              <div
                className="
    absolute
    -top-27 sm:-top-28 md:-top-29 lg:-top-30
    left-[83%] transform -translate-x-1/2
    z-50 flex items-start
  "
              >
                {/* Kid gif */}
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

                {/* Speech bubble — hidden on small screens */}
                <img
                  src="/financeGames6to8/kid-saying.svg"
                  alt="Kid Saying"
                  className="absolute top-2 left-[90px] w-24 hidden md:block"
                />
              </div>
            )}

            <div className="w-full max-w-4xl px-6">
              <div className="flex flex-row justify-between items-center gap-6 flex-wrap">
                {/* Wallet Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center">
                    <img
                      src="/financeGames6to8/coin.svg"
                      alt="Coin"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div className="text-white flex flex-col">
                    <span className="text-md lilita-one-regular sm:text-lg font-medium text-yellow-400">
                      Total Wallet:
                    </span>
                    <span className="text-white lilita-one-regular text-xl font-bold">
                      ₹{wallet}
                    </span>
                  </div>
                </div>

                {/* Button or Loader */}
                <div>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-4 border-t-green-500 border-gray-600 rounded-full animate-spin"></div>
                      <p className="mt-2 text-green-400 text-sm font-medium">
                        Analyzing...
                      </p>
                    </div>
                  ) : (
                    <img
                      src="/financeGames6to8/check-now-btn.svg"
                      alt="Check Now"
                      onClick={handleSubmit}
                      className="cursor-pointer w-[150px] hover:scale-105 transition-transform duration-200"
                    />
                  )}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-red-400 text-center mt-4 font-medium">
                  {error}
                </p>
              )}
            </div>
          </div>

          {showVictoryScreen && (
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

                {/* Accuracy + Insight Boxes */}
                <div className="mt-6 flex flex-col items-center justify-center sm:flex-row sm:items-stretch sm:gap-4">
                  {/* Accuracy Box */}
                  <div className="bg-[#09BE43] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                    <p className="text-black text-sm font-bold mb-1 mt-2">
                      TOTAL ACCURACY
                    </p>
                    <div className="bg-[#131F24] mt-0 flex-1 rounded-xl flex items-center justify-center py-3 px-5 w-full">
                      <img
                        src="/financeGames6to8/accImg.svg"
                        alt="Target Icon"
                        className="w-8 h-8 mr-2"
                      />
                      <span className="text-[#09BE43] text-3xl font-extrabold">
                        {parseInt(result?.spendingScore?.split("/")[0]) * 10}%
                      </span>
                    </div>
                  </div>

                  {/* Insight Box */}
                  <div className="mt-4 sm:mt-0 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-74 flex-1">
                    <p className="text-black text-sm font-bold mb-1 mt-2">
                      INSIGHT
                    </p>
                    <div className="bg-[#131F24] mt-0 flex-1 rounded-xl flex items-center justify-center px-4 text-center py-0.8 w-full">
                      <p
                        className="text-[#FFCC00] font-bold leading-relaxed"
                        style={{
                          fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
                          whiteSpace: "normal",
                        }}
                      >
                        {result?.tip || "Analyzing your results..."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Buttons */}
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
          )}
          <ToastContainer />
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <InstructionOverlay onClose={() => setShowInstructions(false)} />
      )}
    </>
  );
};

export default BudgetBuilder;
