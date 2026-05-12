"use client";

import { useState, useEffect } from "react";
import { ArrowRight, History, CreditCard, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";

const PACKS = [
  { id: "pack_5", credits: 5, price: 4, label: "Starter Pack" },
  { id: "pack_10", credits: 10, price: 7, label: "Popular Pack", featured: true },
  { id: "pack_20", credits: 20, price: 12, label: "Pro Pack" },
] as const;

type Transaction = {
  id: string;
  type: string;
  credits: number;
  amount: number;
  createdAt: string;
};

export default function CreditsPage() {
  const { data: session, update } = useSession();
  const { locale } = useParams<{ locale: string }>();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dbCredits, setDbCredits] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const refreshData = async () => {
    try {
      const [txRes, balRes] = await Promise.all([
        fetch("/api/transactions"),
        fetch("/api/user/balance"),
      ]);

      if (txRes.ok) setTransactions((await txRes.json()) as Transaction[]);
      if (balRes.ok) {
        const balData = (await balRes.json()) as { credits: number };
        setDbCredits(balData.credits);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("success") === "true") {
      setIsUpdating(true);
      setTimeout(async () => {
        await refreshData();
        await update();
        setIsUpdating(false);
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("success");
        window.history.replaceState({}, "", newUrl.toString());
      }, 2000);
    }
  }, [update]);

  const handlePurchase = async (pack: (typeof PACKS)[number]) => {
    setLoading(pack.id);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "credits",
          packId: pack.id,
          successUrl: `${window.location.origin}/${locale}/portal/credits?success=true`,
          cancelUrl: `${window.location.origin}/${locale}/portal/credits?canceled=true`,
        }),
      });

      const data = (await res.json()) as { error?: string; url?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Purchase error:", err);
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-12 space-y-16 animate-reveal">
      <div className="border-b-4 border-white/10 pb-8">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4 block">MONETISATION_CORE</span>
        <h1 className="font-sans text-6xl font-black text-white tracking-tighter uppercase leading-[0.85]">
          CREDIT<br/>RESERVE.
        </h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border-2 border-red-500 p-4 text-red-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
          ERROR: {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`border-4 border-white/10 p-10 flex flex-col transition-all duration-300 ${
              (("featured" in pack && pack.featured) ? "bg-[#F5E000] text-black shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)] -translate-y-2 border-black" : "bg-black text-white shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)]")
            }`}
          >
            <p className="font-sans text-[10px] font-black uppercase tracking-widest mb-2">{pack.label}</p>
            <div className="flex items-baseline gap-2 mb-10">
              <span className="text-6xl font-black tracking-tighter">{pack.credits}</span>
              <span className="text-xl font-black uppercase tracking-tighter">CREDITS</span>
            </div>

            <div className="mt-auto pt-10 border-t-2 border-black/10">
              <div className="flex items-end justify-between mb-8">
                <span className="text-sm font-black opacity-40">TOTAL COST</span>
                <span className="text-4xl font-black">${pack.price} <span className="text-sm">USD</span></span>
              </div>
              <button
                onClick={() => handlePurchase(pack)}
                disabled={!!loading}
                className={`w-full py-5 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                  (("featured" in pack && pack.featured) ? "bg-black text-white hover:bg-white hover:text-black" : "bg-[#F5E000] text-black hover:bg-white")
                } disabled:opacity-50`}
              >
                {loading === pack.id ? "PROCESSING..." : "PURCHASE"} <ArrowRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="border-4 border-white/10 p-10 bg-black text-white shadow-[8px_8px_0px_0px_rgba(245,224,0,0.05)] relative overflow-hidden">
          {isUpdating && (
            <div className="absolute inset-0 bg-black/60 z-10 flex flex-col items-center justify-center backdrop-blur-sm">
              <Loader2 className="text-[#F5E000] animate-spin mb-4" size={32} />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F5E000]">Syncing Balance...</p>
            </div>
          )}
          <div className="flex items-center gap-4 mb-8 border-b-2 border-white/20 pb-4">
            <CreditCard className="text-[#F5E000]" size={24} />
            <h3 className="text-xl font-black uppercase tracking-tighter">CURRENT WALLET</h3>
          </div>
          <div className="flex items-baseline gap-4 mb-10">
            <span className="text-8xl font-black tracking-tighter text-[#F5E000]">{dbCredits ?? session?.user?.credits ?? 0}</span>
            <span className="text-sm font-black uppercase tracking-widest opacity-40">AVAILABLE CREDITS</span>
          </div>
          <div className="p-6 bg-white/5 border-2 border-white/10 space-y-4">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span>ESTIMATED VALUE</span>
              <span className="text-[#F5E000]">~${((dbCredits ?? session?.user?.credits ?? 0) * 0.7).toFixed(2)} USD</span>
            </div>
          </div>
        </div>

        <div className="border-4 border-white/10 p-10 bg-black text-white shadow-[8px_8px_0px_0px_rgba(245,224,0,0.05)]">
          <div className="flex items-center gap-4 mb-8 border-b-2 border-white/10 pb-4 text-[#F5E000]">
            <History size={24} />
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">TRANSACTION LOG</h3>
          </div>
          <div className="space-y-4">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-4 border-b border-white/10 group hover:bg-white/5 px-2 transition-colors">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">{tx.type}</p>
                    <p className="text-[8px] font-bold opacity-30 uppercase tracking-[0.2em]">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${tx.type === "PURCHASE" ? "text-[#00FF00]" : "text-[#FF0000]"}`}>
                      {tx.type === "PURCHASE" ? "+" : "-"}{tx.credits} CRD
                    </p>
                    <p className="text-[8px] font-bold opacity-30 uppercase tracking-widest">${(tx.amount / 100).toFixed(2)} USD</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-between py-4 border-b border-black/5 opacity-40">
                <span className="font-sans text-[10px] font-black uppercase tracking-widest italic text-center w-full py-10">
                  NO RECENT ACTIVITY RECORDED
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
