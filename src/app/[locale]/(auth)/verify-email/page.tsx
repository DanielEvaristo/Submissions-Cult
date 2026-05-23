"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const from = searchParams.get("from");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [resendMsg, setResendMsg] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 5) {
      inputs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...code];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] ?? "";
    }
    setCode(next);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Please enter all 6 digits.");
      return;
    }

    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code: fullCode }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      if (data.error === "CODE_EXPIRED") {
        setError("Your code expired. Click below to request a new one.");
      } else {
        setError(data.error ?? "Invalid code. Try again.");
      }
      return;
    }

    window.location.href = from === "profile"
      ? `/${locale}/portal/profile?verified=1`
      : `/${locale}/login?verified=1`;
  };

  const handleResend = async () => {
    setResendMsg("");
    setError("");
    setResending(true);

    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setResending(false);

    if (res.ok) {
      setResendMsg("A new code has been sent to your email.");
      setCode(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } else {
      setResendMsg("Failed to send. Try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Left: Brand */}
      <div className="w-full md:w-1/2 bg-black flex flex-col justify-between p-8 md:p-12 relative overflow-hidden min-h-[40vh] md:min-h-screen">
        <div className="relative z-10">
          <Link href={`/${locale}/landing`} className="flex items-center gap-2 text-white hover:text-cult-yellow transition-colors">
            <span className="text-2xl md:text-3xl">★</span>
            <span className="font-black text-xl md:text-2xl tracking-tighter">CULT MACHINE</span>
          </Link>
        </div>
        <div className="relative z-10 mt-12 md:mt-auto">
          <h1 className="text-white text-[clamp(40px,10vw,100px)] font-black uppercase leading-[0.85] tracking-tighter mb-6">
            CHECK<br />
            YOUR<br />
            <span className="text-cult-yellow">INBOX.</span>
          </h1>
          <p className="text-[#999999] font-black uppercase text-[10px] md:text-xs tracking-[0.4em]">
            6-digit verification code
          </p>
        </div>
        <div className="absolute -right-20 -bottom-20 text-white/5 font-black text-[200px] md:text-[300px] leading-none select-none pointer-events-none">
          ★
        </div>
      </div>

      {/* Right: OTP Form */}
      <div className="w-full md:w-1/2 bg-black flex flex-col justify-center px-6 py-16 md:px-24 relative">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-white">
              Verify<br />Your Email
            </h2>
            <p className="text-white/40 font-black uppercase text-[10px] tracking-[0.3em]">
              We sent a 6-digit code to
            </p>
            <p className="text-cult-yellow font-black text-sm tracking-wide mt-1 break-all">
              {email || "your email"}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* OTP Inputs */}
            <div className="flex gap-3 mb-10" onPaste={handlePaste}>
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-full aspect-square bg-black border-2 border-white/10 text-center text-2xl font-black text-white focus:border-cult-yellow focus:bg-cult-yellow/5 transition-all outline-none"
                  style={{ caretColor: "#F5E000" }}
                />
              ))}
            </div>

            {error && (
              <div className="mb-6 p-4 border-4 border-red-500 bg-red-500/10 text-red-400 font-black uppercase text-[10px] tracking-[0.2em]">
                {error}
              </div>
            )}

            {resendMsg && (
              <div className="mb-6 p-4 border-4 border-cult-yellow bg-cult-yellow/10 text-cult-yellow font-black uppercase text-[10px] tracking-[0.2em]">
                {resendMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-cult-yellow text-black border-4 border-cult-yellow font-black text-xs uppercase tracking-[0.4em] hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 disabled:opacity-50"
            >
              {loading ? <Loader2 size={20} className="animate-spin mx-auto" strokeWidth={3} /> : "VERIFY MY ACCOUNT →"}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t-2 border-white/5 space-y-4">
            <p className="font-black uppercase text-[10px] tracking-[0.2em] text-white/30">
              Didn&apos;t receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="font-black uppercase text-[10px] tracking-[0.2em] text-cult-yellow hover:text-white transition-colors underline underline-offset-4 decoration-2 disabled:opacity-50"
            >
              {resending ? "Sending..." : "RESEND CODE →"}
            </button>
            <div>
              <Link
                href={`/${locale}/login`}
                className="font-black uppercase text-[10px] tracking-[0.2em] text-white/20 hover:text-white transition-colors"
              >
                ← Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
