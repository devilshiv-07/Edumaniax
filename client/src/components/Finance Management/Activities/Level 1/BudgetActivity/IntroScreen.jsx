import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bgVid from "/financeGames6to8/bgVid2.mp4";
import bgMusic from "/financeGames6to8/bgMusic.mp3";
import btnExit from "/financeGames6to8/btn-exit.svg";
import btnAudio from "/financeGames6to8/btnAudio.svg";
import BottomProgressLoader from "./BottomProgressLoader";

const IntroScreen = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const navigate = useNavigate();

  const toggleAudio = async () => {
    if (!audioRef.current) return;
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

  // Attempt autoplay on load
  useEffect(() => {
    const playAudio = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch (err) {
        console.warn("Autoplay failed, user gesture required.");
        setIsPlaying(false);
      }
    };
    playAudio();
  }, []);

  const handleExitClick = (e) => {
    e.preventDefault();
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    navigate("/finance/games");
  };

  const cancelExit = () => {
    setShowExitConfirm(false);
  };

  return (
    <div className="w-full -mt-8 h-screen relative overflow-hidden">
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

      {/* Background Audio */}
      <audio ref={audioRef} loop>
        <source src={bgMusic} type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>

      {/* Exit Button */}
      <button
        onClick={handleExitClick}
        className="absolute mt-10 top-4 left-4 
          w-[82px] h-[48px] sm:w-[120px] sm:h-[64px] 
          md:w-[202px] md:h-[82px] 
          transition transform active:scale-95 z-50"
      >
        <img
          src={btnExit}
          alt="Exit"
          className="w-full h-full object-contain cursor-pointer"
        />
      </button>

      {/* Audio Toggle Button */}
      <button
        onClick={toggleAudio}
        className="absolute mt-10 top-4 right-4 
    w-[82px] h-[48px] sm:w-[120px] sm:h-[64px] 
    md:w-[202px] md:h-[82px]  transition-transform active:scale-95 z-50"
      >
        {/* Base icon */}
        <img
          src={btnAudio}
          alt="Audio"
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Pause overlay when muted */}
        {!isPlaying && (
          <img
            src="/financeGames6to8/audio-pause.svg"
            alt="Paused"
            className="absolute inset-0 w-full h-full object-contain mx-auto my-auto"
          />
        )}
      </button>

      {/* Center Content */}
      <div className="relative z-10 text-center flex flex-col items-center justify-start sm:justify-center mt-10 sm:mt-0">
        <h1
          className="mt-20 sm:mt-24 lg:mt-28 text-4xl sm:text-6xl lg:text-7xl lilita-one-regular text-[#FFE303] font-extrabold mb-2 sm:mb-4"
          style={{
            textShadow: `
      -2px -2px 0 #000,
       2px -2px 0 #000,
      -2px  2px 0 #000,
       2px  2px 0 #000,
      -2px  0px 0 #000,
       2px  0px 0 #000,
       0px -2px 0 #000,
       0px  2px 0 #000,
       0px  4px 3px rgba(0,0,0,0.7)
    `,
          }}
        >
          The Budgeter
        </h1>

        <h2
          className="lilita-one-regular text-2xl sm:text-4xl lg:text-5xl text-white font-semibold mb-6 sm:mb-10"
          style={{
            textShadow: `
      -2px -2px 0 #000,
       2px -2px 0 #000,
      -2px  2px 0 #000,
       2px  2px 0 #000,
      -2px  0px 0 #000,
       2px  0px 0 #000,
       0px -2px 0 #000,
       0px  2px 0 #000,
       0px  4px 3px rgba(0,0,0,0.7)
    `,
          }}
        >
          Challenge 4
        </h2>

        <BottomProgressLoader />
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-[999]">
          <div className="bg-white lilita-one-regular rounded-lg p-6 shadow-lg w-[300px] text-center">
            <h2 className="text-lg lilita-one-regular font-semibold mb-4">
              Are you sure you want to leave?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmExit}
                className="bg-red-500 hover:bg-red-600 text-white px-4 lilita-one-regular py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={cancelExit}
                className="bg-gray-300 lilita-one-regular hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroScreen;
