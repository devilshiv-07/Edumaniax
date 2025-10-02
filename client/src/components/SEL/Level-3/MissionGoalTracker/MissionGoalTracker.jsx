import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";
// ✅ Goal data
const goals = [
  {
    id: "football",
    title: "⚽ Get better at football",
    steps: [
      {
        id: "f-s",
        type: "S",
        text: "I want to improve my football skills, especially in passing, dribbling, and stamina.",
      },
      {
        id: "f-m",
        type: "M",
        text: "I will improve my passing accuracy from 60% to 85%, increase dribbling drills completion speed by 30%, and run 5 km without stopping.",
      },
      {
        id: "f-a",
        type: "A",
        text: "I will train 4 times a week with my school coach and practice drills at home twice a week.",
      },
      {
        id: "f-r",
        type: "R",
        text: "This will help me perform better in my school team and prepare for upcoming inter-school tournaments.",
      },
      {
        id: "f-t",
        type: "T",
        text: "I will achieve these improvements in the next 8 weeks.",
      },
    ],
  },
  {
    id: "swim",
    title: "🏊 Learn how to swim",
    steps: [
      {
        id: "s-s",
        type: "S",
        text: "I want to learn how to swim freestyle and backstroke confidently in a pool.",
      },
      {
        id: "s-m",
        type: "M",
        text: "I should be able to swim 50 meters freestyle and 25 meters backstroke without stopping.",
      },
      {
        id: "s-a",
        type: "A",
        text: "I will join a beginner’s swim class and practice at the pool three times a week.",
      },
      {
        id: "s-r",
        type: "R",
        text: "Swimming is an essential life skill and also something I want to enjoy during holidays.",
      },
      {
        id: "s-t",
        type: "T",
        text: "I will learn to swim confidently within 6 weeks.",
      },
    ],
  },
  {
    id: "art",
    title: "🎨 Improve your art skills",
    steps: [
      {
        id: "a-s",
        type: "S",
        text: "I want to improve my drawing and shading techniques for portraits and still life.",
      },
      {
        id: "a-m",
        type: "M",
        text: "I will complete one portrait and one still-life drawing every week and compare them for progress.",
      },
      {
        id: "a-a",
        type: "A",
        text: "I will take online art tutorials and practice for 45 minutes daily.",
      },
      {
        id: "a-r",
        type: "R",
        text: "Improving my art skills will help me create a portfolio for art school next year.",
      },
      {
        id: "a-t",
        type: "T",
        text: "I will show significant improvement in 2 months.",
      },
    ],
  },
];

// ✅ SMART buckets
const buckets = ["S", "M", "A", "R", "T"];

