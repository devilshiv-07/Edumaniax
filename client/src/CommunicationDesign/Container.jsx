import React, { useState } from "react";
import CTA from "./CTA";
import CTA2 from "./CTA2";
import CTA3 from "./CTA3";
import LevelsDisplay from "./LevelsDisplay";
import { useAuth } from "@/contexts/AuthContext";
import SkillsYouWillLearn from "./SkillsYouWillLearn";
import GameInfo from "./GamInfo"; // Importing the GameInfo component

const features = [
  {
    title: "4 Comprehensive Levels",
    description:
      "Master communication step-by-step — from basic listening to persuasive speaking — with interactive challenges across 4 skill levels.",
    image: "/imageForDesign/level.png",
    bg: "bg-[#BFF080]",
  },
  {
    title: "Practical Exercises",
    description:
      "Practice real-life conversations, conflict resolution, and active listening through role-play games and scenario-based tasks.",
    image: "/imageForDesign/practical.png",
    bg: "bg-[#FFE1C6]",
  },
  {
    title: "Expert Guidance",
    description:
      "Learn tips and tricks from communication coaches through built-in feedback, strategies, and example dialogues.",
    image: "/imageForDesign/expert.png",
    bg: "bg-[#F9CFFF]",
  },
  {
    title: "Lifetime Access",
    description:
      "Revisit communication techniques anytime with lifetime access to all modules, new games, and updated content.",
    image: "/imageForDesign/lifetime.png",
    bg: "bg-[#C8E7FF]",
  },
];

const modulesfor6to8 = [
  {
    title: "LEVEL 1: The Talk Detective",
    description: "Mission: Decode What Others Say and Speak With Confidence",
    challenges: [
      {
        title: "Listen Up (Interactive Game)",
        description: "Objective: Teach active listening and focus.",
        duration: "45 min",
        path: "/listen-up", // ✅
      },
      {
        title: "Say It Like You Mean It (Simulation)",
        description:
          "Objective: Explore tone, gestures, and facial expressions.",
        duration: "50 min",
        path: "/say-it-like-you-mean-it", // ✅
      },
      {
        title: "Pick Your Persuasion (Choice Game)",
        description:
          "Objective: Practice persuasive speaking in different situations.",
        duration: "45 min",
        path: "/pick-your-persuasion", // ✅
      },
    ],
  },
  {
    title: "LEVEL 2: The Feelings Explorer",
    description: "Mission: Understand Emotions and Build Empathy",
    challenges: [
      {
        title: "Oops, I Interrupted! (Roleplay Game)",
        description:
          "Objective: Learn turn-taking and respectful conversations.",
        duration: "50 min",
        path: "/interrupt-game", // ✅
      },
      {
        title: "Feel It, Find It (Emotion Match Game)",
        description: "Objective: Identify and express emotions accurately.",
        duration: "50 min",
        path: "/feel-it-find-it-game", // ✅
      },
      {
        title: "Fix the Fight (Scenario Challenge)",
        description:
          "Objective: Apply nonviolent communication (NVC) to resolve conflict.",
        duration: "45 min",
        path: "/nvc-game", // ✅
      },
    ],
  },
  {
    title: "LEVEL 3: The Digital Diplomat",
    description: "Mission: Communicate Smartly in Chats, Emails & Social Media",
    challenges: [
      {
        title: "Tone Fixer (Chat Message Game)",
        description:
          "Objective: Practice respectful and clear digital messaging.",
        duration: "50 min",
        path: "/tone-fixer", // ✅
      },
      {
        title: "Speak Up Without Blowing Up (Quiz Game)",
        description: "Objective: Learn assertiveness without aggression.",
        duration: "45 min",
        path: "/speak-up-without-blowing-up", // ✅
      },
      {
        title: "Compliment Quest (Positive Talk Game)",
        description:
          "Objective: Master the art of giving thoughtful compliments.",
        duration: "55 min",
        path: "/compliment-quest", // ✅
      },
    ],
  },
  {
    title: "LEVEL 4: Dialogue Champ",
    description:
      "Mission: Learn to Resolve Conflicts and Convince Others Calmly",
    challenges: [
      {
        title: "The Window Seat War (Sample Dialogue)",
        description:
          "Objective: Practice compromise in peer conflicts through dialogue reordering.",
        duration: "50 min",
        path: "/window-seat-war", // ✅
      },
      {
        title: "Pitch It Like a Pro! (Campaign Game)",
        description:
          "Objective: Build persuasive pitches using emotion, facts, and clear calls to action.",
        duration: "45 min",
        path: "/pitch-it-like-a-pro", // ✅
      },
      {
        title: "Cool the Conflict! (Chat Challenge)",
        description:
          "Objective: Learn calm word swaps and emotional regulation to handle heated chats.",
        duration: "55 min",
        path: "/cool-the-conflict", // ✅
      },
    ],
  },
];

