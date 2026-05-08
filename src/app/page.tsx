import { redirect } from "next/navigation";

// Root page — redirect to the default locale login page
export default function RootPage() {
  redirect("/en/login");
}
