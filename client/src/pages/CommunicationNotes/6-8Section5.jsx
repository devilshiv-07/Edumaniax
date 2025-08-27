import React, { useState, useEffect } from 'react';
import { MessageSquare, Smartphone, Users, Heart, CheckCircle, AlertTriangle, Star, Lightbulb, Trophy, Target, ArrowRight, MessageCircle, Send, Smile, ThumbsUp } from 'lucide-react';

const Mod5 = ({ topicRefs }) => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [currentTip, setCurrentTip] = useState(0);
  const [selectedExample, setSelectedExample] = useState(0);
  const [userMessage, setUserMessage] = useState('');
  const [messageType, setMessageType] = useState('cold');

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCards([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const communicationTips = [
    {
      title: "Be Clear & Specific",
      description: "Say exactly what you mean",
      example: "Can you help me with math homework at 3 PM?",
      icon: <Target className="w-6 h-6" />
    },
    {
      title: "Show Your Tone",
      description: "Use emojis to express feelings",
      example: "Great job on your presentation! 👏",
      icon: <Smile className="w-6 h-6" />
    },
    {
      title: "Think Before You Send",
      description: "Read your message twice",
      example: "Does this sound friendly and respectful?",
      icon: <CheckCircle className="w-6 h-6" />
    },
    {
      title: "Be Respectful",
      description: "Treat others kindly online and offline",
      example: "I understand your point, but I think differently",
      icon: <Heart className="w-6 h-6" />
    }
  ];

  const starMethod = [
    {
      letter: "S",
      word: "Specific",
      description: "Be exact about what you're praising",
      example: "Your presentation slides were well-organized",
      color: "from-green-400 to-emerald-500"
    },
    {
      letter: "T", 
      word: "True",
      description: "Only say what you really mean",
      example: "I genuinely enjoyed your story",
      color: "from-emerald-400 to-green-600"
    },
    {
      letter: "A",
      word: "Appreciative",
      description: "Show that you value their effort",
      example: "I'm grateful for your help",
      color: "from-green-500 to-teal-500"
    },
    {
      letter: "R",
      word: "Related to Action",
      description: "Focus on what they did",
      example: "Thanks for helping with my science chart yesterday",
      color: "from-teal-400 to-green-500"
    }
  ];

  const messageExamples = [
    {
      type: "cold",
      message: "Why didn't you invite me??",
      tone: "Sounds angry and demanding",
      better: "Hey! I saw the party pics—looked fun. Wish I was there too 😊",
      explanation: "The improved version is friendly and shows interest without blame"
    },
    {
      type: "warm",
      message: "Okay.",
      tone: "Feels cold and dismissive",
      better: "Okay 😊",
      explanation: "A simple emoji makes the message feel much warmer"
    }
  ];

  const getMessagePreview = () => {
    if (messageType === 'cold') {
      return userMessage || "Your message will appear here...";
    } else {
      return (userMessage || "Your message will appear here...") + " 😊";
    }
  };

  return (
    <div
      id="5"
      ref={(el) => {
        if (topicRefs?.current) {
          topicRefs.current["5"] = el;
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
              Communicating Online & In Real Life
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Master the art of clear communication in both digital and face-to-face interactions
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-slate-50 to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 space-y-20">
        
        {/* Learning Objectives */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-3 mr-4">
              <Lightbulb className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
              What You Will Learn
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: <Smartphone className="w-6 h-6" />, text: "Digital communication skills", color: "bg-green-100 text-green-600" },
              { icon: <MessageCircle className="w-6 h-6" />, text: "How tone works in texting", color: "bg-emerald-100 text-emerald-600" },
              { icon: <Star className="w-6 h-6" />, text: "The STAR method for compliments", color: "bg-teal-100 text-teal-600" },
              { icon: <Users className="w-6 h-6" />, text: "Communicating respectfully online and offline", color: "bg-green-100 text-green-600" }
            ].map((objective, index) => (
              <div
                key={index}
                className={`${objective.color} rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 ${
                  visibleCards.includes(index) ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="flex items-center space-x-3">
                  {objective.icon}
                  <p className="font-semibold text-lg">{objective.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Digital Communication Explanation */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-full p-3">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                What is Digital Communication?
              </h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-l-4 border-green-400">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                <strong className="text-green-600">Digital communication</strong> includes messages you send by text, email, or online chats. 
                Because people can't see your face or hear your voice, it's easy for messages to sound rude—even if you didn't mean them that way.
              </p>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                  <h3 className="text-lg font-bold text-gray-800">Remember:</h3>
                </div>
                <p className="text-gray-600">
                  Your words matter whether you're texting a friend or speaking to a teacher. Both online and offline communication need care.
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">📱</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Digital vs Face-to-Face</h3>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-l-4 border-red-400">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-gray-700 font-medium">No facial expressions</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-4 border-l-4 border-red-400">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <p className="text-gray-700 font-medium">No voice tone</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-green-400">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <p className="text-gray-700 font-medium">Can use emojis 😊</p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border-l-4 border-emerald-400">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    <p className="text-gray-700 font-medium">Time to think before sending</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Examples Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              See the Difference
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Small changes in your messages can make a big impact on how others feel
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {messageExamples.map((example, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                    example.type === 'cold' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {example.type === 'cold' ? '❄️ Cold Message' : '💬 Simple Message'}
                  </div>
                </div>
                
                {/* Original Message */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gray-400 rounded-full p-2">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-2">"{example.message}"</p>
                      <p className="text-red-600 text-sm font-medium">{example.tone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mb-6">
                  <ArrowRight className="w-8 h-8 text-green-600 animate-pulse" />
                </div>
                
                {/* Better Message */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-2">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-800 font-medium mb-2">"{example.better}"</p>
                      <p className="text-green-600 text-sm font-medium">✓ Much better!</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-green-200">
                  <p className="text-gray-600 text-sm">{example.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Message Builder */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">✉️</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Try It Yourself!
            </h2>
            <p className="text-gray-600">Write a message and see how tone makes a difference</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Message:</label>
                <textarea
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows="3"
                />
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setMessageType('cold')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    messageType === 'cold' 
                      ? 'bg-gray-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Without Emoji
                </button>
                <button
                  onClick={() => setMessageType('warm')}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                    messageType === 'warm' 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  With Emoji 😊
                </button>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border-l-4 border-green-400">
                <h4 className="font-medium text-gray-800 mb-2">Preview:</h4>
                <p className="text-gray-700 text-lg">{getMessagePreview()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tone in Texting Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              Tone in Texting
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-l-4 border-green-400 max-w-2xl mx-auto">
              <p className="text-xl text-gray-700">
                Even in writing, <strong className="text-green-600">tone</strong> matters. 
                Emojis and tone tags help show how you feel.
              </p>
            </div>
          </div>
          
          {/* Auto-rotating tips */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="text-lg text-gray-600 mb-4">Communication Tip #{currentTip + 1}</div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-8 max-w-2xl mx-auto transform hover:scale-105 transition-all duration-500">
                <div className="flex items-center justify-center space-x-6">
                  <div className="text-4xl">{communicationTips[currentTip].icon}</div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold mb-2">{communicationTips[currentTip].title}</h3>
                    <p className="text-lg opacity-90 mb-3">{communicationTips[currentTip].description}</p>
                    <div className="bg-white/20 rounded-lg p-3">
                      <p className="text-sm">Example: <strong>{communicationTips[currentTip].example}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STAR Method Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
              The STAR Method for Great Compliments
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-l-4 border-green-400 max-w-3xl mx-auto">
              <p className="text-xl text-gray-700">
                The <strong className="text-green-600 text-2xl">STAR</strong> method helps you give meaningful compliments that make people feel truly appreciated.
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {starMethod.map((star, index) => (
              <div
                key={index}
                className={`bg-gradient-to-r ${star.color} text-white rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                  visibleCards.includes(index + 4) ? 'animate-fade-in' : 'opacity-0'
                }`}
                style={{ animationDelay: `${index * 200 + 800}ms` }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                  {star.letter}
                </div>
                <h3 className="text-xl font-bold mb-3">{star.word}</h3>
                <p className="text-sm opacity-90 mb-4">{star.description}</p>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-xs font-medium">{star.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STAR Example */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">⭐</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              STAR Method Example
            </h2>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Instead of saying:</h3>
                <p className="text-gray-600">"Good job"</p>
              </div>
              
              <ArrowRight className="w-8 h-8 text-green-600 mx-auto mb-6 animate-pulse" />
              
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl p-6">
                <h3 className="text-xl font-bold mb-2">Try this STAR compliment:</h3>
                <p className="text-lg">"Thanks for helping with my science chart yesterday. You were patient, and I really needed that."</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-4 mt-8">
              {[
                { letter: "S", check: "Science chart (specific)" },
                { letter: "T", check: "You really needed help (true)" },
                { letter: "A", check: "Thanks for helping (appreciative)" },
                { letter: "R", check: "Helping yesterday (action)" }
              ].map((item, index) => (
                <div key={index} className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 text-center">
                  <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">
                    {item.letter}
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{item.check}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Practice Challenge */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Challenge: Try This Today!
            </h2>
            <div className="bg-white rounded-xl p-8 shadow-sm max-w-2xl mx-auto">
              <p className="text-lg text-gray-700 mb-6">
                Send a friendly message to someone today with:
              </p>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>A kind tone</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>An emoji that matches how you feel</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>A specific compliment using STAR</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Takeaway */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border-l-4 border-green-400">
          <div className="text-center">
            <div className="text-4xl mb-4">💡</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">
              Remember This
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto font-medium mb-6">
              Whether you're texting a friend or speaking to a teacher, your words matter. Communication happens both offline and online—and both need care.
            </p>
            <div className="bg-white rounded-xl p-6 shadow-sm max-w-2xl mx-auto">
              <p className="text-lg text-gray-600">
                <strong className="text-green-600">Clear Message</strong> + 
                <strong className="text-emerald-600"> Kind Tone</strong> + 
                <strong className="text-teal-600"> Respect</strong> = 
                <strong className="text-green-700"> Great Communication! 🌟</strong>
              </p>
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
      `}</style>
    </div>
  );
};

export default Mod5;