const modulesfor9to10 = [
  {
    title: "LEVEL 1: Communication Cadet",
    description:
      "Focus: Understanding communication elements, non-verbal cues, and listening",
    challenges: [
      {
        title: "Decode the Message!",
        description:
          "Objective: Identify broken elements in the communication cycle using drag-and-drop scenario matching.",
        duration: "45 min",
        path: "/DecodetheMessage",
      },
      {
        title: "The Listener’s Lens",
        description:
          "Objective: Practice active listening by replying to emotional video prompts with empathy and reflection.",
        duration: "50 min",
        path: "/ListenerLensGame",
      },
      {
        title: "What Went Wrong?",
        description:
          "Objective: Spot and label communication barriers like noise, emotion, or language in illustrated stories.",
        duration: "50 min",
        path: "/WhatWentWrongGame",
      },
    ],
  },
  {
    title: "LEVEL 2: Communication Explorer",
    description: "Focus: Persuasion, digital tone, and vocal expression",
    challenges: [
      {
        title: "Pitch Perfect",
        description:
          "Objective: Build a persuasive 3-part pitch using logic, emotion, and credibility with drag-and-drop cards.",
        duration: "50 min",
        path: "/PitchPerfectGame",
      },
      {
        title: "Digital Dilemma",
        description:
          "Objective: Rewrite unclear messages, select emojis, and add clarifications to repair tone in chats.",
        duration: "45 min",
        path: "/DigitalDilemma",
      },
      {
        title: "Tone Translator",
        description:
          "Objective: Match audio clips to tone labels and practice recording phrases in different vocal styles.",
        duration: "50 min",
        path: "/ToneTranslatorGame",
      },
    ],
  },
  {
    title: "LEVEL 3: Communication Strategist",
    description:
      "Focus: Conflict resolution, speech delivery, and formal writing",
    challenges: [
      {
        title: "Conflict Commander",
        description:
          "Objective: Navigate tricky dialogues with empathy and assertiveness using interactive trees.",
        duration: "50 min",
        path: "/ConflictCommanderGame",
      },
      {
        title: "The Big Speech",
        description:
          "Objective: Craft and record a powerful 3-part speech for a real-world cause with clear structure and tone.",
        duration: "55 min",
        path: "/TheBigSpeech",
      },
      {
        title: "Inbox Insight",
        description:
          "Objective: Rewrite informal messages into clear, polite, and professional emails.",
        duration: "50 min",
        path: "/InboxInsightGame",
      },
    ],
  },
];

const modulesfor11to12 = [
  {
    title: "LEVEL 1: The Communication Toolkit",
    description:
      "Mission: Build your foundational communication skills across tone, body language, listening, and feedback.",
    challenges: [
      {
        title: "Decode the Signal",
        description:
          "Objective: Identify and interpret non-verbal cues through body language observation.",
        duration: "45 min",
        path: "/BodyLanguageGame",
      },
      {
        title: "Listen Like a Leader",
        description:
          "Objective: Practice active listening and empathetic response through audio-based simulations.",
        duration: "45 min",
        path: "/ActiveListeningGame",
      },
      {
        title: "Choose Your Voice",
        description:
          "Objective: Understand tone shifts and adapt communication based on the recipient and context.",
        duration: "45 min",
        path: "/ToneSimulatorGame",
      },
    ],
  },
  {
    title: "LEVEL 2: Communication in Action",
    description:
      "Mission: Apply communication skills in real-world social, academic, and digital situations.",
    challenges: [
      {
        title: "Persuade with Purpose",
        description:
          "Objective: Use ethos, pathos, and logos to build strong persuasive pitches.",
        duration: "50 min",
        path: "/PersuasionGame",
      },
      {
        title: "Digital Dilemma",
        description:
          "Objective: Navigate tricky online situations using respectful and responsible communication.",
        duration: "45 min",
        path: "/DigitalDilemmaGame",
      },
      {
        title: "Resolve It Right",
        description:
          "Objective: Practice conflict resolution through tone matching, sentence building, and assertive messaging.",
        duration: "50 min",
        path: "/ResolveItRight",
      },
    ],
  },
  {
    title: "LEVEL 3: Master Communicator",
    description:
      "Mission: Lead with impact, manage public messaging, and give feedback like a pro.",
    challenges: [
      {
        title: "Lead the Team",
        description:
          "Objective: Deliver clear, motivating, and action-oriented messages in a leadership setting.",
        duration: "50 min",
        path: "/LeadershipGame",
      },
      {
        title: "Handle a PR Crisis",
        description:
          "Objective: Respond appropriately to high-pressure situations and protect reputations.",
        duration: "50 min",
        path: "/PRCrisisGame",
      },
      {
        title: "Feedback Loop",
        description:
          "Objective: Practice giving and receiving constructive feedback in a balanced, respectful manner.",
        duration: "50 min",
        path: "/FeedbackLoop",
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
