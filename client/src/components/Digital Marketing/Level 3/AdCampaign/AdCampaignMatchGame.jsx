// AdCampaignMatchGame.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

const caps = [
  { id: "c1", name: "Baseball Cap" },
  { id: "c2", name: "Beanie" },
  { id: "c3", name: "Trucker Hat" },
  { id: "c4", name: "Snapback" },
];

const audience = [
  { id: "a1", label: "Teens" },
  { id: "a2", label: "Outdoor Workers" },
  { id: "a3", label: "Truck Drivers" },
  { id: "a4", label: "Urban Youth" },
];

const correctMatches = {
  c1: "a1",
  c2: "a2",
  c3: "a3",
  c4: "a4",
};

export default function AdCampaignMatchGame({completed, setCompleted}) {
  const [selectedCap, setSelectedCap] = useState(null);
  const [remainingCaps, setRemainingCaps] = useState(caps);
  const [remainingAudience, setRemainingAudience] = useState(audience);
  const [matches, setMatches] = useState([]);

  const handleOptionSelect = (option) => {
    if (!selectedCap) return;
    const isCorrect = correctMatches[selectedCap.id] === option.id;

    setMatches((prev) => [
      ...prev,
      { cap: selectedCap, audience: option, isCorrect },
    ]);
    setRemainingCaps((prev) => prev.filter((c) => c.id !== selectedCap.id));
    setRemainingAudience((prev) => prev.filter((a) => a.id !== option.id));
    setSelectedCap(null);
  };

  const handleResetMatch = (index) => {
    const pair = matches[index];
    setRemainingCaps((prev) => [...prev, pair.cap]);
    setRemainingAudience((prev) => [...prev, pair.audience]);
    setMatches((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-[95%] max-w-7xl mx-auto p-4 md:p-6 min-h-[50vh]">
      <div className="p-4 md:p-6 min-h-[60vh] rounded-2xl shadow-2xl bg-gradient-to-br from-yellow-200 to-yellow-200">
        <motion.h1
          initial={{ opacity: 0.3 }}
          animate={{ opacity: 1 }}
          transition={{
            duration: 0.4,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-6 text-purple-800"
        >
          🎯 Match the Caps to Their Audience!
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Caps */}
          <div>
            <h2 className="text-base lg:text-xl text-center font-semibold mb-3 text-blue-600">
              Caps
            </h2>
            {remainingCaps.map((cap, index) => (
              <div
                key={cap.id}
                onClick={() => setSelectedCap(cap)}
                className={`cursor-pointer p-3 md:p-4 rounded-xl mb-4 shadow-md text-center text-sm md:text-base font-medium ${
                  selectedCap?.id === cap.id
                    ? "bg-blue-300 text-white"
                    : "bg-blue-100 hover:bg-blue-200"
                }`}
              >
                {cap.name}
              </div>
            ))}
          </div>

          {/* Audience */}
          <div>
            <h2 className="text-base lg:text-xl text-center font-semibold mb-3 text-pink-600">
              Audience
            </h2>
            {remainingAudience.map((option) => (
              <div
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className="cursor-pointer p-3 md:p-4 rounded-xl mb-4 bg-pink-100 hover:bg-pink-200 text-sm md:text-base shadow-md text-center font-medium"
              >
                {option.label}
              </div>
            ))}
          </div>

          {/* Matches */}
          <div>
            <h2 className="text-base lg:text-xl text-center font-semibold mb-3 text-green-700">
              Your Matches
            </h2>
            {matches.map((pair, index) => (
              <div
                key={index}
                className={`p-3 md:p-4 mb-4 text-sm md:text-base rounded-xl shadow text-white text-center font-medium flex justify-between items-center ${
                  pair.isCorrect ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <span>
                  {pair.cap.name} ➡️ {pair.audience.label}
                </span>
                <button
                  onClick={() => handleResetMatch(index)}
                  className="ml-4 bg-white text-black px-2 py-1 rounded"
                >
                  ↩ Reset
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <button
          disabled={matches.length !== caps.length}
          onClick={() => setCompleted(true)}
          className={`px-6 py-2 rounded-lg text-lg font-semibold shadow-lg transition-all duration-300 ${
            matches.length === caps.length
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-400 text-gray-200 cursor-not-allowed"
          }`}
        >
          Finish
        </button>
      </div>
    </div>
  );
}
