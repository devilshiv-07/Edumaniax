import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/icon/GreenBudget/BackButton";
import Vol from "@/components/icon/GreenBudget/Vol.jsx";
import Heart from "@/components/icon/GreenBudget/Heart.jsx";

// Assume bgMusic is available at this path. You might need to adjust it.
import bgMusic from "/financeGames6to8/bgMusic.mp3"; 

const GameNav = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

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
        <BackButton className="w-16 md:w-28"/>
      </Link>
      
      <span className="lilita [text-shadow:0_5px_0_#000] [text-stroke:1px_black] text-xl md:text-3xl lg:text-4xl text-[#ffcc00] tracking-[0.05vw]">
        Urban Flood Flashpoint
      </span>
      
        
        
        {/* Vol component connected to the audio logic */}
        <button onClick={toggleAudio} 
          className={`transition transform active:scale-95 hover:scale-110 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}>
          <Vol isPlaying={isPlaying} className="w-16 md:w-28"/>
        </button>
    </div>
  );
};

export default GameNav;