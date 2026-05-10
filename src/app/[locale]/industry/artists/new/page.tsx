import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ArtistForm from "@/components/industry/ArtistForm";
import UnverifiedLock from "@/components/industry/UnverifiedLock";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewArtistPage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.accountType !== "INDUSTRY") {
    redirect(`/${locale}/login`);
  }

  if (!session.user.isVerifiedLabel) {
    return <UnverifiedLock locale={locale} />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Link
          href={`/${locale}/industry/artists`}
          className="btn-ghost mb-4 -ml-4 inline-flex items-center gap-1"
        >
          <ChevronLeft size={16} />
          Back to Roster
        </Link>
        <h1 className="font-sans text-3xl font-bold tracking-tight text-cm-text-primary">
          Add New Artist
        </h1>
        <p className="font-sans text-cm-text-secondary mt-2">
          Create a profile for an artist you manage to easily submit their tracks.
        </p>
      </div>

      <ArtistForm />
    </div>
  );
}
