import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Puzzle,
  Rocket,
  Settings,
  Shield,
  Target,
} from "lucide-react";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import InstructionOverlay from "./InstructionOverlay";
const careers = [
  {
    title: "🤖 AI Engineer",
    description: "Builds smart machines and algorithms",
  },
  { title: "📊 Data Scientist", description: "Finds patterns in big data" },
  {
    title: "🛠️ Robot Designer",
    description: "Creates robots that can move and think",
  },
  {
    title: "🧠 AI Ethics Specialist",
    description: "Makes sure AI is fair and safe",
  },
];

const interestEmojis = [
  "😴",
  "😐",
  "🙂",
  "😊",
  "😃",
  "😄",
  "😁",
  "😆",
  "🤩",
  "🚀",
];

export default function AICareerExplorerGame() {
  const { completeComputersChallenge } = useComputers();
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());

  const [careerData, setCareerData] = useState(
    careers.map((c) => ({ ...c, skills: "", aiHelps: "", interest: "" }))
  );
  const [reflection, setReflection] = useState({
    favorite: "",
    skillsToLearn: "",
    preparation: "",
  });
  const [step, setStep] = useState(1);
  const [showIntro, setShowIntro] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  const handleChange = (index, field, value) => {
    const updated = [...careerData];
    if (field === "interest") {
      if (value === "" || (Number(value) >= 1 && Number(value) <= 10)) {
        updated[index][field] = value;
      }
    } else {
      updated[index][field] = value;
    }
    setCareerData(updated);
  };

  const handleReflectionChange = (field, value) => {
    setReflection({ ...reflection, [field]: value });
  };

  const handleSubmit = () => {
    const allInterestValid = careerData.every((career) => {
      const val = Number(career.interest);
      return val >= 1 && val <= 10;
    });

    const allReflectionFilled = Object.values(reflection).every(
      (val) => val.trim() !== ""
    );

    if (!allInterestValid || !allReflectionFilled) {
      toast.error("Please fill all the fields before submitting.");
      return;
    }

    if (!challengeCompleted) {
      completeComputersChallenge(2, 2);
      setChallengeCompleted(true);
    }
    // ✅ Performance tracking
    const endTime = Date.now();
    const studyTimeMinutes = Math.round((endTime - startTime) / 60000);
    const avgResponseTimeSec =
      (endTime - startTime) / 1000 / (careerData.length + 3); // 3 reflections

    updatePerformance({
      moduleName: "Computers",
      topicName: "aIFuturesAndPossibilities",
      score: 10,
      accuracy: 100,
      avgResponseTimeSec,
      studyTimeMinutes,
      completed: true,
    });
    setStartTime(Date.now());
    setStep(2);
  };

  const getRecommendedCareer = () => {
    let maxInterest = -1;
    let recommendedCareer = null;
    careerData.forEach((career) => {
      const val = Number(career.interest);
      if (val > maxInterest) {
        maxInterest = val;
        recommendedCareer = career.title;
      }
    });

    if (maxInterest < 3) {
      return "Your interest levels seem low. Keep exploring AI careers to find what excites you!";
    }

    return `Based on your interest levels, we recommend: ${recommendedCareer}`;
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  const handlePlayAgain = () => {
    // Reset all career inputs
    setCareerData(
      careers.map((c) => ({
        ...c,
        skills: "",
        aiHelps: "",
        interest: "",
      }))
    );

    // Reset reflection inputs
    setReflection({
      favorite: "",
      skillsToLearn: "",
      preparation: "",
    });

    // Reset step to the beginning
    setStep(1);

    // Reset challenge timing
    setStartTime(Date.now());

    // Hide any popups or feedback
    setShowFeedback(false);
    setIsPopupVisible(false);

    // Reset challenge completion
    setChallengeCompleted(false);

    // Optional toast feedback
    toast.success("Game reset! Ready to try again 🚀");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E]">
        <div className="p-6 max-w-7xl mx-auto rounded-3xl shadow-2xl pt-20 md:pt-50 pb-28">
          {step === 1 && (
            <>
              <p className="text-xl text-center text-white lilita-one-regular mb-8 font-semibold">
                🌟 Explore exciting careers in AI and reflect on your future!
              </p>

              <div className="overflow-x-auto border border-white rounded-xl">
                <table className="w-full bg-[#202F364D] rounded-xl shadow-lg">
                  <thead className="bg-[#657f8a4d] text-white text-lg lilita-one-regular">
                    <tr>
                      <th className="p-3 rounded-tl-xl">Career</th>
                      <th className="p-3">What They Do</th>
                      <th className="p-3">Skills Needed</th>
                      <th className="p-3">How AI Helps</th>
                      <th className="p-3 rounded-tr-xl">Interest</th>
                    </tr>
                  </thead>
                  <tbody>
                    {careerData.map((career, i) => {
                      const interestNum = Number(career.interest);
                      return (
                        <tr
                          key={career.title}
                          className="text-white lilita-one-regular hover:bg-purple-50"
                        >
                          {/* Title cell */}
                          <td className="p-3 font-extrabold text-xl hover:text-black">
                            {career.title}
                          </td>

                          {/* Description cell */}
                          <td className="p-3 italic text-purple-700 hover:text-black">
                            {career.description}
                          </td>

                          {/* Skills input */}
                          <td className="p-2">
                            <input
                              type="text"
                              className="w-full rounded-lg border border-purple-50 p-2 text-black"
                              value={career.skills}
                              placeholder="e.g., Coding, Math, Design"
                              onChange={(e) =>
                                handleChange(i, "skills", e.target.value)
                              }
                            />
                          </td>

                          {/* AI Helps input */}
                          <td className="p-2">
                            <input
                              type="text"
                              className="w-full rounded-lg border border-purple-300 p-2 text-black"
                              value={career.aiHelps}
                              placeholder="e.g., Automates tasks, finds patterns"
                              onChange={(e) =>
                                handleChange(i, "aiHelps", e.target.value)
                              }
                            />
                          </td>

                          {/* Interest + Emoji */}
                          <td className="p-2 text-center">
                            <div className="inline-flex items-center space-x-3">
                              <input
                                type="number"
                                min="1"
                                max="10"
                                className="w-20 rounded-xl border-2 border-purple-500 p-2 text-center font-bold text-black"
                                value={career.interest}
                                placeholder="1-10"
                                onChange={(e) =>
                                  handleChange(i, "interest", e.target.value)
                                }
                              />
                              <span className="text-3xl">
                                {interestNum >= 1 && interestNum <= 10
                                  ? interestEmojis[interestNum - 1]
                                  : "❓"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-10">
                <h2 className="text-2xl font-bold text-white lilita-one-regular mb-4">
                  🎈 Reflection
                </h2>
                <div className="space-y-4">
                  <textarea
                    className="w-full border-2 border-purple-400 bg-purple-50 rounded-lg p-3"
                    placeholder="Which career interests you the most?"
                    value={reflection.favorite}
                    onChange={(e) =>
                      handleReflectionChange("favorite", e.target.value)
                    }
                  />
                  <textarea
                    className="w-full border-2 border-purple-400 bg-purple-50 rounded-lg p-3"
                    placeholder="What skills would you like to develop?"
                    value={reflection.skillsToLearn}
                    onChange={(e) =>
                      handleReflectionChange("skillsToLearn", e.target.value)
                    }
                  />
                  <textarea
                    className="w-full border-2 border-purple-400 bg-purple-50 rounded-lg p-3"
                    placeholder="How will you prepare for an AI-powered future?"
                    value={reflection.preparation}
                    onChange={(e) =>
                      handleReflectionChange("preparation", e.target.value)
                    }
                  />
                </div>
              </div>

              <motion.button
                onClick={handleSubmit}
                className="mt-8 px-10 py-4 bg-[#5c78854d] text-white lilita-one-regular text-2xl rounded-full font-extrabold shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                🎯 Submit My AI Career Path
              </motion.button>
            </>
          )}

          {step === 2 && (
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
              {/* Celebration + Poster */}
              <div className="flex flex-col items-center justify-center flex-1 p-6 overflow-y-auto">
                {/* Trophy / Celebration GIFs */}
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
                  🎉 Poster Complete!
                </h2>
                <p className="text-[#FFCC00] mt-3 text-lg sm:text-xl font-semibold max-w-2xl">
                  Amazing work, Innovator! 🌟 Your Future AI Vision is ready to
                  inspire the world 🚀
                </p>

                {/* Badge Earned */}
                <div className="mt-5 flex flex-col items-center">
                  <p className="text-white text-lg font-bold mb-1">
                    🏅 Badge Earned
                  </p>
                  <span className="text-yellow-400 text-2xl lilita-one-regular">
                    🚀 AI Innovator
                  </span>
                </div>

                <motion.div
                  className="mt-12 mx-auto w-full max-w-2xl text-center p-6 bg-gradient-to-br from-green-200 to-green-400 rounded-2xl shadow-2xl"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1.05 }}
                  transition={{ duration: 1.2 }}
                >
                  <h2 className="text-4xl font-extrabold text-purple-900 mb-4">
                    🌟 Career Match Recommendation
                  </h2>
                  <motion.p
                    className="text-3xl font-extrabold italic mb-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent text-center drop-shadow-xl"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  >
                    🏅 Your Golden Career Match:
                    <br /> {getRecommendedCareer()} ✨
                  </motion.p>

                  <div className="text-5xl mb-3 animate-pulse">🏆</div>
                  <div className="text-3xl font-extrabold text-white mb-2">
                    You earned the badge:
                  </div>
                  <div className="text-6xl mb-4">💼 Future Ready!</div>
                  <p className="font-semibold text-white text-lg mb-4">
                    Keep exploring and learning about AI! 🚀
                  </p>
                </motion.div>
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

              {/* ✅ Popup here */}
              <LevelCompletePopup
                isOpen={isPopupVisible}
                onConfirm={() => {
                  setIsPopupVisible(false);
                  navigate("/courses"); // your next level
                }}
                onCancel={() => {
                  setIsPopupVisible(false);
                  navigate("/computer/games"); // or exit route
                }}
                onClose={() => setIsPopupVisible(false)}
                title="Challenge Complete!"
                message="Are you ready for the next challenge?"
                confirmText="Next Challenge"
                cancelText="Exit"
              />
            </div>
          )}
        </div>
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
