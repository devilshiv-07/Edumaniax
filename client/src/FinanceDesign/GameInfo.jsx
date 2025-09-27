import React, { useState } from "react";

const GameInfo = () => {
  const [selectedImage, setSelectedImage] = useState("/financeinfo6-8/ss1.png");

  const handleThumbnailClick = (imgPath) => {
    setSelectedImage(imgPath);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Heading */}
      <div className="mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          What’s in the game!
        </h2>
        <p className="text-gray-600 lg:max-w-5xl text-sm md:text-base">
          Our creativity tools, interactive story-based lessons, and fun
          characters will motivate students to learn fundamental finance
          concepts and take their first big steps toward finance management
        </p>
      </div>

      {/* Main Game Image */}
      <div className="border rounded-xl shadow-md overflow-hidden mb-8 transition-all duration-300">
        <img
          src={selectedImage}
          alt="Weekly Budget Builder Game Screenshot"
          className="w-full max-h-[500px] object-contain mx-auto"
        />
      </div>

      {/* Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 px-2">
        {[1, 2, 3, 4, 5, 6].map((num) => {
          const imgPath = `/financeinfo6-8/ss${num}.png`;
          const isSelected = selectedImage === imgPath;

          return (
            <div
              key={num}
              className={`relative p-1 rounded-lg transition-transform duration-300 cursor-pointer ${
                isSelected
                  ? "border-4 border-[#068F36]"
                  : "border-2 border-transparent"
              }`}
              onClick={() => handleThumbnailClick(imgPath)}
            >
              {/* Triangle Arrow */}
              {isSelected && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-[#068F36]" />
              )}

              <img
                src={imgPath}
                alt={`Game Screen ${num}`}
                className="w-full h-auto object-cover rounded"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GameInfo;
