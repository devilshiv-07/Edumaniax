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
    title: "3 SEL-Powered Levels",
    description:
      "Grow from self-awareness to social impact through interactive SEL games that build emotional intelligence, empathy, and leadership confidence.",
    image: "/imageForDesign/level.png",
    bg: "bg-[#BFF080]",
  },
  {
    title: "Real-Life Practice",
    description:
      "Strengthen emotional regulation, communication, and responsible decision-making through role-plays, reflection tasks, and teamwork simulations.",
    image: "/imageForDesign/practical.png",
    bg: "bg-[#FFE1C6]",
  },
  {
    title: "Guided Growth",
    description:
      "Learn with the help of SEL mentors who guide you through emotion checks, value-based decisions, and empathy-building moments.",
    image: "/imageForDesign/expert.png",
    bg: "bg-[#F9CFFF]",
  },
  {
    title: "Access Anytime, Reflect Often",
    description:
      "Come back to your social and emotional learning journey anytime to revisit key lessons, explore new challenges, and track your growth.",
    image: "/imageForDesign/lifetime.png",
    bg: "bg-[#C8E7FF]",
  },
];

const modulesfor6to8 = [
  {
    title: "LEVEL 1: The Self Explorer",
    description: "Mission: Understand Emotions & Build Friendships",
    challenges: [
      {
        title: "Mood Mirror (Reflection Game)",
        description:
          "Objective: Spot and name emotions in real school situations.",
        duration: "45 min",
        path: "/mood-mirror",
      },
      {
        title: "Friendship Fixer (Empathy Game)",
        description:
          "Objective: Learn how to manage peer conflicts with kindness and communication.",
        duration: "50 min",
        path: "/friendship-fixer",
      },
      {
        title: "Boss-Level Task: Kindness Clicks",
        description:
          "Objective: Make choices that spread positivity in social situations.",
        duration: "45 min",
        path: "/kindness-clicks",
      },
    ],
  },
  {
    title: "LEVEL 2: The Emotion Manager",
    description: "Mission: Learn to Stay Calm & In Control",
    challenges: [
      {
        title: "Stress Buster Lab (Strategy Game)",
        description:
          "Objective: Spot stress triggers and apply calming strategies.",
        duration: "50 min",
        path: "/stress-buster-lab",
      },
      {
        title: "Conflict Quest (Decision Game)",
        description:
          "Objective: Choose healthy responses to conflict and find peaceful solutions.",
        duration: "50 min",
        path: "/conflict-quest",
      },
      {
        title: "Boss-Level Task: Mind Body Match-Up",
        description:
          "Objective: Connect thoughts, feelings, and body signals for self-awareness.",
        duration: "45 min",
        path: "/mind-body-match-up",
      },
      {
        title: "Bonus Task: Influence Explorer",
        description:
          "Objective: Reflect on how media and friends shape choices and feelings.",
        duration: "45 min",
        path: "/influence-explorer",
      },
    ],
  },
  {
    title: "LEVEL 3: The Connection Navigator",
    description: "Mission: Grow Stronger Friendships & Support Networks",
    challenges: [
      {
        title: "Mission Goal Tracker (Social Dilemma Game)",
        description:
          "Objective: Handle tricky friendship changes and personal boundaries.",
        duration: "50 min",
        path: "/mission-goal-tracker",
      },
      {
        title: "Help Hub (Support Reflection)",
        description:
          "Objective: Identify your safe adult and peer support systems.",
        duration: "45 min",
        path: "/help-hub",
      },
      {
        title: "Boss-Level Task: My Circle Mission",
        description:
          "Objective: Design your ideal friend circle with online/offline trust zones.",
        duration: "55 min",
        path: "/my-circle-mission",
      },
    ],
  },
];

