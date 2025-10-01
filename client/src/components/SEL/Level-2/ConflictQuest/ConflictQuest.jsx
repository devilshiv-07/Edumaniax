import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const scenarios = [
  {
    scenario:
      "A classmate accuses you of copying their homework in front of others.",
    options: [
      { text: "Blame them loudly", correct: false },
      {
        text: "Calmly say, ‘Let’s talk after class – I can explain.’",
        correct: true,
      },
      { text: "Ignore and walk away", correct: false },
    ],
  },
  {
    scenario: "Your sibling takes your charger without asking.",
    options: [
      { text: "Yell and grab it back", correct: false },
      {
        text: "Say, ‘Please ask before using my stuff next time.’",
        correct: true,
      },
      { text: "Complain to your parents immediately", correct: false },
    ],
  },
  {
    scenario: "Your friend spreads a rumor about you.",
    options: [
      { text: "Spread one about them too", correct: false },
      {
        text: "Tell them you’re hurt and want to understand why",
        correct: true,
      },
      { text: "Avoid them forever", correct: false },
    ],
  },
  {
    scenario: "You and a peer are put on the same project team after a fight.",
    options: [
      { text: "Refuse to work with them", correct: false },
      {
        text: "Suggest setting ground rules and working fairly",
        correct: true,
      },
      { text: "Ask the teacher to remove them", correct: false },
    ],
  },
];

