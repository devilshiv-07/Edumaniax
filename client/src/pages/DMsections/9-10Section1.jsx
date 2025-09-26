import React, { useState, useEffect } from 'react';

const Module1 = ({ topicRefs }) => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);

  const funnelSteps = [
    { step: "Awareness", icon: "👀", desc: "See a video thumbnail", color: "bg-purple-100 text-purple-700" },
    { step: "Interest", icon: "📺", desc: "Watch a few videos", color: "bg-blue-100 text-blue-700" },
    { step: "Consideration", icon: "🤔", desc: "Check out playlists", color: "bg-green-100 text-green-700" },
    { step: "Conversion", icon: "❤️", desc: "Like, comment, share", color: "bg-red-100 text-red-700" },
    { step: "Loyalty", icon: "🔥", desc: "Keep coming back", color: "bg-orange-100 text-orange-700" }
  ];

  const objectives = [
    "We want to get 5,000 new Instagram followers in 2 months.",
    "We want 1,000 people to visit our website from Google Ads.",
    "We want to sell 200 copies of our new phone accessory by the end of the month."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % funnelSteps.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Google Translate initialization
  useEffect(() => {
    // Add Google Translate script if not already present
    if (!document.querySelector('script[src*="translate.google.com"]')) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.head.appendChild(script);
    }

    // Define the initialization function
    window.googleTranslateElementInit = function() {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en' }, 
          'google_translate_element'
        );
      }
    };

    // If Google Translate is already loaded, initialize it
    if (window.google && window.google.translate) {
      window.googleTranslateElementInit();
    }

    return () => {
      // Cleanup: remove the global function when component unmounts
      delete window.googleTranslateElementInit;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-card');
            setVisibleCards(prev => [...new Set([...prev, id])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-card]').forEach(card => {
      observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Google Translate Styles */}
      <style jsx>{`
        .google-translate-container .goog-te-gadget {
          font-family: inherit !important;
        }
        .google-translate-container .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          font-size: 14px !important;
          color: white !important;
        }
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value {
          color: white !important;
        }
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value:hover {
          text-decoration: none !important;
        }
        .google-translate-container .goog-te-gadget-icon {
          display: none !important;
        }
        .google-translate-container .goog-te-gadget-simple .goog-te-menu-value span {
          color: white !important;
        }
      `}</style>
      
      <div
        id="m-1"
        ref={(el) => {
          if (topicRefs?.current) {
            topicRefs.current["m-1"] = el;
          }
        }}
        className="mb-10"
      >
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6 animate-pulse">
              <span className="text-4xl">🎯</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              Strategy & Objectives
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Planning your digital marketing journey like a pro explorer! 🗺️✨
            </p>
            
            {/* Google Translate Widget */}
            <div className="mt-8 flex justify-center">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <div id="google_translate_element" className="google-translate-container"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* What is Digital Marketing Strategy */}
        <div 
          data-card="strategy"
          className={`mb-16 transform transition-all duration-1000 ${visibleCards.includes('strategy') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-indigo-100">
            <div className="flex items-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mr-6">
                <span className="text-3xl">🗺️</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                What is a Digital Marketing Strategy?
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Think of a digital marketing strategy like <strong className="text-indigo-600">planning a trip</strong>. 
                  If you don't know where you want to go or how you'll get there, you might get lost or waste time.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  A company's digital marketing strategy is its <em className="text-purple-600 font-semibold">plan</em> for 
                  how to reach customers online — through places like Instagram, YouTube, or Google — and get them interested in their products.
                </p>
              </div>
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl p-6">
                <div className="text-center">
                  <span className="text-6xl mb-4 block animate-bounce">🎮</span>
                  <h3 className="text-xl font-bold text-indigo-800 mb-2">Gaming App Example</h3>
                  <p className="text-gray-700">
                    New gaming app posts cool teaser videos on YouTube and runs ads on Instagram to attract players!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Objectives Matter */}
        <div 
          data-card="objectives"
          className={`mb-16 transform transition-all duration-1000 delay-200 ${visibleCards.includes('objectives') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-green-200">
            <div className="text-center mb-10">
              <span className="text-6xl mb-4 block">🎯</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Why Are Objectives So Important?
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Objectives are like the <strong className="text-green-600">goals</strong> on your trip. 
                Without clear goals, you might wander around without direction.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {objectives.map((objective, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <p className="text-gray-700 font-medium">"{objective}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Funnel Section */}
        <div 
          data-card="funnel"
          className={`mb-16 transform transition-all duration-1000 delay-400 ${visibleCards.includes('funnel') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-purple-100">
            <div className="text-center mb-12">
              <span className="text-6xl mb-4 block">🌪️</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                The Lead Funnel — Your Customer's Journey
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto">
                It's the path someone takes from <em className="text-purple-600">just hearing</em> about a product 
                to <em className="text-purple-600">actually buying</em> it. We call it a funnel because it's shaped like one — 
                wide at the top and narrow at the bottom.
              </p>
            </div>

            {/* Interactive Funnel */}
            <div className="relative max-w-4xl mx-auto">
              <div className="grid gap-4">
                {funnelSteps.map((step, index) => (
                  <div 
                    key={index}
                    className={`relative transition-all duration-500 ${
                      currentStep === index ? 'scale-105 z-10' : 'scale-100'
                    }`}
                  >
                    <div className={`${step.color} rounded-2xl p-6 border-2 ${
                      currentStep === index ? 'border-indigo-400 shadow-lg' : 'border-transparent'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-3xl mr-4">{step.icon}</span>
                          <div>
                            <h3 className="text-xl font-bold">{step.step}</h3>
                            <p className="text-sm opacity-80">{step.desc}</p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold opacity-60">
                          {index + 1}
                        </div>
                      </div>
                    </div>
                    {index < funnelSteps.length - 1 && (
                      <div className="flex justify-center my-2">
                        <div className="w-8 h-8 flex items-center justify-center">
                          <span className="text-2xl text-gray-400">⬇️</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* YouTube Channel Example */}
        <div 
          data-card="example"
          className={`mb-16 transform transition-all duration-1000 delay-600 ${visibleCards.includes('example') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-3xl p-8 md:p-12 border border-red-200">
            <div className="text-center mb-10">
              <span className="text-6xl mb-4 block">📺</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Example: YouTube Gaming Channel Funnel
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                { icon: "👀", title: "Awareness", desc: "Friends see thumbnail and get curious" },
                { icon: "📺", title: "Interest", desc: "Watch videos and subscribe" },
                { icon: "📋", title: "Consideration", desc: "Check out playlists" },
                { icon: "❤️", title: "Conversion", desc: "Like, comment, share" },
                { icon: "🔥", title: "Loyalty", desc: "Keep coming back" }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-lg transition-all duration-300">
                  <span className="text-4xl mb-3 block">{item.icon}</span>
                  <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Why Social Media and Google */}
        <div 
          data-card="platforms"
          className={`mb-16 transform transition-all duration-1000 delay-800 ${visibleCards.includes('platforms') ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-blue-100">
            <div className="text-center mb-10">
              <span className="text-6xl mb-4 block">📱</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Why Focus on Social Media and Google?
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">
                Because nearly everyone is on social media and searching on Google every day!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
                <div className="text-center">
                  <span className="text-5xl mb-4 block">📸</span>
                  <h3 className="text-xl font-bold text-blue-800 mb-4">Social Media Platforms</h3>
                  <p className="text-gray-700">
                    Instagram and YouTube let brands show creative ads — like funny videos or cool photos — that catch your attention.
                  </p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-8">
                <div className="text-center">
                  <span className="text-5xl mb-4 block">🔍</span>
                  <h3 className="text-xl font-bold text-green-800 mb-4">Google</h3>
                  <p className="text-gray-700">
                    Google helps brands show ads when you're actively searching for something — maybe that headphone you were thinking about!
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 text-center">
              <p className="text-lg font-semibold text-purple-800">
                🎯 Together, these platforms help brands reach people <em>at every stage</em> of the funnel!
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Module1;