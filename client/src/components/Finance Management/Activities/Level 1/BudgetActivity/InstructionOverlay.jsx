import React, { useState, useEffect } from "react";
import CancelIcon from "/financeGames6to8/button-cancel.svg";

const InstructionOverlay = ({ onClose }) => {
  const checkboxLabels = [
    "Rent",
    "Groceries",
    "Save 20% of income",
    "No impulse buys",
  ];

  const [checkedStates, setCheckedStates] = useState(
    Array(checkboxLabels.length).fill(false)
  );

  useEffect(() => {
    let index = 0;
    let ticking = true; // true = ticking on, false = ticking off

    const interval = setInterval(() => {
      setCheckedStates((prev) => {
        const newState = [...prev];
        newState[index] = ticking;
        return newState;
      });

      if (ticking) {
        index++;
        if (index === checkboxLabels.length) {
          ticking = false;
          index = checkboxLabels.length - 1;
        }
      } else {
        index--;
        if (index < 0) {
          ticking = true;
          index = 0;
        }
      }
    }, 500); // speed in ms

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center md:overflow-hidden overflow-y-auto">
      <div className="relative bg-[#0e341d] shadow-xl w-[95%] md:w-[1000px] text-white border border-gray-700 max-h-[90vh] overflow-y-auto md:overflow-visible p-4 sm:p-6">
        {/* Cancel button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 md:top-[-20px] md:right-[-20px] w-[50px] h-[35px] sm:w-[70px] sm:h-[50px] md:w-[103px] md:h-[68px] rounded-full shadow-md hover:scale-110 transition-transform z-50"
        >
          <img
            src={CancelIcon}
            alt="Close"
            className="w-full h-full object-contain"
          />
        </button>

        {/* Top nav */}
        <div className="flex justify-center items-center bg-[#28343A] px-5 py-3 border-b border-gray-700">
          <h2 className="text-xl sm:text-2xl md:text-3xl lilita-one-regular font-bold text-white">
            How to Play?
          </h2>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-6 gap-6">
          {/* Left side game UI */}
          <div className="w-full lg:-ml-6 max-w-5xl mx-auto border border-[#F3F4F6] rounded-xl p-6 bg-[#202F364D] order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-center text-white lilita-one-regular drop-shadow-sm">
              💰 Monthly Budget Activity
            </h2>

            {/* Expenses Section */}
            <div className="mb-6">
              <p className="font-semibold mb-2 text-white lilita-one-regular text-lg">
                🛍️ Select Expenses:
              </p>
              {checkboxLabels.slice(0, 2).map((label, idx) => (
                <div className="mb-3" key={label}>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      className="mr-3 h-5 w-5 text-white"
                      checked={checkedStates[idx]}
                      readOnly
                    />
                    <span className="text-base text-white lilita-one-regular font-medium">
                      {label}
                    </span>
                  </label>
                </div>
              ))}
            </div>

            {/* Saving Strategies Section */}
            <div className="mb-6">
              <p className="font-semibold mb-2 text-white lilita-one-regular text-lg">
                💡 Select Saving Strategies:
              </p>
              {checkboxLabels.slice(2).map((label, idx) => (
                <label className="block mb-2" key={label}>
                  <input
                    type="checkbox"
                    className="mr-3 h-5 w-5 text-white"
                    checked={checkedStates[idx + 2]}
                    readOnly
                  />
                  <span className="text-base text-white lilita-one-regular font-medium">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Right Side Instructions */}
          <div className="flex flex-col lg:w-1/2 gap-4 order-1 lg:order-2">
            <div className="text-gray-200 lilita-one-regular leading-snug text-xs sm:text-sm lg:text-base text-left">
              <p>
                Create a <span className="font-bold">one-month budget</span> for
                yourself using the income you get from allowance or part-time
                work.
              </p>
              <ul className="list-disc list-inside mt-1">
                <li>List your total monthly income (₹)</li>
                <li>Write down all expected expenses</li>
                <li>
                  Include{" "}
                  <span className="text-outline">3 saving strategies</span>
                </li>
              </ul>
              <p className="mt-2 text-white">
                Your budget will be reviewed — complete it successfully to earn
                the
                <span className="italic"> “Budget Boss” </span> badge!
              </p>
            </div>

            {/* Learning Outcome */}
            <div className="bg-[#FCB813] lilita-one-regular text-white font-semibold p-2 sm:p-3 rounded-lg shadow-md text-xs sm:text-sm text-left leading-snug mt-0 lg:mt-8 max-w-md">
              <div className="uppercase text-outline text-sm sm:text-base mb-1">
                Learning Outcome:
              </div>
              <div className="text-outline">
                Build real-life money skills by balancing income, expenses, and
                savings to achieve financial stability.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructionOverlay;
