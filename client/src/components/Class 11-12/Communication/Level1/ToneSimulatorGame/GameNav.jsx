import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BackButton from "@/components/icon/GreenBudget/BackButton";
import Vol from "@/components/icon/GreenBudget/Vol.jsx";
import Heart from "@/components/icon/GreenBudget/Heart.jsx";
import bgMusic from "/financeGames6to8/bgMusic.mp3";

const GAME_DURATION_SECONDS = 6 * 60; 

const GameNav = ({ onTimeUp }) => {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION_SECONDS);
    const wasPlayingRef = useRef(true);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (onTimeUp) onTimeUp();
            return;
        }
        const intervalId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp]);

    useEffect(() => {
        const handlePause = () => {
            if (audioRef.current && !audioRef.current.paused) {
                wasPlayingRef.current = true;
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                wasPlayingRef.current = false;
            }
        };
        const handlePlay = () => {
            if (audioRef.current && wasPlayingRef.current) {
                audioRef.current.play().catch(e => console.error("BG Audio Playback failed", e));
                setIsPlaying(true);
            }
        };
        window.addEventListener('pause-background-audio', handlePause);
        window.addEventListener('play-background-audio', handlePlay);
        return () => {
            window.removeEventListener('pause-background-audio', handlePause);
            window.removeEventListener('play-background-audio', handlePlay);
        };
    }, []);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes)}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const toggleAudio = () => {
        if (!audioRef.current) return;
        try {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
                wasPlayingRef.current = false;
            } else {
                audioRef.current.play();
                setIsPlaying(true);
                wasPlayingRef.current = true;
            }
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
                wasPlayingRef.current = true;
            } catch (err) {
                console.warn("Autoplay failed, user gesture required.");
                setIsPlaying(false);
                wasPlayingRef.current = false;
            }
        };
        playAudio();
    }, []);

    return (
        <div className="w-full h-[10.5vh] bg-[#28343A] flex items-center justify-between px-[2vw] relative z-10 shrink-0">
            <audio ref={audioRef} loop src={bgMusic} />
            <Link to="/communications/games" className="transition transform hover:scale-110 opacity-95 hover:opacity-100">
                <BackButton className="w-16 md:w-28" />
            </Link>
            <span className="lilita ml-[7vw] md:ml-[11vw] lg:ml-[7vw] [text-shadow:0_5px_0_#000] [text-stroke:1px_black] text-[15px] md:text-[28px] lg:text-4xl text-[#ffcc00] tracking-[0.05vw]">
                Active Listening
            </span>
            <div className="flex items-center space-x-4 lg:space-x-8">
                <div className="relative h-[100px] flex items-center justify-center">
                    <Heart className="w-16 md:w-28" />
                    <span className="absolute text-white font-bold text-base sm:text-base md:text-xl lg:text-2xl lilita tracking-[0.05vw] top-[49%] left-[65%] -translate-x-1/2 -translate-y-1/2">
                        {formatTime(timeLeft)}
                    </span>
                </div>
                <button onClick={toggleAudio} className={`transition transform active:scale-95 hover:scale-110 ${isPlaying ? 'opacity-100' : 'opacity-90'}`}>
                    <Vol isPlaying={isPlaying} className="w-16 md:w-28" />
                </button>
            </div>
        </div>
    );
};

export default GameNav;