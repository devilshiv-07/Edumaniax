import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Data for the dropdowns ---
const causes = ["Mental Health Week", "Plastic-Free Campaign", "Canteen Upgrade"];
const hooks = ["Start with a Quote", "Tell a Short Story", "Ask a Question"];


// --- Custom Dropdown Component ---
const CustomSelect = ({ label, options, value, placeholder, isOpen }) => (
    <div className="w-full">
        <label className="block font-semibold text-gray-200 text-sm mb-2">{label}</label>
        <div className="relative">
            <div className="w-full p-3 h-12 flex items-center justify-between rounded-xl border border-cyan-700 bg-gray-900 text-white shadow-inner">
                <span>{value || placeholder}</span>
                <span className={`text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </div>
            
            <motion.div
                initial={false}
                animate={{ maxHeight: isOpen ? '200px' : '0px' }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
            >
                <div className="mt-1 bg-gray-900 border-x border-b border-cyan-700">
                    {options.map((option, index) => (
                        <div key={index} className={`p-3 text-gray-200 cursor-pointer hover:bg-cyan-800/50 ${option === value ? 'bg-cyan-700' : ''}`}>
                            {option}
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    </div>
);


// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    const [cause, setCause] = useState("");
    const [hook, setHook] = useState("");
    const [isCauseOpen, setIsCauseOpen] = useState(false);
    const [isHookOpen, setIsHookOpen] = useState(false);

    useEffect(() => {
        let timeouts = [];

        const startAnimationCycle = () => {
            timeouts.forEach(clearTimeout);
            setCause("");
            setHook("");
            setIsCauseOpen(false);
            setIsHookOpen(false);

            timeouts.push(setTimeout(() => setIsCauseOpen(true), 1000));
            timeouts.push(setTimeout(() => {
                setCause(causes[0]);
                setIsCauseOpen(false);
            }, 2000));

            timeouts.push(setTimeout(() => setIsHookOpen(true), 3000));
            timeouts.push(setTimeout(() => {
                setHook(hooks[0]);
                setIsHookOpen(false);
            }, 4000));
        };

        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 6000);

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            {/* Added min-h-[26rem] to create a fixed, stable height for the container */}
            <div className="w-full max-w-lg space-y-6 p-6 bg-gray-800/30 border-2 border-[#3F4B48] rounded-xl min-h-[27rem]">
                <h2 className="text-xl font-bold text-center text-cyan-300">Step 1: The Foundation</h2>
                
                <CustomSelect
                    label="🌟 Choose a Cause"
                    options={causes}
                    value={cause}
                    placeholder="Select..."
                    isOpen={isCauseOpen}
                />
                
                <CustomSelect
                    label="🎯 Choose a Hook (How will you start?)"
                    options={hooks}
                    value={hook}
                    placeholder="Choose..."
                    isOpen={isHookOpen}
                />
            </div>
        </div>
    );
};

export default ScenarioContent;