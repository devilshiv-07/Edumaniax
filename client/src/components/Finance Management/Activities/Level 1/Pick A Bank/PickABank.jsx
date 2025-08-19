import React, { useEffect, useState } from "react";
import axios from "axios";
import BankCard from "./BankCard";
import { useFinance } from "../../../../../contexts/FinanceContext.jsx";
import { usePerformance } from "@/contexts/PerformanceContext"; // for performance
import IntroScreen from "./IntroScreen";
import GameNav from "./GameNav";
import { useNavigate } from "react-router-dom";
import InstructionOverlay from "./InstructionOverlay";

const upiOptions = ["Google Pay", "PhonePe", "Paytm", "BHIM"];
const banks = [
  {
    id: "A",
    name: "Bank A",
    fee: "₹0/month",
    interest: "3% interest",
    digital: "Basic digital features",
  },
  {
    id: "B",
    name: "Bank B",
    fee: "₹50/month",
    interest: "2.5% interest",
    digital: "Full digital banking, and free UPI + cashback",
  },
  {
    id: "C",
    name: "Bank C",
    fee: "₹0/month",
    interest: "1% interest",
    digital: "No digital access, Offline services only",
  },
];

const parentAdviceOptions = [
  "Choose digital bank",
  "Avoid fees",
  "Stick to traditional bank",
  "No advice",
];

const reasonOptions = [
  "High interest",
  "Low fee",
  "Supports digital payments",
  "Traditional bank",
  "As per parents' advice",
];

