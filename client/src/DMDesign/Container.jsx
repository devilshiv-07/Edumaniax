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
    title: "3 Comprehensive Levels",
    description:
      "Unlock beginner to advanced marketing strategies — from branding basics to performance ads — through interactive, game-based lessons across 3 skill tiers.",
    image: "/imageForDesign/level.png",
    bg: "bg-[#BFF080]",
  },
  {
    title: "Practical Exercises",
    description:
      "Create ad campaigns, analyze audience data, and simulate real-world marketing scenarios with hands-on challenges and strategy puzzles.",
    image: "/imageForDesign/practical.png",
    bg: "bg-[#FFE1C6]",
  },
  {
    title: "Expert Guidance",
    description:
      "Get insider tips from marketing pros via in-game mentorship, campaign walkthroughs, and data-driven feedback to sharpen your skills.",
    image: "/imageForDesign/expert.png",
    bg: "bg-[#F9CFFF]",
  },
  {
    title: "Lifetime Access",
    description:
      "Learn digital marketing at your own pace with lifetime access to all modules, new tools, trends, and campaign updates.",
    image: "/imageForDesign/lifetime.png",
    bg: "bg-[#C8E7FF]",
  },
];

const modulesfor6to8 = [
  {
    title: "LEVEL 1: Digital Explorer",
    description:
      "Mission: Discover what digital marketing is and how brands connect with people online",
    challenges: [
      {
        title: "Ad Detective (Exploration Game)",
        description: "Objective: Spot 5 types of digital marketing around you.",
        duration: "45 min",
        path: "/intro-ad-detective-game", // ✅
      },
      {
        title: "Brand Explorer (Interactive Activity)",
        description:
          "Objective: Analyze how 3 favorite brands express their identity online.",
        duration: "50 min",
        path: "/brand-explorer-intro", // ✅
      },
      {
        title: "Build-A-Brand (Creative Challenge)",
        description:
          "Objective: Create your own fun brand with a logo, personality, and slogan.",
        duration: "55 min",
        path: "/brand-creator-game", // ✅
      },
    ],
  },
  {
    title: "LEVEL 2: Content Commander",
    description:
      "Mission: Learn how content is used to attract and engage audiences",
    challenges: [
      {
        title: "Caption Craze (Writing Game)",
        description:
          "Objective: Write fun, catchy captions for a smoothie brand.",
        duration: "45 min",
        path: "/caption-craze", // ✅
      },
      {
        title: "Reel It In! (Video Ad Planner)",
        description:
          "Objective: Plan a 15-second reel ad for a chocolate brand.",
        duration: "50 min",
        path: "/reel-planner-game", // ✅
      },
      {
        title: "Post Match (Matching Game)",
        description:
          "Objective: Match content types to brands and suggest one idea.",
        duration: "50 min",
        path: "/matching-game", // ✅
      },
    ],
  },
  {
    title: "LEVEL 3: Campaign Captain",
    description:
      "Mission: Plan and launch a digital ad campaign for a fun cap brand",
    challenges: [
      {
        title: "Campaign Planner (Strategy Game)",
        description:
          "Objective: Define your audience, platforms, slogan, and strategy.",
        duration: "55 min",
        path: "/campaign-planner", // ✅
      },
      {
        title: "Budget Battle (Simulation Game)",
        description:
          "Objective: Spend ₹500 across platforms and justify your strategy.",
        duration: "50 min",
        path: "/budget-battle", // ✅
      },
      {
        title: "Analytics Adventure (Data Game)",
        description: "Objective: Analyze campaign performance using mock data.",
        duration: "50 min",
        path: "/analytics-adventure", // ✅
      },
    ],
  },
];

