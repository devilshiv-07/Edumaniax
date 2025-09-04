import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance

const scenariosData = [
  {
    id: 1,
    sentence: "The teacher gives instructions during a fire drill siren.",
    correctWord: "fire drill siren.",
    correctBarrier: "🧱 Noise"
  },
  {
    id: 2,
    sentence: " One student speaks in technical terms while the other doesn't understand.",
    correctWord: "technical terms",
    correctBarrier: "🗣️ Language"
  },
  {
    id: 3,
    sentence: "A student tries to present while anxious and sweating.",
    correctWord: "anxious and sweating.",
    correctBarrier: "💓 Emotions"
  }
];

const barriers = ["🧱 Noise", "🗣️ Language", "💓 Emotions"];

const WhatWentWrongGame = () => {
  const { completeCommunicationChallenge } = useCommunication();
  const [selections, setSelections] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const { updatePerformance } = usePerformance();
  const [startTime,setStartTime] = useState(Date.now());
  //for performance
  useEffect(() => {
    if (showResult && !challengeCompleted) {
      const total = scenariosData.length;
      let correctCount = 0;

      scenariosData.forEach((s) => {
        if (isCorrect(s.id)) correctCount++;
      });

      const allCorrect = correctCount === total;
      const timeTakenSec = Math.floor((Date.now() - startTime) / 1000);

      updatePerformance({
        moduleName: "Communication",
        topicName: "communicationSkills",
        score: Math.round(correctCount * (10 / total)), // Score scaled to 10
        accuracy: Math.round((correctCount / total) * 100),
        avgResponseTimeSec: timeTakenSec,
        studyTimeMinutes: Math.ceil(timeTakenSec / 60),
        completed: allCorrect,
        
      });
      setStartTime(Date.now());


      if (allCorrect) {
        completeCommunicationChallenge(0, 2);
        setChallengeCompleted(true);
      }
    }
  }, [showResult]);




  const handleWordClick = (scenarioId, word) => {
    setSelections((prev) => {
      const selectedWords = prev[scenarioId]?.selectedWords || [];
      const newSelection = selectedWords.includes(word)
        ? selectedWords.filter((w) => w !== word)
        : [...selectedWords, word];

      return {
        ...prev,
        [scenarioId]: {
          ...prev[scenarioId],
          selectedWords: newSelection
        }
      };
    });
  };


  const handleBarrierClick = (scenarioId, barrier) => {
    setSelections((prev) => ({
      ...prev,
      [scenarioId]: { ...prev[scenarioId], selectedBarrier: barrier }
    }));
  };

  const isCorrect = (id) => {
    const s = selections[id];
    const selectedPhrase = (s?.selectedWords || []).join(" ");
    const correctPhrase = scenariosData.find((sc) => sc.id === id).correctWord;
    return selectedPhrase === correctPhrase && s?.selectedBarrier === scenariosData.find((sc) => sc.id === id).correctBarrier;
  };


  const handleSubmit = () => setShowResult(true);
  const handleReplay = () => {
    setSelections({});
    setShowResult(false);
    setStartTime(Date.now());

  };

  return (
    <div className="p-6 max-w-4xl mx-auto my-6 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-xl shadow-xl text-center">
      <motion.h1
        className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-700 drop-shadow"
        animate={{ scale: [1, 1.05, 1], rotate: [0, 1, -1, 0] }}
        transition={{ repeat: Infinity, duration: 4 }}
      >
        ❗ What Went Wrong? 🕵️‍♂️
      </motion.h1>

      <p className="text-lg text-purple-800 mt-2 font-semibold">
        🕵️‍♂️ Step 1: Tap the words where you think the communication broke! <br />
        🚧 Step 2: Pick the barrier that caused the problem (like Noise, Emotions, or Language)! 🎯
      </p>

      <div className="mt-10 space-y-10">
        {scenariosData.map((scenario) => (
          <motion.div
            key={scenario.id}
            className="bg-gradient-to-br from-yellow-50 to-pink-100 p-6 rounded-xl border-4 border-purple-200 shadow-lg"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-left text-lg font-bold text-purple-700 mb-2">
              📝 Scenario {scenario.id}:
            </p>

            <p className="text-lg space-x-2 text-gray-800 leading-relaxed">
              {scenario.sentence.split(" ").map((word, i) => {
                const cleanWord = word.trim();
                const selectedWords = selections[scenario.id]?.selectedWords || [];
                const isSelected = selectedWords.includes(cleanWord);

                return (
                  <button
                    key={i}
                    onClick={() => handleWordClick(scenario.id, cleanWord)}
                    className={`px-1 py-0.5 rounded-md transition-all duration-300 mx-0.5 ${isSelected
                      ? 'bg-yellow-300 font-bold underline decoration-purple-600 decoration-2 scale-105'
                      : 'hover:bg-yellow-100'
                      }`}
                  >
                    <span>{word}</span>
                  </button>
                );
              })}
            </p>

            <p className="mt-4 text-purple-800 font-semibold text-center">
              🎯 Choose the Communication Barrier:
            </p>
            <div className="flex flex-wrap justify-center mt-3 gap-4">
              {barriers.map((barrier) => (
                <motion.button
                  key={barrier}
                  onClick={() => handleBarrierClick(scenario.id, barrier)}
                  className={`px-5 py-2 text-white rounded-full font-semibold shadow-md transition-all duration-300 ${selections[scenario.id]?.selectedBarrier === barrier
                    ? 'bg-green-500 scale-110'
                    : 'bg-blue-400 hover:bg-blue-500'
                    }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {barrier === '🧱 Noise' && '🔊 Noise'}
                  {barrier === '🗣️ Language' && '🗣️ Language'}
                  {barrier === '💓 Emotions' && '💓 Emotions'}
                </motion.button>
              ))}
            </div>

            {showResult && (
              <motion.p
                className={`mt-4 text-xl font-bold text-center ${isCorrect(scenario.id) ? 'text-green-600' : 'text-red-500'
                  }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {isCorrect(scenario.id)
                  ? '✅ Awesome! You nailed it!'
                  : '❌ Try again! Something’s off.'}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>



      <div className="mt-8">
        {!showResult ? (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleSubmit}
            className="bg-purple-600 text-white font-bold px-6 py-3 rounded-full shadow-md hover:bg-purple-700 transition-all"
          >
            ✅ Submit Answers
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={handleReplay}
            className="bg-yellow-500 text-white font-bold px-6 py-3 rounded-full shadow-md hover:bg-yellow-600 transition-all"
          >
            🔁 Replay
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default WhatWentWrongGame;