const ConflictQuest = () => {
  const { completeSELChallenge } = useSEL();
  const { updatePerformance } = usePerformance();

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showKidGif, setShowKidGif] = useState(false); // ✅ kid gif state

  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true); // Instructions overlay state

  // shuffle scenarios once at start
  const [shuffledScenarios] = useState(() =>
    [...scenarios].sort(() => 0.5 - Math.random())
  );

  useEffect(() => {
    if (completed) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);
      const scaledScore = Math.round((score / 4) * 10); // 4 questions

      updatePerformance({
        moduleName: "SEL",
        topicName: "emotionalAwareness",
        score: scaledScore,
        accuracy: (score / 4) * 100,
        avgResponseTimeSec: totalSeconds / 4,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: score >= 3,
      });
      setStartTime(Date.now());

      if (score >= 3) {
        completeSELChallenge(1, 1);
      }
    }
  }, [completed]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!completed || score >= 3) return; // only suggest if game finished & lost

    const mistakes = shuffledScenarios
      .filter(
        (scenario) =>
          typeof scenario.chosen === "number" &&
          scenario.chosen !== scenario.correctIndex
      )
      .map((scenario) => ({
        text: `In scenario: "${scenario.scenario}" the better choice was "${
          scenario.options[scenario.correctIndex].text
        }".`,
        placedIn: "Conflict Resolution",
        correctCategory: "Calm Communication",
      }));

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [completed, score, shuffledScenarios]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleOptionClick = (correct, index) => {
    setSelected(index);

    // Save chosen option into the scenario
    shuffledScenarios[round].chosen = index;
    shuffledScenarios[round].correctIndex = shuffledScenarios[
      round
    ].options.findIndex((opt) => opt.correct);

    if (round === 0) {
      setShowKidGif(true);
      setTimeout(() => setShowKidGif(false), 2000);
    }

    setShowFeedback(true);
    if (correct) setScore((prev) => prev + 1);

    setTimeout(() => {
      setShowFeedback(false);
      setSelected(null);
      if (round === 3) setCompleted(true);
      else setRound((prev) => prev + 1);
    }, 2500);
  };

  const handleRestart = () => {
    setRound(0);
    setScore(0);
    setCompleted(false);
    setSelected(null);
    setShowFeedback(false);
    setStartTime(Date.now());
    // reshuffle scenarios on restart
    window.location.reload(); // quick reset to reshuffle order
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/mind-body-match-up");
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] flex flex-col items-center justify-center p-6">
        <p className="text-center text-white lilita-one-regular text-lg mb-6 max-w-xl">
          You’re in a tricky situation. Choose your words carefully! Let’s solve
          this like a calm communicator.
        </p>

        {!completed && (
          <div className="max-w-xl w-full bg-[#202F364D] shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-xl text-white lilita-one-regular mb-4">
              Scenario {round + 1}:
            </h2>
            <p className="mb-4 text-white lilita-one-regular">
              {shuffledScenarios[round].scenario}
            </p>
            <div className="space-y-3">
              {shuffledScenarios[round].options.map((opt, i) => (
                <button
                  key={i}
                  disabled={selected !== null}
                  onClick={() => handleOptionClick(opt.correct, i)}
                  className={cn(
                    "w-full text-left lilita-one-regular px-4 py-2 border rounded-lg transition-all duration-300",
                    selected === i && showFeedback
                      ? opt.correct
                        ? "bg-green-300 border-green-600"
                        : "bg-red-200 border-red-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  )}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {showFeedback && selected !== null && (
          <div className="text-center mb-4">
            <img
              src={
                shuffledScenarios[round].options[selected].correct
                  ? "https://media.tenor.com/IMDTu5ABVyAAAAAM/ianbohen-ryan.gif"
                  : "https://media.tenor.com/V5ZyuPSLqo4AAAAM/funhouse-family-daylins-funhouse.gif"
              }
              alt="Feedback Gif"
              className="w-60 h-auto mx-auto rounded-lg"
            />
            <p className="text-xl text-white lilita-one-regular mt-2">
              {shuffledScenarios[round].options[selected].correct
                ? "You're going great!"
                : "This is not the way..."}
            </p>
          </div>
        )}

        {/* ✅ Sticky Footer Celebration */}
        <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
          {showKidGif && (
            <div
              className="absolute -top-24 sm:-top-30 transform -translate-x-1/2 z-50 flex items-start"
              style={{ left: "85%" }}
            >
              <img
                src="/financeGames6to8/kid-gif.gif"
                alt="Kid Celebration"
                className="object-contain"
                style={{ maxHeight: "120px", height: "auto", width: "auto" }}
              />
              <img
                src="/financeGames6to8/kid-saying.svg"
                alt="Kid Saying"
                className="absolute top-2 left-[90px] w-24 hidden md:block"
              />
            </div>
          )}
        </div>

        {completed &&
          (score >= 3 ? (
            /* ✅ WIN SCREEN JSX */
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
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

                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                  Challenge Complete!
                </h2>
                <p className="text-[#FFCC00] mt-4 text-center font-semibold">
                  🎉 Great job! You nailed it!
                </p>
              </div>

              {/* Footer */}
              <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={handleRestart}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
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
            /* ❌ LOSE SCREEN JSX */
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center flex-1 p-6">
                <img
                  src="/financeGames6to8/game-over-game.gif"
                  alt="Game Over"
                  className="w-48 sm:w-64 h-auto mb-4"
                />
                <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                  Oops! You didn’t hit the mark this time. Wanna retry?
                </p>

                {/* Suggested Notes Section */}
                {recommendedNotes.length > 0 && (
                  <div className="mt-6 bg-[#202F364D] p-4 rounded-xl shadow max-w-md text-center">
                    <h3 className="text-white lilita-one-regular text-xl mb-2">
                      📘 Learn & Improve
                    </h3>
                    <p className="text-white mb-3 text-sm leading-relaxed">
                      We recommend revisiting{" "}
                      <span className="text-yellow-300 font-bold">
                        {recommendedNotes.map((n) => n.title).join(", ")}
                      </span>{" "}
                      to strengthen your skills before retrying.
                    </p>
                    {recommendedNotes.map((note) => (
                      <button
                        key={note.topicId}
                        onClick={() =>
                          navigate(
                            `/social-learning/notes?grade=6-8&section=${note.topicId}`
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

              <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={handleRestart}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
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
          ))}

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

export default ConflictQuest;
