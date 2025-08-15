// src/components/BottomProgressLoader.jsx
import { useEffect, useState } from "react";

// BottomProgressLoader.jsx
const BottomProgressLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const milestones = [20, 40, 65, 95, 99, 100];
    let index = 0;

    const interval = setInterval(() => {
      if (index < milestones.length) {
        setProgress(milestones[index]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 500); // delay between jumps

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 backdrop-blur bg-black/40 text-white pt-4 pb-6 px-4 lilita-one-regular border-t border-white/10 shadow-inner">
      {/* TIP Heading */}
      <div className="text-center text-lg sm:text-xl md:text-2xl font-extrabold drop-shadow-sm mb-1">
        TIP:
      </div>

      {/* Tip Content */}
      <div className="text-center text-sm sm:text-base md:text-lg text-gray-200 drop-shadow-sm mb-4">
        Plan smart, spend wise, and save like a true Budget Boss!
      </div>

      {/* Progress Container */}
      <div className="flex items-center justify-center w-full">
        {/* Outer container with fixed width and angled corners */}
        <div
          className="relative w-[70%] max-w-3xl h-5 sm:h-6 bg-[#4A0A25] border border-black"
          style={{
            clipPath: `polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)`,
          }}
        >
          {/* Green Fill with angled corners */}
          {progress > 0 && (
            <div
              className="absolute top-0 left-0 h-full bg-[#61C423] transition-all duration-300 ease-in-out"
              style={{
                width: `${progress}%`,
                clipPath: `polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%)`,
              }}
            />
          )}

          {/* White highlight sliver - only if progress < 100 */}
          {progress < 100 && progress > 0 && (
            <div
              className="absolute top-0 h-full bg-white"
              style={{
                left: `calc(${progress}% - 2.5%)`,
                width: "5%",
                clipPath: "polygon(20% 0, 100% 0, 80% 100%, 0% 100%)",
              }}
            />
          )}
        </div>

        {/* Percentage Text */}
        <div className="ml-3 text-white text-sm sm:text-base font-extrabold drop-shadow-[1px_1px_0px_#000] whitespace-nowrap">
          {progress}%
        </div>
      </div>
    </div>
  );
};

export default BottomProgressLoader;
