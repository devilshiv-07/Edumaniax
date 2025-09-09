import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { Link } from "react-router-dom";

const CTA = () => {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);

  const buttonText = isLoggedIn ? "Purchase Now" : "Start your free demo";
  const buttonLink = isLoggedIn ? "/pricing" : "/login";

  return (
    <div className="max-w-8xl mx-auto px-4 py-10">
      {/* ✅ Mobile View */}
      <div className="md:hidden bg-[#FFD86B] rounded-2xl p-6 flex flex-col items-center text-center space-y-4 w-[111%] mx-auto">
        <img src="/blogDesign/mushroom.svg" alt="Mushroom" className="w-24" />
        <h2 className="text-3xl font-extrabold text-gray-900">
          Want to play all the levels?
        </h2>
        <Link to={buttonLink}>
          <button className="bg-[#068F36] hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-md shadow-md transition text-lg">
            {buttonText}
          </button>
        </Link>
      </div>

      {/* ✅ Desktop View */}
      <div className="hidden md:flex items-center justify-between bg-[#FFD86B] rounded-2xl px-8 py-6 max-w-4xl mx-auto mt-10">
        {/* Text */}
        <h2 className="text-6xl font-semibold text-gray-900">
          Want to play all the levels?
        </h2>

        {/* Right Side: Arrow + Icon + Button (vertical stack) */}
        <div className="flex items-center px-6">
          {/* Arrow */}
          <img
            src="/imageForDesign/arrow.png"
            alt="Arrow"
            className="w-10 h-12 rotate-[340deg] mt-6" // makes it look like in right SS
          />

          {/* Mushroom + Button vertically stacked */}
          <div className="flex flex-col items-center space-y-2">
            <img
              src="/blogDesign/mushroom.svg"
              alt="Mushroom"
              className="w-24"
            />
            <Link to={buttonLink}>
              <button className="bg-[#068F36] hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-md shadow-md transition text-lg whitespace-nowrap">
                {buttonText}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
