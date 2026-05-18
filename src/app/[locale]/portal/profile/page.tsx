import { getTranslations } from "next-intl/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/portal/ProfileForm";
import ChangePasswordForm from "@/components/portal/ChangePasswordForm";
import ChangeEmailForm from "@/components/portal/ChangeEmailForm";

export default async function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  // Fetch the full user profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      emailVerified: true,
      artistName: true,
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
      instagramFollowers: true,
      tiktok: true,
      youtube: true,
      soundcloudUrl: true,
      website: true,
      careerStartYear: true,
      monthlyListeners: true,
      state: true,
      hasManager: true,
    },
  });

  if (!user) {
    redirect(`/${locale}/login`);
  }

  // Redirect to onboarding if profile is incomplete
  const isComplete = !!user.country && !!user.monthlyListeners;
  if (!isComplete) {
    redirect(`/${locale}/portal/onboarding`);
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-12 border-b-4 border-white/10 pb-8">
        <h1 className="font-sans text-6xl font-black tracking-tighter text-white uppercase leading-none">
          MY PROFILE.
        </h1>
        <p className="font-sans text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mt-4">
          MANAGE YOUR IDENTITY, SOCIAL VECTORS, AND MUSICAL PREFERENCES.
        </p>
      </div>

      <ProfileForm initialData={user} />

      <div className="max-w-3xl space-y-0">
        <ChangeEmailForm
          currentEmail={user.email ?? ""}
          emailVerified={user.emailVerified}
        />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
