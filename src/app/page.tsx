import { redirect } from "next/navigation";
import * as Sentry from "@sentry/nextjs";

// Root page — redirect to the default locale landing page
export default function RootPage() {
  Sentry.setTag("navigation", "root-redirect"); //pruebas


  redirect("/en/landing");
  
}
