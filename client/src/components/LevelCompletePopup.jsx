import React from "react";

function LevelCompletePopup({
  isOpen,
  onConfirm,
  onCancel,
  onClose,
  title,
  message,
  confirmText,
  cancelText,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1000]">
      <style>{`
        @keyframes scale-in-popup {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in-popup { animation: scale-in-popup 0.3s ease-out forwards; }
      `}</style>

      <div className="relative bg-[#131F24] border-2 border-[#FFCC00] rounded-2xl p-6 md:p-8 text-center shadow-2xl w-11/12 max-w-md mx-auto animate-scale-in-popup">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors p-2 rounded-full"
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>

        {/* Trophy Animation */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <img
            src="/financeGames6to8/trophy-rotating.gif"
            alt="Rotating Trophy"
            className="absolute w-full h-full object-contain"
          />
          <img
            src="/financeGames6to8/trophy-celebration.gif"
            alt="Celebration Effects"
            className="absolute w-full h-full object-contain"
          />
        </div>

        {/* Title + Message */}
        <h2 className="lilita-one-regular text-2xl md:text-3xl text-yellow-400 mb-3">
          {title}
        </h2>
        <p className="font-['Inter'] text-base md:text-lg text-white mb-8">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={onCancel}
            className="px-8 py-3 bg-red-600 text-lg text-white lilita-one-regular rounded-md hover:bg-red-700 transition-colors border-b-4 border-red-800 active:border-transparent shadow-lg"
          >
            {cancelText || "Exit"}
          </button>
          <button
            onClick={onConfirm}
            className="px-8 py-3 bg-green-600 text-lg text-white lilita-one-regular rounded-md hover:bg-green-700 transition-colors border-b-4 border-green-800 active:border-transparent shadow-lg"
          >
            {confirmText || "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default LevelCompletePopup;
