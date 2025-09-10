import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";
import axios from 'axios';

// --- Context Hooks ---
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext";

// --- Data for AI-powered recommendations (UPDATED as requested) ---
import { notesCommunication11to12 } from "@/data/notesCommunication11to12.js";

// --- Icon & Page Components (ensure paths are correct) ---
import Checknow from '@/components/icon/GreenBudget/Checknow';
import GameNav from "./GameNav";
import IntroScreen from './IntroScreen';
import InstructionsScreen from './InstructionsScreen';

// --- Helper for hiding scrollbar & parsing JSON ---
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

function parsePossiblyStringifiedJSON(text) {
    if (typeof text !== "string") return null;
    text = text.trim();
    if (text.startsWith("```")) { text = text.replace(/^```(json)?/, "").replace(/```$/, "").trim(); }
    if (text.startsWith("`") && text.endsWith("`")) { text = text.slice(1, -1).trim(); }
    try { return JSON.parse(text); } catch (err) { console.error("Failed to parse JSON:", err); return null; }
}

// --- Game Constants ---
const APIKEY = import.meta.env.VITE_API_KEY;
const SESSION_STORAGE_KEY = 'toneSimulatorGameState';
const PASSING_THRESHOLD = 70; // 70% accuracy to win

// --- MODEL ANSWERS & SCENARIOS FOR TONE SIMULATOR ---
const MODEL_ANSWERS = {
    scenario1: { choice: "B", text: "That sounds rough. Want to talk about it?", explanation: "This response shows empathy and opens the door for conversation without being dismissive or overly casual." },
    scenario2: { text: "Noted, sir. I will ensure the report is submitted before the 6 PM deadline.", explanation: "A good formal response is respectful, confirms the instruction, and acknowledges key details." },
    scenario3: { choice: "B", text: "I’m sorry it came across that way. Let’s talk after class.", explanation: "This is an assertive and respectful response. It validates the peer's feelings and proposes a constructive next step." }
};

const SCENARIOS = [
    { id: 1, title: "Scenario 1: Friend in Need", prompt: "Your friend seems down and says: “I’m so done with school. Nothing makes sense anymore.”", options: [{ key: "A", text: "Yeah, I know right? LOL sameee." }, { key: "B", text: "That sounds rough. Want to talk about it?" }, { key: "C", text: "Well, school’s important. Maybe don’t complain?" }] },
    { id: 2, title: "Scenario 2: Formal Request", prompt: "Your Principal says: “Please submit the final project report by 6 PM today.”" },
    { id: 3, title: "Scenario 3: Peer in Conflict", prompt: "A peer accuses you: “You took all the credit for the project in front of the teacher.”", options: [{ key: "A", text: "Excuse me? That’s not what happened." }, { key: "B", text: "I’m sorry it came across that way. Let’s talk after class." }, { key: "C", text: "Why are you always so dramatic?" }] }
];

// =============================================================================
//  End-Screen & Review Screen Components (With UI Box Fix)
// =============================================================================

function VictoryScreen({ onRestart, onViewFeedback, onContinue, accuracyScore, insight }) {
    const { width, height } = useWindowSize();
    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <div className="relative w-48 h-48 md:w-56 md:h-56 shrink-0"><img src="/financeGames6to8/trophy-rotating.gif" alt="Rotating Trophy" className="absolute w-full h-full object-contain" /><img src="/financeGames6to8/trophy-celebration.gif" alt="Celebration Effects" className="absolute w-full h-full object-contain" /></div>
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">Challenge Complete!</h2>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-xl">
                    <div className="flex-1 bg-[#09BE43] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p><div className="bg-[#131F24] w-full flex-grow rounded-lg flex items-center justify-center py-3 px-5"><img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" /><span className="text-[#09BE43] text-2xl font-extrabold">{accuracyScore}%</span></div></div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Insight</p><div className="bg-[#131F24] w-full flex-grow rounded-lg flex items-center justify-center px-4 text-center"><span className="text-[#FFCC00] lilita-one-regular text-sm font-normal">{insight}</span></div></div>
                </div>
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-4 shrink-0"><img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /><img src="/financeGames6to8/retry.svg" alt="Play Again" onClick={onRestart} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /><img src="/financeGames6to8/next-challenge.svg" alt="Next Challenge" onClick={onContinue} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /></div>
        </div>
    );
}

