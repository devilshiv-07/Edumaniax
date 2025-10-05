import { useEffect, useState } from "react";

const BottomProgressLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const milestones = [20, 40, 65, 95, 100];
    let i = 0;
    const id = setInterval(() => {
      if (i >= milestones.length) return clearInterval(id);
      setProgress(milestones[i]);
      i += 1;
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 backdrop-blur bg-black/40 text-white pt-3 pb-5 px-4 border-t border-white/10 lilita-one-regular">
      <div className="text-center text-sm md:text-base mb-2 font-semibold">
        TIP: Ads can be posts, stories, videos, banners, or pop-ups.
      </div>
      <div className="flex items-center justify-center w-full">
        <div className="relative w-[70%] max-w-3xl h-5 bg-[#2f2f2f] border border-black">
          {progress > 0 && (
            <div
              className="absolute top-0 left-0 h-full bg-yellow-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          )}
        </div>
        <div className="ml-3 text-white text-sm font-bold">{progress}%</div>
      </div>
    </div>
  );
};

export default BottomProgressLoader;
