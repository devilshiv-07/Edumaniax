// CreditCardSimulator.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Import Lottie animations
import { useFinance } from "../../../../../contexts/FinanceContext";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";

const items = [
  { name: "📱 Smartphone", cost: 9000 },
  { name: "🎮 Gaming Console", cost: 10000 },
  { name: "🎧 Headphones", cost: 4000 },
  { name: "🍕 Dinner Party", cost: 3000 },
];

const interestRate = 0.035;
const minPaymentRate = 0.05;
const totalMonths = 6;

const calculateEMI = (principal, rate, months) => {
  const r = rate;
  const n = months;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

export default function CreditCardSimulator() {
  const { completeFinanceChallenge } = useFinance();
  const [selectedItem, setSelectedItem] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [debt, setDebt] = useState(0);
  const [userPayments, setUserPayments] = useState([]);
  const [month, setMonth] = useState(1);
  const [emiDone, setEmiDone] = useState(false);
  const [minDone, setMinDone] = useState(false);
  const [hasTriedEmi, setHasTriedEmi] = useState(false);
  const [hasTriedMin, setHasTriedMin] = useState(false);
  const [emiAmount, setEmiAmount] = useState(0);
  const [remainingPrincipal, setRemainingPrincipal] = useState(0);

  const { updatePerformance } = usePerformance(); // for performance
  const [startTime, setStartTime] = useState(Date.now()); // for performance
  const [showIntro, setShowIntro] = useState(true);

  const handlePurchase = (item) => {
    setSelectedItem(item);
    setDebt(item.cost);
    setRemainingPrincipal(item.cost);
    setUserPayments([]);
    setMonth(1);
    setEmiDone(false);
    setMinDone(false);
    setPaymentMethod(null);
  };

  const chooseMethod = (method) => {
    setPaymentMethod(method);
    if (method === "emi") {
      const emi = calculateEMI(debt, interestRate, totalMonths);
      setEmiAmount(emi);
    }
  };

  const handleMinPayment = () => {
    const minDue = Math.max(debt * minPaymentRate, 100);
    const interest = (debt - minDue) * interestRate;
    const newDebt = debt - minDue + interest;

    setUserPayments([
      ...userPayments,
      {
        month,
        type: "Min Due",
        interest: Math.round(interest),
        payment:
          month === totalMonths ? Math.round(newDebt) : Math.round(minDue),
        remaining: Math.round(newDebt),
      },
    ]);

    if (month === totalMonths || newDebt <= 0) {
      setMinDone(true);
      setHasTriedMin(true);
    } else {
      setDebt(newDebt);
      setMonth(month + 1);
    }
  };

  const handleEMIPayment = () => {
    const interest = remainingPrincipal * interestRate;
    const principalComponent = emiAmount - interest;
    const newPrincipal = remainingPrincipal - principalComponent;

    setUserPayments([
      ...userPayments,
      {
        month,
        type: "EMI",
        interest: Math.round(interest),
        payment: Math.round(emiAmount),
        remaining: Math.round(newPrincipal),
      },
    ]);

    if (month === totalMonths || newPrincipal <= 0) {
      setEmiDone(true);
      setHasTriedEmi(true);
    } else {
      setRemainingPrincipal(newPrincipal);
      setMonth(month + 1);
    }
  };

  const totalPaid = userPayments.reduce((sum, p) => sum + p.payment, 0);
  const chartData = selectedItem
    ? [
        { name: "Item Price", amount: selectedItem.cost },
        { name: "Total Paid", amount: totalPaid },
      ]
    : [];

  useEffect(() => {
    if (hasTriedEmi && hasTriedMin) {
      completeFinanceChallenge(1, 0); // mark challenge completed

      // for performance
      const totalTimeSec = (Date.now() - startTime) / 1000;
      updatePerformance({
        moduleName: "Finance",
        topicName: "bankingExpert",
        score: 10,
        accuracy: 100,
        avgResponseTimeSec: totalTimeSec / (totalMonths * 2), // 6 months * 2 methods
        studyTimeMinutes: Math.ceil(totalTimeSec / 60),
        completed: true,
      });
      setStartTime(Date.now());
    }
  }, [hasTriedEmi, hasTriedMin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // show intro for 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  return (
    <>
      <GameNav />
      <div className="md:pt-50 pt-20 relative min-h-screen px-4 bg-[#0A160E]">
        {emiDone || minDone}
        {emiDone || minDone}

        <div className="flex flex- lg:flex-row items-start justify-center gap-8 max-w-7xl mx-auto">
          {/* Left: Game Content */}
          <div className="w-full border border-gray-100 bg-[#202F364D] lg:w-1/2 max-w-2xl p-6 mt-8 rounded-xl shadow-xl">
            <h1 className="text-3xl lilita-one-regular font-bold text-center text-white mb-6">
              💳 Credit Card Simulator - Game Mode
            </h1>

            {!selectedItem ? (
              <>
                <p className="text-center text-white text-lg mb-4">
                  Choose an item to buy:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {items.map((item) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      key={item.name}
                      onClick={() => handlePurchase(item)}
                      className="bg-[#20343d4d] border-2 border-gray-100 p-4 rounded-xl shadow hover:bg-[#1c3d4d4d]"
                    >
                      <h3 className="text-lg text-white lilita-one-regular font-bold">
                        {item.name}
                      </h3>
                      <p className="text-white lilita-one-regular">
                        ₹{item.cost.toLocaleString()}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </>
            ) : !paymentMethod ? (
              <>
                <p className="text-center text-white lilita-one-regular mt-6 text-lg font-semibold">
                  Choose Payment Method:
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                  <button
                    onClick={() => chooseMethod("min")}
                    className="bg-yellow-400 lilita-one-regular text-outline px-6 py-2 rounded-full text-white font-semibold shadow hover:bg-yellow-500 w-full sm:w-auto"
                  >
                    💳 Minimum Due (Credit Card)
                  </button>
                  <button
                    onClick={() => chooseMethod("emi")}
                    className="bg-green-500 lilita-one-regular text-outline px-6 py-2 rounded-full text-white font-semibold shadow hover:bg-green-600 w-full sm:w-auto"
                  >
                    📆 EMI Plan (6 Months)
                  </button>
                </div>
              </>
            ) : !(emiDone || minDone) ? (
              <>
                <p className="text-xl lilita-one-regular text-white text-center mt-4 font-semibold">
                  📅 Month {month}
                </p>

                {paymentMethod === "min" ? (
                  <div className="bg-yellow-100 lilita-one-regular p-4 mt-3 rounded-xl">
                    <p>Outstanding Debt: ₹{debt.toFixed(2)}</p>
                    <p>
                      Minimum Due (5%): ₹{(debt * minPaymentRate).toFixed(2)}
                    </p>
                    <p>Interest Rate: {(interestRate * 100).toFixed(1)}%</p>

                    <button
                      onClick={handleMinPayment}
                      className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-full w-full sm:w-auto"
                    >
                      Pay Minimum Due + Interest
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-100 lilita-one-regular p-4 mt-3 rounded-xl">
                    <p>
                      Remaining Principal: ₹
                      {remainingPrincipal.toLocaleString()}
                    </p>
                    <p>EMI This Month: ₹{Math.round(emiAmount)}</p>
                    <button
                      onClick={handleEMIPayment}
                      className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full w-full sm:w-auto"
                    >
                      Pay EMI
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-center text-green-600 lilita-one-regular mb-4">
                  🎉 Payment Complete!
                </h2>
                <div className="bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-xl">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke="#333" />
                      <YAxis stroke="#333" />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="amount"
                        fill="#6366f1"
                        radius={[10, 10, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 text-center">
                  <p className="font-semibold text-white lilita-one-regular">
                    Total Paid: ₹{totalPaid.toLocaleString()}
                  </p>
                  <p className="text-red-500 lili">
                    Extra Paid: ₹
                    {(totalPaid - selectedItem.cost).toLocaleString()}
                  </p>
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setSelectedItem(null);
                      setUserPayments([]);
                      setDebt(0);
                      setMonth(1);
                      setEmiDone(false);
                      setMinDone(false);
                      setPaymentMethod(null);
                      setRemainingPrincipal(0);
                      setStartTime(Date.now());
                    }}
                    className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700"
                  >
                    🔁 Try Again
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
