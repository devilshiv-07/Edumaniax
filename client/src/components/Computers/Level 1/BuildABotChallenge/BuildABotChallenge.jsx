import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
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

  return (
    <div className="p-6 bg-gradient-to-br from-yellow-100 to-pink-100 min-h-screen flex flex-col items-center">
      <motion.h1
        className="text-4xl md:text-6xl font-extrabold text-center text-rose-600 mb-6 select-none"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 3 }}
      >
        🛠️ Build-A-Bot
      </motion.h1>

      {/* Step 1: Choose Bot Design */}
      {step === 1 && (
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-rose-600 mb-6 select-none text-center">
            🎭 Choose Your Bot Design
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {randomBotDesigns.map(({ name, icon }) => (
              <motion.div
                key={name}
                onClick={() => handleDesignSelect({ name, icon })}
                className={`p-6 rounded-3xl cursor-pointer shadow-md select-none text-center
                  ${
                    formData.design?.name === name
                      ? "bg-rose-400 text-white shadow-2xl"
                      : "bg-yellow-300 text-rose-800 hover:bg-yellow-400"
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
            className={`mt-10 w-full py-4 rounded-full text-white text-3xl font-extrabold tracking-wide
              ${
                formData.design
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 shadow-lg"
                  : "bg-gray-400 cursor-not-allowed"
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
          <h2 className="text-3xl font-bold text-rose-600 mb-6 text-center">
            ⚙️ Add Parts to Your Bot
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {availableParts.map((part) => (
              <motion.div
                key={part.name}
                onClick={() => handlePartToggle(part)}
                className={`p-6 rounded-3xl cursor-pointer shadow-md text-center
            ${
              formData.parts.some((p) => p.name === part.name)
                ? "bg-green-400 text-white shadow-2xl"
                : "bg-blue-200 text-blue-900 hover:bg-blue-300"
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
              className="bg-gray-400 text-white py-3 px-8 rounded-full shadow-md text-xl"
            >
              ← Back
            </motion.button>

            <motion.button
              onClick={nextStep}
              disabled={formData.parts.length === 0}
              whileHover={{ scale: formData.parts.length ? 1.1 : 1 }}
              className={`py-3 px-8 rounded-full text-white text-xl font-bold shadow-lg
          ${
            formData.parts.length
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gray-400 cursor-not-allowed"
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
          <h2 className="text-3xl font-bold text-rose-600 mb-4 select-none text-center">
            ✍️ Tell Us About Your Bot
          </h2>

          <label className="flex flex-col group">
            <span className="text-2xl mb-1 select-none">
              🤖 <strong>Bot Name</strong>
            </span>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. HelperBot"
              className="p-4 rounded-3xl border-4 border-pink-300 focus:border-rose-500 focus:ring-4 focus:ring-rose-300 transition duration-300 text-xl placeholder-pink-200 shadow-lg bg-gradient-to-r from-yellow-50 to-pink-50 outline-none"
            />
          </label>

          <label className="flex flex-col group">
            <span className="text-2xl mb-1 select-none">
              💡 <strong>What it does</strong>
            </span>
            <input
              name="function"
              value={formData.function}
              onChange={handleChange}
              placeholder="e.g. Helps with homework"
              className="p-4 rounded-3xl border-4 border-yellow-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-300 transition duration-300 text-lg placeholder-yellow-300 shadow-md bg-gradient-to-r from-pink-50 to-yellow-50 outline-none"
            />
          </label>

          <label className="flex flex-col group">
            <span className="text-2xl mb-1 select-none">
              👨‍👩‍👧‍👦 <strong>Who it helps</strong>
            </span>
            <input
              name="audience"
              value={formData.audience}
              onChange={handleChange}
              placeholder="e.g. Students"
              className="p-4 rounded-3xl border-4 border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-300 transition duration-300 text-lg placeholder-green-300 shadow-md bg-gradient-to-r from-yellow-50 to-green-50 outline-none"
            />
          </label>

          <label className="flex flex-col group">
            <span className="text-2xl mb-1 select-none">
              📚 <strong>What it learns</strong>
            </span>
            <input
              name="learning"
              value={formData.learning}
              onChange={handleChange}
              placeholder="e.g. Your learning style"
              className="p-4 rounded-3xl border-4 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-300 transition duration-300 text-lg placeholder-blue-300 shadow-md bg-gradient-to-r from-green-50 to-blue-50 outline-none"
            />
          </label>

          <label className="flex flex-col group">
            <span className="text-2xl mb-1 select-none">
              🗯️ <strong>Catchy phrase or sound</strong>
            </span>
            <input
              name="phrase"
              value={formData.phrase}
              onChange={handleChange}
              placeholder="e.g. Beep Boop!"
              className="p-4 rounded-3xl border-4 border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-300 transition duration-300 text-lg placeholder-purple-300 shadow-md bg-gradient-to-r from-blue-50 to-purple-50 outline-none"
            />
          </label>

          <label className="flex flex-col group">
            <span className="text-2xl mb-1 select-none">
              💥 <strong>Special power</strong>
            </span>
            <input
              name="power"
              value={formData.power}
              onChange={handleChange}
              placeholder="e.g. Shoots bubbles"
              className="p-4 rounded-3xl border-4 border-yellow-400 focus:border-yellow-600 focus:ring-4 focus:ring-yellow-400 transition duration-300 text-lg placeholder-yellow-300 shadow-md bg-gradient-to-r from-pink-50 to-yellow-50 outline-none"
            />
          </label>

          <div className="flex justify-between mt-6">
            <motion.button
              onClick={prevStep}
              whileHover={{ scale: 1.1 }}
              className="bg-gray-400 text-white py-3 px-8 rounded-full shadow-md text-xl"
            >
              ← Back
            </motion.button>

            <motion.button
              onClick={nextStep}
              whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
              className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-3 px-8 rounded-full shadow-lg text-xl font-extrabold"
            >
              🎨 Build My Bot
            </motion.button>
          </div>
        </div>
      )}

      {/* Step 4: Show Bot */}
      {step === 4 && (
        <div className="text-center mt-12 px-4 max-w-lg mx-auto select-none">
          <h2 className="text-5xl font-extrabold text-pink-600 mb-8 drop-shadow-md">
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

          <p className="text-4xl font-extrabold mb-3 text-purple-700">
            {formData.design.name} —{" "}
            <span className="italic text-3xl text-pink-500">
              "{formData.phrase}"
            </span>
          </p>

          <div className="text-2xl space-y-3 max-w-xl mx-auto rounded-xl bg-gradient-to-r from-pink-100 via-yellow-100 to-green-100 p-6 shadow-lg border-4 border-pink-300">
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

          <p className="mt-10 text-3xl font-bold text-green-700 drop-shadow-lg">
            🏆 Badge Earned:{" "}
            <span className="text-5xl" role="img" aria-label="Robot Badge">
              🤖 Bot Builder
            </span>
          </p>

          <motion.button
            whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
            whileTap={{ scale: 0.95, rotate: 0 }}
            onClick={resetAll}
            className="mt-10 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-2xl py-4 px-10 rounded-full shadow-xl hover:shadow-pink-400/80 focus:outline-none focus:ring-4 focus:ring-pink-300"
          >
            🔄 Start Over
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default BuildABotChallenge;
