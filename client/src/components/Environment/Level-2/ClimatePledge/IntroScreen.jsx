import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BottomProgressLoader from "./BottomProgressLoader";
import Vol from "@/components/icon/GreenBudget/Vol.jsx";
import bgVid from "/financeGames6to8/bgVid.mp4";
import bgMusic from "/financeGames6to8/bgMusic.mp3";
import btnExit from "/financeGames6to8/btn-exit.svg";
import btnAudio from "/financeGames6to8/btnAudio.svg";

const IntroScreen = ({ onShowInstructions }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    // Toggle the muted state
    const newMutedState = !isMuted;
    audioRef.current.muted = newMutedState;
    setIsMuted(newMutedState);

    // If unmuting, and it wasn't playing, try to play
    if (!newMutedState && !isPlaying) {
      audioRef.current.play();
      setIsPlaying(true);
    } else if (newMutedState && isPlaying) {
      // If muting while playing, just update state
      // We don't need to pause, just mute
    }
  };

  useEffect(() => {
    const playAudio = async () => {
      if (!audioRef.current) return;
      
      // Set to muted on initial load to bypass autoplay policy
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
    <div className="w-full -mt-8 h-screen relative flex items-center justify-center">
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

      {/* Audio Element - This is the correct place to render it */}
      <audio ref={audioRef} loop src={bgMusic} />

      {/* Exit Button */}
      <Link
        to="/environmental/games"
        className="absolute top-4 left-4 w-[82px] h-[48px] sm:w-[101px] sm:h-[41px] 
         md:w-[120px] md:h-[50px] lg:w-[150px] lg:h-[60px] mt-11 md:ml-7 transition transform active:scale-95"
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
        className="absolute top-15 right-5 md:right-11 transition-transform active:scale-95"
      >
        <Vol isPlaying={isPlaying && !isMuted} className="w-[82px] h-[48px] sm:w-[101px] sm:h-[41px] 
          md:w-[120px] md:h-[50px] lg:w-[150px] lg:h-[60px]"/>
      </button>

      {/* Center Content */}
      <div className="text-center flex flex-col items-center justify-start sm:justify-center mt-10 sm:-mt-100 z-10">
        {/* Heading: The Budgeter */}
        <span className="lilita [text-shadow:0_6px_0_#000] [text-stroke:1px_black] text-[6vh] md:text-4xl lg:text-[9vh] text-[#ffcc00] tracking-[0.05vw]">
          Climate Pledge
        </span>

        {/* Subheading: Challenge 1 */}
        <h2 className="text-2xl lilita [text-shadow:0_6px_0_#000] [text-stroke:1px_black] sm:text-4xl md:text-3xl lg:text-4xl text-white mb-6 sm:mb-10">
          Challenge 3
        </h2>
      </div>

      {/* Add the loader at the bottom*/}
      <BottomProgressLoader onComplete={onShowInstructions} /> 
    </div>
  );
};

export default IntroScreen;