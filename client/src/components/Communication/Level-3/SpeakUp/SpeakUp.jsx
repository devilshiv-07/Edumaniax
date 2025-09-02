import React, { useState, useEffect, useMemo, useReducer } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from "axios";

import { notesCommunication6to8 } from "@/data/notesCommunication6to8.js";
import GameNav from "./GameNav";
import Checknow from "@/components/icon/GreenBudget/Checknow";
import IntroScreen from "./IntroScreen";
import InstructionsScreen from "./InstructionsScreen";

// =============================================================================
// Setup (API, Session Key, Helper Functions)
// =============================================================================
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'persuasionChallengeState_v4'; // Key for session state

function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) {
        text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim();
    }
    try {
        return JSON.parse(text);
    } catch (err) {
        console.error("Failed to parse JSON:", err);
        return null;
    }
}

// =============================================================================
// UI Components
// =============================================================================
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

function VictoryScreen({ onContinue, onViewFeedback, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col ">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 overflow-y-auto no-scrollbar">
                <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0">
                    <img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" />
                    <img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" />
                </div>
                <h2 className="text-yellow-400 font-['Lilita_One'] text-3xl sm:text-4xl mt-6">Argument Won!</h2>
                <p className="text-white text-lg mt-2">You're a master of persuasion!</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase">Persuasion Score</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center p-4">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-[#09BE43] text-2xl ">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center p-4 text-center">
                            <span className="text-[#FFCC00] font-['Lilita_One'] text-sm ">{insight}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center items-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-10 md:h-14 hover:scale-105" />
                <img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-10 md:h-14 hover:scale-105" />
            </div>
        </div>
    );
}

function LosingScreen({ onPlayAgain, onViewFeedback, onContinue, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl">Oops! The motion was denied.</p>
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl mb-6">Want to try again?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase">Persuasion Score</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center p-4">
                            <img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" />
                            <span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span>
                        </div>
                    </div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col">
                        <p className="text-black text-sm font-bold my-2 uppercase">Insight</p>
                        <div className="bg-[#131F24] w-full min-h-[5rem] rounded-lg flex items-center justify-center p-4 text-center">
                            <span className="text-[#FFCC00] lilita-one-regular text-xs">{insight}</span>
                        </div>
                    </div>
                </div>
                {recommendedSectionTitle && (
                    <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center">
                        <button
                            onClick={onNavigateToSection}
                            className="bg-[#068F36] text-black font-semibold rounded-lg py-3 px-10 hover:bg-green-700 border-b-4 border-green-800 active:border-transparent"
                        >
                            Review "{recommendedSectionTitle}" Notes
                        </button>
                    </div>
                )}
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0">
                <img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 hover:scale-105" />
                <img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 hover:scale-105" />
            </div>
        </div>
    );
}

