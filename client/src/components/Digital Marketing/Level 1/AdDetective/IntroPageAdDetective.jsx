import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserSecret } from "react-icons/fa";
import { motion } from "framer-motion";
import InstructionOverlay from "./InstructionOverlay";
import BottomProgressLoader from "./BottomProgressLoader";

const IntroPageAdDetective = () => {
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);

  const fullText = "Welcome, Detective!";
  const [displayedText, setDisplayedText] = useState("");
  const index = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullText.charAt(index.current));
      index.current++;
      if (index.current >= fullText.length) clearInterval(interval);
    }, 100); // speed of typing (ms per letter)

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full sm:w-[90%] mx-auto sm:p-3 h-screen lilita-one-regular">
      <div
        className="h-full rounded-2xl bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white flex flex-col lg:flex-row items-center xl:justify-center p-4 sm:p-6 relative gap-6 md:gap-12"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        {/* Agent Avatar */}
        <div className=" absolute top-3 sm:top-6 left-2 sm:left-6 flex items-center space-x-2">
          <FaUserSecret className="text-2xl sm:text-3xl text-yellow-400 animate-pulse" />
          <span className="text-base sm:text-lg font-semibold">Agent 007</span>
        </div>

        {/* Spline Model on Left for md+ */}
        {/* <div className=" hidden lg:block w-full md:w-1/4 h-[200px] md:h-[300px]">
      <Spline
        className="rounded-lg object-cover"
        scene="https://prod.spline.design/hB2IF38lQ1umF15e/scene.splinecode"
      />
    </div> */}

        {/* Mission Brief Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3 }}
          className="bg-black bg-opacity-80 backdrop-blur-sm shadow-2xl rounded-2xl p-6 sm:p-10 max-w-full sm:max-w-xl text-center border-2 border-yellow-500 flex flex-col items-center gap-4"
        >
          {/* Spline Model on Top for small screens */}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">
            {displayedText}🕵️
          </h1>
          <p className="text-base sm:text-lg mb-2 leading-relaxed">
            Your mission:{" "}
            <span className="text-yellow-400 font-semibold">
              Spot 5 online ads
            </span>{" "}
            in your digital world. Explore platforms, track every ad — banners,
            videos, popups or posts!
          </p>
          <p className="text-base sm:text-lg text-gray-300 mb-4">
            Use your <span className="italic">Ad Detective Notebook</span> to record:
            platform/app, what you saw, type of ad, product/service, and whether it
            was interesting or boring—plus why.
          </p>

          <button
            onClick={() => navigate("/ad-detective-game")}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg border-2 border-yellow-300 transition duration-300 ease-in-out transform hover:scale-105 hover:rotate-1 hover:shadow-yellow-400"
          >
            📁 Start Mission : Should you choose to accept it
          </button>
        </motion.div>

        {/* Decorative Text */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-sm sm:text-lg text-yellow-400 italic">
          Classified: Top Secret 🔐
        </div>
        <BottomProgressLoader />
        {showInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroPageAdDetective;
