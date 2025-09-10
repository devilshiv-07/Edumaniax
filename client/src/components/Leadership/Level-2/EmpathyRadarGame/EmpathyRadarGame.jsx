import React, { useEffect, useState } from "react";
import { useLeadership } from "@/contexts/LeadershipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { getLeadershipNotesRecommendation } from "@/utils/getLeadershipNotesRecommendation";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import InstructionOverlay from "./InstructionOverlay";
const EmpathyRadarGame = () => {
  const { completeLeadershipChallenge } = useLeadership();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedbackGif, setFeedbackGif] = useState(null);
  const [reflection, setReflection] = useState("");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [geminiSuggestion, setGeminiSuggestion] = useState("");
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const navigate = useNavigate();
  const [showGif, setShowGif] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const questions = [
    {
      type: "mcq",
      title: "Q1",
      question:
        "Your friend lost a competition and is crying. What should you do?",
      options: [
        { text: "Say 'You’ll win next time!'", correct: true },
        { text: "Laugh at them", correct: false },
        { text: "Say 'It’s not a big deal'", correct: false },
        { text: "Walk away", correct: false },
      ],
    },
    {
      type: "mcq",
      title: "Q2",
      question: "Emotional Intelligence means:",
      options: [
        { text: "Controlling others", correct: false },
        { text: "Ignoring emotions", correct: false },
        { text: "Understanding and managing feelings", correct: true },
        { text: "Acting tough", correct: false },
      ],
    },
    {
      type: "mcq",
      title: "Q3",
      question:
        "A friend is nervous before a speech. What’s the best thing to say?",
      options: [
        { text: "You always mess up", correct: false },
        { text: "You got this, I believe in you!", correct: true },
        { text: "Why are you scared?", correct: false },
        { text: "Good luck, you'll need it", correct: false },
      ],
    },
    {
      type: "mcq",
      title: "Q4",
      question: "Which is an empathetic response?",
      options: [
        { text: "Ignore them until they calm down", correct: false },
        { text: "Tell them to stop crying", correct: false },
        { text: "Sit with them and listen", correct: true },
        { text: "Say it’s not a big deal", correct: false },
      ],
    },
    {
      type: "mcq",
      title: "Q5",
      question: "Your sibling is upset and yelling. What should you do?",
      options: [
        { text: "Yell back louder", correct: false },
        { text: "Walk away and never talk", correct: false },
        { text: "Stay calm and ask what’s wrong", correct: true },
        { text: "Say they’re overreacting", correct: false },
      ],
    },
    {
      type: "short",
      title: "Q6 - Reflection",
      question:
        "Write one time you helped a friend or family member when they were upset.",
    },
  ];

  useEffect(() => {
    if (step === questions.length) {
      const totalTimeMs = Date.now() - startTime;
      updatePerformance({
        moduleName: "Leadership",
        topicName: "understandableLeader",
        score: Math.round((score / questions.length) * 10),
        accuracy: parseFloat(((score / questions.length) * 100).toFixed(2)),
        avgResponseTimeSec: parseFloat((totalTimeMs / 1000).toFixed(2)),
        studyTimeMinutes: parseFloat((totalTimeMs / 60000).toFixed(2)),
        completed: score >= 5,
      });
      setStartTime(Date.now());

      if (score >= 5) {
        completeLeadershipChallenge(1, 1);
      }
    }
  }, [step, score]);

  useEffect(() => {
    if (step === 0 || step === 1) {
      setShowGif(true);
      const timer = setTimeout(() => setShowGif(false), 1500); // hide after 1.5s
      return () => clearTimeout(timer);
    } else {
      setShowGif(false);
    }
  }, [step]);

  useEffect(() => {
    if (step === questions.length && score < 5) {
      // Collect mistakes summary for this game
      const mistakes = {
        wrongAnswers: score < questions.length ? questions.length - score : 0,
        lastSelected: selected,
        reflectionFeedback: geminiSuggestion,
      };

      getLeadershipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [step, score, selected, geminiSuggestion]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleSelect = (isCorrect, index) => {
    if (selected !== null) return;
    setSelected(index);
    if (isCorrect) setScore((prev) => prev + 1);
    setTimeout(() => {
      setSelected(null);
      setStep((prev) => prev + 1);
    }, 1500);
  };

  const handleGeminiCheck = async () => {
    if (!reflection.trim()) return;

    const apiKey = import.meta.env.VITE_API_KEY;
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `You are a friendly teacher for students in Class 6–8.

A student wrote this empathy reflection: "${reflection}"

✅ Please check if it shows:
1️⃣ Understanding of another person’s feelings  
2️⃣ A kind or helpful response  
3️⃣ Clear and simple expression (for grade 6–8)

🎓 Then give feedback in **1–2 sentences**:
- If it's good, start with: "Good job! ..."
- If it needs work, start with: "Needs improvement: ..." and suggest how to make it better.

Keep your reply short, simple, and kind with emojis if possible.`,
            },
          ],
        },
      ],
    };

    setChecking(true);
    setGeminiSuggestion("");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (reply.toLowerCase().includes("good job")) {
        setVerified(true);
        setFeedbackGif("valid");
        setScore((prev) => prev + 1);
      } else {
        setFeedbackGif("invalid");
        setGeminiSuggestion(reply);
        setAttemptsLeft((prev) => {
          const updated = prev - 1;
          if (updated <= 0) {
            setTimeout(() => {
              setStep((prevStep) => prevStep + 1);
            }, 2000);
          }
          return updated;
        });
      }
    } catch (error) {
      console.error("Gemini error:", error);
      alert("⚠️ Oops! Something went wrong. Try again later.");
    } finally {
      setChecking(false);
    }
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 flex flex-col items-center justify-center bg-[#0A160E] px-4 relative">
        {step < questions.length ? (
          <div className="bg-[#202F364D] p-6 md:p-10 rounded-2xl shadow-xl max-w-xl w-full text-center space-y-4">
            <h2 className="text-xl font-semibold text-white lilita-one-regular">
              {questions[step].title}
            </h2>
            <p className="text-white lilita-one-regular">
              {questions[step].question}
            </p>

            {questions[step].type === "mcq" ? (
              <div className="space-y-3">
                {questions[step].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(opt.correct, idx)}
                    className={`w-full py-2 px-4 rounded-lg border text-left lilita-one-regular transition-all
              ${
                selected === null
                  ? "bg-white hover:bg-pink-100"
                  : idx === selected
                  ? opt.correct
                    ? "bg-green-100 border-green-500"
                    : "bg-red-100 border-red-500"
                  : "bg-white"
              }`}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  rows="4"
                  className="w-full p-3 border rounded-lg text-white"
                  placeholder="Type your reflection here..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  disabled={verified}
                />
                {!verified && (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={handleGeminiCheck}
                      disabled={checking}
                      className="bg-blue-600 text-white lilita-one-regular px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {checking ? "Checking..." : "🤖 Verify"}
                    </button>
                    {feedbackGif === "invalid" && (
                      <button
                        onClick={() => {
                          setReflection("");
                          setGeminiSuggestion("");
                        }}
                        className="bg-gray-600 text-white lilita-one-regular px-6 py-2 rounded-lg hover:bg-gray-700"
                      >
                        🔁 Try Again
                      </button>
                    )}
                  </div>
                )}

                {feedbackGif === "invalid" && (
                  <div className="text-left space-y-2">
                    <p className="text-red-600 lilita-one-regular">
                      ❌ {geminiSuggestion}
                    </p>
                    <p className="text-sm text-white lilita-one-regular">
                      {attemptsLeft > 0
                        ? `Attempts left: ${attemptsLeft}`
                        : "⚠️ Maximum attempts used. Moving to result..."}
                    </p>
                  </div>
                )}

                {feedbackGif === "valid" && (
                  <div className="text-green-700 lilita-one-regular bg-green-50 p-4 rounded-lg space-y-2 text-left">
                    <p>✅ Great job! You showed wonderful empathy! 🌟</p>
                    <p>
                      It's amazing that you remembered such a moment. Helping
                      others shows true kindness. 😊
                    </p>
                    <p>
                      Keep being that thoughtful friend or sibling. Small acts
                      of kindness make a big difference! 💖✨
                    </p>
                  </div>
                )}

                {verified && (
                  <button
                    onClick={() => setStep((prev) => prev + 1)}
                    className="bg-pink-600 text-white lilita-one-regular px-6 py-2 rounded-lg hover:bg-pink-700"
                  >
                    ✅ Continue
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            {score >= 5 ? (
              /* 🎉 WIN VIEW */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                {/* Center Celebration */}
                <div className="flex flex-col items-center justify-center flex-1 p-6">
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

                  <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                    Challenge Complete!
                  </h2>

                  {/* Accuracy + Insight */}
                  <div className="mt-6 flex flex-col sm:flex-row sm:gap-4 items-center">
                    {/* Accuracy */}
                    <div className="bg-[#09BE43] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                      <p className="text-black text-sm font-bold mt-2">
                        TOTAL ACCURACY
                      </p>
                      <div className="bg-[#131F24] rounded-xl flex items-center justify-center py-3 px-5 w-full">
                        <img
                          src="/financeGames6to8/accImg.svg"
                          alt="Target Icon"
                          className="w-8 h-8 mr-2"
                        />
                        <span className="text-[#09BE43] text-3xl font-extrabold">
                          {Math.round((score / questions.length) * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Insight */}
                    <div className="bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-64 flex-1 mt-4 sm:mt-0">
                      <p className="text-black text-sm font-bold mt-2">
                        INSIGHT
                      </p>
                      <div className="bg-[#131F24] rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
                        <p className="text-[#FFCC00] font-bold leading-relaxed text-sm">
                          🌟 Great job! You explored the scenarios like a pro.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-[#2f3e46] border-t border-gray-700 py-4 flex justify-center gap-6">
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

                {/* ✅ Popup here */}
                <LevelCompletePopup
                  isOpen={isPopupVisible}
                  onConfirm={() => {
                    setIsPopupVisible(false);
                    navigate("/decision-room"); // your next level
                  }}
                  onCancel={() => {
                    setIsPopupVisible(false);
                    navigate("/leadership/games"); // or exit route
                  }}
                  onClose={() => setIsPopupVisible(false)}
                  title="Challenge Complete!"
                  message="Are you ready for the next challenge?"
                  confirmText="Next Challenge"
                  cancelText="Exit"
                />
              </div>
            ) : (
              /* ❌ LOSE VIEW */
              <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                <div className="flex flex-col items-center justify-center flex-1 p-6">
                  <img
                    src="/financeGames6to8/game-over-game.gif"
                    alt="Game Over"
                    className="w-48 sm:w-64 h-auto mb-4"
                  />
                  <p className="text-yellow-400 lilita-one-regular text-lg sm:text-2xl text-center">
                    Oops! That was close! Wanna Retry?
                  </p>

                  {/* Optional: Recommended notes */}
                  {recommendedNotes.length > 0 && (
                    <div className="mt-6 bg-[#202F364D] p-4 rounded-xl shadow max-w-md text-center">
                      <h3 className="text-white lilita-one-regular text-xl mb-2">
                        📘 Learn & Improve
                      </h3>
                      <p className="text-white mb-3 text-sm leading-relaxed">
                        Revisit{" "}
                        <span className="text-yellow-300 font-bold">
                          {recommendedNotes.map((n) => n.title).join(", ")}
                        </span>{" "}
                        to strengthen your skills.
                      </p>

                      {recommendedNotes.map((note) => (
                        <button
                          key={note.topicId}
                          onClick={() =>
                            navigate(
                              `/leadership/notes?grade=6-8&section=${note.topicId}`
                            )
                          }
                          className="bg-yellow-400 text-black lilita-one-regular px-4 py-2 rounded-lg hover:bg-yellow-500 transition block mx-auto my-2"
                        >
                          Go to {note.title}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-[#2f3e46] border-t border-gray-700 py-4 flex justify-center gap-6">
                  <img
                    src="/financeGames6to8/retry.svg"
                    alt="Retry"
                    onClick={() => {
                      setStep(0);
                      setScore(0);
                      setReflection("");
                      setVerified(false);
                      setFeedbackGif(null);
                      setGeminiSuggestion("");
                      setAttemptsLeft(3);
                      setStartTime(Date.now());
                    }}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                  <img
                    src="/financeGames6to8/next-challenge.svg"
                    alt="Next Challenge"
                    onClick={handleNextChallenge}
                    className="cursor-pointer w-32 sm:w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* 🎉 Celebration Footer (always visible) */}
        <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
          {/* Kid Celebration Gif + Speech Bubble (only step 0 & 1) */}
          {showGif && (step === 0 || step === 1) && (
            <div
              className="absolute -top-24 sm:-top-30 transform -translate-x-1/2 z-50 flex items-start"
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
        </div>

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}
      </div>
    </>
  );
};

export default EmpathyRadarGame;
