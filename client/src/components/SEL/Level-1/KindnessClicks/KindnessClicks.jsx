import React, { useState, useEffect } from "react";
import { useSEL } from "@/contexts/SELContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import { getSELNotesRecommendation } from "@/utils/getSELNotesRecommendation";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import InstructionOverlay from "./InstructionOverlay";
const questions = [
  {
    text: "Helping pick up books",
    gif: "https://media.tenor.com/jNrWl0aO-wgAAAAM/books-here-are-the-books.gif",
    answer: "Kind",
  },
  {
    text: "Eye rolling during a presentation",
    gif: "https://media.tenor.com/A2DB1HknjCsAAAAM/zendaya-look-away.gif",
    answer: "Unkind",
  },
  {
    text: "Sharing your snack",
    gif: "https://media.tenor.com/z9JR4iptt4YAAAAM/chainsaw-man-denji.gif",
    answer: "Kind",
  },
  {
    text: "Talking behind someone's back",
    gif: "https://media.tenor.com/-VKUR3803i4AAAAM/all-my-friends-are-laughing-behind-my-back-reza-farahan.gif",
    answer: "Unkind",
  },
  {
    text: "Saying “Thank you” to the teacher",
    gif: "https://media.tenor.com/khqMOHcog0UAAAAM/thank-you-so-much-indiana-black.gif",
    answer: "Kind",
  },
  {
    text: "Laughing when someone makes a mistake",
    gif: "https://media.tenor.com/AwMBNB3aRGYAAAAM/my-friends-after-i-make-the-slightest-mistake-jamal-sims.gif",
    answer: "Unkind",
  },
  {
    text: "Including someone new in a game",
    gif: "https://media.tenor.com/ueVHQqyJar8AAAAM/lincoln-clay-handshake.gif",
    answer: "Kind",
  },
  {
    text: "Taking someone’s seat on purpose",
    gif: "https://media.tenor.com/ZOvzOYR0SqIAAAAM/the-boyz-tbz.gif",
    answer: "Unkind",
  },
  {
    text: "Cheering for a classmate",
    gif: "https://media.tenor.com/nN9s7aQvsvEAAAAM/go-cheer.gif",
    answer: "Kind",
  },
  {
    text: "Making fun of someone’s clothes",
    gif: "https://media.tenor.com/tj0X4HSK7_QAAAAM/if-you-dont-like-people-making-fun-of-you-dont-make-fun-of-other-people.gif",
    answer: "Unkind",
  },
];

const results = [
  {
    min: 8,
    message: "Excellent Job! You're a Kindness Champion!",
    gif: "https://media.tenor.com/W-mgWTEXXJEAAAAM/excellent-job-gabriel.gif",
  },
  {
    min: 7,
    message: "Good Effort! Almost there!",
    gif: "https://media.tenor.com/6hgdu5SEjqcAAAAM/ok-ok-now-you-oldwoman.gif",
  },
  {
    min: 6,
    message: "Hmm... I expected better!",
    gif: "https://media.tenor.com/1RXU2f-c1dcAAAAM/i-expected-better-from-you-i-expected-better.gif",
  },
  {
    min: 0,
    message: "Oops! Try again to spot the kindness!",
    gif: "https://media.tenor.com/8Mcowi8IqB4AAAAm/poor-thing-poor-baby.webp",
  },
];

