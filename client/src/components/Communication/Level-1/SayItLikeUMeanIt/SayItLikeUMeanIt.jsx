import React, { useState, useEffect, useReducer, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Confetti from 'react-confetti';
import useWindowSize from 'react-use/lib/useWindowSize';
import bgMusic from "/financeGames6to8/bgMusic.mp3";
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';
import GameNav from './GameNav';
import Checknow from '@/components/icon/GreenBudget/Checknow';
import ThinkingCloud from "@/components/icon/ThinkingCloud";

import { notesCommunication6to8 } from "@/data/notesCommunication6to8.js";

const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const sentenceData = [
  { id: 1, text: "I am so tired , its monday once again", audio: "/sad.mp3", correctMood: "Sad" },
  { id: 2, text: "Hmph, its monay once again", audio: "/sarcastic.mp3", correctMood: "Sarcastic" },
  { id: 3, text: "I still can't believe its monday again", audio: "/angry.mp3", correctMood: "Angry" },
  { id: 4, text: "Ahhhhh, its monday once again", audio: "/bored.mp3", correctMood: "Bored" },
  { id: 5, text: "Hey! I cant believe its monday again", audio: "/happy.mp3", correctMood: "Happy" },
];

const moodOptions = ["Sad", "Happy", "Bored", "Angry", "Sarcastic"];

const moodEmojis = {
    Sad: "😢",
    Happy: "😃",
    Bored: "😐",
    Angry: "😠",
    Sarcastic: "😏",
};

const PERFECT_SCORE = sentenceData.length * 5;
const PASSING_THRESHOLD = 0.8;
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'sayItLikeYouMeanItGameState';
const AUDIO_STATE_KEY = 'sayItLikeYouMeanItAudioState';

function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }
    if (text.startsWith("`") && text.endsWith("`")) {
        text = text.slice(1, -1).trim();
    }
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        return null;
    }
}

const EmotionCard = ({ mood, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`flex flex-col items-center justify-center inter-font
         w-28 h-26 md:w-36 md:h-36 
         bg-[#131f24] rounded-lg border-2 
         cursor-pointer transition-all duration-200 transform hover:scale-105
         ${isSelected
            ? 'border-[#6DFF00] shadow-[0_4px_0_0_#6DFF00]'
            : 'border-[#37464f] shadow-[0_4px_0_0_#37464f] hover:border-gray-500'}`
        }
    >
        <span className="text-4xl md:text-5xl mb-4">{moodEmojis[mood]}</span>
        <span className="text-[#f1f7fb] font-medium text-sm md:text-base">{mood}</span>
    </div>
);

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">Challenge Complete!</h2>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full h-20 rounded-lg flex items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] lilita-one-regular text-xs font-normal">{insight}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}
function LosingScreen({ onPlayAgain, onViewFeedback, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p>
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center mb-6">Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center py-3 px-5">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex flex-grow items-center justify-center px-4 text-center">
                            <span className="text-[#FFCC00] inter-font text-[11px] font-normal">{insight}</span>
                        </div>
                    </div>
                </div>
                {recommendedSectionTitle && (
                    <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                        <button
                            onClick={onNavigateToSection}
                            className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg"
                        >
                            Review "{recommendedSectionTitle}" Notes
                        </button>
                    </div>
                )}
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex flex-wrap justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105 transition-transform duration-200" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${ans.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                        <h3 className="text-lg font-bold text-yellow-300">Scenario {idx + 1}</h3>
                        <p className="text-gray-200 text-sm">"{sentenceData[idx].text}"</p>
                        <div>
                            <p className={ans.isCorrect ? 'text-green-300' : 'text-red-300'}>Your Answer: {ans.userAnswer}</p>
                            {!ans.isCorrect && <p className="text-green-400">Correct: {ans.correctAnswer}</p>}
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBackToResults}
                className="mt-auto px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg"
            >
                Back to Results
            </button>
        </div>
    );
}

