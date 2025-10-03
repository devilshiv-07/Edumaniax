import React from "react";

const roomEmojis = {
  Home: "🏠",
  School: "🏫",
  Playground: "🎮",
};

const rooms = ["Home", "School", "Playground"];

export default function RoomSelector({ selected, onSelect }) {
  return (
    <div className="flex justify-center gap-4 mb-6">
      {rooms.map((room) => {
        const isActive = selected === room;

        return (
          <button
            key={room}
            onClick={() => onSelect(room)}
            className={`px-5 py-3 rounded-lg border border-white lilita-one-regular text-white transition-all duration-300 transform hover:scale-105 shadow-lg
              ${
                isActive
                  ? "bg-yellow-400 text-yellow-900 ring-4 ring-yellow-300"
                  : "bg-[#2c5c724d] hover:bg-[#6f8b974d]"
              }
            `}
          >
            {roomEmojis[room]} {room}
          </button>
        );
      })}
    </div>
  );
}
