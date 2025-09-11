import React, { useEffect, useState } from "react";
import { useLeadership } from "@/contexts/LeadershipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { getLeadershipNotesRecommendation } from "@/utils/getLeadershipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const characters = [
  { name: "Aisha", skill: "good speaker", correctRole: "Team Spokesperson" },
  { name: "Rohan", skill: "good at drawing", correctRole: "Poster Designer" },
  { name: "Zara", skill: "fast writer", correctRole: "Note-taker" },
  { name: "Dev", skill: "tech expert", correctRole: "Slide Maker" },
];

const roles = [
  "Team Spokesperson",
  "Poster Designer",
  "Note-taker",
  "Slide Maker",
];

const mcqs = [
  {
    question: "What does a good team leader do?",
    gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTVkcHJvY2s0bXJwbzg3OW0yZ2hiOGZlbTlvN2kwNWY1cDByczFhaiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xUPGcjQ6dJEjH5uwMw/200w.webp",
    options: [
      "Does everything alone",
      "Blames others",
      "Shares work based on skills",
      "Only gives orders",
    ],
    answer: 2,
  },
  {
    question: "What should you do if two members want the same role?",
    gif: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNHlpcXNoaHM4djZvMHUzYThid3BpNXM4MDVtMzdsNXljcXpwZG9jdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1w2vvSVgAu3Ti/200w.webp",
    options: [
      "Pick your friend",
      "Flip a coin",
      "Talk and decide together",
      "Let them fight it out",
    ],
    answer: 2,
  },
  {
    question: "Why is delegation important?",
    gif: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2IzOTM1ZXYydWlmejJwMDczcDMwZ2tzNXRwdzJnODIzMXBrbm91ayZlcD12MV9naWZzX3NlYXJjaCZjdD1n/48FpOfwgAuJxGap5v1/200w.webp",
    options: [
      "It helps one person do everything",
      "It reduces communication",
      "It builds trust and efficiency",
      "It wastes time",
    ],
    answer: 2,
  },
  {
    question: "What is a sign of a strong team?",
    gif: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTNubDM1ZzBscnJ2MXVyNXllN2lnMjEyZDJ2aHRnZHRoaGk3aTFydCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/n09hPsUbebNe8d24SS/100.webp",
    options: [
      "Blaming others",
      "Clear roles and teamwork",
      "Only one leader does all work",
      "Confusion in tasks",
    ],
    answer: 1,
  },
];