const modulesfor9to10 = [
  {
    title: "LEVEL 1: Understand Yourself and Others",
    description: "Mission: Build emotional insight and empathy.",
    challenges: [
      {
        title: "Emotion Decoder",
        description:
          "Objective: Identify hidden emotions behind actions in real-life scenarios and justify your reasoning.",
        duration: "45 min",
        path: "/emotion-decoder",
      },
      {
        title: "Respond, Don’t React",
        description:
          "Objective: Practice assertive responses in tricky social situations and understand their emotional outcomes.",
        duration: "50 min",
        path: "/respond-dont-react",
      },
      {
        title: "Spot the Strength",
        description:
          "Objective: Match actions to emotional strengths like empathy, perseverance, or accountability.",
        duration: "50 min",
        path: "/spot-the-strength",
      },
    ],
  },
  {
    title: "LEVEL 2: Stay Centered and In Control",
    description: "Mission: Manage stress and develop emotional regulation.",
    challenges: [
      {
        title: "Stress Response Builder",
        description:
          "Objective: Create your personal toolkit of calming strategies to manage pressure during tough times.",
        duration: "50 min",
        path: "/stress-response-builder",
      },
      {
        title: "Conflict Choices",
        description:
          "Objective: Navigate social conflicts using empathy, private dialogue, and resolution strategies.",
        duration: "50 min",
        path: "/conflict-choices",
      },
      {
        title: "Body Signal Match-Up",
        description:
          "Objective: Match physical signs like posture or heartbeat to underlying emotions in a fast-paced game.",
        duration: "45 min",
        path: "/body-signal-matchup",
      },
      {
        title: "Control Sorter – What’s Within Your Power?",
        description:
          "Objective: Click-and-Sort thoughts into Influence vs Concern. Win by getting 8/10 correct.",
        duration: "45 min",
        path: "/control-sorter",
      },
    ],
  },
  {
    title: "LEVEL 3: Grow and Lead",
    description: "Mission: Take charge with goals, action, and empathy.",
    challenges: [
      {
        title: "Smart Goal Lab",
        description:
          "Objective: Break a goal into SMART steps and create a realistic action plan.",
        duration: "50 min",
        path: "/smart-goal-lab",
      },
      {
        title: "Help Network Builder",
        description:
          "Objective: Identify the right person or resource to seek help in different real-world situations.",
        duration: "45 min",
        path: "/help-network-builder",
      },
      {
        title: "Influence Journal",
        description:
          "Objective: Sort your worries and write an action step to control what matters most.",
        duration: "50 min",
        path: "/influence-journal",
      },
    ],
  },
];

const modulesfor11to12 = [
  {
    title: "LEVEL 1: Emotional Clarity & Identity",
    description:
      "Mission: Strengthen self-awareness, reframe negativity, and explore how identity evolves.",
    challenges: [
      {
        title: "Thought Reframer",
        description:
          "Objective: Identify and reframe 3 negative automatic thoughts using logic and self-compassion.",
        duration: "50 min",
        path: "/ThoughtReframerDrag",
      },
      {
        title: "Boundary Builder",
        description:
          "Objective: Choose respectful, assertive ways to protect your emotional space in social situations.",
        duration: "50 min",
        path: "/BoundaryBuilder",
      },
    ],
  },
  {
    title: "LEVEL 2: Energy, Focus & Emotional Health",
    description:
      "Mission: Track burnout signals and optimize focus based on energy rhythms.",
    challenges: [
      {
        title: "Burnout Barometer",
        description:
          "Objective: Complete a 5-point wellness check and receive custom self-care suggestions.",
        duration: "50 min",
        path: "/BurnoutBarometer",
      },
      {
        title: "Focus Tracker",
        description:
          "Objective: Plan your peak-focus schedule using drag-and-drop time blocks and compare with real usage.",
        duration: "50 min",
        path: "/FocusTracker",
      },
    ],
  },
  {
    title: "LEVEL 3: Ethical Thinking & Decision-Making",
    description:
      "Mission: Lead with clarity and integrity in challenging moral situations.",
    challenges: [
      {
        title: "Ethical Dilemma Simulator",
        description:
          "Objective: Navigate real-world ethical scenarios and reflect on long-term impacts of your choices.",
        duration: "50 min",
        path: "/EthicalSimulator",
      },
      {
        title: "Legacy Builder",
        description:
          "Objective: Choose your core traits, values, and passions to craft a 3-line leadership legacy statement.",
        duration: "50 min",
        path: "/LegacyBuilder",
      },
    ],
  },
  {
    title: "LEVEL 4: Growth & Self-Transformation",
    description:
      "Mission: Celebrate how far you’ve come and define the leader you’re becoming.",
    challenges: [
      {
        title: "Identity Shifter",
        description:
          "Objective: Reflect on your growth journey by comparing past behaviors with current values and strengths.",
        duration: "50 min",
        path: "/IdentityShifter",
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
