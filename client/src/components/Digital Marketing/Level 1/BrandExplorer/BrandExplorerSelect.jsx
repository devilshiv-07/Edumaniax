import React, { useEffect, useState } from "react";
import kinderLogo from "../BrandExplorer/images/kinderjoy.png";
import nikeLogo from "../BrandExplorer/images/002-nike-logos-swoosh-white.jpg";
import hotWheelsLogo from "../BrandExplorer/images/hotwheels.png";
import oreoLogo from "../BrandExplorer/images/oreo.png";
import legoLogo from "../BrandExplorer/images/lego.png";
import marvelLogo from "../BrandExplorer/images/marvel.png";
import mcdonaldsLogo from "../BrandExplorer/images/mcdonalds.png";
import { useNavigate } from "react-router-dom";
import { useDM } from "@/contexts/DMContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance

import { toast, ToastContainer } from "react-toastify";
import GameNav from "./GameNav";
import InstructionOverlay from "./InstructionOverlay";

const BrandBrandExplorerGameSelect = () => {
  const { completeDMChallenge } = useDM();
  const availableBrands = [
    { name: "Kinder Joy", logo: kinderLogo },
    { name: "Nike", logo: nikeLogo },
    { name: "Hot Wheels", logo: hotWheelsLogo },
    { name: "Oreo", logo: oreoLogo },
    { name: "LEGO", logo: legoLogo },
    { name: "Marvel", logo: marvelLogo },
    { name: "McDonald's", logo: mcdonaldsLogo },
  ];

  const navigate = useNavigate();

  const [clicks, setClicks] = useState(0);
  let updated = [];

  const [selectedBrands, setSelectedBrands] = useState([]);
  const [game, setGame] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Show instructions automatically when game loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = (item) => {
    const repeated = selectedBrands.some((b) => b.name === item.name);

    if (repeated) {
      console.log("Repeated");
      updated = selectedBrands.filter((t) => t.name !== item.name);
      console.log(updated);
      setSelectedBrands(updated);
      setClicks((prev) => prev - 1);
    } else {
      if (clicks === 3) {
        toast.info("Max 3 selections allowed");
        return;
      }
      updated = [...selectedBrands, item];
      setSelectedBrands(updated);
      setClicks((prev) => prev + 1);
      console.log("Y");
    }
    console.log(selectedBrands);
  };

  const [formData, setFormData] = useState([]);
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());

  const handleSubmit = () => {
    if (selectedBrands.length < 3) {
      toast.info("Select 3 brands");
      return;
    }
    setFormData(
      selectedBrands.map(() => ({
        whatTheySell: "",
        postStyle: "",
        mood: "",
      }))
    );
  };

  const whatTheySellOptions = [
    "Toys",
    "Shoes",
    "Snacks",
    "Superhero Content",
    "Fast Food",
    "Games",
    "Sportswear",
  ];
  const postStyleOptions = [
    "🟨 Bright colors",
    "🖤 Dark & sleek",
    "😂 Funny emojis",
    "✨ Stylish fonts",
  ];
  const moodOptions = ["😄 Fun", "💪 Bold", "🤝 Trustworthy", "🎨 Creative"];

  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
  };

  console.log(formData);
  const checkGameSubmit = () => {
    let x = formData.some(
      (item) => !item.whatTheySell || !item.postStyle || !item.mood
    );
    return x;
  };

  const handleGameSubmit = () => {
    console.log("Submitted:", formData);
    completeDMChallenge(0, 1);

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
    navigate("/brand-explorer-game-complete");
  };


  useEffect(() => {
    if (formData.length > 0 && formData.length === selectedBrands.length) {
      setGame(true);
    }
  }, [formData, selectedBrands]);

  return game ? (
    <div
      className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-4 md:p-8 text-center"
      style={{ fontFamily: "'Comic Neue', cursive" }}
    >
      <GameNav />
      {showInstructions && (
        <InstructionOverlay onClose={() => setShowInstructions(false)} />
      )}
      <h1 className="text-3xl font-extrabold text-purple-700 mb-4 animate-bounce">
        📝 Brand Explorer
      </h1>
      <p className="mb-6 text-gray-800 text-lg"></p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedBrands.map((brand, index) => {
          const floatClass = `float${(index % 4) + 1}`;
          return (
            <div
              key={index}
              className={`floating-card ${floatClass} relative rounded-3xl shadow-2xl p-5 border-4  hover:scale-105 transition-all duration-300 ease-in-out bg-gradient-to-br from-pink-300 via-sky-200 to-purple-400 overflow-hidden`}
            >
              <div className="relative z-10 font-kids text-purple-700">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-24 mx-auto object-contain mb-3 drop-shadow-xl"
                />
                <h2 className="text-2xl font-extrabold text-pink-500 mb-4  ">
                  {brand.name}
                </h2>

                <div className="text-left mb-4">
                  <p className="font-semibold mb-2 text-lg text-yellow-600">
                    🔍 What do they sell?
                  </p>
                  <div className="flex flex-wrap gap-4 ">
                    {whatTheySellOptions.map((option) => (
                      <div>
                        <label
                          key={option}
                          className="block mb-1 cursor-pointer hover:text-blue-600 transition wrap-break-word"
                        >
                          <input
                            type="radio"
                            name={`whatTheySell-${index}`}
                            value={option}
                            checked={formData[index]?.whatTheySell === option}
                            onChange={() =>
                              handleChange(index, "whatTheySell", option)
                            }
                            className="mr-2 accent-pink-500"
                          />
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left mb-4">
                  <p className="font-semibold mb-2 text-lg text-blue-600">
                    🎨 What do their posts look like?
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {postStyleOptions.map((option) => (
                      <div>
                        <label
                          key={option}
                          className="block mb-1 cursor-pointer hover:text-pink-500 transition"
                        >
                          <input
                            type="radio"
                            name={`postStyle-${index}`}
                            value={option}
                            checked={formData[index].postStyle === option}
                            onChange={() =>
                              handleChange(index, "postStyle", option)
                            }
                            className="mr-2 accent-purple-500 wrap-break-word"
                          />

                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-left">
                  <p className="font-semibold mb-2 text-lg text-pink-600">
                    😎 What mood or personality do they give?
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {moodOptions.map((option) => (
                      <div>
                        <label
                          key={option}
                          className="block mb-1 cursor-pointer hover:text-yellow-600 transition"
                        >
                          <input
                            type="radio"
                            name={`mood-${index}`}
                            value={option}
                            checked={formData[index].mood === option}
                            onChange={() => handleChange(index, "mood", option)}
                            className="mr-2 accent-yellow-500"
                          />
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        disabled={checkGameSubmit()}
        onClick={handleGameSubmit}
        className={`${checkGameSubmit() ? "cursor-not-allowed" : "cursor-pointer"
          } mt-8 bg-purple-600 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300`}
      >
        Finish Game 🎉
      </button>
    </div>
  ) : (
    <div
      className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-4 md:p-8 text-center"
      style={{ fontFamily: "'Comic Neue', cursive" }}
    >
      <GameNav />
      {showInstructions && (
        <InstructionOverlay onClose={() => setShowInstructions(false)} />
      )}
      <h1 className="text-3xl font-extrabold text-purple-700 mb-4 animate-bounce">
        📝 Brand Explorer
      </h1>
      <p className="mb-6 text-gray-800 text-lg">
        Pick 3 of your favourite brands.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableBrands.map((brand, index) => {
          const floatClass = `float${(index % 4) + 1}`;
          return (
            <div
              key={index}
              className={`floating-card ${floatClass} relative rounded-3xl shadow-2xl p-5 border-4 ${selectedBrands?.some((b) => b?.name === brand.name)
                ? "border border-purple-400"
                : "border-none"
                } border-pink-400 hover:scale-105 transition-all duration-300 ease-in-out bg-gradient-to-br from-emerald-200 via-cyan-300 to-indigo-400
 overflow-hidden `}
              onClick={() => handleClick(brand)}
            >
              <div className="relative z-10 font-kids text-purple-700">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-24 mx-auto object-contain mb-3 drop-shadow-xl"
                />
                <h2 className="text-2xl font-extrabold text-pink-500 mb-4  ">
                  {brand.name}
                </h2>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        className="mt-8  bg-purple-600 hover:bg-purple-800 text-white font-bold py-3 px-8 rounded-full shadow-lg text-xl transition duration-300"
      >
        Next Part
      </button>
      <ToastContainer />
    </div>
  );
};

export default BrandBrandExplorerGameSelect;