const feedbackMap = {
  // Bank A (Basic digital features, ₹0/month fee, 3% interest)
  "A|Choose digital bank|High interest":
    "Bank A offers a solid 3% interest with basic digital features, matching your parent's advice to choose a digital bank. Good choice for earning and convenience.",
  "A|Choose digital bank|Low fee":
    "Bank A has no monthly fees and basic digital features, aligning well with your parents’ advice and your fees sensitivity.",
  "A|Choose digital bank|Supports digital payments":
    "Bank A has basic digital services, which fits your desire for digital payments and your parents' advice to pick a digital bank. But Bank B would be a better option regarding digital services.",
  "A|Choose digital bank|Traditional bank":
    "Bank A leans digital but with basic features; if you want traditional banking, you might reconsider given your parents' advice.",
  "A|Choose digital bank|As per parents' advice":
    "Following your parents’ digital bank advice, Bank A is a reasonable choice with decent interest and zero fees. If digital services is your top priroty and not the fee, Bank B would be a far better choice.",

  "A|Avoid fees|High interest":
    "Bank A offers a good 3% interest and no fees, so this aligns well with your parents's advice as well as with your low-fees goal.",
  "A|Avoid fees|Low fee":
    "No fees at Bank A matches perfectly with your parent's advice to avoid fees and your preference. Best choice.",
  "A|Avoid fees|Supports digital payments":
    "Bank A offers basic digital features with no fees, a balanced choice for fee-conscious digital users. A very well-balanced choice.",
  "A|Avoid fees|Traditional bank":
    "Bank A is more digital than traditional, which may not perfectly match your parents’ advice but keeps fees low. You may consider Bank C as a better option.",
  "A|Avoid fees|As per parents' advice":
    "Bank A has zero fee. So, it aligns well with your parents’ advice. Perfect choice.",

  "A|Stick to traditional bank|High interest":
    "Bank A has good interest but is more digital than traditional, so this may not fully match your parents' advice. Bank C could be another option for you.",
  "A|Stick to traditional bank|Low fee":
    "Bank A charges no fees but offers only basic digital services — might be a compromise if you want traditional banking.",
  "A|Stick to traditional bank|Supports digital payments":
    "Bank A supports digital payments only in a basic way, which might differ from the traditional focus your parents suggested.",
  "A|Stick to traditional bank|Traditional bank":
    "Bank A is not truly traditional but has benefits like no fees and decent interest. Bank C would be the best option for you.",
  "A|Stick to traditional bank|As per parents' advice":
    "If your parents advised sticking to traditional banks, Bank A may be a partial fit with some modern features. But you should consider Bank C as a potential alternative.",

  "A|No advice|High interest":
    "Bank A’s 3% interest is a strong point if you have no parental advice guiding your choice. It is the best choice for you.",
  "A|No advice|Low fee":
    "Bank A offers zero fees and decent interest, the best option in your case.",
  "A|No advice|Supports digital payments":
    "With basic digital features, Bank A can satisfy digital payment needs without parental input.",
  "A|No advice|Traditional bank":
    "Bank A isn’t fully traditional. You must consider Bank C as an alternative.",
  "A|No advice|As per parents' advice":
    "No parental advice means this choice is based on your own preference. In such a case, Bank A is the go-to option.",

  // Bank B (Full digital banking, ₹50/month fee, 2.5% interest, free UPI + cashback)
  "B|Choose digital bank|High interest":
    "Bank B provides excellent digital features but lower interest. So it is suitable only if you are willing to compromise digital convenience over returns.",
  "B|Choose digital bank|Low fee":
    "With a ₹50 monthly fee, Bank B may not fit the low-fees goal but offers full digital benefits and cashback. Choose only if you are willing to compromise for the fee. Otherwise, Bank A could be a better option.",
  "B|Choose digital bank|Supports digital payments":
    "Bank B is ideal for digital payments and UPI usage, aligning well with your parents’ digital bank advice and your own choice.",
  "B|Choose digital bank|Traditional bank":
    "Bank B is fully digital, so it is well-suited with your parents' advice. However, your choice of a traditional bank is not met. You might wish to reconsider with Bank C as an alternative.",
  "B|Choose digital bank|As per parents' advice":
    "Following your parents' advice, Bank B offers top digital banking but at a monthly fee. But it is the perfect choice regarding digital services ",

  "B|Avoid fees|High interest":
    "Bank B is a bad choice in your case. It charges a high fees and does not give the best interest. Bank A would be a far better opton in this regard.",
  "B|Avoid fees|Low fee":
    "Bank B’s fees could be a drawback despite its cashback and features. Please reconsider with Bank A as an option.",
  "B|Avoid fees|Supports digital payments":
    "Bank B is great for digital payments, but fees may reduce overall value for fee-avoidant users. Bank A offers a far better tradeoff.",
  "B|Avoid fees|Traditional bank":
    "Bank B is a bad choice considering its fees and digital services. Bank C is the best choice with traditional banking and zero fees.",
  "B|Avoid fees|As per parents' advice":
    "If avoiding fees is important, Bank B is not the best fit despite digital perks. Bank A or C would be a better option.",

  "B|Stick to traditional bank|High interest":
    "Bank B is digital-first, so it may conflict with your parents' traditional bank advice.",
  "B|Stick to traditional bank|Low fee":
    "Bank B charges fees and is digital-focused, so it might not match traditional or low-fees preferences.",
  "B|Stick to traditional bank|Supports digital payments":
    "Bank B excels here but may conflict with traditional banking advice.",
  "B|Stick to traditional bank|Traditional bank":
    "Bank B is fully digital and may not be what parents expected for traditional banking.",
  "B|Stick to traditional bank|As per parents' advice":
    "Bank B may not fit traditional advice despite its strong digital features.",

  "B|No advice|High interest":
    "Bank B offers solid digital perks but lower interest and fees, a balanced choice with no external advice.",
  "B|No advice|Low fee":
    "The ₹50 fees might be a drawback, but you get cashback and full digital banking.",
  "B|No advice|Supports digital payments":
    "Excellent choice for digital payments and perks with no parental advice involved.",
  "B|No advice|Traditional bank":
    "Bank B is digital-first, so if you prefer traditional banks, consider this carefully.",
  "B|No advice|As per parents' advice":
    "Without advice, Bank B’s features stand on their own merit.",

  // Bank C (Offline services only, ₹0/month fee, 1% interest)
  "C|Choose digital bank|High interest":
    "Bank C offers low interest and no digital access, so it may not match your parents' digital bank advice.",
  "C|Choose digital bank|Low fee":
    "No fees, but lack of digital access may limit convenience despite parents’ advice to choose digital.",
  "C|Choose digital bank|Supports digital payments":
    "Bank C doesn’t support digital payments, which conflicts with both your reason and your parents’ advice.",
  "C|Choose digital bank|Traditional bank":
    "Bank C is the most traditional bank, but its low interest might be a drawback.",
  "C|Choose digital bank|As per parents' advice":
    "Parents advised digital banking but Bank C lacks digital features; might not be ideal.",

  "C|Avoid fees|High interest":
    "Bank C has no fees but low interest; this is a trade-off worth considering.",
  "C|Avoid fees|Low fee":
    "Perfect for avoiding fees, but note the lack of digital access.",
  "C|Avoid fees|Supports digital payments":
    "Bank C doesn’t support digital payments, so it may not meet your digital needs.",
  "C|Avoid fees|Traditional bank":
    "Good fit if avoiding fees and preferring traditional banking.",
  "C|Avoid fees|As per parents' advice":
    "Avoiding fees fits well here, but lack of digital features might not match parents' advice.",

  "C|Stick to traditional bank|High interest":
    "Bank C fits your parents’ traditional banking advice but offers lower interest.",
  "C|Stick to traditional bank|Low fee":
    "No fees and traditional approach make Bank C a solid choice for your criteria.",
  "C|Stick to traditional bank|Supports digital payments":
    "Bank C lacks digital payments, which may not align with your digital payment preference.",
  "C|Stick to traditional bank|Traditional bank":
    "Bank C is the best match for traditional banking advice and has no fees.",
  "C|Stick to traditional bank|As per parents' advice":
    "Following your parents’ advice, Bank C is traditional and fee-free, though low interest.",

  "C|No advice|High interest":
    "Bank C has the lowest interest but no fees and traditional service, a cautious no-advice pick.",
  "C|No advice|Low fee":
    "No fees make Bank C attractive without parental input, though interest is low.",
  "C|No advice|Supports digital payments":
    "Bank C lacks digital payments, so if you want that, reconsider.",
  "C|No advice|Traditional bank":
    "Bank C is the clear traditional bank option without parental advice.",
  "C|No advice|As per parents' advice":
    "Without advice, Bank C offers safety with traditional services but low interest.",
};

