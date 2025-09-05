import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/icon/GreenBudget/BackButton";
import Vol from "@/components/icon/GreenBudget/Vol.jsx";
import bgMusic from "/financeGames6to8/bgMusic.mp3"; 

const GameNav = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  // State to remember if music was playing before being paused by game audio
  const wasPlayingBeforePause = useRef(false);

  // --- Main toggle function for the user clicking the volume icon ---
  const toggleAudio = () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Audio toggle failed:", err);
    }
  };
  
  // --- Effect to handle custom events from game audio ---
  useEffect(() => {
    const handlePauseBgAudio = () => {
      if (audioRef.current && !audioRef.current.paused) {
        wasPlayingBeforePause.current = true; // Remember it was playing
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        wasPlayingBeforePause.current = false; // It was already paused
      }
    };

    const handlePlayBgAudio = () => {
      // Only play if it was playing before the interruption
      if (audioRef.current && wasPlayingBeforePause.current) {
        audioRef.current.play().catch(err => console.error("BG audio resume failed:", err));
        setIsPlaying(true);
      }
      wasPlayingBeforePause.current = false; // Reset the flag
    };

    window.addEventListener('pause-background-audio', handlePauseBgAudio);
    window.addEventListener('play-background-audio', handlePlayBgAudio);

    // Cleanup listeners when the component unmounts
    return () => {
      window.removeEventListener('pause-background-audio', handlePauseBgAudio);
      window.removeEventListener('play-background-audio', handlePlayBgAudio);
    };
  }, []); // Empty dependency array means this runs only once on mount

  // --- Effect for initial autoplay ---
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
      <audio ref={audioRef} loop src={bgMusic} />
      
      {/* Update the path to wherever your games list page is */}
      <Link to="/communications/games" className="transition transform hover:scale-110 opacity-95 hover:opacity-100">
        <BackButton className="w-16 md:w-28"/>
      </Link>
      
      {/* I've updated the game title to match the component */}
      <span className="lilita [text-shadow:0_5px_0_#000] [text-stroke:1px_black] text-[15px] md:text-3xl lg:text-4xl text-[#ffcc00] tracking-[0.05vw]">
        Listen Up
      </span>
      
      <button onClick={toggleAudio} className={`transition transform active:scale-95 hover:scale-110 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}>
        <Vol isPlaying={isPlaying} className="w-16 md:w-28"/>
      </button>
    </div>
  );
};

export default GameNav;