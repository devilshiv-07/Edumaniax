import React, { useState, useEffect } from 'react';
import { MessageSquare, Volume2, Heart, Users, Lightbulb, CheckCircle, Target, Star, ArrowRight, Mic, ThumbsUp, Shield } from 'lucide-react';

const Mod3 = ({ topicRefs }) => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [currentExample, setCurrentExample] = useState(0);
  const [selectedCompliment, setSelectedCompliment] = useState('');
  const [showComplimentResult, setShowComplimentResult] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCards([0, 1, 2, 3, 4, 5, 6]);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentExample((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const communicationTypes = [
    {
      title: "Persuasion",
      description: "Change someone's opinion with reasons, not force",
      icon: <Target className="w-8 h-8" />,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      example: "I believe more sports time will help students stay fit and focus better in class."
    },
    {
      title: "Assertiveness", 
      description: "Stand up for yourself calmly and clearly",
      icon: <Shield className="w-8 h-8" />,
      color: "from-emerald-500 to-green-600",
      bgColor: "from-emerald-50 to-green-50",
      example: "I feel frustrated when I'm not heard. I'd like to share my idea too."
    },
    {
      title: "Positive Communication",
      description: "Use kind, encouraging words to build relationships", 
      icon: <Heart className="w-8 h-8" />,
      color: "from-green-600 to-emerald-600",
      bgColor: "from-green-50 to-emerald-50",
      example: "I appreciate it when you're on time—it helps us stay organized."
    }
  ];

  const complimentOptions = [
    "Thank you for helping me with homework. It really helped because I understood the concept better.",
    "Thank you for listening when I was upset. It really helped because I felt supported.",
    "Thank you for sharing your lunch with me. It really helped because I forgot mine today."
  ];

  const handleComplimentSelect = (compliment) => {
    setSelectedCompliment(compliment);
    setShowComplimentResult(true);
    setTimeout(() => setShowComplimentResult(false), 3000);
  };

  return (
    <div
      id="3"
      ref={(el) => {
        if (topicRefs?.current) {
          topicRefs.current["3"] = el;
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
                <MessageSquare className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Speak with Purpose
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Master the art of communication through persuasion, assertiveness, and positivity
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        
        {/* Power of Words Introduction */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">💬</div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Words Have Power
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              They can hurt or heal, confuse or clarify. Learning how to speak clearly and kindly helps you connect better with others.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-l-4 border-red-400">
              <h3 className="text-lg font-bold text-red-600 mb-4 flex items-center">
                <Volume2 className="w-6 h-6 mr-2" />
                Words Can Hurt
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Create misunderstandings</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Damage relationships</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>Lower confidence</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-400">
              <h3 className="text-lg font-bold text-green-600 mb-4 flex items-center">
                <Heart className="w-6 h-6 mr-2" />
                Words Can Heal
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Build strong connections</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Inspire and motivate</li>
                <li className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>Create positive change</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Three Types of Communication */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Three Ways to Communicate Effectively
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {communicationTypes.map((type, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${type.bgColor} rounded-3xl p-8 border border-gray-100 shadow-lg transform hover:scale-105 transition-all duration-500 ${
                  visibleCards.includes(index) ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className={`bg-gradient-to-r ${type.color} text-white rounded-full w-16 h-16 flex items-center justify-center mb-6`}>
                  {type.icon}
                </div>
                
                <h3 className="text-2xl font-bold text-gray-800 mb-4">{type.title}</h3>
                <p className="text-gray-700 mb-6 leading-relaxed">{type.description}</p>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <Lightbulb className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm font-semibold text-gray-600">Example:</span>
                  </div>
                  <p className="text-gray-700 italic">"{type.example}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Explanation - Persuasion */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                  What is Persuasion?
                </h2>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  <strong className="text-green-600">Persuasion</strong> is when you try to change someone's opinion or make them agree with your idea—<strong>without forcing them</strong>.
                </p>
                
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4">
                  <h4 className="font-bold text-gray-800 mb-2">The Key Elements:</h4>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" />Present clear reasons</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" />Show confidence</li>
                    <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-600 mr-2" />Respect their choice</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🏫</div>
                <h3 className="text-xl font-bold text-gray-800">Persuasion in Action</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-400">
                  <p className="text-red-700 font-medium mb-2">❌ Weak Approach:</p>
                  <p className="text-gray-700">"We need more sports time because I said so!"</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-green-600 mx-auto" />
                
                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                  <p className="text-green-700 font-medium mb-2">✅ Persuasive Approach:</p>
                  <p className="text-gray-700">"I believe more sports time will help students stay fit and focus better in class."</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Explanation - Assertiveness */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-bold text-gray-800">Assertiveness Balance</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-red-100 rounded-lg p-4 text-center border-l-4 border-red-400">
                  <p className="text-red-700 font-bold mb-1">Too Passive</p>
                  <p className="text-sm text-gray-600">Never speak up</p>
                </div>
                
                <div className="bg-green-100 rounded-lg p-4 text-center border-l-4 border-green-400">
                  <p className="text-green-700 font-bold mb-1">Just Right</p>
                  <p className="text-sm text-gray-600">Calm and clear</p>
                </div>
                
                <div className="bg-red-100 rounded-lg p-4 text-center border-l-4 border-red-400">
                  <p className="text-red-700 font-bold mb-1">Too Aggressive</p>
                  <p className="text-sm text-gray-600">Shouting or bossy</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-full p-3">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                  What is Assertiveness?
                </h2>
              </div>
              
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border-l-4 border-emerald-400">
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  <strong className="text-emerald-600">Assertiveness</strong> means standing up for yourself calmly and clearly. It's <strong>not</strong> shouting or being bossy—it's explaining your needs with respect.
                </p>
                
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                    <Users className="w-5 h-5 text-emerald-600 mr-2" />
                    Group Project Example:
                  </h4>
                  <p className="text-gray-700 italic mb-2">
                    "I feel frustrated when I'm not heard. I'd like to share my idea too."
                  </p>
                  <p className="text-sm text-emerald-600 font-medium">This shows respect while standing up for yourself!</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Positive Communication Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              The Power of Positive Communication
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Using kind, encouraging words to build strong relationships
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-red-50 rounded-2xl p-8 border-l-4 border-red-400">
              <h3 className="text-2xl font-bold text-red-600 mb-6 flex items-center">
                <span className="text-3xl mr-3">❌</span>
                Negative Approach
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-700 text-lg italic mb-4">"You're always late!"</p>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-2">This approach:</p>
                  <ul className="space-y-1">
                    <li>• Sounds accusatory</li>
                    <li>• Makes people defensive</li>
                    <li>• Doesn't explain why it matters</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-8 border-l-4 border-green-400">
              <h3 className="text-2xl font-bold text-green-600 mb-6 flex items-center">
                <span className="text-3xl mr-3">✅</span>
                Positive Approach
              </h3>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <p className="text-gray-700 text-lg italic mb-4">"I appreciate it when you're on time—it helps us stay organized."</p>
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-2">This approach:</p>
                  <ul className="space-y-1">
                    <li>• Shows appreciation</li>
                    <li>• Explains the benefit</li>
                    <li>• Encourages good behavior</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Compliment Activity */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🧠</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Try This: Practice Giving Compliments
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Give someone a compliment using this structure:
            </p>
            <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
              <p className="text-lg font-bold text-green-600">
                "Thank you for [what they did]. It really helped because [how it made you feel]."
              </p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
              Choose a compliment to practice:
            </h3>
            
            <div className="grid md:grid-cols-1 gap-4">
              {complimentOptions.map((compliment, index) => (
                <button
                  key={index}
                  onClick={() => handleComplimentSelect(compliment)}
                  className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all duration-300 hover:shadow-lg hover:scale-102 text-left ${
                    selectedCompliment === compliment ? 'border-green-400 bg-green-50' : 'border-gray-200 hover:border-green-300'
                  }`}
                >
                  <p className="text-gray-700">{compliment}</p>
                </button>
              ))}
            </div>

            {showComplimentResult && (
              <div className="mt-6 bg-green-100 border border-green-400 rounded-xl p-6 text-center animate-fade-in">
                <div className="flex items-center justify-center mb-4">
                  <ThumbsUp className="w-8 h-8 text-green-600 mr-2" />
                  <span className="text-xl font-bold text-green-700">Great Choice!</span>
                </div>
                <p className="text-green-700">
                  This compliment follows the perfect structure - it's specific, shows appreciation, and explains the impact. Well done! 🌟
                </p>
              </div>
            )}
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
              Master these three communication skills to connect better with others and express yourself clearly.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Target className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Persuasion</h3>
                <p className="text-sm text-gray-600">Convince with reasons, not force</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Shield className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Assertiveness</h3>
                <p className="text-sm text-gray-600">Stand up for yourself calmly</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Heart className="w-8 h-8 text-green-700 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 mb-2">Positivity</h3>
                <p className="text-sm text-gray-600">Use kind, encouraging words</p>
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

export default Mod3;