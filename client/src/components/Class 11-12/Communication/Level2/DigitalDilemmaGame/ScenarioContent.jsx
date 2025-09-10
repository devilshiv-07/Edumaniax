import React, { useState, useEffect } from 'react';

const decisionTreeSteps = [
    {
        id: 'q1',
        question: "What do you do first?",
        options: ["Forward it to a friend", "Message the student privately", "Report it in the class group"],
        correct: 1, 
    },
    {
        id: 'q2',
        question: "How do you begin the conversation?",
        options: ["“That meme’s really messed up.”", "“Hey, I wanted to check in about the meme you posted…”", "“You’re going to get into trouble.”"],
        correct: 1,
    },
    {
        id: 'q3',
        question: "What’s your closing line?",
        options: ["“Let’s remove the post and avoid hurting anyone.”", "“You should apologize or I’ll tell the teacher.”", "“Just delete it. It’s embarrassing.”"],
        correct: 0,
    },
];

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    const [selections, setSelections] = useState({});

    useEffect(() => {
        let timeouts = [];
        
        const startAnimationCycle = () => {
            timeouts.forEach(clearTimeout);
            setSelections({});

            // 2. Sequence the selections with delays
            timeouts.push(setTimeout(() => {
                setSelections(prev => ({ ...prev, [decisionTreeSteps[0].id]: decisionTreeSteps[0].correct }));
            }, 1000));

            timeouts.push(setTimeout(() => {
                setSelections(prev => ({ ...prev, [decisionTreeSteps[1].id]: decisionTreeSteps[1].correct }));
            }, 2000));

            timeouts.push(setTimeout(() => {
                setSelections(prev => ({ ...prev, [decisionTreeSteps[2].id]: decisionTreeSteps[2].correct }));
            }, 3000));
        };

        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 5000); 

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 inter-font rounded-lg">
            <div className="w-full max-w-4xl flex flex-col gap-2 p-3 bg-gray-800/50 border border-gray-700 rounded-xl">
                
                <div className="p-2 bg-gray-900 rounded-lg border border-cyan-500/30">
                    <h2 className="text-base font-bold text-yellow-300">The Scenario</h2>
                    <p className="text-xs text-gray-300">
                        A classmate posted a sarcastic meme targeting a teacher on your school group. It’s going viral. Choose how to handle this respectfully.
                    </p>
                </div>

                {decisionTreeSteps.map((step) => (
                    <div key={step.id} className="p-2 bg-gray-900 rounded-lg">
                        <h3 className="font-semibold text-cyan-400 mb-2 text-sm">{step.question}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {step.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    className={`p-1.5 rounded-md text-xs text-center transition-all border-2 ${
                                        selections[step.id] === idx 
                                        ? 'bg-yellow-400 border-yellow-300 text-black font-bold' 
                                        : 'bg-[#2a3b42] border-cyan-700/50 text-white'
                                    }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ScenarioContent;