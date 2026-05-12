"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle2, AlertCircle, Zap, X } from "lucide-react";

const GENRES = [
  "Rock", "Electronic", "Hip-Hop", "R&B / Soul", "Pop",
  "Folk / Acoustic", "Latin", "Jazz", "Metal", "Ambient / Experimental", "Other",
];

const MUSIC_LANGUAGES = [
  { code: "en", labelKey: "en" },
  { code: "es", labelKey: "es" },
  { code: "fr", labelKey: "fr" },
  { code: "pt", labelKey: "pt" },
  { code: "de", labelKey: "de" },
  { code: "it", labelKey: "it" },
  { code: "ja", labelKey: "ja" },
  { code: "ko", labelKey: "ko" },
  { code: "zh", labelKey: "zh" },
  { code: "other", labelKey: "other" },
];

const AGE_RANGES = ["UNDER_18", "AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_PLUS"] as const;
const LISTENERS = ["UNDER_1K", "FROM_1K_TO_10K", "FROM_10K_TO_50K", "FROM_50K_TO_100K", "FROM_100K_TO_500K", "OVER_500K"] as const;
const FOLLOWERS = ["UNDER_1K", "FROM_1K_TO_10K", "FROM_10K_TO_50K", "FROM_50K_TO_100K", "FROM_100K_TO_500K", "OVER_500K"] as const;
const DISTRIBUTION = ["DISTROKID", "TUNECORE", "CD_BABY", "RECORD_LABEL", "INDEPENDENT", "OTHER"] as const;

