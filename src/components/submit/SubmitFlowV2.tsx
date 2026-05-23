"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import {
  type PremiumService,
  type Channel,
  type SubmissionType,
  calculateCredits,
  creditPackPrice,
  ALL_CHANNELS,
} from "@/lib/pricing";

// Subcomponents
import SelectArtistStep from "./subcomponents/SelectArtistStep";
import DetailsStep from "./subcomponents/DetailsStep";
import ReleaseTypeStep from "./subcomponents/ReleaseTypeStep";
import ChannelsStep from "./subcomponents/ChannelsStep";
import UpsellsStep from "./subcomponents/UpsellsStep";
import PremiumServicesStep from "./subcomponents/PremiumServicesStep";
import CheckoutSummaryStep from "./subcomponents/CheckoutSummaryStep";
import RegistrationStep from "./subcomponents/RegistrationStep";
import SubmitFlowModals from "./subcomponents/SubmitFlowModals";

export interface ManagedArtistRef {
  id: string;
  artistName: string;
}

export interface FormData {
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

function normalizeArtistValue(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/(feat|featuring|ft|with)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function registeredArtistMatchesMetadata(registeredArtist: string, metadataArtist: string) {
  const registered = normalizeArtistValue(registeredArtist);
  const metadata = normalizeArtistValue(metadataArtist);

  if (!registered || !metadata) return true;
  if (registered === metadata) return true;
  if (metadata.includes(registered)) return true;

  const collaborators = metadata
    .split(/\s*(?:,|&| x | and )\s*/)
    .map((part) => part.trim())
    .filter(Boolean);

  return collaborators.some((name) => name === registered || name.includes(registered) || registered.includes(name));
}
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
  const registeredArtistName = session?.user?.accountType === "ARTIST" ? (session.user.artistName || session.user.name || "") : "";
  const artistNameLocked = !!registeredArtistName && !hasManagedArtists;
  const artistMetadataMismatch = !!registeredArtistName && !!form.autoFilledArtist && !registeredArtistMatchesMetadata(registeredArtistName, form.autoFilledArtist);

  const handleAutoFill = async () => {
    if (!form.streamingUrl.trim()) return;
    setFetchingInfo(true);
    setError("");
    try {
      const res = await fetch(`/api/track-info?url=${encodeURIComponent(form.streamingUrl)}`);
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setForm((prev) => ({
          ...prev,
          autoFilledTitle: "",
          autoFilledArtist: "",
          autoFilledCover: "",
          autoFillSource: "",
          streamingPlatform: "",
        }));
        setError(data?.error || "Use a direct song or album link. Artist profile links are not accepted.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        trackTitle: data.title || prev.trackTitle,
        artistName: artistNameLocked ? prev.artistName : (data.artist || prev.artistName),
        autoFilledTitle: data.title || "",
        autoFilledArtist: data.artist || "",
        autoFilledCover: data.cover || "",
        autoFillSource: data.source || "",
        streamingPlatform: data.platform || "",
        submissionType: data.type || prev.submissionType,
      }));
    } catch {
      setError("Could not validate that link. Use a direct song or album URL.");
    } finally {
      setFetchingInfo(false);
    }
  };

  // Pre-fill session data
  useEffect(() => {
    if (session?.user) {
      setForm((prev) => ({
        ...prev,
        artistName: session.user.accountType === "ARTIST" && !hasManagedArtists
          ? (session.user.artistName || session.user.name || prev.artistName)
          : prev.artistName,
        instagram: session.user.instagram || prev.instagram,
        genre: session.user.genre || prev.genre,
        subgenre: session.user.subgenre || prev.subgenre,
      }));
    }
  }, [hasManagedArtists, session]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Pricing (from shared lib) ────────────────────────────────────────────
  const credits = calculateCredits(
    form.submissionType,
    form.applyAllChannels,
    form.fastTrack,
    form.reviewRequested
  );
  const totalCreditsNeeded = credits.total;
  // Premium services (INTERVIEW/ARTICLE) are billed post-acceptance, not now
  const totalUsdNeeded = 0;
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
  const isFreeFlow = totalCreditsNeeded === 0;
  const hasEnoughCredits = currentCredits >= totalCreditsNeeded;
  const canPayWithCredits = totalCreditsNeeded > 0 && hasEnoughCredits;

  const draftStorageKey = `submit-flow-draft:${basePath}:${locale}`;
  const baseCreditPrice = creditPackPrice(totalCreditsNeeded);
  const discountedCreditUsdTotal = retentionDiscountApplied
    ? baseCreditPrice * 0.5
    : baseCreditPrice;
  const hasPricedSelections = totalCreditsNeeded > 0 || includeDonation;
  const finalDisplayUsd = discountedCreditUsdTotal;
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
      const hasInstagram = !!session?.user?.instagram || !!form.instagram;
      return hasBasicInfo && hasInstagram && (!!session || !!form.email) && !artistMetadataMismatch;
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
        channels: form.applyAllChannels ? ALL_CHANNELS : form.channels,
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
                  {totalCreditsNeeded} CREDITS
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
        <SelectArtistStep
          form={form}
          set={set}
          managedArtists={managedArtists}
        />
      )}

      {/* ── STEP 1: Details ── */}
      {step === 1 && (
        <DetailsStep
          form={form}
          set={set}
          session={session}
          fetchingInfo={fetchingInfo}
          handleAutoFill={handleAutoFill}
          artistNameLocked={artistNameLocked}
          artistMetadataMismatch={artistMetadataMismatch}
          registeredArtistName={registeredArtistName}
        />
      )}

      {/* ── STEP 2: Submission Type ── */}
      {step === 2 && (
        <ReleaseTypeStep
          form={form}
          set={set}
        />
      )}

      {/* ── STEP 3: Channels ── */}
      {step === 3 && (
        <ChannelsStep
          form={form}
          set={set}
        />
      )}

      {/* ── STEP 4: Upsells ── */}
      {step === 4 && (
        <UpsellsStep
          form={form}
          set={set}
          handleNext={handleNext}
        />
      )}

      {/* ── STEP 5: Premium Services ── */}
      {step === 5 && (
        <PremiumServicesStep
          form={form}
          setForm={setForm}
        />
      )}

      {/* ── STEP 6: Checkout Summary ── */}
      {step === 6 && (
        <CheckoutSummaryStep
          form={form}
          credits={credits}
          retentionDiscountApplied={retentionDiscountApplied}
          totalCreditsNeeded={totalCreditsNeeded}
        />
      )}

      {/* ── STEP 10: Registration ── */}
      {step === 10 && !session && (
        <RegistrationStep
          form={form}
          set={set}
        />
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
      <SubmitFlowModals
        showExitIntent={showExitIntent}
        canShowRetentionOffer={canShowRetentionOffer}
        handleApplyRetentionDiscount={handleApplyRetentionDiscount}
        handleSwitchToFreeSong={handleSwitchToFreeSong}
        handleConfirmedExit={handleConfirmedExit}
        showDonationPrompt={showDonationPrompt}
        setShowDonationPrompt={setShowDonationPrompt}
        setIncludeDonation={setIncludeDonation}
        session={session}
        setStep={setStep}
        handleSubmit={handleSubmit}
        showActiveBlockModal={showActiveBlockModal}
        setShowActiveBlockModal={setShowActiveBlockModal}
        locale={locale}
        showRejectedConfirm={showRejectedConfirm}
        setShowRejectedConfirm={setShowRejectedConfirm}
        setForceResubmit={setForceResubmit}
      />

    </div>
  );
}

