"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, X, Loader2, CheckCircle2 } from "lucide-react";
import { usePathname } from "next/navigation";

export default function BugReportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-bug-report", handleOpen);
    return () => window.removeEventListener("open-bug-report", handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          url: pathname,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit bug report");
      }

      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setDescription("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-reveal">
          <div className="bg-black border-4 border-white/10 p-8 w-full max-w-md relative shadow-[16px_16px_0px_0px_rgba(255,255,255,0.05)]">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3">
              <AlertTriangle className="text-red-500" />
              REPORT A BUG
            </h2>
            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-8">
              Help us improve Cult Machine.
            </p>

            {success ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 size={48} className="text-[#00FF00] mb-4" />
                <p className="font-black text-sm uppercase tracking-widest text-[#00FF00]">REPORT RECEIVED</p>
                <p className="text-xs font-bold text-white/50 mt-2">Thank you! Our engineers will look into it.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">
                    WHAT WENT WRONG?
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue you encountered..."
                    className="w-full bg-white/5 border-2 border-white/10 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors h-32 resize-none text-sm font-bold"
                  />
                </div>

                {error && (
                  <p className="text-xs font-bold text-red-500 uppercase tracking-widest">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !description.trim()}
                  className="w-full py-4 bg-white text-black font-black text-xs uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed border-2 border-transparent"
                >
                  {loading ? (
                    <Loader2 size={18} className="animate-spin mx-auto" />
                  ) : (
                    "SUBMIT REPORT"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
