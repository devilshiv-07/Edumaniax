// src/components/BottomProgressLoader.jsx
import { useEffect, useState } from "react";

const BottomProgressLoader = ({ onComplete }) => {
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
        // Call the onComplete function when the loader is done
        if (onComplete) {
          onComplete();
        }
      }
    }, 500);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed bottom-0 left-0 w-full z-5 bg-[rgba(40,52,58,0.20)] border-t border-white/20 backdrop-blur-sm text-white pt-2 pb-4 px-4 lilita [text-shadow:0_4px_0_#000] [text-stroke:1px_black] tracking-[0.05vw]">
      {/* TIP Heading */}
      <div className="text-center text-lg sm:text-xl md:text-2xl ">
        TIP:
      </div>

      {/* Tip Content */}
      <div className="text-center text-sm sm:text-base md:text-lg  mb-2">
        Save some money for emergency needs in the month
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