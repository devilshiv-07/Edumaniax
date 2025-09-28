// components/AIStartupBuilder.jsx
import React, { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useEntrepreneruship } from "@/contexts/EntreprenerushipContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";
import { getEntrepreneurshipNotesRecommendation } from "@/utils/getEntrepreneurshipNotesRecommendation";
import InstructionOverlay from "./InstructionOverlay";

const initialState = {
  name: "",
  description: "",
  features: ["", "", ""],
  aiTypes: "",
  logo: null,
  review: "",
  enhanced: false,
  submitted: false,
};

const getReviewPrompt = (desc, features) => `
You're an AI startup mentor. A student has written this idea:

💼 Description:
${desc}

✨ Features:
${features.join("\n")}

Please give very simple, 1–2 line feedback in kid-friendly language:
✅ If it's good, say "Looks awesome! 🌟 You’re a Startup Star!".
🛠️ If it needs work, say "Hmm, let’s tweak it a bit..." and give a friendly idea to improve.
Be short, clear, and fun!`;

const kidFriendlyTypes = [
  "NLP (Understands language)",
  "Vision (Sees pictures)",
  "Speech (Talks and listens)",
  "Robotics (Helps robots think)",
  "Recommendation (Gives smart suggestions)",
];

const AIStartupBuilder = () => {
  const { completeEntreprenerushipChallenge } = useEntrepreneruship();
  const [step, setStep] = useState("builder");
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [reviewed, setReviewed] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const navigate = useNavigate();
  const [showFeedback, setShowFeedback] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true); // New state for instructions overlay

  useEffect(() => {
    if (form.review.startsWith("Looks awesome") && form.submitted) {
      completeEntreprenerushipChallenge(0, 1); // Update ID as needed
    }
  }, [form.review, form.submitted]);

  useEffect(() => {
    if (form.submitted && !form.review.startsWith("Looks awesome")) {
      // Collect mistakes summary for this game
      const mistakes = {
        description: form.description,
        features: form.features,
        aiTypes: form.aiTypes,
      };

      getEntrepreneurshipNotesRecommendation(mistakes).then((notes) =>
        setRecommendedNotes(notes)
      );
    }
  }, [
    form.submitted,
    form.review,
    form.description,
    form.features,
    form.aiTypes,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...form.features];
    updated[index] = value;
    setForm((prev) => ({ ...prev, features: updated }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setForm((prev) => ({ ...prev, logo: file }));
  };

  const canSubmit = reviewed;

  const getReview = async () => {
    setLoading(true);
    const prompt = getReviewPrompt(form.description, form.features);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${
          import.meta.env.VITE_API_KEY
        }`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
      const data = await res.json();
      const feedback =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "⚠️ Couldn't get feedback.";
      setForm((prev) => ({ ...prev, review: feedback }));
      setReviewed(true); // ✅ only show feedback after verify clicked
    } catch (err) {
      setForm((prev) => ({ ...prev, review: "❌ Error getting feedback." }));
      setReviewed(true);
    }
    setLoading(false);
  };

  const resetFieldsOnly = () => {
    setForm((prev) => ({
      ...prev,
      name: "",
      description: "",
      features: ["", "", ""],
      aiTypes: "",
      logo: null,
      review: prev.review,
      enhanced: prev.enhanced,
      submitted: false,
    }));
  };

  const resetGame = () => {
    setForm(initialState);
    setStep("builder");
    setStartTime(Date.now());
  };

  const handleSubmit = () => {
    if (!reviewed) return; // safety: must verify first

    setForm((prev) => ({ ...prev, submitted: true }));

    // ✅ Performance tracking only if WIN
    if (form.review.startsWith("Looks awesome")) {
      const endTime = Date.now();
      const timeTakenSec = (endTime - startTime) / 1000;
      const timeTakenMin = Math.round(timeTakenSec / 60);

      updatePerformance({
        moduleName: "Entrepreneurship",
        topicName: "ideationIntellect",
        score: 10,
        accuracy: 100,
        avgResponseTimeSec: timeTakenSec,
        studyTimeMinutes: timeTakenMin,
        completed: true,
      });
      setStartTime(Date.now());
    }
  };

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
      <div className="bg-[#0A160E] min-h-screen w-full">
        <div className="p-4 pt-20 md:pt-50 pb-28 max-w-4xl mx-auto">
          {step === "builder" && (
            <div className="space-y-4">
              <input
                className="w-full p-2 border rounded text-white"
                placeholder="Startup Name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />

              <textarea
                className="w-full p-2 border rounded text-white"
                placeholder="Short Description"
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />

              <div className="grid grid-cols-1 gap-2">
                {form.features.map((f, i) => (
                  <input
                    key={i}
                    className="w-full p-2 border rounded text-white"
                    placeholder={`Feature ${i + 1}`}
                    value={f}
                    onChange={(e) => handleFeatureChange(i, e.target.value)}
                  />
                ))}
              </div>

              <select
                className="w-full p-2 border rounded text-white bg-black"
                value={form.aiTypes}
                onChange={(e) => handleChange("aiTypes", e.target.value)}
              >
                <option value="">Choose type of AI</option>
                {kidFriendlyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <div className="text-sm">
                <p className="mb-1 text-white lilita-one-regular">
                  🎨 Design your logo on{" "}
                  <a
                    className="text-blue-700 underline"
                    href="https://www.canva.com/templates/?category=tACZCvjI6mE"
                    target="_blank"
                  >
                    Canva
                  </a>{" "}
                  and upload it here:
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="mt-2 text-white lilita-one-regular"
                />
              </div>

              <div className="space-y-2">
                <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center z-40 px-4 sm:px-0">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-t-pink-500 border-yellow-300 rounded-full animate-spin"></div>
                      <p className="mt-2 text-gray-200 lilita-one-regular text-lg font-semibold">
                        Submitting...
                      </p>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmit}
                      disabled={!canSubmit}
                    >
                      <img
                        src="/financeGames6to8/check-now-btn.svg"
                        alt="Check Now"
                        className="h-12 sm:h-16 w-auto"
                      />
                    </motion.button>
                  )}
                </div>

                {/* ✅ Show AI Feedback after Verify */}
                {reviewed && form.review && (
                  <div className="bg-black text-white border rounded-lg p-4 mt-4">
                    <p className="lilita-one-regular text-lg">{form.review}</p>
                  </div>
                )}

                {/* ✅ Result View After Submission */}
                {form.submitted && (
                  <>
                    {form.review.startsWith("Looks awesome") ? (
                      /* WIN VIEW */
                      <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                        {/* Center Content */}
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

                          {/* Badge Earned */}
                          <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                            🏅 Badge Earned: Startup Architect!
                          </h2>
                          <p className="text-xl text-white mt-2">
                            🎉 Great job! You nailed it!
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
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
                      /* LOSE VIEW */
                      <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                        {/* Game Over */}
                        <div className="flex flex-col items-center justify-center flex-1 p-4">
                          <img
                            src="/financeGames6to8/game-over-game.gif"
                            alt="Game Over"
                            className="w-48 sm:w-64 h-auto mb-4"
                          />
                          <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                            ❌ Some parts need improvement. Wanna Retry?
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
                                  {recommendedNotes
                                    .map((n) => n.title)
                                    .join(", ")}
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
                            src="/financeGames6to8/feedback.svg"
                            alt="Feedback"
                            onClick={handleViewFeedback}
                            className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                          />
                          <img
                            src="/financeGames6to8/retry.svg"
                            alt="Retry"
                            onClick={resetGame}
                            className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                          />
                          <img
                            src="/financeGames6to8/next-challenge.svg"
                            alt="Next Challenge"
                            onClick={handleNextChallenge}
                            className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                          />
                        </div>

                        {/* ✅ Popup here */}
                        <LevelCompletePopup
                          isOpen={isPopupVisible}
                          onConfirm={() => {
                            setIsPopupVisible(false);
                            navigate("/ethics-and-impact"); // your next level
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
                      </div>
                    )}
                  </>
                )}

                {/* Action buttons */}
                <div className="flex gap-4 flex-wrap mt-4">
                  <Button
                    onClick={resetFieldsOnly}
                    className="border border-white lilita-one-regular"
                  >
                    🔁 Try Again
                  </Button>
                  <Button
                    onClick={getReview}
                    className="border border-white lilita-one-regular"
                  >
                    📤 Verify
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Instructions overlay */}
          {showInstructions && (
            <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
              <InstructionOverlay onClose={() => setShowInstructions(false)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AIStartupBuilder;
