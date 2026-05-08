import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/en/login");
  }

  // Industry pending accounts
  if (
    session.user.accountType === "INDUSTRY" &&
    session.user.labelStatus === "PENDING_VERIFICATION"
  ) {
    redirect("/en/pending");
  }

  // Everyone else goes to portal
  redirect("/en/portal/submit");
}
