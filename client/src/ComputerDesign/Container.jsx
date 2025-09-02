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
      "Unlock core to advanced concepts — from coding logic to AI algorithms — through fun, game-based learning across 3 skill tiers.",
    image: "/imageForDesign/level.png",
    bg: "bg-[#BFF080]",
  },
  {
    title: "Practical Exercises",
    description:
      "Build your own algorithms, debug code, and simulate real-world AI tasks with hands-on coding challenges and logic puzzles.",
    image: "/imageForDesign/practical.png",
    bg: "bg-[#FFE1C6]",
  },
  {
    title: "Expert Guidance",
    description:
      "Get tips from AI and tech experts via in-game mentorship, walkthroughs, and smart hints to boost your problem-solving skills.",
    image: "/imageForDesign/expert.png",
    bg: "bg-[#F9CFFF]",
  },
  {
    title: "Lifetime Access",
    description:
      "Explore coding and AI at your own pace with unlimited lifetime access to all modules, new challenges, and future tech updates.",
    image: "/imageForDesign/lifetime.png",
    bg: "bg-[#C8E7FF]",
  },
];

const modulesfor6to8 = [
  {
    title: "LEVEL 1: AI Explorer",
    description:
      "Mission: Discover What AI Is and How It Mimics Human Thinking",
    challenges: [
      {
        title: "AI All Around You (Exploration Game)",
        description:
          "Objective: Spot real-life examples of AI in your daily life.",
        duration: "45 min",
        path: "/AI-challenge", // ✅
      },
      {
        title: "Meet the AI Types (Interactive Lesson)",
        description:
          "Objective: Understand the different kinds of AI and what they can do.",
        duration: "50 min",
        path: "/meet-ai-types", // ✅
      },
      {
        title: "Build Your Bot (Design Activity)",
        description: "Objective: Design your own AI-powered robot or machine.",
        duration: "45 min",
        path: "/build-a-bot", // ✅
      },
    ],
  },
  {
    title: "LEVEL 2: AI Brain Trainer",
    description: "Mission: Learn How AI Thinks, Learns, and Solves Problems",
    challenges: [
      {
        title: "Train the Brain (Simulation Game)",
        description:
          "Objective: Understand how machines learn from data like the human brain.",
        duration: "50 min",
        path: "/train-the-brain", // ✅
      },
      {
        title: "Smart Or Not (Sorting Challenge)",
        description: "Objective: Test what AI can and cannot do.",
        duration: "50 min",
        path: "/smart-or-not", // ✅
      },
      {
        title: "AI Problem Solver (Scenario Game)",
        description: "Objective: Use AI thinking to solve real-world problems.",
        duration: "45 min",
        path: "/ai-problem-solver", // ✅
      },
    ],
  },
  {
    title: "LEVEL 3: AI Innovator",
    description: "Mission: Think Critically and Design AI for a Better World",
    challenges: [
      {
        title: "AI Ethics Detective (Investigation Game)",
        description:
          "Objective: Explore the rights and wrongs of how AI is used.",
        duration: "50 min",
        path: "/ai-ethics-detective", // ✅
      },
      {
        title: "Future AI Architect (Creative Design Game)",
        description:
          "Objective: Imagine and design AI tools that help people in the future.",
        duration: "45 min",
        path: "/future-ai-architect", // ✅
      },
      {
        title: "AI Career Explorer (Discovery Game)",
        description:
          "Objective: Discover exciting careers where AI is making a difference.",
        duration: "55 min",
        path: "/ai-career-explorer", // ✅
      },
    ],
  },
];

