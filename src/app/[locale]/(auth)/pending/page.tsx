import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Clock, Mail } from "lucide-react";

export default async function PendingPage() {
  const session = await getServerSession(authOptions);

  // If not logged in, redirect to login
  if (!session) redirect("/en/login");

  // If approved, redirect to portal
  if (
    session.user.accountType !== "INDUSTRY" ||
    session.user.labelStatus === "APPROVED"
  ) {
    redirect("/en/portal/submit");
  }

  // If rejected, show rejection state
  const isRejected = session.user.labelStatus === "REJECTED";

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="mb-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cm-text-secondary mb-2">
            Cult Machine
          </p>
          <h1 className="font-mono text-xl font-bold text-cm-text-primary">
            Submissions Portal
          </h1>
        </div>

        <div className="card text-center">
          {isRejected ? (
            <>
              <div className="w-12 h-12 flex items-center justify-center border border-danger/30 mx-auto mb-6">
                <Mail size={20} className="text-danger" />
              </div>
              <p className="section-label mb-3 text-danger">Application not approved</p>
              <h2 className="font-mono text-base font-bold text-cm-text-primary mb-3">
                We could not approve your account
              </h2>
              <p className="font-sans text-sm text-cm-text-secondary leading-relaxed">
                Unfortunately your industry account was not approved at this time.
                You should have received an email with the reason. You are welcome
                to apply again.
              </p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 flex items-center justify-center border border-warn/30 mx-auto mb-6">
                <Clock size={20} className="text-warn" />
              </div>
              <p className="section-label mb-3">Account under review</p>
              <h2 className="font-mono text-base font-bold text-cm-text-primary mb-3">
                Your industry account is under review
              </h2>
              <p className="font-sans text-sm text-cm-text-secondary leading-relaxed">
                We will notify you by email once it has been approved.
                This usually takes <span className="text-cm-text-primary font-medium">1–3 business days</span>.
              </p>

              <div className="divider my-6" />

              <p className="font-mono text-[10px] uppercase tracking-widest text-cm-text-muted">
                Logged in as
              </p>
              <p className="font-sans text-sm text-cm-text-secondary mt-1">
                {session.user.email}
              </p>
            </>
          )}
        </div>

        <p className="mt-6 font-sans text-xs text-cm-text-muted text-center">
          Wrong account?{" "}
          <a
            href="/api/auth/signout"
            className="text-cm-text-secondary hover:text-cm-text-primary underline underline-offset-2 transition-colors"
          >
            Sign out
          </a>
        </p>
      </div>
    </div>
  );
}
