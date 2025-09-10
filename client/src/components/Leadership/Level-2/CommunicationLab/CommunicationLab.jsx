import React, { useEffect, useState } from "react";
import { useLeadership } from "@/contexts/LeadershipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getLeadershipNotesRecommendation } from "@/utils/getLeadershipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const CommunicationLab = () => {
  const { completeLeadershipChallenge } = useLeadership();
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showGif, setShowGif] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // New state for instructions overlay
  const scenarios = [
    {
      title: "Scenario 1",
      question: "Teammates are fighting during a project. What do you do?",
      options: [
        { text: "Shout at them", correct: false },
        { text: "Calm them down and ask both sides", correct: true },
        { text: "Walk away", correct: false },
        { text: "Blame one person", correct: false },
      ],
    },
    {
      title: "Scenario 2",
      question: "A friend is sad but not talking. What should you do?",
      options: [
        { text: "Tell them to 'get over it'", correct: false },
        { text: "Listen patiently", correct: true },
        { text: "Make fun of them", correct: false },
        { text: "Ignore them", correct: false },
      ],
    },
    {
      title: "Scenario 3",
      question: "A classmate keeps interrupting you while you speak.",
      options: [
        { text: "Shout to make your point", correct: false },
        { text: "Politely ask them to let you finish", correct: true },
        { text: "Walk out of the room", correct: false },
        { text: "Interrupt them back", correct: false },
      ],
    },
    {
      title: "Scenario 4",
      question: "You gave your opinion in a group, but others disagree.",
      options: [
        { text: "Tell them they’re wrong", correct: false },
        { text: "Refuse to speak again", correct: false },
        { text: "Stay calm and hear their views", correct: true },
        { text: "Walk away angry", correct: false },
      ],
    },
    {
      title: "Quiz 5",
      question: "What does 'empathetic listening' mean?",
      options: [
        { text: "Giving advice quickly", correct: false },
        { text: "Ignoring the speaker", correct: false },
        {
          text: "Understanding and sharing the speaker’s feelings",
          correct: true,
        },
        { text: "Waiting for your turn to speak", correct: false },
      ],
    },
    {
      title: "Quiz 6",
      question: "What does active listening mean?",
      options: [
        { text: "Speaking louder", correct: false },
        { text: "Interrupting", correct: false },
        { text: "Paying full attention", correct: true },
        { text: "Looking away", correct: false },
      ],
    },
  ];
  useEffect(() => {
    if (step === scenarios.length) {
      const totalTimeMs = Date.now() - startTime;

      updatePerformance({
        moduleName: "Leadership",
        topicName: "understandableLeader",
        score: Math.round((score / scenarios.length) * 10),
        accuracy: parseFloat(((score / scenarios.length) * 100).toFixed(2)),
        avgResponseTimeSec: parseFloat((totalTimeMs / 1000).toFixed(2)),
        studyTimeMinutes: parseFloat((totalTimeMs / 60000).toFixed(2)),
        completed: score >= 5,
      });
      setStartTime(Date.now());
      if (score >= 5) {
        completeLeadershipChallenge(1, 0); // Update challengeId and taskId as needed
      }
    }
  }, [step, score]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

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
    if (step === scenarios.length && score < 5) {
      // Collect mistakes summary (MCQ-based only here)
      const mistakes = {
        score,
        totalQuestions: scenarios.length,
        incorrectSteps: scenarios.map((s, idx) => ({
          title: s.title,
          correct: null,
        })), // you can enrich if tracking wrong answers
      };

      getLeadershipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [step, score, scenarios.length]);

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

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/empathy-radar"); // ensure `useNavigate()` is defined
  };

  return (
    <div className="min-h-screen pt-20 md:pt-50 pb-28 flex flex-col items-center justify-center bg-[#0A160E] px-4 relative">
      <>
        <GameNav />
        {step < scenarios.length ? (
          <div className="bg-[#202F364D] p-6 md:p-10 rounded-2xl shadow-xl max-w-xl w-full text-center space-y-4 relative">
            <h2 className="text-xl font-semibold text-white lilita-one-regular">
              {scenarios[step].title}
            </h2>
            <p className="text-white lilita-one-regular">
              {scenarios[step].question}
            </p>
            <div className="space-y-3">
              {scenarios[step].options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt.correct, idx)}
                  className={`w-full py-2 px-4 rounded-lg border text-left lilita-one-regular transition-all
            ${
              selected === null
                ? "bg-white hover:bg-blue-100"
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
                          {Math.round((score / scenarios.length) * 100)}%
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

                  {/* Example: Suggested Notes (if integrated) */}
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
      </>
    </div>
  );
};

export default CommunicationLab;
