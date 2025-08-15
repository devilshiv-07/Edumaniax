import { useEffect, useRef, useState } from "react";
import { Menu, ChevronDown, BookOpen, TrendingUp, Target } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

import Section1dm from "./DMsections/Section1dm";
import Section2dm from "./DMsections/Section2dm";
import Section3dm from "./DMsections/Section3dm";
import Section4dm from "./DMsections/Section4dm";
import Section5dm from "./DMsections/Section5dm";
import Section6dm from "./DMsections/Section6dm";
import Section7dm from "./DMsections/Section7dm";
import Section8dm from "./DMsections/Section8dm";

import Module1 from "./DMsections/9-10Section1";
import Module2 from "./DMsections/9-10Section2";
import Module3 from "./DMsections/9-10Section3";
import Module4 from "./DMsections/9-10Section4";
import Module5 from "./DMsections/9-10Section5";

import Senior1 from "./DMsections/11-12Section1";
import Senior2 from "./DMsections/11-12Section2";
import Senior3 from "./DMsections/11-12Section3";
import Senior4 from "./DMsections/11-12Section4";
import Senior5 from "./DMsections/11-12Section5";

const gradeOptions = [
  { value: "6-8", label: "8th and Below" },
  { value: "9-10", label: "9th to 10th Grade" },
  { value: "11-12", label: "11th and above" },
];

const notesSidebar6to8 = [
  { id: "1", title: "Section 1: Types" },
  { id: "2", title: "Section 2: Target Audience" },
  { id: "3", title: "Section 3: Branding and Identity" },
  { id: "4", title: "Section 4: Creating Content" },
  { id: "5", title: "Section 5: Digital Platforms" },
  { id: "6", title: "Section 6: Spending Smartly" },
  { id: "7", title: "Section 7: Campaign Strategy" },
  { id: "8", title: "Section 8: Analytics" },
];

const notesSidebar9to10 = [
  { id: "m-1", title: "Module 1: Introduction" },
  { id: "m-2", title: "Module 2: Strategy & Objectives" },
  { id: "m-3", title: "Module 3: Platform Deep Dive" },
  { id: "m-4", title: "Module 4: Content Creation" },
  { id: "m-5", title: "Module 5: Analytics & Optimization" },
];

const notesSidebar11to12 = [
  { id: "s-1", title: "Unit 1: Marketing Foundations" },
  { id: "s-2", title: "Unit 2: Digital Channels" },
  { id: "s-3", title: "Unit 3: Advanced Targeting" },
  { id: "s-4", title: "Unit 4: ROI & Metrics" },
  { id: "s-5", title: "Unit 5: Project & Application" },
];