function AudioPlayerCharacter({ audioSrc, onPlaybackStop = () => { }, pauseBGMusic = () => { } }) {
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const audioElement = audioRef.current;
        if (audioElement) {
            audioElement.pause();
            audioElement.currentTime = 0;
            setIsPlaying(false);
        }
    }, [audioSrc]);

    const handleAudioEnded = () => {
        setIsPlaying(false);
        onPlaybackStop();
    };

    const togglePlayPause = async () => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        if (isPlaying) {
            audioElement.pause();
            setIsPlaying(false);
            onPlaybackStop();
        } else {
            pauseBGMusic();
            try {
                await audioElement.play();
                setIsPlaying(true);
            } catch (error) {
                setIsPlaying(false);
            }
        }
    };

    return (
        <div className="flex items-end justify-center ">
            <audio ref={audioRef} onEnded={handleAudioEnded} preload="auto" style={{ display: 'none' }}>
                <source src={audioSrc} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
            <img src="/feedbackcharacter.gif" alt="Character" className="w-[3.5rem] md:w-[4.8rem] h-auto object-contain shrink-0" />
            <div className="relative mb-4 md:mb-8 md:ml-2">
                <ThinkingCloud className="w-[220px] h-auto md:w-[260px] " />
                <div className="absolute top-1/2 left-4/7 -translate-x-1/2 -translate-y-1/2 w-full flex items-center justify-center gap-5">
                    <button onClick={togglePlayPause} className="cursor-pointer flex-shrink-0 focus:outline-none rounded-full w-7">
                        <img src={isPlaying ? "/communicationGames6to8/pause.svg" : "/communicationGames6to8/play.svg"} alt={isPlaying ? "Pause audio" : "Play audio"} className="w-9 h-9 md:w-11 md:h-11 transition-transform duration-200 hover:scale-105 active:scale-95" />
                    </button>
                    <img src="/communicationGames6to8/audio.svg" alt="Audio waveform" className="h-9 md:h-11" />
                </div>
            </div>
        </div>
    );
}

const initialState = { gameState: "intro", currentPuzzleIndex: 0, score: 0, answers: [], insight: "", recommendedSectionId: null, recommendedSectionTitle: "" };

function gameReducer(state, action) {
    switch (action.type) {
        case "RESTORE_STATE": return action.payload;
        case "SET_AI_INSIGHT": return { ...state, insight: action.payload.insight, recommendedSectionId: action.payload.recommendedSectionId, recommendedSectionTitle: action.payload.recommendedSectionTitle };
        case "SHOW_INSTRUCTIONS": return { ...state, gameState: "instructions" };
        case "START_GAME": return { ...initialState, gameState: "playing" };
        case "SUBMIT_ANSWER": {
            const { userAnswer } = action.payload;
            const puzzle = sentenceData[state.currentPuzzleIndex];
            const correctAnswer = puzzle.correctMood;
            const isCorrect = userAnswer === correctAnswer;
            const nextState = {
                ...state,
                score: isCorrect ? state.score + 5 : state.score,
                answers: [...state.answers, { userAnswer, correctAnswer, isCorrect }],
                currentPuzzleIndex: state.currentPuzzleIndex + 1
            };
            if (nextState.currentPuzzleIndex >= sentenceData.length) {
                return { ...nextState, gameState: "finished" };
            }
            return nextState;
        }
        case "REVIEW_GAME": return { ...state, gameState: "review" };
        case "BACK_TO_FINISH": return { ...state, gameState: "finished" };
        case "RESET_GAME": return { ...initialState, gameState: "playing" };
        default: return state;
    }
}

