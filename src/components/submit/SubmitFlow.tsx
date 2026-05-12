"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Music,
  Radio,
  ListMusic,
  BookOpen,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Users,
  Mail,
  Lock,
} from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { useForm } from "react-hook-form"; // I'll use simple state to avoid adding more deps if possible, or check if it's there.

type Opportunity = "WEEKLY" | "SPOTIFY" | "WEBRADIO" | "ALBUM_STORY";
type ReleaseType = "SINGLE" | "EP" | "ALBUM";

export interface ManagedArtistRef {
  id: string;
  artistName: string;
}

interface FormData {
  managedArtistId: string;
  opportunity: Opportunity | "";
  streamingUrl: string;
  streamingPlatform: string;
  trackTitle: string;
  artistName: string;
  releaseType: ReleaseType | "";
  releaseDate: string;
  genre: string;
  subgenre: string;
  pitch: string;
  pressKitUrl: string;
  autoFilledTitle: string;
  autoFilledArtist: string;
  autoFilledCover: string;
  autoFillSource: string;
}

const INITIAL: FormData = {
  managedArtistId: "",
  opportunity: "",
  streamingUrl: "",
  streamingPlatform: "",
  trackTitle: "",
  artistName: "",
  releaseType: "",
  releaseDate: "",
  genre: "",
  subgenre: "",
  pitch: "",
  pressKitUrl: "",
  autoFilledTitle: "",
  autoFilledArtist: "",
  autoFilledCover: "",
  autoFillSource: "",
};

const GENRES = [
  "Rock", "Electronic", "Hip-Hop", "R&B / Soul", "Pop",
  "Folk / Acoustic", "Latin", "Jazz", "Metal", "Ambient / Experimental", "Other",
];

const OPPORTUNITIES: {
  key: Opportunity;
  icon: React.ElementType;
  locked?: boolean;
}[] = [
  { key: "WEEKLY", icon: Music },
  { key: "SPOTIFY", icon: ListMusic },
  { key: "WEBRADIO", icon: Radio },
  { key: "ALBUM_STORY", icon: BookOpen, locked: true },
];

const RELEASE_TYPES: ReleaseType[] = ["SINGLE", "EP", "ALBUM"];

interface SubmitFlowProps {
  managedArtists?: ManagedArtistRef[];
  basePath: string;
}