function LossScreen({ onPlayAgain, onViewFeedback, insight, accuracyScore, onNavigateToSection, recommendedSectionTitle }) {
    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4 overflow-y-auto no-scrollbar">
                <img src="/financeGames6to8/game-over-game.gif" alt="Game Over" className="w-48 h-auto md:w-56 mb-6 shrink-0" />
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center">Oops! That was close!</p>
                <p className="text-yellow-400 lilita-one-regular text-2xl sm:text-3xl font-semibold text-center mb-6">Wanna Retry?</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4 w-full max-w-md md:max-w-2xl">
                    <div className="flex-1 bg-red-500 rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Total Accuracy</p><div className="bg-[#131F24] w-full flex-grow rounded-lg flex items-center justify-center py-3 px-5"><img src="/financeGames6to8/accImg.svg" alt="Target Icon" className="w-6 h-6 mr-2" /><span className="text-red-500 text-2xl font-extrabold">{accuracyScore}%</span></div></div>
                    <div className="flex-1 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center"><p className="text-black text-sm font-bold my-2 uppercase">Insight</p><div className="bg-[#131F24] w-full flex-grow rounded-lg flex items-center justify-center px-4 text-center"><span className="text-[#FFCC00] inter-font text-sm font-normal">{insight}</span></div></div>
                </div>
                {recommendedSectionTitle && <div className="mt-8 w-full max-w-md md:max-w-2xl flex justify-center"><button onClick={onNavigateToSection} className="bg-[#068F36] text-black text-sm font-semibold rounded-lg py-3 px-10 md:px-6 hover:bg-green-700 transition-all transform border-b-4 border-green-800 active:border-transparent shadow-lg">Review "{recommendedSectionTitle}" Notes</button></div>}
            </div>
            <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex flex-wrap justify-center gap-4 shrink-0"><img src="/financeGames6to8/feedback.svg" alt="Feedback" onClick={onViewFeedback} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /><img src="/financeGames6to8/retry.svg" alt="Retry" onClick={onPlayAgain} className="cursor-pointer h-9 md:h-14 object-contain hover:scale-105" /></div>
        </div>
    );
}

