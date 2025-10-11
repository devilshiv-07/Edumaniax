import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useDM } from "@/contexts/DMContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import GameNav from "./GameNav";
import InstructionOverlay from "./InstructionOverlay";


const adTypes = ["Video", "Post", "Banner", "Popup", "Other"];

const AdDetectiveGamePage = () => {
  const { completeDMChallenge } = useDM();
  const [entries, setEntries] = useState(
    Array.from({ length: 5 }, () => ({
      platform: "",
      saw: "", // what you saw (ad)
      type: [],
      product: "",
      interesting: "",
      why: "",
    }))
  );
  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showInstructions, setShowInstructions] = useState(true);

  // Show instructions automatically when game loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInstructions(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (index, field, value) => {
    console.log(index, field, value);

    const newEntries = [...entries];
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleTypeToggle = (index, type) => {
    const newEntries = [...entries];
    const selected = newEntries[index].type;
    if (selected.includes(type)) {
      newEntries[index].type = selected.filter((t) => t !== type);
    } else {
      newEntries[index].type = [...selected, type];
    }
    setEntries(newEntries);
  };

  const navigate = useNavigate();
  console.log(entries);

  const [missed, setMissed] = useState(false);
  const scrollRef = useRef(null);

  const isFormComplete = () => {
    for (let entry of entries) {
      if (
        !entry.platform.trim() ||
        !entry.saw.trim() ||
        entry.type.length === 0 ||
        !entry.product.trim() ||
        !entry.interesting ||
        !entry.why.trim()
      ) {
        return false;
      }
    }

    // You can also validate the summary textareas here if needed
    const summaryInputs = document.querySelectorAll("textarea");
    for (let input of summaryInputs) {
      if (!input.value.trim()) return false;
    }

    return true;
  };

  return (
    <div className="min-h-screen pt-20 md:pt-50 pb-28 bg-[#0A160E] p-4 md:p-8">
      <GameNav />
      {showInstructions && (
        <InstructionOverlay onClose={() => setShowInstructions(false)} />
      )}
      <div
        ref={scrollRef}
        className="bg-gradient-to-br relative rounded-2xl from-gray-900 via-slate-800 to-gray-900 text-white p-6"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        <h1 className="text-3xl font-bold text-center mb-8">
          🕵️ Ad Detective Notebook
        </h1>

        {/* Column Headers for large screens */}
        <div className="hidden lg:grid grid-cols-7 gap-4 text-sm font-bold border-b border-yellow-400 pb-2 mb-4">
          <div></div>
          <div className="text-center text-xl">Platform/App</div>
          <div className="text-center text-xl">What you saw (Ad)</div>
          <div className="text-center text-xl">Type of Ad</div>
          <div className="text-center text-xl">What product/service was being sold?</div>
          <div className="text-center text-xl">Interesting or Boring?</div>
          <div className="text-center text-xl">Why?</div>
        </div>

        {/* Rows */}
        {entries.map((entry, idx) => (
          <div>
            <div
              key={idx}
              className="grid lg:grid-cols-7 gap-4 mb-6 bg-black bg-opacity-30 p-4 rounded-xl shadow-md"
            >
              {/* Platform/App */}

              <h2 className="text-2xl mb-2 font-bold">🔎 Case #{idx + 1}</h2>

              <div>
                <label className="lg:hidden text-xl block font-semibold mb-1">
                  Platform/App
                </label>
                <input
                  type="text"
                  placeholder="Instagram, YouTube, etc."
                  value={entries[idx].platform}
                  onChange={(e) => {
                    handleChange(idx, "platform", e.target.value);
                  }}
                  className="p-2 rounded bg-gray-800 text-white w-full border border-gray-700 text-xl"
                />
              </div>

              {/* What you saw (Ad) */}
              <div>
                <label className="lg:hidden text-xl block font-semibold mb-1">
                  What you saw (Ad)
                </label>
                <input
                  type="text"
                  placeholder="E.g., Nike shoes ad"
                  value={entries[idx].saw}
                  onChange={(e) => handleChange(idx, "saw", e.target.value)}
                  className="p-2 rounded bg-gray-800 text-white w-full border border-gray-700 text-xl"
                />
              </div>

              {/* Type of Ad */}
              <div>
                <label className="lg:hidden text-xl block font-semibold mb-1">
                  Was it a video, post, banner, or pop-up?
                </label>
                <div className="flex justify-center flex-wrap gap-2">
                  {adTypes.map((type) => (
                    <label
                      key={type}
                      className="text-xl flex items-center gap-1"
                    >
                      <input
                        type="checkbox"
                        checked={entry.type.includes(type)}
                        onChange={() => handleTypeToggle(idx, type)}
                        className="accent-yellow-400"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Product/Service */}
              <div>
                <label className="lg:hidden block text-xl font-semibold mb-1">
                  What product/service was being sold?
                </label>
                <input
                  type="text"
                  placeholder="E.g., Shoes, Course"
                  value={entry.product}
                  onChange={(e) => handleChange(idx, "product", e.target.value)}
                  className="p-2 rounded bg-gray-800 text-xl text-white w-full border border-gray-700"
                />
              </div>

              {/* Interesting or Boring */}
              <div>
                <label className="lg:hidden text-xl block font-semibold mb-1">
                  Was it interesting or boring?
                </label>
                <select
                  value={entry.interesting}
                  onChange={(e) =>
                    handleChange(idx, "interesting", e.target.value)
                  }
                  className="p-2 rounded  text-xl bg-gray-800 text-white w-full border border-gray-700"
                >
                  <option value="">Select</option>
                  <option value="Interesting">Interesting</option>
                  <option value="Boring">Boring</option>
                </select>
              </div>

              {/* Why */}
              <div>
                <label className="lg:hidden block text-xl font-semibold mb-1">
                  Why?
                </label>
                <input
                  type="text"
                  placeholder="Why did it feel interesting or boring?"
                  value={entry.why}
                  onChange={(e) => handleChange(idx, "why", e.target.value)}
                  className="p-2 text-xl rounded bg-gray-800 text-white w-full border border-gray-700"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Summary Section */}
        <div className="mt-12 space-y-6 relative bg-black bg-opacity-30 p-6 rounded-xl shadow-md">
          <div>
            <label className="block text-xl mb-1 font-semibold">
              🧐 Which ad caught your eye the most and why?
            </label>
            <textarea
              className="w-full text-xl p-3 rounded bg-gray-800 border border-gray-700 text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-xl mb-1 font-semibold">
              💡 Did any ad make you want to click or buy?
            </label>
            <textarea
              className="w-full text-xl p-3 rounded bg-gray-800 border border-gray-700 text-white"
              rows={3}
            />
          </div>
          <AnimatePresence>
            {missed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 2 }}
                exit={{ opacity: 0, scale: 0.7 }}
                className="absolute text-3xl rounded-lg bottom-0 left-1/2 -translate-x-1/2 p-5 bg-gradient-to-br from-red-100 to-blue-400"
              >
                <h1 className="text-center">Detective 🕵️, you missed a case</h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Finish Mission Button */}
        <div className="text-center mt-10">
          <button
            onClick={() => {
              const x = isFormComplete();
              if (x) {
                completeDMChallenge(0, 0); // levelIndex & stageIndex
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

                navigate("/ad-detective-mission-complete");
              } else {
                setMissed(true);
                setTimeout(() => {
                  setMissed(false);
                }, 4000);
              }
            }}
            className="bg-yellow-400 hover:bg-yellow-500 text-xl text-gray-900 font-bold py-3 px-8 rounded-full shadow-lg transition-colors duration-300"
          >
            Finish Mission
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdDetectiveGamePage;
