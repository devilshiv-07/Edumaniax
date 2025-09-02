import React, { useState } from "react";
import CTA from "./CTA";
import CTA2 from "./CTA2";
import CTA3 from "./CTA3";
import LevelsDisplay from "./LevelsDisplay";
import { useAuth } from "@/contexts/AuthContext";
import SkillsYouWillLearn from "./SkillsYouWillLearn";
import GameInfo from "./GameInfo";

const features = [
  {
    title: "3 Purpose-Driven Levels",
    description:
      "Explore sustainable entrepreneurship step-by-step — from identifying environmental issues to launching eco-solutions — through interactive, game-based journeys across 3 skill tiers.",
    image: "/imageForDesign/level.png",
    bg: "bg-[#BFF080]",
  },
  {
    title: "Hands-On Green Challenges",
    description:
      "Pitch eco-friendly ideas, design impact-first solutions, and navigate real startup dilemmas with simulations, design thinking tasks, and SDG-focused strategy games.",
    image: "/imageForDesign/practical.png",
    bg: "bg-[#FFE1C6]",
  },
  {
    title: "Inspiration from Green Founders",
    description:
      "Learn from environmental changemakers through in-game mentorship, real venture walkthroughs, and AI-powered feedback to fuel your sustainability journey.",
    image: "/imageForDesign/expert.png",
    bg: "bg-[#F9CFFF]",
  },
  {
    title: "Lifetime Eco Access",
    description:
      "Grow your green entrepreneur toolkit at your pace with lifetime access to all modules, tools, and real-world case studies focused on people, planet, and profit.",
    image: "/imageForDesign/lifetime.png",
    bg: "bg-[#C8E7FF]",
  },
];

const modulesfor6to8 = [
  {
    title: "LEVEL 1: Eco Explorer",
    description:
      "Mission: Understand the environment and explore how different components work together in nature",
    challenges: [
      {
        title: "Classify It (Sorting Game)",
        description:
          "Objective: Identify and sort biotic and abiotic parts of nature.",
        duration: "45 min",
        path: "/classify-it",
      },
      {
        title: "Pick the Zone (Ecosystem Match)",
        description:
          "Objective: Explore forest, desert, and aquatic zones and their traits.",
        duration: "50 min",
        path: "/pick-zone",
      },
      {
        title: "Chain Reaction (Cause-Effect Game)",
        description:
          "Objective: See how one small change can affect an entire ecosystem.",
        duration: "45 min",
        path: "/chain-reaction",
      },
    ],
  },
  {
    title: "LEVEL 2: Eco Decision Maker",
    description:
      "Mission: Make smart, sustainable choices and understand how our actions affect the planet",
    challenges: [
      {
        title: "Green Budget (Resource Challenge)",
        description:
          "Objective: Use limited resources wisely while protecting nature.",
        duration: "50 min",
        path: "/green-budget",
      },
      {
        title: "Match the Fallout (Impact Game)",
        description:
          "Objective: Link everyday actions to their environmental effects.",
        duration: "50 min",
        path: "/match-fallout",
      },
      {
        title: "Climate Pledge (Simulation Game)",
        description:
          "Objective: Make collective decisions to reduce your carbon footprint.",
        duration: "45 min",
        path: "/climate-pledge",
      },
    ],
  },
  {
    title: "LEVEL 3: Climate Action Hero",
    description:
      "Mission: Tackle climate change using data, critical thinking, and real-world action plans",
    challenges: [
      {
        title: "Cause Scanner (Data Challenge)",
        description:
          "Objective: Investigate the causes of climate change with real data.",
        duration: "50 min",
        path: "/cause-scanner",
      },
      {
        title: "Meltdown Tracker (Global Impact Game)",
        description:
          "Objective: Track ice melt, temperature rise, and their global effects.",
        duration: "45 min",
        path: "/melt-down-tracker",
      },
      {
        title: "Dilemma Cards (Ethics Debate)",
        description:
          "Objective: Debate tricky environmental issues and propose fair solutions.",
        duration: "55 min",
        path: "/dilemma-cards",
      },
    ],
  },
];

