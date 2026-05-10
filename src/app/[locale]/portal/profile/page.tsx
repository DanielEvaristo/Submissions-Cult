import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/portal/ProfileForm";

export default async function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // Fetch the full user profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      country: true,
      city: true,
      bio: true,
      roleType: true,
      ageRange: true,
      bandSize: true,
      memberAgeRanges: true,
      genre: true,
      subgenre: true,
      musicLanguages: true,
      spotifyUrl: true,
      instagram: true,
      tiktok: true,
      youtube: true,
      soundcloudUrl: true,
      website: true,
      careerStartYear: true,
      monthlyListeners: true,
      distributionMethod: true,
      hasManager: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-cm-text-primary">
          Mi Perfil
        </h1>
        <p className="font-sans text-cm-text-secondary mt-2">
          Gestiona tu información pública, enlaces a redes sociales y preferencias de tu proyecto musical.
        </p>
      </div>

      <ProfileForm initialData={user} />
    </div>
  );
}
