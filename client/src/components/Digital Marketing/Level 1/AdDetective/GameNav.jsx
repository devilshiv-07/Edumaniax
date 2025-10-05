import React from "react";
import { useNavigate } from "react-router-dom";

const GameNav = () => {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-[#1f2937] px-4 py-3 flex items-center justify-between shadow-md lilita-one-regular">
      <button
        onClick={() => navigate(-1)}
        className="text-yellow-400 font-bold hover:text-yellow-300"
      >
        ← Back
      </button>
      <h1 className="text-yellow-400 text-xl sm:text-2xl font-extrabold">
        Ad Detective
      </h1>
      <div className="w-10" />
    </div>
  );
};

export default GameNav;


