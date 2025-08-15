import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

// Demo data - no changes here
const demoQuestion = {
    id: 5,
    title: "Snow Cover Loop",
    flowSteps: [
        { text: "Global Warming", icon: "🌡️" },
        { text: "Less Snow Cover", icon: "❄️" },
        { text: "Reduced Reflection", icon: "☀️" },
        { text: "Missing Link", icon: "❓" }
    ],
    correctAnswer: "More heat absorption",
    linkCards: [
        "More heat absorption",
        "Increased snow formation",
        "Better light reflection",
        "Cooler surface temperatures"
    ],
    feedbackType: "Positive",
    explanation: "POSITIVE feedback loop! Dark surfaces absorb more heat than white snow, accelerating warming even more!"
};

// CSS to hide scrollbars
const scrollbarHideStyle = `
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const ScenarioContent = () => {
    // State and animation logic - no changes here
    const [view, setView] = useState('question');
    const [selectedCard, setSelectedCard] = useState(null);

    useEffect(() => {
        let selectTimer, resultTimer, resetTimer;

        const animationCycle = () => {
            selectTimer = setTimeout(() => {
                setSelectedCard(demoQuestion.correctAnswer);
            }, 1500);
            resultTimer = setTimeout(() => {
                setView('result');
            }, 2500);
            resetTimer = setTimeout(() => {
                setView('question');
                setSelectedCard(null);
            }, 5500);
        };
        animationCycle();
        const loop = setInterval(animationCycle, 6000);
        return () => {
            clearTimeout(selectTimer);
            clearTimeout(resultTimer);
            clearTimeout(resetTimer);
            clearInterval(loop);
        };
    }, []);

    const cardStyle = "bg-[#131F24] border border-[#37464F] rounded-xl shadow-[0_0.2vh_0_0_#37464F]";
    const selectedCardStyle = "bg-green-500/20 border border-green-500 text-white rounded-xl shadow-[0_0.2vh_0_0_rgba(21,128,61,0.8)]";

    return (
        <div className="w-full h-full bg-green-950/50 rounded-lg flex flex-col items-center justify-center p-[2vh] font-['Inter'] text-white overflow-hidden">
            <style>{scrollbarHideStyle}</style>
            
            <div className="w-full max-w-4xl relative md:max-h-[60vh] md:overflow-y-auto no-scrollbar">
                {/* Question View */}
                <div className={`transition-opacity duration-500 ${view === 'question' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full flex flex-col items-center gap-[4vh] md:gap-[2.5vh] lg:gap-[3.5vh]">
                        {/* Flow Steps */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
                            {demoQuestion.flowSteps.map((step, index) => (
                                <React.Fragment key={index}>
                                    {/* // CHANGED FOR LG: Made cards a tad smaller on lg screens (15vh -> 14vh) */}
                                    <div className={`flex flex-col gap-2 items-center justify-center text-center p-3 w-[14vh] h-[14vh] sm:w-[15vh] sm:h-[15vh] md:w-[12vh] md:h-[12vh] lg:w-[14vh] lg:h-[14vh] ${cardStyle}`}>
                                        {/* // CHANGED FOR LG: Adjusted icon and text size for the new lg card size */}
                                        <div className="text-[4vh] md:text-[3.5vh] lg:text-[3.8vh]">{step.icon}</div>
                                        <span className="font-medium text-[1.6vh] sm:text-[1.8vh] md:text-[1.5vh] lg:text-[1.7vh]">{step.text}</span>
                                    </div>
                                    {index < demoQuestion.flowSteps.length - 1 && <ArrowRight size={"5vh"} className="text-gray-400 hidden sm:block" />}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Options Section */}
                        <div>
                            <h3 className="font-medium text-[2vh] text-center text-gray-300 mb-[2vh]">Choose the missing link</h3>
                            <div className="w-full max-w-sm md:max-w-xl bg-[rgba(32,47,54,0.30)] rounded-xl py-[2.5vh] px-4 sm:px-6 border border-gray-700 backdrop-blur-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {demoQuestion.linkCards.map((card) => (
                                        <div
                                            key={card}
                                            className={`text-center py-[1.5vh] md:py-[1.2vh] lg:py-[1.5vh] px-5 transition-all duration-300 font-medium text-[1.6vh] sm:text-[1.8vh] md:text-[1.5vh] lg:text-[1.7vh] ${selectedCard === card ? selectedCardStyle : cardStyle}`}
                                        >
                                            {card}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Result View */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${view === 'result' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-full max-w-lg md:max-w-2xl bg-[rgba(32,47,54,0.5)] rounded-xl p-[3vh] sm:p-[4vh] text-center flex flex-col items-center justify-center border border-gray-700 backdrop-blur-md">
                        <h2 className="font-bold text-[4vh] sm:text-[5vh] text-lime-400 capitalize mb-[2vh]">
                            {demoQuestion.feedbackType} feedback
                        </h2>
                        <p className="text-[1.8vh] sm:text-[2vh] text-gray-200 leading-relaxed">
                            {demoQuestion.explanation}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScenarioContent;