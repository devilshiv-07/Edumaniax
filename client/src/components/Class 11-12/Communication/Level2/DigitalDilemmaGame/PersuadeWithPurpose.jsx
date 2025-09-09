import React, { useState, useEffect } from "react";
import { useCommunication } from "@/contexts/CommunicationContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance

const decisionTreeSteps = [
    {
        question: "What do you do first?",
        options: ["Forward it to a friend", "Message the student privately", "Report it in the class group"],
        correct: 1,
    },
    {
        question: "How do you begin the conversation?",
        options: [
            "“That meme’s really messed up.”",
            "“Hey, I wanted to check in about the meme you posted…”",
            "“You’re going to get into trouble.”",
        ],
        correct: 1,
    },
    {
        question: "What’s your closing line?",
        options: [
            "“Let’s remove the post and avoid hurting anyone.”",
            "“You should apologize or I’ll tell the teacher.”",
            "“Just delete it. It’s embarrassing.”",
        ],
        correct: 0,
    },
];

const etiquetteMatches = [
    {
        id: 1,
        principle: "Think before you share",
        example: "I paused before reposting a screenshot of someone’s private message.",
    },
    {
        id: 2,
        principle: "Assume it’s public",
        example: "I avoided venting about school on Twitter.",
    },
    {
        id: 3,
        principle: "Be constructive",
        example: "I gave polite feedback on someone’s project instead of mocking them.",
    },
];

