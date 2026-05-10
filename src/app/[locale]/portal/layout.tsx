import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import PortalNav from "@/components/portal/PortalNav";

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

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <PortalNav locale={locale} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
