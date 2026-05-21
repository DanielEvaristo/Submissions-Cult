import createIntlMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "es", "fr"] as const;

const intlMiddleware = createIntlMiddleware({
  locales: [...LOCALES],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
});

/** Paths accessible without authentication (after stripping /[locale]) */
const PUBLIC_PATHS = new Set([
  "",
  "/landing",
  "/login",
  "/register",
  "/creative",
  "/submit-now",
  "/role-selection",
  "/verify-email",
  "/pending",
]);

function pathWithoutLocale(pathname: string): string {
  const match = pathname.match(/^\/(en|es|fr)(\/.*)?$/);
  if (!match) return pathname;
  return match[2] ?? "";
}

function isPublicPath(pathname: string): boolean {
  const sub = pathWithoutLocale(pathname);
  if (PUBLIC_PATHS.has(sub)) return true;
  return false;
}

export default withAuth(
  function middleware(req: NextRequest) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        if (isPublicPath(pathname)) {
          return true;
        }

        if (!token?.id) {
          return false;
        }

        const sub = pathWithoutLocale(pathname);

        if (sub.startsWith("/admin")) {
          return !!token.isAdmin;
        }
        if (sub.startsWith("/curator/master")) {
          return !!token.isMasterCurator;
        }
        if (sub.startsWith("/curator")) {
          return !!(token.isCurator || token.isMasterCurator);
        }
        if (sub.startsWith("/industry")) {
          return token.accountType === "INDUSTRY";
        }
        if (sub.startsWith("/portal")) {
          return token.accountType === "ARTIST" || token.userType === "ADMIN";
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)", "/"],
};
