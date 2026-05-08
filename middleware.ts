import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'es', 'fr'],
  defaultLocale: 'en',
  // 'always' gives every route a locale prefix: /en/login, /es/login
  // This makes routing predictable and avoids 404s on the default locale
  localePrefix: 'always',
});

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/',
  ],
};
