import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/icon/GreenBudget/BackButton";
import Vol from "@/components/icon/GreenBudget/Vol.jsx";
import Heart from "@/components/icon/GreenBudget/Heart.jsx";

// Assume bgMusic is available at this path. You might need to adjust it.
import bgMusic from "/financeGames6to8/bgMusic.mp3"; 

const GameNav = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true); // Start playing by default
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    // Exit early when we reach 0
    if (timeLeft <= 0) return;

    // Save intervalId to clear the interval when the component re-renders
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    // Clear interval on re-render to avoid memory leaks
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  // Format the time left into MM:SS format
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
    <div className="w-full h-[10.5vh] bg-[#28343A] flex items-center justify-between px-[2vw] relative z-10">
      
      {/* Audio Element - correctly rendered here and linked to the ref */}
      <audio ref={audioRef} loop src={bgMusic} />

      {/* Back Button linked to another page */}
      <Link to="/environmental/games" className="transition transform hover:scale-110 opacity-95 hover:opacity-100 ">
        <BackButton className="w-16 md:w-40"/>
      </Link>
      
      <span className="lilita ml-[7vw] md:ml-[11vw] lg:ml-[7vw] [text-shadow:0_6px_0_#000] [text-stroke:1px_black] text-base sm:text-base md:text-3xl lg:text-2xl text-[#ffcc00] ml-[8vw] tracking-[0.05vw]">
        Dilemma Cards
      </span>
      
      <div className="flex items-center space-x-[1vw]">
        <div className="relative h-[100px] flex items-center justify-center">
          <Heart className="w-16 md:w-40"/>
          <span className="absolute text-white font-bold text-base sm:text-base md:text-3xl lg:text-2xl lilita tracking-[0.05vw] top-[49%] left-[65%] -translate-x-1/2 -translate-y-1/2">
            {formatTime(timeLeft)}
          </span>
        </div>
        
        {/* Vol component connected to the audio logic */}
        <button onClick={toggleAudio} 
          className={`transition transform active:scale-95 hover:scale-110 ${isPlaying ? 'opacity-100' : 'opacity-90'}`}>
          <Vol isPlaying={isPlaying} className="w-16 md:w-40"/>
        </button>
      </div>
    </div>
  );
};

export default GameNav;