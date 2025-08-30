import React from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/icon/GreenBudget/BackButton";
import Vol from "@/components/icon/GreenBudget/Vol.jsx";
import audioPauseIcon from "/financeGames6to8/audio-pause.svg"; 

const GameNav = ({ isPlaying, onToggleAudio }) => {
  return (
    <div className="w-full h-[10.5vh] bg-[#28343A] flex items-center justify-between px-[2vw] relative z-10">
      <Link to="/communications/games" className="transition transform hover:scale-110 opacity-95 hover:opacity-100">
        <BackButton className="w-16 md:w-28"/>
      </Link>
      
      <span className="lilita [text-shadow:0_5px_0_#000] [text-stroke:1px_black] text-[15px] md:text-3xl lg:text-4xl text-[#ffcc00] tracking-[0.05vw]">
        Say it like you mean it
      </span>
      
      <button onClick={onToggleAudio} className={`transition transform active:scale-95 hover:scale-110 ${isPlaying ? 'opacity-100' : 'opacity-60'}`}>
        {isPlaying ? (
          <Vol isPlaying={true} className="w-16 md:w-28"/>
        ) : (
          <img 
            src={audioPauseIcon} 
            alt="Audio Paused" 
            className="w-16 md:w-28" 
          />
        )}
      </button>
    </div>
  );
};

export default GameNav;