function ReviewScreen({ reviewData, onBackToResults }) {
    return (
        <div className="w-full min-h-screen bg-[#0A160E] text-white p-4 md:p-6 flex flex-col items-center">
            <style>{scrollbarHideStyle}</style>
            <h1 className="text-3xl md:text-4xl font-bold lilita-one-regular mb-6 text-yellow-400 flex-shrink-0">Review Your Answers</h1>
            <div className="w-full max-w-6xl flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto p-2 no-scrollbar">
                {reviewData.map((data, idx) => (
                    <div key={idx} className={`p-4 rounded-xl flex flex-col ${data.isCorrect ? 'bg-green-900/70 border-green-700' : 'bg-red-900/70 border-red-700'} border space-y-3`}>
                        <h3 className="text-lg font-bold text-yellow-300">{data.title}</h3>
                        <div>
                            <p className="font-semibold text-gray-300">Your Answer:</p>
                            <p className={`italic ${data.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                                "{data.userAnswerText}"
                            </p>
                        </div>
                        {!data.isCorrect && (
                            <div>
                                <p className="font-semibold text-gray-300">Ideal Answer:</p>
                                <p className="italic text-green-400">"{data.correctAnswerText}"</p>
                            </div>
                        )}
                        <div className="pt-2">
                            <p className="font-semibold text-gray-300">Explanation:</p>
                            <p className="text-gray-400 text-sm">{data.explanation}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button
                onClick={onBackToResults}
                className="mt-6 px-8 py-3 bg-yellow-600 text-lg text-white lilita-one-regular rounded-md hover:bg-yellow-700 transition-colors flex-shrink-0 border-b-4 border-yellow-800 active:border-transparent shadow-lg"
            >
                Back to Results
            </button>
        </div>
    );
}

// =============================================================================
// Main Game Component
// =============================================================================
export default function ToneSimulatorGame() {
    const navigate = useNavigate();
    const { completeCommunicationChallenge } = useCommunication();
    const { updatePerformance } = usePerformance();

    const [gameState, setGameState] = useState({
        screen: 'intro',
        endScreen: null, gameKey: Date.now(),
        userAnswers: { scenario1: "", scenario2: "", scenario3: "" },
        gameResults: null, insight: "Analyzing your results...",
        recommendedSectionId: null, recommendedSectionTitle: "",
        accuracyScore: 0, loading: false, startTime: Date.now()
    });

    // --- NEW: Load from session storage on mount ---
    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (savedStateJSON) {
            try {
                setGameState(JSON.parse(savedStateJSON));
                sessionStorage.removeItem(SESSION_STORAGE_KEY); // Clean up after loading
            } catch (error) {
                console.error("Failed to parse saved game state:", error);
                sessionStorage.removeItem(SESSION_STORAGE_KEY); // Clean up corrupted data
            }
        }
    }, []);

    const handleTimeUp = () => {
        setGameState(prev => ({ ...prev, screen: 'loss', endScreen: 'loss', accuracyScore: 0, insight: "Time ran out! Adapting your tone quickly is a crucial skill.", gameResults: { userAnswers: prev.userAnswers, scores: { score1: 0, score2: 0, score3: 0 }, reviewData: [] } }));
    };

    // --- NEW: Clear session storage on restart ---
    const handleRestart = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setGameState({ screen: 'intro', endScreen: null, gameKey: Date.now(), userAnswers: { scenario1: "", scenario2: "", scenario3: "" }, gameResults: null, insight: "Analyzing your results...", recommendedSectionId: null, recommendedSectionTitle: "", accuracyScore: 0, loading: false, startTime: Date.now() });
    };

    const handleShowInstructions = () => setGameState(prev => ({ ...prev, screen: 'instructions' }));
    const handleStartGame = () => setGameState(prev => ({ ...prev, screen: 1, startTime: Date.now(), gameKey: Date.now() }));
    const handleViewFeedback = () => setGameState(prev => ({ ...prev, screen: 'review' }));
    const handleBackToResults = () => setGameState(prev => ({ ...prev, screen: prev.endScreen }));
    
    // --- NEW: Clear session storage on continue ---
    const handleContinue = () => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        navigate('/communications/games');
    };

    // --- NEW: Save state to session storage before navigating ---
    const handleNavigateToSection = () => {
        if (gameState.recommendedSectionId) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(gameState));
            navigate(`/communications/notes?grade=11-12&section=${gameState.recommendedSectionId}`);
        }
    };

    const handleAnswer = (scenario, value) => setGameState(prev => ({ ...prev, userAnswers: { ...prev.userAnswers, [scenario]: value } }));
    const handleNextScreen = () => setGameState(prev => ({ ...prev, screen: prev.screen + 1 }));

    const handleSubmit = async () => {
        setGameState(prev => ({...prev, loading: true}));
        const { userAnswers, startTime } = gameState;

        const score1 = userAnswers.scenario1 === MODEL_ANSWERS.scenario1.choice ? 3 : 0;
        const score3 = userAnswers.scenario3 === MODEL_ANSWERS.scenario3.choice ? 3 : 0;

        const scoringPrompt = `You are an AI evaluator. A student's principal said: "Please submit the final project report by 6 PM today." The student's response was: "${userAnswers.scenario2}".
        ### TASK: Evaluate the response on a scale of 0-4 and return ONLY a valid JSON object.
        ### CRITERIA:
        - Politeness/Respect (0-2 pts): 2 for "sir"/"ma'am", 1 for polite, 0 for rude.
        - Clarity/Confirmation (0-1 pt): 1 for acknowledging "report" or "submit".
        - Professional Tone (0-1 pt): 1 for professional, 0 for casual.
        ### FORMAT: { "score": <number> }`;
        
        let score2 = 0;
        try {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ contents: [{ parts: [{ text: scoringPrompt }] }] }) });
            const data = await res.json();
            score2 = parsePossiblyStringifiedJSON(data.candidates[0].content.parts[0].text)?.score || 0;
        } catch (error) { console.error("AI scoring failed:", error); score2 = 1; }

        const totalScore = score1 + score2 + score3;
        const accuracy = Math.round((totalScore / 10) * 100);
        const findOptionText = (options, key) => options.find(opt => opt.key === key)?.text || "No Answer";
        
        const reviewData = [
            { isCorrect: score1 > 0, title: SCENARIOS[0].title, userAnswerText: findOptionText(SCENARIOS[0].options, userAnswers.scenario1), correctAnswerText: MODEL_ANSWERS.scenario1.text, explanation: MODEL_ANSWERS.scenario1.explanation },
            { isCorrect: score2 >= 3, title: SCENARIOS[1].title, userAnswerText: userAnswers.scenario2 || 'No answer given', correctAnswerText: MODEL_ANSWERS.scenario2.text, explanation: MODEL_ANSWERS.scenario2.explanation },
            { isCorrect: score3 > 0, title: SCENARIOS[2].title, userAnswerText: findOptionText(SCENARIOS[2].options, userAnswers.scenario3), correctAnswerText: MODEL_ANSWERS.scenario3.text, explanation: MODEL_ANSWERS.scenario3.explanation }
        ];
        const results = { userAnswers, scores: { score1, score2, score3 }, reviewData };

        updatePerformance({ moduleName: "Communication", topicName: "communicationSkills", completed: accuracy >= PASSING_THRESHOLD, studyTimeMinutes: Math.max(1, Math.round(((Date.now() - startTime) / 1000) / 60)), avgResponseTimeSec: Math.floor(((Date.now() - startTime) / 1000) / 3), score: totalScore, accuracy: accuracy });
        
        if (accuracy >= PASSING_THRESHOLD) {
            completeCommunicationChallenge(0, 2); 
            setGameState(prev => ({...prev, screen: 'victory', endScreen: 'victory', insight: "Excellent work! You effectively adjusted your tone for each unique situation.", accuracyScore: accuracy, gameResults: results, loading: false}));
        } else {
            // --- NEW: AI-POWERED INSIGHT & RECOMMENDATION LOGIC ---
            const incorrectAnswers = reviewData.filter(r => !r.isCorrect).map(r => ({
                scenario: r.title,
                your_answer: r.userAnswerText,
                ideal_answer: r.correctAnswerText,
                explanation: r.explanation
            }));

            const insightPrompt = `You are an expert AI tutor. A student has finished a "Tone Simulator" game and made mistakes. Your task is to provide targeted feedback.
            ### CONTEXT ###
            1. **Student's Incorrect Answers:** ${JSON.stringify(incorrectAnswers, null, 2)}
            2. **All Available Note Sections for this Module:** ${JSON.stringify(notesCommunication11to12.map(n => ({topicId: n.topicId, title: n.title, content: n.content.substring(0, 200) + '...'})), null, 2)}
            ### YOUR TWO-STEP TASK ###
            1. **Step 1: DETECT.** Analyze the student's mistakes. Did they struggle with formal tone, empathy, or conflict resolution? Identify the ONE note section that is the best match for their errors.
            2. **Step 2: GENERATE.** Based on their performance, provide a short, encouraging, and educational insight (about 25-30 words). Identify their main area for improvement (e.g., "handling formal requests," "showing empathy," "managing conflict assertively") and suggest reviewing the note section you detected by its 'title'.
            ### OUTPUT FORMAT ###
            Return ONLY a raw JSON object. Do not use markdown.
            { "detectedTopicId": "The 'topicId' of the section you identified", "insight": "Your personalized and encouraging feedback message here." }`;

            try {
                const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${APIKEY}`, { contents: [{ parts: [{ text: insightPrompt }] }] });
                const aiReply = response.data.candidates[0].content.parts[0].text;
                const parsed = parsePossiblyStringifiedJSON(aiReply);

                if (parsed && parsed.insight && parsed.detectedTopicId) {
                    const recommendedNote = notesCommunication11to12.find(note => note.topicId === parsed.detectedTopicId);
                    setGameState(prev => ({
                        ...prev,
                        screen: 'loss',
                        endScreen: 'loss',
                        insight: parsed.insight,
                        recommendedSectionId: parsed.detectedTopicId,
                        recommendedSectionTitle: recommendedNote ? recommendedNote.title : "",
                        accuracyScore: accuracy,
                        gameResults: results,
                        loading: false
                    }));
                } else { throw new Error("Failed to parse response from AI."); }
            } catch (err) {
                console.error("Error fetching AI insight:", err);
                // Fallback insight
                setGameState(prev => ({
                    ...prev,
                    screen: 'loss',
                    endScreen: 'loss',
                    insight: "Good attempt! Reviewing the module notes on communication styles can help sharpen your responses.",
                    recommendedSectionId: notesCommunication11to12[0]?.topicId || null, // Recommend first note as a fallback
                    recommendedSectionTitle: notesCommunication11to12[0]?.title || "",
                    accuracyScore: accuracy,
                    gameResults: results,
                    loading: false
                }));
            }
        }
    };
    
    const { screen, gameKey, userAnswers, loading, gameResults, insight, recommendedSectionTitle, accuracyScore } = gameState;
    const isNextDisabled = screen > 0 && screen <= 3 && !userAnswers[`scenario${screen}`];

    // --- RENDER LOGIC ---

    if (screen === 'intro') {
        return <IntroScreen onShowInstructions={handleShowInstructions} />;
    }

    if (['review', 'victory', 'loss'].includes(screen)) {
        return (
            <div className="w-full h-screen bg-[#0A160E]">
                {screen === 'review' && gameResults?.reviewData && <ReviewScreen reviewData={gameResults.reviewData} onBackToResults={handleBackToResults} />}
                {screen === 'victory' && <VictoryScreen onRestart={handleRestart} onViewFeedback={handleViewFeedback} onContinue={handleContinue} accuracyScore={accuracyScore} insight={insight} />}
                {screen === 'loss' && <LossScreen onPlayAgain={handleRestart} onViewFeedback={handleViewFeedback} insight={insight} accuracyScore={accuracyScore} onNavigateToSection={handleNavigateToSection} recommendedSectionTitle={recommendedSectionTitle} />}
            </div>
        );
    }
    
    const currentScenario = SCENARIOS.find(s => s.id === screen);

    return (
        <div className="w-full h-screen bg-[#0A160E] flex flex-col inter-font relative text-white">
            <GameNav key={gameKey} onTimeUp={handleTimeUp} durationInSeconds={7 * 60}/>
            <main className="flex-1 w-full flex flex-col items-center justify-center p-4 overflow-auto no-scrollbar">
                {currentScenario && (
                    <div className="w-full max-w-3xl bg-[rgba(32,47,54,0.3)] rounded-xl p-4 md:p-6 space-y-6">
                        <h3 className="text-xl font-bold text-yellow-400 mb-2 text-center">{currentScenario.title}</h3>
                        <p className="text-center text-gray-300 mb-4">{currentScenario.prompt}</p>
                        {currentScenario.options ? (
                            <div className="flex flex-col items-center gap-3">{currentScenario.options.map(({ key, text }) => (<button key={key} onClick={() => handleAnswer(`scenario${screen}`, key)} className={`w-full max-w-md px-4 py-3 rounded-lg text-sm md:text-base font-semibold transition-all duration-200 shadow-sm ${userAnswers[`scenario${screen}`] === key ? "bg-blue-500 text-white border-blue-400" : "bg-[#131f24] text-gray-300 border border-[#37464f] hover:bg-gray-700"}`}>{text}</button>))}</div>
                        ) : (
                            <textarea className="w-full p-3 rounded-lg border border-[#37464f] bg-[#131f24] text-[#f1f7fb] shadow-lg focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Write a formal, one-line reply..." value={userAnswers.scenario2} onChange={(e) => handleAnswer('scenario2', e.target.value)} />
                        )}
                    </div>
                )}
            </main>
            <footer className="w-full h-[10vh] bg-[#28343A] flex justify-center items-center px-4 shrink-0">
                <div className="w-full max-w-xs lg:w-[15vw] h-[7vh] lg:h-[8vh]">
                    <button className="relative w-full h-full cursor-pointer" onClick={screen < 3 ? handleNextScreen : handleSubmit} disabled={isNextDisabled || loading}>
                        <Checknow topGradientColor="#09be43" bottomGradientColor="#068F36" width="100%" height="100%" />
                        <span className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-base md:text-xl lg:text-[2.8vh] text-white [text-shadow:0_3px_0_#000] lilita-one-regular ${isNextDisabled || loading ? "opacity-50" : ""}`}>
                            {loading ? "Checking..." : screen < 3 ? "Next" : "Submit"}
                        </span>
                    </button>
                </div>
            </footer>
            {screen === 'instructions' && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
                    <InstructionsScreen onStartGame={handleStartGame} />
                </div>
            )}
        </div>
    );
}