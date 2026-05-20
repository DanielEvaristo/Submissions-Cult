"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Loader2,
  Music,
  CheckCircle2,
  AlertCircle,
  Zap,
  Edit3,
  Mic,
  FileText,
  Heart,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";

export interface ManagedArtistRef {
  id: string;
  artistName: string;
}

type SubmissionType = "SINGLE" | "EP" | "ALBUM";
type Channel = "RADAR" | "INTERNET_WAVE" | "SPOTIFY_PLAYLIST" | "STORIES";
type PremiumService = "INTERVIEW" | "ARTICLE";

interface FormData {
  managedArtistId: string;
  streamingUrl: string;
  trackTitle: string;
  artistName: string;
  genre: string;
  subgenre: string;
  instagram: string;
  email: string;
  submissionType: SubmissionType | "";
  channels: Channel[];
  applyAllChannels: boolean;
  fastTrack: boolean;
  reviewRequested: boolean;
  premiumServices: PremiumService[];
  password?: string;
  autoFilledTitle?: string;
  autoFilledArtist?: string;
  autoFilledCover?: string;
  autoFillSource?: string;
  streamingPlatform?: string;
}

const INITIAL: FormData = {
  managedArtistId: "",
  streamingUrl: "",
  trackTitle: "",
  artistName: "",
  genre: "",
  subgenre: "",
  instagram: "",
  email: "",
  submissionType: "",
  channels: [],
  applyAllChannels: false,
  fastTrack: false,
  reviewRequested: false,
  premiumServices: [],
};

import { GENRES } from "@/lib/genres";

interface SubmitFlowV2Props {
  managedArtists?: ManagedArtistRef[];
  basePath: string;
}