const modulesfor9to10 = [
  {
    title: "LEVEL 1: System Sync",
    description:
      "Focus: Explore the chain reactions between human activities, natural effects, and Earth’s spheres.",
    challenges: [
      {
        title: "Cause & Effect – Ecosystem Chain Builder",
        description:
          "Objective: Build logical chains linking human activities to effects and impacted Earth spheres.",
        duration: "15–18 min",
        path: "/CauseEffectGame",
      },
      {
        title: "Feedback Loop Fix – Systems Thinking Challenge",
        description:
          "Objective: Complete or correct positive/negative environmental feedback loops.",
        duration: "15–18 min",
        path: "/FeedbackLoopGame",
      },
    ],
  },
  {
    title: "LEVEL 2: Footprint Face-Off",
    description:
      "Focus: Compare sustainability across nations and spot hidden environmental costs.",
    challenges: [
      {
        title: "Measure & Compare – Sustainability Metrics Quiz",
        description:
          "Objective: Analyze HDI vs Ecological Footprint trade-offs in real-world scenarios.",
        duration: "15–18 min",
        path: "/MeasureCompareQuiz",
      },
      {
        title: "Externality Detective – Match & Reveal Game",
        description:
          "Objective: Match real-world actions to their hidden social or environmental costs.",
        duration: "15–18 min",
        path: "/ExternalityDetectiveGame",
      },
    ],
  },
  {
    title: "LEVEL 3: Tech Truth or Illusion?",
    description:
      "Focus: Evaluate infrastructure choices and distinguish real sustainability from greenwashing.",
    challenges: [
      {
        title: "Infrastructure Showdown – Which One’s Greener?",
        description:
          "Objective: Pick between competing tech options based on long-term environmental impact.",
        duration: "15–18 min",
        path: "/SustainabilityGames1",
      },
      {
        title: "Techno-Solutionism – Spot the Illusion",
        description:
          "Objective: Identify where technology is oversold without solving the root issue.",
        duration: "15–18 min",
        path: "/SustainabilityGames2",
      },
    ],
  },
];

const modulesfor11to12 = [
  {
    title: "LEVEL 1: Cycle Sleuths – Escape Room Edition",
    description:
      "Theme: Solve interactive puzzles and repair disrupted biogeochemical cycles to escape a locked biosphere lab.",
    challenges: [
      {
        title: "Carbon Cycle Vault",
        description:
          "Objective: Sequence key carbon processes, identify human disruptions, and match sinks and sources.",
        duration: "50–55 min",
        path: "/CarbonCycleVault",
      },
      {
        title: "Nitrogen Reactor",
        description:
          "Objective: Decode the nitrogen cycle, diagnose human impacts, and restore missing flow steps.",
        duration: "50–55 min",
        path: "/NitrogenReactor",
      },
      {
        title: "Phosphorus Lockdown",
        description:
          "Objective: Reconstruct the phosphorus cycle and explore the risks of fertilizer overuse and resource depletion.",
        duration: "45–50 min",
        path: "/PhosphorusLockdown",
      },
      {
        title: "Water Grid Crisis",
        description:
          "Objective: Complete water cycle puzzles and recommend urban water fixes to prevent crises.",
        duration: "50–55 min",
        path: "/WaterGridCrisis",
      },
    ],
  },
  {
    title: "LEVEL 2: Water Wipeout",
    description:
      "Theme: Redesign cities and deploy crisis strategies to address urban flooding and water scarcity.",
    challenges: [
      {
        title: "Urban Flood Flashpoint",
        description:
          "Objective: Plan sustainable layouts to prevent flash floods and increase groundwater recharge.",
        duration: "50–55 min",
        path: "/UrbanFloodFlashpoint",
      },
      {
        title: "Day Zero – Chennai Water Crisis",
        description:
          "Objective: Delay the city’s water shutdown by making tough policy choices and emergency plans.",
        duration: "50–55 min",
        path: "/DayZero",
      },
    ],
  },
  {
    title: "LEVEL 3: Food vs Fertility",
    description:
      "Theme: Investigate fertilizer overuse, phosphorus scarcity, and make smarter agro-policy decisions.",
    challenges: [
      {
        title: "Urea Addiction – Reform Without Fallout",
        description:
          "Objective: Use flashcards to uncover urea overuse causes, its consequences, and smarter solutions.",
        duration: "50–55 min",
        path: "/UreaAddiction",
      },
      {
        title: "Peak Phosphorus Panic – The Vanishing Element",
        description:
          "Objective: Spin the wheel of scenarios and respond with effective, sustainable policy moves.",
        duration: "50–55 min",
        path: "/PeakPhosphorusPanic",
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