const feedbackOutcomeMap = {
  // ===== Bank A =====
  "A|Choose digital bank|High interest": "win",
  "A|Choose digital bank|Low fee": "win",
  "A|Choose digital bank|Supports digital payments": "lose", // basic digital only
  "A|Choose digital bank|Traditional bank": "lose",
  "A|Choose digital bank|As per parents' advice": "win",

  "A|Avoid fees|High interest": "win",
  "A|Avoid fees|Low fee": "win",
  "A|Avoid fees|Supports digital payments": "win",
  "A|Avoid fees|Traditional bank": "lose",
  "A|Avoid fees|As per parents' advice": "win",

  "A|Stick to traditional bank|High interest": "lose",
  "A|Stick to traditional bank|Low fee": "lose",
  "A|Stick to traditional bank|Supports digital payments": "lose",
  "A|Stick to traditional bank|Traditional bank": "lose",
  "A|Stick to traditional bank|As per parents' advice": "lose",

  "A|No advice|High interest": "win",
  "A|No advice|Low fee": "win",
  "A|No advice|Supports digital payments": "win",
  "A|No advice|Traditional bank": "lose",
  "A|No advice|As per parents' advice": "win",

  // ===== Bank B =====
  "B|Choose digital bank|High interest": "lose",
  "B|Choose digital bank|Low fee": "lose",
  "B|Choose digital bank|Supports digital payments": "win",
  "B|Choose digital bank|Traditional bank": "lose",
  "B|Choose digital bank|As per parents' advice": "win",

  "B|Avoid fees|High interest": "lose",
  "B|Avoid fees|Low fee": "lose",
  "B|Avoid fees|Supports digital payments": "lose",
  "B|Avoid fees|Traditional bank": "lose",
  "B|Avoid fees|As per parents' advice": "lose",

  "B|Stick to traditional bank|High interest": "lose",
  "B|Stick to traditional bank|Low fee": "lose",
  "B|Stick to traditional bank|Supports digital payments": "lose",
  "B|Stick to traditional bank|Traditional bank": "lose",
  "B|Stick to traditional bank|As per parents' advice": "lose",

  "B|No advice|High interest": "lose",
  "B|No advice|Low fee": "lose",
  "B|No advice|Supports digital payments": "win",
  "B|No advice|Traditional bank": "lose",
  "B|No advice|As per parents' advice": "win",

  // ===== Bank C =====
  "C|Choose digital bank|High interest": "lose",
  "C|Choose digital bank|Low fee": "lose",
  "C|Choose digital bank|Supports digital payments": "lose",
  "C|Choose digital bank|Traditional bank": "lose",
  "C|Choose digital bank|As per parents' advice": "lose",

  "C|Avoid fees|High interest": "lose",
  "C|Avoid fees|Low fee": "win",
  "C|Avoid fees|Supports digital payments": "lose",
  "C|Avoid fees|Traditional bank": "win",
  "C|Avoid fees|As per parents' advice": "lose",

  "C|Stick to traditional bank|High interest": "lose",
  "C|Stick to traditional bank|Low fee": "win",
  "C|Stick to traditional bank|Supports digital payments": "lose",
  "C|Stick to traditional bank|Traditional bank": "win",
  "C|Stick to traditional bank|As per parents' advice": "win",

  "C|No advice|High interest": "lose",
  "C|No advice|Low fee": "win",
  "C|No advice|Supports digital payments": "lose",
  "C|No advice|Traditional bank": "win",
  "C|No advice|As per parents' advice": "lose",
};

