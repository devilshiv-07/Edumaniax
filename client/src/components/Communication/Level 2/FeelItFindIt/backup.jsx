import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance

const emotionData = [
  {
    id: 1,
    face: "😞",
    emotion: "Sad",
    situation: "Group didn't include them",
    color: "blue",
  },
  {
    id: 2,
    face: "😠",
    emotion: "Angry",
    situation: "Someone pushed them",
    color: "red",
  },
  {
    id: 3,
    face: "😃",
    emotion: "Happy",
    situation: "Got complimented",
    color: "yellow",
  },
  {
    id: 4,
    face: "😳",
    emotion: "Embarrassed",
    situation: "Slipped in hallway",
    color: "pink",
  },
  {
    id: 5,
    face: "😱",
    emotion: "Scared",
    situation: "Lost notebook before test",
    color: "purple",
  },
  {
    id: 6,
    face: "😐",
    emotion: "Confused",
    situation: "Didn't understand the problem",
    color: "gray",
  },
];

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const gameEmotions = shuffleArray(emotionData).slice(0, 4);

export default function FeelItFindItGame() {
  const { completeCommunicationChallenge } = useCommunication();
  const [phase, setPhase] = useState(1); // 1: face-emotion, 2: emotion-situation, 3: reflection
  const [selectedFace, setSelectedFace] = useState(null);
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentMatches, setCurrentMatches] = useState([]);
  const [remainingFaces, setRemainingFaces] = useState(gameEmotions);
  const [remainingEmotions, setRemainingEmotions] = useState(
    shuffleArray([...gameEmotions])
  );
  const [remainingSituations, setRemainingSituations] = useState(
    shuffleArray([...gameEmotions])
  );
  const [reflectionAnswers, setReflectionAnswers] = useState({});
  const [gameComplete, setGameComplete] = useState(false);
  const [score, setScore] = useState(0);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime,setStartTime] = useState(Date.now());
  const [matchCount, setMatchCount] = useState(0);


  const handleFaceSelect = (face) => {
    setSelectedFace(face);
  };

  const handleEmotionSelect = (emotion) => {
    if (!selectedFace && phase === 1) return;
    if (!selectedEmotion && phase === 2) return;

    if (phase === 1) {
      // Face to Emotion matching
      const isCorrect = selectedFace.emotion === emotion.emotion;
      const match = {
        face: selectedFace,
        emotion: emotion,
        isCorrect,
        phase: 1,
      };

      setCurrentMatches((prev) => [...prev, match]);
      setMatchCount((prev) => prev + 1);
      setRemainingFaces((prev) => prev.filter((f) => f.id !== selectedFace.id));
      setRemainingEmotions((prev) => prev.filter((e) => e.id !== emotion.id));
      setSelectedFace(null);

      if (remainingFaces.length === 1) {
        // Move to phase 2
        setTimeout(() => {
          setPhase(2);
          setRemainingEmotions(shuffleArray([...gameEmotions]));
        }, 1000);
      }
    } else if (phase === 2) {
      // Emotion to Situation matching
      const isCorrect = selectedEmotion.situation === emotion.situation;
      const match = {
        emotion: selectedEmotion,
        situation: emotion,
        isCorrect,
        phase: 2,
      };

      setCurrentMatches((prev) => [...prev, match]);
      setRemainingEmotions((prev) =>
        prev.filter((e) => e.id !== selectedEmotion.id)
      );
      setRemainingSituations((prev) => prev.filter((s) => s.id !== emotion.id));
      setSelectedEmotion(null);

      if (remainingEmotions.length === 1) {
        // Move to phase 3
        setTimeout(() => {
          setPhase(3);
          setMatches(currentMatches);
        }, 1000);
      }
    }
  };

  const handleSituationSelect = (situation) => {
    setSelectedEmotion(situation);
  };

  const handleReflectionChange = (id, field, value) => {
    setReflectionAnswers((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const checkHandler = () => {
    const allFilled = gameEmotions.every((e) => {
      const answer = reflectionAnswers[e.id];
      return answer?.emotion?.trim() && answer?.situation?.trim();
    });

    if (!allFilled) {
      toast.error("Please fill in all reflections before completing the game.");
      return;
    }

    finishGame();
  };

  const calculateScore = () => {
    const correctMatches = currentMatches.filter((m) => m.isCorrect).length;
    const reflectionScore = Object.keys(reflectionAnswers).reduce(
      (acc, key) => {
        const answer = reflectionAnswers[key];
        const original = gameEmotions.find((e) => e.id === parseInt(key));
        if (
          answer?.emotion
            ?.toLowerCase()
            .includes(original?.emotion.toLowerCase()) &&
          answer?.situation
            ?.toLowerCase()
            .includes(original?.situation.toLowerCase())
        ) {
          return acc + 1;
        }
        return acc;
      },
      0
    );
    return correctMatches + reflectionScore;
  };

  const finishGame = () => {
    const finalScore = calculateScore();
    setScore(finalScore);
    setGameComplete(true);
    completeCommunicationChallenge(1, 2);

    // Time & performance calculation
    const endTime = Date.now();
    const totalTimeSec = Math.round((endTime - startTime) / 1000);
    const studyTimeMinutes = Math.max(1, Math.round(totalTimeSec / 60));
    const avgResponseTimeSec = matchCount > 0 ? Math.round(totalTimeSec / matchCount) : 0;

    const accuracy = (finalScore / (gameEmotions.length * 2)) * 100;
    const scaledScore = Math.round((finalScore / (gameEmotions.length * 2)) * 10 * 10) / 10;

    updatePerformance({
      moduleName: "Communication",
      topicName: "emotionalIntelligence",
      completed: true,
      studyTimeMinutes,
      avgResponseTimeSec,
      score: scaledScore,
      accuracy,
      
    });
    setStartTime(Date.now());

  };


  const resetGame = () => {
    setPhase(1);
    setSelectedFace(null);
    setSelectedEmotion(null);
    setMatches([]);
    setCurrentMatches([]);
    setRemainingFaces(gameEmotions);
    setRemainingEmotions(shuffleArray([...gameEmotions]));
    setRemainingSituations(shuffleArray([...gameEmotions]));
    setReflectionAnswers({});
    setGameComplete(false);
    setScore(0);
    setStartTime(Date.now());

  };

  if (gameComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300 p-2 sm:p-4 lg:p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl text-center"
          >
            <div className="text-6xl sm:text-8xl lg:text-9xl mb-4">🎉</div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              🧠 Emotion Expert Badge Earned!
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-6">
              You scored {score} out of {gameEmotions.length * 2}!
            </p>
            <button
              onClick={resetGame}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔄 Play Again
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-2 sm:p-4 lg:p-6"
      style={{ fontFamily: "'Comic Neue', cursive" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-xl"
        >
          <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold text-white text-center mb-2 sm:mb-4">
            🤔 Feel It, Find It
          </h1>
          <div className="flex justify-center space-x-2 sm:space-x-4 mb-2 sm:mb-4">
            {[1, 2, 3].map((p) => (
              <div
                key={p}
                className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-base font-bold transition-all duration-300 ${phase === p
                  ? "bg-yellow-400 text-gray-800 scale-110"
                  : phase > p
                    ? "bg-green-400 text-white"
                    : "bg-white/30 text-white"
                  }`}
              >
                {phase > p ? "✓" : p}
              </div>
            ))}
          </div>
          <p className="text-white/90 text-center text-sm sm:text-base lg:text-lg">
            {phase === 1 && "Match faces to emotions"}
            {phase === 2 && "Match emotions to situations"}
            {phase === 3 && "Complete your reflections"}
          </p>
        </motion.div>

        {/* Phase 1: Face to Emotion */}
        {phase === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Faces */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                😊 Faces
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {remainingFaces.map((face, index) => (
                  <motion.div
                    key={face.id}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleFaceSelect(face)}
                    className={`cursor-pointer p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center shadow-lg transition-all duration-300 transform hover:scale-105 ${selectedFace?.id === face.id
                      ? "bg-yellow-400 text-gray-800 scale-105"
                      : "bg-white/80 hover:bg-white text-gray-800"
                      }`}
                  >
                    <div className="text-3xl sm:text-4xl lg:text-6xl mb-2">
                      {face.face}
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg font-semibold">
                      Face {face.id}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Emotions */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                💭 Emotions
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {remainingEmotions.map((emotion, index) => (
                  <motion.div
                    key={emotion.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleEmotionSelect(emotion)}
                    className="cursor-pointer p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-white text-gray-800 text-center shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {emotion.emotion}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Matches */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                ✨ Your Matches
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {currentMatches
                  .filter((m) => m.phase === 1)
                  .map((match, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center shadow-lg text-white font-bold text-sm sm:text-base lg:text-lg ${match.isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">
                        {match.face.face}
                      </div>
                      <div>↓</div>
                      <div>{match.emotion.emotion}</div>
                      <div className="text-xs sm:text-sm mt-1">
                        {match.isCorrect ? "✅ Correct!" : "❌ Try again!"}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase 2: Emotion to Situation */}
        {phase === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Emotions */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                💭 Emotions
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {remainingEmotions.map((emotion, index) => (
                  <motion.div
                    key={emotion.id}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedEmotion(emotion)}
                    className={`cursor-pointer p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl text-center shadow-lg transition-all duration-300 transform hover:scale-105 ${selectedEmotion?.id === emotion.id
                      ? "bg-yellow-400 text-gray-800 scale-105"
                      : "bg-white/80 hover:bg-white text-gray-800"
                      }`}
                  >
                    <div className="text-2xl sm:text-3xl lg:text-4xl mb-2">
                      {emotion.face}
                    </div>
                    <div className="text-lg sm:text-xl lg:text-2xl font-bold">
                      {emotion.emotion}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Situations */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                📖 Situations
              </h2>
              <div className="space-y-3 sm:space-y-4">
                {remainingSituations.map((situation, index) => (
                  <motion.div
                    key={situation.id}
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleEmotionSelect(situation)}
                    className="cursor-pointer p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-white/80 hover:bg-white text-gray-800 text-center shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="text-sm sm:text-base lg:text-lg font-semibold">
                      {situation.situation}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Matches */}
            <div className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center mb-4 sm:mb-6">
                ✨ Your Matches
              </h2>
              <div className="space-y-3 sm:space-y-4 max-h-96 sm:max-h-none overflow-y-auto">
                {currentMatches
                  .filter((m) => m.phase === 2)
                  .map((match, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl text-center shadow-lg text-white font-bold text-xs sm:text-sm lg:text-base ${match.isCorrect ? "bg-green-500" : "bg-red-500"
                        }`}
                    >
                      <div className="text-xl sm:text-2xl mb-1">
                        {match.emotion.face}
                      </div>
                      <div className="text-sm sm:text-base">
                        {match.emotion.emotion}
                      </div>
                      <div>↓</div>
                      <div className="text-xs sm:text-sm">
                        {match.situation.situation}
                      </div>
                      <div className="text-xs mt-1">
                        {match.isCorrect ? "✅ Correct!" : "❌ Try again!"}
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase 3: Reflection */}
        {phase === 3 && (
          <div className="bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
              📝 Final Reflections
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
              {gameEmotions.map((emotion) => (
                <motion.div
                  key={emotion.id}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: emotion.id * 0.1 }}
                  className="bg-white/90 rounded-2xl p-4 sm:p-6 shadow-lg"
                >
                  <div className="text-center mb-4">
                    <div className="text-4xl sm:text-5xl lg:text-6xl mb-2">
                      {emotion.face}
                    </div>
                    <div className="text-lg sm:text-xl font-bold text-gray-800">
                      {emotion.emotion}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 mt-1">
                      {emotion.situation}
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                        I think they feel:
                      </label>
                      <input
                        type="text"
                        placeholder="Enter emotion..."
                        className="w-full p-2 sm:p-3 rounded-lg border-2 border-gray-300 focus:border-purple-400 focus:outline-none text-sm sm:text-base"
                        onChange={(e) =>
                          handleReflectionChange(
                            emotion.id,
                            "emotion",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                        Because:
                      </label>
                      <textarea
                        placeholder="Explain the situation..."
                        rows="2"
                        className="w-full p-2 sm:p-3 rounded-lg border-2 border-gray-300 focus:border-purple-400 focus:outline-none text-sm sm:text-base resize-none"
                        onChange={(e) =>
                          handleReflectionChange(
                            emotion.id,
                            "situation",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-6 sm:mt-8">
              <button
                onClick={checkHandler}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 sm:px-8 lg:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg lg:text-xl font-bold hover:from-green-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🏆 Complete Game
              </button>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}
