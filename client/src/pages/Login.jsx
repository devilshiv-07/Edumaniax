import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { KeyRound } from "lucide-react";
import Cookies from "js-cookie";

const Login = () => {
  const navigate = useNavigate();
  const { sendOtpForLogin, verifyOtpAndLogin } = useAuth();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [rememberMe, setRememberMe] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [resendTimer, setResendTimer] = useState(30); // 30 seconds cooldown
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const savedPhone = Cookies.get("rememberedPhone");
    if (savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (step === 2 && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, resendTimer]);

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setError("");
  };

  const handlesendOtpForLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!phone) return setError("Phone number is required");
    if (!/^\d{10}$/.test(phone))
      return setError("Enter a valid 10-digit phone number");

    setLoading(true);
    try {
      const res = await sendOtpForLogin(phone);
      if (rememberMe) {
        Cookies.set("rememberedPhone", phone, { expires: 7 });
      } else {
        Cookies.remove("rememberedPhone");
      }
      setStep(2);
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;
    const newOtpInputs = [...otpInputs];
    newOtpInputs[index] = value;
    setOtpInputs(newOtpInputs);
    setOtp(newOtpInputs.join(""));
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Enter the complete 6-digit OTP");

    setLoading(true);
    try {
      const result = await verifyOtpAndLogin(otp, navigate);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Invalid OTP.");
        setOtpInputs(["", "", "", "", "", ""]);
        setOtp("");
      }
    } catch {
      setError("Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resending || resendTimer > 0) return;
    setResending(true);
    setError("");
    try {
      await sendOtpForLogin(phone);
      setResendTimer(120); // reset timer
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT SIDE (hidden on small devices) */}
      <div className="hidden lg:flex h-screen w-1/2 relative overflow-hidden items-end justify-center">
        <img
          src="/loginPageDesign/RightBg.svg"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <Link to="/" className="flex items-center -gap-1">
            <img
              src="/loginPageDesign/EduManiax_Logo.svg"
              alt="Edumaniax Logo"
              className="h-20 w-auto"
            />
            <h1 className="text-white -mt-1 text-2xl lg:text-3xl font-bold">
              Edumaniax
            </h1>
          </Link>
        </div>

        <div className="z-10 lg:absolute lg:left-[8%] lg:-bottom-[3%]">
          <img
            src="/loginPageDesign/FlyingBoy.svg"
            alt="Flying Pencil Kid"
            className="w-[260px] sm:w-[320px] md:w-[380px] lg:w-[500px]"
          />
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative h-screen w-full lg:w-1/2 flex items-center justify-center p-6">
        {/* ✅ Mobile logo with horizontal alignment */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/loginPageDesign/phoneViewIcon.svg"
              alt="Edumaniax Mobile Logo"
              className="h-10 w-auto"
            />
            <span className="text-green-500 text-xl lg:text-2xl font-bold leading-none">
              Edumaniax
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-full px-6 pt-8 pb-6 mt-12 lg:mt-0">
          <div className="w-full">
            {step === 1 && (
              <h2 className="text-3xl sm:text-4xl lg:text-5xl sigmar-font font-bold text-[#006724] mb-2 text-center">
                Login To Learn!
              </h2>
            )}

            {step === 1 && (
              <p className="text-sm text-gray-600 mt-2 lg:mt-6 text-center">
                <span className="block lg:inline">
                  Welcome back! Login to continue your journey
                </span>
                <span className="hidden lg:inline">
                  {" "}
                  with us—we’ve got great things waiting.
                </span>
              </p>
            )}

            {step === 1 ? (
              <form onSubmit={handlesendOtpForLogin} className="space-y-4">
                <div className="relative mt-8">
                  <label
                    htmlFor="phone-input"
                    className={`absolute left-[1rem] z-10 px-1 bg-white transition-all duration-200 ${
                      isFocused || phone
                        ? "text-2xs -top-2.5 text-green-700"
                        : "text-2sm top-4 text-gray-400"
                    }`}
                  >
                    Phone Number
                  </label>

                  <div
                    className={`flex items-center border-2 rounded-lg px-3 pt-4 pb-2 gap-2 transition-all duration-200 ${
                      isFocused ? "border-green-700" : "border-green-600"
                    }`}
                  >
                    {(isFocused || phone) && (
                      <>
                        <img
                          src="/loginPageDesign/indianNumber.svg"
                          alt="India"
                          className="w-5 h-5"
                        />
                        <span className="text-gray-800 font-medium">+91</span>
                      </>
                    )}
                    <input
                      id="phone-input"
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="w-full outline-none text-gray-800 placeholder-transparent"
                      placeholder="Phone Number"
                    />
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    We will use this number to validate your account.
                  </p>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-green-600"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  <span className="-mt-0.5">Remember me</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="roboto-font w-full bg-[#068F36] hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  {loading ? "Sending..." : "Log In"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Don’t have an account?{" "}
                  <a
                    href="/register"
                    className="text-blue-500 font-medium hover:underline"
                  >
                    Register Now
                  </a>
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center">
                  <div className="flex justify-center">
                    <KeyRound size={28} className="text-green-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 mt-2">
                    OTP Verification
                  </h2>
                  <p className="text-sm text-gray-600">
                    We have sent a 6-digit code to +91-
                    {phone.replace(/(\d{5})(\d{5})/, "$1-$2")}
                  </p>
                </div>

                <div className="flex justify-between gap-2">
                  {otpInputs.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className="w-10 h-12 text-center border border-gray-300 rounded-md text-lg font-bold focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="roboto-font w-full bg-[#068F36] hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                {/* ✅ Add resend OTP section here */}
                <p className="text-center text-sm text-gray-600 mt-2">
                  Haven't received any OTP yet?{" "}
                  {resendTimer > 0 ? (
                    <span className="text-gray-500">
                      Resend in {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#448BD1] font-medium hover:underline disabled:opacity-50"
                      disabled={resending}
                    >
                      {resending ? "Resending..." : "Resend it"}
                    </button>
                  )}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
