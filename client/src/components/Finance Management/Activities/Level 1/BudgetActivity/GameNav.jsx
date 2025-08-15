import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GameNav = ({ heartCount = 3 }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    setShowSettings((prev) => !prev);
  };

  const handleBackClick = () => {
    setShowConfirm(true);
    setShowSettings(false); // close settings popup if open
  };

  const handleYes = () => navigate("/finance/games");
  const handleNo = () => setShowConfirm(false);

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

  useEffect(() => {
    const playAudio = async () => {
      try {
        await audioRef.current?.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };
    playAudio();
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#263238] px-4 py-3 sm:py-6 flex items-center justify-between shadow-md rounded-none">
      {/* Hidden Audio Element */}
      <audio ref={audioRef} loop>
        <source src="/financeGames6to8/bgMusic.mp3" type="audio/mp3" />
      </audio>

      {/* ===== LEFT SECTION ===== */}
      <div className="flex items-center gap-2">
        {/* Settings Button (only visible on mobile) */}
        <button
          onClick={handleSettingsClick}
          className="sm:hidden active:scale-95 focus:outline-none relative min-w-[40px] h-[28px]"
        >
          {/* Shadow Layer */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(4.2% 0, 99% 0, 93% 100%, 0% 100%)",
              backgroundColor: "#000",
              transform: "translateY(1px)",
            }}
          />
          {/* Main Button Layer */}
          <div
            className="absolute inset-0 bg-[#232E34] flex items-center justify-center"
            style={{
              clipPath: "polygon(5.5% 0, 99% 0, 93% 100%, 0% 100%)",
              border: "1px solid black",
            }}
          >
            <img
              src="/financeGames6to8/menu.svg"
              alt="Settings"
              className="h-4 w-auto transition duration-300 ease-in-out"
            />
          </div>
        </button>

        {/* Back Button (PC view only) */}
        <button
          onClick={handleBackClick}
          className="hidden sm:block transition active:scale-95 focus:outline-none"
        >
          <img
            src="/financeGames6to8/btn-navigation.svg"
            alt="Back"
            className="h-8 sm:h-10 w-auto"
          />
        </button>
      </div>

      {/* ===== TITLE ===== */}
      <h1 className="text-yellow-400 py-1 sm:py-2 lilita-one-regular text-xl sm:text-3xl md:text-4xl font-extrabold text-center leading-tight sm:leading-normal">
        Budget Activity
      </h1>

      {/* ===== RIGHT SECTION ===== */}
      <div className="flex gap-2 items-center">
        {/* Life Button (Always visible) */}
        <div className="relative min-w-[60px] sm:min-w-[90px] h-[28px] sm:h-[40px]">
          <div
            className="absolute inset-0"
            style={{
              clipPath: "polygon(4.2% 0, 99% 0, 93% 100%, 0% 100%)",
              backgroundColor: "#000",
              transform: "translateY(1px)",
            }}
          />
          <div
            className="absolute inset-0 bg-[#232E34] flex items-center justify-center gap-1 sm:gap-2"
            style={{
              clipPath: "polygon(5.5% 0, 99% 0, 93% 100%, 0% 100%)",
              border: "1px solid black",
            }}
          >
            <img
              src="/financeGames6to8/iconHeart.svg"
              alt="Heart"
              className="h-4 w-auto sm:h-5"
            />
            <span className="text-[#FF5A5F] font-bold text-sm sm:text-base">
              {heartCount}
            </span>
          </div>
        </div>

        {/* Audio Toggle (PC view only) */}
        <button
          onClick={toggleAudio}
          className="hidden sm:block relative transition active:scale-95 focus:outline-none"
        >
          <img
            src="/financeGames6to8/btnAudio.svg"
            alt="Audio"
            className="h-8 sm:h-10 w-auto"
          />
          {!isPlaying && (
            <img
              src="/financeGames6to8/audio-pause.svg"
              alt="Paused"
              className="absolute inset-0 h-8 sm:h-10 w-auto mx-auto my-auto"
            />
          )}
        </button>
      </div>

      {/* ===== MOBILE SETTINGS POPUP ===== */}
      {showSettings && (
        <div className="absolute top-full left-0 w-full bg-[#1c262b] flex items-center justify-between px-4 py-4 sm:hidden">
          {/* LEFT: Back + Exit */}
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={handleBackClick}
              className="transition active:scale-95 focus:outline-none relative"
            >
              {/* Background */}
              <img
                src="/financeGames6to8/rect.svg"
                alt="Background"
                className="h-8 w-auto"
              />

              {/* Exit Icon Centered */}
              <img
                src="/financeGames6to8/exit.svg"
                alt="Exit"
                className="absolute inset-0 m-auto h-4 w-auto z-10"
              />
            </button>

            {/* Exit Button */}
            <button
              onClick={handleYes}
              className="transition active:scale-95 focus:outline-none text-white text-sm font-bold"
            >
              EXIT
            </button>
          </div>

          {/* RIGHT: Audio + ON/OFF */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="relative transition active:scale-95 focus:outline-none"
            >
              <img
                src="/financeGames6to8/btnAudio.svg"
                alt="Audio"
                className="h-8 w-auto"
              />
              {!isPlaying && (
                <img
                  src="/financeGames6to8/audio-pause.svg"
                  alt="Paused"
                  className="absolute inset-0 h-8 w-auto mx-auto my-auto"
                />
              )}
            </button>
            <span
              className={`font-bold text-sm ${
                isPlaying ? "text-green-400" : "text-red-400"
              }`}
            >
              {isPlaying ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      )}

      {/* ===== CONFIRMATION POPUP ===== */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
            <h2 className="text-lg lilita-one-regular font-semibold mb-4">
              Are you sure you want to leave?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleYes}
                className="bg-red-500 hover:bg-red-600 text-white px-4 lilita-one-regular py-2 rounded"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
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

export default GameNav;
