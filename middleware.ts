import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/request';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // EN has no prefix, /es/... and /fr/...
});

export const config = {
  // Match only pathnames that start without an underscore or api segment
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
