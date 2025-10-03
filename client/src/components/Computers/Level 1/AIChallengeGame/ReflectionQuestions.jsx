import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReflectionQuestions() {
  const [answers, setAnswers] = useState({ q1: "", q2: "", q3: "" });
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAnswers({ ...answers, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (answers.q1 && answers.q2 && answers.q3) {
      setSubmitted(true);
    } else {
      alert("Please answer all questions before submitting.");
    }
  };

  const handleRetry = () => {
    setAnswers({ q1: "", q2: "", q3: "" }); // reset form
    setSubmitted(false); // go back to form
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  const handleNextChallenge = () => {
    navigate("/meet-ai-types");
  };

  if (submitted) {
    return (
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
            Reflection Complete!
          </h2>

          {/* Insight box */}
          <div className="mt-6 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-72">
            <p className="text-black text-sm font-bold mb-1 mt-2">INSIGHT</p>
            <div className="bg-[#131F24] flex-1 rounded-xl flex items-center justify-center px-4 py-3 w-full text-center">
              <p
                className="text-[#FFCC00] font-bold leading-relaxed"
                style={{
                  fontSize: "clamp(0.7rem, 1.2vw, 0.9rem)",
                  whiteSpace: "normal",
                  wordBreak: "break-word",
                }}
              >
                🌟 Great reflections! You're on your way to being an AI
                innovator!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
          <img
            src="/financeGames6to8/retry.svg"
            alt="Retry"
            onClick={handleRetry}
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
    );
  }

  return (
    <div className="mt-12 bg-[#202F364D] rounded-xl shadow-lg p-6 border-2 border-blue-200 space-y-6">
      <h2 className="text-2xl font-bold text-white lilita-one-regular">
        🧠 Reflection Time!
      </h2>

      <div className="space-y-4 text-lg text-gray-800">
        <div>
          <label className="block mb-1 text-white lilita-one-regular">
            🤔 Which AI tool do you use the most?
          </label>
          <input
            type="text"
            name="q1"
            value={answers.q1}
            onChange={handleChange}
            className="w-full text-white p-2 border border-blue-300 rounded"
            placeholder="E.g., Smartphone, Alexa..."
          />
        </div>
        <div>
          <label className="block mb-1 text-white lilita-one-regular">
            😮 Which one surprises you the most?
          </label>
          <input
            type="text"
            name="q2"
            value={answers.q2}
            onChange={handleChange}
            className="w-full text-white p-2 border border-blue-300 rounded"
            placeholder="E.g., Smart TV suggesting shows..."
          />
        </div>
        <div>
          <label className="block mb-1 text-white lilita-one-regular">
            📵 Can you live without AI for a day? Why or why not?
          </label>
          <textarea
            name="q3"
            value={answers.q3}
            onChange={handleChange}
            className="w-full text-white p-2 border border-blue-300 rounded"
            placeholder="Explain in your own words..."
          />
        </div>
        <button
          onClick={handleSubmit}
          className="bg-yellow-400 lilita-one-regular text-outline hover:bg-yellow-500 text-white font-bold px-6 py-2 rounded-full transition-all"
        >
          🚀 Submit Answers
        </button>
      </div>
    </div>
  );
}
