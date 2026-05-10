import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import IndustryProfileForm from "@/components/industry/IndustryProfileForm";

export default async function IndustryProfilePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.accountType !== "INDUSTRY") {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-cm-text-primary">
          Agency Profile
        </h1>
        <p className="font-sans text-cm-text-secondary mt-2">
          Manage your agency details and verification status. This information helps our curators understand your organization.
        </p>
      </div>

      <IndustryProfileForm />
    </div>
  );
}