const modulesfor9to10 = [
  {
    title: "LEVEL 1: Digital Explorer",
    description: "Focus: Strategy, audience personas & social media planning",
    challenges: [
      {
        title: "Persona Puzzle — Simulation Edition",
        description:
          "Objective: Match personas, run campaign flow, and write a creative reel for GlowPop.",
        duration: "12–15 min",
        path: "/digital-explorer",
      },
      {
        title: "Platform Picker – Strategy Lab",
        description:
          "Objective: Align campaign goals with platforms and choose effective content strategies.",
        duration: "12–15 min",
        path: "/carousel-campaign",
      },
      {
        title: "Audience Decoder – Targeting Tactics",
        description:
          "Objective: Segment audiences, build a targeting strategy, and craft short ad copy.",
        duration: "12–15 min",
        path: "/brand-voice",
      },
    ],
  },
  {
    title: "LEVEL 2: Content Commander",
    description: "Focus: Content creation, storytelling & brand voice",
    challenges: [
      {
        title: "Reel Architect – Build to Hook",
        description:
          "Objective: Build a 15-sec Reel with correct sequence, visuals and captions.",
        duration: "15–18 min",
        path: "/reel-architect",
      },
      {
        title: "Storyboard Sprint – Carousel Campaign",
        description:
          "Objective: Create an Instagram carousel campaign and match tone to brand.",
        duration: "15–18 min",
        path: "/StoryboardSprintGame",
      },
      {
        title: "Brand Voice Challenge – AI Chat Sim",
        description:
          "Objective: Respond to customers on different platforms and maintain brand voice.",
        duration: "15–18 min",
        path: "/BrandVoiceChallengeGame",
      },
    ],
  },
  {
    title: "LEVEL 3: Campaign Captain – Instagram Ad Lab",
    description:
      "Focus: Build ad creatives, set targeting & budget, analyze and optimize performance",
    challenges: [
      {
        title: "Campaign Captain – Instagram Ad Lab",
        description:
          "Objective: End-to-end campaign simulation: ad creation, targeting, budgeting, and dashboard optimization.",
        duration: "18–20 min",
        path: "/CampaignCaptainGame",
      },
    ],
  },
];

const modulesfor11to12 = [
  {
    title: "LEVEL 1: Digital Detective",
    description:
      "Theme: Crack the Code of Who, What & Where – Understand digital marketing basics and identify the right audience.",
    challenges: [
      {
        title: "Ad Spotter – Find the Hidden Campaigns",
        description:
          "Objective: Identify hidden marketing messages in common digital content.",
        duration: "12–15 min",
        path: "/ad-spotter-game",
      },
      {
        title: "Persona Builder – Know Your People",
        description:
          "Objective: Create a basic customer persona using age, interest, and platform data.",
        duration: "12–15 min",
        path: "/persona-builder-game",
      },
      {
        title: "Audience Match-Up – Who Buys What?",
        description:
          "Objective: Match product types with the most likely target audience.",
        duration: "12–15 min",
        path: "/audience-match-up-game",
      },
    ],
  },
  {
    title: "LEVEL 2: Content Creator",
    description:
      "Theme: Create the Scroll-Stopping Strategy – Craft compelling content, choose smart platforms, and plan basic campaigns.",
    challenges: [
      {
        title: "Caption Clinic – Make It Clickworthy",
        description:
          "Objective: Improve weak captions with better hooks, benefits, and CTAs.",
        duration: "15–18 min",
        path: "/caption-clinic-game",
      },
      {
        title: "Platform Picker – Right Post, Right Place",
        description:
          "Objective: Match content formats with the most suitable platforms.",
        duration: "15–18 min",
        path: "/platform-picker-game",
      },
      {
        title: "Campaign Puzzle – Connect the Pieces",
        description:
          "Objective: Sequence a 3-step campaign from awareness to action.",
        duration: "15–18 min",
        path: "/campaign-puzzle-game",
      },
    ],
  },
  {
    title: "LEVEL 3: Marketing Master",
    description:
      "Theme: Launch. Track. Optimize. – Simulate campaign decisions, analyze dashboards, and build your final pitch.",
    challenges: [
      {
        title: "Boost or Post – Make the Right Move",
        description:
          "Objective: Decide when to boost content or improve it based on performance.",
        duration: "15–18 min",
        path: "/boost-or-post-game",
      },
      {
        title: "Metric Match-Up – Read the Dashboard",
        description:
          "Objective: Analyze ad performance metrics to decide which campaign worked best.",
        duration: "15–18 min",
        path: "/metric-match-up-game",
      },
      {
        title: "Final Campaign Builder – Your Digital Pitch",
        description:
          "Objective: Plan a complete campaign from target audience to hook, CTA, and goals.",
        duration: "18–20 min",
        path: "/campaign-builder-game",
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
