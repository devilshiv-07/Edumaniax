// src/components/Games/CauseEffectGame/IntroScreen.jsx

import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BottomProgressLoader from "./BottomProgressLoader";

// --- NOTE: Make sure you have these assets and components available ---
import Vol from "@/components/icon/GreenBudget/Vol.jsx"; // Placeholder path
import bgVid from "/financeGames6to8/bgVid.mp4";
import bgMusic from "/financeGames6to8/bgMusic.mp3";
import btnExit from "/financeGames6to8/btn-exit.svg";

const IntroScreen = ({ onShowInstructions }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);

    if (!newMutedState && !isPlaying) {
      audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const playAudio = async () => {
      if (!audioRef.current) return;
      audioRef.current.muted = true;
      setIsMuted(true);

      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Autoplay failed, user gesture required.");
        setIsPlaying(false);
      }
    };
    playAudio();
  }, []);

  return (
    <div className="w-full h-screen relative flex items-center justify-center bg-black">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src={bgVid} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Audio Element */}
      <audio ref={audioRef} loop src={bgMusic} />

      {/* Exit Button */}
      <Link
        to="/" // Link to your main games page or home
        className="absolute top-4 left-4 w-[82px] h-[48px] sm:w-[101px] sm:h-[41px] md:w-[150px] md:h-[60px] mt-11 ml-7 transition transform active:scale-95 z-20"
      >
        <img
          src={btnExit}
          alt="Exit"
          className="w-full h-full object-contain cursor-pointer"
        />
      </Link>

      {/* Audio Toggle Button */}
      <button
        onClick={toggleAudio}
        className="absolute top-12 right-11 transition-transform active:scale-95 z-20"
      >
        <Vol isPlaying={isPlaying && !isMuted} className="w-[82px] h-[48px] sm:w-[101px] sm:h-[41px] md:w-[150px] md:h-[60px]"/>
      </button>

      {/* Center Content */}
      <div className="text-center flex flex-col items-center justify-center z-10 p-4">
        <span className="lilita [text-shadow:0_6px_0_#000] [text-stroke:1px_black] text-[6vh] md:text-[9vh] text-[#ffcc00] tracking-[0.05vw]">
          Earth Systems
        </span>
        <h2 className="text-2xl lilita [text-shadow:0_6px_0_#000] [text-stroke:1px_black] sm:text-4xl text-white -mt-2 mb-6 sm:mb-10">
          Cause & Effect Adventure!
        </h2>
      </div>

      {/* Add the loader at the bottom */}
      <BottomProgressLoader onComplete={onShowInstructions} />
    </div>
  );
};

export default IntroScreen;