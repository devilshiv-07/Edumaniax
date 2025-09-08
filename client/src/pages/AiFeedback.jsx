import { useEffect, useMemo, useState, useRef, useCallback } from "react";
// API helpers
import { getCompleteReport, getCompleteModuleReport } from "../contexts/aiReportApi";

import { useAuth } from "../contexts/AuthContext";
import { Loader2, GamepadIcon, Trophy, BarChart3, Target, Flame, Clock, CheckCircle, BookOpen } from "lucide-react";

const MODULE_OPTIONS = [
  "Communication",
  "Computers",
  "DM",
  "Entrepreneurship",
  "Environment",
  "Finance",
  "Law",
  "Leadership",
  "SEL",
];

// Helper function to format numbers with max 4 characters
const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '0';
  const number = parseFloat(num);
  if (isNaN(number)) return '0';
  const str = number.toString();
  if (str.length <= 4) return str;
  if (number >= 1000) return Math.round(number).toString();
  if (number >= 100) return Math.round(number).toString();
  if (number >= 10) return number.toFixed(1);
  return number.toFixed(2);
};

/**
 * useStreamingText — robust typewriter with chunk queue
 * - enqueueChunk(text, speed): add a new text chunk to be typed out
 * - startStreaming(text, speed, append=false): convenience; reset (if !append) then enqueue
 * - stopStreaming(): cancel typing + clear queue (used in cleanup)
 * - reset(): stop + clear rendered text
 */
const useStreamingText = () => {
  const [streamedText, setStreamedText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const queueRef = useRef([]);        // queued string chunks
  const streamingRef = useRef(false); // is a chunk currently being typed
  const timeoutRef = useRef(null);    // current timeout id
  const speedRef = useRef(30);        // current typing speed

  const processQueue = useCallback(() => {
    if (streamingRef.current) return;
    if (queueRef.current.length === 0) {
      setIsStreaming(false);
      return;
    }

    streamingRef.current = true;
    setIsStreaming(true);

    const char = queueRef.current.shift(); // ek character nikalo
    setStreamedText(prev => prev + char);

    timeoutRef.current = setTimeout(() => {
      streamingRef.current = false;
      processQueue(); // agla char type karo
    }, speedRef.current);
  }, []);

  const enqueueChunk = useCallback((chunk, speed = 30) => {
    if (!chunk) return;
    speedRef.current = typeof speed === "number" && speed > 0 ? speed : 30;

    // 🔑 chunk ko characters me tod ke queue me daalo
    const chars = Array.from(String(chunk));
    chars.forEach(c => queueRef.current.push(c));

    if (!streamingRef.current) {
      processQueue();
    }
  }, [processQueue]);

  const startStreaming = useCallback((text, speed = 30, append = false) => {
    if (!append) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      queueRef.current = [];
      streamingRef.current = false;
      setStreamedText("");
      setIsStreaming(false);
    }
    enqueueChunk(text, speed);
  }, [enqueueChunk]);

  const stopStreaming = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    queueRef.current = [];
    streamingRef.current = false;
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    stopStreaming();
    setStreamedText("");
  }, [stopStreaming]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    streamedText,
    isStreaming,
    enqueueChunk,
    startStreaming,
    stopStreaming,
    reset,
  };
};

