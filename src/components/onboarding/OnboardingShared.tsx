"use client";

// ─── StepHeader ──────────────────────────────────────────────────────────────
export function StepHeader({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-sans text-3xl font-bold text-cm-text-primary tracking-tight">
        {title}
      </h1>
      {hint && (
        <p className="font-sans text-base text-cm-text-secondary mt-2">{hint}</p>
      )}
    </div>
  );
}

// ─── ReviewRow ───────────────────────────────────────────────────────────────
export function ReviewRow({
  label,
  value,
  fallback = "—",
}: {
  label: string;
  value: string;
  fallback?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
      <p className="font-sans text-xs font-bold uppercase tracking-wider text-cm-text-secondary shrink-0">
        {label}
      </p>
      <p className="font-sans text-sm font-medium text-cm-text-primary text-right">
        {value || fallback}
      </p>
    </div>
  );
}