const modulesfor9to10 = [
  {
    title: "LEVEL 1: AI Detective",
    description: "Focus: Explore AI in tools, jobs, and smart cities",
    challenges: [
      {
        title: "Spy the Smart Tech",
        description:
          "Objective: Identify which everyday tools actually use AI and understand how they work.",
        duration: "45 min",
        path: "/spy-the-smart-tech",
      },
      {
        title: "Which AI Does What?",
        description:
          "Objective: Match AI use-cases to real professions and see how AI supports different careers.",
        duration: "50 min",
        path: "/which-ai-does-what",
      },
      {
        title: "Fill My Smart City",
        description:
          "Objective: Design an AI-powered smart city by assigning tech tools to the right zones.",
        duration: "50 min",
        path: "/smart-city-game",
      },
    ],
  },
  {
    title: "LEVEL 2: AI Skill Builder",
    description: "Focus: Understand how AI learns, makes errors, and performs",
    challenges: [
      {
        title: "Train the Trainer – AI Edition",
        description:
          "Objective: Simulate how AI models learn from data and recognize the importance of training quality.",
        duration: "50 min",
        path: "/TrainAIModelGame",
      },
      {
        title: "Oops! AI Goof-Ups",
        description:
          "Objective: Spot and explain why AI systems fail or succeed in real-world scenarios.",
        duration: "50 min",
        path: "/AIOopsGame",
      },
      {
        title: "Rate the Intelligence",
        description:
          "Objective: Evaluate different AI systems by rating their level of ‘smartness’.",
        duration: "50 min",
        path: "/RateTheIntelligenceGame",
      },
    ],
  },
  {
    title: "LEVEL 3: AI Changemaker",
    description:
      "Focus: Design ethical AI, explore careers, and reflect on responsible tech use",
    challenges: [
      {
        title: "Justice for All (AI Ethics)",
        description:
          "Objective: Judge AI fairness in real-life situations and suggest ethical improvements.",
        duration: "50 min",
        path: "/justice-for-all",
      },
      {
        title: "Design-A-Bot for Good",
        description:
          "Objective: Create an AI bot to solve a real-world social issue and describe how it works.",
        duration: "55 min",
        path: "/design-a-bot",
      },
      {
        title: "Future Me in AI",
        description:
          "Objective: Explore AI-related careers, match skills needed, and reflect on your future path.",
        duration: "50 min",
        path: "/FutureMeInAI",
      },
      {
        title: "Think Before You Tech!",
        description:
          "Objective: Reflect on responsible AI usage habits using a checklist of common situations.",
        duration: "50 min",
        path: "/ThinkBeforeYouTechGame",
      },
    ],
  },
];

const modulesfor11to12 = [
  {
    title: "LEVEL 1: Algorithm Explorer",
    description:
      "Mission: Understand how classic AI algorithms solve real-world problems using search, optimization, and strategy.",
    challenges: [
      {
        title: "Social Media Detective",
        description:
          "Objective: Use BFS and DFS to track how fake news spreads across a social network map.",
        duration: "50 min",
        path: "/SocialMediaDetective",
      },
      {
        title: "Smart GPS Challenge",
        description:
          "Objective: Implement A* search to find optimal routes for emergency vehicles in a dynamic city map.",
        duration: "50 min",
        path: "/SmartGPSChallenge",
      },
      {
        title: "Evolution Lab Simulator",
        description:
          "Objective: Use genetic algorithms to evolve crop varieties that survive harsh environmental challenges.",
        duration: "55 min",
        path: "/EvolutionLabSimulator",
      },
      {
        title: "Chess Master AI Trainer",
        description:
          "Objective: Apply minimax with alpha-beta pruning to make optimal chess decisions.",
        duration: "55 min",
        path: "/ChessMasterTrainer",
      },
    ],
  },
  {
    title: "LEVEL 2: Machine Learning Builder",
    description:
      "Mission: Learn how machines make decisions from data—detecting diseases, sorting emails, making recommendations, and recognizing images.",
    challenges: [
      {
        title: "Medical Diagnosis Assistant",
        description:
          "Objective: Build a decision tree that helps doctors quickly diagnose common illnesses.",
        duration: "50 min",
        path: "/MedicalDiagnosisAssistant",
      },
      {
        title: "Smart Email Guardian",
        description:
          "Objective: Train a neural network to filter spam emails based on sender, content, and patterns.",
        duration: "50 min",
        path: "/SmartEmailGuardian",
      },
      {
        title: "Netflix Recommendation Engine",
        description:
          "Objective: Create a hybrid recommendation system using user behavior and movie features.",
        duration: "55 min",
        path: "/recommender",
      },
      {
        title: "Autonomous Car Vision System",
        description:
          "Objective: Use CNNs to detect objects and make safe driving decisions in real-time scenarios.",
        duration: "55 min",
        path: "/AutonomousCarVision",
      },
    ],
  },
  {
    title: "LEVEL 3: Generative AI Innovator",
    description:
      "Mission: Build AI systems that understand, generate, and interact using natural language and personalized tools.",
    challenges: [
      {
        title: "Customer Service Chatbot Builder",
        description:
          "Objective: Use NLP and transformers to design a chatbot that understands queries and responds empathetically.",
        duration: "55 min",
        path: "/ChatbotBuilder",
      },
      {
        title: "School Social Media Manager",
        description:
          "Objective: Create engaging event posts using AI-generated text and tone-matching templates.",
        duration: "45 min",
        path: "/SchoolSocialMediaManager",
      },
      {
        title: "Personal Study Buddy",
        description:
          "Objective: Build a homework helper that scans math problems, suggests schedules, and creates quizzes.",
        duration: "50 min",
        path: "/PersonalStudyBuddy",
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
