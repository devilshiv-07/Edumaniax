import React, { useState, useRef, useEffect } from "react";
import { ChromePicker } from "react-color";
import confetti from "canvas-confetti";
import { useDM } from "@/contexts/DMContext";
import { usePerformance } from "@/contexts/PerformanceContext";
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import LevelCompletePopup from "@/components/LevelCompletePopup";

export default function BrandCreatorGame() {
  const { completeDMChallenge } = useDM();
  const { updatePerformance } = usePerformance();
  const navigate = useNavigate();

  const initialBrandState = {
    name: "",
    product: "",
    audience: "",
    slogan: "",
    logo: "",
    color: "",
    font: "",
    emojiStyle: "",
    tone: "",
  };

  const [brand, setBrand] = useState(initialBrandState);
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showWinView, setShowWinView] = useState(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const cardRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const checkSubmit = () => {
    return !Object.entries(brand)
      .filter(([key]) => key !== "color")
      .every(([, val]) => val !== "");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrand((prev) => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color) => {
    setBrand((prev) => ({ ...prev, color: color.hex }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && file.type && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrand((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    const myCanvas = canvasRef.current;
    const myConfetti = confetti.create(myCanvas, {
      resize: true,
      useWorker: true,
    });

    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
    };

    const shoot = () => {
      myConfetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ["star"] });
      myConfetti({ ...defaults, particleCount: 30, scalar: 0.75, shapes: ["circle"] });
    };

    // mark challenge complete
    completeDMChallenge(0, 2);

    // update performance
    const timeTakenSec = Math.floor((Date.now() - startTime) / 1000);
    updatePerformance({
      moduleName: "DigitalMarketing",
      topicName: "creativity",
      score: 10,
      accuracy: 100,
      avgResponseTimeSec: timeTakenSec,
      studyTimeMinutes: Math.ceil(timeTakenSec / 60),
      completed: true,
    });
    setStartTime(Date.now());

    // confetti bursts
    setTimeout(shoot, 0);
    setTimeout(shoot, 100);
    setTimeout(shoot, 300);
    setTimeout(shoot, 500);
    setTimeout(shoot, 700);

    // show win view after a short delay
    setTimeout(() => {
      setShowWinView(true);
    }, 1500);
  };

  const handleRetryChallenge = () => {
    // reset to initial state (no navigation reload)
    setBrand(initialBrandState);
    setShowWinView(false);
    setStartTime(Date.now());
  };

  const handleNextChallenge = () => {
    setIsPopupVisible(true);
  };

  const handleViewFeedback = () => {
    // stub: open your feedback modal or navigate to feedback page
    console.log("Open feedback modal or page");
  };

  // WIN VIEW
  if (showWinView) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
        <div className="flex flex-col items-center justify-center flex-1 p-6">
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
          <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
            🏅 Badge Earned: 🎨 Brand Builder
          </h2>
          <p className="text-xl text-white mt-2">🎉 Great job! You nailed it!</p>
        </div>

        <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
          <img
            src="/financeGames6to8/feedback.svg"
            alt="Feedback"
            onClick={handleViewFeedback}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/retry.svg"
            alt="Retry Challenge"
            onClick={handleRetryChallenge}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
          <img
            src="/financeGames6to8/next-challenge.svg"
            alt="Next Challenge"
            onClick={handleNextChallenge}
            className="cursor-pointer w-36 sm:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
          />
        </div>

        <LevelCompletePopup
          isOpen={isPopupVisible}
          onConfirm={() => {
            setIsPopupVisible(false);
            navigate("/caption-craze");
          }}
          onCancel={() => {
            setIsPopupVisible(false);
            navigate("/digital-marketing/games");
          }}
          onClose={() => setIsPopupVisible(false)}
          title="Challenge Complete!"
          message="Ready to jump into the next exciting challenge?"
          confirmText="Next Challenge"
          cancelText="Exit"
        />
      </div>
    );
  }

  return (
    <>
      <GameNav />
      <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-4 md:p-8 font-sans">
        <div className="flex flex-col-reverse lg:flex-row items-start justify-center gap-6">
          <div className="w-full lg:w-2/3 bg-[#202F364D] rounded-3xl shadow-2xl p-4 md:p-8 border-4 border-dashed border-white">
            <div className="space-y-4">
              <input
                name="name"
                placeholder="Brand Name"
                className="w-full p-3 rounded-xl border border-white text-white"
                value={brand.name}
                onChange={handleChange}
              />
              <input
                name="product"
                placeholder="Product or Service"
                className="w-full p-3 rounded-xl border border-white text-white"
                value={brand.product}
                onChange={handleChange}
              />
              <input
                name="audience"
                placeholder="Target Audience"
                className="w-full p-3 rounded-xl border border-white text-white"
                value={brand.audience}
                onChange={handleChange}
              />
              <textarea
                name="slogan"
                placeholder="Slogan or Catchphrase"
                className="w-full p-3 rounded-xl border border-white text-white"
                value={brand.slogan}
                onChange={handleChange}
              />

              <label className="block lilita-one-regular text-white mt-4">Upload Logo</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-3 rounded-xl border border-white text-white"
                onChange={handleLogoUpload}
              />

              <label className="block lilita-one-regular text-white mt-4">Pick Background Color 🎨</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="overflow-auto max-w-full flex justify-center">
                  <ChromePicker color={brand.color} onChangeComplete={handleColorChange} />
                </div>
                <button
                  onClick={() => setBrand((prev) => ({ ...prev, color: "" }))}
                  className="p-3 bg-pink-200 rounded-2xl text-lg self-start"
                >
                  Use original color
                </button>
              </div>

              <select
                name="font"
                className="w-full p-3 rounded-xl border border-white text-white bg-[#2d433fb8]"
                value={brand.font}
                onChange={handleChange}
              >
                <option value="" disabled className="text-gray-400">Select Font</option>
                <option>Comic Sans MS</option>
                <option>Verdana</option>
                <option>Arial</option>
                <option>Cursive</option>
                <option>Georgia</option>
                <option>Impact</option>
                <option>Trebuchet MS</option>
                <option>Lucida Handwriting</option>
                <option>Times New Roman</option>
                <option>Courier New</option>
              </select>

              <select
                name="emojiStyle"
                className="w-full p-3 rounded-xl border border-white text-white bg-[#2d433fb8]"
                value={brand.emojiStyle}
                onChange={handleChange}
              >
                <option value="" disabled className="text-gray-400">Select Emoji Style</option>
                <option value="🎉">🎉 Party</option>
                <option value="🤖">🤖 Robot</option>
                <option value="🍭">🍭 Sweet</option>
                <option value="🦄">🦄 Unicorn</option>
              </select>

              <select
                name="tone"
                className="w-full p-3 rounded-xl border border-white text-white bg-[#2a3c39b8]"
                value={brand.tone}
                onChange={handleChange}
              >
                <option value="" disabled className="text-gray-400">Select Tone</option>
                <option>Funny</option>
                <option>Cool</option>
                <option>Smart</option>
                <option>Inspiring</option>
              </select>

              <button
                disabled={checkSubmit()}
                className={`w-full ${checkSubmit() ? "cursor-not-allowed" : "cursor-pointer"} bg-yellow-400 text-white font-bold py-3 rounded-xl hover:bg-yellow-500 transition`}
                onClick={handleClick}
              >
                Finish & Celebrate!
              </button>
            </div>

            {/* Card Preview */}
            <div
              ref={cardRef}
              className={`mt-10 p-6 md:p-8 relative ${!brand.color ? "bg-gradient-to-br from-yellow-200 via-pink-100 to-purple-200" : ""} rounded-3xl border-8 shadow-2xl transition-all duration-500 hover:shadow-pink-300`}
              style={{
                backgroundColor: brand.color || undefined,
                fontFamily: brand.font || "Comic Sans MS",
                borderImage: "linear-gradient(45deg, #f472b6, #a855f7, #3b82f6, #10b981) 1",
              }}
            >
              <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />

              {brand.logo && (
                <div className="flex justify-center mb-4">
                  <img
                    src={brand.logo}
                    alt="Brand Logo"
                    className="w-24 h-24 object-contain rounded-full border-4 border-white shadow-lg"
                  />
                </div>
              )}

              <h2 className="text-2xl md:text-4xl font-black mb-4 text-center">
                {brand.emojiStyle} {brand.name} {brand.emojiStyle}
              </h2>

              {brand.slogan && (
                <p className="text-lg md:text-2xl italic text-center text-purple-800 mb-4 font-bold">
                  “{brand.slogan}”
                </p>
              )}

              <div className="text-center space-y-2 text-white">
                {brand.product && <p className="text-md md:text-lg">✨ {brand.product}</p>}
                {brand.audience && <p className="text-md md:text-lg">🎯 For: {brand.audience}</p>}
                {brand.tone && <p className="text-md md:text-lg">🌈 Tone: {brand.tone}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
