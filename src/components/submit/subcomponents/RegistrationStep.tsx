"use client";

import type { FormData } from "../SubmitFlowV2";

interface RegistrationStepProps {
  form: FormData;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}

export default function RegistrationStep({ form, set }: RegistrationStepProps) {
  return (
    <div className="max-w-md mx-auto space-y-6 animate-reveal">
      <p className="text-xs font-bold uppercase tracking-widest text-center mb-8 opacity-60">
        Create an account to track your submission.
      </p>
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
