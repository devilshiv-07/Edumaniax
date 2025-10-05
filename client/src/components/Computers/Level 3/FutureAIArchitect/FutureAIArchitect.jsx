import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Poster from "./Poster";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";

const loopAnim = {
  animate: { y: [0, -8, 0] },
  transition: { repeat: Infinity, duration: 2, ease: "easeInOut" },
};

const options = {
  problem: [
    { emoji: "🌊", label: "Clean oceans" },
    { emoji: "🌳", label: "Protect forests" },
    { emoji: "🍎", label: "Feed the hungry" },
    { emoji: "🏠", label: "Help homeless people" },
  ],
  name: [
    { emoji: "🤖", label: "OceanBot" },
    { emoji: "🧠", label: "SmartGuard" },
    { emoji: "🧹", label: "EcoSweeper" },
    { emoji: "🕵️", label: "DetectiveAI" },
  ],
  how: [
    { emoji: "🛰️", label: "Uses drones and sensors" },
    { emoji: "🔬", label: "Analyzes data in real-time" },
    { emoji: "🚗", label: "Drives itself and collects waste" },
  ],
  benefits: [
    { emoji: "🐢", label: "Saves animals" },
    { emoji: "😷", label: "Improves health" },
    { emoji: "🌍", label: "Helps the Earth" },
  ],
  risks: [
    { emoji: "🚫", label: "Collects wrong data" },
    { emoji: "🤖", label: "Goes out of control" },
    { emoji: "😬", label: "Misunderstands tasks" },
  ],
  safety: [
    { emoji: "👨‍🏫", label: "Human supervision" },
    { emoji: "🧪", label: "Lots of testing" },
    { emoji: "🔐", label: "Secure settings" },
  ],
};

export default function FutureAIArchitect() {
  const { completeComputersChallenge } = useComputers();
  const [challengeCompleted, setChallengeCompleted] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());

  const [formData, setFormData] = useState({
    problem: "",
    name: "",
    how: "",
    benefits: "",
    risks: "",
    safety: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  const handleBack = () => {
    setFormData({
      problem: "",
      name: "",
      how: "",
      benefits: "",
      risks: "",
      safety: "",
    });
    setSubmitted(false);
  };

  const handleSubmit = () => {
    if (Object.values(formData).every((v) => v !== "")) {
      setSubmitted(true);

      // ✅ Challenge completion only once
      if (!challengeCompleted) {
        completeComputersChallenge(2, 1);
        setChallengeCompleted(true);
      }

      // ✅ Always update performance
      const endTime = Date.now();
      const totalPrompts = 6; // 6 fields selected
      const avgResponseTimeSec = (endTime - startTime) / 1000 / totalPrompts;
      const studyTimeMinutes = Math.round((endTime - startTime) / 60000);

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
    }
  };

  const renderOptions = (fieldKey) => (
    <motion.div className="flex gap-4 flex-wrap justify-center">
      {options[fieldKey].map((item, index) => (
        <motion.div
          key={index}
          className={`cursor-pointer lilita-one-regular p-4 rounded-xl border-4 transition-all duration-300 w-40 h-28 flex flex-col items-center justify-center text-center text-lg font-semibold shadow-md ${
            formData[fieldKey] === item.label
              ? "border-blue-500 bg-blue-100"
              : "border-transparent bg-white"
          }`}
          whileHover={{ scale: 1.1 }}
          animate={{
            y: [0, -20, 10, -15, 5, 0], // varied bounce heights
            rotate: [0, 2, -2, 1, -1, 0], // subtle playful wobble
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          onClick={() => setFormData({ ...formData, [fieldKey]: item.label })}
        >
          <div className="text-3xl">{item.emoji}</div>
          <div>{item.label}</div>
        </motion.div>
      ))}
    </motion.div>
  );

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/ai-career-explorer");
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
        <div className="p-6 pt-20 md:pt-50 pb-28">
          {!submitted ? (
            <div className="grid gap-10 max-w-5xl mx-auto text-lg">
              <div>
                <p className="text-xl text-white lilita-one-regular mb-2">
                  🌍 What problem will your AI solve?
                </p>
                {renderOptions("problem")}
              </div>
              <div>
                <p className="text-xl text-white lilita-one-regular mb-2">
                  🤖 AI Solution Name
                </p>
                {renderOptions("name")}
              </div>
              <div>
                <p className="text-xl text-white lilita-one-regular mb-2">
                  🛠️ How does it work?
                </p>
                {renderOptions("how")}
              </div>
              <div>
                <p className="text-xl text-white lilita-one-regular mb-2">
                  🎁 Benefits
                </p>
                {renderOptions("benefits")}
              </div>
              <div>
                <p className="text-xl text-white lilita-one-regular mb-2">
                  ⚠️ Potential Risks
                </p>
                {renderOptions("risks")}
              </div>
              <div>
                <p className="text-xl text-white lilita-one-regular mb-2">
                  🛡️ Safety Measures
                </p>
                {renderOptions("safety")}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="bg-[#5f85974d] text-white lilita-one-regular text-xl py-3 px-6 rounded-full mt-4 mx-auto shadow-lg"
              >
                🎨 Create My AI Poster
              </motion.button>
            </div>
          ) : (
            <div className="mt-10">
              <Poster
                data={formData}
                onBack={handleBack}
                handleViewFeedback={handleViewFeedback}
                handleNextChallenge={handleNextChallenge}
              />
              <div className="text-center mt-6">
                <p className="text-xl font-bold text-green-600">
                  🏆 Badge Earned:{" "}
                  <span className="text-2xl">🚀 AI Innovator</span>
                </p>
              </div>
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
}
