import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const searchParams = req.nextUrl.searchParams;
  const locale = searchParams.get("locale") || "en";

  if (!session) {
    return redirect(`/${locale}/login?error=SessionNotFound`);
  }

  const { user } = session;

  if (user.isAdmin) {
    return redirect(`/${locale}/admin`);
  }
  
  if (user.isMasterCurator) {
    return redirect(`/${locale}/curator/master`);
  }
  
  if (user.isCurator) {
    return redirect(`/${locale}/curator`);
  }
  
  if (user.accountType === "INDUSTRY") {
    return redirect(`/${locale}/industry`);
  }
  
  return redirect(`/${locale}/portal`);
}
