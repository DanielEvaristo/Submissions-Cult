import { redirect } from "next/navigation";

// Root page — redirect to the default locale landing page
export default function RootPage() {
  redirect("/en/landing");
}