function ReviewScreen({ answers, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center no-scrollbar">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400">Review Your Argument</h1>
            <div className="w-full max-w-4xl flex flex-col gap-4 overflow-y-auto p-2 no-scrollbar">
                {answers.map((ans, idx) => {
                    const isCorrect = ans.scoreAwarded >= ans.maxScore;
                    return (
                        <div key={idx} className={`p-4 rounded-xl flex flex-col ${isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border`}>
                            <p className="text-gray-300 font-bold mb-2">{ans.question}</p>
                            <div className="text-sm space-y-1">
                                <p className="font-semibold">Your Answer(s):</p>
                                <p className={`${isCorrect ? 'text-white' : 'text-red-300'} whitespace-pre-line`}>{ans.selectedOptions.map(opt => `• ${opt.text}`).join('\n')}</p>
                                {!isCorrect && (
                                    <>
                                        <p className="font-semibold pt-2">Correct Answer(s):</p>
                                        <p className="text-green-300 whitespace-pre-line">{ans.correctAnswerText.split(' & ').map(txt => `• ${txt}`).join('\n')}</p>
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <button onClick={onBackToResults} className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700">Back to Results</button>
        </div>
    );
}

function OptionCard({ option, isSelected, onClick, showFeedback }) {
    const isCorrectAnswer = option.score > 0;

    const getCardStyling = () => {
        if (showFeedback) {
            if (isCorrectAnswer) return "bg-green-800/80 border-2 border-green-500";
            if (isSelected) return "bg-red-800/80 border-2 border-red-500";
            return "bg-[#131f24] border-2 border-[#37464f] opacity-50";
        }
        if (isSelected) return "bg-[#202f36] border-2 border-[#5f8428] shadow-[0_2px_0_0_#5f8428]";
        return "bg-[#131f24] border-2 border-[#37464f]";
    };

    const getTextStyling = () => {
        if (showFeedback) {
            if (isCorrectAnswer || isSelected) return "text-white";
            return "text-[#f1f7fb]";
        }
        if (isSelected) return "text-[#79b933]";
        return "text-[#f1f7fb]";
    };
    
    const cardClasses = `flex items-center justify-center inter-font w-full min-h-[60px] px-4 py-3 rounded-xl shadow-md transition-all text-center ${getCardStyling()} ${!showFeedback ? 'cursor-pointer hover:scale-102' : 'cursor-default'}`;
    const textClasses = `font-medium text-base ${getTextStyling()}`;

    return <div className={cardClasses} onClick={showFeedback ? undefined : onClick}><span className={textClasses}>{option.text}</span></div>;
}

// =============================================================================
// Game Data
// =============================================================================
const scenarios = [
  { text: "A teammate keeps bossing you in a group project.", options: ["Why are you always controlling everything?!", "Whatever, do what you want.", "I feel frustrated when you don’t let me share my ideas because I want to be part of the project. I need us to listen to each other."], correctIndex: 2 },
  { text: "A friend often cancels plans last minute.", options: ["I feel disappointed when plans are canceled last minute because I value our time together. I need better notice next time.", "You are so unreliable, I’m done making plans with you.", "Fine, I didn’t want to go anyway."], correctIndex: 0 },
  { text: "A classmate keeps copying your homework.", options: ["Stop copying me! Get your own brain.", "I feel uncomfortable when you copy my work because it’s unfair. I need you to try doing it yourself.", "Whatever, just don’t get caught."], correctIndex: 1 },
  { text: "Your sibling keeps interrupting you during online classes.", options: ["I feel distracted when you interrupt because I need to focus during class. I need you to wait until I'm done.", "Ugh! You’re the worst sibling ever!", "Can you just go away?"], correctIndex: 0 },
];

const dilemmas = scenarios.map((scenario, index) => ({
    id: index + 1, type: 'single-select', question: scenario.text, scenario: `Question ${index + 1}`,
    options: scenario.options.map((optionText, optionIndex) => ({ text: optionText, score: optionIndex === scenario.correctIndex ? 3 : 0 })),
    correctAnswerTexts: [scenario.options[scenario.correctIndex]],
}));

const totalPossibleScore = dilemmas.reduce((total, d) => total + Math.max(...d.options.map(o => o.score)), 0);

// =============================================================================
// State Management with useReducer
// =============================================================================
const initialState = {
    gameState: "intro", currentDilemmaIndex: 0, selectedOptions: [], totalScore: 0,
    feedbackMessage: "", showFeedback: false, dilemmaResults: [], insight: "",
    recommendedSectionId: null, recommendedSectionTitle: ""
};

function gameReducer(state, action) {
    switch (action.type) {
        case 'RESTORE_STATE': return action.payload;
        case 'START_GAME': return { ...initialState, gameState: "playing" };
        case 'SHOW_INSTRUCTIONS': return { ...state, gameState: 'instructions' };
        case 'SELECT_OPTION': return { ...state, selectedOptions: action.payload };
        case 'SUBMIT_ANSWER': {
            const { stepScore, feedback, maxStepScore } = action.payload;
            return {
                ...state,
                totalScore: state.totalScore + stepScore,
                feedbackMessage: feedback,
                showFeedback: true,
                dilemmaResults: [...state.dilemmaResults, {
                    question: dilemmas[state.currentDilemmaIndex].question,
                    scenario: dilemmas[state.currentDilemmaIndex].scenario,
                    selectedOptions: state.selectedOptions,
                    scoreAwarded: stepScore,
                    maxScore: maxStepScore,
                    correctAnswerText: dilemmas[state.currentDilemmaIndex].correctAnswerTexts.join(' & '),
                }]
            };
        }
        case 'NEXT_DILEMMA': {
            const nextIndex = state.currentDilemmaIndex + 1;
            if (nextIndex >= dilemmas.length) {
                return { ...state, gameState: 'finished' };
            }
            return { ...state, currentDilemmaIndex: nextIndex, selectedOptions: [], showFeedback: false, feedbackMessage: "" };
        }
        case 'SET_AI_INSIGHT':
            return {
                ...state,
                insight: action.payload.insight,
                recommendedSectionId: action.payload.recommendedSectionId,
                recommendedSectionTitle: action.payload.recommendedSectionTitle
            };
        case 'REVIEW_GAME': return { ...state, gameState: 'review' };
        case 'BACK_TO_FINISH': return { ...state, gameState: 'finished' };
        case 'RESET_GAME': return { ...initialState, gameState: "playing" };
        default: return state;
    }
}

// =============================================================================
// Main Game Component
// =============================================================================
export default function PersuasionChallenge() {
    const navigate = useNavigate();
    const [state, dispatch] = useReducer(gameReducer, initialState);

    const { gameState, currentDilemmaIndex, selectedOptions, showFeedback, totalScore, dilemmaResults, insight, recommendedSectionTitle, recommendedSectionId } = state;

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

    const currentDilemma = useMemo(() => dilemmas[currentDilemmaIndex], [currentDilemmaIndex]);

    useEffect(() => {
        if (gameState === "finished" && !insight) {
            const generateInsight = async () => {
                dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "" } });
                
                const incorrectAnswers = dilemmaResults
                    .filter(res => res.scoreAwarded < res.maxScore)
                    .map(res => ({
                        question: res.question,
                        your_answer: res.selectedOptions.map(o => o.text).join(' & '),
                        correct_answer: res.correctAnswerText,
                    }));

                if (incorrectAnswers.length === 0) {
                    dispatch({ type: "SET_AI_INSIGHT", payload: { insight: "Flawless victory! You're a natural at using 'I feel' statements to communicate clearly and calmly.", recommendedSectionId: null, recommendedSectionTitle: "" } });
                    return;
                }

                const prompt = `You are an expert AI tutor. A student just finished the 'Persuasion Challenge' game, which focuses on using assertive "I feel..." statements instead of aggressive or passive ones. Your task is to provide targeted feedback.

### CONTEXT ###
1. **Student's Incorrect Answers:** ${JSON.stringify(incorrectAnswers, null, 2)}
2. **All Available Note Sections for this Module:** ${JSON.stringify(notesCommunication6to8.map(n => ({ topicId: n.topicId, title: n.title, content: n.content.substring(0, 150) + '...' })), null, 2)}

### YOUR TWO-STEP TASK ###
1. **Step 1: DETECT.** Analyze the student's mistakes. Did they choose aggressive (blaming) or passive (avoidant) answers? Identify the ONE note section that best addresses this pattern.
2. **Step 2: GENERATE.** Provide a short, encouraging insight (25-30 words). Mention the area for improvement (e.g., "avoiding blame," "being more direct") and suggest reviewing the note section you detected by its 'title'.

### OUTPUT FORMAT ###
Return ONLY a raw JSON object.
{
  "detectedTopicId": "The 'topicId' of the section you identified",
  "insight": "Your personalized and encouraging feedback message here."
}`;

                try {
                    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: prompt }] }] });
                    const aiReply = response.data.candidates[0].content.parts[0].text;
                    const parsed = parsePossiblyStringifiedJSON(aiReply);
                    
                    if (parsed && parsed.insight && parsed.detectedTopicId) {
                        const recommendedNote = notesCommunication6to8.find(note => note.topicId === parsed.detectedTopicId);
                        dispatch({ type: "SET_AI_INSIGHT", payload: { 
                            insight: parsed.insight, 
                            recommendedSectionId: parsed.detectedTopicId, 
                            recommendedSectionTitle: recommendedNote ? recommendedNote.title : "" 
                        }});
                    } else {
                        throw new Error("Failed to parse response from AI or missing required keys.");
                    }
                } catch (err) {
                    console.error("Error fetching AI insight:", err);
                    const fallbackNote = notesCommunication6to8.find(note => note.topicId === '3') || notesCommunication6to8[2];
                    dispatch({ type: "SET_AI_INSIGHT", payload: {
                        insight: `Great effort! To make your points even stronger, try focusing on "I feel" statements. Reviewing the "${fallbackNote.title}" notes can really help!`,
                        recommendedSectionId: fallbackNote.topicId,
                        recommendedSectionTitle: fallbackNote.title
                    }});
                }
            };
            generateInsight();
        }
    }, [gameState, dilemmaResults, insight]);

    const handleSelectOption = (option) => {
        if (showFeedback) return;
        dispatch({ type: 'SELECT_OPTION', payload: [option] });
    };

    const handleSubmit = () => {
        if (!selectedOptions.length) return;
        const stepScore = selectedOptions[0].score;
        const maxStepScore = Math.max(...currentDilemma.options.map(o => o.score));
        const feedback = (stepScore === maxStepScore) ? "Excellent choice! A very persuasive point." : "That might not be the most effective approach.";
        dispatch({ type: 'SUBMIT_ANSWER', payload: { stepScore, feedback, maxStepScore } });
    };

    const isButtonEnabled = useMemo(() => {
        if (showFeedback) return true;
        return selectedOptions.length === 1;
    }, [selectedOptions, showFeedback]);

    const handleNavigateToSection = () => {
        if (recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
            navigate(`/communications/notes?grade=6-8&section=${recommendedSectionId}`);
        }
    };
    
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        // Navigate to a central games hub or the next specific game
        navigate("/communications/games"); 
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        dispatch({ type: 'RESET_GAME' });
    };

    const handleStartGame = () => dispatch({ type: 'START_GAME' });

    const renderGameContent = () => {
        if (gameState === "intro") {
            return <IntroScreen onShowInstructions={() => dispatch({ type: 'SHOW_INSTRUCTIONS' })} title="Persuasion Challenge" />;
        }

        if (gameState === "finished") {
            const accuracyScore = totalPossibleScore > 0 ? Math.round((totalScore / totalPossibleScore) * 100) : 0;
            const isVictory = accuracyScore >= 80;
            return isVictory
                ? <VictoryScreen accuracyScore={accuracyScore} insight={insight} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} />
                : <LosingScreen accuracyScore={accuracyScore} insight={insight} onPlayAgain={handlePlayAgain} onViewFeedback={() => dispatch({ type: 'REVIEW_GAME' })} onContinue={handleContinue} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={recommendedSectionTitle} />;
        }

        if (gameState === "review") {
            return <ReviewScreen answers={dilemmaResults} onBackToResults={() => dispatch({ type: 'BACK_TO_FINISH' })} />;
        }
        
        return (
            <div className="w-full h-screen bg-[#0A160E] flex flex-col">
                <GameNav />
                {gameState === "instructions" && <InstructionsScreen onStartGame={handleStartGame} />}

                <main className="flex-1 flex flex-col items-center justify-center p-4">
                    <div className="w-full max-w-4xl bg-gray-800/30 rounded-xl p-6 md:p-10 text-center">
                        <h2 className="text-slate-100 text-xl md:text-2xl font-medium">{currentDilemma?.question}</h2>
                        <div className="w-full max-w-lg mx-auto mt-6 flex flex-col gap-4">
                            {currentDilemma?.options.map((option, index) => (
                                <OptionCard
                                    key={index} option={option}
                                    isSelected={selectedOptions.some(o => o.text === option.text)}
                                    onClick={() => handleSelectOption(option)}
                                    showFeedback={showFeedback}
                                />
                            ))}
                        </div>
                    </div>
                </main>
                <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4">
                    <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                        <button className="relative w-full h-full" onClick={showFeedback ? () => dispatch({ type: 'NEXT_DILEMMA' }) : handleSubmit} disabled={!isButtonEnabled}>
                            <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                            <span className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lilita text-lg text-white [text-shadow:0_3px_0_#000] ${!isButtonEnabled ? "opacity-50" : ""}`}>
                                {showFeedback ? "Continue" : "Check Now"}
                            </span>
                        </button>
                    </div>
                </footer>
            </div>
        );
    };

    return <>{renderGameContent()}</>;
}