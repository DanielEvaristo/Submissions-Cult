import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PortalNav from "@/components/portal/PortalNav";
import PortalHeader from "@/components/portal/PortalHeader";

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

  return (
    <div className="flex min-h-screen bg-bg">
      <PortalNav locale={locale} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <PortalHeader locale={locale} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
