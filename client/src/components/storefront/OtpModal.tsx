import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useCustomer } from "@/context/CustomerContext";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Lottie from "lottie-react";
import fishAnimation from "@assets/fish_1776404909449.json";
import flagImg from "@assets/flag_(1)_1776403319572.png";
import { FishTokriLogo } from "@/components/storefront/FishTokriLogo";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

interface OtpModalProps {
  open: boolean;
  onClose: () => void;
}

export function OtpModal({ open, onClose }: OtpModalProps) {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const { toast } = useToast();
  const { refetch } = useCustomer();
  const [, navigate] = useLocation();

  const phoneRef = useRef<HTMLInputElement>(null);
  const o0 = useRef<HTMLInputElement>(null);
  const o1 = useRef<HTMLInputElement>(null);
  const o2 = useRef<HTMLInputElement>(null);
  const o3 = useRef<HTMLInputElement>(null);
  const otpRefs = [o0, o1, o2, o3];

  useEffect(() => {
    if (open) {
      setPhone("");
      setOtpSent(false);
      setOtp(["", "", "", ""]);
      setTimeout(() => phoneRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    if (otpSent) {
      setTimeout(() => otpRefs[0].current?.focus(), 350);
    }
  }, [otpSent]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
  };

  const handlePhoneSubmit = async () => {
    if (phone.length !== 10) {
      toast({ title: "Enter a valid 10-digit phone number", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customer/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to send OTP");
      }
      setOtpSent(true);
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (text.length === 4) {
      e.preventDefault();
      setOtp(text.split(""));
      otpRefs[3].current?.focus();
    }
  };

  const handleOtpSubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 4) {
      toast({ title: "Enter the 4-digit OTP", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      refetch();
      onClose();
      navigate("/profile");
      toast({ title: "Welcome to FishTokri! 🐟" });
    } catch (err: any) {
      toast({ title: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const digitCount = phone.length;
  const isFull = digitCount === 10;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[420px] p-0 overflow-y-auto border-0 shadow-2xl bg-white flex flex-col"
        data-testid="auth-sheet"
      >
        <div className="flex flex-col flex-1 px-7 pt-10 pb-8">
          {/* Logo + Hero */}
          <div className="flex flex-col items-center mb-8">
            <FishTokriLogo className="h-10 w-auto mb-1" />
            <div className="w-24 h-24">
              <Lottie animationData={fishAnimation} loop autoplay />
            </div>
            <h2 className="text-[22px] font-bold text-slate-800 text-center leading-snug mt-1">
              Welcome!{" "}
              <span style={{ color: "#364F9F" }}>Fresh seafood & meat</span>
              <br />at your doorstep
            </h2>
            <p className="text-sm text-slate-400 mt-2 text-center">
              Enter your mobile number to continue
            </p>
          </div>

          {/* Phone Input */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Mobile Number
            </label>

            <div
              className="flex items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-all duration-200"
              style={{
                borderColor: focused ? "#364F9F" : isFull ? "#364F9F88" : "#e2e8f0",
                background: focused ? "#364F9F08" : "#f8fafc",
              }}
            >
              {/* Flag + code */}
              <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-slate-200">
                <img src={flagImg} alt="India" className="w-5 h-5 rounded-full object-cover" />
                <span className="text-sm font-bold text-slate-700">+91</span>
              </div>

              {/* Single input with animated digit bubbles overlay */}
              <div className="relative flex-1">
                <input
                  ref={phoneRef}
                  type="tel"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="0000000000"
                  disabled={otpSent}
                  className="w-full bg-transparent outline-none text-lg font-bold tracking-[0.18em] text-slate-800 placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal disabled:opacity-60"
                  data-testid="input-phone"
                  style={{ caretColor: "#364F9F" }}
                />
                {/* Animated digit progress dots */}
                <div className="flex gap-[3px] mt-1.5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        width: i < digitCount ? 14 : 6,
                        backgroundColor: i < digitCount ? "#364F9F" : "#cbd5e1",
                        scaleY: i === digitCount - 1 ? [1, 1.6, 1] : 1,
                      }}
                      transition={{
                        duration: 0.25,
                        ease: "easeOut",
                        scaleY: { duration: 0.2 },
                      }}
                      className="h-[3px] rounded-full"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Get OTP button */}
          <AnimatePresence>
            {!otpSent && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={handlePhoneSubmit}
                  disabled={loading || !isFull}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #364F9F 0%, #2a3d80 100%)" }}
                  data-testid="button-send-otp"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending OTP...
                    </span>
                  ) : "Get My OTP →"}
                </button>

                <p className="text-[11px] text-center text-slate-400 mt-3">
                  By continuing, you agree to our{" "}
                  <span className="underline cursor-pointer" style={{ color: "#364F9F" }}>Terms</span>
                  {" & "}
                  <span className="underline cursor-pointer" style={{ color: "#364F9F" }}>Privacy Policy</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Section — slides in below */}
          <AnimatePresence>
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-slate-100" />
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg, #364F9F18, #364F9F30)" }}
                  >
                    <ShieldCheck className="w-5 h-5" style={{ color: "#364F9F" }} />
                  </div>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <div className="mb-4 text-center">
                  <h3 className="text-lg font-bold text-slate-800">Verify it's you!</h3>
                  <p className="text-sm text-slate-400 mt-0.5">
                    Code sent to{" "}
                    <span className="font-semibold text-slate-700">+91 {phone}</span>
                  </p>
                </div>

                {/* OTP Boxes */}
                <div className="flex gap-3 justify-center mb-5">
                  {otpRefs.map((ref, i) => (
                    <motion.input
                      key={i}
                      ref={ref}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i]}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onPaste={handleOtpPaste}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: i * 0.07, duration: 0.2, ease: "backOut" }}
                      whileFocus={{ scale: 1.08 }}
                      className="w-[60px] h-[60px] text-center text-2xl font-bold border-2 rounded-2xl outline-none transition-colors"
                      style={{
                        borderColor: otp[i] ? "#364F9F" : "#e2e8f0",
                        background: otp[i] ? "#364F9F0A" : "#f8fafc",
                        color: "#1e293b",
                      }}
                      data-testid={`input-otp-digit-${i}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleOtpSubmit}
                  disabled={loading || otp.join("").length !== 4}
                  className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  style={{ background: "linear-gradient(135deg, #364F9F 0%, #2a3d80 100%)" }}
                  data-testid="button-verify-otp"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Verifying...
                    </span>
                  ) : "Verify & Dive In 🐟"}
                </button>

                <div className="flex items-center justify-between mt-4">
                  <button
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => { setOtpSent(false); setOtp(["", "", "", ""]); }}
                    data-testid="button-back-to-phone"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change number
                  </button>
                  <p className="text-[11px] text-slate-400">
                    Didn't get it?{" "}
                    <span
                      className="font-semibold cursor-pointer"
                      style={{ color: "#F05B4E" }}
                      onClick={handlePhoneSubmit}
                    >
                      Resend
                    </span>
                  </p>
                </div>

                <p className="text-[11px] text-center text-slate-400 mt-3">
                  Test OTP: <span className="font-bold text-slate-600">1234</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </SheetContent>
    </Sheet>
  );
}
