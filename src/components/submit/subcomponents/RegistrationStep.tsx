"use client";

import { useTranslations } from "next-intl";
import type { FormData } from "../SubmitFlowV2";

interface RegistrationStepProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

export default function RegistrationStep({ form, set }: RegistrationStepProps) {
  const t = useTranslations("register");
  const displayEmail = form.email.trim() || "...";

  return (
    <div className="max-w-md mx-auto space-y-6 animate-reveal">
      <p className="text-xs font-bold uppercase tracking-widest text-center mb-8 opacity-60">
        Create an account to track your submission.
      </p>

      {form.artistName && (
        <div className="p-5 border-4 border-[#F5E000] bg-black text-white font-sans text-xs font-bold uppercase tracking-wider space-y-2 shadow-[6px_6px_0px_0px_rgba(245,224,0,0.15)] animate-reveal">
          <p className="text-[#F5E000] font-black flex items-center gap-2 text-[10px] tracking-[0.25em]">
            <span>⚠</span> {t("artistLinkedNoticeTitle")}
          </p>
          <p className="normal-case leading-relaxed text-white/80 font-bold font-sans text-sm">
            {t("artistLinkedNotice", {
              artistName: form.artistName,
              email: displayEmail
            })}
          </p>
        </div>
      )}
      <div>
        <label className="label">EMAIL (CONFIRM)</label>
        <input
          type="email"
          className="input"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
        />
      </div>
      <div>
        <label className="label">CREATE PASSWORD</label>
        <input
          type="password"
          className="input"
          value={form.password || ""}
          onChange={(e) => set("password", e.target.value)}
        />
      </div>
    </div>
  );
}
