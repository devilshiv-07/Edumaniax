import React, { useState } from "react";
import CTA from "./CTA";
import GameInfo from "./GameInfo";
import CTA2 from "./CTA2";
import CTA3 from "./CTA3";
import LevelsDisplay from "./LevelsDisplay";
import { useAuth } from "@/contexts/AuthContext";
import SkillsYouWillLearn from "./SkillsYouWillLearn";

const features = [
  {
    title: "4 Comprehensive Levels",
    description:
      "Explore beginner to advanced legal concepts through interactive games and challenges designed for every stage of learning.",
    image: "/imageForDesign/level.png",
    bg: "bg-[#BFF080]",
  },
  {
    title: "Practical Exercises",
    description:
      "Apply legal principles through simulations, case studies, and role-play scenarios that reflect real-world legal situations.",
    image: "/imageForDesign/practical.png",
    bg: "bg-[#FFE1C6]",
  },
  {
    title: "Expert Guidance",
    description:
      "Learn from legal experts through built-in tips, scenario-based advice, and mini-lectures at each level.",
    image: "/imageForDesign/expert.png",
    bg: "bg-[#F9CFFF]",
  },
  {
    title: "Lifetime Access",
    description:
      "Revisit legal lessons anytime with lifetime access to all modules, updates, and future law-based games.",
    image: "/imageForDesign/lifetime.png",
    bg: "bg-[#C8E7FF]",
  },
];

const modulesfor6to8 = [
  {
    title: "LEVEL 1: The Legal Explorer",
    description: "Mission: Spot the Law in Everyday Life",
    challenges: [
      {
        title: "Sort It Out (Sorting Game)",
        description:
          "Objective: Categorize legal phrases into correct law types.",
        duration: "45 min",
        path: "/sort-it-out",
      },
      {
        title: "LawQuest – The Legal Adventure (MCQ Game)",
        description:
          "Objective: Test your knowledge on rights, duties, and basic laws.",
        duration: "50 min",
        path: "/legal-quiz",
      },
    ],
  },
  {
    title: "LEVEL 2: The Law Connector",
    description: "Mission: Match Legal Ideas to Real Scenarios",
    challenges: [
      {
        title: "Puzzle Match (Drag & Connect Game)",
        description: "Objective: Match legal terms with correct descriptions.",
        duration: "50 min",
        path: "/puzzle-match",
      },
      {
        title: "Catch Your Rights (Sorting Game)",
        description:
          "Objective: Categorize terms into law, rights, and duties.",
        duration: "50 min",
        path: "/catch-your-rights",
      },
    ],
  },
  {
    title: "LEVEL 3: The Legal Strategist",
    description: "Mission: Step Into a Courtroom Role",
    challenges: [
      {
        title: "Courtroom Clash (Role-Play Game)",
        description: "Objective: Simulate a basic courtroom case with roles.",
        duration: "50 min",
        path: "/case-hear",
      },
    ],
  },
  {
    title: "LEVEL 4: The Law Challenger",
    description: "Mission: Tackle a Maze of Legal Questions",
    challenges: [
      {
        title: "Maze Of Choices (Quiz Challenge)",
        description:
          "Objective: Break through several legal awareness questions.",
        duration: "50 min",
        path: "/maze-of-choices",
      },
    ],
  },
];

const modulesfor9to10 = [
  {
    title: "LEVEL 1: Law Explorers – Learn by Fun",
    description: "Mission: Discover legal concepts through games and puzzles",
    challenges: [
      {
        title: "Law-Themed Word Cross Puzzle",
        description:
          "Objective: Build legal vocabulary across Constitution, Judiciary, Cyber Law, Parliament, and the UN by solving a crossword.",
        duration: "45 min",
        path: "/MatchTermsGame", // ✅
      },
      //{
      //   title: "Legal Quiz Quest (Modular MCQ)",
      //   description:
      //     "Objective: Answer module-wise legal questions. Unlock next after a correct answer. Optional timer mode.",
      //   duration: "50 min",
      //   path: "/LegalQuizQuestLevel1", // Add this route if not yet created
      // },
      {
        title: "Boss-Level Task: MatchTermsGame Result",
        description:
          "Objective: Reflect on vocabulary performance and review explanations for missed terms.",
        duration: "10 min",
        path: "/match-terms-game-result", // ✅
      },
    ],
  },
  {
    title: "LEVEL 2: Legal Gladiators – Thinking in Scenarios",
    description:
      "Mission: Step into courtroom scenarios and make key decisions",
    challenges: [
      {
        title: "Justice Throne – Court Clash Game",
        description:
          "Objective: Play scenario-based decision rounds. Choose the correct court, apply the right article, and earn points.",
        duration: "50 min",
        path: "/JusticeThroneGame", // ✅
      },
      // {
      //   title: "Boss-Level Task: Character Reflection",
      //   description:
      //     "Objective: Reflect on the role you played (Majesty, King, Minister) and one decision you would rethink.",
      //   duration: "10 min",
      //   path: "/justice-role-reflection", // Add if desired
      // },
    ],
  },
  {
    title: "LEVEL 3: Law Champions – Timed Challenges (Advanced Mode)",
    description: "Mission: Beat the clock and prove your legal mastery",
    challenges: [
      {
        title: "Quiz Quest – Challenge Mode",
        description:
          "Objective: Answer 2 questions per module in 30 seconds each. One wrong answer restarts the level. Earn the 'Legal Whiz' badge.",
        duration: "50 min",
        path: "/LegalQuizQuestLevel3", // ✅
      },
      // {
      //   title: "Boss-Level Task: Badge Claim & Review",
      //   description:
      //     "Objective: Reflect on your score, retry missed modules, and claim your Legal Whiz badge.",
      //   duration: "10 min",
      //   path: "/legal-whiz-review", // Add if desired
      // },
    ],
  },
];

