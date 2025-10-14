import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import SmoothieAvatar from "./SmoothieAnimation";
import { useDM } from "@/contexts/DMContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import GameNav from "./GameNav";
import IntroScreen from "./IntroScreen";
import InstructionOverlay from "./InstructionOverlay";
import { useNavigate } from "react-router-dom";

const captions = {
  "Mango Madness": [
    "⚡Charge up with Mango Madness! 🥭💥 #FruityFuel #MangoMagic",
    "😋 Slurp the sunshine! Mango Madness is here 🌞🍹 #TropicalBlast",
    "Zoom Zoom! It’s Mango Madness time 🚀🥭 #FuelTheFun",
  ],
  "Strawberry Zoom": [
    "🍓 Whoosh! Strawberry Zoom is in the room 💨 #BerrySpeed #YumFuel",
    "⚡Speed meets sweet! Strawberry Zoom for the win 🏁🍓 #ZoomZoomJuice",
    "Zoom to deliciousness with Strawberry Zoom 🚗🍓 #FruityRush #JuicyJourney",
  ],
  "Green Power": [
    "💪 Go green, feel strong! Green Power rocks! 🌿⚡ #SuperSips #GoGreen",
    "🌱 Hulk up with Green Power 💥💚 #LeafItToMe #FuelModeOn",
    "Get your green on! Power up your play 🌿🕹️ #GreenFuel #PlantPower",
  ],
};

const smoothieEmojis = {
  "Mango Madness": "🥭",
  "Strawberry Zoom": "🍓",
  "Green Power": "🌿",
};

const text =
  "You work for a smoothie brand called “FruityFuel” that wants to attract kids and teens. Write an eye-catchy, mouth-watering caption!!!";

const appearingText = text.split(" ");

