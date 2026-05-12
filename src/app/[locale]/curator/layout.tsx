import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CuratorNav from "@/components/curator/CuratorNav";
import PortalHeader from "@/components/portal/PortalHeader";

export default async function CuratorLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  if (!session.user.isCurator) {
    redirect(`/${locale}/portal`);
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-bg">
      <CuratorNav locale={locale} />
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden pt-16 lg:pt-0">
        <PortalHeader locale={locale} />
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
