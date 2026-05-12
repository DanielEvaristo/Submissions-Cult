import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/request";
import NextAuthProvider from "@/components/providers/NextAuthProvider";
import FloatingDonation from "@/components/global/FloatingDonation";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params;

  // Validate locale
  if (!locales.includes(locale as "en" | "es" | "fr")) {
    notFound();
  }

  // Enable static rendering for this locale
  setRequestLocale(locale);

  // Explicitly pass locale so next-intl loads the correct message bundle
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <NextAuthProvider>
        {children}
        <FloatingDonation />
      </NextAuthProvider>
    </NextIntlClientProvider>
  );
}