const TeamArchitect = () => {
  const { completeLeadershipChallenge } = useLeadership();
  const [screen, setScreen] = useState("assign"); // assign, mcqs, result
  const [assignments, setAssignments] = useState({});
  const [draggingRole, setDraggingRole] = useState(null);
  const [score, setScore] = useState(0);
  const [mcqIndex, setMcqIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    if (screen === "result") {
      const totalTimeMs = Date.now() - startTime;

      updatePerformance({
        moduleName: "Leadership",
        topicName: "theStrategist",
        score: Math.round((score / 6) * 100),
        accuracy: parseFloat(((score / 6) * 100).toFixed(2)),
        avgResponseTimeSec: parseFloat((totalTimeMs / 6000).toFixed(2)),
        studyTimeMinutes: parseFloat((totalTimeMs / 60000).toFixed(2)),
        completed: score >= 5,
      });
      setStartTime(Date.now());

      if (score >= 5) {
        completeLeadershipChallenge(2, 1); // Update as needed
      }
    }
  }, [screen, score]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const totalQuestions = 6; // 2 from roles + 4 MCQs

    if (screen === "result" && score < totalQuestions) {
      // find which role assignments were wrong
      const roleMistakes = characters
        .filter(({ name, correctRole }) => assignments[name] !== correctRole)
        .map(({ name, correctRole }) => ({
          character: name,
          correctRole,
          assigned: assignments[name] || "None",
        }));

      // Collect mistakes summary for this leadership game
      const mistakes = {
        wrongAnswers: totalQuestions - score,
        wrongAssignments: roleMistakes, // all role assignment errors
        lastSelected: selectedOption, // last MCQ choice
      };

      getLeadershipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [screen, score, assignments, selectedOption]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleDrop = (characterName) => {
    if (draggingRole) {
      setAssignments((prev) => ({ ...prev, [characterName]: draggingRole }));
      setDraggingRole(null);
    }
  };

  const startMCQ = () => {
    let tempScore = 0;
    characters.forEach(({ name, correctRole }) => {
      if (assignments[name] === correctRole) tempScore += 0.5; // instead of 1
    });
    setScore(tempScore);
    setScreen("mcqs");
  };

  const handleOptionClick = (index) => {
    setSelectedOption(index);
    if (index === mcqs[mcqIndex].answer) {
      setScore((prev) => prev + 1);
    }
    setTimeout(() => {
      setSelectedOption(null);
      if (mcqIndex < mcqs.length - 1) {
        setMcqIndex((prev) => prev + 1);
      } else {
        setScreen("result");
      }
    }, 1000);
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
      <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-6 text-center flex flex-col items-center justify-center">
        {screen === "assign" && (
          <div className="max-w-2xl border border-white bg-[#202F364D] rounded-2xl p-6 shadow w-full">
            <h2 className="text-xl font-bold mb-4 text-white lilita-one-regular">
              Assign Roles to Team Members
            </h2>
            <img
              src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXEzOWIzbTU0dml1Nno4OWQya2oxZ2VvZDJuMXlrZDc3eTYzYjI2ciZlcD12MV9naWZzX3NlYXJjaCZjdD1n/jvghPtgdGWeKksBU8O/200w.webp"
              alt="assign roles"
              className="mb-4 mx-auto rounded-xl border border-white"
            />
            <div className="grid grid-cols-2 gap-4">
              {characters.map((char) => (
                <div
                  key={char.name}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(char.name)}
                  className="p-4 bg-gray-50 border rounded-xl text-left"
                >
                  <p className="font-semibold lilita-one-regular">
                    {char.name}
                  </p>
                  <p className="text-sm text-gray-500 lilita-one-regular">
                    ({char.skill})
                  </p>
                  <div className="mt-2 text-blue-600 lilita-one-regular">
                    Assigned: {assignments[char.name] || "None"}
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-lg mt-6 font-medium text-white lilita-one-regular">
              Drag these roles:
            </h3>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {roles.map((role) => (
                <div
                  key={role}
                  draggable
                  onDragStart={() => setDraggingRole(role)}
                  className="bg-blue-200 lilita-one-regular hover:bg-blue-300 text-blue-800 px-4 py-2 rounded-xl cursor-move"
                >
                  {role}
                </div>
              ))}
            </div>
            <button
              onClick={startMCQ}
              className="mt-6 px-6 py-2 bg-green-600 text-white lilita-one-regular rounded-xl hover:bg-green-700"
            >
              Next: Quiz
            </button>
          </div>
        )}

        {screen === "mcqs" && (
          <div className="max-w-xl border border-white bg-[#202F364D] rounded-2xl p-6 shadow w-full">
            <img
              src={mcqs[mcqIndex].gif}
              className="rounded-xl border border-white mb-4 mx-auto"
              alt="mcq"
            />
            <h2 className="text-xl font-semibold mb-4 text-white lilita-one-regular">
              {mcqs[mcqIndex].question}
            </h2>
            <div className="space-y-3">
              {mcqs[mcqIndex].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionClick(i)}
                  className={`w-full px-4 py-2 rounded-xl border transition lilita-one-regular text-left ${
                    selectedOption === i
                      ? i === mcqs[mcqIndex].answer
                        ? "bg-green-400 text-white"
                        : "bg-red-400 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  disabled={selectedOption !== null}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {screen === "result" && (
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
                          {Math.round((score / 6) * 100)}%
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
                    navigate("/innovation-sprint"); // your next level
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
                      setAssignments({});
                      setScore(0);
                      setMcqIndex(0);
                      setScreen("assign");
                      setSelectedOption(null);
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

export default TeamArchitect;
