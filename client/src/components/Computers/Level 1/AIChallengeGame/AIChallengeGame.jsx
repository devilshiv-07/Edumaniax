import React, { useState, useEffect } from "react";
import RoomSelector from "./RoomSelector";
import DeviceList from "./DeviceList";
import Zone from "./Zone";
import Badge from "./Badge";
import toast from "react-hot-toast";
import ReflectionQuestions from "./ReflectionQuestions";
import { useComputers } from "@/contexts/ComputersContext";
import { usePerformance } from "@/contexts/PerformanceContext"; //for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import InstructionOverlay from "./InstructionOverlay";

const allDevices = [
  // Home (AI)
  {
    id: 1,
    name: "Smartphone",
    place: "Home",
    smartHow: "Voice assistant, facial recognition",
    level: 3,
  },
  {
    id: 2,
    name: "Smart TV",
    place: "Home",
    smartHow: "Recommends shows and adapts to preferences",
    level: 2,
  },
  {
    id: 3,
    name: "Refrigerator",
    place: "Home",
    smartHow: "Suggests recipes and tracks groceries",
    level: 2,
  },
  {
    id: 4,
    name: "Smart Speaker",
    place: "Home",
    smartHow: "Answers questions, controls home devices",
    level: 3,
  },
  {
    id: 5,
    name: "Thermostat",
    place: "Home",
    smartHow: "Learns preferred temperatures",
    level: 2,
  },

  // School (AI)
  {
    id: 6,
    name: "Spell Checker",
    place: "School",
    smartHow: "Corrects grammar using NLP",
    level: 1,
  },
  {
    id: 7,
    name: "Smart Board",
    place: "School",
    smartHow: "Adapts teaching with input",
    level: 2,
  },
  {
    id: 8,
    name: "Learning App",
    place: "School",
    smartHow: "Personalizes quizzes with AI",
    level: 3,
  },
  {
    id: 9,
    name: "Exam Scanner",
    place: "School",
    smartHow: "Reads handwritten answers",
    level: 2,
  },

  // Playground (AI)
  {
    id: 10,
    name: "Online Game",
    place: "Playground",
    smartHow: "Uses AI NPCs and adaptive difficulty",
    level: 2,
  },
  {
    id: 11,
    name: "Fitness Tracker",
    place: "Playground",
    smartHow: "Monitors activity and gives tips",
    level: 2,
  },
  {
    id: 12,
    name: "Smart Drone",
    place: "Playground",
    smartHow: "Avoids obstacles and tracks targets",
    level: 3,
  },

  // Non-AI devices
  { id: 13, name: "Notebook", place: "School", smartHow: "—", level: 0 },
  {
    id: 14,
    name: "Plastic Water Bottle",
    place: "Playground",
    smartHow: "—",
    level: 0,
  },
  { id: 15, name: "Table Fan", place: "Home", smartHow: "—", level: 0 },
  { id: 16, name: "Whiteboard", place: "School", smartHow: "—", level: 0 },
  { id: 17, name: "Jump Rope", place: "Playground", smartHow: "—", level: 0 },
];

export default function AIChallengeGame() {
  const { completeComputersChallenge } = useComputers();
  const [room, setRoom] = useState("Home");
  const [chartItems, setChartItems] = useState([]);
  const [showBadge, setShowBadge] = useState(false);

  //for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  const handleDrop = (deviceId) => {
    const device = allDevices.find((d) => d.id === parseInt(deviceId));
    if (!device) return;

    if (device.level === 0) {
      toast.error(` ${device.name} doesn't use AI. Try a smart device!`, {
        style: {
          background: "#ffebee",
          color: "#c62828",
          fontWeight: "bold",
        },
        icon: "❌",
      });
      return;
    }

    if (!chartItems.find((item) => item.id === device.id)) {
      setChartItems([...chartItems, device]);
    }
  };

  useEffect(() => {
    if (chartItems.length === 5) {
      setShowBadge(true);
      completeComputersChallenge(0, 0);

      const endTime = Date.now();
      const totalSeconds = Math.round((endTime - startTime) / 1000);

      updatePerformance({
        moduleName: "Computers",
        topicName: "introductionToAI",
        score: 10,
        accuracy: 100,
        avgResponseTimeSec: totalSeconds / 5,
        studyTimeMinutes: Math.ceil(totalSeconds / 60),
        completed: true,
      });
      setStartTime(Date.now());
      setTimeout(() => setShowBadge(false), 4000);
    }
  }, [chartItems]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const currentDevices = allDevices.filter((d) => d.place === room);

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E]">
        <div className="p-4 pt-20 md:pt-50 pb-28 max-w-6xl mx-auto bg-[#202F364D] text-gray-800 min-h-screen rounded-2xl shadow-inner border border-white">
          {showBadge && <Badge />}

          <div className="bg-white lilita-one-regular rounded-xl shadow-md p-4 mb-6 border-2 border-dashed border-pink-300">
            <p className="text-lg font-medium text-center text-blue-700">
              🚪 Choose a Room → 🎁 Explore Devices → 🤖 Drag Smart Ones to the
              Chart!
            </p>
          </div>

          <RoomSelector selected={room} onSelect={setRoom} />

          <div className="space-y-8 mt-4">
            <DeviceList devices={currentDevices} />
            <Zone chartItems={chartItems} onDropDevice={handleDrop} />
            <ReflectionQuestions />
          </div>
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
}
