export default function DeviceList({ devices }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
      {devices.map((device) => {
        const isAI = device.level > 0;

        return (
          <div
            key={device.id}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", device.id)}
            className={`p-4 rounded-xl lilita-one-regular cursor-grab shadow-lg border-4 transform transition-all duration-300 ease-in-out hover:scale-105
              ${
                isAI
                  ? "bg-green-200 border-green-500 text-green-900"
                  : "bg-gray-300 border-gray-400 text-gray-600 opacity-80"
              }
            `}
            title={
              isAI ? "Smart AI-powered device 🧠" : "This one doesn't use AI 🚫"
            }
          >
            <div className="flex items-center text-lg font-bold mb-1 space-x-2">
              {!isAI && <span title="Not AI">⚠️</span>}
              <span>{isAI ? "🧠" : "📦"}</span>
              <span>{device.name}</span>
            </div>

            <div className="text-sm italic mt-1">
              {device.smartHow !== "—" ? device.smartHow : "No AI features"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