export default function CaptionCraze() {
  // All hooks must be called at the top level, before any conditional returns
  const { completeDMChallenge } = useDM();
  const { updatePerformance } = usePerformance(); //for performance
  const navigate = useNavigate();
  
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [selectedSmoothie, setSelectedSmoothie] = useState("Mango Madness");
  const [userCaption, setUserCaption] = useState("");
  const [showExamples, setShowExamples] = useState(false);
  // const [showInstructions, setShowInstructions] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [showInstructionOverlay, setShowInstructionOverlay] = useState(false);
  const [showWinView, setShowWinView] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Show instruction overlay automatically when game loads (after intro)
  useEffect(() => {
    if (!showIntro) {
      const timer = setTimeout(() => {
        setShowInstructionOverlay(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);

  // Early return after all hooks have been called
  if (showIntro) {
    return <IntroScreen />;
  }

  const handleSubmit = () => {
    if (userCaption.trim() !== "") {
      setSubmitted(true);

      if (!challengeCompleted) {
        completeDMChallenge(1, 0);
        setChallengeCompleted(true);

        const timeTakenSec = Math.floor((Date.now() - startTime) / 1000);
        updatePerformance({
          moduleName: "DigitalMarketing",
          topicName: "contentStrategist",
          score: 10,
          accuracy: 100,
          avgResponseTimeSec: timeTakenSec,
          studyTimeMinutes: Math.ceil(timeTakenSec / 60),
          completed: true,

        });
        setStartTime(Date.now());
      }

      // Confetti celebration
      const myCanvas = canvasRef.current;
      if (myCanvas) {
        const myConfetti = confetti.create(myCanvas, {
          resize: true,
          useWorker: true,
        });

        const defaults = {
          spread: 360,
          ticks: 50,
          gravity: 0,
          decay: 0.94,
          startVelocity: 30,
          colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
        };

        const shoot = () => {
          myConfetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ["star"] });
          myConfetti({ ...defaults, particleCount: 30, scalar: 0.75, shapes: ["circle"] });
        };

        // Confetti bursts
        setTimeout(shoot, 0);
        setTimeout(shoot, 100);
        setTimeout(shoot, 300);
        setTimeout(shoot, 500);
        setTimeout(shoot, 700);
      }

      // Show win view after a short delay
      setTimeout(() => {
        setShowWinView(true);
      }, 1500);
    }
  };

  const handleRetryChallenge = () => {
    // reset to initial state (no navigation reload)
    setUserCaption("");
    setSelectedSmoothie("Mango Madness");
    setSubmitted(false);
    setShowWinView(false);
    setStartTime(Date.now());
  };

  const handleNextChallenge = () => {
    navigate("/reel-planner-game");
  };

  const handleViewFeedback = () => {
    // stub: open your feedback modal or navigate to feedback page
    console.log("Open feedback modal or page");
  };

  // WIN VIEW
  if (showWinView) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
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
            🏅 Badge Earned: ✍️ Caption Creator
          </h2>
          <p className="text-xl text-white mt-2">🎉 Great job! Your captions are amazing!</p>
        </div>

        <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
          <img
            src="/financeGames6to8/feedback.svg"
            alt="Feedback"
            onClick={handleViewFeedback}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/retry.svg"
            alt="Retry Challenge"
            onClick={handleRetryChallenge}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/next-challenge.svg"
            alt="Next Challenge"
            onClick={handleNextChallenge}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pt-25 sm:pt-45 pb-20 bg-[#0A160E] px-4 mx-auto min-h-screen lilita-one-regular">
      <GameNav />
      
      {/* Instruction Overlay */}
      {showInstructionOverlay && (
        <InstructionOverlay onClose={() => setShowInstructionOverlay(false)} />
      )}
      
      <div className="w-full h-full bg-gradient-to-br from-[#b8ffcb] via-[#beffde] to-green-200 rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col items-center font-bold transition-all duration-500 ease-in-out ring-4 ring-purple-200 relative">
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center gap-5">
          <h1 className="text-2xl md:text-4xl lg:text-5xl mb-4 text-purple-700 animate-bounce drop-shadow-lg text-center">
            🎮 Caption Craze
          </h1>
          <SmoothieAvatar className="w-24 h-24 md:w-28 md:h-28 drop-shadow-xl" />
        </div>

        <div className="text-lg md:text-2xl px-4 font-semibold flex flex-wrap  max-w-3xl mb-6 mt-6 text-center justify-center text-purple-800">
          {appearingText.map((word, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="mr-2  text-purple-700"
            >
              {word}
            </motion.span>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {["Mango Madness", "Strawberry Zoom", "Green Power"].map(
            (smoothie) => (
              <button
                key={smoothie}
                onClick={() => setSelectedSmoothie(smoothie)}
                className={`px-6 py-2 rounded-full font-semibold text-lg shadow-lg hover:scale-105 transition-all duration-300 ${selectedSmoothie === smoothie
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  : "bg-white text-purple-600"
                  }`}
              >
                {smoothie } {smoothieEmojis[smoothie]}
              </button>
            )
          )}
        </div>

        <textarea
          className="w-full max-w-lg p-4 rounded-2xl border-2 border-purple-300 bg-white shadow-inner focus:outline-none focus:ring-4 focus:ring-purple-300 text-base md:text-lg mb-6 placeholder-purple-400"
          spellCheck={false}
          rows={3}
          placeholder="Type your amazing caption here! 🤩🍓🥭🌿 #HashtagsWelcome"
          value={userCaption}
          onChange={(e) => setUserCaption(e.target.value)}
        />

        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="px-6 py-2 bg-pink-400 text-md md:text-xl text-white rounded-full hover:bg-pink-500 transition duration-300"
          >
            {showExamples ? "Hide Example Captions" : "See Example Captions"}
          </button>
          
          <button
            onClick={() => setShowInstructionOverlay(true)}
            className="px-6 py-2 bg-blue-400 text-md md:text-xl text-white rounded-full hover:bg-blue-500 transition duration-300"
          >
            📖 How to Play
          </button>
        </div>

        {
          showExamples && (
            <div className="grid gap-4 w-full max-w-lg mb-6">
              {
                captions[selectedSmoothie]?.map((caption, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-white border text-lg border-purple-300 shadow hover:bg-yellow-100 transition-all duration-300"
                  >
                    {caption}
                  </div>
                ))}
            </div>
          )}

        <button
          onClick={handleSubmit}
          className="mt-4 px-8 py-3 bg-green-400 text-white rounded-full text-md md:text-xl text-center shadow-md hover:scale-105 hover:bg-green-500 transition-all duration-300"
        >
          Submit Caption 🚀
        </button>
      </div>
    </div>
  );
}