const MissionGoalTracker = () => {
  const { completeSELChallenge } = useSEL();
  const [selectedGoal, setSelectedGoal] = useState(goals[0]);
  const [items, setItems] = useState(selectedGoal.steps);
  const [columns, setColumns] = useState(
    buckets.reduce((acc, bucket) => ({ ...acc, [bucket]: [] }), {})
  );
  const [attempts, setAttempts] = useState(0);
  const [resultMessage, setResultMessage] = useState("");
  const [showCorrect, setShowCorrect] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [gameOver, setGameOver] = useState(false); // ✅ NEW
  const [showFeedback, setShowFeedback] = useState(false); // Feedback modal state
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // Instructions overlay state

  useEffect(() => {
    if (resultMessage && isCorrect()) {
      completeSELChallenge(2, 0); // ✅ Adjust the parameters as needed
    }
  }, [resultMessage]);

  useEffect(() => {
    if (resultMessage && (isCorrect() || showCorrect)) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);

      updatePerformance({
        moduleName: "SEL",
        topicName: "peerSupportNetworks",
        score: 10,
        accuracy: 100,
        avgResponseTimeSec: totalSeconds / 5,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: isCorrect(),
      });
      setStartTime(Date.now());
    }
  }, [resultMessage]);

  // 📝 Notes Recommendation Hook
  useEffect(() => {
    if (!gameOver || isCorrect()) return; // only trigger if game ended AND not all correct

    const mistakes = [];
    for (let bucket of buckets) {
      for (let item of columns[bucket]) {
        if (item.type !== bucket) {
          mistakes.push({
            text: `Step "${item.text}" was placed in "${bucket}" but should be in "${item.type}".`,
            placedIn: bucket,
            correctCategory: item.type,
          });
        }
      }
    }

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [gameOver, columns]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const sourceCol = result.source.droppableId;
    const destCol = result.destination.droppableId;

    if (sourceCol === destCol) {
      const colItems =
        sourceCol === "items"
          ? Array.from(items)
          : Array.from(columns[sourceCol]);

      const [moved] = colItems.splice(result.source.index, 1);
      colItems.splice(result.destination.index, 0, moved);

      if (sourceCol === "items") setItems(colItems);
      else setColumns({ ...columns, [sourceCol]: colItems });
    } else {
      const sourceItems =
        sourceCol === "items"
          ? Array.from(items)
          : Array.from(columns[sourceCol]);
      const destItems = Array.from(columns[destCol]);

      const [moved] = sourceItems.splice(result.source.index, 1);
      destItems.splice(result.destination.index, 0, moved);

      if (sourceCol === "items") setItems(sourceItems);
      else setColumns({ ...columns, [sourceCol]: sourceItems });

      setColumns((prev) => ({ ...prev, [destCol]: destItems }));
    }
  };

  const isCorrect = () => {
    for (let b of buckets) {
      for (let item of columns[b]) {
        if (item.type !== b) return false;
      }
    }
    return true;
  };

  const handleCheck = () => {
    if (isCorrect()) {
      setResultMessage("🎉 Well done! All steps matched correctly!");
      setGameOver(true); // ✅ End game on win
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 3) {
        setShowCorrect(true);
        setResultMessage(
          "😢 Oops! Better luck next time. Here's the correct placement."
        );
        setGameOver(true); // ✅ End game on fail
      } else {
        setResultMessage(
          `❌ Not quite right. Try again! (${3 - newAttempts} tries left)`
        );
      }
    }
  };

  const handleTryAgain = () => {
    setItems(selectedGoal.steps);
    setColumns(buckets.reduce((acc, b) => ({ ...acc, [b]: [] }), {}));
    setResultMessage("");
    setShowCorrect(false);
  };

  const handlePlayAgain = () => {
    setItems(selectedGoal.steps);
    setColumns(buckets.reduce((acc, b) => ({ ...acc, [b]: [] }), {}));
    setAttempts(0);
    setResultMessage("");
    setShowCorrect(false);
    setStartTime(Date.now());
    setGameOver(false); // ✅ Reset game
  };

  const handleGoalChange = (id) => {
    const goal = goals.find((g) => g.id === id);
    setSelectedGoal(goal);
    setItems(goal.steps);
    setColumns(buckets.reduce((acc, b) => ({ ...acc, [b]: [] }), {}));
    setAttempts(0);
    setResultMessage("");
    setShowCorrect(false);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/help-hub");
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-6 flex flex-col items-center">
        <p className="text-lg text-white lilita-one-regular text-center mb-4">
          It’s time to make your goal real. Drag each step into the right part
          of your SMART goal plan.
          <br />
          <strong>SMART</strong> = Specific, Measurable, Achievable, Relevant,
          Time-bound.
        </p>

        <div className="mb-4">
          <select
            value={selectedGoal.id}
            className="px-4 py-2 rounded-md shadow-md text-white lilita-one-regular bg-blue-600 hover:bg-blue-700 transition"
            onChange={(e) => handleGoalChange(e.target.value)}
          >
            {goals.map((goal) => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            <Droppable droppableId="items">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white p-4 rounded-xl shadow-md min-h-[200px]"
                >
                  <h2 className="lilita-one-regular mb-2 text-blue-800">
                    Steps to Drag
                  </h2>
                  {items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`p-3 mb-2 lilita-one-regular rounded-md bg-blue-50 border border-blue-300 transition transform ${
                            snapshot.isDragging ? "scale-105 shadow-lg" : ""
                          }`}
                        >
                          {item.text}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {buckets.map((bucket) => (
              <Droppable key={bucket} droppableId={bucket}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white lilita-one-regular p-4 rounded-xl shadow-md min-h-[200px] transition border-2 ${
                      snapshot.isDraggingOver
                        ? "border-green-400"
                        : "border-transparent"
                    }`}
                  >
                    <h2 className="lilita-one-regular mb-2 text-green-800">
                      {bucket}
                    </h2>
                    {columns[bucket].map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 mb-2 rounded-md bg-green-50 border border-green-300 transition transform ${
                              snapshot.isDragging ? "scale-105 shadow-lg" : ""
                            }`}
                          >
                            {item.text}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {showCorrect &&
                      selectedGoal.steps
                        .filter((s) => s.type === bucket)
                        .map((s) => (
                          <div
                            key={`correct-${s.id}`}
                            className="p-3 mb-2 rounded-md bg-yellow-100 border border-yellow-400"
                          >
                            ✅ {s.text}
                          </div>
                        ))}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>

        <button
          onClick={handleCheck}
          disabled={showCorrect}
          className="mt-6 px-6 py-3 bg-blue-600 text-white lilita-one-regular rounded-lg hover:bg-blue-700 transition"
        >
          ✅ Check Answers
        </button>

        {gameOver &&
          (isCorrect() ? (
            /* ✅ WIN SCREEN */
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
                  onClick={handlePlayAgain}
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
            /* ❌ LOSE SCREEN */
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

                {/* Suggested Notes */}
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
                  onClick={handlePlayAgain}
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

export default MissionGoalTracker;
