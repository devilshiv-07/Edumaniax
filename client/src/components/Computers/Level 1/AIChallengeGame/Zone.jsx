import React from "react";
import { Sparkles, Brain, Bot } from "lucide-react"; // Optional icons if using lucide-react

export default function Zone({ chartItems, onDropDevice }) {
  const handleDrop = (e) => {
    e.preventDefault();
    const deviceId = e.dataTransfer.getData("text/plain");
    onDropDevice(deviceId);
  };

  const getAiLevelIcon = (level) => {
    if (level === 3) return "🧠🧠🧠";
    if (level === 2) return "🧠🧠";
    if (level === 1) return "🧠";
    return "❌";
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-4 border-dashed border-white p-6 rounded-2xl min-h-[280px] bg-[#202F364D] transition-all duration-500 shadow-lg"
    >
      <h2 className=" text-2xl text-white lilita-one-regular mb-4 flex items-center gap-2 animate-pulse">
        📋 AI Discovery Chart <Sparkles className="w-6 h-6 text-yellow-500" />
      </h2>

      {chartItems.length === 0 ? (
        <p className="text-white lilita-one-regular text-center italic">
          👆 Drag AI devices here to begin your smart adventure!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full lilita-one-regular text-left border border-yellow-400 bg-white rounded-xl overflow-hidden">
            <thead className="bg-yellow-200 text-pink-700 text-md font-bold">
              <tr>
                <th className="p-3 border border-yellow-300">📍 Device</th>
                <th className="p-3 border border-yellow-300">
                  ⚙️ What It Does
                </th>
                <th className="p-3 border border-yellow-300">
                  🤖 Is It Smart? How?
                </th>
                <th className="p-3 border border-yellow-300">⭐ AI Level</th>
              </tr>
            </thead>
            <tbody className="text-gray-800 text-sm">
              {chartItems.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-yellow-100 transition-colors duration-300"
                >
                  <td className="p-3 border border-yellow-200 font-semibold">
                    {item.name}
                  </td>
                  <td className="p-3 border border-yellow-200">
                    {item.smartHow !== "—" ? item.smartHow : "Not applicable"}
                  </td>
                  <td className="p-3 border border-yellow-200">
                    {item.level > 0 ? `✅ Yes – ${item.smartHow}` : "❌ No"}
                  </td>
                  <td className="p-3 border border-yellow-200 text-lg">
                    {getAiLevelIcon(item.level)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
