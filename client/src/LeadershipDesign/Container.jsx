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
    title: "4 Dynamic Levels",
    description:
      "Explore beginner to advanced leadership challenges through interactive games and real-world simulations designed to build confident, capable leaders.",
    image: "/imageForDesign/level.png",
    bg: "bg-[#BFF080]",
  },
  {
    title: "Practical Exercises",
    description:
      "Sharpen your decision-making, communication, and critical thinking through engaging role-plays, dilemmas, and team scenarios.",
    image: "/imageForDesign/practical.png",
    bg: "bg-[#FFE1C6]",
  },
  {
    title: "Mentor Insights",
    description:
      "Grow with guidance from leadership mentors through built-in tips, reflection prompts, and scenario-based advice at every level.",
    image: "/imageForDesign/expert.png",
    bg: "bg-[#F9CFFF]",
  },
  {
    title: "Lifetime Access",
    description:
      "Revisit leadership lessons anytime with lifetime access to all modules, updates, and future challenges.",
    image: "/imageForDesign/lifetime.png",
    bg: "bg-[#C8E7FF]",
  },
];

const modulesfor6to8 = [
  {
    title: "LEVEL 1: The Vision Builder",
    description: "Mission: Discover Your Inner Leader",
    challenges: [
      {
        title: "Leader Type Match-Up (Sorting Game)",
        description:
          "Objective: Match leadership styles with their traits and real-world examples.",
        duration: "45 min",
        path: "/leader-type",
      },
      {
        title: "Vision Canvas (Goal-Setting Game)",
        description:
          "Objective: Create your personal leadership vision and 2 SMART goals.",
        duration: "50 min",
        path: "/vision-builder",
      },
      {
        title: "Boss-Level Task: “My Leadership Poster”",
        description:
          "Objective: Design a poster that shows your leadership style and goals.",
        duration: "55 min",
        path: "/leadership-poster",
      },
    ],
  },
  {
    title: "LEVEL 2: The Empathy Communicator",
    description: "Mission: Master Words & Emotions",
    challenges: [
      {
        title: "Say It Right! (Interactive Scenarios)",
        description:
          "Objective: Choose how to respond in tricky communication situations.",
        duration: "50 min",
        path: "/communication-lab",
      },
      {
        title: "Empathy Radar (Quiz & Reflection)",
        description:
          "Objective: Learn to notice others’ feelings and respond with care.",
        duration: "50 min",
        path: "/empathy-radar",
      },
      {
        title: "Boss-Level Task: “Kind Words Challenge”",
        description:
          "Objective: Write or record 3 examples of kind, clear communication you’ve used.",
        duration: "55 min",
        path: "/kind-words-challenge",
      },
    ],
  },
  {
    title: "LEVEL 3: The Team Strategist",
    description: "Mission: Make Smart Choices with People",
    challenges: [
      {
        title: "Decision Room (Game Simulation)",
        description:
          "Objective: Solve decision dilemmas by choosing the best option under pressure.",
        duration: "50 min",
        path: "/decision-room",
      },
      {
        title: "Team Architect (Drag-and-Drop Game)",
        description:
          "Objective: Assign teammates to the right tasks and build team success.",
        duration: "45 min",
        path: "/team-architect",
      },
      {
        title: "Boss-Level Task: “My Teamwork Story”",
        description:
          "Objective: Share a time you made a decision or helped your team.",
        duration: "55 min",
        path: "/teamwork-story",
      },
    ],
  },
  {
    title: "LEVEL 4: The Impact Creator",
    description: "Mission: Lead with Purpose and Integrity",
    challenges: [
      {
        title: "Innovation Sprint (Mini Project)",
        description:
          "Objective: Pick a problem, design a solution, and plan your leadership project.",
        duration: "50 min",
        path: "/innovation-sprint",
      },
      {
        title: "Integrity Quest (Dilemma Challenge)",
        description:
          "Objective: Navigate ethical choices and decide what a strong leader would do.",
        duration: "45 min",
        path: "/integrity-quest",
      },
      /* {
        title: "Boss-Level Task: “My Change Pitch”",
        description:
          "Objective: Present your mini project idea to solve a real-world issue.",
        duration: "55 min",
        path: "/change-pitch",
      }, */
    ],
  },
];

