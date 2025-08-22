import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useFinance } from "../../../../../contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";

function parsePossiblyStringifiedJSON(text) {
  if (typeof text !== "string") return null;

  // Remove triple backticks and optional "json" after them
  text = text.trim();
  if (text.startsWith("```")) {
    text = text
      .replace(/^```(json)?/, "")
      .replace(/```$/, "")
      .trim();
  }

  // Remove single backticks
  if (text.startsWith("`") && text.endsWith("`")) {
    text = text.slice(1, -1).trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return null;
  }
}

const APIKEY = import.meta.env.VITE_API_KEY;

const EmiVsLumpSum = () => {
  const { completeFinanceChallenge } = useFinance();
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasselectedA, setasselectedA] = useState(false);
  const [hasselectedB, setasselectedB] = useState(false);
  const [reason, setReason] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  const lumpSumTotal = 4000 * 3; // ₹12,000
  const emiTotal = 4500 + 3000 * 3; // ₹13,500

  // for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const data = [
    { name: "Lump Sum", cost: lumpSumTotal, extra: 0 },
    { name: "EMI", cost: emiTotal, extra: 1500 },
  ];

  const handleSubmit = async () => {
    if (selectedOption && reason.trim()) {
      setShowResult(true);
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APIKEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `The user had to buy a phone of ₹12000. He had two options : 
                  Option A and B. Option A was the lumpsum option. In A, he had to save 4000 for 3 months and then buy the phone, using lumpsum payment. Option B was the EMI option. In option B, he had to pay 4500 upfront and then pay 3000 per month for three months. Of course this included interest as extra payment. The user chose option "${selectedOption}".
                  His reason was "${reason}". Evaluate his choices. Give feedback regarding the differnce between his choice and the other choice. If his choice is option B, criticize showing the issues of instant gratification, impulsive buying and the extra interest and if it is option A, appreciate accordingly. Your last sentence should give the verdict, like good choice or bad choice. Maximum length 40 words.

### FINAL INSTRUCTION ###
Return ONLY raw JSON (no backticks, no markdown, no explanations).
Example format:
{
feedback : "Your feedback"
}
`,
                },
              ],
            },
          ],
        }
      );

      const aiReply = response.data.candidates[0].content.parts[0].text;
      console.log(aiReply);
      const parsed = parsePossiblyStringifiedJSON(aiReply);
      console.log(parsed);
      setFeedback(parsed.feedback);

      if (hasselectedA && hasselectedB) {
        completeFinanceChallenge(1, 1);

        const totalTimeSec = (Date.now() - startTime) / 1000;
        updatePerformance({
          moduleName: "Finance",
          topicName: "bankingExpert",
          score: 10,
          accuracy: 100,
          completed: true,
          avgResponseTimeSec: totalTimeSec / 2,
          studyTimeMinutes: Math.ceil(totalTimeSec / 60),
        });
        setStartTime(Date.now());
      }
    } catch (err) {
      setError("Error fetching feedback. Try again later");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setSelectedOption(null);
    setReason("");
    setShowResult(false);
    setFeedback("");
    setLoading(false);
    setStartTime(Date.now());
  };

  const notAllowed = () => {
    if (selectedOption && reason.trim()) {
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-start justify-center gap-8 p-4 sm:p-6">
      {/* Right: Game Content */}
      <div className="bg-blue-200 rounded-lg w-full lg:w-1/2 max-w-2xl p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-center text-purple-800 mb-6">
          📱 EMI vs Lump Sum
        </h1>

        {!showResult && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <button
                aria-pressed={selectedOption === "A"}
                className={`p-5 rounded-lg shadow-md transition-all ${
                  selectedOption === "A"
                    ? "bg-green-100 border-2 border-green-600"
                    : "bg-white hover:bg-green-50"
                }`}
                onClick={() => setSelectedOption("A")}
              >
                <h2 className="text-lg font-semibold text-green-800 mb-2">
                  Option A: Lump Sum
                </h2>
                <p className="text-gray-700">
                  Save ₹4,000/month for 3 months. Then buy the phone in one
                  shot.
                </p>
                <p className="mt-2 font-medium text-green-700">
                  Total: ₹{lumpSumTotal.toLocaleString()}
                </p>
              </button>

              <button
                aria-pressed={selectedOption === "B"}
                className={`p-5 rounded-lg shadow-md transition-all ${
                  selectedOption === "B"
                    ? "bg-blue-100 border-2 border-blue-600"
                    : "bg-white hover:bg-blue-50"
                }`}
                onClick={() => setSelectedOption("B")}
              >
                <h2 className="text-lg font-semibold text-blue-800 mb-2">
                  Option B: EMI
                </h2>
                <p className="text-gray-700">
                  Pay ₹4,500 upfront + ₹3,000/month for 3 months (includes
                  interest).
                </p>
                <p className="mt-2 font-medium text-blue-700">
                  Total: ₹{emiTotal.toLocaleString()}
                </p>
              </button>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg shadow mb-6">
              <label
                htmlFor="reason"
                className="block font-medium text-yellow-800 mb-2"
              >
                💬 Why did you choose this option?
              </label>
              <textarea
                id="reason"
                className="w-full h-24 p-3 rounded border border-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Type your reason here..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <button
                disabled={notAllowed()}
                className={`mt-4 ${
                  notAllowed()
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer"
                } bg-yellow-400 text-yellow-900 px-4 py-2 rounded shadow hover:bg-yellow-500 transition-all`}
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </>
        )}

        {showResult && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-purple-700 mb-4">
                📊 Cost Comparison Chart
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cost" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow">
              <h4 className="font-semibold text-green-800 mb-2">
                {loading ? "Loading feedback..." : "Your feedback"}
              </h4>
              {error && <p className="text-red-600">{error}</p>}
              {feedback && <p>{feedback}</p>}
            </div>

            <div className="text-center">
              <button
                className="bg-red-500 text-white px-5 py-2 rounded shadow hover:bg-red-600 transition-all"
                onClick={handleRestart}
              >
                🔁 Restart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmiVsLumpSum;
