import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";

interface Props {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = params;
  const session = await getServerSession(authOptions);

  // Must be logged in AND be an admin
  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (!session.user?.isAdmin) {
    redirect(`/${locale}/portal/submit`);
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      <AdminNav locale={locale} />
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">{children}</main>
    </div>
  );
}