export default function SubmitFlowV2({ managedArtists, basePath }: SubmitFlowV2Props) {
  const locale = useLocale();
  const router = useRouter();
  const { data: session } = useSession();

  const hasManagedArtists = Array.isArray(managedArtists) && managedArtists.length > 0;
  
  const [step, setStep] = useState(hasManagedArtists ? 0 : 1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Donation / Intent Modals
  const [showDonationPrompt, setShowDonationPrompt] = useState(false);
  const [includeDonation, setIncludeDonation] = useState(false);
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [pendingNavigationUrl, setPendingNavigationUrl] = useState<string | null>(null);
  const [draftRecovered, setDraftRecovered] = useState(false);
  const [retentionDiscountApplied, setRetentionDiscountApplied] = useState(false);
  const [retentionOfferEligible, setRetentionOfferEligible] = useState(true);

  const [fetchingInfo, setFetchingInfo] = useState(false);
  const allowImmediateNavigationRef = useRef(false);

  // Submission-guard state
  const [showRejectedConfirm, setShowRejectedConfirm] = useState(false);
  const [showActiveBlockModal, setShowActiveBlockModal] = useState(false);
  const [forceResubmit, setForceResubmit] = useState(false);

  const handleAutoFill = async () => {
    if (!form.streamingUrl.trim()) return;
    setFetchingInfo(true);
    try {
      const res = await fetch(`/api/track-info?url=${encodeURIComponent(form.streamingUrl)}`);
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setForm((prev) => ({
        ...prev,
        trackTitle: data.title || prev.trackTitle,
        artistName: data.artist || prev.artistName,
        autoFilledTitle: data.title || "",
        autoFilledArtist: data.artist || "",
        autoFilledCover: data.cover || "",
        autoFillSource: data.source || "",
        streamingPlatform: data.platform || "",
        submissionType: data.type || prev.submissionType,
      }));
    } catch {
    } finally {
      setFetchingInfo(false);
    }
  };

  // Pre-fill session data
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        instagram: session.user.instagram || prev.instagram,
        genre: session.user.genre || prev.genre,
        subgenre: session.user.subgenre || prev.subgenre,
      }));
    }
  }, [session]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Pricing Logic
  const baseCredits = form.submissionType === "ALBUM" ? 2 : form.submissionType === "EP" ? 1 : 0;
  const channelCredits = form.applyAllChannels ? 1 : 0;
  const fastTrackCredits = form.fastTrack ? 1 : 0;
  const reviewCredits = form.reviewRequested ? 1 : 0;
  
  const totalCreditsNeeded = baseCredits + channelCredits + fastTrackCredits + reviewCredits;
  
  const interviewCost = form.premiumServices.includes("INTERVIEW") ? 30 : 0;
  const articleCost = form.premiumServices.includes("ARTICLE") ? 25 : 0;
  const totalUsdNeeded = interviewCost + articleCost;
  const [dbCredits, setDbCredits] = useState<number | null>(null);
  
  useEffect(() => {
    fetch("/api/user/balance")
      .then(res => res.json())
      .then(data => setDbCredits(data.credits))
      .catch(err => console.error("Balance fetch error:", err));

    fetch("/api/user/access")
      .then(res => res.json())
      .then(data => setRetentionOfferEligible(data.retentionOfferEligible !== false))
      .catch(err => console.error("Retention offer fetch error:", err));
  }, []);

  const currentCredits = dbCredits ?? session?.user?.credits ?? 0;
  const isFreeFlow = totalCreditsNeeded === 0 && totalUsdNeeded === 0;
  const hasEnoughCredits = currentCredits >= totalCreditsNeeded;
  const canPayWithCredits = totalCreditsNeeded > 0 && hasEnoughCredits;

  const getCreditUsdValue = (credits: number) => {
    if (credits <= 0) return 0;
    if (credits === 1) return 1;
    if (credits >= 20) return 12; // 20 credits = $12
    if (credits >= 10) return 7;  // 10 credits = $7
    if (credits >= 5) return 4;   // 5 credits = $4
    return credits; // 2, 3, 4 = $2, $3, $4
  };

  const creditUsdTotal = getCreditUsdValue(totalCreditsNeeded);


  const draftStorageKey = `submit-flow-draft:${basePath}:${locale}`;
  const discountedCreditUsdTotal = retentionDiscountApplied ? getCreditUsdValue(totalCreditsNeeded) * 0.5 : creditUsdTotal;
  const finalDisplayUsd = discountedCreditUsdTotal + totalUsdNeeded;
  const hasPricedSelections = totalCreditsNeeded > 0 || totalUsdNeeded > 0 || includeDonation;
  const hasDraftContent =
    !!form.streamingUrl ||
    !!form.trackTitle ||
    !!form.artistName ||
    !!form.genre ||
    !!form.subgenre ||
    !!form.email ||
    form.channels.length > 0 ||
    form.applyAllChannels ||
    form.fastTrack ||
    form.reviewRequested ||
    form.premiumServices.length > 0 ||
    includeDonation;
  const shouldWarnOnExit = !submitted && !loading && step >= 6 && hasPricedSelections && !retentionDiscountApplied;
  const canShowRetentionOffer = retentionOfferEligible && totalCreditsNeeded > 0;

  const isQualifiedForPremium = 
    (session?.user?.accountType === "INDUSTRY") || 
    (
      !!session?.user?.monthlyListeners && 
      !["UNDER_1K", "FROM_1K_TO_10K"].includes(session.user.monthlyListeners) &&
      !!session?.user?.instagramFollowers &&
      !["UNDER_1K", "FROM_1K_TO_10K"].includes(session.user.instagramFollowers)
    );

  const canNext = () => {
    if (step === 0) return !!form.managedArtistId;
    if (step === 1) {
      const hasBasicInfo = !!form.streamingUrl && !!form.trackTitle && !!form.artistName && !!form.genre && !!form.subgenre;
      // Instagram is required for anonymous users, but for logged in users we use session data
      const hasInstagram = !!session?.user?.instagram || !!form.instagram;
      return hasBasicInfo && hasInstagram && (!!session || !!form.email);
    }
    if (step === 2) return !!form.submissionType;
    if (step === 3) return form.channels.length > 0 || form.applyAllChannels;
    if (step === 4) return true; // Upsells are optional
    if (step === 5) return true; // Premium are optional
    if (step === 6) return true; // Summary
    if (step === 7) return true; // Credit Packs / Checkout
    if (step === 10) return !!form.password && form.password.length >= 6;
    return true;
  };

  useEffect(() => {
    const savedDraft = window.sessionStorage.getItem(draftStorageKey);
    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft) as { form: FormData; step: number; includeDonation: boolean; retentionDiscountApplied?: boolean };
      setForm((prev) => ({ ...prev, ...parsed.form }));
      setStep(parsed.step);
      setIncludeDonation(!!parsed.includeDonation);
      setRetentionDiscountApplied(!!parsed.retentionDiscountApplied);
      setDraftRecovered(true);
    } catch {
      window.sessionStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (!hasDraftContent) {
      window.sessionStorage.removeItem(draftStorageKey);
      return;
    }

    window.sessionStorage.setItem(
      draftStorageKey,
      JSON.stringify({ form, step, includeDonation, retentionDiscountApplied })
    );
  }, [draftStorageKey, form, step, includeDonation, retentionDiscountApplied, hasDraftContent]);

  useEffect(() => {
    if (!draftRecovered) return;

    const timeout = window.setTimeout(() => setDraftRecovered(false), 4000);
    return () => window.clearTimeout(timeout);
  }, [draftRecovered]);

  useEffect(() => {
    if (!submitted) return;
    window.sessionStorage.removeItem(draftStorageKey);
  }, [draftStorageKey, submitted]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!shouldWarnOnExit) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [shouldWarnOnExit]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!shouldWarnOnExit || allowImmediateNavigationRef.current) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!anchor.href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const nextUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSameUrl =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash === currentUrl.hash;

      if (isSameUrl) return;

      event.preventDefault();
      setPendingNavigationUrl(nextUrl.toString());
      setShowExitIntent(true);
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [shouldWarnOnExit]);

  useEffect(() => {
    if (!window.history.state?.submitGuard) {
      window.history.pushState({ submitGuard: true }, "", window.location.href);
    }

    const handlePopState = () => {
      if (allowImmediateNavigationRef.current) {
        allowImmediateNavigationRef.current = false;
        return;
      }

      if (!shouldWarnOnExit) {
        allowImmediateNavigationRef.current = true;
        window.history.back();
        return;
      }

      // If we blocked it, push the state back so we can block again
      window.history.pushState({ submitGuard: true }, "", window.location.href);
      setPendingNavigationUrl("__BACK__");
      setShowExitIntent(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [shouldWarnOnExit]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("success") !== "true") return;

    const finalizeReturn = async () => {
      const pendingEmail = window.sessionStorage.getItem("pending-submit-email");
      const pendingPassword = window.sessionStorage.getItem("pending-submit-password");

      if (!session && pendingEmail && pendingPassword) {
        await signIn("credentials", {
          redirect: false,
          email: pendingEmail,
          password: pendingPassword,
        });
      }

      window.sessionStorage.removeItem("pending-submit-email");
      window.sessionStorage.removeItem("pending-submit-password");
      window.sessionStorage.removeItem(draftStorageKey);
      setForm(INITIAL);
      setStep(hasManagedArtists ? 0 : 1);
      setIncludeDonation(false);
      setRetentionDiscountApplied(false);
      setSubmitted(true);
    };

    void finalizeReturn();
  }, [session]);

  const handleNext = () => {
    if (step === 6) { // Leaving Checkout
      if (isFreeFlow && !showDonationPrompt && !includeDonation) {
        setShowDonationPrompt(true);
        return;
      }
      if (!session) {
        setStep(10); // Go to registration
      } else {
        handleSubmit();
      }
    } else if (step === 4 && !isQualifiedForPremium) {
      setStep(6);
    } else if (step === 10) {
      handleSubmit();
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (step === (hasManagedArtists ? 0 : 1)) {
      router.back();
    } else if (step === 10) {
      setStep(6);
    } else if (step === 6 && !isQualifiedForPremium) {
      setStep(4);
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  };

  const handleConfirmedExit = () => {
    setShowExitIntent(false);

    if (!pendingNavigationUrl) return;

    if (pendingNavigationUrl == "__BACK__") {
      allowImmediateNavigationRef.current = true;
      window.history.back();
    } else {
      allowImmediateNavigationRef.current = true;
      window.location.href = pendingNavigationUrl;
    }
  };

  const handleApplyRetentionDiscount = () => {
    if (!canShowRetentionOffer) return;
    setRetentionDiscountApplied(true);
    setPendingNavigationUrl(null);
    setShowExitIntent(false);
  };

  const handleSwitchToFreeSong = () => {
    setRetentionDiscountApplied(false);
    setIncludeDonation(false);
    setShowExitIntent(false);
    setPendingNavigationUrl(null);
    setForm((prev) => ({
      ...prev,
      submissionType: "SINGLE",
      applyAllChannels: false,
      channels: prev.channels.length > 0 ? [prev.channels[0]] : ["RADAR"],
      fastTrack: false,
      reviewRequested: false,
      premiumServices: [],
    }));
  };



  const handleSubmit = async (forceResubmitOverride = false) => {
    console.log("[SUBMIT] Starting submission process...", { step, isFreeFlow, totalCreditsNeeded });
    setLoading(true);
    setError("");

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payload: any = {
        streamingUrl: form.streamingUrl,
        trackTitle: form.trackTitle,
        artistName: form.artistName,
        genre: form.genre,
        subgenre: form.subgenre || null,
        releaseType: form.submissionType,
        channels: form.applyAllChannels ? ["RADAR", "INTERNET_WAVE", "SPOTIFY_PLAYLIST", "STORIES"] : form.channels,
        fastTrack: form.fastTrack,
        reviewRequested: form.reviewRequested,
        premiumServices: form.premiumServices,
        email: form.email,
        password: form.password,
        instagram: form.instagram || session?.user?.instagram,
        forceResubmit: forceResubmit || forceResubmitOverride,
      };

      if (session && hasManagedArtists && form.managedArtistId) {
        payload.managedArtistId = form.managedArtistId;
      }
      
      // Use credits if available
      if (canPayWithCredits) {
        payload.useCredits = true;
        payload.creditsToDeduct = totalCreditsNeeded;
      }

      // 1. Create the submission
      const endpoint = session ? "/api/submissions" : "/api/submissions/anonymous";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        // Handle specific business-rule errors with readable messages
        if (data.error === "BAND_ALREADY_REGISTERED") {
          setError(data.details || "This artist/band name is already registered to another account. Contact support.");
          setLoading(false);
          return;
        }
        if (data.error === "ARTIST_NAME_MISMATCH") {
          setError(data.details || "You can only submit tracks under your registered artist name.");
          setLoading(false);
          return;
        }
        if (data.error === "TRACK_PREVIOUSLY_REJECTED") {
          setLoading(false);
          setShowRejectedConfirm(true);
          return;
        }
        if (data.error === "TRACK_ALREADY_ACTIVE") {
          setLoading(false);
          setShowActiveBlockModal(true);
          return;
        }
        setError(data.error ?? "Failed to create submission");
        setLoading(false);
        return;
      }

      const submissionId = data.id;

      // 2. Determine items for checkout
      const items = [];
      
      if (totalCreditsNeeded > 0 && !canPayWithCredits) {
        items.push({ 
          name: `${totalCreditsNeeded} SUBMISSION CREDITS`, 
          priceCents: Math.round(discountedCreditUsdTotal * 100) 
        });
      }

      if (form.premiumServices.includes("INTERVIEW")) {
        items.push({ name: "EXCLUSIVE INTERVIEW", priceCents: 3000 });
      }
      if (form.premiumServices.includes("ARTICLE")) {
        items.push({ name: "DEDICATED ARTICLE", priceCents: 2500 });
      }

      // If it's a donation
      if (includeDonation) {
        items.push({ name: "SUPPORT THE CULT (DONATION)", priceCents: 500 });
      }

      // 3. Checkout or Success
      if (items.length > 0) {
        if (!session && form.email && form.password) {
          window.sessionStorage.setItem("pending-submit-email", form.email);
          window.sessionStorage.setItem("pending-submit-password", form.password);
        }

        const checkoutRes = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "submission",
            submissionId,
            donation: includeDonation,
            retentionDiscountApplied,
            email: form.email || session?.user?.email,
            successUrl: `${window.location.origin}${window.location.pathname}?success=true`,
            cancelUrl: `${window.location.origin}${window.location.pathname}?canceled=true`,
          }),
        });
        const checkoutData = await checkoutRes.json();
        
        if (!checkoutRes.ok) {
          setError(checkoutData.error || "Payment system unavailable. Please try again.");
          setLoading(false);
          return;
        }

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        } else {
          setError("Could not initialize payment session.");
          setLoading(false);
          return;
        }
      }

      // If free, just sign in if anonymous and show success
      if (!session && form.email && form.password) {
        await signIn("credentials", { redirect: false, email: form.email, password: form.password });
      }
      window.sessionStorage.removeItem(draftStorageKey);
      setForm(INITIAL);
      setStep(hasManagedArtists ? 0 : 1);
      setIncludeDonation(false);
      setRetentionDiscountApplied(false);
      setLoading(false);
      setSubmitted(true);
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  };

  // Renders

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-reveal">
        <div className="w-20 h-20 bg-[#00FF00] border-4 border-black flex items-center justify-center mb-10">
          <CheckCircle2 size={40} className="text-black" />
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4 text-center">SUBMITTED.</h1>
        <button onClick={() => router.push(`/${locale}${basePath}`)} className="btn-primary mt-8">VIEW DASHBOARD</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 animate-reveal relative">
      
      {/* ── HEADER ── */}
      <div className="mb-12 border-b-4 border-white/20 pb-8">
        <h2 className="text-[#F5E000] text-sm font-black uppercase tracking-[0.3em] mb-4">CULT MACHINE</h2>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
            {step === 0 && "SELECT ARTIST"}
            {step === 1 && "TRACK DETAILS"}
            {step === 2 && "RELEASE TYPE"}
            {step === 3 && "DISTRIBUTION CHANNELS"}
            {step === 4 && "CULT UPSELLS"}
            {step === 5 && "PREMIUM PR"}
            {step === 6 && "CHECKOUT SUMMARY"}
            {step === 7 && "BUY CREDITS"}
            {step === 10 && "SECURE ACCOUNT"}
          </h1>

          <div className="md:text-right">
            {isFreeFlow ? (
              <span className="text-[#00FF00] font-black uppercase text-xl tracking-[0.2em] animate-pulse">FREE</span>
            ) : (
              <div className="flex flex-col">
                <span className="text-white font-black uppercase text-2xl tracking-tighter leading-none">
                  {totalCreditsNeeded > 0 && `${totalCreditsNeeded} CREDITS`}
                  {totalUsdNeeded > 0 && (totalCreditsNeeded > 0 ? ` + $${totalUsdNeeded}` : `$${totalUsdNeeded}`)}
                </span>
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">
                  CURRENT TOTAL
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-1 mt-6">
          {(hasManagedArtists ? (isQualifiedForPremium ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4, 6]) : (isQualifiedForPremium ? [1, 2, 3, 4, 5, 6] : [1, 2, 3, 4, 6])).map((n) => (
            <div key={n} className={`h-2 flex-1 border border-white/10 ${n <= step ? "bg-[#F5E000]" : "bg-white/5"}`} />
          ))}
        </div>
      </div>

      {draftRecovered && (
        <div className="mb-8 border-2 border-[#F5E000] bg-[#F5E000]/10 p-4 text-[#F5E000] animate-reveal">
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">Saved Selection Restored</p>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.1em] text-white">
            Your previous credits and add-ons are ready to continue.
          </p>
        </div>
      )}

      {/* ── STEP 0: Select Artist ── */}
      {step === 0 && hasManagedArtists && managedArtists && (
        <div className="space-y-8 animate-reveal">
          <div className="border-4 border-white/10 p-8 bg-black text-white">
            <label className="label" htmlFor="managedArtistId">SELECT ARTIST FROM ROSTER</label>
            <select
              id="managedArtistId"
              className="input text-lg font-bold mt-2"
              value={form.managedArtistId}
              onChange={(e) => {
                set("managedArtistId", e.target.value);
                const selected = managedArtists.find(a => a.id === e.target.value);
                if (selected) set("artistName", selected.artistName);
              }}
            >
              <option value="">— CHOOSE ARTIST —</option>
              {managedArtists.map(artist => (
                <option key={artist.id} value={artist.id}>{artist.artistName.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── STEP 1: Details ── */}
      {step === 1 && (
        <div className="space-y-8 animate-reveal">
          {/* AI Warning */}
          <div className="p-4 border-2 border-[#FF0000] bg-[#FF0000]/10 flex items-start gap-4 shadow-[4px_4px_0px_0px_rgba(255,0,0,0.2)]">
            <AlertCircle size={24} className="text-[#FF0000] shrink-0 mt-1" strokeWidth={3} />
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-[#FF0000] mb-1">NO AI MUSIC</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/80 leading-relaxed">
                WE DO NOT SUPPORT AI-GENERATED ART. ANY TRACK WITH AI PRODUCTION OR AI COVER ART WILL BE IMMEDIATELY REJECTED.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="label">STREAMING URL (SPOTIFY/SC)</label>
                <input type="url" className="input" placeholder="Paste track or album link..." 
                  value={form.streamingUrl} 
                  onChange={(e) => {
                    const url = e.target.value;
                    set("streamingUrl", url);
                                    
                    // Simple URL based auto-detection (refined by API onBlur)
                    if (url.includes("/album/") || url.includes("/sets/")) {
                      set("submissionType", "ALBUM");
                    } else if (url.includes("/track/")) {
                      set("submissionType", "SINGLE");
                    }
                  }} 
                  onBlur={handleAutoFill}
                />
                {fetchingInfo && <p className="text-[10px] font-bold text-cult-yellow animate-pulse mt-2 uppercase tracking-widest text-right">FETCHING METADATA...</p>}
                
                {(form.submissionType === "ALBUM" || form.submissionType === "EP") && (
                  <div className="mt-4 p-4 border-2 border-cult-yellow/20 bg-cult-yellow/5 animate-reveal">
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-black text-cult-yellow uppercase tracking-tight">
                        {form.submissionType} DETECTED (+{form.submissionType === 'ALBUM' ? 2 : 1} CREDITS)
                      </p>
                      <button 
                        onClick={() => {
                          set("streamingUrl", "");
                          set("trackTitle", "");
                          set("artistName", "");
                          set("submissionType", "SINGLE");
                        }}
                        className="text-[10px] font-black text-[#00FF00] underline uppercase tracking-widest hover:text-white transition-colors"
                      >
                        I want to keep it free, send one song instead
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {form.autoFilledCover && (
              <div className="flex items-center gap-6 p-6 border-4 border-black bg-black text-white">
                <img src={form.autoFilledCover} alt="cover" className="w-24 h-24 object-cover border-2 border-white" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-cult-yellow mb-1">FOUND METADATA</p>
                  <p className="text-2xl font-black uppercase tracking-tighter leading-none">{form.autoFilledTitle}</p>
                  <p className="text-sm font-light text-[#999999] mt-2 italic">{form.autoFilledArtist}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {!session && (
                <div>
                  <label className="label">YOUR EMAIL</label>
                  <input type="email" className="input" placeholder="To receive updates..." value={form.email} onChange={(e) => set("email", e.target.value)} />
                </div>
              )}
              <div>
                <label className="label">TRACK TITLE</label>
                <input type="text" className="input" value={form.trackTitle} onChange={(e) => set("trackTitle", e.target.value)} />
              </div>
              <div>
                <label className="label">ARTIST NAME</label>
                <input type="text" className="input" value={form.artistName} onChange={(e) => set("artistName", e.target.value)} />
                {session?.user?.accountType === "ARTIST" &&
                  session.user.artistName &&
                  form.artistName &&
                  form.artistName.trim().toLowerCase() !== (session.user.artistName || "").trim().toLowerCase() && (
                  <div className="mt-3 p-3 border-2 border-[#FF0000] bg-[#FF0000]/10 flex items-start gap-3 animate-reveal">
                    <AlertCircle size={16} className="text-[#FF0000] shrink-0 mt-0.5" strokeWidth={3} />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FF0000] leading-relaxed">
                      Your account is registered as <span className="text-white">&quot;{session.user.artistName}&quot;</span>. You can only submit under your registered name.
                    </p>
                  </div>
                )}
              </div>

              {(!session || !session.user?.instagram) && (
                <div>
                  <label className="label">INSTAGRAM USERNAME</label>
                  <input type="text" className="input" placeholder="@yourhandle" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} />
                </div>
              )}
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <label className="label">MAIN GENRE</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {GENRES.map((g) => (
                  <button key={g} type="button" 
                    onClick={() => {
                      set("genre", g);
                      set("subgenre", "");
                    }}
                    className={`py-3 border-2 border-white/10 text-center font-black uppercase text-[10px] transition-all ${
                      form.genre === g ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-black text-white hover:bg-white/5"
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>
            {form.genre && (
              <div>
                <label className="label">SUBGENRE *</label>
                <input
                  type="text"
                  className="input animate-fade-in"
                  placeholder="e.g. Melodic Techno, Lo-Fi..."
                  value={form.subgenre}
                  onChange={(e) => set("subgenre", e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Submission Type ── */}
      {step === 2 && (
        <div className="space-y-8 animate-reveal">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { type: "SINGLE", credits: 0, desc: "1 Track" },
              { type: "EP", credits: 1, desc: "2-6 Tracks" },
              { type: "ALBUM", credits: 2, desc: "7+ Tracks" }
            ].map((rt) => (
              <button 
                key={rt.type} type="button" 
                onClick={() => set("submissionType", rt.type as SubmissionType)}
                disabled={form.submissionType !== rt.type && form.autoFilledTitle !== ""}
                className={`p-8 border-4 transition-all flex flex-col items-center justify-center gap-4 ${
                  form.submissionType === rt.type ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-black text-white border-white/10 hover:border-white/40"
                } ${form.submissionType !== rt.type && form.autoFilledTitle !== "" ? "opacity-20 cursor-not-allowed" : ""}`}>
                <Music size={40} className={form.submissionType === rt.type ? "text-black" : "text-white/40"} />
                <div className="text-center">
                  <p className="text-2xl font-black uppercase tracking-tighter">{rt.type}</p>
                  <p className="text-xs font-bold opacity-60 uppercase">{rt.desc}</p>
                  <p className="mt-4 font-sans text-xs font-black px-3 py-1 bg-black/10 inline-block uppercase">
                    {rt.credits === 0 ? "FREE" : `+${rt.credits} CREDIT${rt.credits > 1 ? 'S' : ''}`}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {(form.submissionType === "ALBUM" || form.submissionType === "EP") && (
            <div className="text-center pt-4">
              <button 
                onClick={() => {
                  set("submissionType", "SINGLE");
                  set("streamingUrl", "");
                }}
                className="text-white/40 hover:text-cult-yellow text-[10px] font-black uppercase tracking-[0.2em] underline decoration-2 underline-offset-4 transition-all"
              >
                Send only one song instead
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3: Channels ── */}
      {step === 3 && (
        <div className="space-y-8 animate-reveal">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { id: "RADAR", label: "CULT RADAR" },
              { id: "INTERNET_WAVE", label: "INTERNET WAVE" },
              { id: "SPOTIFY_PLAYLIST", label: "SPOTIFY PLAYLISTS" },
              { id: "STORIES", label: "IG/TIKTOK STORIES" }
            ].map((c) => {
              const isActive = form.channels.includes(c.id as Channel) || form.applyAllChannels;
              return (
                <button key={c.id} type="button" 
                  onClick={() => {
                    if (form.applyAllChannels) return;
                    // If free, toggle one.
                    set("channels", form.channels.includes(c.id as Channel) ? [] : [c.id as Channel]);
                  }}
                  className={`p-6 border-4 flex justify-between items-center transition-all ${
                    isActive ? "bg-white text-black border-white" : "bg-black text-white border-white/10 hover:border-white/30"
                  }`}>
                  <span className="text-lg font-black uppercase tracking-widest">{c.label}</span>
                  {isActive && <CheckCircle2 size={24} />}
                </button>
              )
            })}
          </div>

          <button onClick={() => set("applyAllChannels", !form.applyAllChannels)}
            className={`w-full p-6 border-4 font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between ${
              form.applyAllChannels ? "bg-[#00FF00] text-black border-[#00FF00]" : "bg-black text-white border-white/10 hover:border-white"
            }`}>
            <span>APPLY TO ALL CHANNELS</span>
            <span className="bg-black/20 px-4 py-2 text-xs">+1 CREDIT</span>
          </button>
        </div>
      )}

      {/* ── STEP 4: Upsells ── */}
      {step === 4 && (
        <div className="space-y-8 animate-reveal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => set("fastTrack", !form.fastTrack)}
              className={`p-8 border-4 text-left transition-all ${
                form.fastTrack ? "bg-[#FF0000] text-white border-[#FF0000]" : "bg-black text-white border-white/10"
              }`}>
              <Zap size={32} className="mb-4" />
              <p className="text-2xl font-black uppercase tracking-tighter">FAST TRACK 48H</p>
              <p className="text-xs font-bold opacity-60 mt-2">Skip the queue. Guaranteed response.</p>
              <p className="mt-6 font-black text-xs px-3 py-1 bg-white/20 inline-block uppercase">+1 CREDIT</p>
            </button>

            <button onClick={() => set("reviewRequested", !form.reviewRequested)}
              className={`p-8 border-4 text-left transition-all ${
                form.reviewRequested ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-black text-white border-white/10"
              }`}>
              <Edit3 size={32} className="mb-4" />
              <p className="text-2xl font-black uppercase tracking-tighter">DETAILED REVIEW</p>
              <p className="text-xs font-bold opacity-60 mt-2">Get written feedback from our A&R.</p>
              <p className="mt-6 font-black text-xs px-3 py-1 bg-black/20 inline-block uppercase">+1 CREDIT</p>
            </button>
          </div>

          <div className="flex justify-center mt-6">
            <button 
              type="button"
              onClick={() => {
                set("fastTrack", false);
                set("reviewRequested", false);
                handleNext();
              }}
              className="text-xs font-black uppercase tracking-[0.2em] text-white/50 hover:text-white underline decoration-white/30 hover:decoration-white transition-all p-4"
            >
              NO THANKS, SKIP UPSELLS
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 5: Premium Services ── */}
      {step === 5 && (
        <div className="space-y-8 animate-reveal">
          <div className="p-4 bg-white/5 border border-white/10 mb-8 flex items-center gap-4">
            <CheckCircle2 className="text-[#00FF00]" />
            <span className="text-xs font-bold uppercase tracking-widest text-white/60">YOUR TRACK IS ELIGIBLE FOR PREMIUM PR</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <button onClick={() => {
                const arr: PremiumService[] = form.premiumServices.includes("INTERVIEW") 
                  ? form.premiumServices.filter((s): s is PremiumService => s !== "INTERVIEW") 
                  : [...form.premiumServices, "INTERVIEW"];
                set("premiumServices", arr);
              }}
              className={`p-8 border-4 text-left transition-all ${
                form.premiumServices.includes("INTERVIEW") ? "bg-white text-black border-white" : "bg-black text-white border-white/10"
              }`}>
              <Mic size={32} className="mb-4" />
              <p className="text-2xl font-black uppercase tracking-tighter">EXCLUSIVE INTERVIEW</p>
              <p className="text-xs font-bold opacity-60 mt-2">Full Q&A published on Cult Machine.</p>
              <p className="mt-6 font-black text-xs px-3 py-1 bg-black/10 inline-block uppercase">$30 USD</p>
            </button>

            <button onClick={() => {
                const arr: PremiumService[] = form.premiumServices.includes("ARTICLE") 
                  ? form.premiumServices.filter((s): s is PremiumService => s !== "ARTICLE") 
                  : [...form.premiumServices, "ARTICLE"];
                set("premiumServices", arr);
              }}
              className={`p-8 border-4 text-left transition-all ${
                form.premiumServices.includes("ARTICLE") ? "bg-white text-black border-white" : "bg-black text-white border-white/10"
              }`}>
              <FileText size={32} className="mb-4" />
              <p className="text-2xl font-black uppercase tracking-tighter">DEDICATED ARTICLE</p>
              <p className="text-xs font-bold opacity-60 mt-2">Professional editorial review.</p>
              <p className="mt-6 font-black text-xs px-3 py-1 bg-black/10 inline-block uppercase">$25 USD</p>
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 6: Checkout Summary ── */}
      {step === 6 && (
        <div className="animate-reveal border-4 border-white/10 p-8 bg-black/50">
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 border-b-2 border-white/10 pb-4">ORDER SUMMARY</h2>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="font-bold text-sm uppercase opacity-70">TRACK TYPE ({form.submissionType})</span>
              <span className="font-black">{baseCredits > 0 ? `${baseCredits} CRD` : 'FREE'}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="font-bold text-sm uppercase opacity-70">CHANNELS ({form.applyAllChannels ? 'ALL' : 'SINGLE'})</span>
              <span className="font-black">{channelCredits > 0 ? `+${channelCredits} CRD` : 'FREE'}</span>
            </div>

            {form.fastTrack && (
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="font-bold text-sm uppercase opacity-70">FAST TRACK</span>
                <span className="font-black">+1 CRD</span>
              </div>
            )}

            {form.reviewRequested && (
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="font-bold text-sm uppercase opacity-70">A&R REVIEW</span>
                <span className="font-black">+1 CRD</span>
              </div>
            )}
            
            {form.premiumServices.map(s => (
              <div key={s} className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="font-bold text-sm uppercase opacity-70">{s} SERVICE</span>
                <span className="font-black text-cult-yellow">${s === 'INTERVIEW' ? 30 : 25} USD</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center p-6 bg-white/5 border-2 border-white/10 mb-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">FINAL TOTAL</p>
              {retentionDiscountApplied && totalCreditsNeeded > 0 && (
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#F5E000] mb-2">EXIT OFFER APPLIED: 50% OFF CREDITS</p>
              )}
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-white">
                {totalCreditsNeeded > 0 && `${totalCreditsNeeded} CRD`}
                {totalCreditsNeeded > 0 && totalUsdNeeded > 0 && " + "}
                {totalUsdNeeded > 0 && `$${totalUsdNeeded} USD`}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#00FF00] mb-1">EQUIVALENT</p>
              <h3 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter text-[#00FF00]">
                ${finalDisplayUsd} USD
              </h3>
            </div>
          </div>

          <div className="p-6 border-4 border-dashed border-white/10 bg-black/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">PAYMENT METHOD</p>
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-white/10 text-white text-[8px] font-black rounded tracking-widest">VISA</div>
              <div className="px-3 py-1 bg-white/10 text-white text-[8px] font-black rounded tracking-widest">MASTERCARD</div>
              <div className="px-3 py-1 bg-white/10 text-white text-[8px] font-black rounded tracking-widest">AMEX</div>
              <div className="ml-auto text-[10px] font-bold text-white/20 uppercase tracking-widest">SECURE BY STRIPE</div>
            </div>
          </div>
        </div>
      )}

      {/* ── STEP 10: Registration ── */}
      {step === 10 && !session && (
        <div className="max-w-md mx-auto space-y-6 animate-reveal">
          <p className="text-xs font-bold uppercase tracking-widest text-center mb-8 opacity-60">Create an account to track your submission.</p>
          <div>
            <label className="label">EMAIL (CONFIRM)</label>
            <input type="email" className="input" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className="label">CREATE PASSWORD</label>
            <input type="password" className="input" value={form.password || ""} onChange={(e) => set("password", e.target.value)} />
          </div>
        </div>
      )}


      {/* ── ERROR DISPLAY ── */}
      {error && (
        <div className="mt-8 p-6 border-4 border-[#FF0000] bg-[#FF0000]/10 text-[#FF0000] flex items-center gap-4 animate-reveal">
          <AlertCircle size={24} />
          <p className="text-xs font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      {/* ── NAVIGATION ── */}
      {!submitted && (
        <div className="flex justify-between mt-12 pt-8 border-t-4 border-white/10">
          <button onClick={handleBack} className="btn-secondary w-1/3">
            BACK
          </button>
          <button onClick={handleNext} disabled={!canNext() || loading} className="btn-primary w-1/3 flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : 
              step === 6 ? (
                isFreeFlow ? "SUBMIT" : 
                canPayWithCredits && totalUsdNeeded === 0 ? `SUBMIT (USE ${totalCreditsNeeded} CREDITS)` :
                "PAY & SUBMIT"
              ) : 
              step === 10 ? "SUBMIT" : "NEXT"
            }
          </button>
        </div>
      )}

      {/* ── MODALS ── */}
      {showExitIntent && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-[#F5E000] p-8 max-w-xl w-full shadow-[16px_16px_0px_0px_rgba(245,224,0,0.12)]">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F5E000] mb-4">Exit Offer</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
              Before you leave, keep these credits at 50% off.
            </h2>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-white/70 leading-relaxed mb-8">
              Before leaving, we can keep the credits you are using for this submission at a 50% discount. Or switch this flow to one free song and keep moving.
            </p>
            <div className="grid grid-cols-1 gap-4">
              {canShowRetentionOffer ? (
                <button
                  onClick={handleApplyRetentionDiscount}
                  className="w-full p-4 bg-[#F5E000] text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-all"
                >
                  Apply 50% Discount
                </button>
              ) : (
                <div className="w-full p-4 border-2 border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.2em] text-center">
                  50% discount already used in the last 30 days.
                </div>
              )}
              <button
                onClick={handleSwitchToFreeSong}
                className="w-full p-4 border-2 border-[#F5E000] text-[#F5E000] text-xs font-black uppercase tracking-[0.25em] hover:bg-[#F5E000] hover:text-black transition-all"
              >
                Send One Song For Free
              </button>
              <button
                onClick={handleConfirmedExit}
                className="w-full p-4 border-2 border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.25em] hover:text-white hover:border-white/30 transition-all"
              >
                Leave Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {showDonationPrompt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-white/10 p-8 max-w-lg w-full">
            <Heart size={48} className="text-[#FF0000] mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">SUPPORT THE CULT</h2>
            <p className="text-sm font-bold opacity-60 mb-8 leading-relaxed">
              We process hundreds of submissions for free. If you appreciate the platform, consider dropping a small tip so we can keep the lights on.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowDonationPrompt(false);
                  setIncludeDonation(true);
                  if (session) {
                    void handleSubmit();
                  } else {
                    setStep(10);
                  }
                }}
                className="w-full btn-primary bg-[#00FF00] text-black border-[#00FF00]"
              >
                DONATE $5
              </button>
              <button
                onClick={() => {
                  setShowDonationPrompt(false);
                  setIncludeDonation(false);
                  if (session) {
                    void handleSubmit();
                  } else {
                    setStep(10);
                  }
                }}
                className="w-full p-4 border-2 border-white/10 text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all text-white/40"
              >
                CONTINUE FOR FREE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE TRACK BLOCK MODAL ── */}
      {showActiveBlockModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-[#F5E000] p-8 max-w-lg w-full shadow-[16px_16px_0px_0px_rgba(245,224,0,0.12)]">
            <div className="w-16 h-16 bg-[#F5E000] flex items-center justify-center mb-6">
              <Zap size={32} className="text-black" strokeWidth={3} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#F5E000] mb-4">Submission Active</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
              This track is already under review.
            </h2>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-white/60 leading-relaxed mb-8">
              You already have an active submission for this track. You can't submit it again until the current review process is complete. Check your submissions to see its current status.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setShowActiveBlockModal(false);
                  router.push(`/${locale}/portal/submissions`);
                }}
                className="w-full p-4 bg-[#F5E000] text-black text-xs font-black uppercase tracking-[0.25em] hover:bg-white transition-all"
              >
                View My Submissions
              </button>
              <button
                onClick={() => setShowActiveBlockModal(false)}
                className="w-full p-4 border-2 border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.25em] hover:text-white hover:border-white/30 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REJECTED TRACK CONFIRMATION MODAL ── */}
      {showRejectedConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-black border-4 border-[#FF0000] p-8 max-w-lg w-full shadow-[16px_16px_0px_0px_rgba(255,0,0,0.12)]">
            <AlertCircle size={48} className="text-[#FF0000] mb-6" />
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#FF0000] mb-4">Previously Rejected</p>
            <h2 className="text-3xl font-black uppercase tracking-tighter text-white mb-4">
              This track has been previously rejected.
            </h2>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-white/60 leading-relaxed mb-8">
              Are you sure you want to submit it again? Our curators will review it with the same criteria as before. Make sure something has changed (mix, master, pitch, etc.) before resubmitting.
            </p>
            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  setShowRejectedConfirm(false);
                  setForceResubmit(true);
                  // Pass override directly to avoid async state race condition
                  void handleSubmit(true);
                }}
                className="w-full p-4 bg-[#FF0000] text-white text-xs font-black uppercase tracking-[0.25em] hover:bg-white hover:text-black transition-all"
              >
                Yes, Submit Anyway
              </button>
              <button
                onClick={() => setShowRejectedConfirm(false)}
                className="w-full p-4 border-2 border-white/10 text-white/50 text-xs font-black uppercase tracking-[0.25em] hover:text-white hover:border-white/30 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

