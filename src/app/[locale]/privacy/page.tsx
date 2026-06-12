import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#F5E000] selection:text-black font-sans">
      <div className="max-w-4xl mx-auto px-10 py-32">
        <Link href={`/${locale}/landing`} className="inline-flex items-center gap-2 text-[#F5E000] font-black text-xs uppercase tracking-[0.3em] hover:text-white transition-colors mb-16">
          <ArrowLeft size={16} /> BACK TO HOME
        </Link>
        <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-16">
          PRIVACY POLICY
        </h1>
        <div className="space-y-12 text-white/60 text-lg leading-relaxed font-medium">
          <p>
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">1. INTRODUCTION</h2>
            <p>Welcome to Cult Machine. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.</p>
          </section>
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">2. DATA WE COLLECT</h2>
            <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows: Identity Data (first name, last name, username), Contact Data (email address), Profile Data (your submissions, feedback, preferences), and Usage Data (information about how you use our website).</p>
          </section>
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">3. HOW WE USE YOUR DATA</h2>
            <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to process your music submissions, manage your account, provide feedback, and communicate with you regarding Cult Machine opportunities.</p>
          </section>
          <section className="space-y-6">
            <h2 className="text-2xl font-black uppercase tracking-widest text-white">4. THIRD-PARTY LINKS</h2>
            <p>This website may include links to third-party websites, plug-ins and applications. Clicking on those links or enabling those connections may allow third parties to collect or share data about you. We do not control these third-party websites and are not responsible for their privacy statements.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
