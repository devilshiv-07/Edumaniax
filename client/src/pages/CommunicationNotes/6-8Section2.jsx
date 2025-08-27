import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageSquare, Users, Eye, Clock, Lightbulb, Shield, Target, CheckCircle, ArrowRight } from 'lucide-react';

const Mod2 = ({ topicRefs }) => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [currentEmotion, setCurrentEmotion] = useState(0);
  const [interactionStep, setInteractionStep] = useState(0);
  const sectionRefs = useRef({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCards([0, 1, 2, 3, 4, 5, 6]);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmotion((prev) => (prev + 1) % 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const emotions = [
    { emoji: "😢", emotion: "Sad", signs: "Looking down, not talking", color: "from-blue-400 to-blue-500" },
    { emoji: "😠", emotion: "Angry", signs: "Crossed arms, loud voice", color: "from-red-400 to-red-500" },
    { emoji: "😊", emotion: "Happy", signs: "Smiling, energetic", color: "from-yellow-400 to-yellow-500" },
    { emoji: "😰", emotion: "Worried", signs: "Fidgeting, quiet voice", color: "from-purple-400 to-purple-500" },
    { emoji: "😴", emotion: "Tired", signs: "Yawning, slow movements", color: "from-gray-400 to-gray-500" }
  ];

  const nvcSteps = [
    {
      step: "Observe",
      description: "What happened?",
      example: "When you took my pen without asking",
      icon: <Eye className="w-6 h-6" />,
      color: "from-green-400 to-emerald-500"
    },
    {
      step: "Feel",
      description: "How do you feel?",
      example: "I feel upset",
      icon: <Heart className="w-6 h-6" />,
      color: "from-emerald-400 to-green-500"
    },
    {
      step: "Need",
      description: "What do you need?",
      example: "I need respect for my things",
      icon: <Shield className="w-6 h-6" />,
      color: "from-teal-400 to-green-500"
    },
    {
      step: "Request",
      description: "What's your request?",
      example: "Can we take turns?",
      icon: <MessageSquare className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600"
    }
  ];

  return (
    <div
      id="2"
      ref={(el) => {
        if (topicRefs?.current) {
          topicRefs.current["2"] = el;
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
                <Heart className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Feelings Explorer
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Learn to talk about feelings calmly and solve problems without fights 🤝
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        
        {/* Introduction */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center">
            <div className="text-6xl mb-6">🎭</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Emotions are a Big Part of Communication
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Sometimes we get upset, or someone misunderstands us. Learning to talk about feelings calmly helps solve problems without fights.
            </p>
          </div>
        </div>

        {/* Non-Violent Communication */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                What is Non-Violent Communication?
              </h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-l-4 border-green-400">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong className="text-green-600">Non-violent communication (NVC)</strong> is a way of speaking that avoids blame or shouting. It helps express how you feel and what you need—without hurting others.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-800">NVC helps you:</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Express feelings without blame</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Share what you need clearly</span>
                </li>
                <li className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                  <span>Avoid hurting others</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-red-100 to-red-200 rounded-lg p-4 mb-4 border-l-4 border-red-400">
                  <h3 className="text-red-800 font-bold mb-2">❌ Instead of yelling:</h3>
                  <p className="text-red-700 italic">"Give that back!"</p>
                </div>
                <ArrowRight className="w-8 h-8 text-green-600 mx-auto mb-4 animate-bounce" />
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border-l-4 border-green-400">
                  <h3 className="text-green-800 font-bold mb-2">✅ Try NVC:</h3>
                  <p className="text-green-700 italic">"I feel upset when you take my pen without asking. Can we take turns?"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NVC Steps Breakdown */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              The 4 Steps of NVC
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Follow these simple steps to communicate your feelings effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nvcSteps.map((step, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${step.color} text-white rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 ${
                  visibleCards.includes(index) ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-center">
                  <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="text-2xl font-bold mb-2">{index + 1}. {step.step}</div>
                  <p className="text-sm opacity-90 mb-4">{step.description}</p>
                  <div className="bg-white/20 rounded-lg p-3">
                    <p className="text-sm font-medium">{step.example}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Turn-Taking Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-6">Turn-Taking in Action</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-gray-700 font-medium">Friend shares story</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">You listen without interrupting</span>
                    </div>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-4 border-l-4 border-teal-400">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <span className="text-gray-700 font-medium">Then you respond</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-full p-3">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                Why is Turn-Taking Important?
              </h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-l-4 border-green-400">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                <strong className="text-green-600">Turn-taking</strong> means waiting for your chance to speak and not interrupting.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                It shows respect and helps everyone feel heard.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-gray-800">Example:</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                If a friend is sharing a story, don't jump in with your own. Let them finish, then respond.
              </p>
            </div>
          </div>
        </div>

        {/* Emotion Recognition Section */}
        <div className="space-y-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                What is Emotion Recognition?
              </h2>
            </div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
              <strong className="text-green-600">Emotion recognition</strong> is noticing how someone feels based on their words, facial expressions, or body language.
            </p>
          </div>

          {/* Interactive Emotion Examples */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Recognizing Emotions</h3>
              <p className="text-gray-600">Watch the automatic emotion examples:</p>
            </div>
            
            <div className="max-w-2xl mx-auto">
              <div className={`bg-gradient-to-r ${emotions[currentEmotion].color} text-white rounded-2xl p-8 transform transition-all duration-1000 hover:scale-105`}>
                <div className="text-center">
                  <div className="text-6xl mb-4">{emotions[currentEmotion].emoji}</div>
                  <div className="text-2xl font-bold mb-4">{emotions[currentEmotion].emotion}</div>
                  <div className="bg-white/20 rounded-lg p-4">
                    <p className="text-lg">Signs: {emotions[currentEmotion].signs}</p>
                  </div>
                </div>
              </div>
              
              {/* Emotion Indicators */}
              <div className="flex justify-center space-x-3 mt-6">
                {emotions.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-300 cursor-pointer ${
                      currentEmotion === index ? 'bg-green-500 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setCurrentEmotion(index)}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Real-world Example */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">👀</div>
                <h3 className="text-2xl font-bold text-gray-800">Real Example</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span>📚</span>
                    <span>What You Notice</span>
                  </h4>
                  <p className="text-gray-700 mb-4">
                    A classmate looks down and isn't talking
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-l-4 border-blue-400">
                    <p className="text-blue-800 font-medium">They might be sad 😢</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center space-x-2">
                    <span>💬</span>
                    <span>How You Can Help</span>
                  </h4>
                  <p className="text-gray-700 mb-4">
                    You could ask:
                  </p>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg p-4 border-l-4 border-green-400">
                    <p className="text-green-700 font-medium italic">"Is everything okay?"</p>
                  </div>
                </div>
              </div>
            </div>
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
                When you talk to someone today, pay attention to their <strong>face and tone</strong>. What emotion do you think they're feeling?
              </p>
            </div>
            <div className="mt-6">
              <div className="bg-white/10 rounded-lg p-4 inline-block">
                <p className="text-green-200 text-sm">💡 Notice their body language too!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <MessageSquare className="w-8 h-8" />,
              title: "NVC Method",
              description: "Use Non-Violent Communication to express feelings without blame",
              color: "from-green-400 to-emerald-500"
            },
            {
              icon: <Clock className="w-8 h-8" />,
              title: "Turn-Taking",
              description: "Wait for your turn and don't interrupt others",
              color: "from-emerald-400 to-green-500"
            },
            {
              icon: <Eye className="w-8 h-8" />,
              title: "Emotion Recognition",
              description: "Notice how others feel through their words and body language",
              color: "from-teal-400 to-green-500"
            }
          ].map((takeaway, index) => (
            <div
              key={index}
              className={`bg-gradient-to-r ${takeaway.color} text-white rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 ${
                visibleCards.includes(index + 4) ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${(index + 4) * 200}ms` }}
            >
              <div className="text-center">
                <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  {takeaway.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{takeaway.title}</h3>
                <p className="text-white/90">{takeaway.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Final Message */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center">
            <div className="text-4xl mb-6">🌟</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Remember This
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium">
              When you understand and express <strong className="text-green-600">feelings calmly</strong>, you can solve problems without fights and build stronger relationships! 🤝
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

export default Mod2;