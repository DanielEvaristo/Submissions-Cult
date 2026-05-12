import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

  // Check if onboarding is complete (using genre as proxy)
  const isComplete = !!session.user.genre;
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black">
      <PortalNav locale={locale} />
      
      <div className="flex-1 flex flex-col min-w-0 pt-16 lg:pt-0">
        <PortalHeader locale={locale} />
        
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto relative">
          <PortalGating isComplete={isComplete} locale={locale}>
            {children}
          </PortalGating>
        </main>
      </div>
    </div>
  );
}