export default function SubmitFlow({ managedArtists, basePath }: SubmitFlowProps) {
  const t = useTranslations("submit");
  const locale = useLocale();
  const router = useRouter();

  const hasManagedArtists = Array.isArray(managedArtists) && managedArtists.length > 0;
  const initialStep = hasManagedArtists ? 0 : 1;

  const { data: session, status } = useSession();
  const [step, setStep] = useState(initialStep);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [autoFillError, setAutoFillError] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submissionId, setSubmissionId] = useState("");

  // Add-ons
  const [isFastResponse, setIsFastResponse] = useState(false);
  const [isReviewRequired, setIsReviewRequired] = useState(false);
  const [isMultiChannel, setIsMultiChannel] = useState(false);
  const [isInterviewRequired, setIsInterviewRequired] = useState(false);
  const [isArticleRequired, setIsArticleRequired] = useState(false);
  const [isCollabAgreed, setIsCollabAgreed] = useState(false);

  // Auth fields for anonymous flow
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const sessionId = useRef<string>("");

  function sendFunnelEvent(data: object) {
    fetch("/api/analytics/funnel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).catch(() => {});
  }

  useEffect(() => {
    const sid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionId.current = sid;
    if (initialStep >= 1) {
      sendFunnelEvent({ sessionId: sid, step: initialStep, completed: false, locale });
    }
  }, []);

  const trackFunnel = useCallback(
    (targetStep: number, completed = false, opportunity?: string) => {
      if (!sessionId.current) return;
      sendFunnelEvent({
        sessionId: sessionId.current,
        step: targetStep,
        completed,
        opportunity: opportunity ?? null,
        locale,
      });
    },
    [locale]
  );

  useEffect(() => {
    if (step >= 2) trackFunnel(step, false, form.opportunity || undefined);
  }, [step]);

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    []
  );

  const handleAutoFill = async () => {
    if (!form.streamingUrl.trim()) return;
    setFetchingInfo(true);
    setAutoFillError("");
    try {
      const res = await fetch(`/api/track-info?url=${encodeURIComponent(form.streamingUrl)}`);
      if (!res.ok) {
        setAutoFillError(t("autoFillFailed"));
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
      }));
    } catch {
      setAutoFillError(t("autoFillFailed"));
    } finally {
      setFetchingInfo(false);
    }
  };

  const canNext = (): boolean => {
    if (step === 0) return !!form.managedArtistId;
    if (step === 1) return !!form.streamingUrl && !!form.trackTitle && !!form.artistName && !!form.releaseType && !!form.genre;
    if (step === 2) return !!form.opportunity;
    if (step === 3 && !session) return true; // Review step, if no session, we show auth next
    if (step === 4) return !!email && !!password && password.length >= 6;
    return true;
  };

  const handleNext = () => {
    if (step === 3 && !session) {
      setStep(4);
    } else if (step === 3 && session) {
      handleSubmit();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const payload: any = {
        opportunity: form.opportunity,
        streamingUrl: form.streamingUrl,
        streamingPlatform: form.streamingPlatform || null,
        trackTitle: form.trackTitle,
        artistName: form.artistName,
        releaseType: form.releaseType,
        releaseDate: form.releaseDate || null,
        genre: form.genre,
        subgenre: form.subgenre || null,
        pitch: form.pitch || null,
        pressKitUrl: form.pressKitUrl || null,
        autoFilledTitle: form.autoFilledTitle || null,
        autoFilledArtist: form.autoFilledArtist || null,
        autoFilledCover: form.autoFilledCover || null,
        autoFillSource: form.autoFillSource || null,
        isFastResponse,
        isReviewRequired,
        isMultiChannel,
        isInterviewRequired,
        isArticleRequired,
        isCollabAgreed,
      };

      if (!session) {
        payload.email = email;
        payload.password = password;
      } else if (hasManagedArtists && form.managedArtistId) {
        payload.managedArtistId = form.managedArtistId;
      }

      const endpoint = session ? "/api/submissions" : "/api/submissions/anonymous";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      trackFunnel(3, true, form.opportunity || undefined);
      setSubmissionId(data.id);
      
      // If was anonymous, sign in automatically
      if (!session) {
        await signIn("credentials", {
          redirect: false,
          email,
          password,
        });
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-reveal">
        <div className="w-20 h-20 bg-cult-yellow border-4 border-black flex items-center justify-center mb-10">
          <CheckCircle2 size={40} className="text-black" />
        </div>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-white mb-4 text-center">
          SUBMITTED.
        </h1>
        <p className="text-sm font-light text-white/40 text-center max-w-sm mb-12 italic">
          "Your soul is in our hands now. We will listen."
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
          <button onClick={() => { setForm(INITIAL); setStep(initialStep); setSubmitted(false); }} className="btn-secondary flex-1">
            SUBMIT ANOTHER
          </button>
          <button onClick={() => router.push(`/${locale}${basePath}/submissions`)} className="btn-primary flex-1">
            VIEW QUEUE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 animate-reveal">
      {/* Header */}
      <div className="mb-12 border-b-4 border-white/20 pb-8">
        <div className="flex justify-between items-baseline mb-4">
          <p className="font-black text-[10px] uppercase tracking-[0.3em] text-[#999999]">
            {step === 0 ? "ROSTER" : `PHASE 0${step}`}
          </p>
          <p className="font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white italic">
            CULT MACHINE PORTAL
          </p>
        </div>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white leading-none">
          {step === 0 ? "WHO'S NEXT?" : "NEW SUBMISSION"}
        </h1>

        {/* Brutalist Progress Bar */}
        <div className="flex gap-1 mt-8">
          {(hasManagedArtists ? [0, 1, 2, 3, 4] : [1, 2, 3, 4]).map((n) => (
            <div
              key={n}
              className={`h-4 flex-1 border-2 border-white/10 transition-all duration-300 ${
                n <= step ? "bg-cult-yellow" : "bg-white/5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── STEP 0: Select Artist ── */}
      {step === 0 && hasManagedArtists && (
        <div className="space-y-8 animate-reveal">
          <div className="card border-4">
            <label className="label" htmlFor="managedArtistId">SELECT ARTIST FROM ROSTER</label>
            <select
              id="managedArtistId"
              className="input text-lg font-bold"
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

      {/* ── STEP 1: Track Details ── */}
      {step === 1 && (
        <div className="space-y-10 animate-reveal">
          <section className="space-y-6">
            <h3 className="section-label">Source & Info</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="label">STREAMING URL</label>
                <input type="url" className="input" placeholder="SPOTIFY / SOUNDCLOUD LINK..."
                  value={form.streamingUrl} onChange={(e) => { set("streamingUrl", e.target.value); setAutoFillError(""); }}
                  onBlur={handleAutoFill} />
              </div>
              <button type="button" onClick={handleAutoFill} disabled={fetchingInfo || !form.streamingUrl}
                className="btn-secondary h-[46px] sm:mt-[26px] !px-4 w-full sm:w-auto">
                {fetchingInfo ? <Loader2 size={16} className="animate-spin mx-auto" /> : "FETCH INFO"}
              </button>
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
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="label">TRACK TITLE</label>
              <input type="text" className="input" value={form.trackTitle} onChange={(e) => set("trackTitle", e.target.value)} />
            </div>
            <div>
              <label className="label">ARTIST NAME</label>
              <input type="text" className="input" value={form.artistName} onChange={(e) => set("artistName", e.target.value)} />
            </div>
          </section>

          <section>
            <label className="label">RELEASE TYPE</label>
            <div className="grid grid-cols-3 gap-4">
              {RELEASE_TYPES.map((rt) => (
                <button key={rt} type="button" onClick={() => set("releaseType", rt)}
                  className={`py-4 border-2 border-white/10 font-black uppercase text-xs tracking-widest transition-all ${
                    form.releaseType === rt ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-black text-white hover:bg-white/5"
                  }`}>
                  {rt}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="label">GENRE</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GENRES.map((g) => (
                <button key={g} type="button" onClick={() => set("genre", g)}
                  className={`px-4 py-3 border-2 border-white/10 text-left font-black uppercase text-[10px] tracking-widest transition-all ${
                    form.genre === g ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-black text-white hover:bg-white/5"
                  }`}>
                  {g}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="label">THE PITCH</label>
            <textarea className="input min-h-[150px]" placeholder="Tell us the story behind this track..."
              maxLength={1000} value={form.pitch} onChange={(e) => set("pitch", e.target.value)} />
          </section>
        </div>
      )}

      {/* ── STEP 2: Choose Opportunity ── */}
      {step === 2 && (
        <div className="space-y-6 animate-reveal">
          <h3 className="section-label">SELECT DESTINATION</h3>
          <div className="grid grid-cols-1 gap-4">
            {OPPORTUNITIES.map(({ key, icon: Icon, locked }) => {
              const active = form.opportunity === key;
              return (
                <button key={key} type="button" disabled={locked} onClick={() => !locked && set("opportunity", key)}
                  className={`w-full flex items-center gap-8 p-8 border-4 transition-all ${
                    locked ? "opacity-10 cursor-not-allowed bg-black border-white/10" :
                    active ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-black text-white border-white/10 hover:border-white"
                  }`}>
                  <Icon size={32} />
                  <div className="flex-1">
                    <p className="text-2xl font-black uppercase tracking-tighter mb-1">{key.replace("_", " ")}</p>
                    <p className={`text-xs font-light ${active ? "text-black/60" : "text-white/40"}`}>
                      {t(`opportunities.${key}_desc`)}
                    </p>
                  </div>
                  {active && <CheckCircle2 size={24} className="text-black" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── STEP 3: Review ── */}
      {step === 3 && (
        <div className="space-y-10 animate-reveal">
          <section className="border-4 border-[#F5E000] p-8 bg-black text-white space-y-6">
            <h3 className="text-cult-yellow font-black uppercase tracking-[0.3em] text-[10px]">FINAL VERDICT</h3>
            <div className="grid grid-cols-1 gap-6">
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">TARGET</span>
                <span className="font-black uppercase tracking-tighter">{form.opportunity}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">TRACK</span>
                <span className="font-black uppercase tracking-tighter">{form.trackTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20">ARTIST</span>
                <span className="font-black uppercase tracking-tighter">{form.artistName}</span>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="section-label">UPGRADE SUBMISSION</h3>
            <div className="space-y-4">
              <label className={`flex items-center justify-between p-6 border-4 transition-all ${isFastResponse ? 'bg-[#F5E000] text-black border-[#F5E000]' : 'bg-black text-white border-white/10 hover:border-white'}`}>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={isFastResponse} onChange={(e) => setIsFastResponse(e.target.checked)} className="w-6 h-6 border-4 border-current rounded-none appearance-none checked:bg-current" />
                  <div>
                    <p className="font-black uppercase text-sm tracking-tighter">FAST RESPONSE ({"<"} 48H)</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">GET HEARD WITHIN TWO DAYS</p>
                  </div>
                </div>
                <span className="font-black text-lg">+2 CREDITS</span>
              </label>

              <label className={`flex items-center justify-between p-6 border-4 transition-all ${isReviewRequired ? 'bg-[#F5E000] text-black border-[#F5E000]' : 'bg-black text-white border-white/10 hover:border-white'}`}>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={isReviewRequired} onChange={(e) => setIsReviewRequired(e.target.checked)} className="w-6 h-6 border-4 border-current rounded-none appearance-none checked:bg-current" />
                  <div>
                    <p className="font-black uppercase text-sm tracking-tighter">WRITTEN REVIEW</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">GET DETAILED EDITORIAL FEEDBACK</p>
                  </div>
                </div>
                <span className="font-black text-lg">+1 CREDIT</span>
              </label>

              <label className={`flex items-center justify-between p-6 border-4 transition-all ${isMultiChannel ? 'bg-[#F5E000] text-black border-[#F5E000]' : 'bg-black text-white border-white/10 hover:border-white'}`}>
                <div className="flex items-center gap-4">
                  <input type="checkbox" checked={isMultiChannel} onChange={(e) => setIsMultiChannel(e.target.checked)} className="w-6 h-6 border-4 border-current rounded-none appearance-none checked:bg-current" />
                  <div>
                    <p className="font-black uppercase text-sm tracking-tighter">MULTI-CHANNEL SUBMISSION</p>
                    <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">SEND TO ALL RELEVANT CURATORS</p>
                  </div>
                </div>
                <span className="font-black text-lg">+1 CREDIT</span>
              </label>

              {/* Premium Industry Services (Conditional) */}
              {(session?.user?.accountType === "INDUSTRY" || (session?.user?.monthlyListeners && session?.user?.monthlyListeners !== 'UNDER_1K')) && (
                <div className="pt-8 space-y-4">
                  <p className="font-sans text-[10px] font-black uppercase tracking-[0.4em] text-[#666666]">EXCLUSIVE OPPORTUNITIES</p>
                  
                  <label className={`flex items-center justify-between p-6 border-4 transition-all ${isInterviewRequired ? 'bg-[#F5E000] text-black border-[#F5E000]' : 'bg-black text-white border-white/10 hover:border-white'}`}>
                    <div className="flex items-center gap-4">
                      <input type="checkbox" checked={isInterviewRequired} onChange={(e) => setIsInterviewRequired(e.target.checked)} className="w-6 h-6 border-4 border-current rounded-none appearance-none checked:bg-current" />
                      <div>
                        <p className="font-black uppercase text-sm tracking-tighter">EDITORIAL INTERVIEW</p>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest text-inherit">DEDICATED 1-ON-1 FEATURE</p>
                      </div>
                    </div>
                    <span className="font-black text-lg">$30 USD</span>
                  </label>

                  <label className={`flex items-center justify-between p-6 border-4 transition-all ${isArticleRequired ? 'bg-[#F5E000] text-black border-[#F5E000]' : 'bg-black text-white border-white/10 hover:border-white'}`}>
                    <div className="flex items-center gap-4">
                      <input type="checkbox" checked={isArticleRequired} onChange={(e) => setIsArticleRequired(e.target.checked)} className="w-6 h-6 border-4 border-current rounded-none appearance-none checked:bg-current" />
                      <div>
                        <p className="font-black uppercase text-sm tracking-tighter">PRESS ARTICLE</p>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest text-inherit">FULL BLOG POST & REVIEW</p>
                      </div>
                    </div>
                    <span className="font-black text-lg">$25 USD</span>
                  </label>

                  {(isInterviewRequired || isArticleRequired) && (
                    <div className="p-6 bg-[#F5E000] border-4 border-black flex items-start gap-4">
                      <input 
                        type="checkbox" 
                        id="collab-check"
                        checked={isCollabAgreed}
                        onChange={(e) => setIsCollabAgreed(e.target.checked)}
                        className="w-5 h-5 border-2 border-black rounded-none appearance-none checked:bg-black mt-1" 
                      />
                      <label htmlFor="collab-check" className="font-sans text-[10px] font-black uppercase tracking-tight text-black cursor-pointer">
                        ESTOY DISPUESTO A HACER COLABORACIÓN EN INSTAGRAM PARA LA DIFUSIÓN DE ESTE CONTENIDO.
                      </label>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-8 bg-[#F5E000] text-black border-4 border-[#F5E000]">
              <span className="font-black uppercase tracking-[0.3em] text-xs opacity-60">TOTAL CREDITS</span>
              <span className="text-4xl font-black">{(isFastResponse ? 2 : 0) + (isReviewRequired ? 1 : 0) + (isMultiChannel ? 1 : 0)}</span>
            </div>
            {(isInterviewRequired || isArticleRequired) && (
              <div className="flex justify-between items-center p-8 bg-black text-white border-4 border-white/20 border-t-0 -mt-4 shadow-[8px_8px_0px_0px_rgba(245,224,0,0.2)]">
                <span className="font-black uppercase tracking-[0.3em] text-xs text-white/20">PREMIUM SERVICES</span>
                <span className="text-4xl font-black">${(isInterviewRequired ? 30 : 0) + (isArticleRequired ? 25 : 0)} USD</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-6 border-4 border-danger bg-danger/5 text-danger font-black uppercase text-xs tracking-widest">
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── STEP 4: Authentication (Anonymous Only) ── */}
      {step === 4 && !session && (
        <div className="space-y-10 animate-reveal">
          <div className="border-4 border-white/10 p-10 bg-black shadow-[12px_12px_0px_0px_rgba(245,224,0,0.1)]">
            <h3 className="font-sans text-3xl font-black uppercase tracking-tighter mb-8 border-b-4 border-white/10 pb-4 text-white">FINAL STEP: IDENTITY SYNC</h3>
            <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-10 leading-relaxed">
              Create your account to finalize the submission and track its progress in the portal.
            </p>
            
            <div className="space-y-8">
              <div>
                <label className="label flex items-center gap-2"><Mail size={14}/> EMAIL ADDRESS</label>
                <input 
                  type="email" 
                  className="input" 
                  placeholder="YOU@EXAMPLE.COM"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="label flex items-center gap-2"><Lock size={14}/> PASSWORD</label>
                <input 
                  type="password" 
                  className="input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-[9px] font-black uppercase text-black/40 mt-2 tracking-widest">MINIMUM 6 CHARACTERS</p>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="p-6 border-4 border-danger bg-danger/5 text-danger font-black uppercase text-xs tracking-widest">
              {error}
            </div>
          )}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="mt-16 flex items-center justify-between">
        <button type="button" onClick={() => { setStep((s) => s - 1); setError(""); }}
          disabled={step === initialStep} className="btn-secondary !px-6 disabled:opacity-20">
          BACK
        </button>

        {step < 3 || (step === 3 && !session) ? (
          <button type="button" onClick={handleNext} disabled={!canNext()}
            className="btn-primary !px-12">
            PROCEED →
          </button>
        ) : (
          <button type="button" onClick={handleSubmit} disabled={loading || !canNext()}
            className="btn-primary bg-cult-yellow !text-black hover:bg-white !px-12">
            {loading ? <Loader2 size={16} className="animate-spin" /> : "CONFIRM SUBMISSION"}
          </button>
        )}
      </div>
    </div>
  );
}
