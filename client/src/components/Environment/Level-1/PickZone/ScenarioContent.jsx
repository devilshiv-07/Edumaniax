import React, { useState, useEffect } from 'react';

// Data for the "Pick The Zone" game
const options = [
    { name: "Lithosphere", iconUrl: "https://www.svgrepo.com/show/448839/rock.svg" },
    { name: "Atmosphere", iconUrl: "https://www.svgrepo.com/show/443315/atmosphere.svg" },
    { name: "Hydrosphere", iconUrl: "https://www.svgrepo.com/show/450379/hydrosphere.svg" },
    { name: "Biosphere", iconUrl: "https://www.svgrepo.com/show/442751/biosphere.svg" },
];

// Sample description from the Pick The Zone game
const scenarioDescription = "The layer that includes soil, rocks, and land where we build houses and grow food.";


const ScenarioContent = () => {
    const [animatedSelection, setAnimatedSelection] = useState(null);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setAnimatedSelection(prevSelection =>
                prevSelection === options[0].name ? null : options[0].name
            );
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="w-full h-full p-4 bg-green-950/50 rounded-lg flex items-center justify-center">
            <div className="w-full max-w-2xl flex flex-col md:flex-row gap-4">
                
                {/* Left Panel: Options */}
                <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-xl p-4 space-y-3">
                    {options.map((opt) => {
                        const isSelected = animatedSelection === opt.name;
                        const ringColor = isSelected ? 'ring-green-500' : 'ring-gray-600';

                        return (
                            <div
                                key={opt.name}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all bg-[#131f24] ring-2 ${ringColor} shadow-[0_2px_0_0_#000]`}
                            >
                                <div className={`w-6 h-6 rounded-md border-2 ${isSelected ? 'bg-green-600 border-green-400' : 'border-gray-500'} flex items-center justify-center`}>
                                    {isSelected && <span className="text-white text-base">✓</span>}
                                </div>
                                <span className="flex-1 text-base font-medium text-white">{opt.name}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Right Panel: Description */}
                <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-xl p-5 flex items-center justify-center min-h-[260px]">
                    <p className="text-base text-center font-medium leading-relaxed text-gray-200">
                        {scenarioDescription}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;