import React, { useState, useEffect } from "react";
import {
  Scale,
  Timer,
  Trophy,
  Star,
  BookOpen,
  Users,
  TreePine,
  Smartphone,
  Computer,
  Award,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import { useLaw } from "@/contexts/LawContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { getLawNotesRecommendation } from "@/utils/getLawNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";
const cases = [
  {
    id: 1,
    title: "Broken Phone Bummer",
    emoji: "📱",
    law: "Consumer Rights",
    summary:
      "Ria's brand-new phone stopped working in 3 days. The shopkeeper refused to replace it, claiming she dropped it (she didn't).",
    sides: {
      plaintiff: {
        title: "Plaintiff's Advocate",
        subtitle: "Argue for replacement",
        arguments: [
          {
            text: "The product was defective under warranty – replacement is fair.",
            points: 4,
            correct: true,
          },
          {
            text: "The store must return money for all complaints.",
            points: 3,
          },
          {
            text: "It's the shop's duty to make sure phones never break.",
            points: 2,
          },
          { text: "Phones should last forever; this is cheating.", points: 1 },
        ],
      },
      defence: {
        title: "Defence Advocate",
        subtitle: "Argue it was buyer's fault",
        arguments: [
          {
            text: "There is no physical damage report from the store – buyer must prove fault isn't theirs.",
            points: 4,
            correct: true,
          },
          { text: "Phones sometimes break, it's normal.", points: 3 },
          {
            text: "Company policy says 'no refunds', so no refund.",
            points: 2,
          },
          { text: "Ria should have bought insurance.", points: 1 },
        ],
      },
    },
    legalPrinciple:
      "Consumer protection laws ensure defective products can be replaced or refunded within warranty period!",
  },
  {
    id: 2,
    title: "Trees and Trouble",
    emoji: "🌳",
    law: "Environmental Laws",
    summary:
      "A park near Arjun's school was bulldozed to make space for a parking lot. He and his friends want to stop it.",
    sides: {
      plaintiff: {
        title: "Plaintiff's Advocate",
        subtitle: "Defend the park",
        arguments: [
          {
            text: "Cutting trees without permission is illegal under environmental law.",
            points: 4,
            correct: true,
          },
          { text: "Trees are friends, not things!", points: 3 },
          { text: "We like playing there; that matters.", points: 2 },
          { text: "My grandparents planted those trees!", points: 1 },
        ],
      },
      defence: {
        title: "Defence Advocate",
        subtitle: "Defend the construction",
        arguments: [
          {
            text: "The land belongs to the city – they followed legal procedures.",
            points: 4,
            correct: true,
          },
          {
            text: "More cars means more people can come to school.",
            points: 3,
          },
          { text: "Kids have other parks to play.", points: 2 },
          { text: "Trees grow back fast, it's not a big deal.", points: 1 },
        ],
      },
    },
    legalPrinciple:
      "Environmental laws protect our nature and require proper permissions before cutting trees!",
  },
  {
    id: 3,
    title: "Cyber Confusion",
    emoji: "💻",
    law: "Cyber Law + Juvenile Justice",
    summary:
      "Kabir made a fake profile of his friend and posted silly photos. The school suspended him. Now, a legal notice has arrived.",
    sides: {
      plaintiff: {
        title: "Plaintiff's Advocate",
        subtitle: "Friend's Side",
        arguments: [
          {
            text: "Making fake profiles and harassment is punishable under cyber law.",
            points: 4,
            correct: true,
          },
          { text: "It was meant to embarrass my client in school.", points: 3 },
          { text: "This has caused emotional harm.", points: 2 },
          { text: "He broke friendship rules.", points: 1 },
        ],
      },
      defence: {
        title: "Defence Advocate",
        subtitle: "Kabir's Side",
        arguments: [
          {
            text: "Kabir is a minor – the Juvenile Justice Act focuses on reform, not punishment.",
            points: 4,
            correct: true,
          },
          { text: "He didn't know it was a big deal.", points: 3 },
          { text: "Everyone posts jokes online.", points: 2 },
          { text: "Kabir said sorry. That's enough.", points: 1 },
        ],
      },
    },
    legalPrinciple:
      "Cyber laws protect us online, but juvenile justice focuses on teaching kids rather than punishing them!",
  },
];

const GameHeader = ({ score, currentCase, gamePhase }) => (
  <div className="bg-[#202F364D] border border-white text-white p-4 rounded-lg shadow-lg mb-6">
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-3">
        <Scale className="w-8 h-8 text-yellow-300 animate-bounce" />
        <div>
          <h1 className="text-xl sm:text-2xl lilita-one-regular">
            Courtroom Clash
          </h1>
          <p className="text-sm text-purple-200 lilita-one-regular">
            Be the Legal Hero! ⚖️
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-white/20 px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-sm">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="lilita-one-regular">{score} pts</span>
        </div>
        {gamePhase === "playing" && (
          <div className="bg-white/20 px-3 py-2 rounded-full text-sm lilita-one-regular backdrop-blur-sm">
            Case {currentCase + 1}/3
          </div>
        )}
      </div>
    </div>
  </div>
);

const Timer2 = ({ timeLeft, isActive }) => {
  const percentage = (timeLeft / 20) * 100;
  const color =
    timeLeft > 10
      ? "bg-green-500"
      : timeLeft > 5
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="mb-6" style={{ fontFamily: "'Comic Neue', cursive" }}>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Timer className="w-5 h-5 text-white" />
        <span
          className={`lilita-one-regular text-lg ${
            timeLeft <= 5 ? "text-red-500 animate-pulse" : "text-white"
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-1000 ease-linear rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const CaseCard = ({ caseData, onSelect, index, onChoose }) => {
  const handleClick = () => {
    if (onSelect) onSelect(index); // existing logic
    if (onChoose) {
      onChoose(); // trigger kid gif
    }
  };

  return (
    <div
      className="bg-[#4f61694d] rounded-xl shadow-lg p-6 cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-purple-300"
      onClick={handleClick}
    >
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">{caseData.emoji}</div>
        <h3 className="text-xl font-bold text-white lilita-one-regular mb-2">
          {caseData.title}
        </h3>
        <div className="bg-[#4272864d] px-3 py-1 rounded-lg inline-block mb-3">
          <span className="text-sm text-white lilita-one-regular">
            {caseData.law}
          </span>
        </div>
        <p className="text-white lilita-one-regular text-sm leading-relaxed">
          {caseData.summary}
        </p>
      </div>
    </div>
  );
};

const SideSelection = ({ caseData, onSelectSide, onChooseSide }) => (
  <div className="space-y-6">
    <div className="text-center">
      <div className="text-6xl mb-4 animate-pulse">{caseData.emoji}</div>
      <h2 className="text-2xl font-bold text-white lilita-one-regular mb-2">
        {caseData.title}
      </h2>
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-lg inline-block mb-4">
        <span className="lilita-one-regular text-purple-700">
          {caseData.law}
        </span>
      </div>
      <p className="text-white lilita-one-regular max-w-2xl mx-auto mb-6">
        {caseData.summary}
      </p>
      <h3 className="text-xl font-bold text-white lilita-one-regular mb-4">
        🧩 Choose your Role:
      </h3>
    </div>

    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div
        className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-xl cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
        onClick={() => {
          onSelectSide("plaintiff");
          onChooseSide?.(); // 👈 trigger kid gif
        }}
      >
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 animate-bounce" />
          <h4 className="text-xl lilita-one-regular mb-2">
            {caseData.sides.plaintiff.title}
          </h4>
          <p className="text-green-100 lilita-one-regular">
            {caseData.sides.plaintiff.subtitle}
          </p>
          <div className="mt-4 bg-white/20 px-4 py-2 rounded-full inline-block">
            <span className="text-sm lilita-one-regular">
              Fight for Justice! ⚔️
            </span>
          </div>
        </div>
      </div>

      <div
        className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-xl cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
        onClick={() => {
          onSelectSide("plaintiff");
          onChooseSide?.(); // 👈 trigger kid gif
        }}
      >
        <div className="text-center">
          <Scale className="w-12 h-12 mx-auto mb-4 animate-bounce" />
          <h4 className="text-xl lilita-one-regular mb-2">
            {caseData.sides.defence.title}
          </h4>
          <p className="text-orange-100 lilita-one-regular">
            {caseData.sides.defence.subtitle}
          </p>
          <div className="mt-4 bg-white/20 px-4 py-2 rounded-full inline-block">
            <span className="text-sm lilita-one-regular">
              Defend Rights! 🛡️
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ArgumentSelection = ({
  caseData,
  selectedSide,
  onSelectArgument,
  timeLeft,
}) => {
  const sideData = caseData.sides[selectedSide];

  return (
    <div className="space-y-6" style={{ fontFamily: "'Comic Neue', cursive" }}>
      <div className="text-center">
        <div className="text-4xl mb-3">{caseData.emoji}</div>
        <h2 className="text-xl font-bold text-white lilita-one-regular mb-2">
          {caseData.title}
        </h2>
        <div
          className={`px-4 py-2 rounded-full inline-block mb-4 ${
            selectedSide === "plaintiff"
              ? "bg-[#4f61694d] text-green-700"
              : "bg-[#4f61694d] text-orange-700"
          }`}
        >
          <span className="lilita-one-regular text-white">
            {sideData.title}
          </span>
        </div>
        <h3 className="text-lg font-bold text-white lilita-one-regular mb-4">
          🎯 Choose your best argument:
        </h3>
      </div>

      <Timer2 timeLeft={timeLeft} isActive={true} />

      <div className="space-y-4 max-w-4xl mx-auto">
        {sideData.arguments.map((argument, index) => (
          <div
            key={index}
            className="bg-[#447e974d] border-2 border-gray-200 rounded-xl p-4 cursor-pointer transform hover:scale-102  transition-all duration-300 hover:shadow-lg hover:border-purple-300"
            onClick={() => onSelectArgument(argument, index)}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center lilita-one-regular text-white text-sm `}
              >
                {index + 1}
              </div>
              <p className="text-white lilita-one-regular flex-1 leading-relaxed">
                {argument.text}
              </p>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResultScreen = ({
  selectedArgument,
  correctArgument,
  caseData,
  onContinue,
}) => {
  let isCorrect;
  let points;

  if (selectedArgument === null) {
    isCorrect = false;
    points = 0;
  } else {
    isCorrect = selectedArgument.correct;
    points = selectedArgument.points;
  }

  return (
    <div
      className="space-y-6 text-center"
      style={{ fontFamily: "'Comic Neue', cursive" }}
    >
      <div
        className={`text-6xl mb-4 ${
          isCorrect ? "animate-bounce" : "animate-pulse"
        }`}
      >
        {isCorrect ? "🎉" : "🤔"}
      </div>

      <div
        className={`p-6 rounded-xl ${
          isCorrect
            ? "bg-green-100 border-green-300"
            : "bg-yellow-100 border-yellow-300"
        } border-2`}
      >
        <h2
          className={`text-2xl lilita-one-regular mb-2 ${
            isCorrect ? "text-green-700" : "text-yellow-700"
          }`}
        >
          {selectedArgument === null
            ? "Time's up"
            : isCorrect
            ? "Excellent Choice! 🌟"
            : "Good Try! 💪"}
        </h2>

        <div
          className={`text-4xl lilita-one-regular mb-4 ${
            isCorrect ? "text-green-600" : "text-yellow-600"
          }`}
        >
          +{points} points
        </div>

        <p
          className={`text-lg mb-4 lilita-one-regular ${
            isCorrect ? "text-green-700" : "text-yellow-700"
          }`}
        >
          {selectedArgument === null
            ? ""
            : isCorrect
            ? "You chose the strongest legal argument!"
            : "You earned points, but there was a stronger argument!"}
        </p>
      </div>

      {!isCorrect && (
        <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-xl">
          <h3 className="lilita-one-regular text-blue-700 mb-2">
            💡 The Best Argument Was:
          </h3>
          <p className="text-blue-600 lilita-one-regular italic">
            "{correctArgument.text}"
          </p>
        </div>
      )}

      <div className="bg-purple-50 border-2 border-purple-200 p-4 rounded-xl">
        <h3 className="lilita-one-regular text-purple-700 mb-2 flex items-center justify-center gap-2">
          <BookOpen className="w-5 h-5" />
          Legal Learning
        </h3>
        <p className="text-purple-600 lilita-one-regular">
          {caseData.legalPrinciple}
        </p>
      </div>

      <button
        onClick={onContinue}
        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-3 rounded-lg lilita-one-regular hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
      >
        Continue <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

const WinScreen = ({ score, onRestart, onNextChallenge, onFeedBack }) => {
  const maxScore = 12;
  const percentage = Math.round((score / maxScore) * 100);

  return (
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

        {/* Success Message */}
        <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
          Challenge Complete!
        </h2>

        {/* Stats */}
        <div className="mt-6 flex flex-col items-center justify-center sm:flex-row sm:gap-4">
          <div className="bg-[#09BE43] rounded-xl p-1 flex flex-col items-center w-64">
            <p className="text-black text-sm font-bold mb-1 mt-2">
              TOTAL SCORE
            </p>
            <div className="bg-[#131F24] rounded-xl flex items-center justify-center py-3 px-5 w-full">
              <span className="text-[#09BE43] text-3xl font-extrabold">
                {score}/{maxScore}
              </span>
            </div>
          </div>

          <div className="mt-4 sm:mt-0 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-64">
            <p className="text-black text-sm font-bold mb-1 mt-2">INSIGHT</p>
            <div className="bg-[#131F24] rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
              <p className="text-[#FFCC00] font-bold leading-relaxed">
                {percentage === 100
                  ? "🏆 Perfect! You nailed every case!"
                  : "🌟 Great job! You're on your way to being a Legal Eagle!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
        <img
          src="/financeGames6to8/retry.svg"
          alt="Retry"
          onClick={onRestart}
          className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
        <img
          src="/financeGames6to8/feedback.svg"
          alt="Feedback"
          onClick={onFeedBack}
          className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
        <img
          src="/financeGames6to8/next-challenge.svg"
          alt="Next Challenge"
          onClick={onNextChallenge}
          className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
      </div>
    </div>
  );
};

// ✅ LoseScreen now takes recommendedNotes and navigate as props
const LoseScreen = ({
  score,
  onRestart,
  onNextChallenge,
  recommendedNotes,
  navigate,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
      <div className="flex flex-col items-center justify-center flex-1 p-4">
        <img
          src="/financeGames6to8/game-over-game.gif"
          alt="Game Over"
          className="w-48 sm:w-64 h-auto mb-4"
        />
        <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl text-center font-semibold">
          Oops! Your score was too low. Wanna retry?
        </p>

        {/* Suggested Notes */}
        {recommendedNotes?.length > 0 && (
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
                  navigate(`/law/notes?grade=6-8&section=${note.topicId}`)
                }
                className="bg-yellow-400 text-black lilita-one-regular px-4 py-2 rounded-lg hover:bg-yellow-500 transition block mx-auto my-2"
              >
                Go to {note.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
        <img
          src="/financeGames6to8/retry.svg"
          alt="Retry"
          onClick={onRestart}
          className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
        <img
          src="/financeGames6to8/next-challenge.svg"
          alt="Next Challenge"
          onClick={onNextChallenge}
          className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
        />
      </div>
    </div>
  );
};

export default function CaseHear() {
  const { completeLawChallenge } = useLaw();
  const [gamePhase, setGamePhase] = useState("menu"); // menu, caseSelect, sideSelect, playing, result, final
  const [currentCase, setCurrentCase] = useState(0);
  const [selectedSide, setSelectedSide] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [selectedArgument, setSelectedArgument] = useState(null);
  const [correctArgument, setCorrectArgument] = useState(null);
  const [mistakes, setMistakes] = useState([]);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true);

  // collect mistakes
  const handleArgumentSelect = (argument, index) => {
    const caseData = cases[currentCase];
    const correctArg = caseData.sides[selectedSide].arguments.find(
      (arg) => arg.correct
    );

    if (argument === null) {
      // time ran out → mistake
      setMistakes((prev) => [
        ...prev,
        {
          caseId: caseData.id,
          caseTitle: caseData.title,
          law: caseData.law,
          text: "No argument chosen (time up)",
          correctAnswer: correctArg.text,
        },
      ]);
      setCorrectArgument(correctArg);
      setGamePhase("result");
      return;
    }

    setSelectedArgument(argument);
    setCorrectArgument(correctArg);

    if (argument.correct) {
      setScore((s) => s + argument.points);
    } else {
      setScore((s) => s + argument.points);
      // log mistake
      setMistakes((prev) => [
        ...prev,
        {
          caseId: caseData.id,
          caseTitle: caseData.title,
          law: caseData.law,
          text: argument.text,
          correctAnswer: correctArg.text,
        },
      ]);
    }

    setGamePhase("result");
  };

  // recommend notes when final screen appears
  useEffect(() => {
    if (gamePhase !== "final") return;
    if (mistakes.length > 0) {
      getLawNotesRecommendation(mistakes).then((notes) => {
        setRecommendedNotes(notes);
      });
    }
  }, [gamePhase, mistakes]);

  useEffect(() => {
    let timer;
    if (gamePhase === "playing" && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (gamePhase === "playing" && timeLeft === 0) {
      // Time up - select random argument
      const caseData = cases[currentCase];
      const sideData = caseData.sides[selectedSide];
      const randomArg =
        sideData.arguments[
          Math.floor(Math.random() * sideData.arguments.length)
        ];
      handleArgumentSelect(null, 0);
    }
    return () => clearTimeout(timer);
  }, [gamePhase, timeLeft, currentCase, selectedSide]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleCaseSelect = (caseIndex) => {
    setCurrentCase(caseIndex);
    setGamePhase("sideSelect");
  };

  const handleSideSelect = (side) => {
    setSelectedSide(side);
    setGamePhase("playing");
    setTimeLeft(20);
  };

  const handleContinue = () => {
    if (currentCase < cases.length - 1) {
      setCurrentCase(currentCase + 1);
      setSelectedSide(null);
      setGamePhase("sideSelect");
    } else {
      const endTime = Date.now();
      const timeTakenSec = Math.floor((endTime - startTime) / 1000);

      const maxScore = 12;
      const scaledScore = Math.round((score / maxScore) * 10); // out of 10
      const accuracyPercent = Math.round((score / maxScore) * 100); // out of 100

      updatePerformance({
        moduleName: "Law",
        topicName: "courtroomManerism",
        score: scaledScore,
        accuracy: accuracyPercent,
        avgResponseTimeSec: timeTakenSec / 3,
        studyTimeMinutes: Math.ceil(timeTakenSec / 60),
        completed: true,
      });
      setStartTime(Date.now());

      completeLawChallenge(2, 0);
      setGamePhase("final");
    }
  };

  const handleRestart = () => {
    setGamePhase("menu");
    setCurrentCase(0);
    setSelectedSide(null);
    setScore(0);
    setTimeLeft(20);
    setSelectedArgument(null);
    setCorrectArgument(null);
    setStartTime(Date.now());
  };

  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  return (
    <>
      <GameNav />
      <div
        className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-4"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        <div className="max-w-6xl mx-auto">
          <GameHeader
            score={score}
            currentCase={currentCase}
            gamePhase={gamePhase}
          />

          <div className="bg-[#202F364D] border border-white rounded-xl shadow-xl p-6 md:p-8">
            {gamePhase === "menu" && (
              <div className="text-center space-y-6">
                <div className="text-6xl animate-bounce mb-4">⚖️</div>
                <h1 className="text-3xl md:text-4xl font-bold text-white lilita-one-regular mb-4">
                  Welcome to Courtroom Clash!
                </h1>
                <p className="text-lg text-white lilita-one-regular max-w-2xl mx-auto mb-8">
                  Become a legal hero! Choose cases, pick sides, make arguments,
                  and learn the law while having fun! 🌟
                </p>
                <button
                  onClick={() => setGamePhase("caseSelect")}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 text-white lilita-one-regular px-8 py-4 rounded-xl text-xl font-bold hover:from-purple-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Start Your Legal Journey! 🚀
                </button>
              </div>
            )}

            {gamePhase === "caseSelect" && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white lilita-one-regular mb-4">
                    🎯 Pick a Case
                  </h2>
                  <p className="text-white lilita-one-regular ">
                    Choose a case to argue and become a legal hero!
                  </p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {cases.map((caseData, index) => (
                    <CaseCard
                      key={index}
                      caseData={caseData}
                      onSelect={handleCaseSelect}
                      index={index}
                      onChoose={() => {
                        setShowKidGif(true);
                        setTimeout(() => setShowKidGif(false), 1500); // auto-hide
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {gamePhase === "sideSelect" && (
              <SideSelection
                caseData={cases[currentCase]}
                onSelectSide={handleSideSelect}
                onChooseSide={() => {
                  setShowKidGif(true);
                  setTimeout(() => setShowKidGif(false), 1500); // hide after 1.5s
                }}
              />
            )}

            {gamePhase === "playing" && (
              <ArgumentSelection
                caseData={cases[currentCase]}
                selectedSide={selectedSide}
                onSelectArgument={handleArgumentSelect}
                timeLeft={timeLeft}
              />
            )}

            {gamePhase === "result" && (
              <ResultScreen
                selectedArgument={selectedArgument}
                correctArgument={correctArgument}
                caseData={cases[currentCase]}
                onContinue={handleContinue}
              />
            )}

            {gamePhase === "final" &&
              (score >= 9 ? (
                <WinScreen
                  score={score}
                  onRestart={handleRestart}
                  onNextChallenge={handleNextChallenge}
                  onFeedBack={handleViewFeedback}
                />
              ) : (
                <LoseScreen
                  score={score}
                  onRestart={() => {
                    setScore(0);
                    setCurrentCase(0);
                    setGamePhase("menu");
                  }}
                  onNextChallenge={() => {
                    handleNextChallenge();
                  }}
                  recommendedNotes={recommendedNotes} // ✅ pass state down
                  navigate={navigate} // ✅ pass navigate down
                />
              ))}
          </div>

          {/* 🎉 Celebration Footer (only for Q1 & Q2, auto-hide after 1.5s) */}
          <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
            {showKidGif && (
              <div
                className="absolute -top-24 sm:-top-30 transform -translate-x-1/2 z-50 flex items-start transition-opacity duration-500"
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

          {/* ✅ Popup */}
          <LevelCompletePopup
            isOpen={isPopupVisible}
            onConfirm={() => {
              setIsPopupVisible(false);
              navigate("/maze-of-choices"); // your next level
            }}
            onCancel={() => {
              setIsPopupVisible(false);
              navigate("/law/games"); // or exit route
            }}
            onClose={() => setIsPopupVisible(false)}
            title="Challenge Complete!"
            message="Are you ready for the next challenge?"
            confirmText="Next Challenge"
            cancelText="Exit"
          />

          {/* Instructions overlay */}
          {showInstructions && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <InstructionOverlay onClose={() => setShowInstructions(false)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
