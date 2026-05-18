import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import PortalNav from "@/components/portal/PortalNav";
import PortalHeader from "@/components/portal/PortalHeader";
import PortalGating from "@/components/portal/PortalGating";

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function PortalLayout({ children, params }: Props) {
  const { locale } = params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Guard against INDUSTRY accounts accessing the ARTIST portal
  if (session.user.accountType === "INDUSTRY") {
    redirect(`/${locale}/industry`);
  }

  // Profile is complete when the user has provided all mandatory fields during onboarding
  const isComplete = !!session.user.country && !!session.user.monthlyListeners;

  // Server-side paid activity check (avoids client-side flash)
  const [purchaseCount, paidSubmissionCount] = await Promise.all([
    prisma.creditTransaction.count({
      where: { userId: session.user.id, type: "PURCHASE" },
    }),
    prisma.submission.count({
      where: { userId: session.user.id, totalCostUsd: { gt: 0 } },
    }),
  ]);
  const hasPaidActivity = purchaseCount > 0 || paidSubmissionCount > 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black">
      <PortalNav locale={locale} />
      
      <div className="flex-1 flex flex-col min-w-0 pt-14 lg:pt-0">
        <PortalHeader locale={locale} />
        
        <main className="flex-1 overflow-y-auto relative pb-16 lg:pb-0">
          <PortalGating isComplete={isComplete} hasPaidActivity={hasPaidActivity} locale={locale}>
            {children}
          </PortalGating>
        </main>
      </div>
    </div>
  );
}