const SayItLikeUMeanItGame = () => {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [selectedMood, setSelectedMood] = useState(null);

    const audioRef = useRef(null);

    const getInitialAudioState = () => {
        const savedState = sessionStorage.getItem(AUDIO_STATE_KEY);
        return savedState !== 'false';
    };

    const [isPlaying, setIsPlaying] = useState(getInitialAudioState());

    const wasPlayingBeforeSfx = useRef(getInitialAudioState());

    const playBgAudio = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(err => {
                console.warn("Audio play failed, likely needs user interaction.", err);
                setIsPlaying(false);
            });
            setIsPlaying(true);
        }
    };
    
    const pauseBgAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const pauseForSfx = () => {
        wasPlayingBeforeSfx.current = isPlaying; 
        pauseBgAudio();
    };

    const resumeAfterSfx = () => {
        if (wasPlayingBeforeSfx.current) { 
            playBgAudio();
        }
    };

    const toggleAudio = () => {
        if (isPlaying) {
            pauseBgAudio();
        } else {
            playBgAudio();
        }
    };

    useEffect(() => {
        if (isPlaying) {
            playBgAudio();
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem(AUDIO_STATE_KEY, isPlaying);
    }, [isPlaying]);

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                dispatch({ type: 'RESTORE_STATE', payload: savedState });
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            } catch (error) {
                console.error("Failed to parse saved game state:", error);
                sessionStorage.removeItem(SESSION_STORAGE_KEY);
            }
        }
    }, []);
    
    // --- AI INSIGHT LOGIC (Unchanged) ---
    useEffect(() => {
        if (state.gameState === "finished" && !state.insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                const incorrectAnswers = state.answers
                    .map((ans, index) => ({ ans, index }))
                    .filter(({ ans }) => !ans.isCorrect)
                    .map(({ ans, index }) => ({
                        scenario_number: index + 1,
                        sentence: sentenceData[index].text,
                        your_answer: ans.userAnswer,
                        correct_answer: ans.correctAnswer
                    }));

                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Perfect score! You have a great ear for emotional tone!", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }

                const prompt = `You are an expert AI tutor. A student finished a game on identifying emotions from tone of voice and made mistakes. Your task is to provide targeted feedback. ### CONTEXT ### 1. **Student's Incorrect Answers:** ${JSON.stringify(incorrectAnswers, null, 2)} 2. **All Available Note Sections for this Module:** ${JSON.stringify(notesCommunication6to8.map(n => ({topicId: n.topicId, title: n.title, content: n.content.substring(0, 200) + '...'})), null, 2)} ### YOUR TWO-STEP TASK ### 1. **Step 1: DETECT.** Analyze the student's mistakes. Is there a pattern, like confusing sarcasm with happiness, or boredom with sadness? Identify the ONE note section that is the best match for their errors. 2. **Step 2: GENERATE.** Based on their performance, provide a short, encouraging, and educational insight (about 25-30 words) into their listening skills. Identify the main area of weakness and suggest reviewing the note section you detected by its 'title'. ### OUTPUT FORMAT ### Return ONLY a raw JSON object. { "detectedTopicId": "The 'topicId' of the section you identified", "insight": "Your personalized and encouraging feedback message here." }`;
                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { insight: parsed.insight, recommendedSectionId: parsed.detectedTopicId, recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" } });
                    } else { throw new Error("Failed to parse response from AI."); }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    const fallbackNote = notesCommunication6to8[0] || { topicId: 'review-all', title: 'Communication Basics' };
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Good effort! Take a moment to review the module notes on tone of voice.", recommendedSectionId: fallbackNote.topicId, recommendedSectionTitle: fallbackNote.title } });
                }
            };
            generateInsight();
        }
    }, [state.gameState, state.answers, state.insight]);

    const handleSubmit = () => {
        if (!selectedMood) return;
        dispatch({ type: "SUBMIT_ANSWER", payload: { userAnswer: selectedMood } });
        setSelectedMood(null);
    };

    const handleNavigateToSection = () => {
        if (state.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=6-8&section=${state.recommendedSectionId}`);
        }
    };

    const handleStartGame = () => {
        dispatch({ type: "START_GAME" });
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/pick-your-persuasion');
    };

    const isSubmitEnabled = selectedMood !== null;

    const renderGameContent = () => {
        if (state.gameState === "intro") {
            return <IntroScreen
                onShowInstructions={() => dispatch({ type: "SHOW_INSTRUCTIONS" })}
                isPlaying={isPlaying}
                onToggleAudio={toggleAudio}
            />;
        }

        if (state.gameState === "finished") {
            const accuracyScore = Math.round((state.score / PERFECT_SCORE) * 100);
            const isVictory = accuracyScore >= PASSING_THRESHOLD * 100;
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={state.insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={state.insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={state.recommendedSectionTitle} />;
        }

        if (state.gameState === "review") return <ReviewScreen answers={state.answers} onBackToResults={() => dispatch({ type: "BACK_TO_FINISH" })} />;

        const currentPuzzle = sentenceData[state.currentPuzzleIndex];
        if (!currentPuzzle) return <div className="text-white">Loading...</div>;

        return (
            <div className="w-full min-h-screen bg-[#0A160E] flex flex-col inter-font">
                <style>{scrollbarHideStyle}</style>

                {state.gameState === "instructions" && <InstructionsScreen onStartGame={handleStartGame} />}
                
                <GameNav
                    isPlaying={isPlaying}
                    onToggleAudio={toggleAudio}
                />

                <main className="flex-1 w-full flex flex-col px-4 overflow-hidden">
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <p className="text-white text-lg md:text-2xl mb-8 font-normal text-center">{currentPuzzle.text}</p>
                        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                            {moodOptions.map(mood => (
                                <EmotionCard
                                    key={mood}
                                    mood={mood}
                                    isSelected={selectedMood === mood}
                                    onClick={() => setSelectedMood(mood)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="w-full flex justify-center shrink-0 pt-4">
                        <AudioPlayerCharacter
                            key={currentPuzzle.audio}
                            audioSrc={currentPuzzle.audio}
                            onPlaybackStop={resumeAfterSfx}  // Use smart resume
                            pauseBGMusic={pauseForSfx}      // Use smart pause
                        />
                    </div>
                </main>

                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full cursor-pointer" onClick={handleSubmit} disabled={!isSubmitEnabled}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 lilita-one-regular text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] transition-opacity ${!isSubmitEnabled ? "opacity-50" : "opacity-100"}`}>
                                Submit
                            </span>
                        </button>
                    </div>
                </footer>
            </div>
        );
    };

    return (
        <>
            <audio ref={audioRef} src={bgMusic} loop />
            {renderGameContent()}
        </>
    );
};

export default SayItLikeUMeanItGame;