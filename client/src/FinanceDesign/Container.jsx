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
    title: "3 Comprehensive Levels",
    description:
      "Explore beginner to advanced financial topics through gamified challenges designed for every stage of learning.",
    image: "/imageForDesign/level.png",
    bg: "bg-[#BFF080]",
  },
  {
    title: "Practical Exercises",
    description:
      "Apply concepts like budgeting, saving, and investing through interactive simulations and real-life case studies.",
    image: "/imageForDesign/practical.png",
    bg: "bg-[#FFE1C6]",
  },
  {
    title: "Expert Guidance",
    description:
      "Gain insights from finance professionals through tips, mini-lectures, and scenario-based advice built into each level.",
    image: "/imageForDesign/expert.png",
    bg: "bg-[#F9CFFF]",
  },
  {
    title: "Lifetime Access",
    description:
      "Revisit lessons anytime with lifetime access to all modules, updates, and future finance games.",
    image: "/imageForDesign/lifetime.png",
    bg: "bg-[#C8E7FF]",
  },
];

const modulesfor6to8 = [
  {
    title: "LEVEL 1: The Budgeter",
    description: "Mission: Survive the Month Without Going Broke",
    challenges: [
      {
        title: "Weekly Budget Builder (Drag-and-Drop Game)",
        description: "Objective: Teach budgeting and prioritization.",
        duration: "45 min",
        path: "/budget-builder", // ✅
      },
      {
        title: "“Pick Your Bank” Simulator",
        description: "Objective: Introduce banking basics.",
        duration: "50 min",
        path: "/pick-a-bank", // ✅
      },
      {
        title: "Overspend Trap (Quiz Game)",
        description: "Objective: Scenario-based decision making.",
        duration: "45 min",
        path: "/overspend-trap", // ✅
      },
      {
        title: "Boss-Level Task: “My Real-Life Budget”",
        description: "Objective: Create a one-month budget for yourself.",
        duration: "55 min",
        path: "/budget-activity", // ✅
      },
    ],
  },
  {
    title: "LEVEL 2: The Smart Spender",
    description: "Mission: Buy That Dream Phone Without Getting Tricked",
    challenges: [
      {
        title: "Credit Card Crash Course (Simulator)",
        description: "Objective: Explain credit, interest, and EMI traps.",
        duration: "50 min",
        path: "/credit-card-simulator", // ✅
      },
      {
        title: "EMI vs Lump Sum (Choice-Based Game)",
        description: "Objective: Understand the cost of payment methods.",
        duration: "50 min",
        path: "/emi-vs-lumpsum", // ✅
      },
      {
        title: "Wants vs Needs Sorting",
        description: "Objective: Game format decision-making activity.",
        duration: "45 min",
        path: "/challenge3", // ✅
      },
      {
        title: "Boss-Level Task: “My Purchase Plan”",
        description: "Objective: Plan a smart purchase over 3 months.",
        duration: "55 min",
        path: "/my_purchase_plan", // ✅
      },
    ],
  },
  {
    title: "LEVEL 3: The Rookie Investor",
    description: "Mission: Make Your First ₹10,000 Grow",
    challenges: [
      {
        title: "“News Flash!” Market Events",
        description: "Objective: React to market changes in real time.",
        duration: "50 min",
        path: "/newsflash", // ✅
      },
      {
        title: "Risk-O-Meter Game",
        description: "Objective: Identify risk appetite.",
        duration: "45 min",
        path: "/riskometer", // ✅
      },
      {
        title: "Boss-Level Task: “Build & Present Your Portfolio”",
        description: "Objective: Create a mock investment plan.",
        duration: "55 min",
        path: "/investment-simulator", // ✅
      },
    ],
  },
];

const modulesfor9to10 = [
  {
    title: "LEVEL 1: Financial Explorer",
    description: "Mission: Become a Budgeting Pro in a Simulated Marketplace",
    challenges: [
      {
        title: "Mini Market Master",
        description:
          "Objective: Learn how to budget and make smart spending choices in a simulated market.",
        duration: "45 min",
        path: "/mini-market-master",
      },
      {
        title: "Wealth Quest",
        description:
          "Objective: Explore basic banking concepts, savings, and interest through interactive challenges.",
        duration: "50 min",
        path: "/wealth-quest-game",
      },
      {
        title: "Budget Boss",
        description:
          "Objective: Master monthly budget planning and learn how to balance expenses and savings.",
        duration: "50 min",
        path: "/budget-boss-game",
      },
    ],
  },
];

const modulesfor11to12 = [
  {
    title: "LEVEL 1: Future Finance Leader",
    description: "Mission: Build Real Financial Skills for Adulting",
    challenges: [
      {
        title: "InvestoQuest Pro",
        description:
          "Objective: Dive into investments, returns, and risk to plan a solid investment strategy.",
        duration: "45 min",
        path: "/invest-quest-pro",
      },
      {
        title: "Stock Trader",
        description:
          "Objective: Simulate stock market trading to understand buying, selling, and market trends.",
        duration: "50 min",
        path: "/stock-trader-game",
      },
      {
        title: "FinFest: Life Simulation Challenge",
        description:
          "Objective: Navigate real-life financial scenarios and make decisions on spending, saving, and investing.",
        duration: "45 min",
        path: "/fin-fest-game",
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
