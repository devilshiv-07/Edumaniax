import React, { useState, useEffect } from 'react';
import { Users, Handshake, Heart, RefreshCw, MessageCircle, CheckCircle, AlertTriangle, ArrowRight, Zap, Scale, Lightbulb, Star } from 'lucide-react';

const Mod4 = ({ topicRefs }) => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [selectedWordSwap, setSelectedWordSwap] = useState('');
  const [showSwapResult, setShowSwapResult] = useState(false);
  const [compromiseStep, setCompromiseStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCards([0, 1, 2, 3, 4, 5, 6]);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScenario((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const conflictScenarios = [
    {
      title: "Window Seat Conflict",
      problem: "Both friends want the same window seat on a trip",
      solution: "How about I take it now, and you sit there on the way back?",
      type: "Sharing Time",
      icon: "🚌"
    },
    {
      title: "Game Choice Conflict", 
      problem: "You want cricket, friend wants football",
      solution: "Let's play cricket today and football tomorrow",
      type: "Taking Turns",
      icon: "⚽"
    },
    {
      title: "Group Work Conflict",
      problem: "Different ideas about project direction",
      solution: "Let's combine both ideas - use your research method with my presentation style",
      type: "Combining Ideas",
      icon: "📚"
    }
  ];

  const wordSwaps = [
    {
      bad: "You never listen!",
      good: "I feel unheard sometimes.",
      explanation: "Uses 'I' statements instead of accusations"
    },
    {
      bad: "You're so annoying!",
      good: "I'm feeling frustrated right now.",
      explanation: "Focuses on your feelings, not attacking the person"
    },
    {
      bad: "That's stupid!",
      good: "I see it differently.",
      explanation: "Respects their opinion while sharing yours"
    },
    {
      bad: "You always mess up!",
      good: "Let's figure out how to fix this together.",
      explanation: "Focuses on solutions instead of blame"
    }
  ];

  const compromiseSteps = [
    {
      title: "Listen First",
      description: "Understand what the other person wants",
      icon: <MessageCircle className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Share Your View",
      description: "Explain what you want calmly",
      icon: <Users className="w-8 h-8" />,
      color: "from-emerald-500 to-green-600"
    },
    {
      title: "Find Middle Ground",
      description: "Look for solutions that work for both",
      icon: <Scale className="w-8 h-8" />,
      color: "from-green-600 to-emerald-600"
    },
    {
      title: "Agree Together",
      description: "Make sure both people are happy with the solution",
      icon: <Handshake className="w-8 h-8" />,
      color: "from-emerald-600 to-green-700"
    }
  ];

  const handleWordSwapSelect = (swap) => {
    setSelectedWordSwap(swap);
    setShowSwapResult(true);
    setTimeout(() => setShowSwapResult(false), 4000);
  };

  return (
    <div
      id="4"
      ref={(el) => {
        if (topicRefs?.current) {
          topicRefs.current["4"] = el;
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
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 animate-pulse">
                <Handshake className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Fixing Conflicts the Smart Way
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Learn to solve disagreements peacefully so everyone feels understood and respected
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        
        {/* Conflicts Are Normal Introduction */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🤝</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Everyone Has Disagreements Sometimes
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              The key is to manage them calmly and respectfully so both people feel heard and valued.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Conflicts Happen</h3>
              <p className="text-gray-600">It's normal to disagree with friends, family, and classmates</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Stay Respectful</h3>
              <p className="text-gray-600">The goal is to solve problems while keeping relationships strong</p>
            </div>
            
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-700" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">Find Solutions</h3>
              <p className="text-gray-600">Work together to find answers that make everyone happy</p>
            </div>
          </div>
        </div>

        {/* What is Conflict Resolution? */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3">
                <RefreshCw className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                What is Conflict Resolution?
              </h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-l-4 border-green-400">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong className="text-green-600">Conflict resolution</strong> is solving disagreements peacefully, so that both people feel understood.
              </p>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 text-green-600 mr-2" />
                  Key Principles:
                </h4>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Listen to understand, not to argue</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Focus on the problem, not the person</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span>Look for win-win solutions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Rotating Conflict Scenarios */}
          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">{conflictScenarios[currentScenario].icon}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {conflictScenarios[currentScenario].title}
                </h3>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-l-4 border-red-400 mb-6">
                  <p className="text-gray-700"><strong>Problem:</strong> {conflictScenarios[currentScenario].problem}</p>
                </div>
                
                <ArrowRight className="w-8 h-8 text-green-600 mx-auto mb-4 animate-pulse" />
                
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-400">
                  <p className="text-gray-700 mb-2"><strong>Smart Solution:</strong></p>
                  <p className="text-green-700 italic">"{conflictScenarios[currentScenario].solution}"</p>
                </div>
                
                <div className="mt-4 inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm">
                  {conflictScenarios[currentScenario].type}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* What is Compromise? */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-3xl p-8 md:p-12 border-l-4 border-emerald-400">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-3">
                <Scale className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                What is Compromise?
              </h2>
            </div>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong className="text-emerald-600">Compromise</strong> means both sides give a little to reach a fair solution.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3">🏏 Cricket vs Football Example</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>You want:</strong> Cricket</p>
                    <p><strong>Friend wants:</strong> Football</p>
                    <p><strong>Compromise:</strong> Cricket today, Football tomorrow</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-3">🎯 The Result</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>✅ Both get what they want</li>
                    <li>✅ Nobody feels left out</li>
                    <li>✅ Friendship stays strong</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Steps to Compromise */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              4 Steps to Successful Compromise
            </h2>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {compromiseSteps.map((step, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-gray-100 shadow-lg transform hover:scale-105 transition-all duration-500 cursor-pointer ${
                  visibleCards.includes(index) ? 'animate-fade-in' : 'opacity-0'
                } ${
                  compromiseStep === index ? 'ring-4 ring-green-300 scale-105 bg-gradient-to-r from-green-100 to-emerald-100' : ''
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
                onClick={() => setCompromiseStep(index)}
              >
                <div className="text-center">
                  <div className={`bg-gradient-to-r ${step.color} text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
                    {step.icon}
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                    {index + 1}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-800 mb-3">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calm Word Swaps */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-12">
            <div className="text-4xl mb-4">💬</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Calm Word Swaps
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Change angry or rude words into more respectful ones
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {wordSwaps.map((swap, index) => (
              <button
                key={index}
                onClick={() => handleWordSwapSelect(swap)}
                className={`text-left bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg hover:scale-102 ${
                  selectedWordSwap.bad === swap.bad ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50' : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                    <p className="text-red-700 font-medium mb-1">❌ Instead of saying:</p>
                    <p className="text-gray-700 italic">"{swap.bad}"</p>
                  </div>
                  
                  <ArrowRight className="w-6 h-6 text-green-600 mx-auto" />
                  
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                    <p className="text-green-700 font-medium mb-1">✅ Try saying:</p>
                    <p className="text-gray-700 italic">"{swap.good}"</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {showSwapResult && selectedWordSwap && (
            <div className="mt-8 bg-green-100 border border-green-400 rounded-xl p-6 text-center animate-fade-in">
              <div className="flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-green-600 mr-2" />
                <span className="text-xl font-bold text-green-700">Excellent Choice!</span>
              </div>
              <p className="text-green-700 text-lg mb-2">
                {selectedWordSwap.explanation}
              </p>
              <p className="text-green-600 text-sm">
                This approach helps solve problems instead of creating bigger conflicts! 🌟
              </p>
            </div>
          )}
        </div>

        {/* Practice Activity */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Try This: The Deep Breath Technique
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-sm max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 mb-6">
                Next time you feel angry, try this simple technique:
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl">
                    1
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Take a Deep Breath</h4>
                  <p className="text-sm text-gray-600">Count to 5 slowly</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl">
                    2
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Think</h4>
                  <p className="text-sm text-gray-600">How would you want to be spoken to?</p>
                </div>
                
                <div className="text-center">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-xl">
                    3
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Choose Calm Words</h4>
                  <p className="text-sm text-gray-600">Use respectful language</p>
                </div>
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
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium mb-8">
              Conflicts are normal, but how you handle them makes all the difference.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Conflict Resolution</h3>
                <p className="text-sm text-gray-600">Solve problems peacefully</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Scale className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Compromise</h3>
                <p className="text-sm text-gray-600">Both sides give a little</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Heart className="w-8 h-8 text-green-700 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Calm Words</h3>
                <p className="text-sm text-gray-600">Choose respectful language</p>
              </div>
            </div>
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
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default Mod4;