const COUNTRIES = [
  { code: "AF", name: "Afghanistan" }, { code: "AL", name: "Albania" }, { code: "DZ", name: "Algeria" }, { code: "AD", name: "Andorra" }, { code: "AO", name: "Angola" },
  { code: "AG", name: "Antigua and Barbuda" }, { code: "AR", name: "Argentina" }, { code: "AM", name: "Armenia" }, { code: "AU", name: "Australia" }, { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" }, { code: "BS", name: "Bahamas" }, { code: "BH", name: "Bahrain" }, { code: "BD", name: "Bangladesh" }, { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" }, { code: "BE", name: "Belgium" }, { code: "BZ", name: "Belize" }, { code: "BJ", name: "Benin" }, { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" }, { code: "BA", name: "Bosnia and Herzegovina" }, { code: "BW", name: "Botswana" }, { code: "BR", name: "Brazil" }, { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" }, { code: "BF", name: "Burkina Faso" }, { code: "BI", name: "Burundi" }, { code: "CV", name: "Cabo Verde" }, { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" }, { code: "CA", name: "Canada" }, { code: "CF", name: "Central African Republic" }, { code: "TD", name: "Chad" }, { code: "CL", name: "Chile" },
  { code: "CN", name: "China" }, { code: "CO", name: "Colombia" }, { code: "KM", name: "Comoros" }, { code: "CG", name: "Congo" }, { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" }, { code: "CU", name: "Cuba" }, { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czech Republic" }, { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" }, { code: "DM", name: "Dominica" }, { code: "DO", name: "Dominican Republic" }, { code: "EC", name: "Ecuador" }, { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" }, { code: "GQ", name: "Equatorial Guinea" }, { code: "ER", name: "Eritrea" }, { code: "EE", name: "Estonia" }, { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" }, { code: "FJ", name: "Fiji" }, { code: "FI", name: "Finland" }, { code: "FR", name: "France" }, { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" }, { code: "GE", name: "Georgia" }, { code: "DE", name: "Germany" }, { code: "GH", name: "Ghana" }, { code: "GR", name: "Greece" },
  { code: "GD", name: "Grenada" }, { code: "GT", name: "Guatemala" }, { code: "GN", name: "Guinea" }, { code: "GW", name: "Guinea-Bissau" }, { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" }, { code: "HN", name: "Honduras" }, { code: "HU", name: "Hungary" }, { code: "IS", name: "Iceland" }, { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" }, { code: "IR", name: "Iran" }, { code: "IQ", name: "Iraq" }, { code: "IE", name: "Ireland" }, { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" }, { code: "JM", name: "Jamaica" }, { code: "JP", name: "Japan" }, { code: "JO", name: "Jordan" }, { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" }, { code: "KI", name: "Kiribati" }, { code: "KP", name: "North Korea" }, { code: "KR", name: "South Korea" }, { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" }, { code: "LA", name: "Laos" }, { code: "LV", name: "Latvia" }, { code: "LB", name: "Lebanon" }, { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" }, { code: "LY", name: "Libya" }, { code: "LI", name: "Liechtenstein" }, { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" }, { code: "MW", name: "Malawi" }, { code: "MY", name: "Malaysia" }, { code: "MV", name: "Maldives" }, { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" }, { code: "MH", name: "Marshall Islands" }, { code: "MR", name: "Mauritania" }, { code: "MU", name: "Mauritius" }, { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" }, { code: "MD", name: "Moldova" }, { code: "MC", name: "Monaco" }, { code: "MN", name: "Mongolia" }, { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" }, { code: "MZ", name: "Mozambique" }, { code: "MM", name: "Myanmar" }, { code: "NA", name: "Namibia" }, { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" }, { code: "NL", name: "Netherlands" }, { code: "NZ", name: "New Zealand" }, { code: "NI", name: "Nicaragua" }, { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" }, { code: "MK", name: "North Macedonia" }, { code: "NO", name: "Norway" }, { code: "OM", name: "Oman" }, { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" }, { code: "PA", name: "Panama" }, { code: "PG", name: "Papua New Guinea" }, { code: "PY", name: "Paraguay" }, { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" }, { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" }, { code: "QA", name: "Qatar" }, { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" }, { code: "RW", name: "Rwanda" }, { code: "KN", name: "Saint Kitts and Nevis" }, { code: "LC", name: "Saint Lucia" }, { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" }, { code: "SM", name: "San Marino" }, { code: "ST", name: "Sao Tome and Principe" }, { code: "SA", name: "Saudi Arabia" }, { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" }, { code: "SC", name: "Seychelles" }, { code: "SL", name: "Sierra Leone" }, { code: "SG", name: "Singapore" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "SB", name: "Solomon Islands" }, { code: "SO", name: "Somalia" }, { code: "ZA", name: "South Africa" }, { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" }, { code: "LK", name: "Sri Lanka" }, { code: "SD", name: "Sudan" }, { code: "SR", name: "Suriname" }, { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" }, { code: "SY", name: "Syria" }, { code: "TW", name: "Taiwan" }, { code: "TJ", name: "Tajikistan" }, { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" }, { code: "TL", name: "Timor-Leste" }, { code: "TG", name: "Togo" }, { code: "TO", name: "Tonga" }, { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" }, { code: "TR", name: "Turkey" }, { code: "TM", name: "Turkmenistan" }, { code: "TV", name: "Tuvalu" }, { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" }, { code: "AE", name: "United Arab Emirates" }, { code: "GB", name: "United Kingdom" }, { code: "US", name: "United States" }, { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" }, { code: "VU", name: "Vanuatu" }, { code: "VA", name: "Vatican City" }, { code: "VE", name: "Venezuela" }, { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" }, { code: "ZM", name: "Zambia" }, { code: "ZW", name: "Zimbabwe" },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  MX: ["Ciudad de Mexico", "Guadalajara", "Monterrey", "Queretaro", "Puebla", "Tijuana", "Merida", "Leon", "Juarez", "Cancun"],
  US: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Miami", "Nashville", "Atlanta"],
  ES: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Zaragoza", "Malaga", "Murcia", "Palma", "Bilbao", "Alicante"],
  CO: ["Bogota", "Medellin", "Cali", "Barranquilla", "Cartagena", "Cucuta", "Bucaramanga", "Pereira"],
  AR: ["Buenos Aires", "Cordoba", "Rosario", "Mendoza", "Tucuman", "La Plata", "Mar del Plata", "Salta"],
  CL: ["Santiago", "Valparaiso", "Concepcion", "La Serena", "Antofagasta", "Temuco", "Iquique"],
  BR: ["Sao Paulo", "Rio de Janeiro", "Brasilia", "Salvador", "Fortaleza", "Belo Horizonte", "Curitiba", "Manaus"],
  CA: ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City"],
  GB: ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh"],
  FR: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier"],
  DE: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Dusseldorf", "Leipzig"],
};

export default function ProfileForm({ initialData }: { initialData: any }) {
  const t = useTranslations("onboarding");
  const tRegister = useTranslations("register");
  
  const [form, setForm] = useState({
    country: initialData.country || "",
    city: initialData.city || "",
    bio: initialData.bio || "",
    roleType: initialData.roleType || "ARTIST",
    ageRange: initialData.ageRange || "",
    bandSize: initialData.bandSize || 2,
    memberAgeRanges: Array.isArray(initialData.memberAgeRanges) 
      ? initialData.memberAgeRanges.map((r: any) => r.range || "") 
      : ["", ""],
    genre: initialData.genre || "",
    subgenre: initialData.subgenre || "",
    musicLanguages: Array.isArray(initialData.musicLanguages) ? initialData.musicLanguages : [],
    spotifyUrl: initialData.spotifyUrl || "",
    instagram: initialData.instagram || "",
    instagramFollowers: initialData.instagramFollowers || "",
    tiktok: initialData.tiktok || "",
    youtube: initialData.youtube || "",
    soundcloudUrl: initialData.soundcloudUrl || "",
    website: initialData.website || "",
    careerStartYear: initialData.careerStartYear?.toString() || "",
    monthlyListeners: initialData.monthlyListeners || "",
    distributionMethod: initialData.distributionMethod || "",
    hasManager: !!initialData.hasManager,
  });
  
  const [showUnlocked, setShowUnlocked] = useState(false);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  const set = (key: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setStatus({ type: null, message: "" }); // clear messages on edit
  };

  const toggleLanguage = (code: string) => {
    setForm(prev => ({
      ...prev,
      musicLanguages: prev.musicLanguages.includes(code)
        ? prev.musicLanguages.filter((l) => l !== code)
        : [...prev.musicLanguages, code],
    }));
    setStatus({ type: null, message: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });

    try {
      const payload = {
        ...form,
        careerStartYear: form.careerStartYear ? parseInt(form.careerStartYear) : undefined,
      };

      const res = await fetch("/api/artist/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus({ type: "success", message: "Profile updated successfully!" });
        
        // Qualification check for Premium PR
        const isQualified = 
          !["", "UNDER_1K", "FROM_1K_TO_10K"].includes(form.monthlyListeners) && 
          !["", "UNDER_1K", "FROM_1K_TO_10K"].includes(form.instagramFollowers);
        
        if (isQualified) {
          setShowUnlocked(true);
        }
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to save profile");
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl">
      
      {/* BASICS */}
      <div className="card space-y-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">{t("basics.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label" htmlFor="country">{t("basics.country")}</label>
            <select id="country" className="input" value={form.country} onChange={(e) => set("country", e.target.value)}>
              <option value="">{t("basics.countryPlaceholder")}</option>
              {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="city">{t("basics.city")}</label>
            {CITIES_BY_COUNTRY[form.country] ? (
              <select 
                id="city" 
                className="input" 
                value={form.city} 
                onChange={(e) => set("city", e.target.value)}
              >
                <option value="">{t("basics.cityPlaceholder")}</option>
                {CITIES_BY_COUNTRY[form.country].map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
                <option value="OTHER">OTHER / NOT LISTED</option>
              </select>
            ) : (
              <input id="city" type="text" className="input" placeholder={t("basics.cityPlaceholder")} value={form.city} onChange={(e) => set("city", e.target.value)} />
            )}
            {form.city === "OTHER" && (
              <input 
                type="text" 
                className="input mt-2" 
                placeholder="TYPE YOUR CITY NAME" 
                onChange={(e) => set("city", e.target.value)} 
              />
            )}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="bio">
            {t("basics.bio")}
            <span className="ml-2 text-cm-text-muted font-sans normal-case text-[11px]">{form.bio.length}/500</span>
          </label>
          <textarea id="bio" className="input min-h-[100px] resize-none" placeholder={t("basics.bioPlaceholder")} maxLength={500} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </div>
      </div>

      {/* PROJECT & GENRES */}
      <div className="card space-y-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">{t("project.title")} / {t("genres.title")}</h2>
        
        {/* Role Type */}
        <div className="grid grid-cols-2 gap-3">
          {(["ARTIST", "BAND"] as const).map((r) => (
            <button
              key={r} type="button" onClick={() => set("roleType", r)}
              className={`p-6 border-4 transition-all duration-150 rounded-none text-left flex flex-col justify-between ${form.roleType === r ? "border-[#F5E000] bg-[#F5E000] text-black shadow-[6px_6px_0px_0px_rgba(245,224,0,0.1)]" : "border-white/10 bg-white/5 text-white/40 hover:border-white/20 hover:text-white"}`}
            >
              <p className="font-sans text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">PROJECT_TYPE</p>
              <p className="font-sans text-2xl font-black uppercase tracking-tighter leading-none">{r === "ARTIST" ? t("project.soloArtist") : t("project.band")}</p>
            </button>
          ))}
        </div>

        {/* Age Range (both ARTIST and BAND) */}
        <div>
          <label className="label" htmlFor="ageRange">{t("project.ageRange")}</label>
          <select id="ageRange" className="input" value={form.ageRange} onChange={(e) => set("ageRange", e.target.value)}>
            <option value="">— {tRegister("ageRange")} —</option>
            {AGE_RANGES.map((a) => <option key={a} value={a}>{tRegister(`ageRanges.${a}`)}</option>)}
          </select>
        </div>

        <div className="pt-4 border-t border-border">
          <label className="label">{t("genres.genre")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GENRES.map((g) => (
              <button
                key={g} type="button" onClick={() => set("genre", g)}
                className={`px-4 py-3 border-2 transition-all duration-150 font-sans text-[10px] font-black uppercase tracking-widest ${form.genre === g ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="subgenre">{t("genres.subgenre")}</label>
          <input id="subgenre" type="text" className="input" placeholder={t("genres.subgenrePlaceholder")} value={form.subgenre} onChange={(e) => set("subgenre", e.target.value)} />
        </div>
        
        <div>
          <label className="label">{t("languages.title")}</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MUSIC_LANGUAGES.map(({ code, labelKey }) => (
              <button
                key={code} type="button" onClick={() => toggleLanguage(code)}
                className={`px-4 py-3 border-2 transition-all duration-150 font-sans text-[10px] font-black uppercase tracking-widest ${form.musicLanguages.includes(code) ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"}`}
              >
                {t(`languages.${labelKey}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SOCIALS */}
      <div className="card space-y-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">{t("socials.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div><label className="label">{t("socials.spotify")}</label><input type="text" className="input" value={form.spotifyUrl} onChange={(e) => set("spotifyUrl", e.target.value)} /></div>
          <div><label className="label">{t("socials.instagram")}</label><input type="text" className="input" value={form.instagram} onChange={(e) => set("instagram", e.target.value)} /></div>
          <div>
            <label className="label">{tRegister("instagramFollowers")}</label>
            <select className="input" value={form.instagramFollowers} onChange={(e) => set("instagramFollowers", e.target.value)}>
              <option value="">— select —</option>
              {FOLLOWERS.map((f) => <option key={f} value={f}>{tRegister(`followers.${f}`)}</option>)}
            </select>
          </div>
          <div><label className="label">{t("socials.tiktok")}</label><input type="text" className="input" value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} /></div>
          <div><label className="label">{t("socials.youtube")}</label><input type="text" className="input" value={form.youtube} onChange={(e) => set("youtube", e.target.value)} /></div>
          <div><label className="label">{t("socials.soundcloud")}</label><input type="text" className="input" value={form.soundcloudUrl} onChange={(e) => set("soundcloudUrl", e.target.value)} /></div>
          <div><label className="label">{t("socials.website")}</label><input type="text" className="input" value={form.website} onChange={(e) => set("website", e.target.value)} /></div>
        </div>
      </div>

      {/* CAREER */}
      <div className="card space-y-6">
        <h2 className="font-sans text-xl font-bold text-cm-text-primary tracking-tight">{t("career.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="label">{t("career.startYear")}</label>
            <input type="number" className="input" min={1950} max={new Date().getFullYear()} value={form.careerStartYear} onChange={(e) => set("careerStartYear", e.target.value)} />
          </div>
          <div>
            <label className="label">{t("career.listeners")}</label>
            <select className="input" value={form.monthlyListeners} onChange={(e) => set("monthlyListeners", e.target.value)}>
              <option value="">— select —</option>
              {LISTENERS.map((l) => <option key={l} value={l}>{tRegister(`listeners.${l}`)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t("career.distribution")}</label>
            <select className="input" value={form.distributionMethod} onChange={(e) => set("distributionMethod", e.target.value)}>
              <option value="">— select —</option>
              {DISTRIBUTION.map((d) => <option key={d} value={d}>{tRegister(`distribution.${d}`)}</option>)}
            </select>
          </div>
          <div>
            <p className="label mb-3">{t("career.manager")}</p>
            <div className="flex gap-4">
              {[true, false].map((val) => (
                <button
                  key={String(val)} type="button" onClick={() => set("hasManager", val)}
                  className={`flex-1 py-4 border-2 transition-all font-sans text-[10px] font-black uppercase tracking-widest ${form.hasManager === val ? "bg-[#F5E000] text-black border-[#F5E000]" : "bg-white/5 border-white/10 text-white/40 hover:text-white"}`}
                >
                  {val ? t("career.yes") : t("career.no")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SAVE ACTIONS */}
      <div className="flex items-center justify-between pt-4 pb-12">
        <div>
          {status.type === "success" && <p className="text-ok text-sm font-medium flex items-center gap-2"><CheckCircle2 size={16}/> {status.message}</p>}
          {status.type === "error" && <p className="text-danger text-sm font-medium flex items-center gap-2"><AlertCircle size={16}/> {status.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary min-w-[150px] flex justify-center items-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Save Profile
        </button>
      </div>

      {showUnlocked && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-reveal">
          <div className="bg-black border-4 border-[#00FF00] p-10 max-w-xl w-full text-center relative">
            <button onClick={() => setShowUnlocked(false)} className="absolute top-4 right-4 text-white/40 hover:text-white"><X size={24}/></button>
            <div className="w-20 h-20 bg-[#00FF00] mx-auto mb-8 flex items-center justify-center">
              <Zap size={40} className="text-black" />
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4 text-white">PREMIUM PR UNLOCKED</h2>
            <p className="text-sm font-bold opacity-60 mb-10 leading-relaxed uppercase tracking-widest">
              Your numbers meet our editorial standards. You can now request Interviews and Articles in your next submission.
            </p>
            <button onClick={() => setShowUnlocked(false)} className="btn-primary w-full bg-[#00FF00] text-black border-[#00FF00]">GOT IT</button>
          </div>
        </div>
      )}

    </form>
  );
}