export default function AiFeedback() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("full"); // 'full' | 'module'
  const [selectedModule, setSelectedModule] = useState("");
  const [statsLoading, setStatsLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");
  const abortControllerRef = useRef(null);

  // Streaming text hook (now returns a stable API)
  const {
    streamedText,
    isStreaming,
    enqueueChunk,
    startStreaming,
    stopStreaming,
    reset: resetStreaming,
  } = useStreamingText();

  // Keep UI loader in sync with stream state
  useEffect(() => {
    // Hide the loader once streaming finishes (queue drained)
    if (!isStreaming) setFeedbackLoading(false);
  }, [isStreaming]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    stopStreaming();
    resetStreaming();
  }, [stopStreaming, resetStreaming]);

  // Fetch Full Report with streaming
  const fetchFullReport = useCallback(async () => {
    cleanup();
    setStatsLoading(true);
    setError("");
    setReport(null);

    const ac = new AbortController();
    abortControllerRef.current = ac;

    try {
      const data = await getCompleteReport(user.id, {
        signal: ac.signal,
        useStreaming: true,
        onFeedbackChunk: (chunk) => {
          if (!ac.signal.aborted) {
            // typewriter per character for each incoming chunk
            enqueueChunk(chunk, 25); // 25ms per character
            setFeedbackLoading(true);
          }
        }
      });

      if (!ac.signal.aborted) {
        setReport(data);
        setStatsLoading(false);

        if (data && typeof data.feedback === "string" && data.feedback.length > 0) {
          // Non-streaming fallback path: animate the whole feedback string
          setFeedbackLoading(true);
          startStreaming(data.feedback, 25, false);
          // best-effort timeout to hide loader (in case stream state isn't available)
          const approx = Math.min(8000, Math.max(800, data.feedback.length * 25 + 300));
          setTimeout(() => { if (!ac.signal.aborted) setFeedbackLoading(false); }, approx);
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return; // silent cancel
      if (!ac.signal.aborted) {
        setError(err.message || "Failed to fetch full report");
        setStatsLoading(false);
        setFeedbackLoading(false);
      }
    }
  }, [user?.id, cleanup, enqueueChunk, startStreaming]);

  // Fetch Module Report with streaming
  const fetchModuleReport = useCallback(async () => {
    if (!selectedModule) {
      setError("Please select a module");
      return;
    }
    cleanup();
    setStatsLoading(true);
    setError("");
    setReport(null);

    const ac = new AbortController();
    abortControllerRef.current = ac;

    try {
      const data = await getCompleteModuleReport(user.id, selectedModule, {
        signal: ac.signal,
        useStreaming: true,
        onFeedbackChunk: (chunk) => {
          if (!ac.signal.aborted) {
            enqueueChunk(chunk, 25);
            setFeedbackLoading(true);
          }
        },
      });

      if (!ac.signal.aborted) {
        setReport(data);
        setStatsLoading(false);
        if (data && typeof data.feedback === "string" && data.feedback.length > 0) {
          setFeedbackLoading(true);
          startStreaming(data.feedback, 25, false);
          const approx = Math.min(8000, Math.max(800, data.feedback.length * 25 + 300));
          setTimeout(() => { if (!ac.signal.aborted) setFeedbackLoading(false); }, approx);
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      if (!ac.signal.aborted) {
        setError(err.message || "Failed to fetch module report");
        setStatsLoading(false);
        setFeedbackLoading(false);
      }
    }
  }, [user?.id, selectedModule, cleanup, enqueueChunk, startStreaming]);

  // Auto-fetch when tab or module changes
  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "full") fetchFullReport();
  }, [activeTab, user?.id, fetchFullReport]);

  useEffect(() => {
    if (!user?.id) return;
    if (activeTab === "module" && selectedModule) fetchModuleReport();
  }, [activeTab, selectedModule, user?.id, fetchModuleReport]);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const renderStatsCards = (overall_stats) => {
    const statsArray = [
      {
        icon: <GamepadIcon className="w-6 h-6 text-yellow-600" />,
        label: "Total Games Played:",
        value: `${formatNumber(overall_stats?.totalGamesPlayed || overall_stats?.total_games_played || overall_stats?.gamesPlayed || 0)}`,
        bgColor: "bg-yellow-100"
      },
      {
        icon: <Trophy className="w-6 h-6 text-red-500" />,
        label: "Completed Games:",
        value: `${formatNumber(overall_stats?.total_completed_games || overall_stats?.completedGamesCount || overall_stats?.completedCount || 0)}`,
        bgColor: "bg-red-100"
      },
      {
        icon: <BarChart3 className="w-6 h-6 text-green-600" />,
        label: "Average Score:",
        value: `${formatNumber(overall_stats?.avg_score || overall_stats?.averageScorePerGame || overall_stats?.avgScore || 0)}/10`,
        bgColor: "bg-green-100"
      },
      {
        icon: <Target className="w-6 h-6 text-red-500" />,
        label: "Accuracy:",
        value: `${formatNumber(overall_stats?.avg_accuracy || overall_stats?.accuracy || 0)}/100 %`,
        bgColor: "bg-red-100"
      },
      {
        icon: <Clock className="w-6 h-6 text-purple-600" />,
        label: "Avg. Response Time:",
        value: `${formatNumber(overall_stats?.avg_response_time || overall_stats?.avgResponseTimeSec || overall_stats?.responseTime || 0)} s`,
        bgColor: "bg-pink-100"
      },
      {
        icon: <BookOpen className="w-6 h-6 text-purple-600" />,
        label: "Study Time:",
        value: `${formatNumber(overall_stats?.studyTimeMinutes || overall_stats?.avg_study_time || 0)} min`,
        bgColor: "bg-purple-100"
      }
    ];

    if (activeTab === "module") {
      statsArray.push({
        icon: <Flame className="w-6 h-6 text-blue-600" />,
        label: "Active Days:",
        value: `${formatNumber(overall_stats?.daysActiveCount || 0)}`,
        bgColor: "bg-blue-100"
      });
    }

    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeTab === "module" ? "md:grid-cols-5" : "md:grid-cols-5"} gap-3 sm:gap-4 mb-4 sm:mb-6`}>
        {statsArray.map((stat, idx) => (
          <div key={idx} className="bg-white shadow border-2 border-gray-150 rounded-lg p-3 py-4 flex items-center">
            <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg mr-3 sm:mr-4 flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs text-gray-600 leading-tight">{stat.label}</div>
              <div className="font-bold text-base sm:text-lg">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPerformanceSection = (topics) => {
    let allTopics = [];

    if (Array.isArray(topics)) {
      allTopics = [...topics];
    } else if (topics && typeof topics === 'object') {
      Object.entries(topics).forEach(([moduleName, arr]) => {
        if (Array.isArray(arr)) {
          arr.forEach(topic => allTopics.push({ ...topic, moduleName }));
        }
      });
    }

    const sortedTopics = allTopics.sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0));

    let strongestTopics = [];
    let weakestTopics = [];

    if (sortedTopics.length === 0) {
      strongestTopics = [];
      weakestTopics = [];
    } else if (sortedTopics.length === 1) {
      const topic = sortedTopics[0];
      if ((topic.accuracy || 0) > 50) {
        strongestTopics = [topic];
        weakestTopics = [];
      } else {
        strongestTopics = [];
        weakestTopics = [topic];
      }
    } else if (sortedTopics.length === 2) {
      const [first, second] = sortedTopics;
      strongestTopics = (first.accuracy || 0) > 50 ? [first] : [];
      weakestTopics = (second.accuracy || 0) <= 50 ? [second] : [];

      if ((first.accuracy || 0) <= 50) {
        strongestTopics = [];
        weakestTopics = [first, second];
      } else if ((second.accuracy || 0) > 50) {
        strongestTopics = [first, second];
        weakestTopics = [];
      }
    } else {
      strongestTopics = sortedTopics.slice(0, 3);
      weakestTopics = sortedTopics.slice(-3).reverse();
    }

    const renderTopicItem = (topic, isStrong) => (
      <div key={topic.topicName} className="flex items-center mb-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">
            {topic.topicName ? topic.topicName.substring(0, 2).toUpperCase() : 'T'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm truncate pr-2">{topic.topicName}</span>
            <span className="text-xs text-gray-500 flex-shrink-0">{formatNumber(topic.averageScorePerGame || 0)}/10</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${isStrong ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${formatNumber(topic.accuracy || 0)}%` }}
            ></div>
          </div>
          <div className="text-right">
            <span className={`text-xs ${isStrong ? 'text-green-600' : 'text-red-600'}`}>
              {formatNumber(topic.accuracy || 0)}% Correct
            </span>
          </div>
        </div>
      </div>
    );

    const renderNoDataMessage = (isStrong) => {
      const messageType = activeTab === 'full' ? 'module' : 'topic';
      if (isStrong) {
        return <p className="text-gray-500 text-sm">There is no strongest {messageType}</p>;
      } else {
        return <p className="text-gray-500 text-sm">There is no weakest {messageType}</p>;
      }
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-white shadow border-2 border-gray-150 rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-4">
            {activeTab === 'full' ? 'Strongest Module' : 'Strongest Topics'}
          </h3>
          {strongestTopics.length > 0 ? (
            strongestTopics.map(topic => renderTopicItem(topic, true))
          ) : (
            renderNoDataMessage(true)
          )}
        </div>
        <div className="bg-white shadow border-2 border-gray-150 rounded-lg p-4 sm:p-6">
          <h3 className="font-semibold text-base sm:text-lg mb-4">
            {activeTab === 'full' ? 'Weakest Modules' : 'Weakest Topics'}
          </h3>
          {weakestTopics.length > 0 ? (
            weakestTopics.map(topic => renderTopicItem(topic, false))
          ) : (
            renderNoDataMessage(false)
          )}
        </div>
      </div>
    );
  };

  const renderFeedbackSection = () => {
    const hasStreamedContent = streamedText.length > 0;
    const hasReportFeedback = report?.feedback && typeof report.feedback === "string";

    // streaming case: report.feedback === null and isStreaming === true
    const isStreamingCase = report?.feedback === null && isStreaming;

    // decide to show
    const showContent = hasStreamedContent || hasReportFeedback || isStreamingCase || feedbackLoading;

    if (!showContent) return null;

    return (
      <div className="space-y-4">
        {/* Overall Teacher Feedback Summary */}
        <div className="bg-white shadow border-2 border-gray-150 rounded-lg p-4">
          <h2 className="text-base sm:text-lg font-semibold mb-4">Overall Teacher Feedback</h2>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start sm:items-center">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1 sm:mt-0" />
            <span className="font-medium text-green-800 text-sm sm:text-base leading-relaxed">
              Overall: Strong effort and dedication; keep practicing to grow skills and confidence.
            </span>
          </div>
        </div>

        {/* Detailed Feedback with Streaming */}
        <div className="bg-white shadow border-2 border-gray-150 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-semibold">Teacher Feedback</h2>
            {(feedbackLoading || isStreaming) && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                Generating feedback...
              </div>
            )}
          </div>
          <div className="prose prose-sm max-w-none">
            <div className="whitespace-pre-line leading-relaxed text-gray-700 text-sm sm:text-base min-h-[60px]">
              {hasStreamedContent ? streamedText : (hasReportFeedback ? report.feedback : "")}
              {isStreaming && (
                <span className="animate-pulse bg-green-500 text-green-500 ml-1">|</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header with title and tabs */}
      <div className="flex justify-start bg-white p-3 sm:p-4 border-2 border-gray-150 rounded-lg items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">AI Feedback</h1>
      </div>

      {/* Tab Controls and Content Container */}
      <div className="relative">
        <div className="relative z-5 justify-end mr-2 flex gap-2">
          <button
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium text-sm sm:text-base transition-colors min-h-[44px] ${activeTab === "module"
              ? "bg-green-600 text-white"
              : "bg-white text-green-600 border border-green-600 hover:bg-green-50"
              }`}
            onClick={() => setActiveTab("module")}
          >
            Module Performance
          </button>
          <button
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium text-sm sm:text-base transition-colors min-h-[44px] ${activeTab === "full"
              ? "bg-green-600 text-white"
              : "bg-white text-green-600 border border-green-600 hover:bg-green-50"
              }`}
            onClick={() => setActiveTab("full")}
          >
            Full Report
          </button>
        </div>

        <div className="bg-white absolute z-10 border-2 border-gray-150 rounded-lg p-5 top-3/4 inset-x-0">
          {activeTab === "module" && (
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700 mt-2 mr-2 w-full sm:w-auto">Select Modules:</span>
                {MODULE_OPTIONS.map((mod) => (
                  <button
                    key={mod}
                    onClick={() => setSelectedModule(mod)}
                    className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center ${selectedModule === mod
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 border hover:bg-gray-50"
                      }`}
                  >
                    {mod}
                  </button>
                ))}
              </div>
              {!selectedModule && (
                <p className="text-sm text-gray-500">Please select a module to view its performance report.</p>
              )}
            </div>
          )}

          {/* Stats Loader */}
          {statsLoading && (
            <div className="flex justify-center items-center py-12 sm:py-20">
              <div className="flex flex-col items-center">
                <Loader2 className="animate-spin w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm text-gray-600">Loading stats...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Data Display */}
          {/* Data Display */}
          {!statsLoading && report && (
            <div>
              {/* Full Report tab ke liye */}
              {activeTab === "full" && (
                <>
                  {report.overall_stats && renderStatsCards(report.overall_stats)}
                  {report.topic_performance && renderPerformanceSection(report.topic_performance)}
                  {renderFeedbackSection()}
                </>
              )}

              {/* Module Report tab ke liye */}
              {activeTab === "module" && selectedModule && (
                <>
                  {report.module_stats && renderStatsCards(report.module_stats)}
                  {report.topic_performance && renderPerformanceSection(report.topic_performance)}
                  {renderFeedbackSection()}
                </>
              )}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}
