import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import IndustryNav from "@/components/industry/IndustryNav";
import PortalHeader from "@/components/portal/PortalHeader"; // Reuse the same header for Language / Logout

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function IndustryLayout({ children, params }: Props) {
  const { locale } = params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/login`);
  }

  // Guard against ARTIST accounts accessing the INDUSTRY portal
  if (session.user.accountType === "ARTIST") {
    redirect(`/${locale}/portal`);
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black">
      <IndustryNav locale={locale} />
      
      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <PortalHeader locale={locale} />
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
