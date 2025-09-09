import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Link } from "react-router-dom";

const CTA3 = () => {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  const loggedOutDescription = `Our creativity tools, interactive story-based lessons, and fun
  characters are designed to spark curiosity and inspire students to
  become green innovators. With every lesson, they’ll take bold steps
  toward identifying environmental challenges, generating sustainable
  ideas, building eco-friendly solutions, and developing the confidence
  to lead change — all while having fun!`;

  const loggedInDescription = `Explore environmental issues through immersive games that turn concepts like pollution control, renewable energy, and ecosystems into hands-on missions.
Students take on the role of change-makers, designing solutions and making choices that impact virtual environments with real consequences.`;

  const buttonText = isLoggedIn ? "Purchase Now" : "Start your free demo";
  const buttonLink = isLoggedIn ? "/pricing" : "/login";

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* ✅ MOBILE VIEW */}
      <div className="md:hidden bg-[#FFD86B] rounded-2xl p-6 flex flex-col items-center text-center">
        <img
          src="/imageForDesign/show-hat-magician--Streamline-Freehand.png"
          alt="Rocket Laptop"
          className="w-36 mb-4"
        />
        <h2 className="text-[1.5rem] font-extrabold text-gray-900 mb-3 text-center">
          Want to play all the levels?
        </h2>
        <p className="text-gray-800 text-sm mb-4 whitespace-pre-line">
          {isLoggedIn ? loggedInDescription : loggedOutDescription}
        </p>
        <Link to={buttonLink}>
          <button className="bg-[#068F36] hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md shadow-md transition text-base">
            {buttonText}
          </button>
        </Link>
      </div>

      {/* ✅ DESKTOP VIEW */}
      <div className="hidden md:flex relative bg-[#FFD86B] rounded-2xl p-10 flex-row items-center justify-between gap-6">
        {/* 📝 Left: Text */}
        <div className="flex-1 max-w-[50%] text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-gray-900 mb-3 md:mb-4">
            Want to play all the levels?
          </h2>
          <p className="text-gray-800 text-base mt-12 whitespace-pre-line">
            {isLoggedIn ? loggedInDescription : loggedOutDescription}
          </p>
        </div>

        {/* 🖼️ Right: Laptop + Button */}
        <div className="flex-1 flex flex-col items-center">
          <div className="relative mb-6">
            <img
              src="/imageForDesign/show-hat-magician--Streamline-Freehand.png"
              alt="Rocket Laptop"
              className="w-44 lg:w-52"
            />
            <img
              src="/imageForDesign/arrow.png"
              alt="Arrow"
              className="w-10 h-10 lg:w-14 lg:h-14 absolute -bottom-2 -left-12 z-10 rotate-45"
            />
          </div>
          <Link to={buttonLink}>
            <button className="bg-[#068F36] hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-md shadow-md transition text-lg">
              {buttonText}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTA3;