const DigitalMarketingFullNotes = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);

  const topicRefs = useRef({});
  const visibleTopics = useRef(new Set());

  useEffect(() => {
    topicRefs.current = {};
    visibleTopics.current = new Set();
    setActiveId(null);
    setNotesVisible(false);

    if (selectedGrade) {
      setTimeout(() => setNotesVisible(true), 100);
    }
  }, [selectedGrade]);

  useEffect(() => {
    if (!selectedGrade || !notesVisible) return;

    const container = document.getElementById("main-content");
    if (!container) return;

    // Create observer that is tied to the scroll container
    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the entry with the largest intersectionRatio (most visible)
        let best = null;
        entries.forEach((entry) => {
          // ignore completely invisible entries
          if (entry.intersectionRatio === 0) return;

          if (
            !best ||
            entry.intersectionRatio > best.intersectionRatio ||
            // tie-breaker: choose element nearer the top of container
            (entry.intersectionRatio === best.intersectionRatio &&
              entry.boundingClientRect.top < best.boundingClientRect.top)
          ) {
            best = entry;
          }
        });

        if (best) {
          setActiveId(best.target.id);
        }
      },
      {
        root: container, // <-- important: observe inside the scrolling container
        threshold: [0, 0.25, 0.5, 0.75, 1], // granular changes across zooms
        rootMargin: "0px 0px -10% 0px", // tweak if you want earlier/later activation
      }
    );

    // Observe all elements present in topicRefs
    Object.entries(topicRefs.current).forEach(([id, el]) => {
      if (el) observer.observe(el);
    });

    // Recreate observations on resize (handles zoom changes in many browsers)
    const handleResize = () => {
      observer.disconnect();
      Object.entries(topicRefs.current).forEach(([id, el]) => {
        if (el) observer.observe(el);
      });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [selectedGrade, notesVisible]);

  useEffect(() => {
    if (!activeId) return;
    const el = document.querySelector(`[data-scroll-id="${activeId}"]`);
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [activeId]);

  const scrollTo = (id) => {
    topicRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setShowSidebar(false);
  };

  const handleGradeSelect = (grade) => {
    setSelectedGrade(grade);
    setShowDropdown(false);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  const getCurrentSidebar = () => {
    if (selectedGrade === "6-8") return notesSidebar6to8;
    if (selectedGrade === "9-10") return notesSidebar9to10;
    if (selectedGrade === "11-12") return notesSidebar11to12;
    return [];
  };

  const renderGradeNotes = () => {
    if (selectedGrade === "6-8") {
      return (
        <>
          {/* ...same content as before (keep as is)... */}
          <div className="space-y-10">
            <div className="overflow-x-auto">
              <Section1dm topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Section2dm topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Section3dm topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Section4dm topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Section5dm topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Section6dm topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Section7dm topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Section8dm topicRefs={topicRefs} />
            </div>
          </div>
        </>
      );
    } else if (selectedGrade === "9-10") {
      return (
        <>
          {/* ...same content as before (keep as is)... */}
          <div className="space-y-10">
            <div className="overflow-x-auto">
              <Module1 topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Module2 topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Module3 topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Module4 topicRefs={topicRefs} />
            </div>
            <div className="overflow-x-auto">
              <Module5 topicRefs={topicRefs} />
            </div>
          </div>
        </>
      );
    } else if (selectedGrade === "11-12") {
      return (
        <div className="space-y-10">
          <div className="overflow-x-auto">
            <Senior1 topicRefs={topicRefs} />
          </div>
          <div className="overflow-x-auto">
            <Senior2 topicRefs={topicRefs} />
          </div>
          <div className="overflow-x-auto">
            <Senior3 topicRefs={topicRefs} />
          </div>
          <div className="overflow-x-auto">
            <Senior4 topicRefs={topicRefs} />
          </div>
          <div className="overflow-x-auto">
            <Senior5 topicRefs={topicRefs} />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION (only show when no grade is selected) */}
      {!selectedGrade && (
        <div className="h-[100vh] relative overflow-hidden bg-[#006724]">
          <Navbar />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,...')] opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 xl:mt-15 leading-tight">
                Welcome to Digital Marketing!
                <br />
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Master the art of reaching people through digital channels
                </span>
              </h2>

              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8 leading-relaxed">
                Discover world-class courses designed to unlock your potential.
              </p>
              <div className="relative inline-block">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="bg-white text-gray-800 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] justify-between"
                >
                  <span>
                    {selectedGrade
                      ? gradeOptions.find((g) => g.value === selectedGrade)
                          ?.label
                      : "Select Grade Level"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 ${showDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                    {gradeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleGradeSelect(option.value)}
                        className="w-full px-6 py-3 text-left text-gray-800 hover:bg-blue-50 border-b last:border-b-0"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* NOTES SECTION */}
      {selectedGrade === "6-8" && (
        <div>
          <Navbar />
          <div className="flex h-screen overflow-hidden relative pt-[4.5rem] md:pt-0">
          {/* Toggle for mobile */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden fixed top-[4.5rem] left-4 z-40 p-2 bg-blue-600 text-white rounded shadow-lg"
          >
            <Menu />
          </button>

          {/* SIDEBAR: 6–8 */}

          <aside
            className={`fixed md:static z-30  top-[4.5rem] left-0 md:top-0 h-full md:h-500px min-w-[260px] max-w-[280px] bg-white p-4 border-r 
              shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out ${
                showSidebar
                  ? "translate-x-0"
                  : "-translate-x-full md:translate-x-0"
              }`}
          >
            <h2 className="text-xl font-bold text-green-700 mb-6 px-2">
              Digital Marketing
            </h2>
            <ul className="space-y-3">
              {notesSidebar6to8.map((section) => (
                <li
                  key={section.id}
                  data-scroll-id={section.id}
                  className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 text-sm shadow-sm shadow-green-700/20${
                    activeId === section.id
                      ? "bg-green-100 text-[#09be43] font-semibold border-l-4 border-[#09be43]"
                      : "hover:bg-green-50 text-gray-800"
                  }`}
                  onClick={() => scrollTo(section.id)}
                >
                  <div className="text-[14px] font-medium leading-5 break-words whitespace-normal">
                    {section.title}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* MAIN CONTENT: 6–8 */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-10 scroll-smooth"
          >
            {renderGradeNotes()}
          </main>
        </div>
        </div>
      )}

      {selectedGrade === "9-10" && (
        <div>
          <Navbar />
          <div className="flex h-screen overflow-hidden relative pt-[4.5rem] md:pt-0">
          {/* Toggle for mobile */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden fixed top-[4.5rem] left-4 z-40 p-2 bg-blue-600 text-white rounded shadow-lg"
          >
            <Menu />
          </button>

          {/* SIDEBAR: 6–8 */}

          <aside
            className={`fixed md:static z-30  top-[4.5rem] left-0 md:top-0 h-full md:h-500px min-w-[260px] max-w-[280px] bg-white p-4 border-r 
              shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out ${
                showSidebar
                  ? "translate-x-0"
                  : "-translate-x-full md:translate-x-0"
              }`}
          >
            <h2 className="text-xl font-bold text-green-700 mb-6 px-2">
              Digital Marketing
            </h2>
            <ul className="space-y-3">
              {notesSidebar9to10.map((section) => (
                <li
                  key={section.id}
                  data-scroll-id={section.id}
                  className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 text-sm shadow-sm shadow-green-700/20 ${
                    activeId === section.id
                      ? "bg-green-100 text-[#09be43] font-semibold border-l-4 border-[#09be43]"
                        : "hover:bg-green-50 text-gray-800"
                  }`}
                  onClick={() => scrollTo(section.id)}
                >
                  <div className="text-[14px] font-medium leading-5 break-words whitespace-normal">
                    {section.title}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* MAIN CONTENT: 6–8 */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-10 scroll-smooth"
          >
            {renderGradeNotes()}
          </main>
        </div>
        </div>
      )}

      {selectedGrade === "11-12" && (
        <div>
          <Navbar />
           <div className="flex h-screen overflow-hidden relative pt-[4.5rem] md:pt-0">
          {/* Toggle for mobile */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden fixed top-[4.5rem] left-4 z-40 p-2 bg-blue-600 text-white rounded shadow-lg"
          >
            <Menu />
          </button>

          {/* SIDEBAR: 11–12 */}
          <aside
            className={`fixed md:static z-30  top-[4.5rem] left-0 md:top-0 h-full md:h-500px min-w-[260px] max-w-[280px] bg-white p-4 border-r 
        shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
          >
            <h2 className="text-xl font-bold text-green-700 mb-6 px-2">
              Digital Marketing
            </h2>
            <ul className="space-y-3">
              {notesSidebar11to12.map((section) => (
                <li
                  key={section.id}
                  data-scroll-id={section.id}
                  className={`cursor-pointer px-3 py-2 rounded-lg transition-all duration-200 text-sm shadow-sm shadow-green-700/20 ${
                    activeId === section.id
                      ? "bg-green-100 text-[#09be43] font-semibold border-l-4 border-[#09be43]"
                      : "hover:bg-green-50 text-gray-800"
                  }`}
                  onClick={() => scrollTo(section.id)}
                >
                  <div className="text-[14px] font-medium leading-5 break-words whitespace-normal">
                    {section.title}
                  </div>
                </li>
              ))}
            </ul>
          </aside>

          {/* MAIN CONTENT: 11–12 */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-10 scroll-smooth"
          >
            {renderGradeNotes()}
          </main>
        </div>
        </div>
      )}
    </div>
  );
};

export default DigitalMarketingFullNotes;
