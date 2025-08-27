import React, { useState, useEffect, useRef } from 'react';
import { Ear, Eye, Phone, MessageCircle, Volume2, Heart, CheckCircle, Lightbulb, Users, Target } from 'lucide-react';

const Mod1 = ({ topicRefs }) => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [activeExample, setActiveExample] = useState(0);
  const [currentToneExample, setCurrentToneExample] = useState(0);
  const sectionRefs = useRef({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCards([0, 1, 2, 3, 4, 5]);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentToneExample((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toneExamples = [
    {
      text: "Oh really?",
      tone: "Happy",
      meaning: "excited",
      color: "from-green-400 to-emerald-500",
      icon: "😊"
    },
    {
      text: "Oh really?",
      tone: "Angry", 
      meaning: "annoyed",
      color: "from-green-600 to-emerald-700",
      icon: "😤"
    },
    {
      text: "Oh really?",
      tone: "Sarcastic",
      meaning: "pretending to care but not actually",
      color: "from-emerald-500 to-green-600",
      icon: "🙄"
    }
  ];

  const listeningTips = [
    { icon: <Eye className="w-6 h-6" />, tip: "Make eye contact", description: "Show you're focused on them" },
    { icon: <Phone className="w-6 h-6" />, tip: "Put away distractions", description: "No phones or other devices" },
    { icon: <MessageCircle className="w-6 h-6" />, tip: "Nod or respond", description: "Show you're following along" },
    { icon: <Target className="w-6 h-6" />, tip: "Ask questions", description: "If something is confusing" }
  ];

  return (
    <div
      id="1"
      ref={(el) => {
        if (topicRefs?.current) {
          topicRefs.current["1"] = el;
        }
      }}
      className="mb-10"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 animate-bounce">
                <Ear className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Listen to Understand
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Good communication begins not with talking, but with listening 👂
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        
        {/* Opening Question */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center">
            <div className="text-6xl mb-6">🤔</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Have you ever felt like someone wasn't really listening?
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Maybe they were nodding but staring at their phone? Today we'll learn how to become better listeners!
            </p>
          </div>
        </div>

        {/* Active Listening Definition */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3">
                <Ear className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                What is Active Listening?
              </h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-l-4 border-green-400">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong className="text-green-600">Active listening</strong> means giving full attention to the speaker—not just hearing the words, but also noticing the feelings behind them.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Heart className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-800">It's about understanding:</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>What someone means</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Even if they don't say it directly</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 transform hover:scale-105 transition-all duration-500">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Active Listening</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-center space-x-3 bg-green-50 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">Full attention</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-emerald-50 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-gray-700">Notice feelings</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-teal-50 rounded-lg p-3">
                    <CheckCircle className="w-5 h-5 text-teal-500" />
                    <span className="text-gray-700">Understand meaning</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Real Example
            </h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border-l-4 border-red-400">
                <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center space-x-2">
                  <span>😔</span>
                  <span>What Your Friend Says</span>
                </h3>
                <p className="text-red-700 text-lg italic">
                  "It's okay, I guess I'll go alone to the fair."
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-400">
                <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center space-x-2">
                  <span>👂</span>
                  <span>Active Listening Response</span>
                </h3>
                <p className="text-green-700 text-lg italic mb-3">
                  "Do you really want me to come with you?"
                </p>
                <div className="bg-white/60 rounded-lg p-3">
                  <p className="text-sm text-gray-600">
                    ✨ You heard the disappointment in their voice!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tone of Voice Section */}
        <div className="space-y-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-full p-3">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Why Does Tone of Voice Matter?
              </h2>
            </div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              The <strong className="text-green-600">tone</strong> is how something is said, not just what is said.
            </p>
          </div>

          {/* Interactive Tone Examples */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Same Words, Different Meanings</h3>
              <p className="text-gray-600">Watch how the tone changes the meaning automatically:</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className={`bg-gradient-to-r ${toneExamples[currentToneExample].color} text-white rounded-2xl p-8 transform transition-all duration-1000 hover:scale-105`}>
                <div className="text-center">
                  <div className="text-4xl mb-4">{toneExamples[currentToneExample].icon}</div>
                  <div className="text-3xl font-bold mb-4">"{toneExamples[currentToneExample].text}"</div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-lg font-semibold">{toneExamples[currentToneExample].tone} tone = {toneExamples[currentToneExample].meaning}</p>
                  </div>
                </div>
              </div>
              
              {/* Tone Indicators */}
              <div className="flex justify-center space-x-3 mt-6">
                {toneExamples.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentToneExample === index ? 'bg-green-500 scale-125' : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* How to Listen Better */}
        <div className="space-y-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3">
                <Lightbulb className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                How Can We Listen Better?
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listeningTips.map((tip, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-400 transform hover:scale-105 transition-all duration-300 ${
                  visibleCards.includes(index) ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white">
                    {tip.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{tip.tip}</h3>
                  <p className="text-gray-600 text-sm">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Try This Challenge */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white rounded-3xl p-8 md:p-12">
          <div className="text-center">
            <div className="text-4xl mb-6">🧠</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              Try This Challenge!
            </h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
              <p className="text-xl leading-relaxed">
                Listen to your friend today <strong>without interrupting</strong>. Then repeat back what they said in your own words.
              </p>
            </div>
            <div className="mt-6">
              <div className="bg-white/10 rounded-lg p-4 inline-block">
                <p className="text-green-200 text-sm">💡 This helps show you were really listening!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center">
            <div className="text-4xl mb-6">🎯</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Remember This
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              Good communication starts with <strong className="text-green-600">active listening</strong>. 
              When you truly listen, you understand not just the words, but the feelings behind them.
            </p>
          </div>
        </div>

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Mod1;