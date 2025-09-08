import React, { useState, useEffect } from 'react';

// --- Data for the Demo ---
const scenario = {
    original: "Hey I won’t come. Tell ma’am.",
    context: "You’re going to be absent from class tomorrow. Ask a friend to inform the teacher and be polite."
};

const animationText = {
    subject: "Absence from Class Tomorrow",
    greeting: "Hey [Friend's Name],",
    body: "Hope you're doing well. I won't be able to make it to class tomorrow. Could you please let ma'am know for me? Thanks!",
    closing: "Appreciate your help!"
};

// --- Reusable Input Field Component ---
const InputField = ({ label, icon, placeholder, value, isFocused, isTextarea = false }) => {
    const commonClasses = `mt-1 w-full p-1.5 rounded-lg border-2 border-gray-600 bg-gray-800 text-white shadow-inner focus:outline-none transition-all duration-300 text-sm`;
    const focusClasses = `ring-2 ring-yellow-400 border-yellow-400`;

    return (
        <label className="text-sm font-semibold text-cyan-300">
            {icon} {label}
            {isTextarea ? (
                <textarea
                    rows={3} // Reduced from 4
                    placeholder={placeholder}
                    value={value}
                    readOnly
                    className={`${commonClasses} ${isFocused ? focusClasses : ''}`}
                />
            ) : (
                <input
                    placeholder={placeholder}
                    value={value}
                    readOnly
                    className={`${commonClasses} ${isFocused ? focusClasses : ''}`}
                />
            )}
        </label>
    );
};

// --- Main Scenario Content Component ---
const ScenarioContent = () => {
    const [responses, setResponses] = useState({ subject: "", greeting: "", body: "", closing: "" });
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        let timeouts = [];

        const startAnimationCycle = () => {
            // 1. Reset all state
            timeouts.forEach(clearTimeout);
            setResponses({ subject: "", greeting: "", body: "", closing: "" });
            setFocusedField(null);

            // 2. Sequence the "focus and fill" animation
            timeouts.push(setTimeout(() => setFocusedField('subject'), 1000));
            timeouts.push(setTimeout(() => setResponses(prev => ({ ...prev, subject: animationText.subject })), 2000));
            
            timeouts.push(setTimeout(() => setFocusedField('greeting'), 2500));
            timeouts.push(setTimeout(() => setResponses(prev => ({ ...prev, greeting: animationText.greeting })), 3500));
            
            timeouts.push(setTimeout(() => setFocusedField('body'), 4000));
            timeouts.push(setTimeout(() => setResponses(prev => ({ ...prev, body: animationText.body })), 5000));
            
            timeouts.push(setTimeout(() => setFocusedField('closing'), 5500));
            timeouts.push(setTimeout(() => setResponses(prev => ({ ...prev, closing: animationText.closing })), 6500));
        };

        startAnimationCycle();
        const mainLoop = setInterval(startAnimationCycle, 8500); // Loop every 8.5 seconds

        return () => {
            clearInterval(mainLoop);
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="w-full h-full bg-[#0A160E] flex flex-col items-center justify-center p-4 font-['Inter'] rounded-lg">
            {/* Reduced padding (p-4) and gap (gap-3) */}
            <div className="w-full max-w-2xl bg-gray-900/50 border-2 border-[#3F4B48] rounded-xl p-4 grid gap-3">
                <p className="text-sm text-gray-200 -mt-2">
                    <span className="font-semibold">Original Message:</span> 
                    <span className="font-semibold text-red-500 text-base ml-1">“{scenario.original}”</span>
                </p>
                <p className="text-sm text-purple-400 -mt-2">
                    <span className="font-medium">Context:</span> {scenario.context}
                </p>

                <InputField
                    label="Subject Line"
                    icon="✉️"
                    placeholder="Enter a clear subject"
                    value={responses.subject}
                    isFocused={focusedField === 'subject'}
                />
                <InputField
                    label="Greeting"
                    icon="👋"
                    placeholder="Enter a polite greeting"
                    value={responses.greeting}
                    isFocused={focusedField === 'greeting'}
                />
                <InputField
                    label="Message Body"
                    icon="📩"
                    placeholder="Write your message here..."
                    value={responses.body}
                    isFocused={focusedField === 'body'}
                    isTextarea={true}
                />
                <InputField
                    label="Polite Closing"
                    icon="🙏"
                    placeholder="Enter a kind closing"
                    value={responses.closing}
                    isFocused={focusedField === 'closing'}
                />
            </div>
        </div>
    );
};

export default ScenarioContent;