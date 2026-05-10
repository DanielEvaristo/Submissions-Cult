import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Send, ListMusic, ExternalLink } from "lucide-react";

export default async function PortalDashboard({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations("portal");
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      {/* Welcome Header */}
      <div>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-cm-text-primary mb-2">
          {session.user.name ? `Hola, ${session.user.name}` : "Mis canciones"}<span className="text-accent-red">.</span>
        </h1>
        <p className="font-sans text-cm-text-secondary">
          Gestiona tus lanzamientos y descubre nuevas oportunidades de curación.
        </p>
      </div>

      {/* Big CTA Area */}
      <div className="border border-border rounded-xl bg-bg-surface/50 p-12 flex flex-col items-center justify-center text-center">
        <Link
          href={`/${locale}/portal/submit`}
          className="group flex items-center justify-center gap-3 px-8 py-4 bg-transparent border-2 border-cm-text-secondary text-cm-text-secondary rounded-lg font-sans font-bold tracking-widest uppercase transition-all hover:border-accent-red hover:text-accent-red hover:bg-accent-red/5"
        >
          Envía una canción
          <Send size={18} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <p className="mt-4 font-sans text-sm text-cm-text-muted max-w-sm">
          Sube tu música y conéctate con curadores, playlists y oportunidades exclusivas.
        </p>
      </div>
    </div>
  );
}
