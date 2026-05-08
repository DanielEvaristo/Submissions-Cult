import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

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

  return <>{children}</>;
}
