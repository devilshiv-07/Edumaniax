import React, { useState, useEffect } from 'react';

// --- Data for the items, making the code cleaner ---
const items = [
    { id: 1, name: "Solar Panel", price: "₹350", image: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/QBE1UCXTVW.png", icon: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/HCi3Qu79Ro.png" },
    { id: 2, name: "Plastic Dustbin", price: "₹150", image: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/7K3HnRS1SW.png", icon: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/6hkKS8qzd3.png" },
    { id: 3, name: "Poster Printouts", price: "₹150", image: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/uYOeyhaVdV.png", icon: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/sJaFWFFKN6.png" },
    { id: 4, name: "Packaged Water", price: "₹210", image: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/rscnAQ1mKy.png", icon: "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-08-07/OmSLheBXZe.png" }
];
const scenarioDescription = "Your school wants to reduce its environment footprint. Pick 3 items.";

// --- A smaller, reusable component for each item ---
const BudgetItem = ({ item, isHighlighted }) => {
    // Determine styles based on the isHighlighted prop
    const containerClasses = isHighlighted ? 'bg-[#202f36] border-[#5f8428]' : 'bg-[#131f24] border-[#37464f]';
    const priceClasses = isHighlighted ? 'border-[#79b933]' : 'border-[#37464f]';
    const textClasses = isHighlighted ? 'text-[#79b933]' : 'text-[#f1f7fb]';

    return (
        <div className={`flex items-center gap-3 p-2 rounded-lg border shadow-md transition-colors duration-300 ${containerClasses}`}>
            {/* Price */}
            <div className={`flex items-center gap-1.5 p-1 rounded border min-w-max ${priceClasses}`}>
                <img src={item.icon} alt="" className="w-5 h-5" />
                <span className="font-['Lilita_One'] text-sm text-white whitespace-nowrap ">{item.price}</span>
            </div>
            {/* Name */}
            {/* MODIFIED: Removed overflow/truncation classes to allow text to wrap */}
            <span className={`flex-1 font-['Inter'] font-medium text-sm md:text-base md:-ml-1 text-center  ${textClasses}`}>
                {item.name}
            </span>
            {/* Image */}
            <img src={item.image} alt={item.name} className="w-5 h-5 object-contain md:mr-11" />
        </div>
    );
};


const ScenarioContent = () => {
    // --- Animation Logic to cycle the highlight ---
    const [highlightedIndex, setHighlightedIndex] = useState(0);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setHighlightedIndex(prevIndex => (prevIndex + 1) % items.length);
        }, 1500); // Change highlight every 1.5 seconds
        return () => clearInterval(intervalId);
    }, []);

    return (
        // Main responsive container. Stacks vertically on mobile.
        <div className="w-full h-auto bg-[#00260d] rounded-lg border border-[#f2f4f6] flex flex-col md:flex-row p-4 gap-4">
            
            {/* Left Panel: Item List */}
            <div className="w-full md:w-1/2 bg-[rgba(32,47,54,0.3)] rounded-lg p-3 flex flex-col gap-3 justify-center">
                {items.map((item, index) => (
                    <BudgetItem 
                        key={item.id}
                        item={item}
                        isHighlighted={index === highlightedIndex}
                    />
                ))}
            </div>

            {/* Right Panel: Description */}
            <div className="w-full md:w-1.2 bg-[rgba(32,47,54,0.3)] rounded-lg p-4 flex items-center justify-center min-h-[150px]">
                <p className="font-['Inter'] text-center text-gray-200 text-base lg:text-lg font-medium leading-relaxed">
                    {scenarioDescription}
                </p>
            </div>
        </div>
    );
};

export default ScenarioContent;