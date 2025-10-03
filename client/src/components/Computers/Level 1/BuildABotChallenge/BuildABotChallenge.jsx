import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import InstructionOverlay from "./InstructionOverlay";
const randomBotDesigns = [
  { name: "Round Head Bot", icon: "🤖" },
  { name: "UFO Drone Bot", icon: "🛸" },
  { name: "Cat-Ear Bot", icon: "🐱" },
  { name: "Muscle Bot", icon: "🦾" },
  { name: "Fancy Bot", icon: "🎩" },
  { name: "Star Glider Bot", icon: "🌟" },
  { name: "Lightning Speed Bot", icon: "⚡" },
  { name: "Rainbow Spark Bot", icon: "🌈" },
  { name: "Painter Bot", icon: "🎨" },
  { name: "Rocket Jet Bot", icon: "🚀" },
  { name: "Rocker Bot", icon: "🎸" },
  { name: "Puzzle Solver Bot", icon: "🧩" },
  { name: "Ice Cream Bot", icon: "🍦" },
  { name: "Balloon Bot", icon: "🎈" },
  { name: "Dragon Flame Bot", icon: "🐉" },
  { name: "Gamer Bot", icon: "🎮" },
];

const animatedBotVariants = {
  animate: {
    rotate: [0, 10, -10, 10, 0],
    scale: [1, 1.1, 1.1, 1, 1],
    transition: {
      repeat: Infinity,
      duration: 4,
      ease: "easeInOut",
    },
  },
};

const availableParts = [
  { name: "Microphone", icon: "🎤" },
  { name: "Camera", icon: "📷" },
  { name: "Speaker", icon: "🔊" },
  { name: "Wheels", icon: "🛞" },
  { name: "Memory", icon: "💾" },
  { name: "Sensors", icon: "👀" },
];

const BuildABotChallenge = () => {
  const { completeComputersChallenge } = useComputers();
  // Step control: 1 = design, 2 = details, 3 = result
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    function: "",
    audience: "",
    learning: "",
    phrase: "",
    power: "",
    design: null,
    parts: [], // NEW
  });

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  const handleDesignSelect = (design) => {
    setFormData((prev) => ({ ...prev, design }));
  };

  // toggle parts selection
  const handlePartToggle = (part) => {
    setFormData((prev) => {
      const alreadySelected = prev.parts.find((p) => p.name === part.name);
      if (alreadySelected) {
        return {
          ...prev,
          parts: prev.parts.filter((p) => p.name !== part.name),
        };
      } else {
        return { ...prev, parts: [...prev.parts, part] };
      }
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateStep2 = () => {
    const { name, function: fn, audience, learning, phrase, power } = formData;
    return [name, fn, audience, learning, phrase, power].every(
      (field) => field && field.trim() !== ""
    );
  };

  const validateStep3 = () => {
    const { name, function: fn, audience, learning, phrase, power } = formData;
    return [name, fn, audience, learning, phrase, power].every(
      (field) => field && field.trim() !== ""
    );
  };
  const nextStep = () => {
    if (step === 1 && formData.design) {
      setStep(2);
    } else if (step === 2 && formData.parts.length > 0) {
      setStep(3);
    } else if (step === 3) {
      if (validateStep3()) {
        setStep(4);
      } else {
        alert("Please fill in all fields!");
      }
    }
  };

  const prevStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 4) setStep(3);
  };

  const resetAll = () => {
    setFormData({
      name: "",
      function: "",
      audience: "",
      learning: "",
      phrase: "",
      power: "",
      design: null,
    });
    setStep(1);
    setStartTime(Date.now());
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  useEffect(() => {
    if (step === 4) {
      completeComputersChallenge(0, 2);

      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);

      updatePerformance({
        moduleName: "Computers",
        topicName: "introductionToAI",
        score: 10,
        accuracy: 100,
        avgResponseTimeSec: totalSeconds / 6,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: true,
      });
      setStartTime(Date.now());
    }
  }, [step]);

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
      <div className="p-6 bg-[#0A160E] pt-20 md:pt-50 pb-28 min-h-screen flex flex-col items-center">
        {/* Step 1: Choose Bot Design */}
        {step === 1 && (
          <div className="max-w-4xl mx-auto w-full">
            <h2 className="text-3xl text-white lilita-one-regular mb-6 select-none text-center">
              🎭 Choose Your Bot Design
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {randomBotDesigns.map(({ name, icon }) => (
                <motion.div
                  key={name}
                  onClick={() => handleDesignSelect({ name, icon })}
                  className={`p-6 border border-white rounded-3xl cursor-pointer shadow-md select-none text-center
                  ${
                    formData.design?.name === name
                      ? "bg-[#91a4ad4d] lilita-one-regular text-white shadow-2xl"
                      : "bg-[#202F364D] text-white lilita-one-regular hover:bg-[#2b93c44d]"
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={{ y: [0, -10, 5, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="text-8xl mb-3">{icon}</div>
                  <div className="text-2xl font-bold">{name}</div>
                </motion.div>
              ))}
            </div>

            <motion.button
              onClick={nextStep}
              disabled={!formData.design}
              whileHover={{ scale: formData.design ? 1.1 : 1 }}
              className={`mt-10 w-full py-4 rounded-xl text-white text-3xl lilita-one-regular tracking-wide
              ${
                formData.design
                  ? "bg-[#648a9b4d] shadow-lg"
                  : "bg-[#505b614d] cursor-not-allowed"
              }
            `}
            >
              ➡️ Next: Bot Details
            </motion.button>
          </div>
        )}

        {/* Step 2: Choose Bot Parts */}
        {step === 2 && (
          <div className="max-w-3xl mx-auto w-full">
            <h2 className="text-3xl font-bold text-white lilita-one-regular mb-6 text-center">
              ⚙️ Add Parts to Your Bot
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {availableParts.map((part) => (
                <motion.div
                  key={part.name}
                  onClick={() => handlePartToggle(part)}
                  className={`p-6 border border-white rounded-3xl cursor-pointer shadow-md text-center
            ${
              formData.parts.some((p) => p.name === part.name)
                ? "bg-green-400 text-white lilita-one-regular text-outline shadow-2xl"
                : "bg-[#202F364D] text-white lilita-one-regular hover:bg-blue-300"
            }`}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="text-6xl mb-3">{part.icon}</div>
                  <div className="text-xl font-bold">{part.name}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <motion.button
                onClick={prevStep}
                whileHover={{ scale: 1.1 }}
                className="bg-[#34596a4d] text-white lilita-one-regular py-3 px-8 rounded-full shadow-md text-xl"
              >
                ← Back
              </motion.button>

              <motion.button
                onClick={nextStep}
                disabled={formData.parts.length === 0}
                whileHover={{ scale: formData.parts.length ? 1.1 : 1 }}
                className={`py-3 px-8 rounded-full lilita-one-regular text-white text-xl font-bold shadow-lg
          ${
            formData.parts.length
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-[#505b614d] cursor-not-allowed"
          }`}
              >
                ✍️ Next: Bot Details
              </motion.button>
            </div>
          </div>
        )}

        {/* Step 3: Input Bot Details */}
        {step === 3 && (
          <div className="max-w-xl mx-auto w-full space-y-6">
            <h2 className="text-3xl font-bold text-white lilita-one-regular mb-4 select-none text-center">
              ✍️ Tell Us About Your Bot
            </h2>

            <label className="flex flex-col group">
              <span className="text-2xl text-white lilita-one-regular mb-1 select-none">
                🤖 <strong>Bot Name</strong>
              </span>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. HelperBot"
                className="p-4 text-black rounded-3xl border-4 border-pink-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-300 transition duration-300 text-xl placeholder-black shadow-lg bg-gradient-to-r from-yellow-50 to-pink-50 outline-none"
              />
            </label>

            <label className="flex flex-col group">
              <span className="text-2xl text-white lilita-one-regular mb-1 select-none">
                💡 <strong>What it does</strong>
              </span>
              <input
                name="function"
                value={formData.function}
                onChange={handleChange}
                placeholder="e.g. Helps with homework"
                className="p-4 rounded-3xl text-black border-4 border-yellow-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-300 transition duration-300 text-lg placeholder-black shadow-md bg-gradient-to-r from-pink-50 to-yellow-50 outline-none"
              />
            </label>

            <label className="flex flex-col group">
              <span className="text-2xl mb-1 select-none text-white lilita-one-regular">
                👨‍👩‍👧‍👦 <strong>Who it helps</strong>
              </span>
              <input
                name="audience"
                value={formData.audience}
                onChange={handleChange}
                placeholder="e.g. Students"
                className="p-4 rounded-3xl border-4 border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-300 transition duration-300 text-lg placeholder-black shadow-md bg-gradient-to-r from-yellow-50 to-green-50 outline-none"
              />
            </label>

            <label className="flex flex-col group">
              <span className="text-2xl mb-1 select-none text-white lilita-one-regular">
                📚 <strong>What it learns</strong>
              </span>
              <input
                name="learning"
                value={formData.learning}
                onChange={handleChange}
                placeholder="e.g. Your learning style"
                className="p-4 rounded-3xl border-4 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-300 transition duration-300 text-lg placeholder-black shadow-md bg-gradient-to-r from-green-50 to-blue-50 outline-none"
              />
            </label>

            <label className="flex flex-col group">
              <span className="text-2xl mb-1 select-none text-white lilita-one-regular">
                🗯️ <strong>Catchy phrase or sound</strong>
              </span>
              <input
                name="phrase"
                value={formData.phrase}
                onChange={handleChange}
                placeholder="e.g. Beep Boop!"
                className="p-4 rounded-3xl border-4 border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-300 transition duration-300 text-lg placeholder-black shadow-md bg-gradient-to-r from-blue-50 to-purple-50 outline-none"
              />
            </label>

            <label className="flex flex-col group">
              <span className="text-2xl mb-1 select-none text-white lilita-one-regular">
                💥 <strong>Special power</strong>
              </span>
              <input
                name="power"
                value={formData.power}
                onChange={handleChange}
                placeholder="e.g. Shoots bubbles"
                className="p-4 rounded-3xl border-4 border-yellow-400 focus:border-yellow-600 focus:ring-4 focus:ring-yellow-400 transition duration-300 text-lg placeholder-black shadow-md bg-gradient-to-r from-pink-50 to-yellow-50 outline-none"
              />
            </label>

            <div className="flex justify-between mt-6">
              <motion.button
                onClick={prevStep}
                whileHover={{ scale: 1.1 }}
                className="bg-gray-400 text-white lilita-one-regular py-3 px-8 rounded-full shadow-md text-xl"
              >
                ← Back
              </motion.button>

              <motion.button
                onClick={nextStep}
                whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 px-8 rounded-full shadow-lg text-xl lilita-one-regular"
              >
                🎨 Build My Bot
              </motion.button>
            </div>
          </div>
        )}

        {/* Step 4: Show Bot */}
        {step === 4 && (
          <div className="text-center mt-12 px-4 max-w-lg mx-auto select-none">
            <h2 className="text-5xl text-white lilita-one-regular mb-8 drop-shadow-md">
              🎉 Here's Your Bot!
            </h2>

            <motion.div
              className="text-[14rem] mb-8"
              variants={animatedBotVariants}
              animate="animate"
              aria-label="Bot Icon"
            >
              {formData.design.icon}
            </motion.div>

            <p className="text-4xl lilita-one-regular mb-3 text-purple-700">
              {formData.design.name} —{" "}
              <span className="italic text-3xl text-pink-500">
                "{formData.phrase}"
              </span>
            </p>

            <div className="text-2xl lilita-one-regular space-y-3 max-w-xl mx-auto rounded-xl bg-gradient-to-r from-pink-100 via-yellow-100 to-green-100 p-6 shadow-lg border-4 border-pink-300">
              <p>
                👥 <strong className="text-pink-600">Helps:</strong>{" "}
                {formData.audience}
              </p>
              <p>
                ⚙️ <strong className="text-yellow-600">Does:</strong>{" "}
                {formData.function}
              </p>
              <p>
                📖 <strong className="text-green-600">Learns:</strong>{" "}
                {formData.learning}
              </p>
              <p>
                💥 <strong className="text-red-600">Special Power:</strong>{" "}
                {formData.power}
              </p>
            </div>

            <p className="mt-10 text-3xl lilita-one-regular text-green-700 drop-shadow-lg">
              🏆 Badge Earned:{" "}
              <span className="text-5xl" role="img" aria-label="Robot Badge">
                🤖 Bot Builder
              </span>
            </p>

            <div className="min-h-screen bg-[#0A160E] flex flex-col justify-between">
              {/* Center Content */}
              <div className="flex flex-col items-center justify-center flex-1 p-6">
                {/* 🎉 Celebration Trophy GIFs */}
                <div className="relative w-64 h-64 flex items-center justify-center mb-8">
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

                {/* 🌟 Insight Box */}
                <div className="mt-8 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-72 sm:w-96">
                  <p className="text-black text-sm font-bold mb-1 mt-2">
                    INSIGHT
                  </p>
                  <div className="bg-[#131F24] flex-1 rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
                    <p
                      className="text-[#FFCC00] font-bold leading-relaxed"
                      style={{
                        fontSize: "clamp(0.8rem, 1vw, 1rem)",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                      }}
                    >
                      🌟 Great job! You built an amazing bot that’s ready to
                      shine!
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer (Sticky Full Width) */}
              <div className="w-full fixed bottom-0 left-0 bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/feedback.svg"
                  alt="Feedback"
                  onClick={handleViewFeedback}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={resetAll}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/next-challenge.svg"
                  alt="Next Challenge"
                  onClick={handleNextChallenge}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>

            {/* ✅ Popup here */}
            <LevelCompletePopup
              isOpen={isPopupVisible}
              onConfirm={() => {
                setIsPopupVisible(false);
                navigate("/train-the-brain"); // your next level
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

export default BuildABotChallenge;
