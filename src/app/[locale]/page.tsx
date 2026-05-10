import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

interface Props {
  params: { locale: string };
}

export default async function HomePage({ params }: Props) {
  const { locale } = params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Curators go strictly to their workspace
  if (session.user.isMasterCurator) {
    redirect(`/${locale}/curator/master`);
  } else if (session.user.isCurator) {
    redirect(`/${locale}/curator`);
  }

  // Industry pending accounts
  if (
    session.user.accountType === "INDUSTRY" &&
    session.user.labelStatus === "PENDING_VERIFICATION"
  ) {
    redirect(`/${locale}/pending`);
  }

  // Artists who haven't completed onboarding yet
  if (
    session.user.accountType === "ARTIST" &&
    !session.user.genre
  ) {
    redirect(`/${locale}/portal/onboarding`);
  }

  // Fully set-up users go to the submission portal
  redirect(`/${locale}/portal/submit`);
}