const getManualFeedback = (bank, advice, reason) => {
  const key = `${bank}|${advice}|${reason}`;

  return (
    feedbackMap[key] ||
    "That's a thoughtful choice! Every bank has its pros and cons — make sure it aligns with your needs."
  );
};

export default function PickABank() {
  const { completeFinanceChallenge } = useFinance();
  const [step, setStep] = useState("choose"); // 'choose' or 'form'
  const [selectedBank, setSelectedBank] = useState(null);
  const [upiApp, setUpiApp] = useState("");
  const [parentAdvice, setParentAdvice] = useState("");
  const [chosenReason, setChosenReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [outcome, setOutcome] = useState("");

  //for Performance
  const { updatePerformance } = usePerformance();
  const [startTime, setStartTime] = useState(Date.now());
  const [showInstructions, setShowInstructions] = useState(true);
  const [showGif, setShowGif] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 4000); // 4 seconds
    return () => clearTimeout(timer);
  }, []);

  if (showIntro) {
    return <IntroScreen />;
  }

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
    setStep("form");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoadingFeedback(true);

    const feedbackKey = `${selectedBank?.id}|${parentAdvice}|${chosenReason}`;
    const feedbackText = feedbackMap[feedbackKey] || "No feedback available.";
    const outcomeResult = feedbackOutcomeMap[feedbackKey] || "lose"; // win | lose

    setFeedback(feedbackText);
    setOutcome(outcomeResult);

    // Performance tracking
    const totalTime = (Date.now() - startTime) / 1000;
    const studyTimeMinutes = Math.ceil(totalTime / 60);

    const scoreMap = { A: 10, B: 7, C: 5 };
    const score = scoreMap[selectedBank.id] ?? 6;

    updatePerformance({
      moduleName: "Finance",
      topicName: "budgetExpert",
      score,
      accuracy: score * 10,
      avgResponseTimeSec: totalTime,
      studyTimeMinutes,
      completed: true,
    });

    // Still run your win/lose challenge functions
    if (outcomeResult === "win") {
      completeFinanceChallenge(1, 0);
    } else {
      completeFinanceChallenge(0, 1);
    }

    setStartTime(Date.now());

    // Simulate feedback delay
    setTimeout(() => {
      setLoadingFeedback(false);
      setStep("result"); // show result screen
    }, 1500);
  };

  const notAllowed = () => {
    // console.log(selectedBank, parentAdvice, reason);
    if (!selectedBank || !parentAdvice || !chosenReason) {
      return true;
    }

    return false;
  };

  // function to handle selection and trigger gif
  const handleOptionSelect = (setter, value) => {
    setter(value);
    setShowGif(true);
    setTimeout(() => setShowGif(false), 3000); // hide after 2 seconds
  };

  // View Feedback Handler
  const handleViewFeedback = () => {
    setShowFeedback(true);
  };

  // Next Challenge Handler
  const handleNextChallenge = () => {
    navigate("/overspend-trap"); // ensure `useNavigate()` is defined
  };

  return (
    <>
      <div
        className="w-full min-h-screen bg-[#0A160E]"
        style={{ fontFamily: "'Comic Neue', cursive" }}
      >
        <GameNav />

        <div className="p-4 pt-25 md:pt-54 pb-28">
          {/* Main Content Card */}
          <div className="w-[92%] max-w-4xl mx-auto p-6 pt-4 flex flex-col items-center">
            {step === "choose" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mb-8">
                  {banks?.map((bank) => (
                    <div
                      key={bank.id}
                      className="transition-transform hover:scale-105"
                    >
                      <BankCard
                        bank={bank}
                        onSelect={(bank) => handleBankSelect(bank)}
                        selected={bank.id === selectedBank?.id}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-[#2f3e46] border-t-4 border-[#1a2e1a] shadow-inner py-3 sm:py-6 flex items-center justify-center gap-4 z-40 px-4 sm:px-0">
              {/* Kid Celebration Gif + Speech Bubble */}
              {showGif && (
                <div
                  className="
    absolute
    -top-24 sm:-top-30
    transform -translate-x-1/2
    z-50 flex items-start
  "
                  style={{ left: "85%" }}
                >
                  {/* Kid gif */}
                  <img
                    src="/financeGames6to8/kid-gif.gif"
                    alt="Kid Celebration"
                    className="object-contain"
                    style={{
                      maxHeight: "120px",
                      height: "auto",
                      width: "auto",
                    }}
                  />

                  {/* Speech bubble — hidden on small screens */}
                  <img
                    src="/financeGames6to8/kid-saying.svg"
                    alt="Kid Saying"
                    className="absolute top-2 left-[90px] w-24 hidden md:block"
                  />
                </div>
              )}

              {step === "choose" ? (
                <>
                  <span className="text-white lilita-one-regular font-semibold text-lg">
                    Choose from options:
                  </span>
                  {banks?.map((bank) => {
                    const svgMap = {
                      "Bank A": "/financeGames6to8/level-2/bankAbtn.svg",
                      "Bank B": "/financeGames6to8/level-2/bankBbtn.svg",
                      "Bank C": "/financeGames6to8/level-2/bankCbtn.svg",
                    };

                    return (
                      <button
                        key={bank.id}
                        onClick={() => {
                          setSelectedBank(bank);
                          setStep("form");
                        }}
                        className="p-1 rounded transition transform active:scale-90 hover:scale-105"
                      >
                        <img
                          src={svgMap[bank.name]}
                          alt={bank.name}
                          className="h-10 w-auto"
                        />
                      </button>
                    );
                  })}
                </>
              ) : (
                step === "form" && (
                  <button
                    onClick={handleSubmit}
                    disabled={notAllowed()}
                    className={`p-1 rounded ${
                      notAllowed() ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <img
                      src="/financeGames6to8/level-2/submit.svg"
                      alt="Submit"
                      className="h-12 w-auto"
                    />
                  </button>
                )
              )}
            </div>

            {step === "form" && selectedBank && (
              <>
                {/* Heading */}
                <div className="text-center font-bold text-white text-2xl mb-6 pb-2">
                  Select the answer of following questions
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="w-full max-w-xl space-y-5 text-lg bg-[#202F36]/30 p-5 rounded-xl shadow-xl"
                >
                  <div>
                    <label className="block font-bold text-white mb-1">
                      A. Which UPI/digital wallet do you use?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {upiOptions.map((upi) => (
                        <label
                          key={upi}
                          className="flex border border-[#37464F] items-center gap-2 bg-[#131F24] px-4 py-1.5 rounded-lg cursor-pointer hover:bg-[#132b35]"
                        >
                          <input
                            type="checkbox"
                            value={upi}
                            checked={upiApp === upi}
                            onChange={(e) =>
                              handleOptionSelect(
                                setUpiApp,
                                e.target.checked ? upi : ""
                              )
                            }
                            className="
    appearance-none w-5 h-5 border border-[#37464F] rounded
    checked:bg-[url('/financeGames6to8/level-2/tick.svg')]
    checked:bg-center checked:bg-no-repeat
  "
                          />

                          <span className="text-white">{upi}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-white mb-1">
                      B. Did your parents give you any advice?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {parentAdviceOptions.map((advice) => (
                        <label
                          key={advice}
                          className="flex border border-[#37464F] items-center gap-2 bg-[#131F24] px-4 py-1.5 rounded-lg cursor-pointer hover:bg-[#132b35]"
                        >
                          <input
                            type="checkbox"
                            value={advice}
                            checked={parentAdvice === advice}
                            onChange={(e) =>
                              setParentAdvice(e.target.checked ? advice : "")
                            }
                            className="appearance-none w-5 h-5 border border-[#37464F] rounded
    checked:bg-[url('/financeGames6to8/level-2/tick.svg')]
    checked:bg-center checked:bg-no-repeat"
                          />
                          <span className="text-white">{advice}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-white mb-1">
                      C. Why did you choose this bank?
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {reasonOptions.map((reason, index) => (
                        <label
                          key={index}
                          className="flex border border-[#37464F] items-center gap-2 bg-[#131F24] px-4 py-1.5 rounded-lg cursor-pointer hover:bg-[#132b35]"
                        >
                          <input
                            type="checkbox"
                            value={reason}
                            checked={chosenReason === reason}
                            onChange={(e) =>
                              setChosenReason(e.target.checked ? reason : "")
                            }
                            className="appearance-none w-5 h-5 border border-[#37464F] rounded
    checked:bg-[url('/financeGames6to8/level-2/tick.svg')]
    checked:bg-center checked:bg-no-repeat"
                          />
                          <span className="text-white">{reason}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </form>
              </>
            )}

            {/* WINNING & LOSING VIEW */}
            {step === "result" ? (
              feedbackOutcomeMap[
                `${selectedBank?.id}|${parentAdvice}|${chosenReason}`
              ] === "win" ? (
                // WINNING VIEW
                <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                  {/* Center Content */}
                  <div className="flex flex-col items-center justify-center flex-1 p-6">
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

                    {/* Accuracy + Insight Boxes */}
                    <div className="mt-6 flex flex-col items-center sm:flex-row sm:items-start sm:gap-4">
                      {/* Insight Box */}
                      <div className="mt-4 sm:mt-0 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-74">
                        <p className="text-black text-sm font-extrabold mb-1 mt-2">
                          INSIGHT
                        </p>
                        <div className="bg-[#131F24] mt-0 w-73 h-16 rounded-xl flex items-center justify-center px-4 py-1 text-center overflow-hidden">
                          <span
                            className="text-[#FFCC00] font-bold leading-tight"
                            style={{
                              fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
                              lineHeight: "1.1",
                              whiteSpace: "normal",
                            }}
                          >
                            {feedback || "Analyzing your results..."}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Buttons */}
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
              ) : (
                // LOSING VIEW
                feedbackOutcomeMap[
                  `${selectedBank?.id}|${parentAdvice}|${chosenReason}`
                ] === "lose" && (
                  <div className="fixed inset-0 z-50 bg-[#0A160E] flex flex-col justify-between">
                    {/* Game Over Content */}
                    <div className="flex flex-col items-center justify-center flex-1 p-4">
                      <img
                        src="/financeGames6to8/game-over-game.gif"
                        alt="Game Over"
                        className="w-48 sm:w-64 h-auto mb-4"
                      />
                      <p className="text-yellow-400 lilita-one-regular text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-center">
                        Oops! That was close! Wanna Retry?
                      </p>

                      {/* What Went Wrong Box */}
                      <div className="mt-4 sm:mt-8 lg:mt-12 bg-[#FFCC00] rounded-xl p-1 flex flex-col items-center w-74">
                        <p className="text-black text-sm font-extrabold mb-1 mt-2">
                          WHAT WENT WRONG?
                        </p>
                        <div className="bg-[#131F24] mt-0 w-73 h-16 rounded-xl flex items-center justify-center px-4 text-center overflow-hidden">
                          <span
                            className="text-[#FFCC00] lilita-one-regular font-medium italic leading-tight"
                            style={{
                              fontSize: "clamp(0.65rem, 1.2vw, 0.85rem)",
                              lineHeight: "1.1",
                              whiteSpace: "normal",
                            }}
                          >
                            {feedback || "Analyzing your results..."}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Buttons */}
                    <div className="bg-[#2f3e46] border-t border-gray-700 py-3 px-4 flex justify-center gap-6">
                      <img
                        src="/financeGames6to8/feedback.svg"
                        alt="Feedback"
                        onClick={handleViewFeedback}
                        className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                      />
                      <img
                        src="/financeGames6to8/retry.svg"
                        alt="Retry"
                        onClick={() => {
                          setShowIntro(false);
                          setStep("choose");
                        }}
                        className="cursor-pointer w-28 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                      />
                      <img
                        src="/financeGames6to8/next-challenge.svg"
                        alt="Next Challenge"
                        onClick={handleNextChallenge}
                        className="cursor-pointer w-34 sm:w-36 md:w-44 h-12 sm:h-14 object-contain hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  </div>
                )
              )
            ) : null}
          </div>
        </div>

        {/* Instructions overlay */}
        {showInstructions && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
            <InstructionOverlay onClose={() => setShowInstructions(false)} />
          </div>
        )}
      </div>
    </>
  );
}
