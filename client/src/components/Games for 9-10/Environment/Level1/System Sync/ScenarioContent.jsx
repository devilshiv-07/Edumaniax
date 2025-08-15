import React, { useState, useEffect } from 'react';
import { Globe, Droplets, Wind, TreePine } from 'lucide-react';

// Demo data taken directly from your CauseEffectGame component for consistency.
// The selected answers in the animation will be incorrect to match the video's "System Shock!" result.
const demoQuestion = {
    id: 1,
    cause: "Urbanization",
    causeIcon: "/environmentGameInfo/Cause&Effect/urbanization.png", // Make sure this path is correct in your project
    correctEffect: "Soil sealing with concrete",
    correctSphere: "Geosphere",
    effects: ["Soil sealing with concrete", "Increased plant growth", "More rainfall", "Ocean warming"],
    spheres: ["Hydrosphere", "Atmosphere", "Biosphere", "Geosphere"],
    systemShock: "Without proper planning, cities can become heat islands and flood zones, disrupting natural water cycles!"
};

// This matches the icon mapping in your game
const sphereIcons = {
    Hydrosphere: <Droplets className="w-full h-full" />,
    Atmosphere: <Wind className="w-full h-full" />,
    Biosphere: <TreePine className="w-full h-full" />,
    Geosphere: <Globe className="w-full h-full" />
};

const ScenarioContent = () => {
    // State to manage the animation sequence
    const [view, setView] = useState('question');
    const [selectedEffect, setSelectedEffect] = useState(null);
    const [selectedSphere, setSelectedSphere] = useState(null);

    // This useEffect hook creates the animation loop
    useEffect(() => {
        let selectEffectTimer, selectSphereTimer, resultTimer, resetTimer;

        const animationCycle = () => {
            selectEffectTimer = setTimeout(() => {
                setSelectedEffect("More rainfall");
            }, 1000);

            selectSphereTimer = setTimeout(() => {
                setSelectedSphere("Hydrosphere");
            }, 2500);

            resultTimer = setTimeout(() => {
                setView('result');
            }, 4000);

            resetTimer = setTimeout(() => {
                setView('question');
                setSelectedEffect(null);
                setSelectedSphere(null);
            }, 7000);
        };

        animationCycle();
        const loop = setInterval(animationCycle, 7500);

        return () => {
            clearTimeout(selectEffectTimer);
            clearTimeout(selectSphereTimer);
            clearTimeout(resultTimer);
            clearTimeout(resetTimer);
            clearInterval(loop);
        };
    }, []);

    return (
        <div className="w-full h-full bg-green-950/50 rounded-lg flex flex-col items-center justify-center p-4 sm:px-6 sm:py-4 font-['Inter'] text-white overflow-hidden">
            <div className="w-full max-w-2xl relative">
                {/* Question View */}
                <div className={`transition-opacity duration-500 ${view === 'question' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full flex flex-col items-center gap-6">
                        <div className="w-full max-w-full bg-[rgba(32,47,54,0.3)] rounded-xl p-4 sm:p-6 border border-gray-700 backdrop-blur-sm">
                            <h3 className="font-medium text-base sm:text-lg md:text-sm lg:text-base text-gray-300 mb-4">Choose the effect</h3>
                            {/* MODIFIED: Effects grid is now 1 column on mobile/sm, 2 on md+ */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {demoQuestion.effects.map((effect) => (
                                    // MODIFIED: Text size increased on sm screens
                                    <div key={effect} className={`text-center p-3 md:p-2 lg:p-2 rounded-lg border transition-all duration-200 shadow-md font-medium text-sm sm:text-base md:text-xs lg:text-xs ${selectedEffect === effect ? 'bg-green-500/20 border-green-500 text-white' : 'bg-[#131F24] border-[#37464F]'}`}>{effect}</div>
                                ))}
                            </div>
                            <h3 className="font-medium text-base sm:text-lg md:text-sm lg:text-base text-gray-300 mt-6 mb-4">Which earth system is affected?</h3>
                             {/* MODIFIED: Spheres grid is now 2 columns on mobile/sm, 4 on md+ */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-2 lg:gap-4">
                                {demoQuestion.spheres.map((sphere) => (
                                    <div key={sphere} className={`p-3 md:p-2 lg:p-2 rounded-lg border transition-all duration-200 shadow-md flex flex-col items-center gap-2 ${selectedSphere === sphere ? 'bg-green-500/20 border-green-500 text-white' : 'bg-[#131F24] border-[#37464F]'}`}>
                                        <div className="w-6 h-6 md:w-5 md:h-5 lg:w-5 lg:h-5">{sphereIcons[sphere]}</div>
                                        {/* MODIFIED: Text size increased on sm and is no longer hidden on md */}
                                        <span className="font-medium text-sm sm:text-sm md:hidden lg:block">{sphere}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result View */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${view === 'result' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full max-w-full bg-[rgba(32,47,54,0.3)] rounded-xl p-6 sm:p-10 border border-gray-700 text-center flex flex-col items-center justify-center min-h-[250px] backdrop-blur-sm">
                        <h2 className="text-4xl sm:text-5xl md:text-3xl lg:text-4xl text-red-400 mb-6 font-bold" style={{ fontFamily: 'serif' }}>System Shock!</h2>
                        <p className="text-base sm:text-xl md:text-sm lg:text-lg text-gray-200 leading-relaxed font-medium">{demoQuestion.systemShock}</p>
                    </div>
                </div>
            </div>

            {/* Cause Element at the bottom */}
            <div className="flex items-center gap-2 sm:gap-4 mt-4">
                 {/* MODIFIED: Image size increased on sm screens */}
                <img src={demoQuestion.causeIcon} alt={demoQuestion.cause} className="w-20 h-20 sm:w-28 sm:h-28 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain" />
                <div className="relative">
                    {/* Speech bubble pointer */}
                    <div className="absolute top-1/2 -translate-y-1/2 -left-[13px] transform z-10">
                        <div className="relative inline-block">
                            <div className="absolute -top-0.5 right-0 w-0 h-0 border-t-[12px] border-t-transparent border-r-[18px] border-r-[#37464F] border-b-0 border-l-0"></div>
                            <div className="relative w-0 h-0 border-t-[10px] border-t-transparent border-r-[15px] border-r-[#131F24] border-b-0 border-l-0"></div>
                        </div>
                    </div>
                    <div className="relative bg-[#131F24] border border-[#37464F] rounded-lg px-4 sm:px-6 py-3">
                        {/* MODIFIED: Text size increased on sm screens */}
                        <span className="text-lg sm:text-2xl md:text-base lg:text-lg font-bold text-gray-200">{demoQuestion.cause}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;