const modulesfor11to12 = [
  {
    title: "LEVEL 1: Tort Law Tracker",
    description: "Mission: Spot legal violations and understand remedies",
    challenges: [
      {
        title: "Spot the Tort – Flashcard Game",
        description:
          "Objective: Match real-life scenarios with the correct type of tort — negligence, defamation, or product liability.",
        duration: "45 min",
        path: "/TortLawGame1", // ✅
      },
      {
        title: "Spot the Defense – Justify the Action",
        description:
          "Objective: Identify potential legal defenses behind tort scenarios using logic and legal reasoning.",
        duration: "45 min",
        path: "/TortLawGame2", // ✅
      },
      {
        title: "Spot the Remedy – What's the Legal Fix?",
        description:
          "Objective: Match each tort case with the correct legal remedy: compensation, apology, or other outcomes.",
        duration: "45 min",
        path: "/TortLawGame3", // ✅
      },
    ],
  },
  {
    title: "LEVEL 2: Crime or Civil? – The Great Classification Showdown",
    description:
      "Mission: Decide whether legal wrongs are crimes, civil cases, or both",
    challenges: [
      {
        title: "Rookie Round – Basics of Crime vs Civil",
        description:
          "Objective: Sort five real-life legal scenarios into Crime or Civil Wrong in a timed drag-and-drop game.",
        duration: "30 min",
        path: "/CrimeCivilGame", // ✅
      },
      {
        title: "Blitz Round – Bonus for Speed & Accuracy",
        description:
          "Objective: Classify 10 rapid-fire scenarios under 90 seconds, using all three drop zones: Crime, Civil, and Both.",
        duration: "30 min",
        path: "/CrimeCivilGame", // Same path if part of same module
      },
    ],
  },
  {
    title: "LEVEL 3: Matching Madness – Legal Terms & Landmark Cases",
    description:
      "Mission: Master legal concepts and Indian judicial milestones",
    challenges: [
      {
        title: "Legal Concepts Matching",
        description:
          "Objective: Match 6 key legal terms (like Mens Rea, Due Process) to their meanings under a time limit.",
        duration: "30 min",
        path: "/LegalConceptsGame", // ✅
      },
      {
        title: "Landmark Case Showdown",
        description:
          "Objective: Match 6 iconic Supreme Court cases to the judicial doctrines or rights they established.",
        duration: "40 min",
        path: "/LandmarkCasesGame", // ✅
      },
      {
        title: "Boss-Level Task: Landmark Recap",
        description:
          "Objective: Review the landmark decisions you matched and unlock the Legal Legacy badge.",
        duration: "10 min",
        path: "/LandmarkCasesResult", // ✅
      },
    ],
  },
];

const tabs = ["Overview Of Games", "Game Levels", "Skills You'll Learn"];

const Container = () => {
  const [activeTab, setActiveTab] = useState("Overview Of Games");
  const { user, role } = useAuth();

  let modules = [];

  if (role === "admin") {
    modules = [
      { group: "Class 6 to 8", levels: modulesfor6to8 },
      { group: "Class 9 to 10", levels: modulesfor9to10 },
      { group: "Class 11 and above", levels: modulesfor11to12 },
    ];
  } else if (!user) {
    modules = modulesfor6to8;
  } else {
    const userClass = user.userClass;
    if (["6th", "7th", "8th"].includes(userClass)) {
      modules = modulesfor6to8;
    } else if (["9th", "10th"].includes(userClass)) {
      modules = modulesfor9to10;
    } else if (["11th", "12th"].includes(userClass)) {
      modules = modulesfor11to12;
    }
  }

  const renderTabContent = () => {
    if (activeTab === "Overview Of Games") {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 py-8">
            {features.map((item, index) => (
              <div
                key={index}
                className="rounded-xl overflow-visible shadow-md bg-white border border-gray-100 relative transform transition-transform duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div
                  className={`relative ${item.bg} h-32 flex justify-center items-end overflow-visible rounded-t-xl`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-[200px] h-[250px] object-contain drop-shadow-xl absolute -top-14 z-10"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <GameInfo />
          <CTA />
        </>
      );
    }

    if (activeTab === "Game Levels") {
      if (role === "admin") {
        return (
          <>
            {modules.map((group, i) => (
              <div key={i} className="mb-10">
                <h2 className="text-xl font-bold mb-4 text-green-700">
                  {group.group}
                </h2>
                <LevelsDisplay modules={group.levels} />
              </div>
            ))}
            <CTA2 />
          </>
        );
      } else {
        return (
          <>
            <LevelsDisplay modules={modules} />
            <CTA2 />
          </>
        );
      }
    }

    if (activeTab === "Skills You'll Learn") {
      return (
        <>
          <SkillsYouWillLearn />
          <CTA3 />
        </>
      );
    }

    return null;
  };

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-4 rounded-t-md font-semibold transition-all duration-150 ease-in-out ${
                activeTab === tab
                  ? "bg-white text-black border-b-2 border-green-600"
                  : "bg-gray-100 text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab-specific content */}
        {renderTabContent()}
      </div>
    </section>
  );
};

export default Container;