export default function DigitalDilemmaGame() {
    const { completeCommunicationChallenge } = useCommunication();
    const [started, setStarted] = useState(false);
    const [step, setStep] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [currentAnswer, setCurrentAnswer] = useState(null);
    const [draggedId, setDraggedId] = useState(null);
    const [matches, setMatches] = useState({});
    const [gameOver, setGameOver] = useState(false);
    const [success, setSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(420); // 7 minutes

    //for performance
    const { updatePerformance } = usePerformance();
    const [startTime,setStartTime] = useState(Date.now());

    useEffect(() => {
        if (!started || gameOver) return;
        if (timeLeft === 0) {
            evaluateGame();
            return;
        }
        const timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, started, gameOver]);

    const formatTime = (t) => {
        const min = Math.floor(t / 60);
        const sec = t % 60;
        return `${min}:${sec.toString().padStart(2, "0")}`;
    };

    const handleAnswerChange = (index) => {
        setCurrentAnswer(index);
    };

    const handleAnswerSubmit = () => {
        if (currentAnswer === null) return;
        const updatedAnswers = [...selectedAnswers, currentAnswer];
        setSelectedAnswers(updatedAnswers);
        setCurrentAnswer(null);
        if (step < decisionTreeSteps.length - 1) {
            setStep(step + 1);
        } else {
            setStep(3); // to matching
        }
    };

    const handleDragStart = (id) => {
        setDraggedId(id);
    };

    const handleDrop = (principle) => {
        const matchedItem = etiquetteMatches.find((item) => item.id === draggedId);
        if (matchedItem) {
            setMatches((prev) => ({ ...prev, [principle]: matchedItem.example }));
        }
    };

    const evaluateGame = () => {
        const correctDecisionCount = selectedAnswers.reduce(
            (count, answer, idx) => (answer === decisionTreeSteps[idx].correct ? count + 1 : count),
            0
        );

        const correctMatches = Object.entries(matches).filter(([principle, example]) =>
            etiquetteMatches.find((item) => item.principle === principle && item.example === example)
        ).length === 3;

        const didSucceed = correctDecisionCount >= 2 && correctMatches;
        setSuccess(didSucceed);
        setGameOver(true);

        const endTime = Date.now();
        const totalTimeSec = Math.floor((endTime - startTime) / 1000);
        const studyTimeMinutes = Math.max(1, Math.round(totalTimeSec / 60));
        const avgResponseTimeSec = Math.floor(totalTimeSec / decisionTreeSteps.length);
        const accuracy = Math.round((correctDecisionCount / decisionTreeSteps.length) * 100);
        const score = didSucceed ? 10 : 5;


        if (didSucceed) {
            completeCommunicationChallenge(1, 1);
        }

        // ✅ Update performance
        updatePerformance({
            moduleName: "Communication",
            topicName: "situationalAwareness",
            completed: didSucceed,
            studyTimeMinutes,
            avgResponseTimeSec,
            score,
            accuracy,
        });
    };



    const handleRestart = () => {
        setStarted(false);
        setStep(0);
        setSelectedAnswers([]);
        setCurrentAnswer(null);
        setDraggedId(null);
        setMatches({});
        setGameOver(false);
        setSuccess(false);
        setTimeLeft(420);
        setStartTime(Date.now());

    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-purple-200 p-6 text-gray-800 relative overflow-hidden">
            {!started ? (
                <div className="max-w-3xl mx-auto mt-12 bg-blue-50 bg-opacity-90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center space-y-6 animate-fade-in-up border-[3px] border-dotted border-pink-300">
                    <div className="z-50 py-4 text-center bg-gradient-to-r from-pink-100 to-yellow-100 rounded-full shadow-md">
                        <h1 className="text-5xl font-extrabold text-pink-600 animate-bounce drop-shadow-lg">🎮 Digital Dilemma</h1>
                        <div className="mt-2 text-lg font-bold text-indigo-800">
                            ⏳ Time Left:
                            <span
                                className={`ml-3 px-4 py-1 rounded-full font-mono shadow-md ${timeLeft <= 60
                                    ? "bg-red-300 text-red-900 animate-pulse"
                                    : "bg-green-200 text-green-800"
                                    }`}
                            >
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-purple-800 drop-shadow-sm">✨ What You'll Do:</h2>
                    <p className="text-lg leading-relaxed text-blue-900 font-medium">
                        You’re a class representative. A classmate posted a sarcastic meme targeting a teacher on your school group. It’s going viral. You must choose how to handle this digitally and respectfully.💬💡!
                    </p>
                    <ul className="text-left list-disc list-inside text-lg text-purple-800 space-y-2 px-4">

                        <li>📌 You will face 3 real-life situations. Pick the best response in each.</li>
                        <li>🎯 Then, drag the correct example to match each digital rule.</li>
                        <li>✅ Get at least 2 scenario answers right and all 3 matches correct to win!</li>
                        <li>🕒 You have 7 minutes!</li>
                    </ul>
                    <button
                        onClick={() => setStarted(true)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:scale-105 text-white font-bold py-3 px-8 rounded-full text-xl mt-4 transition-all duration-300 shadow-lg hover:shadow-2xl"
                    >
                        🚀 Start the Game!
                    </button>
                </div>
            ) : (
                <>
                    {!gameOver && step < 3 && (
                        <div className="max-w-3xl mx-auto bg-blue-50 bg-opacity-90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center space-y-8 mt-10 animate-fade-in-up border-4 border-dotted border-purple-300">

                            {/* Sticky Title Bar */}
                            <div className=" bg-gradient-to-r from-pink-100 via-yellow-100 to-blue-100 py-5 z-50 shadow-lg rounded-full mb-4">
                                <h1 className="text-5xl font-extrabold text-pink-600 animate-bounce drop-shadow-lg">🎮 Digital Dilemma</h1>
                                <div className="mt-2 text-lg font-bold text-indigo-800">
                                    ⏳ Time Left:
                                    <span className={`ml-2 px-4 py-1 rounded-full font-mono shadow-md ${timeLeft <= 60
                                        ? "bg-red-300 text-red-900 animate-pulse"
                                        : "bg-green-200 text-green-800"
                                        }`}>
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>

                            {/* Question */}
                            <h2 className="text-3xl font-bold text-purple-800 drop-shadow-md animate-fade-in">💡 {decisionTreeSteps[step].question}</h2>

                            {/* Options */}
                            <div className="space-y-4">
                                {decisionTreeSteps[step].options.map((opt, idx) => (
                                    <label
                                        key={idx}
                                        className={`block cursor-pointer px-5 py-3 rounded-full border text-lg tracking-wide transition-all duration-300 ${currentAnswer === idx
                                            ? "bg-yellow-200 border-yellow-500 font-semibold scale-105 shadow-md"
                                            : "bg-blue-100 border-blue-300 hover:bg-blue-200"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`q-${step}`}
                                            value={idx}
                                            checked={currentAnswer === idx}
                                            onChange={() => handleAnswerChange(idx)}
                                            className="mr-2"
                                        />
                                        {opt}
                                    </label>
                                ))}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleAnswerSubmit}
                                disabled={currentAnswer === null}
                                className={`mt-4 px-8 py-3 rounded-full text-lg font-bold shadow-lg transition transform hover:scale-105 ${currentAnswer === null
                                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                    : "bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700"
                                    }`}
                            >
                                ✅ Submit Answer
                            </button>
                        </div>
                    )}


                    {!gameOver && step === 3 && (
                        <div className="max-w-6xl mx-auto bg-blue-50 bg-opacity-90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center space-y-8 mt-10 animate-fade-in-up border-4 border-dotted border-indigo-300">

                            {/* Sticky Header */}
                            <div className=" bg-gradient-to-r from-yellow-200 via-pink-100 to-blue-200 py-5 z-50 shadow-lg rounded-full mb-2">
                                <h1 className="text-5xl font-extrabold text-pink-600 animate-bounce drop-shadow-lg">🎮 Digital Dilemma</h1>
                                <div className="mt-2 text-lg font-bold text-indigo-800">
                                    ⏳ Time Left:
                                    <span
                                        className={`ml-2 px-4 py-1 rounded-full font-mono shadow-md ${timeLeft <= 60
                                            ? "bg-red-300 text-red-900 animate-pulse"
                                            : "bg-green-200 text-green-800"
                                            }`}
                                    >
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>

                            {/* Heading */}
                            <h2 className="text-3xl font-bold text-purple-700 drop-shadow-md animate-fade-in">
                                🧠 Match the Digital Etiquette Rules with the Right Example
                            </h2>
                            <p className="text-md text-gray-600 italic animate-fade-in-slow">
                                💡 Drag the examples below to the matching rules!
                            </p>

                            {/* Draggable Examples */}
                            <div className="w-full flex justify-center">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl animate-fade-in-up px-4">
                                    {etiquetteMatches.map((item) => (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={() => handleDragStart(item.id)}
                                            className="bg-gradient-to-r from-yellow-200 via-pink-100 to-yellow-100 border-4 border-yellow-400 p-5 rounded-3xl shadow-xl cursor-grab transform transition-all duration-300 ease-in-out hover:scale-105 hover:rotate-1 hover:shadow-2xl text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2"
                                        >
                                            🎯 <span>{item.example}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>



                            {/* Drop Zones */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-10 justify-items-center animate-fade-in-up">
                                {etiquetteMatches.map(({ principle }) => (
                                    <div
                                        key={principle}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={() => handleDrop(principle)}
                                        className="w-full min-h-[140px] max-w-xs bg-gradient-to-br from-purple-100 via-pink-50 to-purple-200 border-4 border-dashed border-purple-400 p-5 rounded-3xl text-purple-900 text-lg font-bold shadow-xl transition-transform transform hover:scale-105 hover:shadow-2xl duration-300 flex flex-col justify-center items-center"
                                    >
                                        💬 <span className="text-xl mb-2">{principle}</span>
                                        <div className="text-sm text-gray-700 font-medium text-center px-2">
                                            {matches[principle] || "⬇️ Drop an example here"}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {/* Submit Button */}
                            <button
                                onClick={evaluateGame}
                                className="mt-8 bg-gradient-to-r from-green-400 to-teal-500 hover:from-green-500 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transition transform hover:scale-105"
                            >
                                ✅ Finish Game
                            </button>
                        </div>
                    )}

                    {gameOver && (
                        <div className="max-w-2xl mx-auto text-center bg-blue-50 p-10 rounded-3xl shadow-2xl mt-12 animate-fade-in-up border-4 border-dotted border-purple-300 relative overflow-hidden">

                            {/* Sticky Header */}
                            <div className=" bg-gradient-to-r from-yellow-200 via-pink-100 to-blue-200 py-5 z-50 shadow-lg rounded-full mb-6">
                                <h1 className="text-5xl font-extrabold text-pink-600 animate-bounce drop-shadow-lg">🎮 Digital Dilemma</h1>
                                <div className="mt-2 font-semibold text-lg text-indigo-700">
                                    ⏳ Time Left:
                                    <span
                                        className={`ml-2 px-4 py-1 rounded-full font-mono shadow-md ${timeLeft <= 60
                                            ? "bg-red-300 text-red-900 animate-pulse"
                                            : "bg-green-200 text-green-800"
                                            }`}
                                    >
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                            </div>

                            {/* Game Outcome */}
                            <h2 className={`text-4xl font-extrabold mb-4 animate-pulse ${success ? "text-green-600" : "text-red-600"}`}>
                                {success
                                    ? "🎉 Great Job!"
                                    : timeLeft <= 0
                                        ? "⏰ Time’s Up!"
                                        : "❌ Try Again!"}
                            </h2>

                            <p className="text-lg text-gray-800 mb-6 leading-relaxed">
                                {success ? (
                                    "You responded with kindness, made respectful decisions, and showed great digital manners! 🌟"
                                ) : timeLeft <= 0 ? (
                                    "⏰ Time’s up! You ran out of time before finishing. Take a deep breath and try again! 💪"
                                ) : (
                                    "Oops! Some answers were incorrect. Review the situations and give it another go! 💡"
                                )}
                            </p>

                            {/* Restart Button */}
                            <button
                                onClick={handleRestart}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-full shadow-lg text-lg transition transform hover:scale-105"
                            >
                                🔄 Play Again!
                            </button>

                            {/* Optional Confetti or Firework Effect Placeholder */}
                            {success && (
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none animate-confetti opacity-20"></div>
                            )}
                        </div>
                    )}

                </>
            )}
        </div>
    );
}