import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/icon/GreenBudget/BackButton";
import Vol from "@/components/icon/GreenBudget/Vol.jsx";
import Heart from "@/components/icon/GreenBudget/Heart.jsx";
import bgMusic from "/financeGames6to8/bgMusic.mp3"; 

const GameNav = ({ timeLeft }) => { // Now receives timeLeft as a prop
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // Timer logic is removed from here

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(1, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

  useEffect(() => {
    const playAudio = async () => {
      if (!audioRef.current) return;
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
    <div className="w-full h-[10.5vh] bg-[#28343A] flex items-center justify-between px-[2vw] absolute top-0 left-0 z-20">
      <audio ref={audioRef} loop src={bgMusic} />
      <Link to="/environmental/games" className="transition transform hover:scale-110 opacity-95 hover:opacity-100 ">
        <BackButton className="w-16 md:w-28"/>
      </Link>
      <span className="lilita ml-[7vw] md:ml-[11vw] lg:ml-[7vw] [text-shadow:0_6px_0_#000] [text-stroke:1px_black] text-xl md:text-3xl lg:text-4xl text-[#ffcc00] tracking-[0.05vw]">
        Match the Fallout
      </span>
      <div className="flex items-center space-x-[1vw]">
        <div className="relative h-[100px] flex items-center justify-center">
          <Heart className="w-16 md:w-28"/>
          <span className="absolute text-white font-bold text-base md:text-2xl lilita tracking-[0.05vw] top-[49%] left-[65%] -translate-x-1/2 -translate-y-1/2">
            {formatTime(timeLeft)}
          </span>
        </div>
        <button onClick={toggleAudio} className={`transition transform active:scale-95 hover:scale-110 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}>
          <Vol isPlaying={isPlaying} className="w-16 md:w-28"/>
        </button>
      </div>
    </div>
  );
};

export default GameNav;