const modulesfor9to10 = [
  {
    title: "LEVEL 1: Discover Your Leadership Style",
    description:
      "Mission: Explore who you are as a leader and set your vision.",
    challenges: [
      {
        title: "Leadership Identity Mixer",
        description:
          "Objective: Match leadership styles to scenarios, reflect on your values, and explore your dominant leadership type.",
        duration: "45 min",
        path: "/leadership-identity-mixer",
      },
      {
        title: "Vision Blueprint Builder",
        description:
          "Objective: Fill out a Vision Canvas and set SMART+ER goals to turn your leadership dream into an actionable plan.",
        duration: "50 min",
        path: "/vision-blueprint-builder",
      },
      /*{
        title: "Boss-Level Task: My Leadership Poster",
        description:
          "Objective: Design a poster that showcases your leadership identity and vision in a bold, visual format.",
        duration: "55 min",
        path: "/leadership-poster",
      }, */
    ],
  },
  {
    title: "LEVEL 2: Master Communication & Emotions",
    description: "Mission: Lead with empathy, clarity, and emotional strength.",
    challenges: [
      {
        title: "The Conflict Simulator",
        description:
          "Objective: Choose how to respond in peer conflicts and receive leadership scores based on your choices.",
        duration: "50 min",
        path: "/conflict-simulator",
      },
      {
        title: "EQ Tracker",
        description:
          "Objective: Log your emotions across 3 days, reflect on a high-stress moment, and apply EQ strategies.",
        duration: "50 min",
        path: "/eq-tracker",
      },
    ],
  },
  {
    title: "LEVEL 3: Lead Teams & Make Ethical Choices",
    description:
      "Mission: Solve problems, delegate roles, and lead with fairness.",
    challenges: [
      {
        title: "Ethical Logic Maze",
        description:
          "Objective: Navigate a group project dilemma using a decision tree, identify bias, and reflect on fairness.",
        duration: "50 min",
        path: "/ethical-logical-maze",
      },
      {
        title: "Team Architect Mission",
        description:
          "Objective: Assign teammates to roles using a talent grid and reflect on how your delegation impacted team success.",
        duration: "45 min",
        path: "/team-architect-mission",
      },
    ],
  },
  {
    title: "LEVEL 4: Drive Change with Integrity",
    description:
      "Mission: Build innovative solutions and lead with moral courage.",
    challenges: [
      {
        title: "Innovation Launchpad",
        description:
          "Objective: Choose a real school problem, design a solution, and simulate pitching your plan with metrics.",
        duration: "50 min",
        path: "/innovation-launchpad",
      },
      {
        title: "Bias Detective",
        description:
          "Objective: Spot bias in leadership stories, rewrite actions through a fairness lens, and reflect on inclusive leadership.",
        duration: "50 min",
        path: "/bias-detective",
      },
    ],
  },
];

const modulesfor11to12 = [
  {
    title: "LEVEL 1: Identity & Impact",
    description:
      "Mission: Understand your leadership style and express it through personal branding.",
    challenges: [
      {
        title: "Brand You Simulator",
        description:
          "Objective: Take a leadership archetype quiz, draft your mission statement, and create a mock LinkedIn bio or personal webpage blurb.",
        duration: "50 min",
        path: "/BrandYouSimulator",
      },
      {
        title: "Strategic Dilemma Decoder",
        description:
          "Objective: Solve a real-life conflict using a decision-making grid, spot flawed arguments, and justify your choice ethically.",
        duration: "50 min",
        path: "/StrategicFrameworkGame",
      },
    ],
  },
  {
    title: "LEVEL 2: Communication & Self-Regulation",
    description:
      "Mission: Master tough conversations and lead with emotional strength.",
    challenges: [
      {
        title: "Communication Combat Zone",
        description:
          "Objective: Navigate three tough conversations by choosing your tone, words, and body language, and receive feedback on clarity and empathy.",
        duration: "50 min",
        path: "/CommunicationGame",
      },
      {
        title: "EQ Tracker Mission",
        description:
          "Objective: Track your moods, reflect on an emotional moment, and apply EQ strategies to strengthen resilience.",
        duration: "50 min",
        path: "/EQGame",
      },
    ],
  },
  {
    title: "LEVEL 3: Teamwork & Ethics",
    description:
      "Mission: Build high-performing teams and lead with fairness and logic.",
    challenges: [
      {
        title: "The Ethics Labyrinth",
        description:
          "Objective: Navigate a team conflict using a decision tree, confront bias alerts, and ethically evaluate your choices.",
        duration: "50 min",
        path: "/EthicsLabyrinth",
      },
      {
        title: "Team Architect Simulation",
        description:
          "Objective: Assign virtual teammates to tasks based on strengths and monitor how delegation affects team performance.",
        duration: "50 min",
        path: "/TeamLeadershipGame",
      },
    ],
  },
  {
    title: "LEVEL 4: Inclusive Innovation",
    description:
      "Mission: Solve real problems with inclusive leadership and innovative thinking.",
    challenges: [
      {
        title: "Bias Detective: Ethics Edition",
        description:
          "Objective: Spot hidden bias in real cases and propose fair, inclusive leadership solutions.",
        duration: "50 min",
        path: "/BiasDetectiveGame",
      },
      {
        title: "Innovation Launchpad",
        description:
          "Objective: Pick a real school issue and go from problem to prototype to pitch using the Innovation Cycle.",
        duration: "50 min",
        path: "/InnovationLaunchpad-Game",
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
