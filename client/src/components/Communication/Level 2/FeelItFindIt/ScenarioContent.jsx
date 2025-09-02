import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Custom Hook to get screen breakpoint ---
const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState('lg');
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setBreakpoint('sm');
            else if (window.innerWidth < 1024) setBreakpoint('md');
            else setBreakpoint('lg');
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Set initial breakpoint
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return breakpoint;
};


// Demo data for the self-playing animation
const demoEmotions = [
    { id: 1, face: "😄", emotion: "Happy" },
    { id: 2, face: "😠", emotion: "Angry" },
    { id: 4, face: "😳", emotion: "Embarrassed" },
    { id: 5, face: "😱", emotion: "Scared" },
];

// Helper to shuffle the emotions array for variety
const shuffleArray = (array) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
};

const ScenarioContent = () => {
    const [remainingFaces, setRemainingFaces] = useState(demoEmotions);
    const [remainingEmotions, setRemainingEmotions] = useState(shuffleArray([...demoEmotions]));
    const [matches, setMatches] = useState([]);
    const [selectedFace, setSelectedFace] = useState(null);
    const [selectedEmotion, setSelectedEmotion] = useState(null);

    const breakpoint = useBreakpoint();
    const isSmallScreen = breakpoint === 'sm' || breakpoint === 'md';

    useEffect(() => {
        let timer;
        let matchIndex = 0;

        const resetAnimation = () => {
            setMatches([]);
            setRemainingFaces(demoEmotions);
            setRemainingEmotions(shuffleArray([...demoEmotions]));
            setSelectedFace(null);
            setSelectedEmotion(null);
            matchIndex = 0;
        };

        const runAnimationStep = () => {
            if (matchIndex >= demoEmotions.length) {
                // After all matches are done, wait a bit then reset
                timer = setTimeout(resetAnimation, 2000);
                return;
            }

            const currentEmotionToMatch = demoEmotions[matchIndex];
            
            // 1. Select Face
            timer = setTimeout(() => setSelectedFace(currentEmotionToMatch), 500);
            
            // 2. Select Emotion
            timer = setTimeout(() => setSelectedEmotion(currentEmotionToMatch), 1500);
            
            // 3. Make the match
            timer = setTimeout(() => {
                setMatches(prev => [...prev, currentEmotionToMatch]);
                setRemainingFaces(prev => prev.filter(f => f.id !== currentEmotionToMatch.id));
                setRemainingEmotions(prev => prev.filter(e => e.id !== currentEmotionToMatch.id));
                setSelectedFace(null);
                setSelectedEmotion(null);
                matchIndex++;
            }, 2500);
        };

        // This interval triggers the next match sequence
        const loop = setInterval(runAnimationStep, 3000);

        return () => clearInterval(loop);
    }, []);

    return (
        <div className="w-full h-full bg-[#00260e] rounded-lg flex flex-col items-center justify-center p-4 md:p-6 space-y-3">
            
            {/* Faces Section */}
            <div className="w-full bg-gray-800/30 rounded-lg p-3 min-h-[70px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 h-full">
                    <AnimatePresence>
                        {remainingFaces.map(face => (
                            <motion.div 
                                key={`face-${face.id}`} 
                                layout={!isSmallScreen}
                                initial={{opacity: 0, scale: 0.5}} 
                                animate={{opacity: 1, scale: 1}} 
                                exit={{opacity: 0, scale: 0.5}}
                                className={`bg-gray-900 rounded-md flex flex-col justify-center items-center gap-1 py-1 transition-all duration-200 ${selectedFace?.id === face.id ? 'outline outline-2 outline-yellow-400 scale-105' : ''}`}>
                                <span className="text-xl md:text-2xl">{face.face}</span>
                                <span className="text-[10px] md:text-xs font-bold text-slate-100">Face {face.id}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Emotions Section */}
            <div className="w-full bg-gray-800/30 rounded-lg p-3 min-h-[45px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 h-full">
                    <AnimatePresence>
                        {remainingEmotions.map(emotion => (
                             <motion.div 
                                key={`emo-${emotion.id}`} 
                                layout={!isSmallScreen}
                                initial={{opacity: 0, scale: 0.5}} 
                                animate={{opacity: 1, scale: 1}} 
                                exit={{opacity: 0, scale: 0.5}}
                                className={`bg-gray-900 rounded-md flex justify-center items-center py-2 transition-all duration-200 ${selectedEmotion?.id === emotion.id ? 'outline outline-2 outline-yellow-400 scale-105' : ''}`}>
                                <span className="text-xs md:text-sm font-bold text-slate-100">{emotion.emotion}</span>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Your Matches Section */}
            <div className="w-full bg-gray-800/30 rounded-lg p-3 flex-grow flex items-center justify-center min-h-[50px]">
                {matches.length === 0 ? (
                    <div className="text-white text-base font-normal">Your Matches</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                         <AnimatePresence>
                            {matches.map((match) => (
                                <motion.div 
                                    key={`match-${match.id}`} 
                                    layout={!isSmallScreen}
                                    initial={{opacity: 0, y: 20}} 
                                    animate={{opacity: 1, y: 0}}
                                    className="bg-gray-900 rounded-md flex justify-center items-center p-2">
                                    <div className="flex items-center justify-center gap-1 text-slate-100 text-xs font-semibold">
                                        <span className="text-lg md:text-xl">{match.face}</span>
                                        <span>⟶</span>
                                        <span className="text-xs">{match.emotion}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScenarioContent;