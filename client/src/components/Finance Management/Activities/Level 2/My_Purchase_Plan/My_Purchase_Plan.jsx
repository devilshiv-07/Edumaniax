// My Purchase Plan - Game Style with Lottie Animations & Detailed Calculations
import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
  Label,
} from "recharts";
import { CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import thinkingBoy from "../../../../../lotties/thingking-boy.json";
import celebrationGirl from "../../../../../lotties/celebration-girl.json";
import { useFinance } from "../../../../../contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";

const APIKEY = import.meta.env.VITE_API_KEY;

const My_Purchase_Plan = () => {
  const { completeFinanceChallenge } = useFinance();
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [months, setMonths] = useState("");
  const [emiAvailable, setEmiAvailable] = useState(false);
  const [interestRate, setInterestRate] = useState(2);
  const [discountAvailable, setDiscountAvailable] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // for performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showIntro, setShowIntro] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showGameWin, setShowGameWin] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const parsePossiblyStringifiedJSON = (text) => {
    try {
      return typeof text === "string" ? JSON.parse(text) : text;
    } catch {
      try {
        const jsonMatch = text.match(/{[\s\S]*}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Fallback JSON parse failed:", e);
      }
      return { error: "Failed to parse Gemini output." };
    }
  };

  const generatePlan = async () => {
    if (!product.trim() || !price || !months) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const prompt = `
I want to buy "${product}" priced approximately at ₹${price}.
Please help with:
1. Break down a ${months}-month saving plan showing savings for each month.
${
  emiAvailable
    ? `2. Suggest an EMI plan with ${interestRate}% monthly interest for ${months} months.`
    : "2. EMI is not available."
}
${
  discountAvailable
    ? `3. Show the discounted price if there's a ${discountPercent}% discount.`
    : "3. Discount is not available."
}
4. Suggest 5 alternatives: all cheaper.
### FINAL INSTRUCTION ###
Return ONLY raw JSON (no markdown or text).
Format:
{
  "monthlySavings": ["₹1000", "₹1000", ...],
  "emiOption": {
    "monthlyPayment": "₹...",
    "totalPayment": "₹..."
  },
  "discountedPrice": "₹...",
  "alternatives": ["...", "..."]}`;

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${APIKEY}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
        }
      );
      const aiReply =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const parsed = parsePossiblyStringifiedJSON(aiReply);
      setResult(parsed);
      console.log(parsed);

      completeFinanceChallenge(1, 3); //mark challenge completed
      //for performance
      const totalTime = (Date.now() - startTime) / 1000;
      const studyTimeMinutes = Math.ceil(totalTime / 60);

      updatePerformance({
        moduleName: "Finance",
        topicName: "bankingExpert",
        score: 10,
        accuracy: 100,
        avgResponseTimeSec: totalTime,
        studyTimeMinutes,
        completed: true,
      });
      setStartTime(Date.now());
      setShowGameWin(true);
    } catch (err) {
      console.error(err);
      setError("Error generating plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    if (!result?.monthlySavings) return [];
    const rainbow = [
      "#FF6B6B",
      "#FFD93D",
      "#6BCB77",
      "#4D96FF",
      "#A66DD4",
      "#FF9CEE",
    ];
    return result.monthlySavings.map((val, i) => {
      const numericAmount = Number(val.replace(/[₹,]/g, ""));
      return {
        month: `Month ${i + 1}`,
        amount: numericAmount,
        label: `₹${numericAmount.toLocaleString("en-IN")}`,
        fill: rainbow[i % rainbow.length],
      };
    });
  };

  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/newsflash"); // ensure `useNavigate()` is defined
  };

  const numericPrice = Number(price);
  const numericInterest = Number(interestRate);
  const numericMonths = Number(months);
  const interestAmount = Math.round(
    numericPrice * (numericInterest / 100) * numericMonths
  );
  const totalPayment = numericPrice + interestAmount;
  const emiPerMonth = Math.round(totalPayment / numericMonths);
  const discountAmount = Math.round(numericPrice * (discountPercent / 100));
  const discountedFinal = numericPrice - discountAmount;

  return (
    <>
      <GameNav />
      <div className="min-h-screen bg-[#0A160E] pt-20 md:pt-50 pb-28">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col-reverse  justify-center md:flex-row items-center gap-12">
            {/* Left: Game / Planning UI */}
            <div className="w-full md:w-2/3 px-2">
              <div className="text-center">
                <p className="text-white mb-4 text-lg italic">
                  Smart shopping starts here! 💡
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <input
                    type="text"
                    placeholder="Product name"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    className="border bg-[#202F364D] text-gray-200 p-2 rounded shadow-inner"
                  />
                  <input
                    type="number"
                    placeholder="Estimated price (₹)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="border bg-[#202F364D] text-gray-200 p-2 rounded shadow-inner"
                    min={0}
                  />
                  <input
                    type="number"
                    placeholder="Months"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    className="border bg-[#202F364D] text-gray-200 p-2 rounded shadow-inner"
                    min={1}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={emiAvailable}
                      onChange={() => setEmiAvailable(!emiAvailable)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded"
                    />
                    <label className="font-medium text-white">
                      EMI Available (in %)?
                    </label>
                    <input
                      type="number"
                      min={0} // prevents going below 0
                      value={interestRate}
                      onChange={(e) =>
                        setInterestRate(
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                      className="ml-4 w-24 border rounded p-2 text-white bg-[#202F364D]"
                      disabled={!emiAvailable}
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={discountAvailable}
                      onChange={() => setDiscountAvailable(!discountAvailable)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded"
                    />
                    <label className="font-medium text-gray-100">
                      Discount Available (in %)?
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={discountPercent}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDiscountPercent(
                          val === ""
                            ? ""
                            : Math.max(0, Math.min(100, Number(val)))
                        );
                      }}
                      className="ml-4 w-24 border rounded p-2 text-white bg-[#202F364D]"
                      disabled={!discountAvailable}
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>

                {loading && (
                  <Lottie
                    animationData={thinkingBoy}
                    className="h-40 mx-auto"
                  />
                )}

                <button
                  onClick={generatePlan}
                  className="bg-purple-600 hover:bg-purple-700 lilita-one-regular transition-all text-white w-full py-3 rounded-xl font-bold text-lg shadow-lg"
                  disabled={loading}
                >
                  {loading ? "Generating Plan..." : "🎯 Generate My Smart Plan"}
                </button>
              </motion.div>

              {error && (
                <div className="mt-4 text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {showGameWin && (
                <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between overflow-y-auto">
                  {/* Center Content (Trophy + Heading + Insight) */}
                  <div className="flex flex-col items-center justify-start p-6">
                    {/* Trophy GIFs */}
                    <div className="relative w-64 h-64 flex items-center justify-center">
                      <img
                        src="/financeGames6to8/trophy-rotating.gif"
                        alt="Rotating Trophy"
                        className="absolute w-full h-full object-contain"
                      />
                      <img
                        src="/financeGames6to8/trophy-celebration.gif"
                        alt="Celebration Effects"
                        className="absolute w-full h-full object-contain"
                      />
                    </div>

                    {/* Challenge Complete Text */}
                    <h2 className="text-yellow-400 lilita-one-regular text-3xl sm:text-4xl font-bold mt-6">
                      Challenge Complete!
                    </h2>
                  </div>

                  {/* Results (scrolls with page, not isolated) */}
                  <div className="px-6 pb-4">
                    <AnimatePresence>
                      {result && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.4 }}
                          className="bg-[#202F364D] shadow-xl rounded-xl mt-6 p-6 space-y-6 border"
                        >
                          <div className="text-green-700 font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Plan generated
                            successfully!
                          </div>

                          <Lottie
                            animationData={celebrationGirl}
                            className="h-32 mx-auto"
                          />

                          {/* Chart */}
                          <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={getChartData()}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 40,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month">
                                  <Label
                                    value="Month"
                                    offset={-10}
                                    position="insideBottom"
                                  />
                                </XAxis>
                                <YAxis>
                                  <Label
                                    value="₹ Savings"
                                    angle={-90}
                                    position="insideLeft"
                                  />
                                </YAxis>
                                <Tooltip
                                  formatter={(value) =>
                                    `₹${Number(value).toLocaleString("en-IN")}`
                                  }
                                />
                                <Legend verticalAlign="top" height={36} />
                                <Bar
                                  dataKey="amount"
                                  name="Monthly Savings"
                                  fill="#8b5cf6"
                                >
                                  <LabelList
                                    dataKey="label"
                                    position="top"
                                    fill="#000"
                                    fontSize={12}
                                  />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* EMI Breakdown */}
                          {emiAvailable && result.emiOption && (
                            <div className="bg-blue-50 p-4 rounded-xl shadow">
                              <h4 className="text-lg font-bold text-blue-800 lilita-one-regular mb-2">
                                📆 EMI Breakdown
                              </h4>
                              <p>
                                Step 1: Interest = ₹{price} × ({interestRate}
                                /100) × {months} ={" "}
                                <strong>
                                  ₹{interestAmount.toLocaleString("en-IN")}
                                </strong>
                              </p>
                              <p>
                                Step 2: Total Payment = ₹{price} + ₹
                                {interestAmount} ={" "}
                                <strong>
                                  ₹{totalPayment.toLocaleString("en-IN")}
                                </strong>
                              </p>
                              <p>
                                Step 3: Monthly EMI = ₹{totalPayment} / {months}{" "}
                                ={" "}
                                <strong>
                                  ₹{emiPerMonth.toLocaleString("en-IN")}
                                </strong>
                              </p>
                              <p className="mt-2">
                                AI Suggested EMI:{" "}
                                <strong>
                                  {result.emiOption.monthlyPayment}
                                </strong>
                              </p>
                            </div>
                          )}

                          {/* Discounted Price */}
                          {discountAvailable && result.discountedPrice && (
                            <div className="bg-green-50 p-4 rounded-xl shadow">
                              <h4 className="text-lg font-bold lilita-one-regular text-green-800 mb-2">
                                🏷️ Discounted Price
                              </h4>
                              <p>
                                Step 1: Discount = ₹{price} × ({discountPercent}
                                /100) ={" "}
                                <strong>
                                  ₹{discountAmount.toLocaleString("en-IN")}
                                </strong>
                              </p>
                              <p>
                                Step 2: Final Price = ₹{price} - ₹
                                {discountAmount} ={" "}
                                <strong>
                                  ₹{discountedFinal.toLocaleString("en-IN")}
                                </strong>
                              </p>
                              <p className="mt-2">
                                AI Suggested Price:{" "}
                                <strong>{result.discountedPrice}</strong>
                              </p>
                            </div>
                          )}

                          {/* Alternatives */}
                          <div className="bg-yellow-50 p-4 rounded-xl shadow">
                            <h4 className="text-lg lilita-one-regular font-bold text-yellow-800 mb-2">
                              💡 Cheaper Alternatives
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                              {result.alternatives.map((alt, i) => (
                                <li key={i}>🛍️ {alt}</li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Footer (fixed at bottom) */}
                  <div className="bg-[#2f3e46] border-t border-gray-700 py-4 px-6 flex justify-center gap-6">
                    <img
                      src="/financeGames6to8/feedback.svg"
                      alt="Feedback"
                      onClick={handleViewFeedback}
                      className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                    />
                    <img
                      src="/financeGames6to8/next-challenge.svg"
                      alt="Next Challenge"
                      onClick={handleNextChallenge}
                      className="cursor-pointer w-44 h-14 object-contain hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions overlay */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <InstructionOverlay onClose={() => setShowInstructions(false)} />
        </div>
      )}
    </>
  );
};

export default My_Purchase_Plan;
