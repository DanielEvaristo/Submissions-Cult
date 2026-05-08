import { createNavigation } from 'next-intl/navigation';
import { locales } from './request';

export const { Link, redirect, useRouter, usePathname } = createNavigation({
  locales,
  localePrefix: 'always',
});