const KindnessClicks = () => {
  const { completeSELChallenge } = useSEL();
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const yay = new Audio(
    "/children-saying-yay-praise-and-worship-jesus-299607.mp3"
  );
  const sadViolin = new Audio("/Sad Violin - Sound Effect (HD).mp3");
  const [showIntro, setShowIntro] = useState(true);
  const [showKidGif, setShowKidGif] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const navigate = useNavigate();
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showInstructions, setShowInstructions] = useState(true); // New state for instructions overlay

  const handleAnswer = (selected) => {
    const correct = questions[current].answer === selected;
    setShowFeedback(true);
    setFeedbackCorrect(correct);

    // 🎉 Show Kid Gif only for first 3 questions
    if (current < 3) {
      setShowKidGif(true);
      setTimeout(() => setShowKidGif(false), 2000);
    }

    const playNext = () => {
      setShowFeedback(false);
      setAnswers([...answers, selected]);

      if (correct) setScore(score + 1);

      if (current + 1 < questions.length) {
        setCurrent(current + 1);
      } else {
        setShowResult(true);
      }
    };

    if (correct) {
      yay.play();
      setTimeout(playNext, 2000); // 2s for correct
    } else {
      sadViolin.currentTime = 0;
      sadViolin.play();

      // Stop audio and proceed after total 3s
      setTimeout(() => {
        sadViolin.pause();
        sadViolin.currentTime = 0;
        playNext();
      }, 3000); // total 3s for incorrect (sound + gif)
    }
  };

  const restartGame = () => {
    setCurrent(0);
    setScore(0);
    setAnswers([]);
    setShowResult(false);
    setShowFeedback(false);
    setStartTime(Date.now());
  };

  const result = results.find((r) => score >= r.min);

  useEffect(() => {
    if (showResult) {
      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);
      const accuracy = (score / questions.length) * 100;
      const avgResponseTimeSec = totalSeconds / questions.length;

      updatePerformance({
        moduleName: "SEL",
        topicName: "selfAwareness",
        score: score * 1, // out of 10
        accuracy,
        avgResponseTimeSec,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: score >= 8,
      });
      setStartTime(Date.now());

      if (score >= 8) {
        completeSELChallenge(0, 2);
      }
    }
  }, [showResult]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!(showResult && score < questions.length)) return; // only if user didn’t get all correct

    // Collect mistakes
    const mistakes = questions
      .map((q, index) => {
        const userAnswer = answers[index];
        if (q.answer === userAnswer) return null;

        return {
          text: `Scenario: "${q.text}" | Correct: ${q.answer} | Your Answer: ${
            userAnswer || "None"
          }`,
          placedIn: "Kindness Clicks",
          correctCategory: "Self-Awareness / Empathy",
        };
      })
      .filter(Boolean);

    if (mistakes.length > 0) {
      getSELNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [showResult, score, answers]);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] flex items-center justify-center p-4">
        <div className="bg-[#202F364D] border border-white rounded-xl shadow-xl w-full max-w-2xl p-6 text-center">
          {!showResult ? (
            <>
              {!showFeedback ? (
                <>
                  <h2 className="text-2xl text-white lilita-one-regular mb-4">
                    {questions[current].text}
                  </h2>
                  <img
                    src={questions[current].gif}
                    alt="gif"
                    className="w-full h-64 object-contain rounded-lg mx-auto mb-6"
                  />
                  <div className="flex justify-center gap-6">
                    <button
                      onClick={() => handleAnswer("Kind")}
                      className="bg-green-500 text-white lilita-one-regular px-6 py-2 rounded hover:bg-green-600"
                    >
                      Kind
                    </button>
                    <button
                      onClick={() => handleAnswer("Unkind")}
                      className="bg-red-500 text-white lilita-one-regular px-6 py-2 rounded hover:bg-red-600"
                    >
                      Unkind
                    </button>
                  </div>
                  <p className="mt-6 text-white lilita-one-regular">
                    Question {current + 1} of {questions.length}
                  </p>
                </>
              ) : (
                <div>
                  <img
                    src={
                      feedbackCorrect
                        ? "https://media.tenor.com/rITwtw_ErAgAAAAm/that%27s-right-corridor-crew.webp"
                        : "https://media.tenor.com/ZAoAvr7axwEAAAAM/what%27s-wrong-with-you-brothers.gif"
                    }
                    alt="feedback"
                    className="w-full h-64 object-contain rounded-lg mx-auto mb-6"
                  />
                </div>
              )}
            </>
          ) : score >= 8 ? (
            /* WIN SCREEN */
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center flex-1 p-6">
                {/* Trophy GIFs */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                  <img
                    src="/financeGames6to8/trophy-rotating.gif"
                    alt="Rotating Trophy"
                    className="absolute w-full h-full object-contain"
                  />
                  <img
                    src="/financeGames6to8/trophy-celebration.gif"
                    alt="Celebration Effects"
                    className="absolute w-full h-full object-contain"
                  />
                </div>

                {/* Success Message */}
                <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                  Challenge Complete!
                </h2>
                <p className="text-[#FFCC00] mt-4 text-center font-semibold">
                  🎉 Great job! You nailed it!
                </p>

                <div className="mt-6 flex flex-col items-center justify-center sm:flex-row sm:items-stretch sm:gap-4">
                  {/* Accuracy Box */}
                  <div className="bg-[#09BE43] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                    <p className="text-black text-sm font-bold mb-1 mt-2">
                      TOTAL ACCURACY
                    </p>
                    <div className="bg-[#131F24] mt-0 flex-1 rounded-xl flex items-center justify-center py-3 px-5 w-full">
                      <img
                        src="/financeGames6to8/accImg.svg"
                        alt="Target Icon"
                        className="w-8 h-8 mr-2"
                      />
                      <span className="text-[#09BE43] text-3xl font-extrabold">
                        {Math.round((score / questions.length) * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Insight Box */}
                  <div className="mt-4 sm:mt-0 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-64 flex-1">
                    <p className="text-black text-sm font-bold mb-1 mt-2">
                      INSIGHT
                    </p>
                    <div className="bg-[#131F24] mt-0 flex-1 rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
                      <p
                        className="text-[#FFCC00] font-bold leading-relaxed"
                        style={{
                          fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                        }}
                      >
                        {score === questions.length
                          ? "🏆 Perfect! You nailed every answer!"
                          : "🌟 Great job! You're on your way to being a SEL Star!"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={restartGame}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/feedback.svg"
                  alt="Feedback"
                  onClick={handleViewFeedback}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/next-challenge.svg"
                  alt="Next Challenge"
                  onClick={handleNextChallenge}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
          ) : (
            /* LOSE SCREEN */
            <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
              <div className="flex flex-col items-center justify-center flex-1 p-6">
                <img
                  src="/financeGames6to8/game-over-game.gif"
                  alt="Game Over"
                  className="w-48 sm:w-64 h-auto mb-4"
                />
                <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl font-semibold text-center">
                  Oops! You didn’t hit the mark this time. Wanna retry?
                </p>
                {/* Notes Recommendation if user mistakes exist */}
                {recommendedNotes.length > 0 && (
                  <div className="mt-6 bg-[#202F364D] p-4 rounded-xl shadow max-w-md text-center">
                    <h3 className="text-white lilita-one-regular text-xl mb-2">
                      📘 Learn & Improve
                    </h3>
                    <p className="text-white mb-3 text-sm leading-relaxed">
                      Based on your mistakes, we recommend revisiting{" "}
                      <span className="text-yellow-300 font-bold">
                        {recommendedNotes.map((n) => n.title).join(", ")}
                      </span>{" "}
                      to strengthen your skills before retrying.
                    </p>
                    {recommendedNotes.map((note) => (
                      <button
                        key={note.topicId}
                        onClick={() =>
                          navigate(
                            `/leadership/notes?grade=6-8&section=${note.topicId}`
                          )
                        }
                        className="bg-yellow-400 text-black lilita-one-regular px-4 py-2 rounded-lg hover:bg-yellow-500 transition block mx-auto my-2"
                      >
                        Go to {note.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
                <img
                  src="/financeGames6to8/retry.svg"
                  alt="Retry"
                  onClick={restartGame}
                  className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/feedback.svg"
                  alt="Feedback"
                  onClick={handleViewFeedback}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
                <img
                  src="/financeGames6to8/next-challenge.svg"
                  alt="Next Challenge"
                  onClick={handleNextChallenge}
                  className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
        {showKidGif && (
          <div
            className="absolute -top-24 sm:-top-30 transform -translate-x-1/2 z-50 flex items-start"
            style={{ left: "85%" }}
          >
            <img
              src="/financeGames6to8/kid-gif.gif"
              alt="Kid Celebration"
              className="object-contain"
              style={{
                maxHeight: "120px",
                height: "auto",
                width: "auto",
              }}
            />
            <img
              src="/financeGames6to8/kid-saying.svg"
              alt="Kid Saying"
              className="absolute top-2 left-[90px] w-24 hidden md:block"
            />
          </div>
        )}
      </div>

      {/* ✅ Popup here */}
      <LevelCompletePopup
        isOpen={isPopupVisible}
        onConfirm={() => {
          setIsPopupVisible(false);
          navigate("/stress-buster-lab"); // your next level
        }}
        onCancel={() => {
          setIsPopupVisible(false);
          navigate("/entrepreneurship/games"); // or exit route
        }}
        onClose={() => setIsPopupVisible(false)}
        title="Challenge Complete!"
        message="Are you ready for the next challenge?"
        confirmText="Next Challenge"
        cancelText="Exit"
      />

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
};

export default KindnessClicks;
