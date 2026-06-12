import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TermsPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#F5E000] selection:text-black font-sans">
      <div className="max-w-4xl mx-auto px-10 py-32">
        <Link href={`/${locale}/landing`} className="inline-flex items-center gap-2 text-[#F5E000] font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-colors mb-16">
          <ArrowLeft size={16} /> BACK TO HOME
        </Link>
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-16">
          TERMS OF SERVICE
        </h1>
        <div className="space-y-12 text-white/60 text-lg leading-relaxed font-medium">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">1. AGREEMENT TO TERMS</h2>
            <p>By accessing or using Cult Machine, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
          </section>
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">2. MUSIC SUBMISSIONS</h2>
            <p>By submitting your music, you grant us permission to listen, review, and potentially share your content across our platforms. You retain all ownership rights to your music. We do not claim any copyright over the tracks submitted to us.</p>
          </section>
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">3. CREDITS AND PAYMENTS</h2>
            <p>Purchased credits are non-refundable and do not expire. A submission using credits guarantees a review or action according to the chosen add-on, but it does not guarantee positive feedback or placement on our channels.</p>
          </section>
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">4. USER CONDUCT</h2>
            <p>You agree not to use the platform to submit unauthorized, copyrighted material that you do not own, or content that is abusive, harassing, or otherwise violates the law. We reserve the right to terminate accounts that violate these guidelines.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
