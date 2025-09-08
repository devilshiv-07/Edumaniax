import React from "react";
import { Link } from "react-router-dom";
import BottomProgressLoader from "./BottomProgressLoader";
import Vol from "@/components/icon/GreenBudget/Vol.jsx";
import bgVid from "/communicationGames6to8/Communication2.mp4";
import btnExit from "/financeGames6to8/btn-exit.svg";
import audioPauseIcon from "/financeGames6to8/audio-pause.svg"; 
const IntroScreen = ({ onShowInstructions, isPlaying, onToggleAudio }) => {
  return (
    <div className="w-full -mt-8 h-screen relative flex items-center justify-center">
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

      <Link
        to="/communications/games"
        className="absolute top-4 left-4 w-[82px] h-[48px] sm:w-[101px] sm:h-[41px] 
         md:w-[120px] md:h-[50px] lg:w-[150px] lg:h-[60px] mt-11 md:ml-7 transition transform active:scale-95"
      >
        <img
          src={btnExit}
          alt="Exit"
          className="w-full h-full object-contain cursor-pointer"
        />
      </Link>

      <button
        onClick={onToggleAudio}
        className="absolute top-15 right-5 md:right-11 transition-transform active:scale-95"
      >
        {isPlaying ? (
          <Vol isPlaying={true} className="w-[82px] h-[48px] sm:w-[101px] sm:h-[41px] 
           md:w-[120px] md:h-[50px] lg:w-[150px] lg:h-[60px]"/>
        ) : (
          <img 
            src={audioPauseIcon} 
            alt="Audio Paused" 
            className="w-[82px] h-[48px] sm:w-[101px] sm:h-[41px] 
             md:w-[120px] md:h-[50px] lg:w-[150px] lg:h-[60px]"
          />
        )}
      </button>

      <div className="text-center flex flex-col items-center justify-start sm:justify-center mt-10 sm:-mt-100 z-10">
        <span className="lilita [text-shadow:0_6px_0_#000] [text-stroke:1px_black] text-[6vh] md:text-4xl lg:text-[9vh] text-[#ffcc00] tracking-[0.05vw]">
          Say it like you mean it
        </span>
        <h2 className="text-2xl lilita [text-shadow:0_6px_0_#000] [text-stroke:1px_black] sm:text-4xl md:text-3xl lg:text-4xl text-white mb-6 sm:mb-10">
          Challenge 2
        </h2>
      </div>

      <BottomProgressLoader onComplete={onShowInstructions} />
    </div>
  );
};

export default IntroScreen;