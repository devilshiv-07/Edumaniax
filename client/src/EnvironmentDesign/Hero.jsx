import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; 

const getHeroChildrenImageForGrade = (userClass) => {
  if (!userClass) {
    return "/imageForDesign/chidrenImage.png"; 
  }

  const gradeNumber = parseInt(String(userClass).replace(/\D/g, ""), 10);

  if (isNaN(gradeNumber)) {
    return "/imageForDesign/chidrenImage.png";
  }

  if (gradeNumber >= 9) {
    return "/imageForDesign/gameschildren.svg";
  }

  return "/imageForDesign/chidrenImage.png";
};

const Hero = () => {
  const { user } = useAuth();
  const heroChildrenImage = getHeroChildrenImageForGrade(user?.userClass);
  return (
    <section
      className="-mt-10 text-white py-12 md:py-12 pb-0 relative overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, #3F9400 0%, #2C6601 100%)",
      }}
    >
      {/* Vector background on the right side */}
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-20 md:opacity-100">
        <img
          src="/imageForDesign/Vector.png"
          alt="Vector background"
          className="absolute inset-0 w-full h-full object-cover object-center md:object-left"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between relative z-10">
        {/* Left Section - Consistently left-aligned */}
        <div className="max-w-xl w-full space-y-4 mb-10 md:mb-0 text-left">
          <nav className="text-sm mt-10">
            {/* REMOVED flex-wrap and gap-y-2 to force in-place text wrapping */}
            <div className="bg-black/20 mb-10 text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2">
              <Link
                to="/"
                className="flex items-center gap-1 text-white hover:underline"
              >
                <img
                  src="/imageForDesign/home.png"
                  alt="Home Icon"
                  className="w-4 h-4"
                />
                <span className="ml-1 mr-2 md:mx-0">Home</span>
              </Link>

              <span className="text-white/60">&gt;</span>
              <Link to="/courses">
                <span className="text-white hover:underline">Courses</span>
              </Link>

              <span className="text-white/60">&gt;</span>
              <span className="text-white">Environment</span>

              <span className="text-white/60">&gt;</span>
              {/* This text will now wrap in place */}
              <span className="font-semibold text-white">
                Gaming Lessons
              </span>
            </div>
          </nav>

          <p className="uppercase tracking-wider text-sm font-semibold text-white flex items-center gap-1 justify-start">
            Environment Fundamentals: Levels
            <img
              src="/imageForDesign/1image.png"
              alt="Level 1"
              className="h-4 w-auto"
            />
            <img
              src="/imageForDesign/2image.png"
              alt="Level 2"
              className="h-4 w-auto"
            />
            <img
              src="/imageForDesign/3image.png"
              alt="Level 3"
              className="h-4 w-auto"
            />
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
            <span className="block md:inline sigmar-font">Master Your</span>{" "}
            <span className="sigmar-font inline-flex items-center gap-0 md:whitespace-nowrap">
              Environment Skills
              <img
                src="/imageForDesign/Levelup-2-unscreen.gif"
                alt="Level up animation"
                className="h-[1.5em] sm:h-[1.7em] w-auto align-middle m-0 p-0"
              />
            </span>
          </h1>

          <p className="text-white text-base md:text-lg mt-2 leading-relaxed">
            Build the mindset, skills, and courage to launch planet-friendly
            ventures. From eco-ideas to real-world action — lead the change
            with innovation and impact.
          </p>
        </div>

        {/* Right Section with glow behind children image */}
        <div className="relative w-full max-w-sm md:max-w-md mt-10 md:mt-0 z-20 md:ml-8 md:self-end self-center mx-auto md:mx-0">
          <div className="absolute inset-0 z-0 blur-2xl opacity-30 scale-110 bg-white rounded-full pointer-events-none" />
          <img
            src={heroChildrenImage}
            alt="Kids playing financial game"
            className="w-full relative z-10 md:translate-y-12"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;